# GitHub repository setup

The plugin directory itself is the repository root:

`wp-content/plugins/expert-wage-calculator`

Do not initialize the entire WordPress installation as this plugin's repository.

## Option A: GitHub CLI

Run these commands from the plugin directory after authenticating with `gh auth login`:

```bash
git init -b main
git add --all
git commit -m "Initial release of Expert Wage Calculator 1.1.0"

gh repo create alirashidnahal/expert-wage-calculator \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description="A multilingual WordPress plugin for estimating Iranian judicial expert wages from the 1402 and 1405 tariff catalogs." \
  --homepage="https://alirashidnahal.com/"

gh repo edit alirashidnahal/expert-wage-calculator \
  --enable-issues \
  --delete-branch-on-merge \
  --add-topic=wordpress \
  --add-topic=wordpress-plugin \
  --add-topic=calculator \
  --add-topic=legal-tech \
  --add-topic=valuation \
  --add-topic=tariff \
  --add-topic=persian \
  --add-topic=rtl \
  --add-topic=i18n \
  --add-topic=iran
```

## Option B: GitHub web interface

1. Open https://github.com/new.
2. Owner: `alirashidnahal`.
3. Repository name: `expert-wage-calculator`.
4. Description: use the exact value in `REPOSITORY-METADATA.md`.
5. Visibility: Public.
6. Do not initialize with a README, `.gitignore`, or license because those files already exist locally.
7. Create the repository, then run:

```bash
git init -b main
git add --all
git commit -m "Initial release of Expert Wage Calculator 1.1.0"
git remote add origin https://github.com/alirashidnahal/expert-wage-calculator.git
git push -u origin main
```

## Before the first public push

```bash
npm run build:translations
npm run check:js
npm test
npm run validate:release
```

Review `git status` and verify that no ZIP file, credential, local path, database export, `wp-config.php`, or user data is staged.

## First release timing

Create the GitHub repository immediately, but wait to promote GitHub Release `v1.2.0` from prerelease to latest until either:

- the WordPress.org plugin is approved and the SVN secrets are configured; or
- the WordPress.org deploy workflow is temporarily disabled for a GitHub-only release.

This prevents the SVN deploy workflow from failing before the WordPress.org SVN repository exists.
