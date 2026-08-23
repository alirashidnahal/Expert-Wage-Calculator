<?php
/**
 * Plugin uninstall cleanup.
 *
 * The calculator page is intentionally preserved because it may contain user content.
 *
 * @package Expert_Wage_Calculator
 */

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('ik_expert_wage_page_id');
