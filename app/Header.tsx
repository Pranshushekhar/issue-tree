"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Popconfirm, Typography } from "antd";
import { colors } from "@/lib/colors";

const { Title, Text } = Typography;

const TABS = [
  { href: "/", label: "Editor" },
  { href: "/history", label: "History" },
] as const;

export type DocStatus = { mode: "new" } | { mode: "editing"; name: string; autosavedAt?: Date };

export function Header({
  onSave,
  onNew,
  status,
}: {
  onSave?: () => void;
  onNew?: () => void;
  status?: DocStatus;
}) {
  const pathname = usePathname();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "10px 20px",
        borderBottom: `1px solid ${colors.border}`,
        background: colors.surface,
        flexShrink: 0,
      }}
    >
      <Title level={5} style={{ color: colors.primary, margin: 0 }}>
        Tree Visualizer
      </Title>
      <nav style={{ display: "flex", gap: 4 }}>
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: active ? colors.textOnPrimary : colors.textSecondary,
                background: active ? colors.primary : "transparent",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {(status || onSave || onNew) && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          {status && (
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {status.mode === "new" ? (
                "New Issue Tree"
              ) : (
                <>
                  Editing: <Text strong style={{ color: colors.textPrimary }}>{status.name}</Text>
                  {status.autosavedAt && ` · Autosaved at ${status.autosavedAt.toLocaleTimeString()}`}
                </>
              )}
            </Text>
          )}
          {onNew && (
            <Popconfirm
              title="Start a new issue tree?"
              description="Any unsaved changes will be lost."
              okText="Start new"
              okButtonProps={{ danger: true }}
              onConfirm={onNew}
            >
              <Button>New</Button>
            </Popconfirm>
          )}
          {onSave && (
            <Button type="primary" onClick={onSave}>
              Save
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
