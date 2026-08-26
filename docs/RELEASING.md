# Release process

## Versioning

Follow [GitHub tagging suggestions](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) and [Semantic Versioning](https://semver.org/):

| Kind | GitHub tag | Plugin header / Stable Tag |
| --- | --- | --- |
| Production | `v1.2.0` | `1.2.0` |
| Pre-release channel | `v1.2.0` while still marked prerelease | `1.2.0` |
| Post-production dev build | `v1.2.0-dev` | keep bumping toward the next SemVer |
| Explicit alpha/beta in the plugin version | `v1.3.0-beta.1` | `1.3.0-beta.1` |

WordPress.org SVN receives the version **without** the leading `v` (the deploy action strips it), so Stable Tag `1.2.0` matches SVN tag `1.2.0`.

## 1. Prepare the version

Update the same semantic version in:

- `tarifexa.php` plugin header and constant.
- `readme.txt` Stable Tag.
- `package.json`.
- `CHANGELOG.md`.

Update `Tested up to` only after testing that WordPress major version.

## 2. Verify

```bash
npm run build:translations
npm run check:js
npm test
npm run validate:release
npm run build:packages
```

Lint all PHP files and test both shortcodes in English and Persian on desktop and mobile. Install the **install** ZIP on a clean WordPress site.

On Windows, `tools/build-package.ps1` runs the same Node packaging script.

## 3. Automated ZIP builds on `main` / `master`

Pushing or merging to `main` or `master` runs `.github/workflows/release-zips.yml`. That workflow:

1. Validates release metadata.
2. Builds two archives in `dist/`:
   - `tarifexa-wordpress-org-{version}.zip` — production-only package for WordPress.org / SVN trunk submission.
   - `tarifexa-install-{version}.zip` — customer upload package (same production files plus `readme-fa_IR.txt` and `CHANGELOG.md`).
3. Uploads both ZIP files as workflow artifacts.
4. Creates or updates a GitHub Release tagged `v{version}` (for example `v1.2.0`) as a **prerelease**, and keeps that tag pointed at the latest build commit.

Both ZIPs contain a single top-level `tarifexa/` directory and exclude development paths such as `.github`, `docs`, `tests`, and `tools`.

The automated prerelease does **not** deploy to WordPress.org SVN.

If `v{version}` was already promoted to a production release, the workflow publishes `v{version}-dev` instead. Bump the plugin version before the next production tag.

You can delete obsolete tags such as `build-master` from the repository tags page; they are no longer used.

## 4. Promote a production release

When the prerelease assets for `v1.2.0` are ready:

1. Open the GitHub Release `v1.2.0`.
2. Edit the release.
3. Uncheck **Set as a pre-release**.
4. Check **Set as the latest release**.
5. Update the release notes from `CHANGELOG.md` if needed, then save.

That promotion triggers `.github/workflows/deploy-wordpress-org.yml` for tags matching `vMAJOR.MINOR.PATCH` (no `-dev` / `-beta` suffix).

Alternatively, create a non-prerelease release from an annotated tag:

```bash
git tag -a v1.2.0 -m "Tarifexa v1.2.0"
git push origin v1.2.0
gh release create v1.2.0 --title "Tarifexa v1.2.0" --notes-file CHANGELOG.md --latest
```

## 5. Verify publication

- Confirm the WordPress.org page shows Stable Tag `1.2.0` (without the `v` prefix).
- Confirm the update is available from a clean WordPress installation.
- Download and inspect both the WordPress.org and install ZIP files on the GitHub Release.
- Re-run a representative 1402 and 1405 calculation.
- Confirm English and Persian translations load.
