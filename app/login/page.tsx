import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth";
import { colors } from "@/lib/colors";

async function login(formData: FormData) {
  "use server";
  const password = formData.get("password");
  const expected = process.env.SITE_PASSWORD;
  if (typeof password !== "string" || !expected || password !== expected) {
    redirect("/login?error=1");
  }
  (await cookies()).set("auth", hashPassword(expected), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        action={login}
        style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}
      >
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          style={{
            padding: 8,
            fontSize: 16,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
          }}
        />
        <button
          type="submit"
          style={{
            padding: 8,
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: colors.primary,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enter
        </button>
        {error && <span style={{ color: "#cf1322", fontSize: 13 }}>Wrong password</span>}
      </form>
    </main>
  );
}
