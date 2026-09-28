(function (window, document) {
    'use strict';

    var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var UTM_STORAGE_KEY = 'senso_utm_context';
    var SOURCE_STORAGE_KEY = 'senso_source_page';

    function readStorage(key, fallback) {
        try { return window.sessionStorage.getItem(key) || fallback; } catch (error) { return fallback; }
    }

    function writeStorage(key, value) {
        try { window.sessionStorage.setItem(key, value); } catch (error) { /* storage is optional */ }
    }

    function captureContext() {
        var params = new URLSearchParams(window.location.search);
        var existing = {};
        try { existing = JSON.parse(readStorage(UTM_STORAGE_KEY, '{}')) || {}; } catch (error) { existing = {}; }
        UTM_KEYS.forEach(function (key) {
            var value = params.get(key);
            if (value !== null) {
                // Campaign tokens only; reject email, URL, free-text and phone-shaped values.
                if (/^[a-zA-Z0-9_.~-]{1,100}$/.test(value) && !/\d{7,}/.test(value)) existing[key] = value;
                else delete existing[key];
            }
        });
        writeStorage(UTM_STORAGE_KEY, JSON.stringify(existing));
        if (!readStorage(SOURCE_STORAGE_KEY, '')) writeStorage(SOURCE_STORAGE_KEY, window.location.pathname || '/');
        return { utm: existing, source: readStorage(SOURCE_STORAGE_KEY, window.location.pathname || '/') };
    }

    function makeId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
        return 'senso-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    function setHidden(form, name, value) {
        var field = form.querySelector('[data-lead-context="' + name + '"]');
        if (!field) {
            field = document.createElement('input');
            field.type = 'hidden';
            field.name = name;
            field.setAttribute('data-lead-context', name);
            form.appendChild(field);
        }
        field.value = value || '';
    }

    function bindForm(form, options) {
        if (!form || form.dataset.leadCaptureBound === 'true') return;
        form.dataset.leadCaptureBound = 'true';
        options = options || {};
        var button = form.querySelector('[type="submit"]');
        var errorBox = form.querySelector('[data-form-error]');
        var successBox = form.querySelector('[data-form-success]');
        var originalLabel = '';
        var context = captureContext();
        var submissionId = '';

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (form.dataset.submitting === 'true' || !form.reportValidity()) return;
            form.dataset.submitting = 'true';
            submissionId = submissionId || makeId();
            setHidden(form, 'form_id', options.formId || form.id || 'senso_form');
            setHidden(form, 'source_page', context.source);
            var language = typeof options.language === 'function' ? options.language() : (options.language || document.documentElement.lang || 'en');
            setHidden(form, 'page_language', language);
            setHidden(form, 'submission_id', submissionId);
            UTM_KEYS.forEach(function (key) { setHidden(form, key, context.utm[key] || ''); });
            if (errorBox) { errorBox.hidden = true; errorBox.textContent = ''; }
            if (button) {
                originalLabel = button.tagName === 'INPUT' ? button.value : button.textContent;
                button.disabled = true;
                button.setAttribute('aria-busy', 'true');
                if (button.tagName === 'INPUT') button.value = (typeof options.loadingLabel === 'function' ? options.loadingLabel() : options.loadingLabel) || 'Sending...';
                else button.textContent = (typeof options.loadingLabel === 'function' ? options.loadingLabel() : options.loadingLabel) || 'Sending...';
            }

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            }).then(function (response) {
                if (!response.ok) throw new Error('form submission failed');
                if (window.SensoAnalytics) {
                    window.SensoAnalytics.emit({
                        event: options.eventName || 'consulting_enquiry',
                        form_id: options.formId || form.id || 'senso_form',
                        submission_id: submissionId,
                        service: options.service || 'art_consulting',
                        language: language,
                        source_page: context.source
                    });
                }
                if (successBox) successBox.hidden = false;
                form.setAttribute('aria-hidden', 'true');
                form.classList.add('is-submitted');
                if (typeof options.onSuccess === 'function') options.onSuccess(response);
            }).catch(function () {
                form.dataset.submitting = 'false';
                if (errorBox) {
                    errorBox.textContent = (typeof options.errorLabel === 'function' ? options.errorLabel() : options.errorLabel) || 'We could not send your request. Please try again.';
                    errorBox.hidden = false;
                }
                if (button) {
                    button.disabled = false;
                    button.removeAttribute('aria-busy');
                    if (button.tagName === 'INPUT') button.value = originalLabel;
                    else button.textContent = originalLabel;
                }
            });
        });

        return { refresh: captureContext };
    }

    window.SensoLeadCapture = { bindForm: bindForm, captureContext: captureContext };
    captureContext();
})(window, document);
