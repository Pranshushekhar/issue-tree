"use client";

import { useEffect, useRef, useState } from "react";
import { Typography } from "antd";
import type { TreeNode } from "@/lib/parseList";
import { TreeDiagram } from "./TreeDiagram";
import { colors } from "@/lib/colors";

const { Text } = Typography;

function FullscreenIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3" />
    </svg>
  );
}

export function TreePanel({ tree }: { tree: TreeNode | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        overflow: "auto",
        display: "flex",
        background: colors.background,
      }}
    >
      <button
        onClick={toggleFullscreen}
        style={{
          // fixed (not absolute) so it stays pinned to the screen corner instead
          // of scrolling away with the container's content once the tree overflows
          position: isFullscreen ? "fixed" : "absolute",
          top: 12,
          right: 12,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: isFullscreen ? "8px 16px" : "8px",
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.textPrimary,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        {isFullscreen ? "✕ Exit fullscreen" : <FullscreenIcon />}
      </button>
      {tree ? (
        <div style={{ margin: "auto", padding: 32 }}>
          <TreeDiagram root={tree} />
        </div>
      ) : (
        <Text type="secondary" style={{ margin: "auto" }}>
          Nothing to show yet.
        </Text>
      )}
    </div>
  );
}
