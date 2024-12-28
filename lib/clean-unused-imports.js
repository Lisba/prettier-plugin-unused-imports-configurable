const { Project } = require('ts-morph');
const regenerateImportDeclaration = require('./regenerate-import-declaration.js');
const countIdentifierUsages = require('./count-identifier-usages.js');
const unifyImpDeclarationsFromSameModuleSpecifier = require('./unify-imp-declarations-from-same-module.js');

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

    unifyImpDeclarationsFromSameModuleSpecifier(sourceFile);

    processImportDeclaration(sourceFile);

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

  if (hasExclusionCommentBeforeFirstImport(text)) {
    console.error('Exclusion comment found. Skipping file...');
    return false;
  }

  return true;
};

/**
 * Checks if an exclusion comment exists anywhere before the first import declaration.
 * @param {string} text - The source file content.
 * @returns {boolean} - True if an exclusion comment is found before the first import, otherwise false.
 */
const hasExclusionCommentBeforeFirstImport = (text) => {
  const exclusionCommentRegex = /^\s*\/\/\s*prettier-ignore-unused-imports-configurable\s*$/;
  const lines = text.split('\n');
  let foundExclusionComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('import')) {
      return foundExclusionComment;
    }

    if (exclusionCommentRegex.test(line)) {
      foundExclusionComment = true;
    }
  }

  return false;
};

/**
 * Processes and cleans individual import declarations.
 * @param {import('ts-morph').SourceFile} sourceFile - The source file object.
 * @param {import('ts-morph').ImportDeclaration} importDeclaration - The import declaration to process.
 */
const processImportDeclaration = (sourceFile) => {
  const imports = sourceFile.getImportDeclarations();
  imports.forEach((importDeclaration) => {
    let hasChanges = false;

    const namespaceImport = importDeclaration.getNamespaceImport()?.getText();
    let defaultImport = importDeclaration.getDefaultImport()?.getText();
    const namedImports = importDeclaration.getNamedImports().map((namedImport) => ({
      name: namedImport.getName(),
      text: namedImport.getText(),
      alias: namedImport.getAliasNode()?.getText(),
    }));
    const moduleSpecifier = importDeclaration.getModuleSpecifier().getText();

    // Check usage of default import
    if (defaultImport && countIdentifierUsages(sourceFile, defaultImport) < 1) {
      defaultImport = null;
      hasChanges = true;
    }

    // Check usage of named imports
    const unusedNamedImports = namedImports.filter(
      (namedImport) => countIdentifierUsages(sourceFile, namedImport.alias || namedImport.name) < 1
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
  });
};

module.exports = cleanUnusedImports;
