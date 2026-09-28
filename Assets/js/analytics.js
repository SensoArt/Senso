(function (window) {
    'use strict';

    window.dataLayer = window.dataLayer || [];

    var ALLOWED_KEYS = ['event', 'form_id', 'submission_id', 'service', 'language', 'source_page'];

    function emit(payload) {
        if (!payload || !payload.event) return;
        var clean = {};
        ALLOWED_KEYS.forEach(function (key) {
            if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
                clean[key] = String(payload[key]);
            }
        });
        if (!clean.event) return;
        window.dataLayer.push(clean);
    }

    window.SensoAnalytics = { emit: emit };
})(window);
