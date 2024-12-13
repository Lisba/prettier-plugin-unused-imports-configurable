const { parsers: babelParsers } = require('prettier/parser-babel');
const cleanUnusedImports = require('./lib/clean-unused-imports.js');

module.exports = {
  parsers: {
    typescript: {
      ...babelParsers['babel-ts'],
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
