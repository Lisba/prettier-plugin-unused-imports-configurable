const ts = require('typescript');

const countIdentifierUsages = (sourceFile, identifierName) => {
  // Get all nodes of the sourceFile.
  const allNodes = sourceFile.getDescendants();
  // Count all the nodes in the file that are identifiers and coincides with the one in the import.
  const appearancesCount = allNodes.filter(
    (node) => node.getKind() === ts.SyntaxKind.Identifier && node.getText() === identifierName
  ).length;

  const usageCount = appearancesCount - 1;
  return usageCount;
};

module.exports = countIdentifierUsages;
