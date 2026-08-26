/* eslint-env node */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const pluginDir = path.resolve(__dirname, '..');
const languagesDir = path.join(pluginDir, 'languages');
const domain = 'tarifexa';
const scriptRelativePath = 'assets/js/tarifexa-i18n.js';
const scriptPath = path.join(pluginDir, scriptRelativePath);

const phpFiles = [
    'includes/class-tarifexa.php',
    'templates/calculator.php'
];

const manualFa = {
    'Tarifexa – Judicial Expert Wage Calculator': 'Tarifexa – محاسبه دستمزد کارشناس رسمی دادگستری',
    'Estimates Iranian judicial expert wages for the 1402 and 1405 tariff catalogs with quick and full multilingual shortcodes.': 'برآورد دستمزد کارشناسان رسمی دادگستری ایران برای تعرفه‌های ۱۴۰۲ و ۱۴۰۵ با شورت‌کدهای سریع و جامع چندزبانه.',
    'Open calculator': 'مشاهده ماشین‌حساب',
    'Judicial Expert Valuation Wage': 'دستمزد ارزیابی کارشناس رسمی',
    'Enter the amount in rials. Tariff bands, the statutory cap, and the same-field panel reduction are applied for the selected year.': 'مبلغ را به ریال وارد کنید. پلکان‌ها، سقف قانونی و کسر هیئت هم‌رشته بر اساس سال انتخابی اعمال می‌شود.',
    'Select an expert field or subject to display the inputs required by its tariff article. Calculate each independent subject separately.': 'رشته یا موضوع کارشناسی را انتخاب کنید تا ورودی‌های متناسب با ماده قانونی نمایش داده شوند. هر موضوع مستقل را جداگانه محاسبه کنید.',
    'Tariff year *': 'سال تعرفه *',
    'Quick subject search': 'جست‌وجوی سریع موضوع',
    'For example: rent, surveying, or Article 39': 'مثلاً اجاره‌بها، نقشه‌برداری یا ماده ۳۹',
    'Expert group *': 'گروه کارشناسی *',
    'Expert subject *': 'موضوع کارشناسی *',
    'Statutory additional fees': 'هزینه‌های افزوده قانونی',
    'Mission inside the province': 'مأموریت داخل استان',
    'Mission outside the province': 'مأموریت خارج استان',
    'day': 'روز',
    'Transportation, accommodation, meals, laboratory work, translation, and equipment rental are not included in this total.': 'هزینه وسیله رفت‌وآمد، اقامت، غذا، آزمایش، ترجمه و اجاره تجهیزات در این جمع منظور نمی‌شود.',
    'Expert panel': 'هیئت کارشناسی',
    'The subject is handled by multiple official experts in the same field.': 'موضوع توسط چند کارشناس رسمی هم‌رشته انجام می‌شود.',
    'Number of panel members': 'تعداد اعضای هیئت',
    'experts': 'نفر',
    'Calculate wage': 'محاسبه دستمزد',
    'Full calculator for all fields': 'محاسبه تخصصی همه رشته‌ها',
    'Calculation basis:': 'مبنای محاسبه:',
    'This result is only a tariff estimate and does not replace the final wage determined by the judicial authority, association, or center.': 'این خروجی صرفاً برآورد تعرفه‌ای است و جایگزین تعیین نهایی دستمزد توسط مرجع قضایی، کانون یا مرکز نیست.',
    '%s must be greater than zero.': '%s باید بزرگ‌تر از صفر باشد.',
    '%s must contain numbers only.': '%s باید فقط شامل عدد باشد.',
    'The calculation denominator is invalid.': 'مخرج محاسبه معتبر نیست.',
    '%1$s cannot be greater than %2$s.': '%1$s نمی‌تواند بیشتر از %2$s باشد.',
    '%1$s cannot be less than %2$s.': '%1$s نمی‌تواند کمتر از %2$s باشد.',
    'No calculation rule is defined for this subject.': 'قاعده محاسبه این موضوع تعریف نشده است.',
    'The selected tariff year is not supported.': 'سال تعرفه انتخاب‌شده پشتیبانی نمی‌شود.',
    'The expert subject was not found for the selected year.': 'موضوع کارشناسی برای سال انتخابی یافت نشد.',
    'The expert panel cannot contain more than 50 members.': 'تعداد اعضای هیئت نمی‌تواند بیشتر از ۵۰ نفر باشد.',
    'The expert panel must contain at least 2 members.': 'تعداد اعضای هیئت باید حداقل ۲ نفر باشد.',
    'The calculation could not be completed. Check the entered values.': 'محاسبه انجام نشد. ورودی‌ها را بررسی کنید.',
    'Not determined': 'تعیین نشده',
    'No additional numeric input is required for this subject.': 'برای این موضوع ورودی عددی دیگری لازم نیست.',
    ' (optional)': ' (اختیاری)',
    'Amount in rials': 'مبلغ به ریال',
    'No subject was found.': 'موضوعی پیدا نشد.',
    'Exact tariff estimate based on the calculation formula': 'برآورد محاسباتی قطعی بر اساس فرمول تعرفه',
    'Non-final estimate; the final amount requires authority approval': 'برآورد غیرقطعی؛ مبلغ نهایی نیازمند تأیید مرجع است',
    'Base wage for one expert': 'دستمزد پایه تک‌نفره',
    'Each expert share including mission allowance': 'سهم هر کارشناس با مأموریت',
    'Total for the %s-member panel': 'جمع کل هیئت %s نفره',
    'Mission allowance': 'فوق‌العاده مأموریت',
    'Estimated total': 'جمع قابل برآورد',
    'Documented minimum': 'حداقل قابل استناد',
    'Documented maximum': 'حداکثر قابل استناد',
    ', ': '، ',
    ' — ': ' — '
};

function evaluateScript() {
    const context = {
        wp: {
            i18n: {
                __: (message) => message,
                sprintf: (template, ...values) => {
                    let index = 0;
                    return template.replace(/%\d*\$?[sd]/g, () => String(values[index++]));
                }
            }
        }
    };
    context.globalThis = context;
    vm.runInNewContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });
    return context.TarifexaI18n;
}

function unescapeJs(value) {
    return value.replace(/\\'/g, "'").replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
}

function collectMessages(file, pattern) {
    const content = fs.readFileSync(file, 'utf8');
    const messages = [];
    let match;
    while ((match = pattern.exec(content)) !== null) {
        const line = content.slice(0, match.index).split(/\r?\n/).length;
        messages.push({ id: unescapeJs(match[1]), ref: path.relative(pluginDir, file).replace(/\\/g, '/') + ':' + line });
    }
    return messages;
}

function poEscape(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}

function poFile(locale, translations, entries, template) {
    const headers = [
        'Project-Id-Version: Tarifexa 1.2.0',
        'Report-Msgid-Bugs-To: https://github.com/alirashidnahal',
        'POT-Creation-Date: 2026-08-26 00:00+0330',
        'PO-Revision-Date: 2026-08-26 00:00+0330',
        'Last-Translator: Ali Rashidnahal <https://alirashidnahal.com/>',
        'Language-Team: ' + (locale === 'fa_IR' ? 'Persian' : 'English'),
        'Language: ' + (template ? '' : locale),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'Plural-Forms: ' + (locale === 'fa_IR' ? 'nplurals=2; plural=(n > 1);' : 'nplurals=2; plural=(n != 1);'),
        'X-Generator: Tarifexa translation builder'
    ].join('\\n') + '\\n';

    const output = [
        '# Copyright (C) 2026 Ali Rashidnahal',
        '# This file is distributed under the GPL-2.0-or-later license.',
        'msgid ""',
        'msgstr "' + poEscape(headers) + '"',
        ''
    ];

    entries.forEach((entry) => {
        if (entry.refs.size) {
            output.push('#: ' + Array.from(entry.refs).sort().join(' '));
        }
        output.push('msgid "' + poEscape(entry.id) + '"');
        const translated = template ? '' : (translations[entry.id] == null ? entry.id : translations[entry.id]);
        output.push('msgstr "' + poEscape(translated) + '"', '');
    });
    return output.join('\n');
}

function moFile(locale, translations, entries) {
    const header = [
        'Project-Id-Version: Tarifexa 1.2.0',
        'Language: ' + locale,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'Plural-Forms: ' + (locale === 'fa_IR' ? 'nplurals=2; plural=(n > 1);' : 'nplurals=2; plural=(n != 1);')
    ].join('\n') + '\n';
    const pairs = [['', header]].concat(entries.map((entry) => [entry.id, translations[entry.id] == null ? entry.id : translations[entry.id]]));
    pairs.sort((a, b) => Buffer.compare(Buffer.from(a[0]), Buffer.from(b[0])));
    const originals = pairs.map((pair) => Buffer.from(pair[0], 'utf8'));
    const translated = pairs.map((pair) => Buffer.from(pair[1], 'utf8'));
    const count = pairs.length;
    const originalTable = 28;
    const translationTable = originalTable + count * 8;
    const originalStrings = translationTable + count * 8;
    const originalSize = originals.reduce((sum, item) => sum + item.length + 1, 0);
    const translationStrings = originalStrings + originalSize;
    const totalSize = translationStrings + translated.reduce((sum, item) => sum + item.length + 1, 0);
    const output = Buffer.alloc(totalSize);
    output.writeUInt32LE(0x950412de, 0);
    output.writeUInt32LE(0, 4);
    output.writeUInt32LE(count, 8);
    output.writeUInt32LE(originalTable, 12);
    output.writeUInt32LE(translationTable, 16);
    output.writeUInt32LE(0, 20);
    output.writeUInt32LE(0, 24);
    let originalOffset = originalStrings;
    let translationOffset = translationStrings;
    originals.forEach((item, index) => {
        output.writeUInt32LE(item.length, originalTable + index * 8);
        output.writeUInt32LE(originalOffset, originalTable + index * 8 + 4);
        item.copy(output, originalOffset);
        originalOffset += item.length + 1;
    });
    translated.forEach((item, index) => {
        output.writeUInt32LE(item.length, translationTable + index * 8);
        output.writeUInt32LE(translationOffset, translationTable + index * 8 + 4);
        item.copy(output, translationOffset);
        translationOffset += item.length + 1;
    });
    return output;
}

fs.mkdirSync(languagesDir, { recursive: true });
const runtime = evaluateScript();
const fa = Object.assign({}, manualFa);
Object.keys(runtime.text).forEach((persian) => { fa[runtime.text[persian]] = persian; });

const found = [];
found.push(...collectMessages(scriptPath, /__\('((?:\\.|[^'])*)'\)/g));
phpFiles.forEach((relative) => {
    found.push(...collectMessages(path.join(pluginDir, relative), /(?:__|_e|esc_html__|esc_html_e|esc_attr__)\(\s*'((?:\\.|[^'])*)'/g));
});
found.push({ id: 'Tarifexa – Judicial Expert Wage Calculator', ref: 'tarifexa.php:3' });
found.push({ id: 'Estimates Iranian judicial expert wages for the 1402 and 1405 tariff catalogs with quick and full multilingual shortcodes.', ref: 'tarifexa.php:5' });

const byId = new Map();
found.forEach((item) => {
    if (!byId.has(item.id)) { byId.set(item.id, { id: item.id, refs: new Set() }); }
    byId.get(item.id).refs.add(item.ref);
});
const entries = Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id, 'en'));
const en = Object.fromEntries(entries.map((entry) => [entry.id, entry.id]));

const missingFa = entries.filter((entry) => fa[entry.id] == null).map((entry) => entry.id);
if (missingFa.length) {
    throw new Error('Missing Persian translations:\n' + missingFa.join('\n'));
}

fs.readdirSync(languagesDir).forEach((file) => {
    if (file.startsWith('expert-wage-calculator')) {
        fs.unlinkSync(path.join(languagesDir, file));
    }
});

fs.writeFileSync(path.join(languagesDir, domain + '.pot'), poFile('en_US', {}, entries, true), 'utf8');
fs.writeFileSync(path.join(languagesDir, domain + '-en_US.po'), poFile('en_US', en, entries, false), 'utf8');
fs.writeFileSync(path.join(languagesDir, domain + '-fa_IR.po'), poFile('fa_IR', fa, entries, false), 'utf8');
fs.writeFileSync(path.join(languagesDir, domain + '-en_US.mo'), moFile('en_US', en, entries));
fs.writeFileSync(path.join(languagesDir, domain + '-fa_IR.mo'), moFile('fa_IR', fa, entries));

const scriptMessages = collectMessages(scriptPath, /__\('((?:\\.|[^'])*)'\)/g).map((item) => item.id);
const uniqueScriptMessages = Array.from(new Set(scriptMessages)).sort((a, b) => a.localeCompare(b, 'en'));
const hash = crypto.createHash('md5').update(scriptRelativePath.replace(/\\/g, '/')).digest('hex');
[
    ['en_US', en, 'nplurals=2; plural=(n != 1);'],
    ['fa_IR', fa, 'nplurals=2; plural=(n > 1);']
].forEach(([locale, translations, pluralForms]) => {
    const messages = {
        '': {
            domain: domain,
            lang: locale,
            'plural-forms': pluralForms
        }
    };
    uniqueScriptMessages.forEach((id) => { messages[id] = [translations[id]]; });
    const json = {
        'translation-revision-date': '2026-08-26 00:00+0330',
        generator: 'Tarifexa translation builder',
        source: scriptRelativePath,
        domain: 'messages',
        locale_data: { messages: messages }
    };
    fs.writeFileSync(path.join(languagesDir, domain + '-' + locale + '-' + hash + '.json'), JSON.stringify(json, null, 2) + '\n', 'utf8');
});

console.log('Generated ' + entries.length + ' translations and ' + uniqueScriptMessages.length + ' JavaScript translations.');
