# Release process

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
4. Publishes or updates a **prerelease** GitHub Release tagged `build-main` or `build-master`.

Both ZIPs contain a single top-level `tarifexa/` directory and exclude development paths such as `.github`, `docs`, `tests`, and `tools`.

The prerelease build does **not** deploy to WordPress.org SVN.

## 4. Commit and tag a public version

```bash
git add --all
git commit -m "Release 1.2.0"
git tag -a 1.2.0 -m "Tarifexa 1.2.0"
git push origin main
git push origin 1.2.0
```

## 5. Publish the GitHub Release

Create a **non-prerelease** GitHub Release from tag `1.2.0`, copy the relevant changelog section into the release notes, and publish it.

After WordPress.org approval and repository-secret configuration, publishing that release triggers `.github/workflows/deploy-wordpress-org.yml`. It deploys the tag to SVN and attaches the generated production ZIP to the GitHub Release.

Prereleases and tags that start with `build-` are ignored by the SVN deploy workflow.

## 6. Verify publication

- Confirm the WordPress.org page shows the expected version and Stable Tag.
- Confirm the update is available from a clean WordPress installation.
- Download and inspect both the WordPress.org and GitHub ZIP files.
- Re-run a representative 1402 and 1405 calculation.
- Confirm English and Persian translations load.
