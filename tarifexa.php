<?php
/**

 * Domain Path: /languages
 */

if (! defined('ABSPATH')) {
    exit;
}

const TARIFEXA_VERSION = '1.2.0';
const TARIFEXA_FILE = __FILE__;
define('TARIFEXA_DIR', plugin_dir_path(__FILE__));
define('TARIFEXA_URL', plugin_dir_url(__FILE__));

require_once TARIFEXA_DIR . 'includes/class-tarifexa.php';

register_activation_hook(__FILE__, array('Tarifexa', 'activate'));

Tarifexa::instance();
