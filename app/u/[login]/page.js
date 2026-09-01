import { notFound } from "next/navigation";
import Profile from "@/components/Profile";
import Search from "@/components/Search";
import { getLanguageStats, GithubError } from "@/lib/github";
import { getRequestToken } from "@/lib/auth";

export async function generateMetadata({ params }) {
  const { login } = await params;
  return {
    title: login,
    description: `Language mix for ${login} on GitHub.`,
  };
}

export default async function UserPage({ params }) {
  const { login } = await params;
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const token = await getRequestToken();
    const stats = await getLanguageStats(login, token);
    return (
      <>
        <div style={{ paddingTop: 28 }}>
          <Search initial={stats.user.login} />
        </div>
        <Profile stats={stats} origin={origin} />
      </>
    );
  } catch (err) {
    if (err instanceof GithubError && err.status === 404) notFound();
    return (
      <section className="err">
        <h1>could not load that profile</h1>
        <p>{err.message}</p>
      </section>
    );
  }
}
