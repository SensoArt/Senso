(()=> {
  if (window.__sensoAnalyticsReady) return;
  window.__sensoAnalyticsReady = true;

  const GA4_ID='G-6KCBPBC06L';
  const META_PIXEL_ID='2442677362880993';
  const CONSENT_KEY='senso_consent_v1';
  const ATTR_KEY='senso_attribution_v1';
  const SESSION_KEY='senso_session_id_v1';
  const CONSENT_MAX_AGE_MS=1000*60*60*24*730;
  const isProduction=/^(www\.)?senso-art\.com$/i.test(location.hostname);
  const query=new URLSearchParams(location.search);
  if(query.get('senso_internal')==='1'){
    try{sessionStorage.setItem('senso_internal_v1','1')}catch(e){}
  }
  let internalSession=false;
  try{internalSession=sessionStorage.getItem('senso_internal_v1')==='1'}catch(e){}
  const isQa=query.get('senso_qa')==='1'||query.get('senso_internal')==='1'||internalSession;
  const pagePath=location.protocol==='file:'?'/'+location.pathname.split('/').pop():location.pathname;
  const path=(pagePath.replace(/\/index\.html$/,'/')||'/').replace(/\/+/g,'/');
  const dataLayer=window.dataLayer=window.dataLayer||[];
  const scrollMarks=new Set();
  let lastForm=null;
  const successfulForms=new WeakMap();
  let gaLoaded=false;
  let metaLoaded=false;

  function safeText(value,max=180){
    if(value==null) return undefined;
    const s=String(value).replace(/\s+/g,' ').trim();
    // Analytics dimensions must never contain contact details or arbitrary URLs.
    if(!s||/@|(?:\+?\d[\d ().-]{7,}\d)|[?&#=]/.test(s)) return undefined;
    return s.slice(0,max);
  }

  function currentLanguage(){
    const root=(document.documentElement.lang||'').toLowerCase();
    const esActive=!!document.querySelector('#btn-es.active,[data-set-lang="es"].active,.lang-btn[data-lang="es"].active');
    let stored='';
    try{stored=(localStorage.getItem('senso_lang')||'').toLowerCase()}catch(e){}
    const enActive=!!document.querySelector('#btn-en.active,[data-set-lang="en"].active,.lang-btn[data-lang="en"].active');
    if(esActive||enActive) return esActive?'es':'en';
    if(root.startsWith('it')) return 'it';
    if(root.startsWith('es')) return 'es';
    if(root.startsWith('en')) return 'en';
    return stored.startsWith('es')?'es':'en';
  }

  function businessArea(){
    const p=path.toLowerCase();
    if(/studio/.test(p)) return 'studio';
    if(/art-consulting|asesoria-de-arte/.test(p)) return 'art_consulting';
    if(/catalogue|arantxa|carlotta|catherine|ciaramella|disena|lucia|paolo|rafael|raul|valentina/.test(p)) return 'collect_art';
    if(/exhibitions|exposiciones|principium|resonance\.html/.test(p)) return 'exhibitions';
    if(/journal|on-opening|the-need-for-beauty|resonance-journal/.test(p)) return 'journal';
    if(/artists|artistas/.test(p)) return 'artists';
    if(/contacts|contacto/.test(p)) return 'contact';
    if(/about/.test(p)) return 'about';
    return 'home';
  }

  function sessionId(){
    try{
      let id=sessionStorage.getItem(SESSION_KEY);
      if(!id){
        id=(crypto?.randomUUID?.()||('s_'+Date.now().toString(36)+Math.random().toString(36).slice(2)));
        sessionStorage.setItem(SESSION_KEY,id);
      }
      return id;
    }catch(e){return undefined}
  }

  function rawConsent(){
    try{return JSON.parse(localStorage.getItem(CONSENT_KEY)||'null')}catch(e){return null}
  }

  function consentAllowsAnalytics(){
    const c=rawConsent();
    if(!c||c.analytics!==true) return false;
    const updated=Date.parse(c.updated_at||'');
    return Number.isFinite(updated) && Date.now()-updated<=CONSENT_MAX_AGE_MS;
  }

  function attribution(){
    const qs=new URLSearchParams(location.search);
    const incoming={
      utm_source:safeText(qs.get('utm_source'),80),
      utm_medium:safeText(qs.get('utm_medium'),80),
      utm_campaign:safeText(qs.get('utm_campaign'),120),
      utm_content:safeText(qs.get('utm_content'),120),
      utm_term:safeText(qs.get('utm_term'),120),
      gclid:safeText(qs.get('gclid'),120),
      fbclid:safeText(qs.get('fbclid'),160),
      landing_page:path,
      referrer:document.referrer?referrerDomain(document.referrer):undefined
    };
    if(!consentAllowsAnalytics()) return incoming;
    try{
      const saved=JSON.parse(sessionStorage.getItem(ATTR_KEY)||'{}');
      const campaignHit=incoming.utm_source||incoming.utm_medium||incoming.utm_campaign||incoming.gclid||incoming.fbclid;
      if(!saved.landing_page||campaignHit){
        const next={...saved,...Object.fromEntries(Object.entries(incoming).filter(([,v])=>v))};
        sessionStorage.setItem(ATTR_KEY,JSON.stringify(next));
        return next;
      }
      return saved;
    }catch(e){return incoming}
  }

  function referrerDomain(value){
    try{return new URL(value).hostname.toLowerCase().slice(0,120)}catch(e){return undefined}
  }

  let attr=attribution();
  let sid=consentAllowsAnalytics()?sessionId():undefined;

  function acquisitionChannel(){
    const medium=(attr.utm_medium||'').toLowerCase();
    const source=(attr.utm_source||'').toLowerCase();
    const campaign=(attr.utm_campaign||'').toLowerCase();
    if(attr.gclid||/(cpc|ppc|paid_search|search_ads)/.test(medium)) return 'paid_search';
    if(/partner|dmc|agency|referral_partner/.test(medium+' '+source+' '+campaign)) return 'partner_outreach';
    if(/email|outbound|founder_outreach/.test(medium+' '+campaign)) return 'email_outreach';
    if(/social/.test(medium)||/linkedin|instagram|facebook|meta/.test(source)) return 'organic_social';
    if(/referral/.test(medium)) return 'referral';
    if(source&&/google|bing|duckduckgo|yahoo/.test(source)) return 'organic_search';
    try{
      if(attr.referrer){
        const host=attr.referrer.toLowerCase();
        if(/google\.|bing\.|duckduckgo\.|search\.yahoo\./.test(host)) return 'organic_search';
        if(/linkedin\.|instagram\.|facebook\.|t\.co$|x\.com$/.test(host)) return 'organic_social';
        if(host&&host!==location.hostname) return 'referral';
      }
    }catch(e){}
    return source?'other_campaign':'direct';
  }

  function readConsent(){
    try{
      const c=JSON.parse(localStorage.getItem(CONSENT_KEY)||'null');
      if(!c||typeof c.analytics!=='boolean'||typeof c.marketing!=='boolean') return null;
      const updated=Date.parse(c.updated_at||'');
      if(!Number.isFinite(updated)||Date.now()-updated>CONSENT_MAX_AGE_MS){
        localStorage.removeItem(CONSENT_KEY);
        sessionStorage.removeItem(ATTR_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return c;
    }catch(e){}
    return null;
  }

  function clean(params={}){
    const out={};
    Object.entries(params).forEach(([k,v])=>{
      if(v===undefined||v===null||v==='') return;
      if(typeof v==='string') out[k]=safeText(v,220);
      else if(typeof v==='number'||typeof v==='boolean') out[k]=v;
    });
    return out;
  }

  window.gtag=window.gtag||function(){dataLayer.push(arguments)};
  window.gtag('consent','default',{
    analytics_storage:'denied',
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied',
    wait_for_update:500
  });

  function updateGoogleConsent(consent){
    window.gtag('consent','update',{
      analytics_storage:consent.analytics?'granted':'denied',
      ad_storage:consent.marketing?'granted':'denied',
      ad_user_data:consent.marketing?'granted':'denied',
      ad_personalization:consent.marketing?'granted':'denied'
    });
  }

  function loadGA(){
    if(gaLoaded||!isProduction||isQa) return;
    gaLoaded=true;
    const s=document.createElement('script');
    s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.gtag('js',new Date());
    window.gtag('config',GA4_ID,{
      send_page_view:true,
      allow_google_signals:false,
      business_area:businessArea()
    });
  }

  function loadMeta(){
    if(metaLoaded||!isProduction||isQa) return;
    metaLoaded=true;
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init',META_PIXEL_ID);
    window.fbq('consent','grant');
    window.fbq('track','PageView');
  }

  function applyConsent(consent){
    updateGoogleConsent(consent);
    if(consent.analytics) loadGA();
    if(consent.marketing) loadMeta();
    else if(typeof window.fbq==='function'){
      try{window.fbq('consent','revoke')}catch(e){}
    }
  }

  function saveConsent(consent){
    const hadAnalytics=canAnalytics();
    const value={analytics:!!consent.analytics,marketing:!!consent.marketing,updated_at:new Date().toISOString()};
    try{localStorage.setItem(CONSENT_KEY,JSON.stringify(value))}catch(e){}
    if(value.analytics){
      attr=attribution();
      sid=sessionId();
      enrichForms();
    }else{
      try{sessionStorage.removeItem(ATTR_KEY);sessionStorage.removeItem(SESSION_KEY)}catch(e){}
      sid=undefined;
    }
    applyConsent(value);
    if(value.analytics&&!hadAnalytics){
      window.sensoTrack('senso_section_view',{section:businessArea()});
      if(businessArea()==='collect_art'&&path!=='/catalogue.html')
        window.sensoTrack('senso_artist_view',{artist:path.slice(1).replace(/\.html$/,'')});
      document.dispatchEvent(new Event('senso:consent'));
    }
    hideConsent();
    ensureFooterSettingsLink();
  }

  function clearCookie(name){
    const host=location.hostname.replace(/^www\./,'');
    [
      '; path=/',
      '; path=/; domain='+location.hostname,
      '; path=/; domain=.'+host
    ].forEach(scope=>{document.cookie=name+'=; expires=Thu, 01 Jan 1970 00:00:00 GMT'+scope});
  }

  function revokeCookies(consent){
    if(!consent.analytics){
      document.cookie.split(';').map(x=>x.split('=')[0].trim()).filter(x=>x.startsWith('_ga')).forEach(clearCookie);
    }
    if(!consent.marketing){
      ['_fbp','_fbc'].forEach(clearCookie);
    }
  }

  function consentCopy(){
    return currentLanguage()==='es'?{
      text:'Usamos cookies de analítica para entender cómo se utiliza Senso y, si lo aceptas, cookies de marketing para medir campañas.',
      accept:'Aceptar todo',reject:'Rechazar',settings:'Configurar',save:'Guardar',
      analytics:'Analítica',marketing:'Marketing',title:'Preferencias de cookies',reopen:'Cookies',
      policy:'Política de cookies',privacy:'Privacidad'
    }:{
      text:'We use analytics cookies to understand how Senso is used and, if you accept, marketing cookies to measure campaigns.',
      accept:'Accept all',reject:'Reject',settings:'Settings',save:'Save',
      analytics:'Analytics',marketing:'Marketing',title:'Cookie preferences',reopen:'Cookies',
      policy:'Cookie policy',privacy:'Privacy'
    };
  }

  function consentCSS(){
    if(document.getElementById('senso-consent-style')) return;
    const style=document.createElement('style');
    style.id='senso-consent-style';
    style.textContent=`
      #senso-consent{position:fixed;z-index:2147483000;left:18px;right:18px;bottom:18px;background:#f2efe8;color:#111;border:1px solid rgba(0,0,0,.16);padding:18px 20px;font-family:Futura,Arial,sans-serif;box-shadow:0 10px 35px rgba(0,0,0,.12)}
      #senso-consent .sc-row{display:flex;align-items:center;justify-content:space-between;gap:24px}
      #senso-consent .sc-copy{max-width:760px;font-size:12px;line-height:1.5;letter-spacing:.01em}
      #senso-consent .sc-more{margin-top:7px;font-size:10px;letter-spacing:.06em}
      #senso-consent .sc-more a{color:inherit;text-decoration:none;border-bottom:1px solid rgba(0,0,0,.45);padding-bottom:1px}
      #senso-consent .sc-more a:hover{border-bottom-color:#111}
      #senso-consent .sc-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
      #senso-consent button{font:inherit;text-transform:uppercase;letter-spacing:.11em;font-size:10px;border:0;background:none;color:#111;cursor:pointer;padding:7px 0;border-bottom:1px solid #111}
      #senso-consent button+button{margin-left:5px}
      #senso-consent .sc-settings{display:none;border-top:1px solid rgba(0,0,0,.14);margin-top:16px;padding-top:14px}
      #senso-consent.open .sc-settings{display:block}
      #senso-consent .sc-title{font-family:Behind,Georgia,serif;font-size:22px;margin-bottom:12px}
      #senso-consent .sc-options{display:flex;gap:28px;align-items:center;flex-wrap:wrap}
      #senso-consent label{font-size:12px;display:flex;align-items:center;gap:8px}
      #senso-consent input{accent-color:#111}
      .senso-cookie-footer-wrap{display:inline-flex;align-items:center;gap:.65em;margin-left:.65em}
      .senso-cookie-footer-separator{opacity:.45}
      .senso-cookie-footer-link{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;letter-spacing:inherit;text-transform:none;font-size:inherit;line-height:inherit;opacity:.68}
      .senso-cookie-footer-link:hover,.senso-cookie-footer-link:focus-visible{opacity:1;text-decoration:underline;text-underline-offset:2px}
      .senso-privacy-note{font-family:inherit;font-size:10px;line-height:1.45;opacity:.62;margin:10px 0 0}
      .senso-privacy-note a{color:inherit;text-decoration:underline;text-underline-offset:2px}
      @media(max-width:700px){
        .senso-cookie-footer-wrap{margin-left:.55em;gap:.55em}
      }
      @media(max-width:700px){
        #senso-consent{left:10px;right:10px;bottom:10px;padding:16px}
        #senso-consent .sc-row{align-items:flex-start;flex-direction:column;gap:14px}
        #senso-consent .sc-actions{justify-content:flex-start}
        #senso-consent .sc-copy{font-size:11px}
      }`;
    document.head.appendChild(style);
  }

  function hideConsent(){
    document.getElementById('senso-consent')?.remove();
  }

  function showConsent(openSettings=false){
    consentCSS();
    hideConsent();
    document.getElementById('senso-cookie-settings')?.remove();
    const c=consentCopy();
    const saved=readConsent()||{analytics:false,marketing:false};
    const box=document.createElement('div');
    box.id='senso-consent';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-label',c.title);
    if(openSettings) box.classList.add('open');
    box.innerHTML=`
      <div class="sc-row">
        <div class="sc-copy">${c.text}<div class="sc-more"><a href="cookie-policy.html">${c.policy}</a></div></div>
        <div class="sc-actions">
          <button type="button" data-sc="accept">${c.accept}</button>
          <button type="button" data-sc="reject">${c.reject}</button>
          <button type="button" data-sc="settings">${c.settings}</button>
        </div>
      </div>
      <div class="sc-settings">
        <div class="sc-title">${c.title}</div>
        <div class="sc-options">
          <label><input type="checkbox" data-sc-option="analytics" ${saved.analytics?'checked':''}> ${c.analytics}</label>
          <label><input type="checkbox" data-sc-option="marketing" ${saved.marketing?'checked':''}> ${c.marketing}</label>
          <button type="button" data-sc="save">${c.save}</button>
        </div>
      </div>`;
    box.addEventListener('click',e=>{
      const action=e.target?.dataset?.sc;
      if(!action) return;
      if(action==='accept') saveConsent({analytics:true,marketing:true});
      if(action==='reject'){
        const value={analytics:false,marketing:false};
        saveConsent(value);revokeCookies(value);
      }
      if(action==='settings') box.classList.toggle('open');
      if(action==='save'){
        const value={
          analytics:!!box.querySelector('[data-sc-option="analytics"]')?.checked,
          marketing:!!box.querySelector('[data-sc-option="marketing"]')?.checked
        };
        saveConsent(value);revokeCookies(value);
      }
    });
    document.body.appendChild(box);
  }

  function ensureFooterSettingsLink(){
    if(document.querySelector('.senso-cookie-footer-link')) return;
    consentCSS();
    const footer=document.querySelector('footer');
    if(!footer) return;
    const target=footer.querySelector('.footer-left')||footer.firstElementChild||footer;
    const wrap=document.createElement('span');
    wrap.className='senso-cookie-footer-wrap';

    const privacy=document.createElement('a');
    privacy.className='senso-cookie-footer-link senso-privacy-footer-link';
    privacy.href='privacy.html';
    privacy.textContent=consentCopy().privacy;

    const separator=document.createElement('span');
    separator.className='senso-cookie-footer-separator';
    separator.setAttribute('aria-hidden','true');
    separator.textContent='·';

    const button=document.createElement('button');
    button.className='senso-cookie-footer-link';
    button.type='button';
    button.textContent='Cookies';
    button.setAttribute('aria-label',consentCopy().title);
    button.addEventListener('click',()=>showConsent(true));

    wrap.append(privacy,separator,button);
    target.appendChild(wrap);
  }

  function canAnalytics(){
    return !!readConsent()?.analytics;
  }
  function canMarketing(){
    return !!readConsent()?.marketing;
  }

  function meta(event,params){
    if(isQa||!canMarketing()||typeof window.fbq!=='function') return;
    const p=clean(params);
    try{
      if(['artwork_enquiry','artist_enquiry','studio_enquiry','consulting_enquiry','general_contact'].includes(event)) window.fbq('track','Lead',p);
      else if(event==='senso_contact_click') window.fbq('track','Contact',p);
      else if(event==='senso_artwork_enquiry_open') window.fbq('trackCustom','ArtworkEnquiryOpen',p);
      else if(event==='senso_studio_interest') window.fbq('trackCustom','StudioInterest',p);
      else if(event==='senso_commercial_click') window.fbq('trackCustom','CommercialClick',p);
    }catch(e){}
  }

  window.sensoTrack=function(event,params={}){
    const payload=clean({
      page_path:path,
      page_title:document.title,
      language:currentLanguage(),
      business_area:businessArea(),
      acquisition_channel:acquisitionChannel(),
      landing_page:attr.landing_page,
      utm_source:attr.utm_source,
      utm_medium:attr.utm_medium,
      utm_campaign:attr.utm_campaign,
      referrer_domain:attr.referrer,
      ...params
    });
    if(!isProduction||isQa){
      (window.sensoDebugEvents=window.sensoDebugEvents||[]).push({event,payload});
      return payload;
    }
    if(canAnalytics()&&typeof window.gtag==='function'){
      try{window.gtag('event',event,payload)}catch(e){}
    }
    meta(event,payload);
    return payload;
  };

  function formName(form){
    if(!form) return 'unknown';
    return safeText(form.querySelector('input[name="source"]')?.value||form.id||form.getAttribute('name')||'form',80);
  }

  function addHidden(form,name,value){
    if(!form||value==null||value==='') return;
    let input=form.querySelector('input[name="'+CSS.escape(name)+'"]');
    if(!input){
      input=document.createElement('input');
      input.type='hidden';input.name=name;form.appendChild(input);
    }
    input.value=String(value);
  }

  function ensureFormPrivacyNotes(){
    const es=currentLanguage()==='es';
    document.querySelectorAll('form').forEach(form=>{
      let note=form.querySelector('.senso-privacy-note');
      if(!note){
        note=document.createElement('p');
        note.className='senso-privacy-note';
        const submit=form.querySelector('button[type="submit"],input[type="submit"]');
        if(submit) submit.insertAdjacentElement('beforebegin',note);
        else form.appendChild(note);
      }
      note.innerHTML=es
        ? 'Usaremos tus datos únicamente para gestionar tu solicitud. <a href="privacy.html">Privacidad</a>.'
        : 'We will use your data only to manage your request. <a href="privacy.html">Privacy</a>.';
    });
  }

  function enrichForms(){
    document.querySelectorAll('form').forEach(form=>{
      const fields={
        senso_business_area:businessArea(),
        senso_acquisition_channel:acquisitionChannel(),
        senso_landing_page:attr.landing_page||path,
        senso_referrer:attr.referrer,
        senso_utm_source:attr.utm_source,
        senso_utm_medium:attr.utm_medium,
        senso_utm_campaign:attr.utm_campaign,
        senso_utm_content:attr.utm_content,
        senso_utm_term:attr.utm_term,
        senso_gclid:attr.gclid,
        senso_fbclid:attr.fbclid,
        senso_session_id:sid
      };
      if(isQa) fields.senso_test_submission='true';
      Object.entries(fields).forEach(([k,v])=>addHidden(form,k,v));
    });
  }

  function formContext(form){
    const read=name=>safeText(form?.querySelector('[name="'+name+'"]')?.value,120);
    const selectedArtwork=read('artwork');
    const artworkParts=selectedArtwork?.split(' — ')||[];
    return clean({
      form_name:formName(form),
      source:read('source'),
      artwork:artworkParts.length===2?artworkParts[0]:selectedArtwork,
      artist:read('artist')||(artworkParts.length===2?artworkParts[1]:undefined),
      request:read('request'),
      interest:read('interest'),
      journey:read('journey'),
      project_type:read('project_type')
    });
  }

  function conversionType(form,context){
    if(path==='/contacts.html'||path==='/contacto.html') return 'newsletter_signup';
    if(context.artwork||path==='/catalogue.html') return 'artwork_enquiry';
    if(context.artist) return 'artist_enquiry';
    if(context.interest&&path==='/contact-extra-gold-preview.html'){
      if(/studio/i.test(context.interest)) return 'studio_enquiry';
      if(/consulting/i.test(context.interest)) return 'consulting_enquiry';
    }
    if(context.project_type||/art-consulting|asesoria-de-arte/.test(path)) return 'consulting_enquiry';
    if(/studio/.test(path)) return 'studio_enquiry';
    return 'general_contact';
  }

  document.addEventListener('focusin',event=>{
    const form=event.target?.closest?.('form');
    if(!form||form.dataset.sensoStarted==='1'||!event.target.matches('input,select,textarea')) return;
    form.dataset.sensoStarted='1';
    window.sensoTrack('senso_form_start',formContext(form));
  },true);

  document.addEventListener('submit',event=>{
    const form=event.target;
    lastForm={form,...formContext(form),area:businessArea(),time:Date.now()};
    window.sensoTrack('senso_form_submit_attempt',lastForm);
  },true);

  const nativeFetch=window.fetch?.bind(window);
  if(nativeFetch){
    window.fetch=async (...args)=>{
      const response=await nativeFetch(...args);
      try{
        const req=args[0],opts=args[1]||{};
        const url=typeof req==='string'?req:req?.url||'';
        const method=(opts.method||req?.method||'GET').toUpperCase();
        if(response.ok&&method==='POST'&&/formspree\.io\/f\//i.test(url)){
          const recent=lastForm&&Date.now()-lastForm.time<15000?lastForm:null;
          const form=recent?.form;
          if(form){
            const context=formContext(form);
            const key=JSON.stringify(context);
            const previous=successfulForms.get(form);
            if(!previous||previous.key!==key||Date.now()-previous.time>10000){
              successfulForms.set(form,{key,time:Date.now()});
              const type=conversionType(form,context);
              window.sensoTrack(type,{...context,conversion_type:type,service:recent.area});
            }
          }
        }
      }catch(e){}
      return response;
    };
  }

  document.addEventListener('click',event=>{
    const el=event.target?.closest?.('a,button');
    if(!el) return;
    const href=el.tagName==='A'?(el.getAttribute('href')||''):'';
    const label=safeText(el.dataset.interest||el.getAttribute('aria-label')||el.textContent,120);

    if(/^mailto:/i.test(href)){
      window.sensoTrack('senso_contact_click',{channel:'email',label});return;
    }
    if(/^tel:/i.test(href)){
      window.sensoTrack('senso_contact_click',{channel:'phone',label});return;
    }
    if(/wa\.me|whatsapp\.com/i.test(href)){
      window.sensoTrack('senso_contact_click',{channel:'whatsapp',label});return;
    }
    if(/instagram\.com|linkedin\.com/i.test(href)){
      window.sensoTrack('senso_social_click',{network:/instagram/i.test(href)?'instagram':'linkedin',label});return;
    }
    if(el.matches('[data-open-drawer]')){
      window.sensoTrack('senso_studio_interest',{interest:safeText(el.dataset.interest||label,120),journey:safeText(el.dataset.mode,60)});
      window.sensoTrack('senso_form_open',{form_name:'studio-form'});return;
    }
    if(el.matches('.oldmail')){
      const work=el.closest('.work');
      const artwork={
        artwork:safeText(work?.querySelector('.title')?.textContent,120),
        artist:safeText(work?.querySelector('.artist')?.textContent,120)
      };
      window.sensoTrack('senso_artwork_click',artwork);
      window.sensoTrack('senso_artwork_enquiry_open',artwork);
      window.sensoTrack('senso_form_open',{form_name:'artEnquiryForm'});return;
    }
    if(el.matches('[data-set-lang],[data-legal-lang],.lang-btn,[data-lang-btn],#btn-en,#btn-es')){
      const selected=el.dataset.setLang||el.dataset.langBtn||safeText(el.textContent,8);
      window.sensoTrack('senso_language_change',{selected_language:safeText(selected,8)});
      setTimeout(()=>{
        ensureFormPrivacyNotes();
        const privacy=document.querySelector('.senso-privacy-footer-link');
        if(privacy) privacy.textContent=consentCopy().privacy;
      },0);
      return;
    }
    if(href&&/^(https?:)?\/\//i.test(href)){
      try{
        const u=new URL(href,location.href);
        if(u.hostname!==location.hostname){
          window.sensoTrack('senso_outbound_click',{target:u.hostname,label});return;
        }
      }catch(e){}
    }
    if(href&&!/^#|^javascript:/i.test(href)){
      const commercial=/(?:contacts|contacto|art-consulting|asesoria-de-arte|studio|catalogue)\.html/i.test(href);
      if(/(?:arantxa|carlotta|catherine|ciaramella|disena|lucia|paolo|rafael|raul|valentina)[^/]*\.html/i.test(href)){
        window.sensoTrack('senso_artist_click',{target:safeText(href,120)});
        return;
      }
      window.sensoTrack(commercial?'senso_commercial_click':'senso_internal_link_click',{
        target:safeText(href,180),label
      });
    }
  },true);

  function onScroll(){
    const doc=document.documentElement;
    const max=Math.max(1,doc.scrollHeight-innerHeight);
    const pct=Math.round((scrollY/max)*100);
    [25,50,75,90].forEach(mark=>{
      if(pct>=mark&&!scrollMarks.has(mark)){
        scrollMarks.add(mark);
        window.sensoTrack('senso_scroll_depth',{percent:mark});
      }
    });
  }

  function boot(){
    enrichForms();
    ensureFormPrivacyNotes();
    const consent=readConsent();
    ensureFooterSettingsLink();
    if(consent) applyConsent(consent);
    else showConsent(false);
    window.sensoTrack('senso_section_view',{section:businessArea()});
    if(businessArea()==='collect_art'&&path!=='/catalogue.html')
      window.sensoTrack('senso_artist_view',{artist:path.slice(1).replace(/\.html$/,'')});
    if(path==='/catalogue.html'&&'IntersectionObserver' in window){
      const seen=new WeakSet();
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting||seen.has(entry.target)) return;
        if(isProduction&&!canAnalytics()) return;
        seen.add(entry.target);
        window.sensoTrack('senso_artwork_view',{
          artwork:safeText(entry.target.querySelector('.title')?.textContent,120),
          artist:safeText(entry.target.querySelector('.artist')?.textContent,120)
        });
      }),{threshold:.5});
      const cards=document.querySelectorAll('.work');
      cards.forEach(card=>observer.observe(card));
      document.addEventListener('senso:consent',()=>cards.forEach(card=>{
        if(!seen.has(card)){observer.unobserve(card);observer.observe(card)}
      }));
    }
    // Paolo's legacy form was the only native redirect and had no observable success state.
    if(path==='/paolo-agostini.html'){
      const form=document.getElementById('contact-form');
      const button=document.getElementById('submit-btn');
      const error=document.getElementById('error-msg');
      const thankYou=document.getElementById('thank-you-block');
      form?.addEventListener('submit',async event=>{
        event.preventDefault();
        if(!form.reportValidity()||button.disabled) return;
        button.disabled=true;
        if(error) error.style.display='none';
        try{
          const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
          if(!response.ok) throw new Error('Form submission failed');
          form.style.display='none';
          if(thankYou) thankYou.style.display='block';
        }catch(e){
          button.disabled=false;
          if(error) error.style.display='block';
        }
      });
    }
    addEventListener('scroll',onScroll,{passive:true});
  }

  if(document.readyState==='complete') boot();
  else document.addEventListener('DOMContentLoaded',boot,{once:true});
})();
