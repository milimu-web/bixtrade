/* BRIXTRADE upgrade: floating 3D shapes + Terms/Risk/Privacy modal + honest wording.
   Add ONE line just before </body> in index.html, after the existing scripts:
   <script src="/brix-upgrade.js"></script>  */
(function(){
var V='2026-11-24', $=function(i){return document.getElementById(i)};

/* ---------- CSS ---------- */
var css=''
+'.fx{position:absolute;inset:0;overflow:hidden;pointer-events:none;perspective:900px;z-index:0}'
+'.fx-fixed{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;perspective:1000px}'
+'.sh{position:absolute;width:var(--s);height:var(--s);transform-style:preserve-3d;opacity:.85;animation:bxf var(--d,9s) ease-in-out var(--dl,0s) infinite}'
+':root[data-theme=light] .sh{opacity:.5}'
+'.sh>i{position:absolute;inset:0;display:block;transform-style:preserve-3d;animation:bxs var(--sp,16s) linear infinite}'
+'.sh.cube>i{animation-name:bxs2}'
+'@keyframes bxf{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(10px,-24px,0)}}'
+'@keyframes bxs{from{transform:rotateX(18deg) rotateY(0)}to{transform:rotateX(18deg) rotateY(360deg)}}'
+'@keyframes bxs2{from{transform:rotateX(-20deg) rotateY(0)}to{transform:rotateX(340deg) rotateY(360deg)}}'
+'.cf{position:absolute;inset:0;border:1px solid var(--ac);background:linear-gradient(135deg,rgba(139,141,255,.24),rgba(99,102,241,.05));box-shadow:inset 0 0 14px rgba(139,141,255,.25)}'
+'.cd{position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,#f7d774,#c2921a);border:1px solid #8a6410;display:grid;place-items:center;font:800 calc(var(--s)*.32) Sora,sans-serif;color:#6b4d0a}'
+'.cd.m{background:#a87a14;color:transparent}'
+'.rg{position:absolute;inset:0;border-radius:50%;border:1px solid var(--ac3);box-shadow:0 0 8px rgba(139,141,255,.35)}'
+'@media(max-width:700px){.sh.hm{display:none}}'
+'#termsModal{position:fixed;inset:0;background:rgba(3,6,12,.86);display:none;place-items:center;z-index:120;backdrop-filter:blur(10px);padding:12px}'
+'#termsModal.on{display:grid}'
+'.tmBox{background:var(--pn3);border:1px solid var(--ln2);border-radius:18px;width:min(720px,100%);max-height:92vh;display:flex;flex-direction:column;box-shadow:0 30px 90px rgba(0,0,0,.8);animation:pop .25s ease-out;overflow:hidden}'
+'.tmHead{padding:16px 20px;border-bottom:1px solid var(--ln2);display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--pn2)}'
+'.tmHead h3{font:700 16px Sora,sans-serif}.tmHead small{color:var(--mut);font-size:11px}'
+'.tmTabs{display:flex;gap:6px;padding:10px 20px 0;background:var(--bg2);overflow-x:auto}'
+'.tmTabs button{border:0;background:transparent;color:var(--mut);font-weight:700;font-size:13px;padding:9px 14px;border-radius:8px 8px 0 0;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent}'
+'.tmTabs button.on{color:var(--ink);border-bottom-color:var(--ac)}'
+'.tmBody{padding:18px 22px;overflow-y:auto;background:var(--bg2);flex:1;color:var(--mut);font-size:13px;line-height:1.65}'
+'.tmBody h4{color:var(--ink);font:700 14px Sora,sans-serif;margin:16px 0 4px}.tmBody h4:first-child{margin-top:0}'
+'.tmBody p,.tmBody li{margin:0 0 6px}.tmBody ul{padding-left:18px}.tmBody b{color:var(--ink)}'
+'.tmWarn{border:1px solid var(--dn);background:color-mix(in srgb,var(--dn) 8%,transparent);border-radius:12px;padding:12px 14px;margin-bottom:14px;color:var(--ink)}'
+'.tmFoot{padding:12px 20px;border-top:1px solid var(--ln2);display:flex;gap:10px;justify-content:flex-end;background:var(--pn3);flex-wrap:wrap}'
+'.tmLnk{color:var(--ac);text-decoration:underline;cursor:pointer}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- 3D shapes: gold coins + shiny gold bar ---------- */
var bst=document.createElement('style');bst.textContent=
'.sh.bar>i{animation:bxb 14s ease-in-out infinite alternate}'
+'@keyframes bxb{from{transform:rotateX(-20deg) rotateY(-32deg)}to{transform:rotateX(-13deg) rotateY(26deg)}}'
+'.bf{position:absolute;left:50%;top:50%;overflow:hidden;background-size:300% 300%;animation:bxg 6s ease-in-out infinite}'
+'@keyframes bxg{0%,100%{background-position:0% 40%}50%{background-position:100% 60%}}'
+'.bf.fr{background-image:linear-gradient(115deg,#8a5d08 0%,#f9e08a 14%,#fff6c4 24%,#e0aa1c 38%,#b07d0e 52%,#f7d774 66%,#fff3b0 74%,#c2921a 88%,#7a5206 100%)}'
+'.bf.tp{background-image:linear-gradient(135deg,#fff8d0 0%,#f9e08a 30%,#eab92a 55%,#fff1a8 80%,#d9a516 100%);box-shadow:inset 0 0 0 3px rgba(255,245,190,.6),inset 0 0 16px rgba(120,80,5,.4)}'
+'.bf.sd{background-image:linear-gradient(160deg,#c2921a 0%,#8a5d08 45%,#d9a516 100%)}'
+'.bf u{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.8) 50%,transparent 65%);transform:translateX(-130%);animation:bxsw 4.5s ease-in-out infinite}'
+'@keyframes bxsw{0%{transform:translateX(-130%)}55%,100%{transform:translateX(130%)}}'
+'.bf span{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 var(--f) Sora,sans-serif;letter-spacing:.14em;color:rgba(104,68,4,.85);text-shadow:0 1px 0 rgba(255,255,255,.55);line-height:1.5}'
+'.bf span small{font-size:.6em;letter-spacing:.2em;font-weight:700}'
+'.bgl{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(251,191,36,.42),rgba(251,191,36,.14) 55%,transparent);animation:bxp 5s ease-in-out infinite}'
+':root[data-theme=light] .bgl{opacity:.6}'
+'.bgl s{position:absolute;text-decoration:none;color:#fff6c4;text-shadow:0 0 8px #fbbf24,0 0 16px #f59e0b;font-size:18px;animation:bxt 2.8s ease-in-out infinite}'
+'@keyframes bxp{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}'
+'@keyframes bxt{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1.1) rotate(45deg)}}'
+'.hero>.fx{z-index:2}'+'@media(max-width:700px){.sh.bar,.bgl{scale:.55}.hero>.fx{z-index:0}.hero .sh.bar,.hero .bgl{left:46%!important;top:5%!important}.global-hero .sh.bar,.global-hero .bgl{left:26%!important;top:66%!important}.hero .sh.bar,.global-hero .sh.bar{opacity:.6}}';
document.head.appendChild(bst);

function coin(box,sz,x,y,d,dl,hm,txt){
  var s=document.createElement('div'),i=document.createElement('i'),k,e;
  s.className='sh coin'+(hm?' hm':'');
  s.style.cssText='--s:'+sz+'px;left:'+x+'%;top:'+y+'%;--d:'+d+'s;--dl:'+dl+'s;--sp:'+(12+d*1.4)+'s';
  for(k=-3;k<=3;k++){e=document.createElement('b');e.className='cd'+(Math.abs(k)<3?' m':'');e.style.transform='translateZ('+k*2.5+'px)';if(Math.abs(k)===3)e.textContent=txt||'$';i.appendChild(e)}
  s.appendChild(i);box.appendChild(s);
}
function bar(box,W,x,y,d,dl,hm){
  var H=W*.3,D=W*.52,W2=W*.8,D2=D*.68,dz=(D-D2)/2,dx=(W-W2)/2,R=57.2958,
  th=Math.atan(dz/H)*R,ph=Math.atan(dx/H)*R,hs=Math.sqrt(H*H+dz*dz),hs2=Math.sqrt(H*H+dx*dx),zm=(D+D2)/4,xm=(W+W2)/4;
  var g=document.createElement('div');g.className='bgl'+(hm?' hm':'');
  g.style.cssText='left:'+x+'%;top:'+y+'%;width:'+W*1.9+'px;height:'+W*1.3+'px;margin:'+(-W*.5)+'px 0 0 '+(-W*.45)+'px';
  g.innerHTML='<s style="left:14%;top:30%">\u2726</s><s style="left:80%;top:22%;animation-delay:.9s;font-size:24px">\u2726</s><s style="left:66%;top:78%;animation-delay:1.7s">\u2726</s><s style="left:28%;top:72%;animation-delay:2.2s;font-size:13px">\u2726</s>';
  box.appendChild(g);
  var s=document.createElement('div'),i=document.createElement('i');
  s.className='sh bar'+(hm?' hm':'');
  s.style.cssText='width:'+W+'px;height:'+H+'px;left:'+x+'%;top:'+y+'%;--d:'+d+'s;--dl:'+dl+'s;--f:'+W*.075+'px';
  function F(w,h,c,clip,tr,inner){var e=document.createElement('div');e.className='bf '+c;
    e.style.cssText='width:'+w+'px;height:'+h+'px;margin:'+(-h/2)+'px 0 0 '+(-w/2)+'px;clip-path:'+clip+';transform:'+tr;e.innerHTML=(inner||'')+(c==='fr'||c==='tp'?'<u></u>':'');i.appendChild(e)}
  function tz(a){return 'polygon('+a+'% 0,'+(100-a)+'% 0,100% 100%,0 100%)'}
  var ax=dx/W*100,az=dz/D*100;
  F(W,hs,'fr',tz(ax),'translateZ('+zm+'px) rotateX('+th+'deg)','<span>BRIXTRADE<small>GOLD \u00b7 999.9</small></span>');
  F(W,hs,'sd',tz(ax),'rotateY(180deg) translateZ('+zm+'px) rotateX('+th+'deg)');
  F(D,hs2,'sd',tz(az),'rotateY(90deg) translateZ('+xm+'px) rotateX('+ph+'deg)');
  F(D,hs2,'sd',tz(az),'rotateY(-90deg) translateZ('+xm+'px) rotateX('+ph+'deg)');
  F(W2,D2,'tp','none','translateY('+(-H/2)+'px) rotateX(90deg)');
  s.appendChild(i);box.appendChild(s);
}
function layer(host,list,kids){
  if(!host)return;var f=document.createElement('div');f.className='fx';host.insertBefore(f,host.firstChild);
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  (kids||Array.prototype.slice.call(host.children)).forEach(function(c){if(c!==f){if(getComputedStyle(c).position==='static')c.style.position='relative';c.style.zIndex=1}});
  list.forEach(function(a){(a[0]==='bar'?bar:coin).apply(null,[f].concat(a.slice(1)))});
}
//  bar: width x% y% dur delay hideOnMobile
layer(document.querySelector('.hero'),[['bar',280,47,53,11,0,0]]);
layer(document.querySelector('.global-hero'),[['bar',230,3,52,12,0,0]]);
var fixed=document.createElement('div');fixed.className='fx-fixed';document.body.appendChild(fixed);
bar(fixed,200,3,80,13,0,0);

/* ---------- Honest wording ---------- */
function T(a,b){var w=document.createTreeWalker(document.body,4),n,p;while(n=w.nextNode()){p=n.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE')continue;if(n.nodeValue.indexOf(a)>-1)n.nodeValue=n.nodeValue.split(a).join(b)}}
[['BRIXTRADE is a licensed broker.','Licence application in progress: BRIXTRADE is not yet licensed by a financial regulator.'],
 ['most people lose and gain money','most people lose money'],
 ['Stakes from $5','Stakes from $1'],
 ['Metals \u00b7 real prices','Metals \u00b7 indicative prices'],
 ['Real price','Indicative price'],
 ['25 MARKETS \u2022 OPEN 24/7','25 MARKETS \u2022 LIVE PRICES'],
 [' Real markets run 24/7.',''],
 ['Instant M-Pesa','M-Pesa deposits & withdrawals'],
 ['Deposit and withdraw with M-PESA from your wallet.','Deposit from $1 and withdraw from $2 with M-PESA. KYC verification is required to withdraw and a 3% withdrawal fee applies.']
].forEach(function(r){T(r[0],r[1])});
document.querySelectorAll('.sim-tag').forEach(function(e){e.textContent='INDICATIVE'});
var hc=$('heroChart');if(hc){hc.setAttribute('aria-label','Indicative gold price animation');
  var cap=document.createElement('div');cap.style.cssText='padding:6px 14px 10px;font-size:11px;color:var(--mut);background:var(--bg2)';
  cap.textContent='Illustrative animation of price movement. Live prices are shown in the trading room.';hc.parentNode.appendChild(cap)}
if($('pcS')){$('pcS').min=1;$('pcS').step=1}

/* footer line + legal links */
var fp=document.querySelector('body>p');
if(fp)fp.innerHTML='Prices in the trading room are live market quotes. <b>Licence application in progress: BRIXTRADE is not yet licensed by a financial regulator.</b> Trading is risky and most people lose money: a win pays 70% and a loss costs your stake, so you need to win about 58.8% of trades to break even. 18+ only. <span class="tmLnk" onclick="openTerms(\'terms\')">Terms</span> | <span class="tmLnk" onclick="openTerms(\'risk\')">Risk</span> | <span class="tmLnk" onclick="openTerms(\'privacy\')">Privacy</span> | support@brixtrade.co.ke';
var cols=document.querySelectorAll('.brix-footer-col');
if(cols[2])cols[2].insertAdjacentHTML('beforeend','<a href="#" onclick="openTerms(\'terms\');return false">Terms &amp; Conditions</a><a href="#" onclick="openTerms(\'risk\');return false">Risk Disclosure</a><a href="#" onclick="openTerms(\'privacy\');return false">Privacy Policy</a>');

/* FAQ */
function D(q,a){var d=document.createElement('details');d.innerHTML='<summary>'+q+'</summary><p>'+a+'</p>';return d}
var faq=document.querySelector('.faq');
if(faq){
  faq.insertBefore(D('Is Brixtrade licensed?','Not yet. A licence application is in progress, and Brixtrade is not currently licensed by a financial regulator. That means regulator protections do not apply to your account. Read the full <span class="tmLnk" onclick="openTerms(\'terms\')">Terms</span> and <span class="tmLnk" onclick="openTerms(\'risk\')">Risk Disclosure</span> before you deposit.'),faq.firstChild);
  faq.querySelectorAll('details').forEach(function(d){
    if(d.firstChild.textContent==='How do I deposit and withdraw?'){
      d.querySelector('p').textContent='From your Profile / Wallet page with M-PESA. The deposit rate is $1 = KES 130. The minimum deposit is $1 and there is no maximum. The minimum withdrawal is $2, you must complete identity verification (KYC) before you can withdraw, and a 3% fee on the amount withdrawn applies. Example: withdrawing $100 costs a $3 fee, so you receive $97.';
      d.parentNode.insertBefore(D('Are there any fees?','Yes. Withdrawals carry a 3% fee on the amount withdrawn. Sniper VIP is $10 a month (free for now) and is non-refundable. Your mobile-money provider may charge its own fees.'),d.nextSibling)}})
}

/* ---------- Terms modal ---------- */
var TERMS='<div class="tmWarn"><b>Important:</b> Brixtrade is <b>not yet licensed</b> by the Capital Markets Authority or any other financial regulator. A licence application is in progress and approval is not guaranteed. You can lose your whole stake on every trade.</div>'
+'<h4>1. About Brixtrade</h4><p>Brixtrade (Westlands, Nairobi, Kenya; support@brixtrade.co.ke) is an online platform where you trade the direction of currency and metal prices over a fixed time. These Terms are an agreement between you and Brixtrade.</p>'
+'<h4>2. Eligibility</h4><ul><li>You must be 18 or older.</li><li>You must make sure this kind of trading is allowed where you live.</li><li>Information you give must be true, and you may hold one account only.</li></ul>'
+'<h4>3. How trades work</h4><ul><li>Choose one of 25 markets (20 currency pairs, 5 metals), a stake from <b>$1 to $100</b> and a duration of 30, 60 or 120 seconds.</li><li>Choose BUY (price higher at expiry) or SELL (price lower). Your entry price is locked when you place the trade.</li><li><b>Win:</b> you receive your stake back plus 70% of it. <b>Loss:</b> you lose your whole stake. <b>Equal price:</b> your stake is returned.</li><li>To break even you must win about <b>58.8%</b> of your trades.</li><li>Trades use live market prices from our price feed. Prices can be delayed or interrupted.</li><li>Demo mode uses $1,000 of virtual money under the same rules. Virtual money has no cash value and cannot be withdrawn.</li></ul>'
+'<h4>4. Deposits</h4><ul><li>Deposit with M-PESA from your Wallet. Minimum <b>$1</b>, no maximum.</li><li>Deposit rate: $1 = KES 130 (the rate in your Wallet applies and may change).</li></ul>'
+'<h4>5. Withdrawals and fees</h4><ul><li>Minimum withdrawal: <b>$2</b>.</li><li><b>Identity verification (KYC) is required</b> before you can withdraw. We may ask for more documents.</li><li>A <b>3% fee</b> is charged on the amount you withdraw. Example: withdraw $100, fee $3, you receive $97.</li><li>Your mobile-money provider may add its own charges.</li></ul>'
+'<h4>6. Sniper VIP and trading tools</h4><p>Scalper, Trend, Sniper VIP and the Scanner are informational tools. They are not financial advice and do not guarantee results. Sniper VIP costs $10 a month, is free for now, and is non-refundable.</p>'
+'<h4>7. Referral bonus</h4><p>You may earn a $5 bonus for each friend who joins with your link, under the conditions shown in the trading room. We may change or end the offer, and bonuses gained through abuse or fake accounts can be removed.</p>'
+'<h4>8. Daily loss limit</h4><p>You can set a daily loss limit in the trading room. When your real-money loss for the day reaches it, trading pauses until the next day. You can lower it at any time but cannot raise or remove it after reaching it that day.</p>'
+'<h4>9. Service and accounts</h4><p>We aim to keep Brixtrade running but do not promise uninterrupted service. We may suspend or close accounts for fraud, false information, multiple accounts or misuse, and may ask for verification at any time.</p>'
+'<h4>10. Changes and law</h4><p>We may update these Terms and will show the new version here. Continued use means you accept it. These Terms are governed by the laws of Kenya. Version '+V+'.</p>';
var RISK='<div class="tmWarn"><b>You can lose all the money you stake.</b> Only trade money you can afford to lose.</div>'
+'<ul><li><b>The maths works against most traders.</b> A win pays 70% and a loss costs 100%, so you need to win about 58.8% of trades just to break even.</li><li><b>Trades are very short.</b> Results arrive in 30 to 120 seconds, so losses can add up quickly.</li><li><b>No licence yet.</b> Brixtrade is not licensed by a financial regulator, so there is no regulator protection or compensation scheme for your funds.</li><li><b>Past results do not predict future results.</b> Nobody can guarantee profits, including us and any trading tool or signal.</li><li><b>Withdrawals have conditions.</b> KYC verification is required and a 3% fee applies.</li><li><b>Prices can be delayed or unavailable</b> during technical problems or fast markets.</li></ul>'
+'<h4>Stay in control</h4><ul><li>Practise in the free demo first.</li><li>Set a daily loss limit.</li><li>Never borrow money to trade.</li><li>If trading stops being fun or you feel you cannot stop, stop and talk to someone you trust.</li></ul>';
var PRIV='<h4>What we collect</h4><p>Your name, email, country, date of birth, optional phone number, how you found us, your trades and wallet activity, and the identity documents you give us for KYC.</p>'
+'<h4>Why we use it</h4><ul><li>To run and secure your account and confirm you are 18 or older.</li><li>To process deposits, withdrawals and KYC checks.</li><li>To give support and send important account messages.</li><li>To send tips and offers only if you opt in. You can opt out at any time.</li></ul>'
+'<h4>Who we share it with</h4><p>Only service providers we need to run Brixtrade (such as sign-in and hosting, payments and email) and authorities where the law requires it.</p>'
+'<h4>Your choices</h4><p>You may ask to see, correct or delete your data by emailing support@brixtrade.co.ke. Some records may be kept where the law requires it.</p>';
var TAB={terms:['Terms & Conditions',TERMS],risk:['Risk Disclosure',RISK],privacy:['Privacy Policy',PRIV]};
var m=document.createElement('div');m.id='termsModal';
m.innerHTML='<div class="tmBox" role="dialog" aria-modal="true" aria-label="Legal"><div class="tmHead"><div><h3>BRIXTRADE legal</h3><small>Please read before you trade</small></div><button class="btn ic" onclick="closeTerms()" aria-label="Close">\u2715</button></div><div class="tmTabs" id="tmTabs"></div><div class="tmBody" id="tmBody"></div><div class="tmFoot"><button class="btn" onclick="closeTerms()">Close</button><button class="btn-brix" id="tmAgree" style="display:none" onclick="agreeTerms()">I have read and I agree</button></div></div>';
document.body.appendChild(m);
m.addEventListener('click',function(e){if(e.target===m)closeTerms()});
window.openTerms=function(k,fromReg){
  $('tmTabs').innerHTML=Object.keys(TAB).map(function(t){return '<button class="'+(t===k?'on':'')+'" onclick="openTerms(\''+t+'\','+(!!fromReg)+')">'+TAB[t][0]+'</button>'}).join('');
  $('tmBody').innerHTML=TAB[k][1];$('tmBody').scrollTop=0;$('tmAgree').style.display=fromReg?'inline-block':'none';m.classList.add('on')};
window.closeTerms=function(){m.classList.remove('on')};
window.agreeTerms=function(){var c=$('agreeCheck');if(c)c.checked=true;closeTerms()};

/* sign-up box: honest summary + linked agreement */
var tb=document.querySelector('.tBox');
if(tb)tb.innerHTML='<b>Key points.</b> Brixtrade is <b>not yet licensed</b> by a financial regulator. You trade with real money and can lose your whole stake. A win pays 70%; you need about 58.8% wins to break even. Deposit from $1 by M-PESA. Withdraw from $2 after KYC verification, with a 3% fee. Demo money has no cash value. 18+ only. <span class="tmLnk" onclick="openTerms(\'terms\',true)">Read the full Terms</span>.';
var ac=$('agreeCheck');
if(ac&&ac.nextElementSibling)ac.nextElementSibling.innerHTML='I am 18 or older and I have read and agree to the <span class="tmLnk" onclick="openTerms(\'terms\',true)">Terms</span>, <span class="tmLnk" onclick="openTerms(\'risk\',true)">Risk Disclosure</span> and <span class="tmLnk" onclick="openTerms(\'privacy\',true)">Privacy Policy</span>. I understand Brixtrade is not yet licensed and I may lose my whole stake.';

/* Google sign-up must also agree; record terms acceptance */
var _g=window.googleLogin;
window.googleLogin=function(){if(typeof currentTab!=='undefined'&&currentTab==='register'&&!$('agreeCheck').checked){showMsg('Please tick the box to agree to the Terms & Risk first',true);return}
  if(typeof currentTab!=='undefined'&&currentTab==='register')pend=true;_g()};
var pend=false,_r=window.register;
window.register=function(){if($('agreeCheck').checked)pend=true;_r()};
auth.onAuthStateChanged(function(u){if(u&&pend){pend=false;db.collection('users').doc(u.uid).set({termsVersion:V,termsAcceptedAt:new Date().toISOString()},{merge:true}).catch(function(){})}});
})();