(function () {
    'use strict';

    var CONSENT_KEY = 'senso_consent';
    var CONSENT_VERSION = '1.0';
    var PIXEL_ID = '2442677362880993';
    var state = null;
    var lastFocusedElement = null;

    function labels() {
        var spanish = document.documentElement.lang.toLowerCase().indexOf('es') === 0;
        return spanish ? {
            title: 'Preferencias de privacidad',
            copy: 'Usamos almacenamiento funcional necesario y, solo si lo aceptas, medición y marketing. Puedes cambiar tu decisión en cualquier momento.',
            accept: 'Aceptar todo', reject: 'Rechazar todo', manage: 'Gestionar preferencias', save: 'Guardar preferencias',
            necessary: 'Necesarias / funcionales', necessaryDescription: 'Mantienen funciones elegidas por ti, como el idioma.',
            analytics: 'Analítica', analyticsDescription: 'Medición de uso. Actualmente no hay analítica instalada.',
            marketing: 'Marketing', marketingDescription: 'Permite cargar Meta Pixel y su PageView actual.',
            settings: 'Privacidad', notice: 'Aviso de privacidad — borrador: la información legal definitiva requiere validación de Senso HQ/Legal.',
            legal: 'Consulta los borradores de Privacidad y Cookies.'
        } : {
            title: 'Privacy preferences',
            copy: 'We use necessary functional storage and, only if you accept it, measurement and marketing. You can change your decision at any time.',
            accept: 'Accept all', reject: 'Reject all', manage: 'Manage preferences', save: 'Save preferences',
            necessary: 'Necessary / Functional', necessaryDescription: 'Keeps functions you choose, such as language.',
            analytics: 'Analytics', analyticsDescription: 'Usage measurement. No analytics is installed at present.',
            marketing: 'Marketing', marketingDescription: 'Allows Meta Pixel and its existing PageView to load.',
            settings: 'Privacy', notice: 'Privacy notice — draft: final legal information requires validation by Senso HQ/Legal.',
            legal: 'See the Privacy and Cookies drafts.'
        };
    }

    function validConsent(value) {
        return value && value.version === CONSENT_VERSION && typeof value.timestamp === 'string' && value.categories &&
            typeof value.categories.analytics === 'boolean' && typeof value.categories.marketing === 'boolean';
    }

    function readConsent() {
        try {
            var value = JSON.parse(localStorage.getItem(CONSENT_KEY));
            return validConsent(value) ? value : null;
        } catch (error) {
            return null;
        }
    }

    function saveConsent(categories) {
        state = {
            version: CONSENT_VERSION,
            categories: {
                necessary: true,
                analytics: Boolean(categories.analytics),
                marketing: Boolean(categories.marketing)
            },
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
        applyConsent();
    }

    function expireCookie(name) {
        var hostname = window.location.hostname;
        var parts = hostname.split('.');
        var domains = [hostname];
        if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
        domains.forEach(function (domain) {
            document.cookie = name + '=; Max-Age=0; path=/; domain=' + domain + '; SameSite=Lax';
        });
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
    }

    function removeMarketingStorage() {
        expireCookie('_fbp');
        expireCookie('_fbc');
    }

    function loadMetaPixel() {
        if (!state || !state.categories.marketing) return;
        if (window.__sensoMetaLoaded) {
            if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
            return;
        }
        window.__sensoMetaLoaded = true;
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = true;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = true;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', PIXEL_ID);
        window.fbq('track', 'PageView');
    }

    function applyConsent() {
        if (state && state.categories.marketing) {
            loadMetaPixel();
        } else {
            removeMarketingStorage();
        }
    }

    function makeButton(text, action, extraClass) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'senso-consent-button' + (extraClass ? ' ' + extraClass : '');
        button.textContent = text;
        button.dataset.consentAction = action;
        return button;
    }

    function closePreferences() {
        var preferences = document.getElementById('senso-consent-preferences');
        if (!preferences) return;
        preferences.hidden = true;
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function openPreferences() {
        var preferences = document.getElementById('senso-consent-preferences');
        if (!preferences) return;
        lastFocusedElement = document.activeElement;
        var consent = state || { categories: { analytics: false, marketing: false } };
        preferences.querySelector('[name="senso-analytics"]').checked = consent.categories.analytics;
        preferences.querySelector('[name="senso-marketing"]').checked = consent.categories.marketing;
        preferences.hidden = false;
        preferences.querySelector('[name="senso-analytics"]').focus();
    }

    function buildInterface() {
        var text = labels();
        var banner = document.createElement('section');
        banner.id = 'senso-consent-banner';
        banner.className = 'senso-consent-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', text.title);
        banner.innerHTML = '<h2 class="senso-consent-title">' + text.title + '</h2>' +
            '<p class="senso-consent-copy">' + text.copy + ' <a href="cookies.html">' + text.legal + '</a></p>';
        var actions = document.createElement('div');
        actions.className = 'senso-consent-actions';
        actions.append(makeButton(text.accept, 'accept-all'));
        actions.append(makeButton(text.reject, 'reject-all'));
        actions.append(makeButton(text.manage, 'manage', 'senso-consent-button--link'));
        banner.append(actions);

        var preferences = document.createElement('section');
        preferences.id = 'senso-consent-preferences';
        preferences.className = 'senso-consent-preferences';
        preferences.hidden = true;
        preferences.setAttribute('role', 'dialog');
        preferences.setAttribute('aria-modal', 'true');
        preferences.setAttribute('aria-label', text.title);
        preferences.innerHTML = '<div class="senso-consent-panel">' +
            '<h2 class="senso-consent-title">' + text.title + '</h2>' +
            '<div class="senso-consent-category"><input id="senso-necessary" type="checkbox" checked disabled>' +
            '<label for="senso-necessary"><strong>' + text.necessary + '</strong><span>' + text.necessaryDescription + '</span></label></div>' +
            '<div class="senso-consent-category"><input id="senso-analytics" name="senso-analytics" type="checkbox">' +
            '<label for="senso-analytics"><strong>' + text.analytics + '</strong><span>' + text.analyticsDescription + '</span></label></div>' +
            '<div class="senso-consent-category"><input id="senso-marketing" name="senso-marketing" type="checkbox">' +
            '<label for="senso-marketing"><strong>' + text.marketing + '</strong><span>' + text.marketingDescription + '</span></label></div>' +
            '<div class="senso-consent-actions"></div></div>';
        preferences.querySelector('.senso-consent-actions').append(makeButton(text.save, 'save-preferences'));
        preferences.querySelector('.senso-consent-actions').append(makeButton(text.reject, 'reject-all'));

        var settings = makeButton(text.settings, 'manage', 'senso-consent-settings-link');
        settings.id = 'senso-consent-settings';
        document.body.append(banner, preferences, settings);

        document.addEventListener('click', function (event) {
            var action = event.target && event.target.dataset ? event.target.dataset.consentAction : null;
            if (!action) return;
            if (action === 'accept-all') {
                saveConsent({ analytics: true, marketing: true });
                banner.hidden = true;
                closePreferences();
            }
            if (action === 'reject-all') {
                saveConsent({ analytics: false, marketing: false });
                banner.hidden = true;
                closePreferences();
            }
            if (action === 'manage') openPreferences();
            if (action === 'save-preferences') {
                saveConsent({
                    analytics: preferences.querySelector('[name="senso-analytics"]').checked,
                    marketing: preferences.querySelector('[name="senso-marketing"]').checked
                });
                banner.hidden = true;
                closePreferences();
            }
        });

        preferences.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closePreferences();
                return;
            }
            if (event.key !== 'Tab') return;
            var focusable = Array.prototype.slice.call(preferences.querySelectorAll('button:not([disabled]), input:not([disabled])'));
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        if (!state) {
            banner.hidden = false;
        } else {
            banner.hidden = true;
        }
    }

    function addFormPrivacyNotices() {
        var text = labels();
        document.querySelectorAll('form[action*="formspree.io/"]').forEach(function (form) {
            if (form.nextElementSibling && form.nextElementSibling.classList.contains('senso-privacy-notice')) return;
            var notice = document.createElement('p');
            notice.className = 'senso-privacy-notice';
            notice.innerHTML = text.notice + ' <a href="privacy.html">Privacy Policy draft</a>.';
            form.insertAdjacentElement('afterend', notice);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        state = readConsent();
        buildInterface();
        addFormPrivacyNotices();
        applyConsent();
    });
}());
