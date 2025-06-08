const { parsers: babelParsers } = require('prettier/parser-babel');
const { parsers: typescriptParsers } = require('prettier/parser-typescript');
const cleanUnusedImports = require('./lib/clean-unused-imports.js');

module.exports = {
  parsers: {
    typescript: {
      ...typescriptParsers.typescript,
      preprocess: cleanUnusedImports,
    },
    javascript: {
      ...babelParsers.babel,
      preprocess: cleanUnusedImports,
    },
  },
  options: {
    ignoreDirectories: {
      type: 'string',
      array: true,
      default: [{ value: [] }],
      category: 'Global',
      description: 'Directories to ignore for unused import cleaning.',
    },
  },
};
