<?php
/**
 * Calculator shortcode template.
 *
 * @var string $mode
 * @var string $calculator_id
 * @var string $full_page_url
 * @var array  $extra_classes
 *
 * @package Tarifexa
 */

if (! defined('ABSPATH')) {
    exit;
}

$tarifexa_is_quick = 'quick' === $mode;
$tarifexa_heading_id = $calculator_id . '-heading';
$tarifexa_root_classes = array_merge(
    array('ik-wage-calculator', $tarifexa_is_quick ? 'is-quick' : 'is-full'),
    $extra_classes
);
?>
<div id="<?php echo esc_attr($calculator_id); ?>"
     class="<?php echo esc_attr(implode(' ', $tarifexa_root_classes)); ?>"
     data-ik-wage
     data-mode="<?php echo esc_attr($mode); ?>"
     dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>"
     aria-labelledby="<?php echo esc_attr($tarifexa_heading_id); ?>">
    <div class="ik-wage-intro">
        <?php if ($tarifexa_is_quick) : ?>
            <h3 id="<?php echo esc_attr($tarifexa_heading_id); ?>"><?php esc_html_e('Judicial Expert Valuation Wage', 'tarifexa'); ?></h3>
            <p><?php esc_html_e('Enter the amount in rials. Tariff bands, the statutory cap, and the same-field panel reduction are applied for the selected year.', 'tarifexa'); ?></p>
        <?php else : ?>
            <h2 id="<?php echo esc_attr($tarifexa_heading_id); ?>"><?php esc_html_e('Tarifexa – Judicial Expert Wage Calculator', 'tarifexa'); ?></h2>
            <p><?php esc_html_e('Select an expert field or subject to display the inputs required by its tariff article. Calculate each independent subject separately.', 'tarifexa'); ?></p>
        <?php endif; ?>
    </div>

    <form data-role="form" class="ik-wage-form" novalidate>
        <div class="ik-wage-grid">
            <div class="ik-wage-field ik-wage-field-half">
                <label for="<?php echo esc_attr($calculator_id); ?>-year"><?php esc_html_e('Tariff year *', 'tarifexa'); ?></label>
                <select id="<?php echo esc_attr($calculator_id); ?>-year" data-role="year" class="ik-wage-control">
                    <option value="1405"><?php esc_html_e('1405 tariff', 'tarifexa'); ?></option>
                    <option value="1402"><?php esc_html_e('1402 tariff until the 1405 tariff took effect', 'tarifexa'); ?></option>
                </select>
                <small data-role="effective" class="ik-wage-help"></small>
            </div>

            <?php if (! $tarifexa_is_quick) : ?>
                <div class="ik-wage-field ik-wage-field-half ik-wage-search-field">
                    <label for="<?php echo esc_attr($calculator_id); ?>-search"><?php esc_html_e('Quick subject search', 'tarifexa'); ?></label>
                    <input id="<?php echo esc_attr($calculator_id); ?>-search"
                           data-role="topic-search"
                           class="ik-wage-control"
                           type="search"
                           autocomplete="off"
                           placeholder="<?php echo esc_attr__('For example: rent, surveying, or Article 39', 'tarifexa'); ?>"
                           aria-controls="<?php echo esc_attr($calculator_id); ?>-search-results">
                    <div id="<?php echo esc_attr($calculator_id); ?>-search-results"
                         data-role="search-results"
                         class="ik-wage-search-results"
                         role="listbox"
                         hidden></div>
                </div>

                <div class="ik-wage-field ik-wage-field-half">
                    <label for="<?php echo esc_attr($calculator_id); ?>-category"><?php esc_html_e('Expert group *', 'tarifexa'); ?></label>
                    <select id="<?php echo esc_attr($calculator_id); ?>-category" data-role="category" class="ik-wage-control"></select>
                </div>

                <div class="ik-wage-field ik-wage-field-full">
                    <label for="<?php echo esc_attr($calculator_id); ?>-topic"><?php esc_html_e('Expert subject *', 'tarifexa'); ?></label>
                    <select id="<?php echo esc_attr($calculator_id); ?>-topic" data-role="topic" class="ik-wage-control"></select>
                </div>
            <?php endif; ?>
        </div>

        <div data-role="fields" class="ik-wage-grid ik-wage-dynamic-fields"></div>

        <?php if (! $tarifexa_is_quick) : ?>
            <fieldset class="ik-wage-options">
                <legend><?php esc_html_e('Statutory additional fees', 'tarifexa'); ?></legend>
                <div class="ik-wage-grid">
                    <div class="ik-wage-field ik-wage-field-half">
                        <label for="<?php echo esc_attr($calculator_id); ?>-inside"><?php esc_html_e('Mission inside the province', 'tarifexa'); ?></label>
                        <div class="ik-wage-input-wrap">
                            <input id="<?php echo esc_attr($calculator_id); ?>-inside" data-role="travel-inside" class="ik-wage-control" type="text" inputmode="numeric" value="0">
                            <span class="ik-wage-unit"><?php esc_html_e('day', 'tarifexa'); ?></span>
                        </div>
                    </div>
                    <div class="ik-wage-field ik-wage-field-half">
                        <label for="<?php echo esc_attr($calculator_id); ?>-outside"><?php esc_html_e('Mission outside the province', 'tarifexa'); ?></label>
                        <div class="ik-wage-input-wrap">
                            <input id="<?php echo esc_attr($calculator_id); ?>-outside" data-role="travel-outside" class="ik-wage-control" type="text" inputmode="numeric" value="0">
                            <span class="ik-wage-unit"><?php esc_html_e('day', 'tarifexa'); ?></span>
                        </div>
                    </div>
                </div>
                <p class="ik-wage-help"><?php esc_html_e('Transportation, accommodation, meals, laboratory work, translation, and equipment rental are not included in this total.', 'tarifexa'); ?></p>
            </fieldset>
        <?php endif; ?>

        <fieldset class="ik-wage-options ik-wage-panel-options">
            <legend><?php esc_html_e('Expert panel', 'tarifexa'); ?></legend>
            <label class="ik-wage-checkbox">
                <input type="checkbox" data-role="panel-checkbox">
                <span><?php esc_html_e('The subject is handled by multiple official experts in the same field.', 'tarifexa'); ?></span>
            </label>
            <div data-role="panel-size-wrap" class="ik-wage-field ik-wage-panel-size" hidden>
                <label for="<?php echo esc_attr($calculator_id); ?>-panel-size"><?php esc_html_e('Number of panel members', 'tarifexa'); ?></label>
                <div class="ik-wage-input-wrap">
                    <input id="<?php echo esc_attr($calculator_id); ?>-panel-size" data-role="panel-size" class="ik-wage-control" type="text" inputmode="numeric" value="3">
                    <span class="ik-wage-unit"><?php esc_html_e('experts', 'tarifexa'); ?></span>
                </div>
            </div>
        </fieldset>

        <div data-role="error" class="ik-wage-error" role="alert" tabindex="-1" hidden></div>

        <div class="ik-wage-actions">
            <button type="submit" class="ik-wage-button ik-wage-button-primary"><?php esc_html_e('Calculate wage', 'tarifexa'); ?></button>
            <?php if ($tarifexa_is_quick) : ?>
                <a class="ik-wage-button ik-wage-button-secondary" href="<?php echo esc_url($full_page_url); ?>"><?php esc_html_e('Full calculator for all fields', 'tarifexa'); ?></a>
            <?php endif; ?>
        </div>
    </form>

    <section data-role="result" class="ik-wage-result" aria-live="polite" tabindex="-1" hidden>
        <div data-role="result-status" class="ik-wage-status"></div>
        <div data-role="result-rows" class="ik-wage-result-rows"></div>
        <div class="ik-wage-result-source">
            <span><?php esc_html_e('Calculation basis:', 'tarifexa'); ?></span>
            <strong data-role="result-refs"></strong>
        </div>
        <ul data-role="result-notes" class="ik-wage-result-notes" hidden></ul>
    </section>

    <p class="ik-wage-disclaimer"><?php esc_html_e('This result is only a tariff estimate and does not replace the final wage determined by the judicial authority, association, or center.', 'tarifexa'); ?></p>
</div>
