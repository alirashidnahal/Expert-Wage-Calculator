'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const pluginDir = path.resolve(__dirname, '..');
const i18nSource = fs.readFileSync(path.join(pluginDir, 'assets/js/tarifexa-i18n.js'), 'utf8');
const engineSource = fs.readFileSync(path.join(pluginDir, 'assets/js/tarifexa-engine.js'), 'utf8');

function sprintf(template, ...values) {
    let index = 0;
    return template.replace(/%\d*\$?[sd]/g, () => String(values[index++]));
}

function createRuntime(translations) {
    const context = {
        wp: {
            i18n: {
                __: (message) => translations[message] || message,
                sprintf
            }
        }
    };
    context.globalThis = context;
    vm.runInNewContext(i18nSource, context, { filename: 'tarifexa-i18n.js' });
    vm.runInNewContext(engineSource, context, { filename: 'tarifexa-engine.js' });
    return context;
}

function localeMessages(locale) {
    const filename = fs.readdirSync(path.join(pluginDir, 'languages')).find((file) => (
        file.startsWith(`tarifexa-${locale}-`) && file.endsWith('.json')
    ));
    assert.ok(filename, `${locale} JavaScript translation file exists`);
    const json = JSON.parse(fs.readFileSync(path.join(pluginDir, 'languages', filename), 'utf8'));
    const messages = json.locale_data.messages;
    return Object.fromEntries(Object.entries(messages).filter(([id]) => id).map(([id, value]) => [id, value[0]]));
}

test('English is the source language for the JavaScript catalog and UI', () => {
    const runtime = createRuntime({});
    const catalog = runtime.Tarifexa.getCatalog('1405');
    assert.equal(catalog.categories[0].label, 'General and valuation');
    assert.equal(catalog.topics[0].label, 'Valuation in all fields');
    assert.equal(runtime.TarifexaI18n.ui.baseFee, 'Base wage for one expert');
});

test('The complete Persian JavaScript catalog is loadable', () => {
    const translations = localeMessages('fa_IR');
    const runtime = createRuntime(translations);
    const catalog = runtime.Tarifexa.getCatalog('1405');
    assert.equal(catalog.categories[0].label, 'عمومی و ارزیابی');
    assert.equal(catalog.topics[0].label, 'ارزیابی کلیه رشته‌ها');
    assert.equal(runtime.TarifexaI18n.ui.baseFee, 'دستمزد پایه تک‌نفره');
    assert.ok(Object.keys(translations).length > 340);
});

test('POT, PO, MO, and JavaScript translation files are included for both locales', () => {
    const required = [
        'tarifexa.pot',
        'tarifexa-en_US.po',
        'tarifexa-en_US.mo',
        'tarifexa-fa_IR.po',
        'tarifexa-fa_IR.mo'
    ];
    required.forEach((file) => assert.ok(fs.statSync(path.join(pluginDir, 'languages', file)).size > 0, file));
    assert.ok(Object.keys(localeMessages('en_US')).length > 340);
    assert.ok(Object.keys(localeMessages('fa_IR')).length > 340);
});
