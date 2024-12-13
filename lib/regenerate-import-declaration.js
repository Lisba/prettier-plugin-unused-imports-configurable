/**
 * Validates the inputs for regenerating an import declaration.
 * @param {string|null} defaultImport - The default import, e.g., "React".
 * @param {string[]} namedImports - An array of named imports, e.g., ["useState", "useEffect"].
 * @param {string} moduleSpecifier - The module specifier, e.g., "react".
 * @throws {Error} If `moduleSpecifier` is not provided or if both `defaultImport` and `namedImports` are empty.
 */
const validateInputs = (defaultImport, namedImports, moduleSpecifier) => {
  if (!moduleSpecifier) {
    throw new Error('Module specifier is required');
  }
  if (!defaultImport && namedImports.length < 1) {
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
 * @returns {{defaultPart: string, namedPart: string, separator: string}} - The parts of the import declaration.
 */
const constructImportParts = (defaultImport, namedImports) => {
  const defaultPart = defaultImport ? `${defaultImport}` : '';
  const namedPart = namedImports?.length > 0 ? `{ ${namedImports.join(', ')} }` : '';
  const separator = defaultPart && namedPart ? ', ' : '';
  return { defaultPart, namedPart, separator };
};

/**
 * Regenerates an import declaration from its components.
 * @param {string|null} defaultImport - The default import, e.g., "React".
 * @param {string[]} namedImports - An array of named imports, e.g., ["useState", "useEffect"].
 * @param {string} moduleSpecifier - The module specifier, e.g., "react".
 * @returns {string} - The regenerated import declaration, e.g., "import React, { useState, useEffect } from 'react';".
 * @throws {Error} If inputs are invalid.
 */
const regenerateImportDeclaration = (defaultImport, namedImports, moduleSpecifier) => {
  validateInputs(defaultImport, namedImports, moduleSpecifier);
  const moduleSpecifierChecked = ensureModuleSpecifierQuotes(moduleSpecifier);
  const { defaultPart, namedPart, separator } = constructImportParts(defaultImport, namedImports);
  return `import ${defaultPart}${separator}${namedPart} from ${moduleSpecifierChecked};`;
};

module.exports = regenerateImportDeclaration;
