/* Staging only. Never deploy this file or the staging branch to production. */
(() => {
  'use strict';
  const mockPath = '/__senso_staging_mock__/form';
  const nativeFetch = window.fetch.bind(window);
  const queue = [];
  const calls = [];
  const safeOrigin = url => new URL(url, location.href).origin === location.origin;
  document.addEventListener('DOMContentLoaded', () => {
    const badge = document.createElement('div');
    badge.textContent = 'STAGING · FORMULARIOS SIMULADOS';
    badge.setAttribute('role', 'status');
    badge.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:2147483647;background:#242424;color:#fff;padding:4px 9px;font:10px Arial,sans-serif;letter-spacing:.04em;pointer-events:none';
    document.body.appendChild(badge);
  }, {once: true});

  // Responses stay in this page's memory: no request or form data leaves it.
  window.sensoStagingQA = Object.freeze({
    enqueue: options => queue.push({status: Number(options?.status ?? 200), delay: Number(options?.delay ?? 0)}),
    calls: () => calls.map(({status, delay}) => ({status, delay})),
    reset: () => { queue.length = 0; calls.length = 0; }
  });
  window.fetch = (input, init) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
    if (!safeOrigin(url.href)) return Promise.reject(new TypeError('Staging blocks external network requests'));
    if (url.pathname === mockPath) {
      const scenario = queue.shift() || {status: 200, delay: 0};
      calls.push(scenario);
      return new Promise(resolve => setTimeout(() => resolve(new Response(
        JSON.stringify(scenario.status < 400 ? {ok: true} : {error: 'Simulated error'}),
        {status: scenario.status, headers: {'Content-Type': 'application/json'}}
      )), Math.max(0, scenario.delay)));
    }
    return nativeFetch(input, init);
  };
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    const target = new URL(url, location.href);
    if (!safeOrigin(target.href) || target.pathname === mockPath) {
      throw new DOMException('Staging blocks external and unmocked XHR', 'SecurityError');
    }
    return open.call(this, method, url, ...rest);
  };
  if (navigator.sendBeacon) {
    const beacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => safeOrigin(url) && new URL(url, location.href).pathname !== mockPath
      ? beacon(url, data) : false;
  }
})();
