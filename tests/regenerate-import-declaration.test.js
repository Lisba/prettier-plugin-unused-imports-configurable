import { expect, test, describe } from 'vitest';
import regenerateImportDeclaration from '../lib/regenerate-import-declaration.js';

describe('regenerateImportDeclaration suite', () => {
  test('Import decalaration with default import', () => {
    const defaultImport = 'defaultImport';
    const namedImports = [];
    const moduleSpecifier = 'module-name';

    expect(regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)).toBe(
      "import defaultImport from 'module-name';"
    );
  });

  test('Import decalaration with named imports', () => {
    const defaultImport = null;
    const namedImports = ['named', 'named2'];
    const moduleSpecifier = 'module-name';

    expect(regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)).toBe(
      "import { named, named2 } from 'module-name';"
    );
  });

  test('Import decalaration with default and named imports', () => {
    const defaultImport = 'defaultImport';
    const namedImports = ['named', 'named2'];
    const moduleSpecifier = 'module-name';

    expect(regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)).toBe(
      "import defaultImport, { named, named2 } from 'module-name';"
    );
  });

  test('Import declaration with no imports', () => {
    const defaultImport = null;
    const namedImports = [];
    const moduleSpecifier = 'module-name';

    expect(() =>
      regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)
    ).toThrowError('No imports received');
  });

  test('Import declaration with empty module specifier', () => {
    const defaultImport = 'defaultImport';
    const namedImports = ['named'];
    const moduleSpecifier = '';

    expect(() =>
      regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)
    ).toThrowError('Module specifier is required');
  });
});
