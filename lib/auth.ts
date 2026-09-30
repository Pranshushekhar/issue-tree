import { createHash } from "node:crypto";

// ponytail: sha256 so the site password isn't sitting in the cookie in plaintext
export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}
