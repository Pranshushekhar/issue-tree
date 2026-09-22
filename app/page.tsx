"use client";

import { useMemo, useState } from "react";
import { Alert, Splitter, Typography } from "antd";
import { parseList } from "@/lib/parseList";
import { TreeDiagram } from "./TreeDiagram";
import { HierarchyEditor } from "./HierarchyEditor";
import { colors } from "@/lib/colors";

const { Title, Text } = Typography;

const PLACEHOLDER = `Root
  Branch A // hover to expand
    Leaf 1
    Leaf 2
  Branch B
    Leaf 3`;

export default function Home() {
  const [text, setText] = useState(PLACEHOLDER);
  const { tree, warnings } = useMemo(() => parseList(text), [text]);

  return (
    <main style={{ height: "100vh", overflow: "hidden" }}>
      <Splitter style={{ height: "100%" }}>
        <Splitter.Panel
          defaultSize={320}
          min={240}
          max={640}
          style={{
            overflow: "auto",
            padding: 24,
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
            Indented list, 2 spaces per level. Tabs and - or * markers work too. Add {"//"} after a
            name to give it a description that expands on hover.
          </Text>
          <HierarchyEditor value={text} onChange={setText} />
          {warnings.map((w) => (
            <Alert key={w} title={w} type="warning" showIcon />
          ))}
        </Splitter.Panel>
        <Splitter.Panel style={{ overflow: "auto", display: "flex" }}>
          {tree ? (
            <div style={{ margin: "auto", padding: 32 }}>
              <TreeDiagram root={tree} />
            </div>
          ) : (
            <Text type="secondary" style={{ margin: "auto" }}>
              Nothing to show yet.
            </Text>
          )}
        </Splitter.Panel>
      </Splitter>
    </main>
  );
}
