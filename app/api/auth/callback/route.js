import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth";

export async function GET(request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(origin);
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/auth/callback`,
    }),
  });

  const payload = await tokenRes.json();
  if (!payload.access_token) {
    return NextResponse.redirect(`${origin}/?auth=failed`);
  }

  const meRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${payload.access_token}`,
      "User-Agent": "language-chart",
    },
  });
  const me = meRes.ok ? await meRes.json() : {};

  const res = NextResponse.redirect(me.login ? `${origin}/u/${me.login}` : origin);
  const secure = origin.startsWith("https://");
  const cookie = { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 7 };
  res.cookies.set(TOKEN_COOKIE, payload.access_token, cookie);
  if (me.login) {
    res.cookies.set("lc_login", me.login, { ...cookie, httpOnly: false });
  }
  return res;
}
