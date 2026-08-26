'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../assets/js/tarifexa-engine.js');

function fee(year, value, options) {
    return engine.calculate(year, 'general_valuation', { value }, options || {}).baseFee;
}

test('نمایش مبلغ فقط از جداکننده هزارگان فارسی استفاده می‌کند', () => {
    const formatted = engine.formatRial('65774318541');
    assert.equal(formatted, '65\u066C774\u066C318\u066C541');
    assert.equal(Array.from(formatted).filter((character) => character === '\u066C').length, 3);
    assert.equal(formatted.includes("'"), false);
});

test('ماده ۱۱ تعرفه ۱۴۰۵ در مرزهای اصلی درست محاسبه می‌شود', () => {
    const cases = [
        ['1', '20000000'],
        ['500000000', '20000000'],
        ['1000000000', '22250000'],
        ['5000000000', '38250000'],
        ['30000000000', '88250000'],
        ['150000000000', '232250000'],
        ['500000000000', '547250000'],
        ['1000000000000', '702250000'],
        ['2000000000000', '932250000'],
        ['4000000000000', '1302250000'],
        ['10000000000000', '1350000000']
    ];
    cases.forEach(([value, expected]) => assert.equal(fee('1405', value), expected, value));
});

test('ماده ۱۱ اصلاحی ۱۴۰۲ با محاسبه قبلی سایت تطبیق دارد', () => {
    const cases = [
        ['1', '6000000'],
        ['250000000', '6000000'],
        ['1000000000', '9375000'],
        ['5000000000', '21375000'],
        ['30000000000', '58875000'],
        ['150000000000', '166875000'],
        ['500000000000', '411875000'],
        ['1000000000000', '561875000'],
        ['2000000000000', '781875000'],
        ['4000000000000', '1141875000'],
        ['10000000000000', '1180000000']
    ];
    cases.forEach(([value, expected]) => assert.equal(fee('1402', value), expected, value));
});

test('کسر هیئت پیش از سقف هر کارشناس اعمال و جمع هیئت جدا می‌شود', () => {
    const result = engine.calculate('1405', 'general_valuation', { value: '10000000000000' }, { panelSize: 3 });
    assert.equal(result.baseFee, '1350000000');
    assert.equal(result.perExpertFee, '1350000000');
    assert.equal(result.panelTotal, '4050000000');
    assert.equal(result.panelSize, '3');
});

test('فوق‌العاده مأموریت برای هر عضو هیئت محاسبه می‌شود', () => {
    const result = engine.calculate('1405', 'general_valuation', { value: '500000000' }, {
        panelSize: 3,
        travelInsideDays: 2,
        travelOutsideDays: 1
    });
    assert.equal(result.missionFee, '30000000');
    assert.equal(result.perExpertFee, '44000000');
    assert.equal(result.panelTotal, '132000000');
});

test('پلکان اجاره‌بها و سقف آن درست است', () => {
    const cases1405 = [
        ['100000000', '20000000'],
        ['500000000', '120000000'],
        ['1000000000', '195000000'],
        ['20000000000', '900000000']
    ];
    cases1405.forEach(([value, expected]) => {
        const result = engine.calculate('1405', 'general_rent', { value }, {});
        assert.equal(result.baseFee, expected, value);
    });
    assert.equal(engine.calculate('1402', 'general_rent', { value: '15000000' }, {}).baseFee, '6000000');
});

test('فرمول‌های مساحت، تعداد و GPS نمونه‌های مرزی را پوشش می‌دهند', () => {
    assert.equal(engine.calculate('1405', 'survey_unknown', { area: '1000' }, {}).baseFee, '30000000');
    assert.equal(engine.calculate('1405', 'survey_unknown', { area: '100000' }, {}).baseFee, '148800000');
    assert.equal(engine.calculate('1405', 'urban_partition', { count: '12' }, {}).baseFee, '91600000');
    assert.equal(engine.calculate('1405', 'agri_land', { area: '10000' }, {}).baseFee, '38000000');
    assert.equal(engine.calculate('1405', 'agri_land', { area: '11000' }, {}).baseFee, '39000000');
    assert.equal(engine.calculate('1405', 'survey_gps_multi', { count: '50' }, {}).baseFee, '175000000');
    assert.throws(() => engine.calculate('1405', 'survey_gps_multi', { count: '51' }, {}), /بیشتر از 50/);
});

test('سال‌های حسابرسی و واحدهای ساختمانی مشابه به مبلغ پایه افزوده می‌شوند', () => {
    assert.equal(engine.calculate('1405', 'financial_statements', { value: '500000000', years: '3' }, {}).baseFee, '60000000');
    assert.equal(engine.calculate('1405', 'building_map_match', { area: '1000', similarUnits: '2' }, {}).baseFee, '42000000');
    assert.equal(engine.calculate('1402', 'building_map_match', { area: '1000', similarUnits: '2' }, {}).baseFee, '24000000');
});

test('موارد توافقی مبلغ قطعی تولید نمی‌کنند', () => {
    const ranged = engine.calculate('1405', 'medical_case', {}, {});
    assert.equal(ranged.status, 'range');
    assert.equal(ranged.total, null);
    assert.deepEqual(ranged.range, { min: '20000000', max: '90000000' });

    const authority = engine.calculate('1405', 'general_evidence', {}, {});
    assert.equal(authority.status, 'authority');
    assert.equal(authority.range.min, '20000000');
    assert.equal(authority.range.max, null);
});

test('ارقام فارسی و جداکننده‌ها پذیرفته و ورودی نامعتبر رد می‌شوند', () => {
    assert.equal(fee('1405', '۵۰۰٬۰۰۰٬۰۰۰'), '20000000');
    assert.equal(fee('1405', '٥٠٠,٠٠٠,٠٠٠'), '20000000');
    assert.throws(() => fee('1405', 'پانصد میلیون'), /فقط شامل عدد/);
    assert.throws(() => fee('1405', '0'), /بزرگ‌تر از صفر/);
    assert.throws(() => fee('1405', '-1'), /فقط شامل عدد/);
});

test('تمام موضوع‌های کاتالوگ هر دو سال حداقل یک مسیر محاسبه معتبر دارند', () => {
    ['1405', '1402'].forEach((year) => {
        const catalog = engine.getCatalog(year);
        const ids = new Set();
        catalog.topics.forEach((topic) => {
            assert.equal(ids.has(topic.id), false, `${year}: شناسه تکراری ${topic.id}`);
            ids.add(topic.id);
            const values = {};
            topic.fields.forEach((field) => {
                values[field.name] = field.required === false || field.min === 0 ? '0' : String(field.min || 1);
            });
            const result = engine.calculate(year, topic.id, values, {});
            assert.ok(['exact', 'range', 'authority'].includes(result.status), `${year}: ${topic.id}`);
            assert.doesNotThrow(() => JSON.stringify(result), `${year}: خروجی ${topic.id} باید JSON-safe باشد`);
        });
        assert.ok(catalog.topics.length > 85);
    });
});
