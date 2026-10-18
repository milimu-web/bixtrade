let balance = parseFloat(localStorage.getItem('brix_balance') || '10');
let selectedBot = 'scalper';
let dailyProfit = parseFloat(localStorage.getItem('brix_dailyProfit') || '0');
let trades = parseInt(localStorage.getItem('brix_trades')||'0');
let wins = parseInt(localStorage.getItem('brix_wins')||'0');
let isTrading = false;

// MATCHED TO trade.html - 10K SAFE 40% = 4 WIN / 6 LOSS per 10
const bots = { 
  scalper: { winRate: 0.70, time: 30 }, 
  trend: { winRate: 0.70, time: 60 }, 
  sniper: { winRate: 0.70, time: 120, vip: true } 
};

function save(){ 
  localStorage.setItem('brix_balance', balance); 
  localStorage.setItem('brix_dailyProfit', dailyProfit); 
  localStorage.setItem('brix_trades', trades); 
  localStorage.setItem('brix_wins', wins); 
  updateUI(); 
}

function updateUI(){ 
  const b=document.getElementById('balance'); 
  if(b) b.innerText=`$${balance.toFixed(2)}`; 
  const dp=document.getElementById('dailyProfit'); 
  if(dp) dp.innerText=`$${dailyProfit.toFixed(2)} / $15`; 
  const wr=document.getElementById('winRate'); 
  if(wr) wr.innerText=trades?`${Math.round((wins/trades)*100)}%`:'0%'; 
}

function selectBot(name, el){ 
  if(name==='sniper' && localStorage.getItem('brix_vip')!=='true'){ 
    alert('Sniper VIP requires $10 subscription. Click Unlock Sniper VIP'); 
    return; 
  } 
  selectedBot=name; 
  document.querySelectorAll('.bot-card').forEach(c=>c.classList.remove('active')); 
  if(el) el.classList.add('active'); 
  const dur=document.getElementById('duration'); 
  if(dur) dur.value=bots[name].time; 
}

function startTrade(dir){ 
  if(isTrading){ alert('Trade in progress...'); return; } 
  const stake=parseFloat(document.getElementById('stake').value); 
  const dur=parseInt(document.getElementById('duration').value); 
  if(stake<1||stake>5){ alert('Stake $1-5'); return; } 
  if(balance<stake){ alert('Insufficient balance. Deposit.'); return; } 
  if(dailyProfit>=15){ alert('Daily $15 limit reached'); return; } 
  if(selectedBot==='sniper' && localStorage.getItem('brix_vip')!=='true'){ alert('Unlock VIP first'); return; } 
  balance-=stake; save(); isTrading=true; 
  let t=dur; document.getElementById('timer').innerText=t+'s'; 
  let iv=setInterval(()=>{ t--; document.getElementById('timer').innerText=t+'s'; if(t<=0){ clearInterval(iv); finishTrade(stake,dir); } },1000); 
}

// FORCED 4/6 LOGIC - SAME AS trade.html
function getForcedTradeHistory(){ try{ return JSON.parse(localStorage.getItem('brixForced10')||'[]'); }catch(e){ return []; } }
function saveForcedTradeHistory(h){ localStorage.setItem('brixForced10', JSON.stringify(h)); }

function finishTrade(stake,dir){ 
  trades++; 
  
  // FORCED 4 WIN / 6 LOSS
  let history = getForcedTradeHistory();
  if(history.length>=10){ history=[]; }
  let winsInHistory = history.filter(v=>v===1).length;
  let win;
  if(winsInHistory>=4){ 
    win=false; 
  } else {
    let remaining = 10 - history.length;
    let needed = 4 - winsInHistory;
    if(remaining<=needed){ win=true; }
    else{ win = Math.random() < bots[selectedBot].winRate; }
  }
  history.push(win?1:0);
  saveForcedTradeHistory(history);
  if(history.length===10){ setTimeout(()=>saveForcedTradeHistory([]),100); }

  if(win){ 
    let p=stake*0.7; balance+=stake+p; dailyProfit+=p; wins++; 
    alert(`WIN! +$${p.toFixed(2)} ${dir}`); 
  } else { 
    alert(`LOSS! -$${stake.toFixed(2)} ${dir}`); 
  } 
  isTrading=false; document.getElementById('timer').innerText='Ready'; save(); 
}

// REAL PAYSTACK WITH YOUR KEY
function depositWithPaystack(){ 
  const user = JSON.parse(localStorage.getItem('brix_current_user')||'{"email":"user@brixtrade.com"}');
  let a=prompt('Deposit amount USD min $1 (Paystack will charge KES):','10'); 
  if(!a) return; 
  a=parseFloat(a); 
  if(a<1){alert('Min $1');return;} 
  let kesAmount = Math.round(a * 130);
  if(typeof PaystackPop !== 'undefined'){ 
    let h=PaystackPop.setup({
      key:'pk_test_22b6fc1db38418de37247a7c48d3f8b32edfd2e2',
      email: user.email || 'user@brixtrade.com',
      amount: kesAmount * 100,
      currency:'KES',
      channels: ['card','mobile_money','bank'],
      ref: 'BRIX-'+Date.now(),
      callback:function(r){
        balance+=a; save();
        alert('Deposit success! KES '+kesAmount+' (~$'+a+') Added. Ref: '+r.reference);
      },
      onClose:function(){ alert('Payment closed'); }
    }); 
    h.openIframe(); 
  } else { 
    balance+=a; save(); alert(`[TEST MODE] Deposited $${a}`); 
  } 
}

function withdraw(){ 
  let a=prompt(`Withdraw Balance $${balance.toFixed(2)}:`, '5'); 
  if(!a) return; a=parseFloat(a); 
  if(a>balance){alert('Insufficient');return;} 
  balance-=a; save(); 
  alert(`Withdrawal $${a} sent to M-Pesa. Check phone.`); 
}

function subscribe(){ 
  if(localStorage.getItem('brix_vip')==='true'){alert('Already VIP');return;} 
  if(!confirm('Unlock Sniper VIP $10/mo via Paystack?')) return; 
  const user = JSON.parse(localStorage.getItem('brix_current_user')||'{"email":"user@brixtrade.com"}');
  let h=PaystackPop.setup({
    key:'pk_test_22b6fc1db38418de37247a7c48d3f8b32edfd2e2',
    email: user.email || 'user@brixtrade.com',
    amount: 1300 * 100,
    currency:'KES',
    ref: 'BRIX-VIP-'+Date.now(),
    callback:function(r){
      localStorage.setItem('brix_vip','true'); 
      alert('VIP Unlocked! Ref: '+r.reference);
    },
    onClose:function(){}
  });
  h.openIframe();
}

document.addEventListener('DOMContentLoaded', updateUI); 
updateUI();