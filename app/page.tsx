"use client";

import { useMemo, useState } from "react";
import { Alert, Typography } from "antd";
import { parseList } from "@/lib/parseList";
import { TreeDiagram } from "./TreeDiagram";
import { HierarchyEditor } from "./HierarchyEditor";
import { colors } from "@/lib/colors";

const { Title, Text } = Typography;

const PLACEHOLDER = `Root
  Branch A
    Leaf 1
    Leaf 2
  Branch B
    Leaf 3`;

export default function Home() {
  const [text, setText] = useState(PLACEHOLDER);
  const { tree, warnings } = useMemo(() => parseList(text), [text]);

  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <aside
        style={{
          width: 320,
          flexShrink: 0,
          padding: 24,
          overflow: "auto",
          borderRight: `1px solid ${colors.border}`,
          background: colors.surface,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Title level={4} style={{ color: colors.primary, margin: 0 }}>
          Tree Visualizer
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Indented list, 2 spaces per level. Tabs and - or * markers work too.
        </Text>
        <HierarchyEditor value={text} onChange={setText} />
        {warnings.map((w) => (
          <Alert key={w} title={w} type="warning" showIcon />
        ))}
      </aside>
      <section
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
        }}
      >
        {tree ? (
          <div style={{ margin: "auto", padding: 32 }}>
            <TreeDiagram root={tree} />
          </div>
        ) : (
          <Text type="secondary" style={{ margin: "auto" }}>
            Nothing to show yet.
          </Text>
        )}
      </section>
    </main>
  );
}
