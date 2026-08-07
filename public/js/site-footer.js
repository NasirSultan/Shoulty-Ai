/* Shared site footer behavior: newsletter subscribe. Works with the markup
   contract in /css/site-footer.css. Safe to include on any page — it no-ops
   if the expected elements aren't present. */
(function(){
  var API_BASE='https://backend.shoutlyai.com/api';

  function init(){
    var sfNlBtn=document.getElementById('sf-nl-btn');
    var sfNlEmail=document.getElementById('sf-nl-email');
    var sfNlMsg=document.getElementById('sf-nl-msg');
    if(!sfNlBtn||!sfNlEmail||!sfNlMsg) return;

    sfNlBtn.addEventListener('click',function(){
      var email=sfNlEmail.value.trim();
      if(!email){
        sfNlMsg.style.color='#ef4444';
        sfNlMsg.textContent='Please enter your email.';
        return;
      }
      sfNlBtn.disabled=true;
      sfNlBtn.textContent='Subscribing…';
      fetch(API_BASE+'/newsletter/subscribe',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:email})
      }).then(function(res){
        if(res.status===409){
          sfNlMsg.style.color='#16a34a';
          sfNlMsg.textContent="You're already subscribed!";
          return;
        }
        if(!res.ok){
          return res.json().catch(function(){return {};}).then(function(err){
            sfNlMsg.style.color='#ef4444';
            sfNlMsg.textContent=err.message||'Something went wrong — please try again.';
          });
        }
        sfNlMsg.style.color='#16a34a';
        sfNlMsg.textContent='Subscribed! Check your inbox Thursday.';
        sfNlEmail.value='';
      }).catch(function(){
        sfNlMsg.style.color='#ef4444';
        sfNlMsg.textContent='Network error — please try again.';
      }).finally(function(){
        sfNlBtn.disabled=false;
        sfNlBtn.textContent='Subscribe';
      });
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
