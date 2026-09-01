# language chart

A small site that asks GitHub what a person actually writes, then draws it.

It walks the public repositories on an account, adds up [Linguist](https://github.com/github-linguist/linguist) byte counts, and turns that into a chart. Forks and archived repos are left out so a bunch of old mirrors do not drown the picture.

There is also a card you can drop in a README:

```md
![languages](https://YOUR-DEPLOY.vercel.app/api/card/Amir-Ehsani)
```

Replace the host with your own Vercel URL. The card is an SVG, so it stays sharp and GitHub will cache it.

## How it works

1. The server calls the GitHub **GraphQL** API (not a scrape).
2. Up to 300 of the account’s own public repositories are read.
3. Language sizes are summed across those repos.
4. The same mix can be shown as a donut, bars, a treemap, a radial chart, or stacked bars per repository.
5. Anything under 1% after the first eight languages is rolled into **Other**.

Anonymous lookups use a server token. Optional GitHub OAuth (`read:user`) is there so the operator can raise the rate limit without putting a personal token in the browser.

## Run it locally

```bash
git clone https://github.com/Amir-Ehsani/GitHub-User-Language-user-chart.git
cd GitHub-User-Language-user-chart
cp .env.example .env.local
```

Create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens) with **read-only** access to public repositories. Paste it into `.env.local`:

```
GITHUB_TOKEN=github_pat_…
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try a username.

## Deploy on Vercel

This is a Next.js app. One click is enough if the repo is already on GitHub:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Amir-Ehsani/GitHub-User-Language-user-chart&env=GITHUB_TOKEN,NEXT_PUBLIC_APP_URL&envDescription=Server%20GitHub%20token%20and%20the%20public%20URL%20of%20this%20deployment)

Or from the CLI:

```bash
npx vercel
```

Set these environment variables on the project:

| Name | What it is |
| --- | --- |
| `GITHUB_TOKEN` | Fine-grained PAT, public repos read-only |
| `NEXT_PUBLIC_APP_URL` | Public URL, no trailing slash (`https://….vercel.app`) |
| `GITHUB_CLIENT_ID` | Optional. OAuth App client id |
| `GITHUB_CLIENT_SECRET` | Optional. OAuth App secret |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional. Shown in the footer |

After the first deploy, put the real `*.vercel.app` URL (or your domain) into `NEXT_PUBLIC_APP_URL` and redeploy.

## GitHub OAuth App

Needed if you want the sign-in button.

1. [Register a new OAuth App](https://github.com/settings/applications/new)
2. **Homepage URL** — your Vercel URL
3. **Authorization callback URL** — `https://YOUR-DEPLOY.vercel.app/api/auth/callback`
4. **Application description** — `Language mix for a GitHub account, drawn from public repos.`
5. Drop the client id and secret into Vercel, then redeploy

The app only requests `read:user`. Stats still come from public repository data.

## GitHub Developer Program

This project is an integration: it ships as a public web app, talks to the GitHub API, and can be registered as an OAuth App. That is what the [Developer Program](https://docs.github.com/en/integrations/concepts/github-developer-program) asks for.

When the site is live:

1. Confirm the OAuth App above exists and the homepage URL is the production site
2. Open [github.com/developer/register](https://github.com/developer/register)
3. Use a mailbox people can actually write to (the same one as `NEXT_PUBLIC_SUPPORT_EMAIL` is ideal)
4. Point the website field at the Vercel URL

GitHub then puts the **Developer Program Member** badge on the profile that registered. It is a program badge, not an achievement; it follows the membership.

Privacy policy for the OAuth listing: `/privacy`.

## Notes

- Private repositories are not read.
- GitHub’s unauthenticated cap does not apply here because the server always uses a token. Keep that token’s scopes tight.
- The SVG card is cached at the edge for an hour.

## License

MIT. See [LICENSE](LICENSE).
