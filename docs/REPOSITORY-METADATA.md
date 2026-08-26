# Repository metadata

Use the following values when creating the public GitHub repository.

## GitHub

- **Owner:** `alirashidnahal`
- **Repository name:** `expert-wage-calculator`
- **Display name:** Tarifexa – Judicial Expert Wage Calculator
- **Visibility:** Public
- **Default branch:** `main`
- **Description:** `A multilingual WordPress plugin for estimating Iranian judicial expert wages from the 1402 and 1405 tariff catalogs.`
- **Website:** `https://alirashidnahal.com/`
- **License:** GNU General Public License v2.0 or later

### Topics

Add these GitHub repository topics:

`wordpress`, `wordpress-plugin`, `calculator`, `legal-tech`, `valuation`, `tariff`, `persian`, `rtl`, `i18n`, `iran`

### Recommended repository settings

- Enable Issues.
- Enable Discussions only if you intend to provide community support there.
- Enable private vulnerability reporting under **Settings → Security → Private vulnerability reporting**.
- Disable Wikis unless they will be actively maintained.
- Enable automatic deletion of merged branches.
- Protect `main`: require a pull request, require the `CI` check, and block force pushes.
- Enable Dependabot security updates for GitHub Actions.
- Set social preview artwork after WordPress.org banner artwork is prepared.

### Actions secrets

After WordPress.org approves the plugin slug, add these repository secrets:

- `SVN_USERNAME`: the case-sensitive WordPress.org account with commit access.
- `SVN_PASSWORD`: its WordPress.org password. Prefer a dedicated application password if WordPress.org supports it for SVN at release time.

Do not put either value in repository files, workflow logs, issues, or release notes.

## WordPress.org

- **Requested slug:** `tarifexa`
- **Plugin name:** Tarifexa – Judicial Expert Wage Calculator
- **Short description:** `Estimate Iranian judicial expert wages for 1402 and 1405 with quick and full multilingual shortcodes.`
- **Version:** `1.2.0`
- **Stable tag:** `1.2.0`
- **Requires WordPress:** `5.6`
- **Tested up to:** `7.1`
- **Requires PHP:** `7.4`
- **License:** GPLv2 or later
- **Text domain:** `tarifexa`
- **Domain path:** `/languages`
- **Contributor:** `alirashidnahal` — verified against the public WordPress.org profile.

### WordPress.org tags

Use the five tags already present in `readme.txt`:

`expert wage`, `judicial expert`, `tariff`, `valuation`, `calculator`

The requested slug is subject to WordPress.org Plugin Review Team approval. Only that process can reserve it.
