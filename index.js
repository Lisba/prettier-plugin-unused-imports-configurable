const { Project } = require('ts-morph');
const { parsers: babelParsers } = require('prettier/parser-babel');
const ts = require('typescript');

export const cleanUnusedImports = (text, options) => {
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
        const usageCount = countIdentifierUsages(sourceFile, defaultImport);
        if (usageCount < 1) {
          console.log(`LOG Removing unused default import: ${defaultImport}`);
          defaultImport = null;
          hasChanges = true;
        }
      }

      // Check usage of named imports
      const unusedNamedImports = namedImports.filter(
        (namedImport) => countIdentifierUsages(sourceFile, namedImport.name) < 1
      );

      // Remove unused named imports
      let remainingNamedImports = namedImports.filter(
        (namedImport) => !unusedNamedImports.includes(namedImport)
      );

      if (unusedNamedImports.length > 0) {
        hasChanges = true;
      }

      if (namespaceImport) {
        const usageCount = countIdentifierUsages(sourceFile, namespaceImport);

        if (usageCount < 1) {
          importDeclaration.remove();
          hasChanges = true;
          return;
        }
      }

      // Update or Remove the entire Import Declaration
      if (hasChanges) {
        if (remainingNamedImports.length === 0 && !defaultImport) {
          importDeclaration.remove();
        } else {
          importDeclaration.replaceWithText(
            regenerateImportDeclarationText(
              defaultImport,
              remainingNamedImports.map((remainingNamedImport) => remainingNamedImport.text),
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
};

export const countIdentifierUsages = (sourceFile, identifierName) => {
  // Get all nodes of the sourceFile.
  const allNodes = sourceFile.getDescendants();
  // Count all the nodes in the file that are identifiers and coincides with the one in the import.
  const appearancesCount = allNodes.filter(
    (node) => node.getKind() === ts.SyntaxKind.Identifier && node.getText() === identifierName
  ).length;

  const usageCount = appearancesCount - 1;
  return usageCount;
};

export const regenerateImportDeclarationText = (defaultImport, namedImports, moduleSpecifier) => {
  const defaultPart = defaultImport ? `${defaultImport}` : '';
  const namedPart = namedImports.length > 0 ? `{ ${namedImports.join(', ')} }` : '';
  const separator = defaultPart && namedPart ? ', ' : '';

  return `import ${defaultPart}${separator}${namedPart} from ${moduleSpecifier};`;
};

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
