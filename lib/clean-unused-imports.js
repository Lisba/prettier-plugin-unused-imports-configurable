const { Project } = require('ts-morph');
const regenerateImportDeclaration = require('./regenerate-import-declaration.js');
const countIdentifierUsages = require('./count-identifier-usages.js');

/**
 * Cleans unused imports from a file's content.
 * @param {string} text - The content of the file being processed.
 * @param {object} options - Options passed to the plugin.
 * @returns {string} - The cleaned file content.
 */
const cleanUnusedImports = (text, options) => {
  if (!validateInputs(text, options)) {
    return text;
  }

  try {
    const project = new Project();
    const sourceFile = project.createSourceFile(options.filepath, text, {
      overwrite: true,
    });

    removeDuplicateImports(sourceFile);

    const imports = sourceFile.getImportDeclarations();
    imports.forEach((importDeclaration) => processImportDeclaration(sourceFile, importDeclaration));

    return sourceFile.getFullText();
  } catch (error) {
    console.error('Error processing file:', options.filepath, error);
    return text;
  }
};

/**
 * Validates the input text and options.
 * @param {string} text - The content of the file being processed.
 * @param {object} options - Options passed to the plugin.
 * @throws {Error} If required parameters are missing.
 * @returns {boolean} - Whether the file should be skipped.
 */
const validateInputs = (text, options) => {
  if (!options?.filepath) {
    console.error('Filepath is undefined. Skipping...');
    return false;
  }

  if (!text || text.trim() === '') {
    console.error('File content is empty. Skipping...');
    return false;
  }

  const ignoreDirectories = Array.isArray(options?.ignoreDirectories)
    ? options?.ignoreDirectories
    : [];

  if (ignoreDirectories.some((directory) => options.filepath.includes(directory))) {
    console.error(`Skipping file inside an ignored directory: ${options.filepath}`);
    return false;
  }

  return true;
};

/**
 * Removes duplicate imports from the source file.
 * @param {import('ts-morph').SourceFile} sourceFile - The source file object.
 */
const removeDuplicateImports = (sourceFile) => {
  const uniqueImports = new Set();
  const importsToAnalyze = sourceFile.getImportDeclarations();

  importsToAnalyze.forEach((importDeclaration) => {
    const importText = importDeclaration.getText();
    if (uniqueImports.has(importText)) {
      importDeclaration.remove();
    } else {
      uniqueImports.add(importText);
    }
  });
};

/**
 * Processes and cleans individual import declarations.
 * @param {import('ts-morph').SourceFile} sourceFile - The source file object.
 * @param {import('ts-morph').ImportDeclaration} importDeclaration - The import declaration to process.
 */
const processImportDeclaration = (sourceFile, importDeclaration) => {
  let hasChanges = false;

  const namespaceImport = importDeclaration.getNamespaceImport()?.getText();
  let defaultImport = importDeclaration.getDefaultImport()?.getText();
  const namedImports = importDeclaration.getNamedImports().map((namedImport) => ({
    name: namedImport.getName(),
    text: namedImport.getText(),
  }));
  const moduleSpecifier = importDeclaration.getModuleSpecifier().getText();

  // Check usage of default import
  if (defaultImport && countIdentifierUsages(sourceFile, defaultImport) < 1) {
    defaultImport = null;
    hasChanges = true;
  }

  // Check usage of named imports
  const unusedNamedImports = namedImports.filter(
    (namedImport) => countIdentifierUsages(sourceFile, namedImport.name) < 1
  );
  const remainingNamedImports = namedImports.filter(
    (namedImport) => !unusedNamedImports.includes(namedImport)
  );

  if (unusedNamedImports.length > 0) {
    hasChanges = true;
  }

  // Check usage of namespace imports
  if (namespaceImport && countIdentifierUsages(sourceFile, namespaceImport) < 1) {
    importDeclaration.remove();
    return;
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
};

module.exports = cleanUnusedImports;
