import { getSessionLogin } from "@/lib/auth";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "language chart",
    template: "%s · language chart",
  },
  description: "Chart the languages in a GitHub user's public repositories.",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }) {
  const signedIn = await getSessionLogin();
  const oauthReady = Boolean(process.env.GITHUB_CLIENT_ID);
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <html lang="en">
      <body>
        <header>
          <div className="shell top">
            <a className="brand" href="/">
              language chart
            </a>
            <nav className="nav">
              <a href="/privacy">privacy</a>
              <a href="https://github.com/Amir-Ehsani/GitHub-User-Language-user-chart">
                source
              </a>
              {oauthReady ? (
                signedIn ? (
                  <a href="/api/auth/logout">sign out</a>
                ) : (
                  <a href="/api/auth/login">sign in</a>
                )
              ) : null}
            </nav>
          </div>
        </header>
        <main className="shell">{children}</main>
        <footer>
          <div className="shell foot">
            <span>public GitHub repos, charted</span>
            <span>
              <a href="/privacy">privacy</a>
              {" · "}
              {support ? (
                <a href={`mailto:${support}`}>{support}</a>
              ) : (
                <a href="https://github.com/Amir-Ehsani/GitHub-User-Language-user-chart/issues">
                  issues
                </a>
              )}
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
