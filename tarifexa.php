<?php
/**
 * Plugin Name: Tarifexa – Judicial Expert Wage Calculator
 * Plugin URI:  https://github.com/alirashidnahal/expert-wage-calculator
 * Description: Estimates Iranian judicial expert wages for the 1402 and 1405 tariff catalogs with quick and full multilingual shortcodes.
 * Version:     1.2.0
 * Requires at least: 5.6
 * Tested up to: 7.1
 * Requires PHP: 7.4
 * Author:      Ali Rashidnahal
 * Author URI:  https://alirashidnahal.com/
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: tarifexa
 * Domain Path: /languages
 */

if (! defined('ABSPATH')) {
    exit;
}

define('TARIFEXA_VERSION', '1.2.0');
define('TARIFEXA_FILE', __FILE__);
define('TARIFEXA_DIR', plugin_dir_path(__FILE__));
define('TARIFEXA_URL', plugin_dir_url(__FILE__));

require_once TARIFEXA_DIR . 'includes/class-tarifexa.php';

register_activation_hook(__FILE__, array('Tarifexa', 'activate'));

Tarifexa::instance();
