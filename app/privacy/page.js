export const metadata = { title: "privacy" };

export default function PrivacyPage() {
  return (
    <article className="prose">
      <h1>privacy</h1>
      <p>
        This site talks to GitHub on your behalf and then throws the response
        away. Language totals are not stored in a database. Pages may be cached
        at the edge for about an hour so the same username is not fetched over
        and over.
      </p>
      <p>
        If you sign in, GitHub sends back a user token. It lives in an HTTP-only
        cookie on this domain for a week and is used only to call the GitHub
        API. Sign out to delete it. The OAuth app asks for <code>read:user</code>{" "}
        and nothing else.
      </p>
      <p>
        Avatars are loaded from GitHub. No analytics, no ads.
      </p>
    </article>
  );
}
