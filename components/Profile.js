import Viz from "@/components/Viz";
import { formatBytes } from "@/lib/github";

function summary(languages) {
  if (!languages.length) return "";
  const top = languages[0];
  const rest = languages
    .slice(1, 3)
    .map((lang) => lang.name)
    .join(" and ");
  if (!rest) {
    return (
      <>
        Mostly <em>{top.name}</em>.
      </>
    );
  }
  return (
    <>
      Mostly <em>{top.name}</em> ({top.pct.toFixed(0)}%), then {rest}.
    </>
  );
}

export default function Profile({ stats, origin }) {
  const { user, languages, repos, repoCount, repoTotal, languageCount, bytes } = stats;
  const embed = `![languages](${origin}/api/card/${user.login})`;

  return (
    <section className="profile">
      <div className="head">
        <img src={user.avatarUrl} alt="" width="56" height="56" />
        <div>
          <h1>{user.name || user.login}</h1>
          <p>
            <a href={user.url}>{user.login}</a>
            {user.bio ? ` — ${user.bio}` : ""}
          </p>
          <div className="meta">
            <span>{languageCount} languages</span>
            <span>
              {repoCount}
              {repoTotal > repoCount ? ` of ${repoTotal}` : ""} public repos
            </span>
            <span>{formatBytes(bytes)}</span>
          </div>
        </div>
      </div>

      {languages.length === 0 ? (
        <p className="empty">No language data on the public repos I could see.</p>
      ) : (
        <>
          <p className="lede">{summary(languages)}</p>
          <Viz languages={languages} repos={repos} />
        </>
      )}

      <p className="note">
        Own public repos only. Forks and archived copies are skipped. Sizes are GitHub
        Linguist bytes, same as the language bar on a repository.
      </p>

      <div className="embed">{embed}</div>
    </section>
  );
}
