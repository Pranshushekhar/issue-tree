export interface TreeNode {
  name: string;
  description?: string;
  children?: TreeNode[];
}

export interface ParseResult {
  tree: TreeNode | null;
  warnings: string[];
}

const MAX_CHILDREN = 5;
export const INDENT_SIZE = 2;

// covers "-"/"*" (typed) plus the bullet glyphs pasted-in lists commonly use
const BULLET_MARKER_RE = /^[-*•◦‣▪▫●○∙·]\s+/;

export function indentLevel(line: string): number {
  const indent = line.length - line.trimStart().length;
  return Math.floor(indent / INDENT_SIZE);
}

export function hasBulletMarker(line: string): boolean {
  return BULLET_MARKER_RE.test(line.trim());
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
    const raw = line.trim().replace(BULLET_MARKER_RE, '');
    const sep = raw.indexOf('//');
    const name = (sep === -1 ? raw : raw.slice(0, sep)).trim();
    const description = sep === -1 ? undefined : raw.slice(sep + 2).trim() || undefined;
    const node: TreeNode = { name, description, children: [] };

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
