const { Project } = require('ts-morph');
const regenerateImportDeclaration = require('./regenerate-import-declaration.js');
const countIdentifierUsages = require('./count-identifier-usages.js');

const cleanUnusedImports = (text, options) => {
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

    const importsToAnalyze = sourceFile.getImportDeclarations();

    const uniqueImports = new Set();
    importsToAnalyze.forEach((importDeclaration) => {
      const importText = importDeclaration.getText();
      if (uniqueImports.has(importText)) {
        importDeclaration.remove();
      } else {
        uniqueImports.add(importText);
      }
    });

    const imports = sourceFile.getImportDeclarations();

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
            regenerateImportDeclaration(
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

module.exports = cleanUnusedImports;
