import { expect, test, describe } from 'vitest';
import cleanUnusedImports from '../lib/clean-unused-imports.js';

describe('cleanUnusedImports suite', () => {
  const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
  const options = {
    filepath: 'path/to-test',
  };

  test('File with no imports', () => {
    const input = `
    const funct = () => {
      return null;
    };`;

    expect(cleanUnusedImports(input, options)).toBe(input);
  });

  test('File with multiple used imports', () => {
    const input = `
    import { named } from 'module-name';
    import defaultImport from 'module-name2';
  
    const func = () => {
      named;
      defaultImport.doSomething();
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(input)
    );
  });

  test('File with one unused import', () => {
    const input = `
    import { named } from 'module-name';

    const func = () => {
    };`;

    const expected = `
    const func = () => {
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with multiple imports, some unused', () => {
    const input = `
    import defaultImport, { named, named2 } from 'module-name';
    import defaultImport from 'module-name2';
  
    const func = () => {
      const [state, setState] = named(0);
    };`;

    const expected = `
    import { named } from 'module-name';
  
    const func = () => {
      const [state, setState] = named(0);
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with a used namespace import', () => {
    const input = `
    import * as All from 'module-name';
  
    const func = () => {
      All.named();
    };`;

    expect(cleanUnusedImports(input, options)).toBe(input);
  });

  test('File with an unused namespace import', () => {
    const input = `
    import * as All from 'module-name';
  
    const func = () => {
    };`;

    const expected = `
    const func = () => {
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with duplicated imports', () => {
    const input = `
    import defaultImport from 'module-name';
    import defaultImport from 'module-name';
  
    const func = () => {
      defaultImport;
    };`;

    const expected = `
    import defaultImport from 'module-name';

    const func = () => {
      defaultImport;
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with several duplicated imports', () => {
    const input = `
    import defaultImport from 'module-name';
    import defaultImport from 'module-name';
    import defaultImport from 'module-name';
    import defaultImport from 'module-name';
  
    const func = () => {
      defaultImport;
    };`;

    const expected = `
    import defaultImport from 'module-name';

    const func = () => {
      defaultImport;
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with duplicated unused imports combined with a used import', () => {
    const input = `
    import { named } from 'module-name';
    import { named, named2 } from 'module-name';

    function func() {
      named2;
    `;

    const expected = `
    import { named2 } from 'module-name';

    function func() {
      named2;
    `;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with duplicated unused imports combined with used imports more complex', () => {
    const input = `
    import { named } from 'module-name';
    import { named, named2 } from 'module-name';
    import { named, named3 } from 'module-name';

    function func() {
      named2;
      named3;
    }`;

    const expected = `
    import { named2, named3 } from 'module-name';

    function func() {
      named2;
      named3;
    }`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test(`File with an unused named import because it's used as an object's property`, () => {
    const input = `
    import defaultImport, { named2 } from 'module-name';
  
    const func = () => {
      defaultImport.named2();
    };`;

    const expected = `
    import defaultImport from 'module-name';
    
    const func = () => {
      defaultImport.named2();
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test(`File with an unused alias named import`, () => {
    const input = `
    import { named, named2 as alias2 } from 'module-name';
  
    const func = () => {
      named;
    };`;

    const expected = `
    import { named } from 'module-name';

    const func = () => {
      named;
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test(`File with a used alias named import`, () => {
    const input = `
    import { named, named2 as alias2 } from 'module-name';
  
    const func = () => {
      named;
      alias2;
    };`;

    const expected = `
    import { named, named2 as alias2 } from 'module-name';
  
    const func = () => {
      named;
      alias2;
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test(`Ignore module based on the comment 'prettier-ignore-unused-imports-configurable'`, () => {
    const input = `
    // comment
    // prettier-ignore-unused-imports-configurable
    // comment
    import { named2 } from 'module-name';
  
    const func = () => {
    };`;

    const expected = `
    // comment
    // prettier-ignore-unused-imports-configurable
    // comment
    import { named2 } from 'module-name';
  
    const func = () => {
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test(`Unify multiple import declarations from the same module specifier`, () => {
    const input = `
    import defaultImport, { named } from 'module-name';
    import { named2 } from 'module-name';
  
    const func = () => {
      defaultImport;
      named;
      named2;
    };`;

    const expected = `
    import defaultImport, { named, named2 } from 'module-name';
  
    const func = () => {
      defaultImport;
      named;
      named2;
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test(`Handle default + namespace import case`, () => {
    const input = `
    import defaultImport, * as ReactObj from 'module-name';
    import { named2 } from 'module-name';
  
    const func = () => {
      defaultImport;
      ReactObj;
      named2;
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(input)
    );
  });

  test(`Handle multiple namespace imports case`, () => {
    const input = `
    import * as All from 'module-name';
    import * as All2 from 'module-name';
    import defaultImport from 'module-name';
    import { named2 } from 'module-name';
  
    const func = () => {
      defaultImport;
      All;
      All2;
      named2;
    };`;

    const expected = `
    import * as All from 'module-name';
    import * as All2 from 'module-name';
    import defaultImport, { named2 } from 'module-name';
  
    const func = () => {
      defaultImport;
      All;
      All2;
      named2;
    };`;

    expect(normalizeWhitespace(cleanUnusedImports(input, options))).toBe(
      normalizeWhitespace(expected)
    );
  });
});
