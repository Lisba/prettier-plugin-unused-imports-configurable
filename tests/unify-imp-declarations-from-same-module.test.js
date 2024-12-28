import { expect, test, describe } from 'vitest';
import unifyImpDeclarationsFromSameModuleSpecifier from '../lib/unify-imp-declarations-from-same-module.js';
const { Project } = require('ts-morph');

describe(`unifyImpDeclarationsFromSameModuleSpecifier suite`, () => {
  const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
  const createSourceFile = (content) =>
    new Project().createSourceFile('path/to/test.ts', content, { overwrite: true });

  test(`Keeping multiple namespace imports intact, while still unifying non-namespace imports`, () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();

    const input = `
    import * as All from 'module-name';
    import * as All2 from 'module-name';
    import defaultImport from 'module-name';
    import { named } from 'module-name';
    import { named2 as alias } from 'module-name';
  
    const Func = () => {
      All;
      All2;
      defaultImport;
      named;
      alias;
    };`;

    const expected = `
    import * as All from 'module-name';
    import * as All2 from 'module-name';
    import defaultImport, { named, named2 as alias } from 'module-name';
  
    const Func = () => {
      All;
      All2;
      defaultImport;
      named;
      alias;
    };`;

    const sourceFile = createSourceFile(input);

    unifyImpDeclarationsFromSameModuleSpecifier(sourceFile);

    expect(normalizeWhitespace(sourceFile.getFullText())).toBe(normalizeWhitespace(expected));
  });

  test('Keeping default + namespace intact', () => {
    const input = `
      import defaultImport, * as All from "module-name";
      import { named } from "module-name";

      const Func = () => {
        defaultImport;
        All;
        named;
      };`;

    const sourceFile = createSourceFile(input);
    unifyImpDeclarationsFromSameModuleSpecifier(sourceFile);

    expect(normalizeWhitespace(sourceFile.getFullText())).toBe(normalizeWhitespace(input));
  });
});
