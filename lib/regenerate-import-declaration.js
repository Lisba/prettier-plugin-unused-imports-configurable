const regenerateImportDeclaration = (defaultImport, namedImports, moduleSpecifier) => {
  if (!moduleSpecifier) {
    throw new Error('Module specifier is required');
  }
  if (!defaultImport && namedImports.length < 1) {
    throw new Error('No imports received');
  }

  if (!moduleSpecifier.startsWith("'") && !moduleSpecifier.startsWith('"')) {
    moduleSpecifier = `'${moduleSpecifier}'`;
  }

  const defaultPart = defaultImport ? `${defaultImport}` : '';
  const namedPart = namedImports?.length > 0 ? `{ ${namedImports?.join(', ')} }` : '';
  const separator = defaultPart && namedPart ? ', ' : '';

  const result = `import ${defaultPart}${separator}${namedPart} from ${moduleSpecifier};`;

  return result;
};

module.exports = regenerateImportDeclaration;
