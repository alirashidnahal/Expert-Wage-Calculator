=== Expert Wage Calculator ===
Contributors: alirashidnahal
Tags: expert wage, official expert, tariff, valuation, calculator
Requires at least: 5.6
Tested up to: 7.1
Stable tag: 1.1.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Calculate Iranian official judicial expert wages for 1402 and 1405 with quick and full multilingual shortcodes.

== Description ==

Expert Wage Calculator provides a standalone, versioned calculation engine for official expert wages.

Features include:

* Quick general valuation calculator.
* Full calculator organized by expert group, subject, and tariff article.
* Tariff catalogs for 1402 and 1405.
* Mission allowances, same-field expert panels, statutory caps, modifiers, bands, and non-final estimates.
* Persian, Arabic, and Latin numeric input with live thousands grouping.
* Accessible, responsive RTL and LTR interfaces.
* WordPress-standard PHP and JavaScript internationalization.
* No dependency on Bootstrap or the active theme.

Developed by [Ali Rashidnahal](https://alirashidnahal.com/). Source and developer profile: [GitHub](https://github.com/alirashidnahal).

== Privacy ==

This plugin does not collect, store, transmit, or track personal data. It does not contact external services. All tariff calculations run locally in the visitor's browser.

== Source and Support ==

The complete human-readable source, tests, translation tools, and release documentation are available on [GitHub](https://github.com/alirashidnahal/expert-wage-calculator). For support, use the WordPress.org support forum after publication or open a GitHub issue for reproducible software defects.

== Installation ==

1. Upload the `expert-wage-calculator` directory to `/wp-content/plugins/`, or install its ZIP package from the WordPress Plugins screen.
2. Activate **Expert Wage Calculator**.
3. The plugin creates the full calculator page or migrates an existing page that uses the supported calculator slug.
4. Place either shortcode in a page, post, widget, or template.

== Shortcodes ==

Quick general valuation calculator:

`[ik_expert_wage_quick]`

Full calculator for all fields:

`[ik_expert_wage_calculator]`

Optional custom CSS class:

`[ik_expert_wage_quick class="my-custom-class"]`

== Frequently Asked Questions ==

= Does the estimate replace the wage determined by a judicial authority? =

No. The result is a tariff estimate. The judicial authority, association, or center determines the final wage.

= Does the plugin depend on a theme or Bootstrap? =

No. All required PHP, JavaScript, and CSS assets are included in the plugin.

= Which languages are included? =

The source language is English. Complete Persian (`fa_IR`) and English (`en_US`) translation catalogs are included.

== Changelog ==

= 1.1.0 =

* Renamed the plugin to Expert Wage Calculator.
* Added complete WordPress-standard PHP and JavaScript internationalization.
* Added detailed Persian and English translation catalogs.
* Added author metadata for Ali Rashidnahal.

= 1.0.0 =

* Initial standalone release with 1402 and 1405 tariff catalogs.
