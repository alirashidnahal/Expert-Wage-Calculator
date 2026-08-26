# Tarifexa – Judicial Expert Wage Calculator

[![Tests](https://github.com/alirashidnahal/expert-wage-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/alirashidnahal/expert-wage-calculator/actions/workflows/ci.yml)
[![License: GPL v2 or later](https://img.shields.io/badge/License-GPL%20v2%2B-blue.svg)](LICENSE)
[![WordPress](https://img.shields.io/badge/WordPress-5.6%2B-21759b.svg)](https://wordpress.org/)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb4.svg)](https://www.php.net/)

A standalone WordPress plugin for estimating Iranian judicial expert wages from the 1402 and 1405 tariff catalogs.

## Features

- Quick valuation calculator with `[tarifexa_quick]`.
- Full subject-based calculator with `[tarifexa]`.
- Versioned 1402 and 1405 tariff catalogs.
- Valuation, rent, quantity, area, GPS, panel, cap, modifier, and mission rules.
- Exact, range-based, and authority-dependent results without fabricated totals.
- Persian, Arabic, and Latin numeric input with live thousands grouping.
- Complete English and Persian WordPress i18n catalogs for PHP and JavaScript.
- Responsive, keyboard-accessible RTL and LTR interface.
- No Bootstrap, theme, analytics, tracking, or external-service dependency.

## Requirements

- WordPress 5.6 or later
- PHP 7.4 or later
- A browser with `BigInt` support

## Installation

1. Download the ZIP from the latest GitHub release or install it from WordPress.org after publication.
2. Upload and activate **Tarifexa**.
3. Add one of the shortcodes to a page, post, widget, or template.

The plugin creates or migrates the full calculator page on activation. Uninstalling the plugin preserves that page because it may contain user-authored content.

Do not install GitHub's automatically generated **Source code** archive. It contains repository-only files such as `.github` and development documentation. Use the attached `tarifexa-install-{version}.zip` release asset for direct site uploads, or `tarifexa-wordpress-org-{version}.zip` for WordPress.org / SVN submission.

## Development

```bash
npm test
npm run check:js
npm run build:translations
npm run validate:release
npm run build:packages
```

On Windows, `tools/build-package.ps1` creates both production ZIP variants in `dist/`. Run Plugin Check against an installation made from the WordPress.org ZIP, not against a development checkout.

The calculation engine exposes:

```js
Tarifexa.getCatalog(year)
Tarifexa.calculate(year, topicId, values, options)
```

Tariff changes must include source documentation, boundary tests, and regenerated translation files. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Privacy

The plugin does not collect, store, transmit, or track personal data. All calculations run locally in the visitor's browser.

## Disclaimer

Results are tariff estimates and do not replace the final wage determined by a judicial authority, association, or center.

## فارسی

راهنمای فارسی افزونه در فایل [readme-fa_IR.txt](readme-fa_IR.txt) موجود است. افزونه شامل ترجمه کامل فارسی رابط PHP و JavaScript است.

## Author

Developed by [Ali Rashidnahal](https://alirashidnahal.com/) — [GitHub](https://github.com/alirashidnahal).

## License

Licensed under the GNU General Public License v2.0 or later. See [LICENSE](LICENSE).
