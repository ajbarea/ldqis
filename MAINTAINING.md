# Maintaining the LDQIS site

What the site depends on, the two one-time moves still ahead (into the lab's GitHub
organization, then onto `dataqualitylabs.com`), and how to hand the site to the next
maintainer.

## What the site depends on

| Piece                           | Where it lives                                                                                    | Who can change it               |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| Source, CI, GitHub Pages        | `ajbarea/ldqis` (moving to `ldqis/ldqis`)                                                         | Repo admins                     |
| CMS sign-in (Cloudflare Worker) | `ldqis-cms-auth`, source in `ajbarea/ldqis-cms-auth`; Cloudflare deploys every push to its `main` | Cloudflare account members      |
| GitHub OAuth App                | Client ID in the Worker's `wrangler.toml`; client secret stored as a Worker secret                | The app's owner                 |
| CMS publisher GitHub App        | Repo variable `CMS_APP_ID`, repo secret `CMS_APP_PRIVATE_KEY`                                     | The app's owner                 |
| `dataqualitylabs.com`           | GoDaddy (registration and DNS); renews every February 12                                          | Whoever holds the GoDaddy login |

## Moving into the `ldqis` organization

Do this in one sitting: the old `ajbarea.github.io/ldqis/` address stops working at step 1,
and GitHub does not redirect Pages sites after a transfer.

1. **Transfer the site repo.** `ajbarea/ldqis` → Settings → General → Transfer ownership →
   `ldqis`.
2. **Merge the pull request that points the site and CMS at `ldqis/ldqis`.** The deploy that
   follows publishes to <https://ldqis.github.io/ldqis/>. If it doesn't, check Settings →
   Pages → Source is "GitHub Actions" and re-run the Deploy workflow.
3. **Transfer the OAuth App.** Its owner: Settings → Developer settings → OAuth Apps → the
   app → Transfer ownership → `ldqis`. An org owner then accepts it under the org's Developer
   settings. New organizations block outside OAuth apps, so until this is done, CMS sign-in
   works but saves fail. Apps the org owns are trusted automatically.
4. **Transfer the CMS publisher GitHub App** (`ldqis-cms-publisher`). Its owner: Settings →
   Developer settings → GitHub Apps → the app → Advanced → Transfer ownership → `ldqis`.
   Install it on the org for the `ldqis` repo, then confirm `CMS_APP_ID` still matches the
   app's ID.
5. **Move the sign-in Worker's source.** Transfer `ajbarea/ldqis-cms-auth` to `ldqis`, then in
   Cloudflare: Workers & Pages → `ldqis-cms-auth` → Settings → Builds → Git Repository →
   Manage, and reconnect it to `ldqis/ldqis-cms-auth`. Cloudflare asks to install its GitHub
   app on the org.
6. **Grant the team access.** Org → Teams → `lab-members` → Repositories → add `ldqis` with
   Write. Editors reach the CMS through the team, so new students need only an org invite.
7. **Check it end to end.** Sign in at <https://ldqis.github.io/ldqis/admin/>, save a small
   edit, and confirm the publisher bot's pull request merges and the change goes live.
8. **Coverage badge.** Turn on Codecov for the org and update the badge token in `README.md`.

## Moving to `dataqualitylabs.com`

RIT's [Web Standards](https://www.rit.edu/brandportal/web-standards) cover lab websites and
ask sites hosted outside RIT's servers for an exception through web@rit.edu; settle that
first. The DNS steps need whoever holds the GoDaddy login.

1. **Verify the domain for the org.** Org Settings → Pages → Add a domain →
   `dataqualitylabs.com`. At GoDaddy, add the TXT record GitHub shows
   (`_github-pages-challenge-ldqis`), then click Verify. This stops anyone else on GitHub
   from claiming the domain.
2. **Point DNS at GitHub Pages** (GoDaddy → DNS):
   - Delete the old `A` record for `@` (`129.21.34.220`).
   - Add four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`.
   - Optional IPv6: four `AAAA` records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
     `2606:50c0:8002::153`, `2606:50c0:8003::153`.
   - Set `www` to a `CNAME` for `ldqis.github.io`.
   - Don't add wildcard (`*`) records.
3. **Set the custom domain.** Repo Settings → Pages → Custom domain → `dataqualitylabs.com` →
   Save. This setting is what GitHub uses; a `CNAME` file does nothing for this repo.
4. **Build for the new address.** Settings → Secrets and variables → Actions → Variables →
   set `CUSTOM_DOMAIN` to `true`, then re-run the Deploy workflow. The site then builds at the
   root of the domain.
5. **Turn on HTTPS.** Once GitHub offers it (up to 24 hours), tick Enforce HTTPS.
6. **Check.** <https://dataqualitylabs.com> loads, `www` redirects to it, and `/admin` sign-in
   works (the Worker already allows both hostnames).
7. **Tidy up.** Update the links in `README.md` and the welcome news post, and turn on
   auto-renew for the domain under an RIT-owned account.

## Handing the site to the next maintainer

- **Keep at least two org owners.** Before a maintainer graduates, make their successor an
  owner (org → People → role Owner).
- **Add new lab members** from org → People → Invite, then add them to `lab-members`.
- **Share the Cloudflare account.** Cloudflare → Manage Account → Members → invite the
  successor as Super Administrator; the CMS sign-in runs there.
- **Watch the renewal.** `dataqualitylabs.com` expires each February 12 unless renewed.
