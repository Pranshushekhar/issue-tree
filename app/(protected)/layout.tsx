import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  const password = process.env.SITE_PASSWORD;
  if (password) {
    const cookie = (await cookies()).get("auth")?.value;
    if (cookie !== hashPassword(password)) {
      redirect("/login");
    }
  }

  return children;
}
