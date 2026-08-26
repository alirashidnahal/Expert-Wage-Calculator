<?php
/**
 * Plugin uninstall cleanup.
 *
 * The calculator page is intentionally preserved because it may contain user content.
 *
 * @package Tarifexa
 */

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('tarifexa_page_id');
