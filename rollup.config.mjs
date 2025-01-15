import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'auto',
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
  external: (id) => id.includes('node_modules'),
};
