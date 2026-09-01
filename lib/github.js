const GQL = "https://api.github.com/graphql";
const UA =
  "language-chart (https://github.com/Amir-Ehsani/GitHub-User-Language-user-chart)";

const QUERY = `
  query ($login: String!, $after: String) {
    user(login: $login) {
      login
      name
      bio
      avatarUrl
      url
      repositories(
        first: 100
        after: $after
        ownerAffiliations: OWNER
        isFork: false
        isArchived: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          url
          isPrivate
          primaryLanguage {
            name
            color
          }
          languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

export class GithubError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function githubGraphql(token, variables) {
  const res = await fetch(GQL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": UA,
    },
    body: JSON.stringify({ query: QUERY, variables }),
  });

  if (res.status === 401) {
    throw new GithubError("GitHub token was rejected.", 401);
  }
  if (res.status === 403) {
    throw new GithubError("GitHub rate limit hit. Try again in a bit.", 429);
  }
  if (!res.ok) {
    throw new GithubError("GitHub did not answer. Try again later.", 502);
  }

  const json = await res.json();
  if (json.errors?.length) {
    const msg = json.errors[0].message || "GraphQL error";
    const notFound = /could not resolve/i.test(msg) || /not found/i.test(msg);
    throw new GithubError(notFound ? "No GitHub user with that login." : msg, notFound ? 404 : 502);
  }
  return json.data;
}

function packLang(edge) {
  return {
    name: edge.node.name,
    color: edge.node.color || "#8b949e",
    bytes: edge.size,
  };
}

export async function getLanguageStats(login, token) {
  if (!token) {
    throw new GithubError(
      "This app needs a GitHub token on the server. Set GITHUB_TOKEN.",
      503
    );
  }

  const clean = String(login || "")
    .trim()
    .replace(/^@/, "")
    .slice(0, 39);

  if (!/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(clean)) {
    throw new GithubError("That does not look like a GitHub username.", 400);
  }

  const repos = [];
  let after = null;
  let user = null;
  let totalCount = 0;
  let pages = 0;

  while (pages < 3) {
    const data = await githubGraphql(token, { login: clean, after });
    if (!data.user) {
      throw new GithubError("No GitHub user with that login.", 404);
    }
    user = data.user;
    totalCount = data.user.repositories.totalCount;
    repos.push(...data.user.repositories.nodes);
    pages += 1;
    if (!data.user.repositories.pageInfo.hasNextPage) break;
    after = data.user.repositories.pageInfo.endCursor;
  }

  const tallies = new Map();
  let bytes = 0;

  for (const repo of repos) {
    const seen = new Set();
    for (const edge of repo.languages.edges) {
      const lang = packLang(edge);
      bytes += lang.bytes;
      const row = tallies.get(lang.name) || {
        name: lang.name,
        color: lang.color,
        bytes: 0,
        repos: 0,
      };
      row.bytes += lang.bytes;
      if (lang.color && lang.color !== "#8b949e") row.color = lang.color;
      if (!seen.has(lang.name)) {
        row.repos += 1;
        seen.add(lang.name);
      }
      tallies.set(lang.name, row);
    }
  }

  const languages = [...tallies.values()].sort((a, b) => b.bytes - a.bytes);
  const major = [];
  let otherBytes = 0;
  let otherRepos = 0;

  for (const lang of languages) {
    const pct = bytes ? (lang.bytes / bytes) * 100 : 0;
    if (pct < 1 && major.length >= 8) {
      otherBytes += lang.bytes;
      otherRepos += lang.repos;
    } else {
      major.push({ ...lang, pct });
    }
  }

  if (otherBytes > 0) {
    major.push({
      name: "Other",
      color: "#6e7681",
      bytes: otherBytes,
      repos: otherRepos,
      pct: bytes ? (otherBytes / bytes) * 100 : 0,
    });
  }

  const repoViews = repos
    .map((repo) => {
      const langs = repo.languages.edges.map(packLang);
      const total = langs.reduce((sum, item) => sum + item.bytes, 0);
      return {
        name: repo.name,
        url: repo.url,
        bytes: total,
        primary: repo.primaryLanguage,
        languages: langs.map((item) => ({
          ...item,
          pct: total ? (item.bytes / total) * 100 : 0,
        })),
      };
    })
    .filter((repo) => repo.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 24);

  return {
    user: {
      login: user.login,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      url: user.url,
    },
    repoCount: repos.length,
    repoTotal: totalCount,
    languageCount: languages.length,
    bytes,
    languages: major,
    repos: repoViews,
  };
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
