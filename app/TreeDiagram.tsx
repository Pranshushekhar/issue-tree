"use client";

import { useEffect, useRef, useState } from "react";
import { hierarchy, tree as d3tree } from "d3-hierarchy";
import type { TreeNode } from "@/lib/parseList";
import { colors } from "@/lib/colors";

const NODE_H = 44;
const H_GAP = 28; // gap between sibling rows (vertical)
const V_GAP = 64; // gap between depth columns (horizontal)
const PADDING = 32;
const CHAR_W = 8;
const NODE_W_MIN = 64;

const CARD_W = 240;
const CARD_PAD = 14;
const TITLE_SIZE = 14;
const DESC_SIZE = 12;
const DESC_LINE_H = 16;
const TITLE_GAP = 6;
// avg glyph width for the SVG's inherited sans-serif font, used to wrap description text
const DESC_CHAR_W = DESC_SIZE * 0.52;
const CARD_MAX_CHARS = Math.floor((CARD_W - CARD_PAD * 2) / DESC_CHAR_W);

// room reserved on the right edge of a node for each badge (collapse chevron,
// description indicator) stacked right-to-left
const CHEVRON_SPACE = 22;
// strip at the bottom reserved for the depth-number ruler
const LAYER_LABEL_H = 26;

function badgeCount(hasChildren: boolean, hasDescription: boolean) {
  return (hasChildren ? 1 : 0) + (hasDescription ? 1 : 0);
}

function nodeWidth(name: string, hasChildren: boolean, hasDescription: boolean) {
  return Math.max(NODE_W_MIN, name.length * CHAR_W + 32 + badgeCount(hasChildren, hasDescription) * CHEVRON_SPACE);
}

// center-x of the nth badge slot counting from the right edge (1 = rightmost)
function badgeCenterX(w: number, slotFromRight: number) {
  return w - CHEVRON_SPACE * (slotFromRight - 1) - CHEVRON_SPACE / 2 - 2;
}

// A node with children is visible by default only at depth 0 (root) and starts
// collapsed everywhere deeper, so the initial view is root + first layer only.
// `toggled` holds paths the user has flipped away from that default.
interface VisibleNode {
  name: string;
  description?: string;
  hasChildren: boolean;
  collapsed: boolean;
  path: string;
  children?: VisibleNode[];
}

function buildVisibleTree(node: TreeNode, path: string, depth: number, toggled: Set<string>): VisibleNode {
  const hasChildren = !!node.children?.length;
  const collapsedByDefault = depth >= 1;
  const collapsed = hasChildren && (toggled.has(path) ? !collapsedByDefault : collapsedByDefault);
  return {
    name: node.name,
    description: node.description,
    hasChildren,
    collapsed,
    path,
    children:
      hasChildren && !collapsed
        ? node.children!.map((c, i) => buildVisibleTree(c, `${path}-${i}`, depth + 1, toggled))
        : undefined,
  };
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Smooth horizontal S-curve between a parent's right edge and a child's left edge.
function linkPath(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2;
  return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
}

export function TreeDiagram({ root }: { root: TreeNode }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  // path of a node whose children just became visible and still need scrolling
  // into view; a ref (not state) since consuming it shouldn't trigger a render
  const pendingScroll = useRef<string | null>(null);

  const handleToggle = (n: { data: { path: string; collapsed: boolean } }) => {
    pendingScroll.current = n.data.collapsed ? n.data.path : null;
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(n.data.path)) next.delete(n.data.path);
      else next.add(n.data.path);
      return next;
    });
  };

  // scroll the newly revealed first child into view horizontally once it's rendered
  useEffect(() => {
    const path = pendingScroll.current;
    if (!path) return;
    const firstChild = svgRef.current?.querySelector(`[data-path="${path}-0"]`);
    firstChild?.scrollIntoView({ behavior: "smooth", inline: "end", block: "nearest" });
    pendingScroll.current = null;
  }, [toggled]);

  const visibleRoot = buildVisibleTree(root, "root", 0, toggled);
  const h = hierarchy(visibleRoot, (d) => d.children);
  const maxWidth = Math.max(
    ...h.descendants().map((n) => nodeWidth(n.data.name, n.data.hasChildren, !!n.data.description))
  );
  // Left-to-right tree: breadth axis (x) stacks siblings vertically, depth axis (y)
  // runs across columns, so a wide level grows down the screen instead of off the side.
  d3tree<VisibleNode>().nodeSize([NODE_H + H_GAP, maxWidth + V_GAP])(h);

  const nodes = h.descendants();
  const rows = nodes.map((n) => n.x!);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const offsetX = PADDING;
  const offsetY = PADDING + NODE_H / 2 - minRow;
  const width = h.height * (maxWidth + V_GAP) + maxWidth + PADDING * 2;
  const treeHeight = maxRow - minRow + NODE_H + PADDING * 2;
  const height = treeHeight + LAYER_LABEL_H;
  const colStep = maxWidth + V_GAP;

  const cards = nodes.map((n) => {
    const lines = n.data.description ? wrapText(n.data.description, CARD_MAX_CHARS) : [];
    const w = nodeWidth(n.data.name, n.data.hasChildren, !!n.data.description);
    const cardH = lines.length
      ? Math.max(NODE_H, CARD_PAD * 2 + TITLE_SIZE + TITLE_GAP + lines.length * DESC_LINE_H)
      : NODE_H;
    // the card is a popover over the node, so it can never be smaller than the node itself
    return { lines, cardW: lines.length ? Math.max(w, CARD_W) : w, cardH };
  });

  return (
    <svg ref={svgRef} width={width} height={height} fontFamily="inherit" style={{ overflow: "visible" }}>
      {Array.from({ length: h.height }, (_, d) => {
        const x = offsetX + (d + 1) * colStep - V_GAP / 2;
        return <line key={`divider-${d}`} x1={x} y1={0} x2={x} y2={treeHeight} stroke={colors.border} strokeWidth={1} />;
      })}
      {Array.from({ length: h.height + 1 }, (_, d) => {
        const x = offsetX + d * colStep + maxWidth / 2;
        return (
          <text
            key={`depth-label-${d}`}
            x={x}
            y={treeHeight + LAYER_LABEL_H / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill={colors.textSecondary}
          >
            {d}
          </text>
        );
      })}
      {h.links().map((link, i) => {
        const x1 =
          link.source.y! +
          offsetX +
          nodeWidth(link.source.data.name, link.source.data.hasChildren, !!link.source.data.description);
        const y1 = link.source.x! + offsetY;
        const x2 = link.target.y! + offsetX;
        const y2 = link.target.x! + offsetY;
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
        const hasDescription = !!n.data.description;
        const w = nodeWidth(n.data.name, n.data.hasChildren, hasDescription);
        // hover hit-zone matches the expanded card size so leaving the compact
        // rect but staying inside the card's visual bounds doesn't collapse it
        const { cardW, cardH } = cards[i];
        const hoverW = Math.max(w, cardW);
        const hoverH = Math.max(NODE_H, cardH);
        const rightSpace = badgeCount(n.data.hasChildren, hasDescription) * CHEVRON_SPACE;
        return (
          <g
            key={i}
            data-path={n.data.path}
            transform={`translate(${n.y! + offsetX}, ${n.x! + offsetY - NODE_H / 2})`}
            onMouseEnter={() => n.data.description && setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => n.data.hasChildren && handleToggle(n)}
            style={{ cursor: n.data.description || n.data.hasChildren ? "pointer" : "default" }}
          >
            <rect x={w / 2 - hoverW / 2} y={NODE_H / 2 - hoverH / 2} width={hoverW} height={hoverH} fill="transparent" />
            <rect
              width={w}
              height={NODE_H}
              rx={10}
              fill={n.depth === 0 ? colors.primaryDark : colors.primary}
              stroke={colors.primaryDark}
              strokeWidth={1}
            />
            <text
              x={(w - rightSpace) / 2}
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
      {nodes.map((n, i) => {
        if (!n.data.description) return null;
        const w = nodeWidth(n.data.name, n.data.hasChildren, true);
        // sits in the rightmost badge slot, or just left of the chevron if the node has one
        const slot = n.data.hasChildren ? 2 : 1;
        return (
          <g
            key={`info-${i}`}
            transform={`translate(${n.y! + offsetX + badgeCenterX(w, slot)}, ${n.x! + offsetY})`}
            style={{ pointerEvents: "none" }}
          >
            <circle r={8} fill={colors.tertiary} stroke={colors.surface} strokeWidth={1.2} />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontWeight={700}
              fontStyle="italic"
              fill={colors.textOnPrimary}
            >
              i
            </text>
          </g>
        );
      })}
      {nodes.map((n, i) => {
        const { lines, cardW, cardH } = cards[i];
        if (!lines.length) return null;
        const w = nodeWidth(n.data.name, n.data.hasChildren, !!n.data.description);
        const cx = w / 2;
        const cy = NODE_H / 2;
        const top = cy - cardH / 2;
        const isHovered = hovered === i;
        return (
          <g
            key={`card-${i}`}
            transform={`translate(${n.y! + offsetX}, ${n.x! + offsetY - NODE_H / 2})`}
            style={{ pointerEvents: "none" }}
          >
            <g
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "scale(1)" : "scale(0.92)",
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: "opacity 140ms ease, transform 140ms ease",
              }}
            >
              <rect
                x={cx - cardW / 2}
                y={top}
                width={cardW}
                height={cardH}
                rx={10}
                fill={colors.surface}
                stroke={colors.primary}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={top + CARD_PAD + TITLE_SIZE / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={TITLE_SIZE}
                fontWeight={600}
                fill={colors.textPrimary}
              >
                {n.data.name}
              </text>
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={cx}
                  y={top + CARD_PAD + TITLE_SIZE + TITLE_GAP + li * DESC_LINE_H + DESC_LINE_H / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={DESC_SIZE}
                  fill={colors.textSecondary}
                >
                  {line}
                </text>
              ))}
            </g>
          </g>
        );
      })}
      {nodes.map((n, i) => {
        if (!n.data.hasChildren) return null;
        const w = nodeWidth(n.data.name, n.data.hasChildren, !!n.data.description);
        // rendered as its own top-level pass (after the hover card) so it stays
        // visible and clickable even while the card is covering the node
        return (
          <g
            key={`chevron-${i}`}
            transform={`translate(${n.y! + offsetX + badgeCenterX(w, 1)}, ${n.x! + offsetY})`}
            onClick={() => handleToggle(n)}
            onMouseEnter={() => n.data.description && setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            <rect x={-11} y={-11} width={22} height={22} fill="transparent" />
            {/* solid badge backdrop keeps the chevron visible whether it's sitting
                on the node pill or on top of the (white) hover card */}
            <circle r={9} fill={n.depth === 0 ? colors.primaryDark : colors.primary} stroke={colors.surface} strokeWidth={1.5} />
            <path
              // right-pointing chevron: matches the tree's left-to-right growth
              d="M-2,-4 L2,0 L-2,4"
              fill="none"
              stroke={colors.textOnPrimary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: n.data.collapsed ? "rotate(0deg)" : "rotate(180deg)",
                transformOrigin: "0px 0px",
                transition: "transform 150ms ease",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
