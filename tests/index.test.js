import { expect, test } from 'vitest';
import { regenerateImportDeclarationText } from '../index.js';

test('Regenarate Import decalaration suite', () => {
  const defaultImport = 'React';
  const namedImports = ['useState', 'useEffect'];
  const moduleSpecifier = 'react';

  expect(regenerateImportDeclarationText(defaultImport, namedImports, moduleSpecifier)).toBe(
    'import React, { useState, useEffect } from react;'
  );
});
