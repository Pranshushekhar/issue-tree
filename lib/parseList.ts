export interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export interface ParseResult {
  tree: TreeNode | null;
  warnings: string[];
}

const MAX_CHILDREN = 5;
export const INDENT_SIZE = 2;

export function indentLevel(line: string): number {
  const indent = line.length - line.trimStart().length;
  return Math.floor(indent / INDENT_SIZE);
}

/**
 * Indented list -> tree. Convention: 2 spaces per level, tabs normalized to 2 spaces,
 * optional leading "-" or "*" markers are stripped.
 */
export function parseList(text: string): ParseResult {
  const lines = text
    .replace(/\t/g, ' '.repeat(INDENT_SIZE))
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return { tree: null, warnings: [] };

  const root: TreeNode = { name: 'Root', children: [] };
  const stack: { node: TreeNode; level: number }[] = [{ node: root, level: -1 }];

  for (const line of lines) {
    const level = indentLevel(line);
    const name = line.trim().replace(/^[-*]\s+/, '');
    const node: TreeNode = { name, children: [] };

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    stack[stack.length - 1].node.children!.push(node);
    stack.push({ node, level });
  }

  const warnings: string[] = [];
  // ponytail: soft cap only, warn but never silently drop the user's items
  const checkChildren = (node: TreeNode) => {
    if (node.children && node.children.length > MAX_CHILDREN) {
      warnings.push(`"${node.name}" has ${node.children.length} sub-items (recommended max ${MAX_CHILDREN})`);
    }
    node.children?.forEach(checkChildren);
  };
  checkChildren(root);

  const tree = root.children!.length === 1 ? root.children![0] : root;
  return { tree, warnings };
}
