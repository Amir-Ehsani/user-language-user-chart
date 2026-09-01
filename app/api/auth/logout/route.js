import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth";

export async function GET() {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = NextResponse.redirect(origin);
  res.cookies.set(TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set("lc_login", "", { path: "/", maxAge: 0 });
  return res;
}
