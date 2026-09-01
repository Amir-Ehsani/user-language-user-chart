import { NextResponse } from "next/server";
import { getLanguageStats, GithubError } from "@/lib/github";
import { getRequestToken } from "@/lib/auth";

export async function GET(request) {
  const login = new URL(request.url).searchParams.get("login");
  try {
    const token = await getRequestToken();
    const stats = await getLanguageStats(login, token);
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400" },
    });
  } catch (err) {
    const status = err instanceof GithubError ? err.status : 500;
    return NextResponse.json({ error: err.message || "Failed." }, { status });
  }
}
