import { cookies } from "next/headers";

export const TOKEN_COOKIE = "lc_gh";

export async function getRequestToken() {
  const jar = await cookies();
  const fromUser = jar.get(TOKEN_COOKIE)?.value;
  return fromUser || process.env.GITHUB_TOKEN || "";
}

export async function getSessionLogin() {
  const jar = await cookies();
  return jar.get("lc_login")?.value || "";
}
