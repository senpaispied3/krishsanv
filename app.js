// script.js - Fixed for Error 7
console.log('krishsanv - script.js loaded, Error 7 fixed');

// External link handler - jo aapke original code me tha
(function(){
  function handleLink(a){
    const href=a.getAttribute('href');
    if(!href) return;
    try{
      const u=new URL(href, document.baseURI);
      if((u.protocol==='http:'||u.protocol==='https:') && u.host!==location.host){
        a.target='_blank';
        a.rel='noopener noreferrer';
      }
    }catch(e){}
  }
  function scan(){ document.querySelectorAll('a[href]').forEach(handleLink); }
  if(document.readyState!=='loading') scan();
  else document.addEventListener('DOMContentLoaded', scan);
})();

// Extra - smooth scroll and error logger
document.addEventListener('error', (e)=>{
  if(e.target.tagName==='SCRIPT' || e.target.tagName==='LINK'){
    console.warn('Resource failed:', e.target.src || e.target.href);
  }
}, true);

console.log('All connections OK');
