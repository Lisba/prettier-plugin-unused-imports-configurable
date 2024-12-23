const { ts } = require('ts-morph');

/**
 * Counts the actual usages of an identifier in a source file, excluding its appearances in import declarations.
 * @param {SourceFile} sourceFile - The source file to analyze.
 * @param {string} identifierName - The name of the identifier to count.
 * @returns {number} - The number of real usages of the identifier.
 */
const countIdentifierUsages = (sourceFile, identifierName) => {
  const identifierNodes = getIdentifierNodes(sourceFile, identifierName);
  const importSectionRanges = getImportsSectionRange(sourceFile);
  return countUsagesOutsideImportsSection(identifierNodes, importSectionRanges);
};

/**
 * Retrieves a single range that includes all import declarations section in a source file.
 * @param {SourceFile} sourceFile - The source file to analyze.
 * @returns {{start: number, end: number}} - The start and end of the imports section range.
 */
const getImportsSectionRange = (sourceFile) => {
  const importDeclarations = sourceFile.getImportDeclarations();
  if (importDeclarations.length === 0) {
    return { start: 0, end: 0 };
  }
  const start = importDeclarations[0].getStart(); // Start of the first import.
  const end = importDeclarations[importDeclarations.length - 1].getEnd(); // End of the last import.
  return { start, end };
};

/**
 * Gets all nodes in the source file that are identifiers with the given name
 * and ensures they are not preceded by a symbol (e.g., as part of a qualified name).
 * @param {SourceFile} sourceFile - The source file to analyze.
 * @param {string} identifierName - The name of the identifier to find.
 * @returns {Array<Node>} - The nodes matching the identifier name and not preceded by symbols.
 */
const getIdentifierNodes = (sourceFile, identifierName) => {
  return sourceFile.getDescendants().filter((node) => {
    if (node.getKind() !== ts.SyntaxKind.Identifier || node.getText() !== identifierName) {
      return false;
    }

    const parent = node.getParent();
    if (
      parent?.getKind() === ts.SyntaxKind.PropertyAccessExpression &&
      parent.getName() === identifierName
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Counts the nodes that are outside the given import range.
 * @param {Array<Node>} nodes - The nodes to analyze.
 * @param {{start: number, end: number}} importRange - The range of imports to exclude.
 * @returns {number} - The count of nodes outside the given import range.
 */
const countUsagesOutsideImportsSection = (nodes, importRange) => {
  return nodes.filter((node) => {
    const nodeStart = node.getStart();
    return nodeStart < importRange.start || nodeStart >= importRange.end;
  }).length;
};

module.exports = countIdentifierUsages;
