(function (root, factory) {
    'use strict';

    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.IKExpertWage = api;
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const RATE_SCALE = 1000000n;
    const PANEL_RATE = 700000n;
    const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
    const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
    const THOUSANDS_SEPARATOR = '\u066C';
    const I18N = typeof globalThis !== 'undefined' && globalThis.ExpertWageCalculatorI18n
        ? globalThis.ExpertWageCalculatorI18n
        : null;

    function translateText(value) {
        return I18N && typeof I18N.translate === 'function' ? I18N.translate(value) : value;
    }

    function formatMessage(key, fallback) {
        const values = Array.prototype.slice.call(arguments, 2);
        const template = I18N && I18N.messages && I18N.messages[key] ? I18N.messages[key] : fallback;
        if (I18N && typeof I18N.sprintf === 'function') {
            return I18N.sprintf.apply(null, [template].concat(values));
        }
        let index = 0;
        return template.replace(/%\d*\$?[sd]/g, function () { return String(values[index++]); });
    }

    function normalizeDigits(value) {
        return String(value == null ? '' : value)
            .replace(/[۰-۹]/g, function (digit) { return String(PERSIAN_DIGITS.indexOf(digit)); })
            .replace(/[٠-٩]/g, function (digit) { return String(ARABIC_DIGITS.indexOf(digit)); })
            .replace(/[٬،,\s]/g, '')
            .trim();
    }

    function parseInteger(value, label, allowZero) {
        if (typeof value === 'bigint') {
            if (value < 0n || (!allowZero && value === 0n)) {
                throw new Error(formatMessage('valueRequired', '%s باید بزرگ‌تر از صفر باشد.', translateText(label || 'مقدار')));
            }
            return value;
        }

        const normalized = normalizeDigits(value);
        if (!/^\d+$/.test(normalized)) {
            throw new Error(formatMessage('numericOnly', '%s باید فقط شامل عدد باشد.', translateText(label || 'مقدار')));
        }

        const parsed = BigInt(normalized);
        if (parsed < 0n || (!allowZero && parsed === 0n)) {
            throw new Error(formatMessage('valueRequired', '%s باید بزرگ‌تر از صفر باشد.', translateText(label || 'مقدار')));
        }
        return parsed;
    }

    function roundRatio(numerator, denominator) {
        if (denominator <= 0n) {
            throw new Error(formatMessage('invalidDenominator', 'مخرج محاسبه معتبر نیست.'));
        }
        return (numerator + (denominator / 2n)) / denominator;
    }

    function applyRate(amount, ratePpm) {
        return roundRatio(amount * BigInt(ratePpm), RATE_SCALE);
    }

    function minBigInt(a, b) {
        if (a == null) { return b; }
        if (b == null) { return a; }
        return a < b ? a : b;
    }

    function formatRial(value) {
        if (value == null || value === '') { return '—'; }
        const number = typeof value === 'bigint' ? value : BigInt(String(value));
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
    }

    function moneyField(name, label) {
        return { name: name || 'value', label: label || 'ارزش موضوع', unit: 'ریال', type: 'money', required: true };
    }

    function numberField(name, label, unit, options) {
        return Object.assign({ name: name, label: label, unit: unit || '', type: 'number', required: true, min: 1 }, options || {});
    }

    function topic(id, category, label, article, rule, fields, options) {
        return Object.assign({
            id: id,
            category: category,
            label: label,
            articleRefs: [article],
            rule: rule,
            fields: fields || [],
            notes: []
        }, options || {});
    }

    function fixed(amount, multiplierField) {
        return { type: 'fixed', amount: String(amount), multiplierField: multiplierField || null };
    }

    function range(min, max) {
        return { type: 'range', min: min == null ? null : String(min), max: max == null ? null : String(max) };
    }

    function authority(min, max) {
        return { type: 'authority', min: min == null ? null : String(min), max: max == null ? null : String(max) };
    }

    function valuation(modifierPpm, multiplierField, similarField, similarRatePpm) {
        return {
            type: 'valuation',
            field: 'value',
            modifierPpm: modifierPpm || 1000000,
            multiplierField: multiplierField || null,
            similarField: similarField || null,
            similarRatePpm: similarRatePpm || null
        };
    }

    const CATEGORIES = [
        { id: 'general', label: 'عمومی و ارزیابی' },
        { id: 'water_mines', label: 'مهندسی آب و معادن' },
        { id: 'movable', label: 'اموال منقول' },
        { id: 'medical', label: 'امور پزشکی و غذایی' },
        { id: 'financial', label: 'امور مالی' },
        { id: 'vehicles', label: 'امور وسایل نقلیه' },
        { id: 'construction', label: 'راه، ساختمان، نقشه‌برداری و امور ثبتی' },
        { id: 'industry', label: 'صنعت و فن' },
        { id: 'arts', label: 'فنون هنری' },
        { id: 'agriculture', label: 'کشاورزی و منابع طبیعی' },
        { id: 'administrative', label: 'خدمات اداری و عمومی' },
        { id: 'safety', label: 'ایمنی و حوادث' },
        { id: 'bio', label: 'بیو و نانوتکنولوژی' }
    ];

    const YEAR_CONFIGS = {
        '1405': {
            label: 'تعرفه ۱۴۰۵',
            effectiveLabel: 'لازم‌الاجرا از تاریخ ابلاغ ۱۴۰۵/۰۵/۲۰',
            perExpertCap: 1350000000n,
            missionInside: 7500000n,
            missionOutside: 15000000n,
            valuationBands: [
                { upTo: 500000000n, flat: 20000000n },
                { upTo: 1000000000n, ratePpm: 4500 },
                { upTo: 5000000000n, ratePpm: 4000 },
                { upTo: 30000000000n, ratePpm: 2000 },
                { upTo: 150000000000n, ratePpm: 1200 },
                { upTo: 500000000000n, ratePpm: 900 },
                { upTo: 1000000000000n, ratePpm: 310 },
                { upTo: 2000000000000n, ratePpm: 230 },
                { upTo: 4000000000000n, ratePpm: 185 },
                { upTo: null, ratePpm: 150 }
            ],
            rentBands: [
                { upTo: 100000000n, flat: 20000000n },
                { upTo: 500000000n, ratePpm: 250000 },
                { upTo: 1000000000n, ratePpm: 150000 },
                { upTo: null, ratePpm: 60000 }
            ],
            rentCap: 900000000n
        },
        '1402': {
            label: 'تعرفه ۱۴۰۲ تا پیش از ابلاغ ۱۴۰۵',
            effectiveLabel: 'اصلاحیه مصوب ۱۴۰۲/۰۸/۲۰ بر تعرفه پایه ۱۳۹۸',
            perExpertCap: 1180000000n,
            missionInside: 3000000n,
            missionOutside: 6000000n,
            valuationBands: [
                { upTo: 250000000n, flat: 6000000n },
                { upTo: 1000000000n, ratePpm: 4500 },
                { upTo: 5000000000n, ratePpm: 3000 },
                { upTo: 30000000000n, ratePpm: 1500 },
                { upTo: 150000000000n, ratePpm: 900 },
                { upTo: 500000000000n, ratePpm: 700 },
                { upTo: 1000000000000n, ratePpm: 300 },
                { upTo: 2000000000000n, ratePpm: 220 },
                { upTo: 4000000000000n, ratePpm: 180 },
                { upTo: null, ratePpm: 120 }
            ],
            rentBands: [
                { upTo: 15000000n, flat: 6000000n },
                { upTo: 50000000n, ratePpm: 200000 },
                { upTo: 100000000n, ratePpm: 100000 },
                { upTo: null, ratePpm: 40000 }
            ],
            rentCap: 600000000n
        }
    };

    function progressiveRule(field, baseUnits, baseAmount, tiers, cap) {
        return {
            type: 'progressive', field: field, baseUnits: String(baseUnits), baseAmount: String(baseAmount),
            tiers: tiers.map(function (tier) {
                return { upTo: tier.upTo == null ? null : String(tier.upTo), perUnit: String(tier.perUnit) };
            }),
            cap: cap == null ? null : String(cap)
        };
    }

    function perUnitRule(field, rate, min, max, similarField, similarRatePpm) {
        return {
            type: 'perUnit', field: field, rate: String(rate),
            min: min == null ? null : String(min), max: max == null ? null : String(max),
            similarField: similarField || null, similarRatePpm: similarRatePpm || null
        };
    }

    function similarUnitsField() {
        return numberField('similarUnits', 'واحد، طبقه یا بلوک مشابه اضافی', 'مورد', { required: false, min: 0, integer: true });
    }

    function stepRule(field, baseUnits, baseAmount, steps, cap) {
        return {
            type: 'step', field: field, baseUnits: String(baseUnits), baseAmount: String(baseAmount),
            steps: steps.map(function (step) {
                return {
                    upTo: step.upTo == null ? null : String(step.upTo),
                    size: String(step.size),
                    increment: String(step.increment)
                };
            }),
            cap: cap == null ? null : String(cap)
        };
    }

    function topics1405() {
        const amount = moneyField('value', 'ارزش موضوع کارشناسی');
        const area = numberField('area', 'مساحت', 'متر مربع');
        const count = numberField('count', 'تعداد', 'مورد', { integer: true });
        return [
            topic('general_valuation', 'general', 'ارزیابی کلیه رشته‌ها', 'ماده ۱۱', valuation(), [amount]),
            topic('general_contract_full', 'general', 'اختلاف قرارداد، کنترل و تعیین صورت‌وضعیت', 'تبصره ۳ ماده ۱۱', valuation(2000000), [moneyField('value', 'مبلغ قرارداد')]),
            topic('general_contract_partial', 'general', 'رسیدگی به بخشی از قرارداد یا تأخیر', 'تبصره ۳ ماده ۱۱', valuation(1500000), [moneyField('value', 'مبلغ قرارداد')]),
            topic('general_intangible', 'general', 'ارزش‌گذاری دارایی نامشهود و برند', 'تبصره ۴ ماده ۱۱', valuation(1500000), [amount]),
            topic('general_rent', 'general', 'تعیین اجاره‌بها، اجور معوقه یا اجرت‌المثل', 'ماده ۱۳', { type: 'rent', field: 'value' }, [moneyField('value', 'اجاره ماهانه')]),
            topic('general_aerial', 'general', 'تفسیر عکس هوایی یا تصویر ماهواره‌ای', 'ماده ۱۴', { type: 'aerial', base: '20000000', ageRatePpm: 100000, extraRatePpm: 400000 }, [
                numberField('ageYears', 'قدمت تصویر', 'سال', { required: false, min: 0, integer: true }),
                numberField('extraItems', 'موارد متصل اضافی', 'مورد', { required: false, min: 0, integer: true })
            ]),
            topic('general_evidence', 'general', 'تأمین دلیل', 'ماده ۷', authority(20000000, null), [], { notes: ['مبلغ نهایی متناسب با کمیت و کیفیت خدمات توسط مقام ارجاع‌کننده تعیین می‌شود.'] }),
            topic('general_unspecified', 'general', 'موضوع پیش‌بینی‌نشده یا بررسی فنی تخصصی', 'ماده ۹', range(20000000, 100000000), []),

            topic('water_flow', 'water_mines', 'اندازه‌گیری آب و حقابه', 'ماده ۱۵', progressiveRule('flow', 50, 20000000, [
                { upTo: 1000, perUnit: 6000 }, { upTo: null, perUnit: 3000 }
            ], 90000000), [numberField('flow', 'دبی آب', 'لیتر در ثانیه')]),
            topic('water_quality', 'water_mines', 'تعیین کیفیت شیمیایی و آلودگی آب', 'ماده ۱۶', fixed(20000000), []),
            topic('water_table', 'water_mines', 'بررسی فنی سفره‌های سطحی و زیرزمینی', 'ماده ۱۷', fixed(30000000), []),
            topic('water_assets', 'water_mines', 'ارزیابی قنوات، چاه‌ها و شبکه‌های آب و فاضلاب', 'ماده ۱۸', valuation(), [amount]),
            topic('water_share', 'water_mines', 'تعیین میزان حقابه هر فرد', 'تبصره ماده ۱۸', fixed(20000000), []),
            topic('water_age', 'water_mines', 'تعیین قدمت منابع آبی', 'تبصره ماده ۱۸', fixed(20000000), []),
            topic('water_drilling', 'water_mines', 'بررسی کیفیت حفاری چاه، قنات و بهسازی چشمه', 'ماده ۱۹', fixed(30000000), []),
            topic('water_boundary_narrow', 'water_mines', 'تعیین حریم کانال و نهر با عرض بستر تا ۱۲ متر', 'بند ۱ ماده ۲۰', perUnitRule('length', 20000000, 20000000, 80000000), [numberField('length', 'طول مسیر', 'کیلومتر')]),
            topic('water_boundary_wide', 'water_mines', 'تعیین حریم رودخانه یا کانال با عرض بیش از ۱۲ متر', 'بند ۲ ماده ۲۰', perUnitRule('length', 20000000, 20000000, 120000000), [numberField('length', 'طول مسیر', 'کیلومتر')]),
            topic('water_waste', 'water_mines', 'رسیدگی به وضع پساب و بار آلودگی', 'ماده ۲۱', fixed(20000000), []),
            topic('metal_valuation', 'water_mines', 'ارزیابی فلزات', 'بند ۱ ماده ۲۲', valuation(), [amount]),
            topic('metal_quality', 'water_mines', 'تشخیص مشخصات کیفی و عملکردی فلزات', 'بند ۱ ماده ۲۲', range(35000000, 70000000), []),
            topic('mine_reserve', 'water_mines', 'ارزیابی ذخایر معدنی روباز', 'بند ۲ ماده ۲۲', valuation(), [amount]),
            topic('mine_reserve_underground', 'water_mines', 'ارزیابی ذخایر معدنی زیرزمینی', 'بند ۲ ماده ۲۲', valuation(1350000), [amount]),
            topic('mine_no_discovery', 'water_mines', 'بررسی معدنی بدون کشف ماده معدنی', 'بند ۳ ماده ۲۲', range(20000000, 100000000), []),

            topic('movable_valuation', 'movable', 'ارزیابی اموال منقول', 'ماده ۲۳', valuation(), [amount]),
            topic('movable_home_office', 'movable', 'ارزیابی لوازم خانگی و اداری', 'ماده ۲۳', valuation(1200000), [amount]),

            topic('medical_case', 'medical', 'کارشناسی پزشکی، داروسازی یا مواد غذایی', 'ماده ۲۴', range(20000000, 90000000), []),
            topic('medical_valuation', 'medical', 'ارزیابی در امور پزشکی و غذایی', 'ماده ۲۴', valuation(), [amount]),

            topic('financial_audit', 'financial', 'حسابرسی جمع ارقام حساب‌ها', 'ماده ۲۵', valuation(1500000), [moneyField('value', 'جمع ارقام مورد رسیدگی')]),
            topic('financial_shares', 'financial', 'تعیین ارزش سهام و سهم‌الشرکه', 'بند ۱ ماده ۲۶', valuation(), [amount]),
            topic('financial_statements', 'financial', 'رسیدگی به ترازنامه، سود و زیان یا ورشکستگی', 'بند ۲ ماده ۲۶', valuation(1000000, 'years'), [moneyField('value', 'جمع ارقام مورد رسیدگی'), numberField('years', 'تعداد سال‌های مورد رسیدگی', 'سال', { integer: true })]),
            topic('financial_cost', 'financial', 'تعیین قیمت تمام‌شده کالا', 'بند ۳ ماده ۲۶', valuation(), [moneyField('value', 'جمع ارقام تشکیل‌دهنده قیمت')]),
            topic('commerce_valuation', 'financial', 'ارزیابی امور بازرگانی', 'ماده ۲۷', valuation(), [amount]),
            topic('commerce_other', 'financial', 'سایر امور بازرگانی', 'ماده ۲۷', range(20000000, 100000000), []),
            topic('family_support', 'financial', 'نفقه، اجرت‌المثل، نحله و مهرالمثل', 'ماده ۲۸', valuation(), [moneyField('value', 'مبلغ تعیین‌شده موضوع')]),
            topic('bank_insurance_valuation', 'financial', 'ارزیابی سرمایه‌گذاری، بانک، بورس یا بیمه', 'ماده ۲۹', valuation(), [amount]),
            topic('bank_insurance_other', 'financial', 'سایر امور سرمایه‌گذاری، بانک، بورس یا بیمه', 'ماده ۲۹', range(20000000, 100000000), []),
            topic('statistics', 'financial', 'کارشناسی آمار', 'ماده ۳۰', range(20000000, 60000000), []),

            topic('vehicle_authenticity', 'vehicles', 'رسیدگی به اصالت خودرو', 'بند ۱ ماده ۳۱', fixed(20000000, 'count'), [numberField('count', 'تعداد خودرو', 'خودرو', { integer: true })], { cap: '70000000' }),
            topic('vehicle_accident', 'vehicles', 'تعیین علت تصادف و مقصر', 'بند ۲ ماده ۳۱', fixed(20000000, 'count'), [numberField('count', 'تعداد خودرو', 'خودرو', { integer: true })], { cap: '70000000' }),
            topic('vehicle_technical', 'vehicles', 'اظهارنظر فنی، تعیین تناژ و مدل خودرو', 'بند ۳ ماده ۳۱', fixed(20000000, 'count'), [numberField('count', 'تعداد خودرو', 'خودرو', { integer: true })], { cap: '70000000' }),
            topic('vehicle_combined', 'vehicles', 'بررسی همزمان چند موضوع غیرخسارتی یک خودرو', 'تبصره ۱ ماده ۳۱', range(20000000, 30000000), []),
            topic('vehicle_valuation', 'vehicles', 'ارزیابی یا تعیین خسارت وسیله نقلیه', 'تبصره ۲ ماده ۳۱', valuation(), [amount]),
            topic('transport_claim', 'vehicles', 'دعوای حمل‌ونقل بر مبنای مبلغ خواسته', 'بند ۱ ماده ۳۲', valuation(), [moneyField('value', 'مبلغ خواسته')]),
            topic('marine_valuation', 'vehicles', 'تعیین ارزش وسیله نقلیه آبی', 'بند ۲ ماده ۳۲', valuation(), [amount]),
            topic('marine_collision_boat', 'vehicles', 'تصادم قایق تفریحی یا مسافربری در آب داخلی', 'بند ۳-الف ماده ۳۲', fixed(20000000), []),
            topic('marine_collision_small', 'vehicles', 'تصادم شناور دریایی با ظرفیت کمتر از ۵۰۰ تن', 'بند ۳-ب ماده ۳۲', fixed(35000000), []),
            topic('marine_collision_large', 'vehicles', 'تصادم شناور دریایی با ظرفیت ۵۰۰ تن یا بیشتر', 'بند ۳-ب ماده ۳۲', fixed(70000000), []),
            topic('diving', 'vehicles', 'غواصی و عملیات زیرآبی', 'بند ۴ ماده ۳۲', range(20000000, 100000000), []),

            topic('building_valuation', 'construction', 'ارزیابی اراضی غیرمزروعی، ابنیه، مصالح و سرقفلی', 'ماده ۳۳', valuation(), [amount]),
            topic('building_other', 'construction', 'اظهارنظر فنی پیش‌بینی‌نشده راه و ساختمان', 'ماده ۳۳', range(20000000, 100000000), []),
            topic('building_map_match', 'construction', 'تطبیق نقشه معماری یا سازه با وضعیت محل', 'ماده ۳۴', perUnitRule('area', 30000, 20000000, 100000000, 'similarUnits', 200000), [area, similarUnitsField()]),
            topic('building_contract_match', 'construction', 'تطبیق مشخصات قرارداد ساختمانی با محل', 'ماده ۳۵', perUnitRule('area', 30000, 20000000, 100000000, 'similarUnits', 200000), [area, similarUnitsField()]),
            topic('building_architecture', 'construction', 'طراحی یا کنترل معماری کلی ساختمان موجود', 'بند ۱ ماده ۳۶', perUnitRule('area', 25000, 20000000, 150000000, 'similarUnits', 200000), [area, similarUnitsField()]),
            topic('building_structure', 'construction', 'طراحی یا کنترل محاسبات سازه ساختمان موجود', 'بند ۲ ماده ۳۶', perUnitRule('area', 30000, 20000000, 200000000, 'similarUnits', 200000), [area, similarUnitsField()]),
            topic('building_strength', 'construction', 'گزارش فنی استحکام بنا', 'بند ۳ ماده ۳۶', perUnitRule('area', 25000, 20000000, 150000000, 'similarUnits', 200000), [area, similarUnitsField()]),
            topic('building_strength_other', 'construction', 'تأیید استحکام بنا برای سایر رشته‌ها', 'بند ۴ ماده ۳۶', perUnitRule('area', 12500, 10000000, 75000000), [area]),
            topic('building_partition', 'construction', 'افراز املاک، مستغلات یا تقسیم ترکه', 'ماده ۳۷', valuation(1200000, null, 'similarUnits', 200000), [amount, similarUnitsField()], { notes: ['هزینه تهیه نقشه، در صورت نیاز، جداگانه محاسبه می‌شود.'] }),
            topic('building_revived_land', 'construction', 'تشخیص زمین مسبوق به احیا از نظر ساختمانی', 'ماده ۳۸', stepRule('area', 1000, 20000000, [{ upTo: null, size: 1000, increment: 3000000 }]), [area]),
            topic('survey_known', 'construction', 'پیاده‌کردن محدوده پلاک با گذربند مشخص', 'بند ۱ ماده ۳۹', progressiveRule('area', 1000, 20000000, [
                { upTo: 100000, perUnit: 1200 }, { upTo: null, perUnit: 800 }
            ], 200000000), [area]),
            topic('survey_unknown', 'construction', 'پیاده‌کردن محدوده پلاک با گذربند نامشخص', 'بند ۲ ماده ۳۹', progressiveRule('area', 1000, 30000000, [
                { upTo: 100000, perUnit: 1200 }, { upTo: null, perUnit: 800 }
            ], 250000000), [area]),
            topic('survey_gps_multi', 'construction', 'تعیین مختصات با GPS چندفرکانسه', 'تبصره ۲ ماده ۳۹', fixed(3500000, 'count'), [numberField('count', 'تعداد نقاط', 'نقطه', { integer: true, max: 50 })]),
            topic('survey_gps_hand', 'construction', 'تعیین مختصات با GPS دستی تک‌فرکانسه', 'تبصره ۲ ماده ۳۹', fixed(2000000, 'count'), [numberField('count', 'تعداد نقاط', 'نقطه', { integer: true, max: 50 })]),
            topic('survey_profile', 'construction', 'نقشه‌برداری اراضی و تهیه پروفیل', 'ماده ۴۰', progressiveRule('area', 1000, 30000000, [
                { upTo: 100000, perUnit: 1200 }, { upTo: null, perUnit: 800 }
            ], 250000000), [area]),
            topic('registry_file', 'construction', 'مطالعه پرونده ثبتی و تعیین محل پلاک', 'ماده ۴۱', progressiveRule('area', 1000, 20000000, [
                { upTo: 5000, perUnit: 4000 }, { upTo: 50000, perUnit: 2000 }, { upTo: null, perUnit: 1000 }
            ], 150000000), [area]),
            topic('survey_waterways', 'construction', 'نقشه موقعیت قنوات، انهار، کانال‌ها و رودخانه‌ها', 'ماده ۴۲', range(20000000, 100000000), []),
            topic('registry_boundary', 'construction', 'تشخیص حدود ثبتی و اختلاف املاک مزروعی', 'ماده ۴۳', stepRule('area', 10000, 20000000, [{ upTo: null, size: 10000, increment: 4000000 }], 60000000), [area]),
            topic('registry_boundary_aerial', 'construction', 'هزینه افزوده جانمایی ماده ۴۳ روی عکس هوایی', 'تبصره ماده ۴۳', fixed(20000000), []),
            topic('urban_partition', 'construction', 'بررسی انطباق طرح تفکیک اراضی شهری', 'بند ۱ ماده ۴۴', progressiveRule('count', 2, 40000000, [
                { upTo: 10, perUnit: 6000000 }, { upTo: null, perUnit: 1800000 }
            ]), [numberField('count', 'تعداد قطعات', 'قطعه', { integer: true, min: 2 })]),
            topic('urban_landuse', 'construction', 'بررسی انطباق کاربری اراضی شهری', 'بند ۲ ماده ۴۴', progressiveRule('count', 2, 30000000, [
                { upTo: 10, perUnit: 4500000 }, { upTo: null, perUnit: 1800000 }
            ]), [numberField('count', 'تعداد قطعات', 'قطعه', { integer: true, min: 1 })]),
            topic('urban_building', 'construction', 'بررسی انطباق شهری ساختمان', 'بند ۳ ماده ۴۴', progressiveRule('count', 2, 30000000, [
                { upTo: 10, perUnit: 4500000 }, { upTo: null, perUnit: 1800000 }
            ]), [numberField('count', 'تعداد واحدها', 'واحد', { integer: true, min: 1 })]),

            topic('industry_valuation', 'industry', 'ارزیابی رشته‌های صنعت و فن', 'ماده ۴۵', valuation(), [amount]),
            topic('industry_other', 'industry', 'سایر کارشناسی‌های صنعت و فن', 'ماده ۴۵', range(20000000, 100000000), []),
            topic('industry_machine_specs', 'industry', 'تعیین مشخصات فنی، استهلاک و عمر مفید ماشین‌آلات', 'تبصره ۱ ماده ۴۵', valuation(400000), [moneyField('value', 'ارزش روز ماشین‌آلات')]),
            topic('industry_software', 'industry', 'کارشناسی نرم‌افزار رایانه‌ای', 'تبصره ۲ ماده ۴۵', valuation(1500000), [amount]),
            topic('industry_digital', 'industry', 'اصالت اسناد دیجیتال، امنیت شبکه و حملات سایبری', 'تبصره ۳ ماده ۴۵', range(20000000, 100000000), []),

            topic('arts_signature_nonfinancial', 'arts', 'اصالت خط، امضا و اثر انگشت در پرونده غیرمالی', 'ماده ۴۶', { type: 'extraPercent', field: 'count', base: '20000000', baseUnits: '1', extraRatePpm: 200000, cap: '80000000' }, [numberField('count', 'تعداد مستندات', 'مستند', { integer: true })]),
            topic('arts_signature_financial', 'arts', 'اصالت خط، امضا و اثر انگشت در پرونده مالی', 'تبصره ماده ۴۶', valuation(), [amount], { cap: '125000000' }),
            topic('arts_photo', 'arts', 'مسائل فنی عکس و فیلم', 'بند الف ماده ۴۷', range(20000000, 120000000), []),
            topic('arts_short_film', 'arts', 'اختلافات برنامه کوتاه، مستند یا انیمیشن', 'بند ب-۱ ماده ۴۷', range(20000000, 80000000), []),
            topic('arts_long_film', 'arts', 'اختلافات برنامه سینمایی بلند', 'بند ب-۲ ماده ۴۷', range(20000000, 120000000), []),
            topic('arts_equipment_valuation', 'arts', 'ارزیابی فیلم و تجهیزات عکاسی و سینمایی', 'بند پ ماده ۴۷', valuation(), [amount]),
            topic('arts_sports_normal', 'arts', 'کارشناسی ورزشی بدون جرح یا فوت', 'بند ث ماده ۴۷', fixed(15000000), []),
            topic('arts_sports_injury', 'arts', 'کارشناسی ورزشی دارای جرح یا فوت', 'بند ث ماده ۴۷', authority(null, 100000000), []),
            topic('arts_printing', 'arts', 'کارشناسی چاپ و چاپخانه', 'بند ج ماده ۴۷', range(20000000, 90000000), []),
            topic('arts_graphic', 'arts', 'گواهی فنی طراحی و گرافیک', 'بند چ ماده ۴۷', authority(20000000, 100000000), []),

            topic('agri_valuation', 'agriculture', 'ارزیابی کشاورزی و منابع طبیعی', 'ماده ۴۸', valuation(), [amount]),
            topic('agri_rights', 'agriculture', 'حق ریشه، نسق، آبادانی، زراعت و حق غارسی', 'ماده ۴۹', valuation(), [amount]),
            topic('agri_sampling', 'agriculture', 'نمونه‌برداری محصولات کشاورزی و دامی', 'ماده ۵۰', range(20000000, 100000000), []),
            topic('agri_land', 'agriculture', 'تشخیص اراضی دایر، بایر، موات و منابع ملی', 'ماده ۵۱', stepRule('area', 1000, 20000000, [
                { upTo: 10000, size: 1000, increment: 2000000 }, { upTo: null, size: 1000, increment: 1000000 }
            ]), [area]),
            topic('agri_partition', 'agriculture', 'افراز املاک کشاورزی', 'ماده ۵۲', valuation(1200000), [amount]),
            topic('agri_rent', 'agriculture', 'ارزیابی اجاره‌بهای کشاورزی', 'تبصره ۲ ماده ۵۲', { type: 'rent', field: 'value' }, [moneyField('value', 'اجاره ماهانه')]),
            topic('agri_equipment', 'agriculture', 'ارزیابی تجهیزات و فرآورده‌های کشاورزی', 'ماده ۵۳', valuation(), [amount]),

            topic('administrative_case', 'administrative', 'کارشناسی خدمات اداری و عمومی', 'ماده ۵۴', authority(20000000, 100000000), []),
            topic('administrative_valuation', 'administrative', 'ارزیابی و تعیین خسارت خدمات اداری', 'ماده ۵۴', valuation(), [amount]),
            topic('safety_case', 'safety', 'کارشناسی ایمنی و حوادث', 'ماده ۵۵', authority(20000000, 100000000), [], { notes: ['تعداد موضوعات قابل بررسی با نظر مقام ارجاع‌دهنده تعیین می‌شود.'] }),
            topic('bio_case', 'bio', 'کارشناسی بیو و نانوتکنولوژی', 'تبصره گروه ۱۲', authority(20000000, 100000000), [])
        ];
    }

    function topics1402() {
        const amount = moneyField('value', 'ارزش موضوع کارشناسی');
        const area = numberField('area', 'مساحت', 'متر مربع');
        const doubledRange = function (min, max) { return range(min, max); };
        return [
            topic('general_valuation', 'general', 'ارزیابی کلیه رشته‌ها', 'ماده ۱۱ اصلاحی ۱۴۰۲', valuation(), [amount]),
            topic('general_contract_full', 'general', 'اختلاف قرارداد، کنترل و تعیین صورت‌وضعیت', 'تبصره ۳ ماده ۱۱ اصلاحی', valuation(2000000), [moneyField('value', 'مبلغ قرارداد')]),
            topic('general_contract_partial', 'general', 'رسیدگی به بخشی از قرارداد یا تأخیر', 'تبصره ۳ ماده ۱۱ اصلاحی', valuation(1500000), [moneyField('value', 'مبلغ قرارداد')]),
            topic('general_loss', 'general', 'تعیین سبب، علت و میزان خسارت', 'تبصره ۴ ماده ۱۱ اصلاحی', valuation(1500000), [moneyField('value', 'میزان خسارت')]),
            topic('general_used_goods', 'general', 'ارزیابی قطعات، کالای مستعمل و ضایعات', 'تبصره ۵ ماده ۱۱ اصلاحی', valuation(1500000), [amount]),
            topic('general_intangible', 'general', 'ارزش‌گذاری دارایی نامشهود و برند', 'تبصره ۷ ماده ۱۱ اصلاحی', valuation(1500000), [amount]),
            topic('general_rent', 'general', 'تعیین اجاره‌بها', 'ماده ۱۳ اصلاحی ۱۴۰۲', { type: 'rent', field: 'value' }, [moneyField('value', 'اجاره ماهانه')]),
            topic('general_aerial', 'general', 'تفسیر عکس هوایی یا تصویر ماهواره‌ای', 'ماده ۱۴ با افزایش دوبرابری', { type: 'aerial', base: '6000000', ageIncrement: '1000000', extraRatePpm: 400000 }, [
                numberField('ageYears', 'قدمت تصویر', 'سال', { required: false, min: 0, integer: true }),
                numberField('extraItems', 'پلاک‌های متصل اضافی', 'پلاک', { required: false, min: 0, integer: true })
            ]),
            topic('general_evidence', 'general', 'تأمین دلیل', 'ماده ۷ با افزایش دوبرابری', authority(4000000, null), []),
            topic('general_unspecified', 'general', 'موضوع پیش‌بینی‌نشده یا بررسی فنی تخصصی', 'ماده ۹ با افزایش دوبرابری', authority(6000000, null), []),

            topic('water_flow', 'water_mines', 'اندازه‌گیری آب و حقابه', 'ماده ۱۵ با افزایش دوبرابری', progressiveRule('flow', 50, 6000000, [
                { upTo: 1000, perUnit: 4000 }, { upTo: null, perUnit: 1600 }
            ], 70000000), [numberField('flow', 'دبی آب', 'لیتر در ثانیه')]),
            topic('water_quality', 'water_mines', 'تعیین کیفیت شیمیایی و آلودگی آب', 'ماده ۱۶ با افزایش دوبرابری', fixed(6000000), []),
            topic('water_table', 'water_mines', 'بررسی فنی سفره‌های سطحی و زیرزمینی', 'ماده ۱۷ با افزایش دوبرابری', fixed(16000000), []),
            topic('water_assets', 'water_mines', 'ارزیابی قنوات، چاه‌ها و شبکه‌های آب و فاضلاب', 'ماده ۱۸', valuation(), [amount]),
            topic('water_share', 'water_mines', 'تعیین میزان حقابه هر فرد', 'تبصره الحاقی ماده ۱۸', fixed(15000000), []),
            topic('water_age', 'water_mines', 'تعیین قدمت منابع آبی', 'تبصره الحاقی ماده ۱۸', fixed(10000000), []),
            topic('water_drilling', 'water_mines', 'بررسی کیفیت حفاری چاه و قنات', 'ماده ۱۹ با افزایش دوبرابری', fixed(14000000), []),
            topic('water_boundary_narrow', 'water_mines', 'تعیین حریم کانال و نهر با عرض تا ۱۲ متر', 'بند ۱ ماده ۲۰ با افزایش دوبرابری', perUnitRule('length', 6000000, 6000000, 60000000), [numberField('length', 'طول مسیر', 'کیلومتر')]),
            topic('water_boundary_wide', 'water_mines', 'تعیین حریم رودخانه یا کانال با عرض بیش از ۱۲ متر', 'بند ۲ ماده ۲۰ با افزایش دوبرابری', perUnitRule('length', 8000000, 8000000, 100000000), [numberField('length', 'طول مسیر', 'کیلومتر')]),
            topic('water_waste', 'water_mines', 'رسیدگی به وضع پساب', 'ماده ۲۱ با افزایش دوبرابری', fixed(10000000), []),
            topic('metal_valuation', 'water_mines', 'ارزیابی فلزات', 'ماده ۲۲', valuation(), [amount]),
            topic('metal_quality', 'water_mines', 'تشخیص مشخصات کیفی و عملکردی فلزات', 'ماده ۲۲ با افزایش دوبرابری', doubledRange(20000000, 50000000), []),
            topic('mine_reserve', 'water_mines', 'ارزیابی ذخایر معدنی روباز', 'ماده ۲۲', valuation(), [amount]),
            topic('mine_reserve_underground', 'water_mines', 'ارزیابی ذخایر معدنی زیرزمینی', 'ماده ۲۲', valuation(1350000), [amount]),
            topic('mine_no_discovery', 'water_mines', 'بررسی معدنی بدون ارزیابی', 'ماده ۲۲', authority(6000000, null), []),

            topic('movable_valuation', 'movable', 'ارزیابی اموال منقول', 'ماده ۲۳', valuation(), [amount]),
            topic('movable_home_office', 'movable', 'ارزیابی لوازم خانگی و اداری', 'ماده ۲۳', valuation(1200000), [amount]),
            topic('medical_case', 'medical', 'کارشناسی پزشکی، داروسازی یا مواد غذایی', 'ماده ۲۴ با افزایش دوبرابری', doubledRange(6000000, 60000000), []),
            topic('medical_valuation', 'medical', 'ارزیابی در امور پزشکی و غذایی', 'ماده ۲۴', valuation(), [amount]),
            topic('financial_audit', 'financial', 'حسابرسی جمع ارقام حساب‌ها', 'ماده ۲۵', valuation(1500000), [moneyField('value', 'جمع ارقام مورد رسیدگی')]),
            topic('financial_shares', 'financial', 'تعیین ارزش سهام و سهم‌الشرکه', 'ماده ۲۶', valuation(), [amount]),
            topic('financial_statements', 'financial', 'رسیدگی به ترازنامه، سود و زیان یا ورشکستگی', 'ماده ۲۶', valuation(), [moneyField('value', 'جمع ارقام مورد رسیدگی')]),
            topic('financial_cost', 'financial', 'تعیین قیمت تمام‌شده کالا', 'ماده ۲۶', valuation(), [moneyField('value', 'جمع ارقام تشکیل‌دهنده قیمت')]),
            topic('commerce_valuation', 'financial', 'ارزیابی امور بازرگانی', 'ماده ۲۷', valuation(), [amount]),
            topic('commerce_other', 'financial', 'سایر امور بازرگانی', 'ماده ۲۷ با افزایش دوبرابری', doubledRange(6000000, 80000000), []),
            topic('family_support', 'financial', 'نفقه، اجرت‌المثل، نحله و مهرالمثل', 'ماده ۲۸ اصلاحی', valuation(), [moneyField('value', 'مبلغ تعیین‌شده موضوع')]),
            topic('bank_insurance_valuation', 'financial', 'ارزیابی سرمایه‌گذاری، بانک یا بیمه', 'ماده ۲۹', valuation(), [amount]),
            topic('bank_insurance_other', 'financial', 'سایر امور سرمایه‌گذاری، بانک یا بیمه', 'ماده ۲۹ با افزایش دوبرابری', doubledRange(6000000, 80000000), []),
            topic('statistics', 'financial', 'کارشناسی آمار', 'ماده ۳۰ با افزایش دوبرابری', doubledRange(6000000, 40000000), []),

            topic('vehicle_authenticity', 'vehicles', 'رسیدگی به اصالت خودرو', 'ماده ۳۱ با افزایش دوبرابری', fixed(5000000, 'count'), [numberField('count', 'تعداد خودرو', 'خودرو', { integer: true })]),
            topic('vehicle_accident', 'vehicles', 'رسیدگی به تصادف', 'ماده ۳۱ با افزایش دوبرابری', fixed(6000000, 'count'), [numberField('count', 'تعداد خودرو', 'خودرو', { integer: true })]),
            topic('vehicle_technical', 'vehicles', 'اظهارنظر فنی، تعیین تناژ و مدل خودرو', 'ماده ۳۱ با افزایش دوبرابری', fixed(6000000, 'count'), [numberField('count', 'تعداد خودرو', 'خودرو', { integer: true })]),
            topic('vehicle_valuation', 'vehicles', 'ارزیابی یا تعیین خسارت وسیله نقلیه', 'بند الحاقی ماده ۳۱', valuation(), [amount]),
            topic('transport_claim', 'vehicles', 'دعوای حمل‌ونقل بر مبنای مبلغ خواسته', 'ماده ۳۲', valuation(), [moneyField('value', 'مبلغ خواسته')]),
            topic('marine_valuation', 'vehicles', 'تعیین ارزش وسیله نقلیه آبی', 'ماده ۳۲', valuation(), [amount]),
            topic('marine_collision_boat', 'vehicles', 'تصادم قایق در آب داخلی', 'ماده ۳۲ با افزایش دوبرابری', fixed(10000000), []),
            topic('marine_collision_small', 'vehicles', 'تصادم شناور با ظرفیت کمتر از ۵۰۰ تن', 'ماده ۳۲ با افزایش دوبرابری', fixed(20000000), []),
            topic('marine_collision_large', 'vehicles', 'تصادم شناور با ظرفیت ۵۰۰ تن یا بیشتر', 'ماده ۳۲ با افزایش دوبرابری', fixed(40000000), []),
            topic('diving', 'vehicles', 'غواصی و عملیات زیرآبی', 'ماده ۳۲', authority(6000000, null), []),

            topic('building_valuation', 'construction', 'ارزیابی اراضی غیرمزروعی، ابنیه و سرقفلی', 'ماده ۳۳', valuation(), [amount]),
            topic('building_other', 'construction', 'امور معماری داخلی و موارد فنی دیگر', 'ماده ۳۳', authority(6000000, null), []),
            topic('building_map_match', 'construction', 'تطبیق نقشه معماری یا سازه با وضعیت محل', 'ماده ۳۴ با افزایش دوبرابری', perUnitRule('area', 20000, 8000000, 80000000, 'similarUnits', 100000), [area, similarUnitsField()]),
            topic('building_contract_match', 'construction', 'تطبیق مشخصات قرارداد ساختمانی با محل', 'ماده ۳۵ با افزایش دوبرابری', perUnitRule('area', 20000, 8000000, 80000000, 'similarUnits', 100000), [area, similarUnitsField()]),
            topic('building_architecture', 'construction', 'تهیه نقشه معماری کلی ساختمان موجود', 'ماده ۳۶ با افزایش دوبرابری', perUnitRule('area', 16000, 8000000, 120000000, 'similarUnits', 100000), [area, similarUnitsField()]),
            topic('building_structure', 'construction', 'تهیه یا کنترل سازه ساختمان موجود', 'ماده ۳۶ با افزایش دوبرابری', perUnitRule('area', 20000, 8000000, 160000000, 'similarUnits', 100000), [area, similarUnitsField()]),
            topic('building_strength', 'construction', 'گزارش فنی استحکام بنا', 'ماده ۳۶ با افزایش دوبرابری', perUnitRule('area', 16000, 8000000, 120000000, 'similarUnits', 100000), [area, similarUnitsField()]),
            topic('building_partition', 'construction', 'افراز املاک، مستغلات یا تقسیم ترکه', 'ماده ۳۷', valuation(1200000, null, 'similarUnits', 100000), [amount, similarUnitsField()], { notes: ['هزینه تهیه نقشه، در صورت نیاز، جداگانه محاسبه می‌شود.'] }),
            topic('building_revived_land', 'construction', 'تشخیص زمین مسبوق به احیا', 'ماده ۳۸ با افزایش دوبرابری', stepRule('area', 1000, 6000000, [{ upTo: null, size: 1000, increment: 2000000 }]), [area]),
            topic('survey_known', 'construction', 'پیاده‌کردن محدوده پلاک با گذربند مشخص', 'ماده ۳۹ با افزایش دوبرابری', progressiveRule('area', 1000, 8000000, [
                { upTo: 100000, perUnit: 800 }, { upTo: null, perUnit: 400 }
            ], 160000000), [area]),
            topic('survey_unknown', 'construction', 'پیاده‌کردن محدوده پلاک با گذربند نامشخص', 'ماده ۳۹ با افزایش دوبرابری', progressiveRule('area', 1000, 20000000, [
                { upTo: 100000, perUnit: 800 }, { upTo: null, perUnit: 400 }
            ], 200000000), [area]),
            topic('survey_profile', 'construction', 'نقشه‌برداری اراضی و تهیه پروفیل', 'ماده ۴۰ با افزایش دوبرابری', progressiveRule('area', 1000, 20000000, [
                { upTo: 100000, perUnit: 800 }, { upTo: null, perUnit: 400 }
            ], 200000000), [area]),
            topic('registry_file', 'construction', 'مطالعه پرونده ثبتی و تعیین محل پلاک', 'ماده ۴۱ با افزایش دوبرابری', progressiveRule('area', 1000, 8000000, [
                { upTo: 5000, perUnit: 3000 }, { upTo: 50000, perUnit: 1600 }, { upTo: null, perUnit: 800 }
            ], 100000000), [area], { notes: ['برای پلاک خارج از محدوده، تا ۲۰٪ افزایش با نظر مرجع قابل اعمال است.'] }),
            topic('survey_waterways', 'construction', 'نقشه موقعیت قنوات، انهار و کانال‌ها', 'ماده ۴۲ با افزایش دوبرابری', authority(6000000, null), []),
            topic('registry_boundary', 'construction', 'تشخیص حدود ثبتی و اختلاف املاک', 'ماده ۴۳ اصلاحی', stepRule('area', 10000, 8000000, [{ upTo: null, size: 10000, increment: 1600000 }], 40000000), [area]),
            topic('registry_boundary_aerial', 'construction', 'هزینه افزوده جانمایی ماده ۴۳ روی عکس هوایی', 'تبصره ماده ۴۳ اصلاحی', fixed(10000000), []),
            topic('urban_partition', 'construction', 'بررسی انطباق طرح تفکیک اراضی شهری', 'ماده ۴۴ با افزایش دوبرابری', progressiveRule('count', 2, 16000000, [
                { upTo: 10, perUnit: 3000000 }, { upTo: null, perUnit: 1000000 }
            ]), [numberField('count', 'تعداد قطعات', 'قطعه', { integer: true })]),
            topic('urban_landuse', 'construction', 'بررسی انطباق کاربری اراضی شهری', 'ماده ۴۴ با افزایش دوبرابری', progressiveRule('count', 2, 12000000, [
                { upTo: 10, perUnit: 2400000 }, { upTo: null, perUnit: 1000000 }
            ]), [numberField('count', 'تعداد قطعات', 'قطعه', { integer: true })]),
            topic('urban_building', 'construction', 'بررسی انطباق شهری ساختمان', 'ماده ۴۴ با افزایش دوبرابری', progressiveRule('count', 2, 12000000, [
                { upTo: 10, perUnit: 2400000 }, { upTo: null, perUnit: 1000000 }
            ]), [numberField('count', 'تعداد واحدها', 'واحد', { integer: true })]),

            topic('industry_valuation', 'industry', 'ارزیابی رشته‌های صنعت و فن', 'ماده ۴۵', valuation(), [amount]),
            topic('industry_other', 'industry', 'سایر کارشناسی‌های صنعت و فن', 'ماده ۴۵', authority(6000000, null), []),
            topic('industry_machine_specs', 'industry', 'تعیین مشخصات فنی و عمر مفید ماشین‌آلات', 'تبصره ۱ ماده ۴۵', valuation(400000), [moneyField('value', 'ارزش روز ماشین‌آلات')]),
            topic('industry_software', 'industry', 'کارشناسی نرم‌افزار رایانه‌ای', 'تبصره ۲ ماده ۴۵', valuation(1500000), [amount]),
            topic('industry_digital', 'industry', 'اصالت اسناد دیجیتال و امنیت شبکه', 'تبصره ۳ ماده ۴۵ اصلاحی', authority(10000000, null), []),

            topic('arts_signature_nonfinancial', 'arts', 'اصالت خط و امضا در پرونده غیرمالی', 'ماده ۴۶ با افزایش دوبرابری', { type: 'extraPercent', field: 'count', base: '10000000', baseUnits: '1', extraRatePpm: 200000, cap: '40000000' }, [numberField('count', 'تعداد مستندات', 'مستند', { integer: true })]),
            topic('arts_signature_financial', 'arts', 'اصالت خط و امضا در پرونده مالی', 'تبصره ماده ۴۶', valuation(), [amount], { cap: '50000000' }),
            topic('arts_photo', 'arts', 'مسائل فنی عکس و فیلم', 'ماده ۴۷ با افزایش دوبرابری', doubledRange(6000000, 60000000), []),
            topic('arts_short_film', 'arts', 'اختلافات برنامه کوتاه یا مستند', 'ماده ۴۷ با افزایش دوبرابری', doubledRange(6000000, 40000000), []),
            topic('arts_long_film', 'arts', 'اختلافات برنامه سینمایی بلند', 'ماده ۴۷ با افزایش دوبرابری', doubledRange(6000000, 60000000), []),
            topic('arts_equipment_valuation', 'arts', 'ارزیابی فیلم و تجهیزات عکاسی', 'ماده ۴۷', valuation(), [amount]),
            topic('arts_sports_normal', 'arts', 'کارشناسی ورزشی بدون جرح یا فوت', 'ماده ۴۷', authority(6000000, null), []),
            topic('arts_printing', 'arts', 'کارشناسی چاپ و چاپخانه', 'ماده ۴۷ با افزایش دوبرابری', doubledRange(6000000, 40000000), []),

            topic('agri_valuation', 'agriculture', 'ارزیابی کشاورزی و منابع طبیعی', 'ماده ۴۸', valuation(), [amount]),
            topic('agri_rights', 'agriculture', 'حق ریشه، نسق، آبادانی و حق غارسی', 'ماده ۴۹', valuation(), [amount]),
            topic('agri_sampling', 'agriculture', 'نمونه‌برداری محصولات کشاورزی و دامی', 'ماده ۵۰', authority(6000000, null), []),
            topic('agri_land', 'agriculture', 'تشخیص اراضی و منابع ملی', 'ماده ۵۱ اصلاحی', stepRule('area', 1000, 8000000, [
                { upTo: 10000, size: 1000, increment: 800000 }, { upTo: null, size: 1000, increment: 400000 }
            ]), [area]),
            topic('agri_partition', 'agriculture', 'افراز املاک کشاورزی', 'ماده ۵۲', valuation(1200000), [amount]),
            topic('agri_rent', 'agriculture', 'ارزیابی اجاره‌بهای کشاورزی', 'تبصره ماده ۵۲', { type: 'rent', field: 'value' }, [moneyField('value', 'اجاره ماهانه')]),
            topic('agri_equipment', 'agriculture', 'ارزیابی تجهیزات و فرآورده‌های کشاورزی', 'ماده ۵۳', valuation(), [amount]),
            topic('administrative_case', 'administrative', 'کارشناسی خدمات اداری و عمومی', 'ماده ۵۴ با افزایش دوبرابری', authority(6000000, null), []),
            topic('administrative_valuation', 'administrative', 'ارزیابی و تعیین خسارت خدمات اداری', 'ماده ۵۴', valuation(), [amount]),
            topic('safety_case', 'safety', 'کارشناسی ایمنی و حوادث', 'ماده ۵۵ با افزایش دوبرابری', authority(6000000, null), []),
            topic('bio_case', 'bio', 'کارشناسی بیو و نانوتکنولوژی', 'تبصره گروه بیو و نانو', authority(6000000, null), [])
        ];
    }

    const TOPICS_BY_YEAR = { '1405': topics1405(), '1402': topics1402() };

    function calculateBands(amount, bands) {
        let total = 0n;
        let previous = 0n;

        bands.forEach(function (band, index) {
            if (index === 0 && band.flat != null) {
                total = BigInt(band.flat);
                previous = BigInt(band.upTo);
                return;
            }

            if (amount <= previous) { return; }
            const upper = band.upTo == null ? amount : minBigInt(amount, BigInt(band.upTo));
            if (upper > previous) {
                total += applyRate(upper - previous, band.ratePpm);
            }
            if (band.upTo != null) {
                previous = BigInt(band.upTo);
            }
        });

        return total;
    }

    function requiredValue(topicData, values, fieldName) {
        const definition = topicData.fields.find(function (field) { return field.name === fieldName; });
        const label = definition ? definition.label : 'مقدار';
        const allowZero = definition ? definition.required === false || definition.min === 0 : false;
        const parsed = parseInteger(values[fieldName] == null || values[fieldName] === '' ? (allowZero ? '0' : '') : values[fieldName], label, allowZero);
        if (definition && definition.max != null && parsed > BigInt(definition.max)) {
            throw new Error(formatMessage('aboveMaximum', '%1$s نمی‌تواند بیشتر از %2$s باشد.', translateText(label), definition.max));
        }
        if (definition && definition.min != null && parsed < BigInt(definition.min)) {
            throw new Error(formatMessage('belowMinimum', '%1$s نمی‌تواند کمتر از %2$s باشد.', translateText(label), definition.min));
        }
        return parsed;
    }

    function evaluateRule(topicData, values, yearConfig) {
        const rule = topicData.rule;
        let raw;

        if (rule.type === 'fixed') {
            raw = BigInt(rule.amount);
            if (rule.multiplierField) {
                raw *= requiredValue(topicData, values, rule.multiplierField);
            }
            return { status: 'exact', rawFee: raw };
        }

        if (rule.type === 'range' || rule.type === 'authority') {
            return {
                status: rule.type,
                min: rule.min == null ? null : BigInt(rule.min),
                max: rule.max == null ? null : BigInt(rule.max)
            };
        }

        if (rule.type === 'valuation') {
            const amount = requiredValue(topicData, values, rule.field || 'value');
            raw = calculateBands(amount, yearConfig.valuationBands);
            raw = applyRate(raw, rule.modifierPpm || 1000000);
            if (rule.multiplierField) {
                raw *= requiredValue(topicData, values, rule.multiplierField);
            }
            if (rule.similarField) {
                const similarUnits = requiredValue(topicData, values, rule.similarField);
                raw += applyRate(raw * similarUnits, rule.similarRatePpm || 0);
            }
            return { status: 'exact', rawFee: raw };
        }

        if (rule.type === 'rent') {
            raw = calculateBands(requiredValue(topicData, values, rule.field || 'value'), yearConfig.rentBands);
            return { status: 'exact', rawFee: raw, ruleCap: yearConfig.rentCap };
        }

        if (rule.type === 'perUnit') {
            raw = requiredValue(topicData, values, rule.field) * BigInt(rule.rate);
            if (rule.min != null && raw < BigInt(rule.min)) { raw = BigInt(rule.min); }
            if (rule.max != null && raw > BigInt(rule.max)) { raw = BigInt(rule.max); }
            if (rule.similarField) {
                const similarUnits = requiredValue(topicData, values, rule.similarField);
                raw += applyRate(raw * similarUnits, rule.similarRatePpm || 0);
            }
            return { status: 'exact', rawFee: raw };
        }

        if (rule.type === 'progressive') {
            const quantity = requiredValue(topicData, values, rule.field);
            const baseUnits = BigInt(rule.baseUnits);
            raw = BigInt(rule.baseAmount);
            let previous = baseUnits;
            rule.tiers.forEach(function (tier) {
                if (quantity <= previous) { return; }
                const upper = tier.upTo == null ? quantity : minBigInt(quantity, BigInt(tier.upTo));
                if (upper > previous) {
                    raw += (upper - previous) * BigInt(tier.perUnit);
                }
                if (tier.upTo != null) { previous = BigInt(tier.upTo); }
            });
            if (rule.cap != null && raw > BigInt(rule.cap)) { raw = BigInt(rule.cap); }
            return { status: 'exact', rawFee: raw };
        }

        if (rule.type === 'step') {
            const quantity = requiredValue(topicData, values, rule.field);
            raw = BigInt(rule.baseAmount);
            let previous = BigInt(rule.baseUnits);
            rule.steps.forEach(function (step) {
                if (quantity <= previous) { return; }
                const upper = step.upTo == null ? quantity : minBigInt(quantity, BigInt(step.upTo));
                if (upper > previous) {
                    const span = upper - previous;
                    const size = BigInt(step.size);
                    const units = (span + size - 1n) / size;
                    raw += units * BigInt(step.increment);
                }
                if (step.upTo != null) { previous = BigInt(step.upTo); }
            });
            if (rule.cap != null && raw > BigInt(rule.cap)) { raw = BigInt(rule.cap); }
            return { status: 'exact', rawFee: raw };
        }

        if (rule.type === 'aerial') {
            const ageYears = requiredValue(topicData, values, 'ageYears');
            const extraItems = requiredValue(topicData, values, 'extraItems');
            const base = BigInt(rule.base);
            raw = base;
            if (rule.ageIncrement != null) {
                raw += ageYears * BigInt(rule.ageIncrement);
            } else {
                raw += applyRate(base * ageYears, rule.ageRatePpm || 0);
            }
            raw += applyRate(base * extraItems, rule.extraRatePpm || 0);
            return { status: 'exact', rawFee: raw };
        }

        if (rule.type === 'extraPercent') {
            const quantity = requiredValue(topicData, values, rule.field);
            const baseUnits = BigInt(rule.baseUnits || '1');
            const base = BigInt(rule.base);
            raw = base;
            if (quantity > baseUnits) {
                raw += applyRate(base * (quantity - baseUnits), rule.extraRatePpm);
            }
            if (rule.cap != null && raw > BigInt(rule.cap)) { raw = BigInt(rule.cap); }
            return { status: 'exact', rawFee: raw };
        }

        throw new Error(formatMessage('ruleMissing', 'قاعده محاسبه این موضوع تعریف نشده است.'));
    }

    function topicById(year, topicId) {
        const topics = TOPICS_BY_YEAR[year];
        if (!topics) { throw new Error(formatMessage('unsupportedYear', 'سال تعرفه پشتیبانی نمی‌شود.')); }
        const found = topics.find(function (item) { return item.id === topicId; });
        if (!found) { throw new Error(formatMessage('subjectMissing', 'موضوع کارشناسی برای سال انتخابی یافت نشد.')); }
        return found;
    }

    function parseOption(value, label) {
        return parseInteger(value == null || value === '' ? '0' : value, label, true);
    }

    function cappedFee(raw, topicData, yearConfig, ruleCap) {
        let cap = yearConfig.perExpertCap;
        if (topicData.cap != null) { cap = minBigInt(cap, BigInt(topicData.cap)); }
        if (ruleCap != null) { cap = minBigInt(cap, BigInt(ruleCap)); }
        return raw > cap ? cap : raw;
    }

    function stringifyResult(result) {
        if (typeof result === 'bigint') {
            return result.toString();
        }
        if (Array.isArray(result)) {
            return result.map(stringifyResult);
        }
        if (result == null || typeof result !== 'object') {
            return result;
        }
        const output = {};
        Object.keys(result).forEach(function (key) {
            const value = result[key];
            output[key] = stringifyResult(value);
        });
        return output;
    }

    function calculate(year, topicId, values, options) {
        const normalizedYear = String(year);
        const yearConfig = YEAR_CONFIGS[normalizedYear];
        if (!yearConfig) { throw new Error(formatMessage('unsupportedYear', 'سال تعرفه پشتیبانی نمی‌شود.')); }

        const topicData = topicById(normalizedYear, topicId);
        const calculation = evaluateRule(topicData, values || {}, yearConfig);
        const settings = options || {};
        let panelSize = parseOption(settings.panelSize == null ? 1 : settings.panelSize, 'تعداد اعضای هیئت');
        if (panelSize === 0n) { panelSize = 1n; }
        if (panelSize > 50n) { throw new Error(formatMessage('panelMaximum', 'تعداد اعضای هیئت نمی‌تواند بیشتر از ۵۰ نفر باشد.')); }
        const isPanel = panelSize > 1n;
        const insideDays = parseOption(settings.travelInsideDays, 'روز مأموریت داخل استان');
        const outsideDays = parseOption(settings.travelOutsideDays, 'روز مأموریت خارج استان');
        const missionFee = (insideDays * yearConfig.missionInside) + (outsideDays * yearConfig.missionOutside);
        const common = {
            year: normalizedYear,
            yearLabel: translateText(yearConfig.label),
            topicId: topicData.id,
            topicLabel: translateText(topicData.label),
            status: calculation.status,
            articleRefs: topicData.articleRefs.map(translateText),
            notes: topicData.notes.map(translateText),
            panelSize: panelSize,
            missionFee: missionFee,
            baseFee: null,
            perExpertFee: null,
            panelTotal: null,
            total: null,
            range: null,
            breakdown: []
        };

        if (calculation.status === 'exact') {
            const singleWage = cappedFee(calculation.rawFee, topicData, yearConfig, calculation.ruleCap);
            let perExpertWage = singleWage;
            if (isPanel) {
                perExpertWage = cappedFee(applyRate(calculation.rawFee, Number(PANEL_RATE)), topicData, yearConfig, calculation.ruleCap);
            }
            const perExpertFee = perExpertWage + missionFee;
            const total = perExpertFee * panelSize;

            common.baseFee = singleWage;
            common.perExpertFee = perExpertFee;
            common.panelTotal = total;
            common.total = total;
            common.breakdown.push({ label: translateText('دستمزد پایه تک‌نفره'), amount: singleWage });
            if (isPanel) {
                common.breakdown.push({ label: translateText('سهم هر کارشناس پس از کسر ۳۰٪'), amount: perExpertWage });
            }
            if (missionFee > 0n) {
                common.breakdown.push({ label: translateText('فوق‌العاده مأموریت هر کارشناس'), amount: missionFee });
            }
            return stringifyResult(common);
        }

        function adjustRangeBound(bound) {
            if (bound == null) { return null; }
            let adjusted = bound;
            if (isPanel) { adjusted = applyRate(adjusted, Number(PANEL_RATE)); }
            adjusted = cappedFee(adjusted, topicData, yearConfig, null);
            return adjusted + missionFee;
        }

        common.range = {
            min: adjustRangeBound(calculation.min),
            max: adjustRangeBound(calculation.max)
        };
        common.notes.push(translateText('مبلغ دقیق با توجه به کمیت و کیفیت کار و تأیید مرجع ارجاع‌کننده تعیین می‌شود.'));
        return stringifyResult(common);
    }

    function getCatalog(year) {
        const normalizedYear = String(year);
        const yearConfig = YEAR_CONFIGS[normalizedYear];
        if (!yearConfig) { throw new Error(formatMessage('unsupportedYear', 'سال تعرفه پشتیبانی نمی‌شود.')); }
        const topics = TOPICS_BY_YEAR[normalizedYear].map(function (item) {
            return {
                id: item.id,
                category: item.category,
                label: translateText(item.label),
                articleRefs: item.articleRefs.map(translateText),
                fields: item.fields.map(function (field) {
                    return Object.assign({}, field, {
                        label: translateText(field.label),
                        unit: translateText(field.unit)
                    });
                }),
                notes: item.notes.map(translateText)
            };
        });
        const usedCategories = CATEGORIES.filter(function (category) {
            return topics.some(function (item) { return item.category === category.id; });
        });
        return {
            year: normalizedYear,
            label: translateText(yearConfig.label),
            effectiveLabel: translateText(yearConfig.effectiveLabel),
            currency: 'IRR',
            categories: usedCategories.map(function (item) {
                return Object.assign({}, item, { label: translateText(item.label) });
            }),
            topics: topics
        };
    }

    return {
        calculate: calculate,
        getCatalog: getCatalog,
        normalizeDigits: normalizeDigits,
        formatRial: formatRial,
        supportedYears: ['1405', '1402']
    };
}));
