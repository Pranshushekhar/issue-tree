"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Splitter, Typography, message } from "antd";
import { parseList } from "@/lib/parseList";
import { getHistory, saveToHistory } from "@/lib/history";
import { TreeDiagram } from "./TreeDiagram";
import { HierarchyEditor } from "./HierarchyEditor";
import { Header } from "./Header";
import { colors } from "@/lib/colors";

const { Text } = Typography;

const PLACEHOLDER = `Root
  Branch A // hover to expand
    Leaf 1
    Leaf 2
  Branch B
    Leaf 3`;

// useSearchParams needs a Suspense boundary or the production build fails
function LoadFromHistory({ onLoad }: { onLoad: (text: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");

  useEffect(() => {
    if (!loadId) return;
    const entry = getHistory().find((e) => e.id === loadId);
    if (entry) onLoad(entry.text);
    router.replace("/");
  }, [loadId, onLoad, router]);

  return null;
}

export default function Home() {
  const [text, setText] = useState(PLACEHOLDER);
  const { tree, warnings } = useMemo(() => parseList(text), [text]);

  const handleSave = () => {
    saveToHistory(text);
    message.success("Saved to history");
  };

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Suspense fallback={null}>
        <LoadFromHistory onLoad={setText} />
      </Suspense>
      <Header onSave={handleSave} />
      <div style={{ flex: 1, minHeight: 0 }}>
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
            <Text type="secondary" style={{ fontSize: 13 }}>
              Indented list, 2 spaces per level. Tabs and - or * markers work too. Add {"//"} after
              a name to give it a description that expands on hover.
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
      </div>
    </main>
  );
}
