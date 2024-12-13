import { expect, test, describe } from 'vitest';
import cleanUnusedImports from '../lib/clean-unused-imports.js';

describe('cleanUnusedImports suite', () => {
  test('File with no imports', () => {
    const options = {
      filepath: 'path/to-test',
    };
    const text = `const Component = () => {
          return <div>Hello</div>;
        };
      
        export default Component;`;

    expect(cleanUnusedImports(text, options)).toBe(text);
  });

  test('File with multiple used imports', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };

    const text = `import { useState } from 'react';
    import Alt from 'alt';
  
    const Component = () => {
      const [state, setState] = useState(0);
      Alt.doSomething();
      return <div>Hello</div>;
    };
  
    export default Component;`;

    const expected = `import { useState } from 'react';
    import Alt from 'alt';
  
    const Component = () => {
      const [state, setState] = useState(0);
      Alt.doSomething();
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with one unused import', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };

    const text = `import { useState } from 'react';

    const Component = () => {
      return <div>Hello</div>;
    };
  
    export default Component;`;

    const expected = `const Component = () => {
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with multiple imports, some unused', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };

    const text = `import React, { useState, useEffect } from 'react';
    import Alt from 'alt';
  
    const Component = () => {
      const [state, setState] = useState(0);
      return <div>Hello</div>;
    };
  
    export default Component;`;

    const expected = `import { useState } from 'react';
  
    const Component = () => {
      const [state, setState] = useState(0);
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with a used namespace import', () => {
    const options = {
      filepath: 'path/to-test',
    };
    const text = `import * as React from 'react';
  
    const Component = () => {
      React.useState();
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(cleanUnusedImports(text, options)).toBe(text);
  });

  test('File with an unused namespace import', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };
    const text = `import * as React from 'react';
  
    const Component = () => {
      return <div>Hello</div>;
    };
  
    export default Component;`;

    const expected = `const Component = () => {
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with duplicated imports', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };
    const text = `import React from 'react';
    import React from 'react';
  
    const Component = () => {
      React;
      return <div>Hello</div>;
    };
  
    export default Component;`;

    const expected = `import React from 'react';

    const Component = () => {
      React;
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with several duplicated imports', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };
    const text = `import React from 'react';
    import React from 'react';
    import React from 'react';
    import React from 'react';
  
    const Component = () => {
      React;
      return <div>Hello</div>;
    };
  
    export default Component;`;

    const expected = `import React from 'react';

    const Component = () => {
      React;
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with duplicated unused imports combined with a used import', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };
    const text = `import { useState } from 'react';
    import { useState, useEffect } from 'react';

    function Component() {
      useEffect;
      return <div>Component</div>;
    }

    export default Component;`;

    const expected = `import { useEffect } from 'react';

    function Component() {
      useEffect;
      return <div>Component</div>;
    }

    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test('File with duplicated unused imports combined with used imports more complex', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };
    const text = `import { useState } from 'react';
    import { useState, useRef } from 'react';
    import { useState, useEffect } from 'react';

    function Component() {
      useEffect;
      useRef;
      return <div>Component</div>;
    }

    export default Component;`;

    const expected = `import { useRef } from 'react';
    import { useEffect } from 'react';

    function Component() {
      useEffect;
      useRef;
      return <div>Component</div>;
    }

    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });

  test.skip('File with an unused named import used via default import', () => {
    const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
    const options = {
      filepath: 'path/to-test',
    };
    const text = `import React, { useEffect } from 'react';
  
    const Component = () => {
      React.useEffect();
      return <div>Hello</div>;
    };
  
    export default Component;`;

    const expected = `import React from 'react';
    
    const Component = () => {
      React.useEffect();
      return <div>Hello</div>;
    };
  
    export default Component;`;

    expect(normalizeWhitespace(cleanUnusedImports(text, options))).toBe(
      normalizeWhitespace(expected)
    );
  });
});
