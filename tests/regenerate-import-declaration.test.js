import { expect, test, describe } from 'vitest';
import regenerateImportDeclaration from '../lib/regenerate-import-declaration.js';

describe('regenerateImportDeclaration suite', () => {
  test('Import decalaration with default import', () => {
    const defaultImport = 'React';
    const namedImports = [];
    const moduleSpecifier = 'react';

    expect(regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)).toBe(
      "import React from 'react';"
    );
  });

  test('Import decalaration with named imports', () => {
    const defaultImport = null;
    const namedImports = ['useState', 'useEffect'];
    const moduleSpecifier = 'react';

    expect(regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)).toBe(
      "import { useState, useEffect } from 'react';"
    );
  });

  test('Import decalaration with default and named imports', () => {
    const defaultImport = 'React';
    const namedImports = ['useState', 'useEffect'];
    const moduleSpecifier = 'react';

    expect(regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)).toBe(
      "import React, { useState, useEffect } from 'react';"
    );
  });

  test('Import declaration with no imports', () => {
    const defaultImport = null;
    const namedImports = [];
    const moduleSpecifier = 'react';

    expect(() =>
      regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)
    ).toThrowError('No imports received');
  });

  test('Import declaration with empty module specifier', () => {
    const defaultImport = 'React';
    const namedImports = ['useState'];
    const moduleSpecifier = '';

    expect(() =>
      regenerateImportDeclaration(defaultImport, namedImports, moduleSpecifier)
    ).toThrowError('Module specifier is required');
  });
});
