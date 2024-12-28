import { expect, test, describe } from 'vitest';
import countIdentifierUsages from '../lib/count-identifier-usages.js';
const { Project } = require('ts-morph');

describe('regenerateImportDeclaration suite', () => {
  const createSourceFile = (content) => new Project().createSourceFile('test.ts', content);

  test('Single valid usage import', () => {
    const input = `
    import { named } from 'module-name'
    
    const func = () => {
      named();
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(1);
  });

  test('Unused imports', () => {
    const input = `
    import { named } from 'module-name'
    
    const func = () => {
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(0);
  });

  test(`Import unused. Accessed as object's property`, () => {
    const input = `
    import defaultImport, { named } from 'module-name'
    
    const func = () => {
      defaultImport.named()
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(0);
  });

  test(`Multiple usages of an import`, () => {
    const input = `
    import defaultImport, { named } from 'module-name'
    
    const func = () => {
      named()
      named()
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(2);
  });

  test(`Mix usages of import`, () => {
    const input = `
    import defaultImport, { named, named2 } from 'module-name'
    
    const func = () => {
      named()
      defaultImport.named2()
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(1);
    expect(countIdentifierUsages(sourceFile, 'named2')).toBe(0);
    expect(countIdentifierUsages(sourceFile, 'defaultImport')).toBe(1);
  });

  test(`Multiple imports, unused and used ones`, () => {
    const input = `
    import { named } from 'module-name'
    import { named2 } from 'module-name'
    
    const func = () => {
      named()
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(1);
    expect(countIdentifierUsages(sourceFile, 'named2')).toBe(0);
  });

  test(`Unused import because it's commented`, () => {
    const input = `
    import { named } from 'module-name'
    
    const func = () => {
      // named()
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(0);
  });

  test(`No imports`, () => {
    const input = `
    const func = () => {
      named()
    };`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(1);
  });

  test(`Imports Section Without Usages`, () => {
    const input = `import { named } from 'module-name'`;
    const sourceFile = createSourceFile(input);

    expect(countIdentifierUsages(sourceFile, 'named')).toBe(0);
  });
});
