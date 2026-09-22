"use client";

import { hierarchy, tree as d3tree } from "d3-hierarchy";
import type { TreeNode } from "@/lib/parseList";
import { colors } from "@/lib/colors";

const NODE_H = 44;
const H_GAP = 28;
const V_GAP = 64;
const PADDING = 32;
const CHAR_W = 8;
const NODE_W_MIN = 64;

function nodeWidth(name: string) {
  return Math.max(NODE_W_MIN, name.length * CHAR_W + 32);
}

// Smooth vertical S-curve between a parent's bottom edge and a child's top edge.
function linkPath(x1: number, y1: number, x2: number, y2: number) {
  const midY = (y1 + y2) / 2;
  return `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
}

export function TreeDiagram({ root }: { root: TreeNode }) {
  const h = hierarchy(root, (d) => d.children);
  const maxWidth = Math.max(...h.descendants().map((n) => nodeWidth(n.data.name)));
  d3tree<TreeNode>().nodeSize([maxWidth + H_GAP, NODE_H + V_GAP])(h);

  const nodes = h.descendants();
  const xs = nodes.map((n) => n.x!);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const offsetX = PADDING + maxWidth / 2 - minX;
  const width = maxX - minX + maxWidth + PADDING * 2;
  const height = h.height * (NODE_H + V_GAP) + NODE_H + PADDING * 2;

  return (
    <svg width={width} height={height} fontFamily="inherit">
      {h.links().map((link, i) => {
        const x1 = link.source.x! + offsetX;
        const y1 = link.source.y! + NODE_H + PADDING;
        const x2 = link.target.x! + offsetX;
        const y2 = link.target.y! + PADDING;
        return (
          <path
            key={i}
            d={linkPath(x1, y1, x2, y2)}
            fill="none"
            stroke={colors.secondary}
            strokeWidth={2}
          />
        );
      })}
      {nodes.map((n, i) => {
        const w = nodeWidth(n.data.name);
        return (
          <g key={i} transform={`translate(${n.x! + offsetX - w / 2}, ${n.y! + PADDING})`}>
            <rect
              width={w}
              height={NODE_H}
              rx={10}
              fill={n.depth === 0 ? colors.primaryDark : colors.primary}
              stroke={colors.primaryDark}
              strokeWidth={1}
            />
            <text
              x={w / 2}
              y={NODE_H / 2}
              fill={colors.textOnPrimary}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={500}
            >
              {n.data.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
