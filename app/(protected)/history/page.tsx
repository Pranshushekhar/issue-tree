"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button, Popconfirm, Typography } from "antd";
import { Header } from "../../Header";
import { subscribeHistory, getHistorySnapshot, getHistoryServerSnapshot, deleteFromHistory } from "@/lib/history";
import { colors } from "@/lib/colors";

const { Text } = Typography;

export default function HistoryPage() {
  const entries = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getHistoryServerSnapshot);

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header />
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {entries.length === 0 ? (
          <Text type="secondary">Nothing saved yet.</Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 640 }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  background: colors.surface,
                }}
              >
                <Link href={`/?load=${entry.id}`} style={{ display: "block", flex: 1, padding: 16 }}>
                  <Text strong style={{ color: colors.textPrimary }}>
                    {entry.name}
                  </Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(entry.savedAt).toLocaleString()}
                    </Text>
                  </div>
                </Link>
                <Popconfirm
                  title="Delete this issue tree?"
                  description="This can't be undone."
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => deleteFromHistory(entry.id)}
                >
                  <Button danger type="text" style={{ marginRight: 8 }}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
