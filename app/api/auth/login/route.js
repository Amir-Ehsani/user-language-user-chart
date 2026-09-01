import { NextResponse } from "next/server";

export async function GET() {
  const id = process.env.GITHUB_CLIENT_ID;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (!id) {
    return NextResponse.json(
      { error: "OAuth is not configured. Set GITHUB_CLIENT_ID." },
      { status: 503 }
    );
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", id);
  url.searchParams.set("redirect_uri", `${origin}/api/auth/callback`);
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("allow_signup", "false");

  return NextResponse.redirect(url);
}
