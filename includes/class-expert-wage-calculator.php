<?php
/**
 * Main plugin class.
 *
 * @package Expert_Wage_Calculator
 */

if (! defined('ABSPATH')) {
    exit;
}

final class Expert_Wage_Calculator
{
    const FULL_SHORTCODE = 'ik_expert_wage_calculator';
    const QUICK_SHORTCODE = 'ik_expert_wage_quick';
    const PAGE_OPTION = 'ik_expert_wage_page_id';
    const PAGE_SLUG = 'محاسبه-دستمزد-کارشناس-رسمی';

    /** @var Expert_Wage_Calculator|null */
    private static $instance = null;

    /** @var int */
    private $instance_count = 0;

    /**
     * Return the plugin singleton.
     *
     * @return Expert_Wage_Calculator
     */
    public static function instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct()
    {
        add_action('init', array($this, 'load_textdomain'));
        add_action('init', array($this, 'register_shortcodes'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'), 5);
        add_action('wp_enqueue_scripts', array($this, 'maybe_enqueue_assets'), 20);
        add_filter('plugin_action_links_' . plugin_basename(EXPERT_WAGE_CALCULATOR_FILE), array($this, 'plugin_action_links'));
    }

    /**
     * Create or migrate the public calculator page.
     *
     * @return void
     */
    public static function activate()
    {
        load_plugin_textdomain(
            'expert-wage-calculator',
            false,
            dirname(plugin_basename(EXPERT_WAGE_CALCULATOR_FILE)) . '/languages'
        );

        $page = get_page_by_path(self::PAGE_SLUG, OBJECT, 'page');
        $shortcode = '[' . self::FULL_SHORTCODE . ']';
        $page_title = __('Official Expert Wage Calculator', 'expert-wage-calculator');

        if ($page instanceof WP_Post) {
            $page_id = (int) $page->ID;
            $old_template = get_page_template_slug($page_id);
            $content = trim((string) $page->post_content);

            if ('' === $content || 'page-expert-wage.php' === $old_template) {
                wp_update_post(
                    array(
                        'ID' => $page_id,
                        'post_content' => $shortcode,
                    )
                );
            }
        } else {
            $page_id = wp_insert_post(
                array(
                    'post_type' => 'page',
                    'post_status' => 'publish',
                    'post_title' => $page_title,
                    'post_name' => self::PAGE_SLUG,
                    'post_content' => $shortcode,
                ),
                true
            );

            if (is_wp_error($page_id)) {
                return;
            }
        }

        $page_id = (int) $page_id;
        update_post_meta($page_id, '_wp_page_template', 'default');
        if ('' === trim((string) get_post_meta($page_id, 'h1', true))) {
            update_post_meta($page_id, 'h1', $page_title);
        }
        update_option(self::PAGE_OPTION, $page_id, false);
        flush_rewrite_rules();
    }

    /**
     * Load translations.
     *
     * @return void
     */
    public function load_textdomain()
    {
        load_plugin_textdomain(
            'expert-wage-calculator',
            false,
            dirname(plugin_basename(EXPERT_WAGE_CALCULATOR_FILE)) . '/languages'
        );
    }

    /**
     * Register public shortcodes.
     *
     * @return void
     */
    public function register_shortcodes()
    {
        add_shortcode(self::FULL_SHORTCODE, array($this, 'render_full_shortcode'));
        add_shortcode(self::QUICK_SHORTCODE, array($this, 'render_quick_shortcode'));
    }

    /**
     * Register versioned assets.
     *
     * @return void
     */
    public function register_assets()
    {
        $css_path = EXPERT_WAGE_CALCULATOR_DIR . 'assets/css/expert-wage.css';
        $i18n_path = EXPERT_WAGE_CALCULATOR_DIR . 'assets/js/expert-wage-i18n.js';
        $engine_path = EXPERT_WAGE_CALCULATOR_DIR . 'assets/js/expert-wage-engine.js';
        $ui_path = EXPERT_WAGE_CALCULATOR_DIR . 'assets/js/expert-wage-ui.js';

        wp_register_style(
            'expert-wage-calculator',
            EXPERT_WAGE_CALCULATOR_URL . 'assets/css/expert-wage.css',
            array(),
            is_file($css_path) ? (string) filemtime($css_path) : EXPERT_WAGE_CALCULATOR_VERSION
        );
        wp_register_script(
            'expert-wage-calculator-i18n',
            EXPERT_WAGE_CALCULATOR_URL . 'assets/js/expert-wage-i18n.js',
            array('wp-i18n'),
            is_file($i18n_path) ? (string) filemtime($i18n_path) : EXPERT_WAGE_CALCULATOR_VERSION,
            true
        );
        wp_register_script(
            'expert-wage-calculator-engine',
            EXPERT_WAGE_CALCULATOR_URL . 'assets/js/expert-wage-engine.js',
            array('expert-wage-calculator-i18n'),
            is_file($engine_path) ? (string) filemtime($engine_path) : EXPERT_WAGE_CALCULATOR_VERSION,
            true
        );
        wp_register_script(
            'expert-wage-calculator-ui',
            EXPERT_WAGE_CALCULATOR_URL . 'assets/js/expert-wage-ui.js',
            array('expert-wage-calculator-engine'),
            is_file($ui_path) ? (string) filemtime($ui_path) : EXPERT_WAGE_CALCULATOR_VERSION,
            true
        );

        wp_set_script_translations(
            'expert-wage-calculator-i18n',
            'expert-wage-calculator',
            EXPERT_WAGE_CALCULATOR_DIR . 'languages'
        );
    }

    /**
     * Enqueue early when a shortcode exists in the singular post content.
     *
     * @return void
     */
    public function maybe_enqueue_assets()
    {
        if (! is_singular()) {
            return;
        }

        $post = get_post();
        if (! $post instanceof WP_Post) {
            return;
        }

        if (
            has_shortcode($post->post_content, self::FULL_SHORTCODE)
            || has_shortcode($post->post_content, self::QUICK_SHORTCODE)
        ) {
            $this->enqueue_assets();
        }
    }

    /**
     * Enqueue all frontend assets. This also supports shortcodes rendered by widgets or templates.
     *
     * @return void
     */
    private function enqueue_assets()
    {
        if (! wp_style_is('expert-wage-calculator', 'registered')) {
            $this->register_assets();
        }

        wp_enqueue_style('expert-wage-calculator');
        wp_enqueue_script('expert-wage-calculator-i18n');
        wp_enqueue_script('expert-wage-calculator-engine');
        wp_enqueue_script('expert-wage-calculator-ui');
    }

    /**
     * Full calculator shortcode callback.
     *
     * @param array|string $atts Shortcode attributes.
     * @return string
     */
    public function render_full_shortcode($atts = array())
    {
        return $this->render_calculator('full', $atts);
    }

    /**
     * Quick calculator shortcode callback.
     *
     * @param array|string $atts Shortcode attributes.
     * @return string
     */
    public function render_quick_shortcode($atts = array())
    {
        return $this->render_calculator('quick', $atts);
    }

    /**
     * Render a calculator instance.
     *
     * @param string       $mode Calculator mode.
     * @param array|string $atts Shortcode attributes.
     * @return string
     */
    private function render_calculator($mode, $atts)
    {
        $this->enqueue_assets();
        $atts = shortcode_atts(
            array(
                'class' => '',
            ),
            is_array($atts) ? $atts : array(),
            'quick' === $mode ? self::QUICK_SHORTCODE : self::FULL_SHORTCODE
        );

        $this->instance_count++;
        $calculator_id = sprintf('ik-wage-%s-%d', $mode, $this->instance_count);
        $extra_classes = array_filter(
            array_map(
                'sanitize_html_class',
                preg_split('/\s+/', trim((string) $atts['class']))
            )
        );
        $full_page_url = $this->get_full_page_url();

        ob_start();
        include EXPERT_WAGE_CALCULATOR_DIR . 'templates/calculator.php';
        return (string) ob_get_clean();
    }

    /**
     * Get the canonical full calculator page URL.
     *
     * @return string
     */
    private function get_full_page_url()
    {
        $page_id = (int) get_option(self::PAGE_OPTION, 0);
        if ($page_id > 0 && 'publish' === get_post_status($page_id)) {
            return get_permalink($page_id);
        }

        return home_url('/' . self::PAGE_SLUG . '/');
    }

    /**
     * Add a direct link to the calculator page on the Plugins screen.
     *
     * @param array $links Existing links.
     * @return array
     */
    public function plugin_action_links($links)
    {
        $page_link = sprintf(
            '<a href="%s">%s</a>',
            esc_url($this->get_full_page_url()),
            esc_html__('Open calculator', 'expert-wage-calculator')
        );
        array_unshift($links, $page_link);
        return $links;
    }
}
