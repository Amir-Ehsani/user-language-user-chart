import { NextResponse } from "next/server";
import { getLanguageStats, GithubError } from "@/lib/github";
import { getRequestToken } from "@/lib/auth";
import { buildCardSvg, escapeXml } from "@/lib/card";

export async function GET(_request, { params }) {
  const { login } = await params;
  try {
    const token = await getRequestToken();
    const stats = await getLanguageStats(login, token);
    const svg = buildCardSvg(stats);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const status = err instanceof GithubError ? err.status : 500;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="90">
  <rect width="420" height="90" rx="12" fill="#111214"/>
  <text x="20" y="52" fill="#d8d0c4" font-size="14" font-family="sans-serif">${escapeXml(String(err.message || "error").slice(0, 60))}</text>
</svg>`;
    return new NextResponse(svg, {
      status,
      headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  }
}
