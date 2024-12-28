const regenerateImportDeclaration = require('./regenerate-import-declaration.js');

/**
 * Merges multiple import declarations from the same `moduleSpecifier` into a single unified import declaration,
 * but ignores (and leaves intact) any namespace imports (e.g., `import * as name`).
 *
 * @param {import("ts-morph").SourceFile} sourceFile - The source file to process and modify.
 */
const unifyImpDeclarationsFromSameModuleSpecifier = (sourceFile) => {
  const imports = sourceFile.getImportDeclarations();
  const groupedImports = new Map();

  for (const importDeclaration of imports) {
    const moduleSpecifier = importDeclaration.getModuleSpecifier().getText();

    if (!groupedImports.has(moduleSpecifier)) {
      groupedImports.set(moduleSpecifier, []);
    }
    groupedImports.get(moduleSpecifier).push(importDeclaration);
  }

  for (const [moduleSpecifier, importGroup] of groupedImports.entries()) {
    const namespaceImports = [];
    const nonNamespaceImports = [];

    for (const importDeclaration of importGroup) {
      const nsImport = importDeclaration.getNamespaceImport()?.getText();
      if (nsImport) {
        namespaceImports.push(importDeclaration);
      } else {
        nonNamespaceImports.push(importDeclaration);
      }
    }

    if (nonNamespaceImports.length > 1) {
      unifyNonNamespaceImports(nonNamespaceImports, moduleSpecifier);
    }
  }
};

/**
 * Unifies default and named imports from the same `moduleSpecifier` into a single statement.
 * Leaves the first importDeclaration in place and removes the rest.
 *
 * @param {import("ts-morph").ImportDeclaration[]} importDeclarations - The list of non-namespace imports to unify.
 * @param {string} moduleSpecifier - The module specifier, e.g. `'react'` or `'module-name'`.
 */
function unifyNonNamespaceImports(importDeclarations, moduleSpecifier) {
  let defaultImport = null;
  const namedImportsSet = new Set();

  for (const importDeclaration of importDeclarations) {
    const currentDefault = importDeclaration.getDefaultImport()?.getText();
    if (currentDefault) {
      defaultImport = currentDefault;
    }
    for (const namedImport of importDeclaration.getNamedImports()) {
      namedImportsSet.add(namedImport.getText());
    }
  }

  importDeclarations[0].replaceWithText(
    regenerateImportDeclaration(defaultImport, [...namedImportsSet], moduleSpecifier)
  );

  for (let i = 1; i < importDeclarations.length; i++) {
    importDeclarations[i].remove();
  }
}

module.exports = unifyImpDeclarationsFromSameModuleSpecifier;
