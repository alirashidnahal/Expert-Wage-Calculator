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

`Expert Wage Calculator`

## Submission overview

Use this text in the submission form:

> Expert Wage Calculator is a standalone multilingual WordPress plugin that estimates Iranian official judicial expert wages under the 1402 and 1405 tariff catalogs. It provides quick and full shortcodes, integer-safe rial calculations, specialist subjects, statutory caps, missions, same-field expert panels, and explicit handling of range- or authority-dependent results. It does not collect data, contact external services, or depend on a specific theme or Bootstrap.

## Submission ZIP

Upload `expert-wage-calculator.zip`. The archive must contain one top-level directory named `expert-wage-calculator` and must be under 10 MB.

Build this archive with `tools/build-package.ps1`. Do not submit GitHub's automatically generated source archive.

Submit at:

https://wordpress.org/plugins/developers/add/

## After approval

1. WordPress.org will provide an SVN repository, normally `https://plugins.svn.wordpress.org/expert-wage-calculator/`.
2. Add `SVN_USERNAME` and `SVN_PASSWORD` to GitHub Actions secrets.
3. Add optional banner, icon, and screenshot files under `.wordpress-org/` before the first automated deployment.
4. Create an annotated Git tag matching the plugin version, for example `1.1.0` or `v1.1.0`. The configured deploy action uses the tag name as the SVN tag, so the recommended release tag is `1.1.0` to match `Stable Tag` exactly.
5. Publish a GitHub Release from that tag. The workflow deploys the production files to WordPress.org and attaches an installable ZIP to the release.

Do not deploy routine development commits to SVN. WordPress.org SVN is a release repository.

## Release consistency checklist

- Main plugin header `Version`: `1.1.0`
- `readme.txt` `Stable Tag`: `1.1.0`
- `package.json` version: `1.1.0`
- Git tag: `1.1.0`
- Changelog entry: `1.1.0`
- Translation catalogs regenerated and committed
- CI green on PHP 7.4 and PHP 8.4
- Production ZIP installs and activates on a clean site
