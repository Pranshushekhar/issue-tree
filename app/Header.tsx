"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Typography } from "antd";
import { colors } from "@/lib/colors";

const { Title } = Typography;

const TABS = [
  { href: "/", label: "Editor" },
  { href: "/history", label: "History" },
] as const;

export function Header({ onSave }: { onSave?: () => void }) {
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
      {onSave && (
        <Button type="primary" onClick={onSave} style={{ marginLeft: "auto" }}>
          Save
        </Button>
      )}
    </header>
  );
}
