(function () {
    'use strict';

    if (!window.Tarifexa) {
        return;
    }

    const engine = window.Tarifexa;
    const i18n = window.TarifexaI18n || { ui: {}, messages: {} };
    const THOUSANDS_SEPARATOR = '\u066C';

    function ui(key, fallback) {
        return i18n.ui && i18n.ui[key] ? i18n.ui[key] : fallback;
    }

    function message(key, fallback) {
        return i18n.messages && i18n.messages[key] ? i18n.messages[key] : fallback;
    }

    function sprintf(template) {
        const values = Array.prototype.slice.call(arguments, 1);
        if (typeof i18n.sprintf === 'function') {
            return i18n.sprintf.apply(null, [template].concat(values));
        }
        let index = 0;
        return template.replace(/%\d*\$?[sd]/g, function () { return String(values[index++]); });
    }

    function qs(root, selector) {
        return root.querySelector(selector);
    }

    function clear(node) {
        while (node && node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    function option(value, label) {
        const element = document.createElement('option');
        element.value = value;
        element.textContent = label;
        return element;
    }

    function localizeDigits(value) {
        if ((document.documentElement.lang || '').toLowerCase().indexOf('fa') !== 0) {
            return String(value);
        }
        return String(value).replace(/\d/g, function (digit) {
            return '۰۱۲۳۴۵۶۷۸۹'[Number(digit)];
        });
    }

    function formatInputValue(value) {
        const normalized = engine.normalizeDigits(value);
        if (!/^\d+$/.test(normalized)) {
            return value;
        }
        return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
    }

    function caretAfterDigits(value, digitCount) {
        if (digitCount <= 0) { return 0; }
        let seen = 0;
        for (let index = 0; index < value.length; index += 1) {
            if (/\d/.test(value[index])) {
                seen += 1;
                if (seen === digitCount) { return index + 1; }
            }
        }
        return value.length;
    }

    function bindLiveNumericInput(input) {
        if (!input || input.getAttribute('data-live-number') === 'true') { return; }
        input.setAttribute('data-live-number', 'true');

        let lastValidValue = formatInputValue(input.value || '');
        input.value = lastValidValue;

        input.addEventListener('focus', function () {
            if (engine.normalizeDigits(input.value) === '0') {
                input.select();
            }
        });

        input.addEventListener('input', function () {
            const rawValue = input.value;
            const rawCaret = input.selectionStart == null ? rawValue.length : input.selectionStart;
            const digitsBeforeCaret = engine.normalizeDigits(rawValue.slice(0, rawCaret)).replace(/\D/g, '').length;
            const normalized = engine.normalizeDigits(rawValue);

            if (normalized === '') {
                lastValidValue = '';
                input.value = '';
                return;
            }

            if (!/^\d+$/.test(normalized)) {
                input.value = lastValidValue;
                input.setSelectionRange(input.value.length, input.value.length);
                return;
            }

            const formatted = formatInputValue(normalized);
            input.value = formatted;
            lastValidValue = formatted;
            const nextCaret = caretAfterDigits(formatted, digitsBeforeCaret);
            input.setSelectionRange(nextCaret, nextCaret);
        });
    }

    function money(value) {
        if (value == null) {
            return ui('notDetermined', 'تعیین نشده');
        }
        let formatted = engine.formatRial(value);
        if ((document.documentElement.lang || '').toLowerCase().indexOf('fa') !== 0) {
            formatted = formatted.replace(/\u066C/g, ',');
        }
        return localizeDigits(formatted) + ' ' + ui('rialSuffix', 'ریال');
    }

    function setHidden(element, hidden) {
        if (!element) { return; }
        element.hidden = Boolean(hidden);
    }

    function addResultRow(container, label, value, emphasized) {
        const row = document.createElement('div');
        row.className = 'ik-wage-result-row' + (emphasized ? ' is-total' : '');
        const title = document.createElement('span');
        title.textContent = label;
        const amount = document.createElement('strong');
        amount.className = 'ik-wage-numeric-text';
        amount.textContent = value;
        row.appendChild(title);
        row.appendChild(amount);
        container.appendChild(row);
    }

    function controller(root) {
        if (root.getAttribute('data-ik-wage-initialized') === 'true') { return; }
        root.setAttribute('data-ik-wage-initialized', 'true');
        const mode = root.getAttribute('data-mode') || 'full';
        const form = qs(root, '[data-role="form"]');
        const year = qs(root, '[data-role="year"]');
        const category = qs(root, '[data-role="category"]');
        const topicSelect = qs(root, '[data-role="topic"]');
        const topicSearch = qs(root, '[data-role="topic-search"]');
        const searchResults = qs(root, '[data-role="search-results"]');
        const fieldsContainer = qs(root, '[data-role="fields"]');
        const effective = qs(root, '[data-role="effective"]');
        const panelCheckbox = qs(root, '[data-role="panel-checkbox"]');
        const panelSizeWrap = qs(root, '[data-role="panel-size-wrap"]');
        const panelSize = qs(root, '[data-role="panel-size"]');
        const result = qs(root, '[data-role="result"]');
        const resultStatus = qs(root, '[data-role="result-status"]');
        const resultRows = qs(root, '[data-role="result-rows"]');
        const resultRefs = qs(root, '[data-role="result-refs"]');
        const resultNotes = qs(root, '[data-role="result-notes"]');
        const error = qs(root, '[data-role="error"]');
        let catalog = null;

        function selectedTopic() {
            if (mode === 'quick') {
                return catalog.topics.find(function (item) { return item.id === 'general_valuation'; });
            }
            return catalog.topics.find(function (item) { return item.id === topicSelect.value; });
        }

        function updateEffective() {
            if (effective) {
                effective.textContent = catalog.effectiveLabel;
            }
        }

        function populateCategories() {
            if (!category) { return; }
            const old = category.value;
            clear(category);
            catalog.categories.forEach(function (item) {
                category.appendChild(option(item.id, item.label));
            });
            if (catalog.categories.some(function (item) { return item.id === old; })) {
                category.value = old;
            }
        }

        function populateTopics(preferredTopic) {
            if (!topicSelect || !category) { return; }
            const categoryTopics = catalog.topics.filter(function (item) {
                return item.category === category.value;
            });
            clear(topicSelect);
            categoryTopics.forEach(function (item) {
                topicSelect.appendChild(option(item.id, item.label + ui('referenceSeparator', ' — ') + item.articleRefs.join(ui('listSeparator', '، '))));
            });
            if (preferredTopic && categoryTopics.some(function (item) { return item.id === preferredTopic; })) {
                topicSelect.value = preferredTopic;
            }
            renderFields();
        }

        function fieldValue(name) {
            const input = fieldsContainer.querySelector('[name="' + name + '"]');
            return input ? input.value : '';
        }

        function renderFields() {
            const item = selectedTopic();
            if (!item || !fieldsContainer) { return; }
            clear(fieldsContainer);

            if (!item.fields.length) {
                const message = document.createElement('p');
                message.className = 'ik-wage-no-fields ik-wage-field-full';
                message.textContent = ui('noAdditionalInput', 'برای این موضوع ورودی عددی دیگری لازم نیست.');
                fieldsContainer.appendChild(message);
                return;
            }

            item.fields.forEach(function (field) {
                const group = document.createElement('div');
                group.className = 'ik-wage-field ik-wage-field-half';
                const label = document.createElement('label');
                const id = root.id + '-' + field.name;
                label.setAttribute('for', id);
                label.textContent = field.label + (field.required === false ? ui('optionalSuffix', ' (اختیاری)') : ' *');
                const inputWrap = document.createElement('div');
                inputWrap.className = 'ik-wage-input-wrap';
                const input = document.createElement('input');
                input.type = 'text';
                input.id = id;
                input.name = field.name;
                input.className = 'ik-wage-control';
                input.setAttribute('inputmode', 'numeric');
                input.setAttribute('autocomplete', 'off');
                input.setAttribute('aria-describedby', id + '-unit');
                input.placeholder = field.type === 'money' ? ui('moneyPlaceholder', 'مبلغ به ریال') : field.label;
                if (field.required !== false) { input.required = true; }
                if (field.min != null) { input.setAttribute('data-min', field.min); }
                if (field.max != null) { input.setAttribute('data-max', field.max); }
                bindLiveNumericInput(input);
                const unit = document.createElement('span');
                unit.className = 'ik-wage-unit';
                unit.id = id + '-unit';
                unit.textContent = field.unit || '';
                inputWrap.appendChild(input);
                if (field.unit) { inputWrap.appendChild(unit); }
                group.appendChild(label);
                group.appendChild(inputWrap);
                fieldsContainer.appendChild(group);
            });
        }

        function chooseSearchTopic(topicId) {
            const item = catalog.topics.find(function (topic) { return topic.id === topicId; });
            if (!item) { return; }
            category.value = item.category;
            populateTopics(item.id);
            topicSearch.value = item.label;
            setHidden(searchResults, true);
            topicSelect.focus();
        }

        function renderSearchResults() {
            if (!topicSearch || !searchResults) { return; }
            const query = topicSearch.value.trim().toLowerCase();
            clear(searchResults);
            if (!query) {
                setHidden(searchResults, true);
                return;
            }
            const matches = catalog.topics.filter(function (item) {
                return (item.label + ' ' + item.articleRefs.join(' ')).toLowerCase().indexOf(query) !== -1;
            }).slice(0, 10);
            if (!matches.length) {
                const empty = document.createElement('span');
                empty.textContent = ui('noSubjectFound', 'موضوعی پیدا نشد.');
                searchResults.appendChild(empty);
            } else {
                matches.forEach(function (item) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.setAttribute('role', 'option');
                    button.textContent = item.label + ' (' + item.articleRefs.join(ui('listSeparator', '، ')) + ')';
                    button.addEventListener('click', function () { chooseSearchTopic(item.id); });
                    searchResults.appendChild(button);
                });
            }
            setHidden(searchResults, false);
        }

        function loadCatalog(preferredTopic) {
            catalog = engine.getCatalog(year.value);
            updateEffective();
            if (mode === 'full') {
                const oldCategory = category.value;
                populateCategories();
                if (oldCategory && catalog.categories.some(function (item) { return item.id === oldCategory; })) {
                    category.value = oldCategory;
                }
                const desired = catalog.topics.some(function (item) { return item.id === preferredTopic; }) ? preferredTopic : null;
                if (desired) {
                    category.value = catalog.topics.find(function (item) { return item.id === desired; }).category;
                }
                populateTopics(desired);
                if (topicSearch) { topicSearch.value = ''; }
                setHidden(searchResults, true);
            } else {
                renderFields();
            }
            setHidden(result, true);
            setHidden(error, true);
        }

        function collectValues() {
            const item = selectedTopic();
            const values = {};
            item.fields.forEach(function (field) {
                values[field.name] = fieldValue(field.name);
            });
            return values;
        }

        function renderNotes(notes) {
            clear(resultNotes);
            if (!notes || !notes.length) {
                setHidden(resultNotes, true);
                return;
            }
            notes.forEach(function (note) {
                const li = document.createElement('li');
                li.textContent = note;
                resultNotes.appendChild(li);
            });
            setHidden(resultNotes, false);
        }

        function renderCalculation(calculation) {
            clear(resultRows);
            resultStatus.className = 'ik-wage-status ' + (calculation.status === 'exact' ? 'is-exact' : 'is-estimate');
            resultStatus.textContent = calculation.status === 'exact'
                ? ui('exactStatus', 'برآورد محاسباتی قطعی بر اساس فرمول تعرفه')
                : ui('estimateStatus', 'برآورد غیرقطعی؛ مبلغ نهایی نیازمند تأیید مرجع است');

            if (calculation.status === 'exact') {
                addResultRow(resultRows, ui('baseFee', 'دستمزد پایه تک‌نفره'), money(calculation.baseFee));
                if (Number(calculation.panelSize) > 1) {
                    addResultRow(resultRows, ui('perExpertWithMission', 'سهم هر کارشناس با مأموریت'), money(calculation.perExpertFee));
                    addResultRow(resultRows, sprintf(ui('panelTotal', 'جمع کل هیئت %s نفره'), localizeDigits(calculation.panelSize)), money(calculation.panelTotal), true);
                } else {
                    if (calculation.missionFee !== '0') {
                        addResultRow(resultRows, ui('missionFee', 'فوق‌العاده مأموریت'), money(calculation.missionFee));
                    }
                    addResultRow(resultRows, ui('estimatedTotal', 'جمع قابل برآورد'), money(calculation.total), true);
                }
            } else {
                addResultRow(resultRows, ui('minimum', 'حداقل قابل استناد'), money(calculation.range && calculation.range.min));
                addResultRow(resultRows, ui('maximum', 'حداکثر قابل استناد'), money(calculation.range && calculation.range.max));
                if (Number(calculation.panelSize) > 1) {
                    addResultRow(resultRows, ui('panelMembers', 'تعداد اعضای هیئت'), localizeDigits(calculation.panelSize) + ' ' + ui('expertSuffix', 'نفر'));
                }
            }

            resultRefs.textContent = calculation.articleRefs.join(ui('listSeparator', '، ')) + ui('referenceSeparator', ' — ') + calculation.yearLabel;
            renderNotes(calculation.notes);
            setHidden(error, true);
            setHidden(result, false);
            result.focus();
        }

        function submit(event) {
            event.preventDefault();
            try {
                const topicItem = selectedTopic();
                const panelCount = panelCheckbox && panelCheckbox.checked ? panelSize.value : '1';
                if (panelCheckbox && panelCheckbox.checked) {
                    const normalizedPanelCount = engine.normalizeDigits(panelCount);
                    if (!/^\d+$/.test(normalizedPanelCount) || BigInt(normalizedPanelCount) < 2n) {
                        throw new Error(message('panelMinimum', 'تعداد اعضای هیئت باید حداقل ۲ نفر باشد.'));
                    }
                }
                const inside = qs(root, '[data-role="travel-inside"]');
                const outside = qs(root, '[data-role="travel-outside"]');
                const calculation = engine.calculate(year.value, topicItem.id, collectValues(), {
                    panelSize: panelCount,
                    travelInsideDays: inside ? inside.value : '0',
                    travelOutsideDays: outside ? outside.value : '0'
                });
                renderCalculation(calculation);
            } catch (exception) {
                error.textContent = exception && exception.message ? exception.message : message('calculationFailed', 'محاسبه انجام نشد. ورودی‌ها را بررسی کنید.');
                setHidden(error, false);
                setHidden(result, true);
                error.focus();
            }
        }

        year.addEventListener('change', function () {
            const oldTopic = selectedTopic();
            loadCatalog(oldTopic ? oldTopic.id : null);
        });
        if (category) {
            category.addEventListener('change', function () { populateTopics(null); });
        }
        if (topicSelect) {
            topicSelect.addEventListener('change', renderFields);
        }
        if (topicSearch) {
            topicSearch.addEventListener('input', renderSearchResults);
            topicSearch.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') { setHidden(searchResults, true); }
            });
        }
        if (panelCheckbox) {
            panelCheckbox.addEventListener('change', function () {
                setHidden(panelSizeWrap, !panelCheckbox.checked);
                if (!panelCheckbox.checked) { panelSize.value = '3'; }
            });
        }
        root.querySelectorAll('[inputmode="numeric"]').forEach(bindLiveNumericInput);
        form.addEventListener('submit', submit);
        loadCatalog('general_valuation');
    }

    function boot() {
        document.querySelectorAll('[data-ik-wage]').forEach(controller);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}());
