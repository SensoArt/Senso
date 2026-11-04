/* Local staging QA. All non-local browser requests are intercepted and aborted. */
const {chromium} = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs');
const path = require('node:path');
const BASE = 'http://127.0.0.1:8765';
const out = path.join(process.cwd(), 'staging-test-results');
fs.mkdirSync(out, {recursive:true});
const results = [], blocked = [], failures = [];
const assert = (value, message) => { if (!value) throw new Error(message); };
async function check(name, fn) {
  try { await fn(); results.push({name, status:'PASS'}); console.log('PASS', name); }
  catch (e) { results.push({name, status:'FAIL', error:String(e)}); failures.push(name); console.error('FAIL', name, String(e)); }
}

(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_BIN});
  const context = await browser.newContext({viewport:{width:1440,height:900}});
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === BASE || url.protocol === 'data:' || url.protocol === 'blob:') return route.continue();
    blocked.push({url: url.origin, type: route.request().resourceType()});
    return route.abort();
  });
  const page = await context.newPage();
  page.on('dialog', d => d.dismiss());
  await check('HTTP headers and exact home title', async () => {
    const r = await page.goto(BASE + '/index.html');
    assert(r.status()===200, 'home HTTP');
    assert(/noindex/i.test(r.headers()['x-robots-tag']||''), 'noindex header missing');
    assert(/form-action 'self'/.test(r.headers()['content-security-policy']||''), 'CSP missing');
    assert(await page.title()==='Senso | Contemporary Art Expression', 'home title changed');
    assert(await page.getByText('STAGING · FORMULARIOS SIMULADOS').count()===1, 'staging indicator missing');
  });
  await check('Production network targets rejected by guard', async () => {
    const verdict = await page.evaluate(async () => {
      const urls=['https://formspree.io/f/mgorwree','https://www.google-analytics.com/g/collect','https://connect.facebook.net/en_US/fbevents.js'];
      return Promise.all(urls.map(u => fetch(u,{method:'POST'}).then(()=>false,()=>true)));
    });
    assert(verdict.every(Boolean), 'an external request was not rejected');
  });
  await check('CSP blocks dynamically added production form and tracking script', async () => {
    const directives = await page.evaluate(() => new Promise(resolve => {
      const seen=[];
      document.addEventListener('securitypolicyviolation', event => seen.push(event.effectiveDirective));
      const f=document.createElement('form'); f.method='POST'; f.action='https://formspree.io/f/mgorwree';
      document.body.appendChild(f); f.submit();
      const script=document.createElement('script'); script.src='https://www.googletagmanager.com/gtag/js?id=G-6KCBPBC06L';
      document.head.appendChild(script);
      setTimeout(()=>resolve(seen),600);
    }));
    assert(directives.includes('form-action') && directives.includes('script-src-elem'),JSON.stringify(directives));
  });
  const forms = [
    ['studio.html','#studio-form','studio'],['art-consulting.html','#consulting-form','consulting'],
    ['catalogue.html','#artEnquiryForm','catalogue'],['contacts.html','#contact-form','contacts'],
    ['studio-illa-del-llac.html','#studio-form','kids'],
    ...['arantxa-martinez-dugas','carlotta-valentinis','catherine-parra','davide-ciaramella','davide-disena','lucia-cheves','paolo-agostini','rafael-nuesi','rahim-el','raul-del-chano','valentina-bobbo'].map(n=>[n+'.html','#contact-form','artist'])
  ];
  async function prepare(file, selector, scenario) {
    await page.goto(BASE + '/' + file, {waitUntil:'domcontentloaded'});
    await page.evaluate(({selector,scenario}) => {
      window.sensoStagingQA.enqueue(scenario);
      const f=document.querySelector(selector);
      if (!f) throw Error('missing form');
      for (const el of f.querySelectorAll('input[required],textarea[required],select[required]')) {
        if (el.tagName==='SELECT') { const o=[...el.options].find(x=>x.value && !x.disabled); if(o) el.value=o.value; }
        else if (el.type==='email') el.value='qa@example.invalid';
        else if (el.type==='checkbox') el.checked=true;
        else if (el.type==='date') el.value='2027-02-01';
        else el.value='QA sample';
      }
      f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    }, {selector,scenario});
    await page.waitForFunction(() => window.sensoStagingQA.calls().length===1);
  }
  async function assertOutcome(kind, success) {
    if (kind==='studio') await page.waitForFunction(s=>document.querySelector('#form-status').classList.contains(s?'success':'error'),success);
    if (kind==='consulting') await page.waitForFunction(s=>{const t=document.querySelector('.web01-form-status')?.textContent||'';return s?/received/i.test(t):/couldn.t send/i.test(t)},success);
    if (kind==='catalogue') await page.waitForFunction(s=>s?document.querySelector('#artEnquiryForm').hidden:/try again/i.test(document.querySelector('[form="artEnquiryForm"]').textContent),success);
    if (kind==='artist') await page.waitForFunction(s=>getComputedStyle(document.querySelector(s?'#thank-you-block':'#error-msg')).display!=='none',success);
    if (kind==='contacts') await page.waitForFunction(s=>s?getComputedStyle(document.querySelector('#success-message')).display==='block':/ERROR/i.test(document.querySelector('#submit-btn').textContent),success);
    if (kind==='kids') await page.waitForFunction(s=>s?getComputedStyle(document.querySelector('#confirmation')).display==='block':!document.querySelector('#studio-form button').disabled,success);
  }
  for (const [file,selector,kind] of forms) {
    for (const [label,status] of [['error',500],['success',200]]) {
      await check(`${file}: simulated ${label}`, async () => {
        await prepare(file,selector,{status,delay:0});
        await assertOutcome(kind,status===200);
      });
    }
  }
  await check('Studio 16-second response preserves sending state', async () => {
    await prepare('studio.html','#studio-form',{status:200,delay:16000});
    assert(await page.locator('#submit-button').isDisabled(), 'button not disabled during request');
    await assertOutcome('studio',true);
  });
  await check('Concurrent mock requests retain independent responses', async () => {
    const result = await page.evaluate(async () => {
      sensoStagingQA.reset(); sensoStagingQA.enqueue({status:200,delay:600}); sensoStagingQA.enqueue({status:500,delay:30});
      const a=fetch('/__senso_staging_mock__/form',{method:'POST'});
      const b=fetch('/__senso_staging_mock__/form',{method:'POST'});
      const [x,y]=await Promise.all([a,b]);return [x.status,y.status,sensoStagingQA.calls().length];
    });
    assert(JSON.stringify(result)==='[200,500,2]', JSON.stringify(result));
  });
  await check('Two actual forms submit concurrently with independent simulated outcomes', async () => {
    const other=await context.newPage();
    try {
      await Promise.all([page.goto(BASE+'/studio.html'),other.goto(BASE+'/art-consulting.html')]);
      const fillAndSubmit = (p,selector,scenario) => p.evaluate(({selector,scenario})=>{
        sensoStagingQA.enqueue(scenario);
        const f=document.querySelector(selector);
        for(const el of f.querySelectorAll('input[required],select[required]')) {
          if(el.tagName==='SELECT') el.value=[...el.options].find(x=>x.value && !x.disabled).value;
          else el.value=el.type==='email'?'qa@example.invalid':'QA sample';
        }
        f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      },{selector,scenario});
      await Promise.all([fillAndSubmit(page,'#studio-form',{status:200,delay:700}),fillAndSubmit(other,'#consulting-form',{status:500,delay:20})]);
      await Promise.all([
        page.waitForFunction(()=>document.querySelector('#form-status').classList.contains('success')),
        other.waitForFunction(()=>/couldn.t send/i.test(document.querySelector('.web01-form-status')?.textContent||''))
      ]);
      assert(await page.evaluate(()=>sensoStagingQA.calls().length)===1,'studio call count');
      assert(await other.evaluate(()=>sensoStagingQA.calls().length)===1,'consulting call count');
    } finally { await other.close(); }
  });
  await check('Native form without JavaScript posts only to local mock endpoint', async () => {
    const nojs=await browser.newContext({javaScriptEnabled:false});
    await nojs.route('**/*',route => new URL(route.request().url()).origin===BASE?route.continue():route.abort());
    const p=await nojs.newPage();
    try {
      await p.goto(BASE+'/contacts.html');
      await p.locator('[name="first_name"]').fill('QA');
      await p.locator('[name="last_name"]').fill('Sample');
      await p.locator('[name="email"]').fill('qa@example.invalid');
      // requestSubmit uses the browser's native form path while page scripts remain disabled.
      const response=await Promise.all([p.waitForResponse(r=>r.url().includes('/__senso_staging_mock__/form')),p.locator('#contact-form').evaluate(form=>form.requestSubmit())]);
      assert(response[0].status()===501, 'local server must refuse native POST');
      assert(new URL(response[0].url()).origin===BASE, 'form left local origin');
    } finally { await nojs.close(); }
  });
  const pages=['index.html','about.html','artists.html','carlotta-valentinis.html','rahim-el.html','catalogue.html','art-consulting.html','studio.html','exhibitions.html','resonance.html','resonance-catalogue.html','journal.html','contacts.html'];
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:844});
    for(const file of pages) await check(`${width}px ${file}: page, local assets and overflow`, async () => {
      const bad=[];
      const listener = response => {if(response.url().startsWith(BASE) && response.status()>=400) bad.push(`${response.status()} ${new URL(response.url()).pathname}`)};
      page.on('response',listener);
      const response=await page.goto(BASE+'/'+file,{waitUntil:'load'});
      await page.evaluate(()=>document.fonts.ready);
      const state=await page.evaluate(()=>({title:document.title,body:!!document.body,overflow:document.documentElement.scrollWidth-innerWidth,images:[...document.images].filter(i=>i.complete && i.currentSrc && !i.naturalWidth).map(i=>i.getAttribute('src'))}));
      page.off('response',listener);
      assert(response.status()===200 && state.body && state.title,'page did not load');
      assert(!bad.length, 'HTTP errors: '+bad.join(','));
      assert(!state.images.length, 'broken images: '+state.images.join(','));
      assert(state.overflow<=2, `horizontal overflow ${state.overflow}px`);
    });
  }
  await check('Home EN/ES and navigation', async () => {
    await page.goto(BASE+'/index.html');
    await page.locator('#btn-es').click();
    assert(await page.locator('html').getAttribute('lang')==='es','Spanish language not selected');
    await page.locator('#btn-en').click();
    assert(await page.locator('html').getAttribute('lang')==='en','English language not selected');
    assert((await page.locator('a[href="studio.html"]').count())>0,'Studio navigation missing');
  });
  await check('Studio EN/ES drawer usable on mobile', async () => {
    await page.goto(BASE+'/studio.html');
    await page.locator('[data-set-lang="es"]').first().click();
    assert(await page.locator('html').getAttribute('lang')==='es','Spanish not selected');
    await page.locator('[data-open-drawer]:visible').first().click();
    assert(await page.locator('#studio-form').isVisible(),'drawer form not visible');
    await page.waitForFunction(()=>{const r=document.querySelector('.drawer').getBoundingClientRect();return r.left<=1 && r.right<=innerWidth+1});
    assert(await page.locator('#drawer-close').isVisible(),'drawer close button not visible');
  });
  await page.screenshot({path:path.join(out,'studio-mobile.png'),fullPage:false});
  await browser.close();
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base:BASE,results,externalRequestsBlocked:blocked,failures},null,2));
  console.log(JSON.stringify({passed:results.length-failures.length,failed:failures.length,externalRequestsBlocked:blocked.length}));
  if(failures.length) process.exitCode=1;
})().catch(e=>{ console.error(e);process.exitCode=1; });
