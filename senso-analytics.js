(()=> {
  if (window.__sensoAnalyticsReady) return;
  window.__sensoAnalyticsReady = true;

  const path = location.pathname.replace(/\/index\.html$/,'/') || '/';
  const dataLayer = window.dataLayer = window.dataLayer || [];
  const scrollMarks = new Set();

  function text(value, max=180){
    if(value == null) return undefined;
    const s=String(value).replace(/\s+/g,' ').trim();
    return s ? s.slice(0,max) : undefined;
  }

  function formName(form){
    if(!form) return 'unknown';
    const source=form.querySelector('input[name="source"]')?.value;
    return text(source || form.id || form.getAttribute('name') || 'form',80);
  }

  function attribution(){
    const qs=new URLSearchParams(location.search);
    const fresh={
      utm_source:text(qs.get('utm_source'),80),
      utm_medium:text(qs.get('utm_medium'),80),
      utm_campaign:text(qs.get('utm_campaign'),120),
      utm_content:text(qs.get('utm_content'),120),
      utm_term:text(qs.get('utm_term'),120),
      landing_page:path,
      referrer:document.referrer ? text(document.referrer,220) : undefined
    };
    try{
      const key='senso_attribution';
      const saved=JSON.parse(sessionStorage.getItem(key)||'{}');
      const hasFresh=Object.values(fresh).some(Boolean);
      if(hasFresh && (!saved.landing_page || fresh.utm_source || fresh.utm_campaign)){
        sessionStorage.setItem(key,JSON.stringify({...saved,...fresh}));
        return {...saved,...fresh};
      }
      if(saved.landing_page) return saved;
      sessionStorage.setItem(key,JSON.stringify(fresh));
    }catch(e){}
    return fresh;
  }

  const attr=attribution();

  function clean(params={}){
    const out={};
    Object.entries(params).forEach(([k,v])=>{
      if(v === undefined || v === null || v === '') return;
      if(typeof v === 'string') out[k]=text(v);
      else if(typeof v === 'number' || typeof v === 'boolean') out[k]=v;
    });
    return out;
  }

  function meta(event, params){
    if(typeof window.fbq !== 'function') return;
    try{
      if(event === 'generate_lead') window.fbq('track','Lead',clean(params));
      else if(event === 'senso_contact_click') window.fbq('track','Contact',clean(params));
      else if(event === 'senso_artwork_enquiry_open') window.fbq('trackCustom','ArtworkEnquiryOpen',clean(params));
      else if(event === 'senso_studio_interest') window.fbq('trackCustom','StudioInterest',clean(params));
      else if(event === 'senso_commercial_click') window.fbq('trackCustom','CommercialClick',clean(params));
      else if(event === 'senso_form_submit_attempt') window.fbq('trackCustom','FormSubmitAttempt',clean(params));
    }catch(e){}
  }

  window.sensoTrack=function(event, params={}){
    const payload=clean({
      event,
      page_path:path,
      page_title:document.title,
      language:document.documentElement.lang || 'en',
      ...attr,
      ...params
    });
    dataLayer.push(payload);
    try{
      if(typeof window.gtag === 'function'){
        const {event:_,...gaParams}=payload;
        window.gtag('event',event,gaParams);
      }
    }catch(e){}
    meta(event,payload);
    return payload;
  };

  window.sensoLead=function(form, params={}){
    return window.sensoTrack('generate_lead',{form_name:form,...params});
  };

  document.addEventListener('focusin',event=>{
    const form=event.target?.closest?.('form');
    if(!form || form.dataset.sensoStarted === '1') return;
    if(!event.target.matches('input,select,textarea')) return;
    form.dataset.sensoStarted='1';
    window.sensoTrack('senso_form_start',{form_name:formName(form)});
  },true);

  document.addEventListener('submit',event=>{
    const form=event.target;
    window.sensoTrack('senso_form_submit_attempt',{
      form_name:formName(form),
      form_id:text(form?.id,80)
    });
  },true);

  document.addEventListener('click',event=>{
    const el=event.target?.closest?.('a,button');
    if(!el) return;
    const href=el.tagName === 'A' ? (el.getAttribute('href')||'') : '';
    const label=text(el.dataset.interest || el.getAttribute('aria-label') || el.textContent,120);

    if(/^mailto:/i.test(href)){
      window.sensoTrack('senso_contact_click',{channel:'email',label});
      return;
    }
    if(/wa\.me|whatsapp\.com/i.test(href)){
      window.sensoTrack('senso_contact_click',{channel:'whatsapp',label});
      return;
    }
    if(el.matches('[data-open-drawer]')){
      window.sensoTrack('senso_studio_interest',{
        interest:text(el.dataset.interest || label,120),
        journey:text(el.dataset.mode,60)
      });
      return;
    }
    if(el.matches('.oldmail')){
      const work=el.closest('.work');
      window.sensoTrack('senso_artwork_enquiry_open',{
        artwork:text(work?.querySelector('.title')?.textContent,120),
        artist:text(work?.querySelector('.artist')?.textContent,120)
      });
      return;
    }
    if(el.matches('[data-set-lang]')){
      window.sensoTrack('senso_language_change',{selected_language:text(el.dataset.setLang,8)});
      return;
    }
    if(href && /(?:contacts|contacto|art-consulting|asesoria-de-arte|studio|catalogue)\.html/i.test(href)){
      window.sensoTrack('senso_commercial_click',{target:text(href,160),label});
    }
  },true);

  function onScroll(){
    const doc=document.documentElement;
    const max=Math.max(1,doc.scrollHeight-innerHeight);
    const pct=Math.round((scrollY/max)*100);
    [50,90].forEach(mark=>{
      if(pct>=mark && !scrollMarks.has(mark)){
        scrollMarks.add(mark);
        window.sensoTrack('senso_scroll_depth',{percent:mark});
      }
    });
  }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('load',()=>window.sensoTrack('senso_page_view'),{once:true});
})();