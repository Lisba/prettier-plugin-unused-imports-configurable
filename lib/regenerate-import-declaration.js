/**
 * Regenerates an import declaration from its components.
 * @param {string|null} defaultImport - The default import, e.g., "React".
 * @param {string[]} namedImports - An array of named imports, e.g., ["useState", "useEffect"].
 * @param {string} moduleSpecifier - The module specifier, e.g., "react".
 * @param {string|null} namespaceImport - The namespace import, e.g., "* as React".
 * @returns {string} - The regenerated import declaration, e.g., "import React, { useState, useEffect } from 'react';".
 * @throws {Error} If inputs are invalid.
 */
const regenerateImportDeclaration = (
  defaultImport,
  namedImports,
  moduleSpecifier,
  namespaceImport = null
) => {
  validateInputs(defaultImport, namedImports, moduleSpecifier, namespaceImport);
  const moduleSpecifierChecked = ensureModuleSpecifierQuotes(moduleSpecifier);
  const { defaultPart, namedPart, namespacePart, separator } = constructImportParts(
    defaultImport,
    namedImports,
    namespaceImport
  );
  return `import ${defaultPart}${separator}${namedPart || namespacePart} from ${moduleSpecifierChecked};`;
};

/**
 * Validates the inputs for regenerating an import declaration.
 * @param {string|null} defaultImport - The default import, e.g., "React".
 * @param {string[]} namedImports - An array of named imports, e.g., ["useState", "useEffect"].
 * @param {string} moduleSpecifier - The module specifier, e.g., "react".
 * @param {string|null} namespaceImport - The namespace import, e.g., "* as React".
 * @throws {Error} If `moduleSpecifier` is not provided or if all import components are empty.
 */
const validateInputs = (defaultImport, namedImports, moduleSpecifier, namespaceImport) => {
  if (!moduleSpecifier) {
    throw new Error('Module specifier is required');
  }
  if (!defaultImport && namedImports.length < 1 && !namespaceImport) {
    throw new Error('No imports received');
  }
};

/**
 * Ensures the module specifier is correctly wrapped in single or double quotes.
 * @param {string} moduleSpecifier - The module specifier, e.g., "react".
 * @returns {string} - The quoted module specifier, e.g., "'react'".
 */
const ensureModuleSpecifierQuotes = (moduleSpecifier) => {
  if (!moduleSpecifier.startsWith("'") && !moduleSpecifier.startsWith('"')) {
    return `'${moduleSpecifier}'`;
  }
  return moduleSpecifier;
};

/**
 * Constructs the parts of the import declaration.
 * @param {string|null} defaultImport - The default import, e.g., "React".
 * @param {string[]} namedImports - An array of named imports, e.g., ["useState", "useEffect"].
 * @param {string|null} namespaceImport - The namespace import, e.g., "* as React".
 * @returns {{defaultPart: string, namedPart: string, namespacePart: string, separator: string}} - The parts of the import declaration.
 */
const constructImportParts = (defaultImport, namedImports, namespaceImport) => {
  const defaultPart = defaultImport ? `${defaultImport}` : '';
  const namedPart = namedImports?.length > 0 ? `{ ${namedImports.join(', ')} }` : '';
  const namespacePart = namespaceImport ? `* as ${namespaceImport}` : '';
  const separator = defaultPart && (namedPart || namespacePart) ? ', ' : '';
  return { defaultPart, namedPart, namespacePart, separator };
};

module.exports = regenerateImportDeclaration;
