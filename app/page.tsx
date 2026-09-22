"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Splitter, Typography, message } from "antd";
import { parseList } from "@/lib/parseList";
import { getHistory, saveToHistory, updateHistory, type HistoryEntry } from "@/lib/history";
import { HierarchyEditor } from "./HierarchyEditor";
import { Header } from "./Header";
import { TreePanel } from "./TreePanel";
import { colors } from "@/lib/colors";

const { Text } = Typography;

const PLACEHOLDER = `Root
  Branch A // hover to expand
    Leaf 1
    Leaf 2
  Branch B
    Leaf 3`;

// useSearchParams needs a Suspense boundary or the production build fails
function LoadFromHistory({ onLoad }: { onLoad: (entry: HistoryEntry) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");

  useEffect(() => {
    if (!loadId) return;
    const entry = getHistory().find((e) => e.id === loadId);
    if (entry) onLoad(entry);
    router.replace("/");
  }, [loadId, onLoad, router]);

  return null;
}

export default function Home() {
  const [text, setText] = useState(PLACEHOLDER);
  // null = editing an unsaved "New Issue Tree"; set once loaded from or saved to history
  const [current, setCurrent] = useState<{ id: string; name: string } | null>(null);
  const { tree, warnings } = useMemo(() => parseList(text), [text]);

  const handleLoad = useCallback((entry: HistoryEntry) => {
    setText(entry.text);
    setCurrent({ id: entry.id, name: entry.name });
  }, []);

  const handleSave = () => {
    const entry = current ? updateHistory(current.id, text) : saveToHistory(text);
    if (entry) setCurrent({ id: entry.id, name: entry.name });
    message.success("Saved");
  };

  const handleNew = () => {
    setText(PLACEHOLDER);
    setCurrent(null);
  };

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Suspense fallback={null}>
        <LoadFromHistory onLoad={handleLoad} />
      </Suspense>
      <Header
        status={current ? { mode: "editing", name: current.name } : { mode: "new" }}
        onNew={handleNew}
        onSave={handleSave}
      />
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
          <Splitter.Panel style={{ display: "flex" }}>
            <TreePanel tree={tree} />
          </Splitter.Panel>
        </Splitter>
      </div>
    </main>
  );
}
