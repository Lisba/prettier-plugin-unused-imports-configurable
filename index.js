const { Project } = require('ts-morph');
const { parsers: babelParsers } = require('prettier/parser-babel');
const ts = require('typescript');

module.exports = {
  parsers: {
    typescript: {
      ...babelParsers['babel-ts'],
      preprocess: cleanUnusedImports,
    },
    javascript: {
      ...babelParsers.babel,
      preprocess: cleanUnusedImports,
    },
  },
  options: {
    ignoreDirectories: {
      type: 'string',
      array: true,
      default: [{ value: [] }],
      category: 'Global',
      description: 'Directories to ignore for unused import cleaning.',
    },
  },
};

function cleanUnusedImports(text, options) {
  const filepath = options?.filepath;
  if (!filepath) {
    console.error('Filepath is undefined. Skipping...');
    return text;
  }

  if (!text || text.trim() === '') {
    console.error('File content is empty. Skipping...');
    return text;
  }

  const ignoreDirectories = Array.isArray(options?.ignoreDirectories)
    ? options?.ignoreDirectories
    : [];

  if (ignoreDirectories.some((directory) => filepath.includes(directory))) {
    console.error(`Skipping file inside an ignored directory: ${filepath}`);
    return text;
  }

  try {
    const project = new Project();
    const sourceFile = project.createSourceFile(filepath, text, {
      overwrite: true,
    });

    const imports = sourceFile.getImportDeclarations();

    console.log(
      'LOG Found imports:',
      imports.map((imp) => {
        return imp.getText();
      })
    );

    imports.forEach((importDeclaration) => {
      let hasChanges = false;
      const namespaceImport = importDeclaration.getNamespaceImport()?.getText();
      let defaultImport = importDeclaration.getDefaultImport()?.getText();
      const namedImports = importDeclaration.getNamedImports().map((namedImport) => ({
        name: namedImport.getName(),
        text: namedImport.getText(),
      }));
      const moduleSpecifier = importDeclaration.getModuleSpecifier().getText();

      // Check usage of default import
      if (defaultImport) {
        const usageCount = countIdentifierUsages(sourceFile, defaultImport); // MODIFIED: Use captured text
        if (usageCount < 1) {
          console.log(`LOG Removing unused default import: ${defaultImport}`);
          defaultImport = null; // Asigna null al defaultImport en lugar de eliminar toda la declaración aquí
          hasChanges = true; // Marca que hay cambios
        }
      }

      // Check usage of named imports
      const unusedNamedImports = namedImports.filter(
        (namedImport) => countIdentifierUsages(sourceFile, namedImport.name) < 1 // MODIFIED: Use captured name
      );

      // Remove unused named imports
      let remainingNamedImports = namedImports.filter(
        (namedImport) => !unusedNamedImports.includes(namedImport) // MODIFIED: Filter safely
      );

      if (unusedNamedImports.length > 0) {
        console.log(
          `LOG Removing unused named imports: ${unusedNamedImports.map((n) => n.name).join(', ')}`
        );
        hasChanges = true;
      }

      if (namespaceImport) {
        const usageCount = countIdentifierUsages(sourceFile, namespaceImport);

        if (usageCount < 1) {
          console.log(`LOG Removing unused namespace import: ${namespaceImport}`);
          importDeclaration.remove();
          hasChanges = true;
          return;
        }
      }

      // Update or Remove Entire Declaration
      if (hasChanges) {
        if (remainingNamedImports.length === 0 && !defaultImport) {
          console.log(`LOG Removing entire import declaration: ${importDeclaration.getText()}`);
          importDeclaration.remove();
        } else {
          console.log(`LOG Updating import declaration: ${importDeclaration.getText()}`);
          importDeclaration.replaceWithText(
            regenerateImportDeclarationText(
              defaultImport,
              remainingNamedImports.map((n) => n.text), // MODIFIED: Use remaining texts
              moduleSpecifier
            )
          );
        }
      }
    });

    return sourceFile.getFullText();
  } catch (error) {
    console.error('Error processing file:', filepath, error);
    return text;
  }
}

function countIdentifierUsages(sourceFile, identifierName) {
  // Get all nodes of the sourceFile.
  const allNodes = sourceFile.getDescendants();

  // Count all the nodes that are identifiers and coincides with the import.
  const appearancesCount = allNodes.filter(
    (node) => node.getKind() === ts.SyntaxKind.Identifier && node.getText() === identifierName
  ).length;

  const usageCount = appearancesCount - 1;

  return usageCount;
}

function regenerateImportDeclarationText(defaultImport, namedImports, moduleSpecifier) {
  const defaultPart = defaultImport ? `${defaultImport}` : '';
  const namedPart = namedImports.length > 0 ? `{ ${namedImports.join(', ')} }` : '';
  const separator = defaultPart && namedPart ? ', ' : '';

  return `import ${defaultPart}${separator}${namedPart} from ${moduleSpecifier};`;
}
