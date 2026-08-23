# Contributing

Thank you for contributing to Expert Wage Calculator.

## Before opening an issue

- Search existing issues and confirm the problem still occurs on the latest release.
- For calculation reports, include the tariff year, subject, entered values, expected result, actual result, and the exact legal source.
- Do not include private case data, personal information, credentials, or confidential documents.

## Development workflow

1. Fork the repository and create a focused branch from `main`.
2. Make the smallest change that fully addresses the issue.
3. Add or update table-driven boundary tests for calculation changes.
4. Wrap all user-visible PHP strings with WordPress gettext functions.
5. Add JavaScript source strings to the i18n catalog and regenerate translations.
6. Run the verification commands before opening a pull request.

```bash
npm test
npm run check:js
npm run build:translations
```

Run `php -l` on every changed PHP file. GitHub Actions repeats these checks on supported PHP versions.

## Tariff changes

A tariff change must include:

- A public and authoritative legal source.
- The affected year, article, note, clause, or amendment.
- Tests immediately below, at, and above every changed threshold.
- Tests for caps, panel ordering, modifiers, missions, ranges, and authority-dependent outcomes when relevant.
- Updated English and Persian labels and legal references.

Do not introduce inferred amounts for rules that the source leaves to an authority or agreement.

## Coding guidelines

- Support PHP 7.4 and WordPress 5.6 or later.
- Preserve the public shortcodes and `IKExpertWage` API unless a documented major release intentionally changes them.
- Keep calculations integer-safe in rials.
- Escape output, sanitize shortcode attributes, and follow WordPress security practices.
- Do not add analytics, tracking, remote code, advertising, or external requests.
- Keep pull requests focused; avoid unrelated formatting changes.

By submitting a contribution, you agree that it is licensed under GPL-2.0-or-later.
