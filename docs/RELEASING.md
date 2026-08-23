# Release process

## 1. Prepare the version

Update the same semantic version in:

- `expert-wage-calculator.php` plugin header and constant.
- `readme.txt` Stable Tag.
- `package.json`.
- `CHANGELOG.md`.

Update `Tested up to` only after testing that WordPress major version.

## 2. Verify

```bash
npm run build:translations
npm run check:js
npm test
```

Lint all PHP files and test both shortcodes in English and Persian on desktop and mobile. Install the distribution ZIP on a clean WordPress site.

## 3. Commit and tag

```bash
git add --all
git commit -m "Release 1.1.0"
git tag -a 1.1.0 -m "Expert Wage Calculator 1.1.0"
git push origin main
git push origin 1.1.0
```

## 4. Publish the GitHub Release

Create a release from tag `1.1.0`, copy the relevant changelog section into the release notes, and publish it.

After WordPress.org approval and repository-secret configuration, publishing the release triggers `.github/workflows/deploy-wordpress-org.yml`. It deploys the tag to SVN and attaches the generated production ZIP to the GitHub Release.

## 5. Verify publication

- Confirm the WordPress.org page shows the expected version and Stable Tag.
- Confirm the update is available from a clean WordPress installation.
- Download and inspect both the WordPress.org and GitHub ZIP files.
- Re-run a representative 1402 and 1405 calculation.
- Confirm English and Persian translations load.
