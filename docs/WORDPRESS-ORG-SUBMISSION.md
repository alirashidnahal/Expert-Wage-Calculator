# WordPress.org submission

## Before submission

1. Create and verify a WordPress.org account with an email address you monitor.
2. Sign in with the verified WordPress.org account `alirashidnahal`.
3. Keep `plugins@wordpress.org` out of spam filters.
4. Run the complete test suite and install the production ZIP on a clean WordPress site.
5. Confirm that the plugin version, `Stable Tag`, package version, and Git tag are identical.
6. Confirm that no credentials, personal case data, development ZIP files, or local paths are included.
7. Run Plugin Check on a clean installation made from the production ZIP. Do not run the release check against the GitHub development checkout, which intentionally contains `.github`, `.gitignore`, and repository documentation.

## Submission title

`Tarifexa – Judicial Expert Wage Calculator`

## Submission overview

Use this text in the submission form:

> Tarifexa is a standalone multilingual WordPress plugin that estimates Iranian judicial expert wages under the 1402 and 1405 tariff catalogs. It provides quick and full shortcodes, integer-safe rial calculations, specialist subjects, statutory caps, missions, same-field expert panels, and explicit handling of range- or authority-dependent results. It does not collect data, contact external services, or depend on a specific theme or Bootstrap.

## Submission ZIP

Upload `tarifexa-wordpress-org-{version}.zip` from `npm run build:packages` (or the matching GitHub Actions artifact / `build-main` prerelease asset). The archive must contain one top-level directory named `tarifexa` and must be under 10 MB.

For customer sites, use `tarifexa-install-{version}.zip` instead. That package is also WordPress-uploadable and adds Persian readme and changelog files for operators.

Do not submit GitHub's automatically generated source archive.

Submit at:

https://wordpress.org/plugins/developers/add/

## After approval

1. WordPress.org will provide an SVN repository for the approved slug (requested: `tarifexa`). Final slug assignment is determined by the Plugin Review Team.
2. Add `SVN_USERNAME` and `SVN_PASSWORD` to GitHub Actions secrets.
3. Add optional banner, icon, and screenshot files under `.wordpress-org/` before the first automated deployment.
4. Use a GitHub tag with a leading `v`, for example `v1.2.0`. Merges to `main`/`master` create that tag as a prerelease automatically; promote it to the latest non-prerelease release when ready.
5. The deploy action strips the leading `v`, so WordPress.org SVN receives tag `1.2.0` to match `Stable Tag`.

Do not deploy routine development commits or prereleases to SVN. WordPress.org SVN is a release repository.

## Release consistency checklist

- Main plugin header `Version`: `1.2.0`
- `readme.txt` `Stable Tag`: `1.2.0`
- `package.json` version: `1.2.0`
- GitHub tag / Release: `v1.2.0`
- SVN / Stable Tag: `1.2.0`
- Changelog entry: `1.2.0`
- Translation catalogs regenerated and committed
- CI green on PHP 7.4 and PHP 8.4
- Production ZIP installs and activates on a clean site
