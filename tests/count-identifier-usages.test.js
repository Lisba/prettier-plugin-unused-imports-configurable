import { expect, test, describe } from 'vitest';
import countIdentifierUsages from '../lib/count-identifier-usages.js';
const { Project } = require('ts-morph');

describe('regenerateImportDeclaration suite', () => {
  const createSourceFile = (content) => new Project().createSourceFile('test.ts', content);

  test('Single valid usage import', () => {
    const text = `import { useState } from 'react'
    
    const Component = () => {
      useState();
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(1);
  });

  test('Unused imports', () => {
    const text = `import { useState } from 'react'
    
    const Component = () => {
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(0);
  });

  test(`Import unused. Accessed as object's property`, () => {
    const text = `import React, { useState } from 'react'
    
    const Component = () => {
      React.useState()
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(0);
  });

  test(`Multiple usages of an import`, () => {
    const text = `import React, { useState } from 'react'
    
    const Component = () => {
      useState()
      useState()
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(2);
  });

  test(`Mix usages of import`, () => {
    const text = `import React, { useState, useEffect } from 'react'
    
    const Component = () => {
      useState()
      React.useEffect()
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(1);
    expect(countIdentifierUsages(sourceFile, 'useEffect')).toBe(0);
    expect(countIdentifierUsages(sourceFile, 'React')).toBe(1);
  });

  test(`Multiple imports, unused and used ones`, () => {
    const text = `import { useState } from 'react'
    import { useEffect } from 'react'
    
    const Component = () => {
      useState()
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(1);
    expect(countIdentifierUsages(sourceFile, 'useEffect')).toBe(0);
  });

  test(`Unused import because it's commented`, () => {
    const text = `import { useState } from 'react'
    
    const Component = () => {
      // useState()
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(0);
  });

  test(`No imports`, () => {
    const text = `const Component = () => {
      useState()
      return <div>Hello</div>;
    };
  
    export default Component;`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(1);
  });

  test(`Imports Section Without Usages`, () => {
    const text = `import { useState } from 'react'`;
    const sourceFile = createSourceFile(text);

    expect(countIdentifierUsages(sourceFile, 'useState')).toBe(0);
  });
});
