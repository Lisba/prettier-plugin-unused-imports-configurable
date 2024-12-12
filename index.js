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

    imports.forEach((imp) => {
      let hasChanges = false;
      const namedImports = imp.getNamedImports();
      const defaultImport = imp.getDefaultImport();
      const namespaceImport = imp.getNamespaceImport();

      if (defaultImport) {
        const identifier = defaultImport.getText();
        const usageCount = countIdentifierUsages(sourceFile, defaultImport?.getText());
        if (usageCount < 1) {
          console.log(`LOG Removing unused default import: ${identifier}`);
          imp.remove();
        }
      }

      namedImports.forEach((namedImport) => {
        console.log(`LOG namedImport: ${namedImport.getName()}`);
        const identifierName = namedImport?.getText();

        if (identifierName) {
          const usageCount = countIdentifierUsages(sourceFile, identifierName);
          console.log(`LOG usageCount: ${usageCount}`);
          if (usageCount < 1) {
            namedImport.remove();
            hasChanges = true;
          }
        } else {
          console.error('Identifier not found for import:', namedImport);
        }
      });

      if (namespaceImport) {
        const identifier = namespaceImport.getText();
        const isUsed = sourceFile.getDescendants().some((node) => {
          // Check runtime usage
          const runtimeUsage = node.getText().startsWith(identifier + '.');
          // Check type-only usage (TypeScript)
          const isTypeUsage =
            node.getKind() === ts.SyntaxKind.TypeReference && node.getText().startsWith(identifier);
          return runtimeUsage || isTypeUsage;
        });
        if (!isUsed) {
          console.log(`LOG Removing unused namespace import: ${identifier}`);
          namespaceImport.remove();
          hasUnusedImports = true;
        }
      }

      // Remove the complete importDeclaration if there are no more named imports, default import nor namespace import.
      if (
        hasChanges &&
        imp.getNamedImports().length === 0 &&
        !imp.getDefaultImport() &&
        !imp.getNamespaceImport()
      ) {
        console.log(`LOG Removing entire import declaration: ${imp.getText()}`);
        imp.remove();
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
