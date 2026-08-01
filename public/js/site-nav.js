/* Shared site header behavior: desktop mega-menu (hover + click/tap) and the mobile burger menu.
   Works with the markup contract in /css/site-nav.css. Safe to include on any page —
   it no-ops if the expected elements aren't present. */
(function(){
  function initDropdowns(){
    var header=document.querySelector('.site-header');
    var items=document.querySelectorAll('.sh-item[data-menu]');
    var panels=document.querySelectorAll('.sh-panel[data-menu]');
    if(!header||!items.length||!panels.length) return;

    var panelByMenu={};
    panels.forEach(function(p){ panelByMenu[p.getAttribute('data-menu')]=p; });

    function closeAll(){
      items.forEach(function(it){
        it.classList.remove('open');
        var link=it.querySelector('.sh-link');
        if(link) link.setAttribute('aria-expanded','false');
      });
      panels.forEach(function(p){ p.classList.remove('open'); });
    }

    function openMenuFor(item){
      var panel=panelByMenu[item.getAttribute('data-menu')];
      if(!panel) return;
      closeAll();
      item.classList.add('open');
      panel.classList.add('open');
      var link=item.querySelector('.sh-link');
      if(link) link.setAttribute('aria-expanded','true');
    }

    items.forEach(function(item){
      var link=item.querySelector('.sh-link');
      var panel=panelByMenu[item.getAttribute('data-menu')];
      if(!link||!panel) return;

      item.addEventListener('mouseenter',function(){
        openMenuFor(item);
      });

      link.addEventListener('click',function(e){
        // Toggle-only links (no real destination, e.g. "Solutions") never navigate —
        // clicking just opens/closes the panel, which matters for touch (no hover).
        if(link.hasAttribute('data-toggle-only')){
          e.preventDefault();
          var isOpen=item.classList.contains('open');
          closeAll();
          if(!isOpen) openMenuFor(item);
        }
        // Links with a real href (e.g. "Home", "Pricing") just navigate normally.
      });
    });

    header.addEventListener('mouseleave',function(){
      closeAll();
    });

    document.addEventListener('click',function(e){
      if(!e.target.closest('.sh-item') && !e.target.closest('.sh-panel')) closeAll();
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape') closeAll();
    });
  }

  function initBurger(){
    var burgerBtn=document.getElementById('sh-burger-btn');
    var mobileMenu=document.getElementById('sh-mobile-menu');
    if(!burgerBtn||!mobileMenu) return;
    burgerBtn.addEventListener('click',function(){
      var open=mobileMenu.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded',String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){
        mobileMenu.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded','false');
      });
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){ initDropdowns(); initBurger(); });
  }else{
    initDropdowns();
    initBurger();
  }
})();
