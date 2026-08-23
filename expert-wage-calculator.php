<?php
/**
 * Plugin Name: Expert Wage Calculator
 * Plugin URI:  https://github.com/alirashidnahal/expert-wage-calculator
 * Description: Calculates Iranian official judicial expert wages for 1402 and 1405 with quick and full multilingual shortcodes.
 * Version:     1.1.0
 * Requires at least: 5.6
 * Tested up to: 7.1
 * Requires PHP: 7.4
 * Author:      علی رشیدنهال
 * Author URI:  https://alirashidnahal.com/
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: expert-wage-calculator
 * Domain Path: /languages
 */

if (! defined('ABSPATH')) {
    exit;
}

define('EXPERT_WAGE_CALCULATOR_VERSION', '1.1.0');
define('EXPERT_WAGE_CALCULATOR_FILE', __FILE__);
define('EXPERT_WAGE_CALCULATOR_DIR', plugin_dir_path(__FILE__));
define('EXPERT_WAGE_CALCULATOR_URL', plugin_dir_url(__FILE__));

require_once EXPERT_WAGE_CALCULATOR_DIR . 'includes/class-expert-wage-calculator.php';

register_activation_hook(__FILE__, array('Expert_Wage_Calculator', 'activate'));

Expert_Wage_Calculator::instance();
