"use client";

import { useRef, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { indentLevel, INDENT_SIZE } from "@/lib/parseList";
import { colors } from "@/lib/colors";

const LINE_H = 20;
const PAD = 12;
const FONT = "var(--font-geist-mono), monospace";

function currentLineBounds(value: string, pos: number) {
  const start = value.lastIndexOf("\n", pos - 1) + 1;
  let end = value.indexOf("\n", pos);
  if (end === -1) end = value.length;
  return { start, end };
}

export function HierarchyEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lines = value.split("\n");

  const syncScroll = () => {
    if (taRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  const applyEdit = (newValue: string, caret: number) => {
    flushSync(() => onChange(newValue));
    taRef.current?.setSelectionRange(caret, caret);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart: s, selectionEnd: en } = e.currentTarget;

    if (e.key === "Tab") {
      e.preventDefault();
      const { start } = currentLineBounds(value, s);
      if (e.shiftKey) {
        const removed = Math.min(INDENT_SIZE, (value.slice(start).match(/^ */) ?? [""])[0].length);
        const newValue = value.slice(0, start) + value.slice(start + removed);
        const shift = s > start ? -Math.min(removed, s - start) : 0;
        applyEdit(newValue, s + shift);
      } else {
        const newValue = value.slice(0, start) + " ".repeat(INDENT_SIZE) + value.slice(start);
        applyEdit(newValue, s + INDENT_SIZE);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const { start, end } = currentLineBounds(value, s);
      const indentStr = (value.slice(start, end).match(/^\s*/) ?? [""])[0];
      const newValue = value.slice(0, s) + "\n" + indentStr + value.slice(en);
      applyEdit(newValue, s + 1 + indentStr.length);
    }
  };

  return (
    <div style={{ display: "grid" }}>
      <div
        ref={overlayRef}
        aria-hidden
        style={{
          gridArea: "1 / 1",
          overflow: "hidden",
          pointerEvents: "none",
          padding: PAD,
          border: "1px solid transparent",
          fontFamily: FONT,
          fontSize: 13,
          lineHeight: `${LINE_H}px`,
          whiteSpace: "pre",
        }}
      >
        {lines.map((line, i) => {
          const level = indentLevel(line);
          const hasContent = line.trim().length > 0;
          return (
            <div key={i} style={{ height: LINE_H }}>
              {level > 0 && (
                <span
                  style={{
                    paddingLeft: `${Math.max(0, level * INDENT_SIZE - 1)}ch`,
                    color: hasContent ? colors.primary : colors.border,
                  }}
                >
                  •
                </span>
              )}
            </div>
          );
        })}
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        spellCheck={false}
        className="indent-guides"
        style={{
          gridArea: "1 / 1",
          background: "transparent",
          resize: "vertical",
          padding: PAD,
          fontFamily: FONT,
          fontSize: 13,
          lineHeight: `${LINE_H}px`,
          height: 18 * LINE_H + PAD * 2,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          color: colors.textPrimary,
          outline: "none",
        }}
      />
    </div>
  );
}
