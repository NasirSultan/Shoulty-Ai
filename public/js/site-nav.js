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

  /* Auth-aware header state — mirrors components/Header.tsx: a logged-in user
     (shoutly_token + shoutly_user in localStorage) sees an avatar/profile
     dropdown instead of Log in / Start Free Trial. */
  function initAuth(){
    var guest=document.getElementById('sh-auth-guest');
    var profile=document.getElementById('sh-profile');
    var mobileGuest=document.getElementById('sh-mobile-auth-guest');
    var mobileProfile=document.getElementById('sh-mobile-profile');
    if(!guest&&!profile&&!mobileGuest&&!mobileProfile) return;

    function applyUser(el,nameEl,emailEl,avatarEl,user){
      if(nameEl) nameEl.textContent=user.name||'';
      if(emailEl) emailEl.textContent=user.email||'';
      if(avatarEl) avatarEl.textContent=(user.name||'U').charAt(0).toUpperCase();
      if(el && el.querySelector('.sh-profile-info')) el.querySelector('.sh-profile-info').style.display=user.name?'':'none';
    }

    function refresh(){
      var token=localStorage.getItem('shoutly_token');
      var user=null;
      if(token){
        var stored=localStorage.getItem('shoutly_user');
        if(stored){
          try{ user=JSON.parse(stored); }catch(e){ user={}; }
        }else{
          user={};
        }
      }

      if(user){
        if(guest) guest.style.display='none';
        if(profile) profile.style.display='';
        if(mobileGuest) mobileGuest.style.display='none';
        if(mobileProfile) mobileProfile.style.display='';
        applyUser(profile,document.getElementById('sh-profile-name'),document.getElementById('sh-profile-email'),document.getElementById('sh-avatar'),user);
        applyUser(mobileProfile,document.getElementById('sh-mobile-profile-name'),document.getElementById('sh-mobile-profile-email'),null,user);
      }else{
        if(guest) guest.style.display='';
        if(profile) profile.style.display='none';
        if(mobileGuest) mobileGuest.style.display='';
        if(mobileProfile) mobileProfile.style.display='none';
      }
    }

    function signOut(){
      localStorage.removeItem('shoutly_token');
      localStorage.removeItem('shoutly_user');
      window.dispatchEvent(new Event('auth-changed'));
      window.location.href='/';
    }

    var profileBtn=document.getElementById('sh-profile-btn');
    var profileMenu=document.getElementById('sh-profile-menu');
    if(profileBtn&&profileMenu){
      profileBtn.addEventListener('click',function(e){
        e.stopPropagation();
        var open=profileMenu.classList.toggle('open');
        profileBtn.setAttribute('aria-expanded',String(open));
      });
      document.addEventListener('click',function(e){
        if(!profileMenu.contains(e.target)&&e.target!==profileBtn){
          profileMenu.classList.remove('open');
          profileBtn.setAttribute('aria-expanded','false');
        }
      });
    }

    var signOutBtn=document.getElementById('sh-signout');
    if(signOutBtn) signOutBtn.addEventListener('click',signOut);
    var mobileSignOutBtn=document.getElementById('sh-mobile-signout');
    if(mobileSignOutBtn) mobileSignOutBtn.addEventListener('click',signOut);

    window.addEventListener('storage',refresh);
    window.addEventListener('auth-changed',refresh);
    refresh();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){ initDropdowns(); initBurger(); initAuth(); });
  }else{
    initDropdowns();
    initBurger();
    initAuth();
  }
})();
