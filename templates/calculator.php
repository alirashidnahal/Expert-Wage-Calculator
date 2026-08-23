<?php
/**
 * Calculator shortcode template.
 *
 * @var string $mode
 * @var string $calculator_id
 * @var string $full_page_url
 * @var array  $extra_classes
 *
 * @package Expert_Wage_Calculator
 */

if (! defined('ABSPATH')) {
    exit;
}

$is_quick = 'quick' === $mode;
$heading_id = $calculator_id . '-heading';
$root_classes = array_merge(
    array('ik-wage-calculator', $is_quick ? 'is-quick' : 'is-full'),
    $extra_classes
);
?>
<div id="<?php echo esc_attr($calculator_id); ?>"
     class="<?php echo esc_attr(implode(' ', $root_classes)); ?>"
     data-ik-wage
     data-mode="<?php echo esc_attr($mode); ?>"
     dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>"
     aria-labelledby="<?php echo esc_attr($heading_id); ?>">
    <div class="ik-wage-intro">
        <?php if ($is_quick) : ?>
            <h3 id="<?php echo esc_attr($heading_id); ?>"><?php esc_html_e('Official Expert Valuation Wage', 'expert-wage-calculator'); ?></h3>
            <p><?php esc_html_e('Enter the amount in rials. Tariff bands, the statutory cap, and the same-field panel reduction are applied for the selected year.', 'expert-wage-calculator'); ?></p>
        <?php else : ?>
            <h2 id="<?php echo esc_attr($heading_id); ?>"><?php esc_html_e('Official Expert Wage Calculator', 'expert-wage-calculator'); ?></h2>
            <p><?php esc_html_e('Select an expert field or subject to display the inputs required by its tariff article. Calculate each independent subject separately.', 'expert-wage-calculator'); ?></p>
        <?php endif; ?>
    </div>

    <form data-role="form" class="ik-wage-form" novalidate>
        <div class="ik-wage-grid">
            <div class="ik-wage-field ik-wage-field-half">
                <label for="<?php echo esc_attr($calculator_id); ?>-year"><?php esc_html_e('Tariff year *', 'expert-wage-calculator'); ?></label>
                <select id="<?php echo esc_attr($calculator_id); ?>-year" data-role="year" class="ik-wage-control">
                    <option value="1405"><?php esc_html_e('1405 tariff', 'expert-wage-calculator'); ?></option>
                    <option value="1402"><?php esc_html_e('1402 tariff until the 1405 tariff took effect', 'expert-wage-calculator'); ?></option>
                </select>
                <small data-role="effective" class="ik-wage-help"></small>
            </div>

            <?php if (! $is_quick) : ?>
                <div class="ik-wage-field ik-wage-field-half ik-wage-search-field">
                    <label for="<?php echo esc_attr($calculator_id); ?>-search"><?php esc_html_e('Quick subject search', 'expert-wage-calculator'); ?></label>
                    <input id="<?php echo esc_attr($calculator_id); ?>-search"
                           data-role="topic-search"
                           class="ik-wage-control"
                           type="search"
                           autocomplete="off"
                           placeholder="<?php echo esc_attr__('For example: rent, surveying, or Article 39', 'expert-wage-calculator'); ?>"
                           aria-controls="<?php echo esc_attr($calculator_id); ?>-search-results">
                    <div id="<?php echo esc_attr($calculator_id); ?>-search-results"
                         data-role="search-results"
                         class="ik-wage-search-results"
                         role="listbox"
                         hidden></div>
                </div>

                <div class="ik-wage-field ik-wage-field-half">
                    <label for="<?php echo esc_attr($calculator_id); ?>-category"><?php esc_html_e('Expert group *', 'expert-wage-calculator'); ?></label>
                    <select id="<?php echo esc_attr($calculator_id); ?>-category" data-role="category" class="ik-wage-control"></select>
                </div>

                <div class="ik-wage-field ik-wage-field-full">
                    <label for="<?php echo esc_attr($calculator_id); ?>-topic"><?php esc_html_e('Expert subject *', 'expert-wage-calculator'); ?></label>
                    <select id="<?php echo esc_attr($calculator_id); ?>-topic" data-role="topic" class="ik-wage-control"></select>
                </div>
            <?php endif; ?>
        </div>

        <div data-role="fields" class="ik-wage-grid ik-wage-dynamic-fields"></div>

        <?php if (! $is_quick) : ?>
            <fieldset class="ik-wage-options">
                <legend><?php esc_html_e('Statutory additional fees', 'expert-wage-calculator'); ?></legend>
                <div class="ik-wage-grid">
                    <div class="ik-wage-field ik-wage-field-half">
                        <label for="<?php echo esc_attr($calculator_id); ?>-inside"><?php esc_html_e('Mission inside the province', 'expert-wage-calculator'); ?></label>
                        <div class="ik-wage-input-wrap">
                            <input id="<?php echo esc_attr($calculator_id); ?>-inside" data-role="travel-inside" class="ik-wage-control" type="text" inputmode="numeric" value="0">
                            <span class="ik-wage-unit"><?php esc_html_e('day', 'expert-wage-calculator'); ?></span>
                        </div>
                    </div>
                    <div class="ik-wage-field ik-wage-field-half">
                        <label for="<?php echo esc_attr($calculator_id); ?>-outside"><?php esc_html_e('Mission outside the province', 'expert-wage-calculator'); ?></label>
                        <div class="ik-wage-input-wrap">
                            <input id="<?php echo esc_attr($calculator_id); ?>-outside" data-role="travel-outside" class="ik-wage-control" type="text" inputmode="numeric" value="0">
                            <span class="ik-wage-unit"><?php esc_html_e('day', 'expert-wage-calculator'); ?></span>
                        </div>
                    </div>
                </div>
                <p class="ik-wage-help"><?php esc_html_e('Transportation, accommodation, meals, laboratory work, translation, and equipment rental are not included in this total.', 'expert-wage-calculator'); ?></p>
            </fieldset>
        <?php endif; ?>

        <fieldset class="ik-wage-options ik-wage-panel-options">
            <legend><?php esc_html_e('Expert panel', 'expert-wage-calculator'); ?></legend>
            <label class="ik-wage-checkbox">
                <input type="checkbox" data-role="panel-checkbox">
                <span><?php esc_html_e('The subject is handled by multiple official experts in the same field.', 'expert-wage-calculator'); ?></span>
            </label>
            <div data-role="panel-size-wrap" class="ik-wage-field ik-wage-panel-size" hidden>
                <label for="<?php echo esc_attr($calculator_id); ?>-panel-size"><?php esc_html_e('Number of panel members', 'expert-wage-calculator'); ?></label>
                <div class="ik-wage-input-wrap">
                    <input id="<?php echo esc_attr($calculator_id); ?>-panel-size" data-role="panel-size" class="ik-wage-control" type="text" inputmode="numeric" value="3">
                    <span class="ik-wage-unit"><?php esc_html_e('experts', 'expert-wage-calculator'); ?></span>
                </div>
            </div>
        </fieldset>

        <div data-role="error" class="ik-wage-error" role="alert" tabindex="-1" hidden></div>

        <div class="ik-wage-actions">
            <button type="submit" class="ik-wage-button ik-wage-button-primary"><?php esc_html_e('Calculate wage', 'expert-wage-calculator'); ?></button>
            <?php if ($is_quick) : ?>
                <a class="ik-wage-button ik-wage-button-secondary" href="<?php echo esc_url($full_page_url); ?>"><?php esc_html_e('Full calculator for all fields', 'expert-wage-calculator'); ?></a>
            <?php endif; ?>
        </div>
    </form>

    <section data-role="result" class="ik-wage-result" aria-live="polite" tabindex="-1" hidden>
        <div data-role="result-status" class="ik-wage-status"></div>
        <div data-role="result-rows" class="ik-wage-result-rows"></div>
        <div class="ik-wage-result-source">
            <span><?php esc_html_e('Calculation basis:', 'expert-wage-calculator'); ?></span>
            <strong data-role="result-refs"></strong>
        </div>
        <ul data-role="result-notes" class="ik-wage-result-notes" hidden></ul>
    </section>

    <p class="ik-wage-disclaimer"><?php esc_html_e('This result is only a tariff estimate and does not replace the final wage determined by the judicial authority, association, or center.', 'expert-wage-calculator'); ?></p>
</div>
