// ══════════════════ CONFIG ══════════════════
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
const SOL_MINT = 'So11111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
let wallet = null;
let currentChart = null;

// ══════════════════ DRAWER ══════════════════
function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('overlay').classList.add('active');
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

// ══════════════════ FULLSCREEN ══════════════════
function switchDrawerTab(tab, btn) {
  document.querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  closeDrawer();
  openFull(tab);
}

async function openFull(tab) {
  const full = document.getElementById('fullScreen');
  const body = document.getElementById('fullBody');
  const title = document.getElementById('fullTitle');
  
  full.classList.add('active');
  body.innerHTML = '<div style="padding:20px;color:#9fb3c8">Carregando...</div>';
  
  const tabMap = {
    swap: 'Swap',
    news: 'Notícias Twitter',
    alpha: 'Alpha',
    airdrops: 'Airdrops',
    sponsors: 'Parceiros',
    presales: 'Pré-vendas'
  };
  title.textContent = tabMap[tab] || tab;
  
  if (tab === 'swap') {
    body.innerHTML = `
      <div style="padding:16px;max-width:500px;margin:0 auto">
        <div style="background:#1a2234;padding:16px;border-radius:12px;margin-bottom:12px">
          <div style="font-size:12px;color:#9fb3c8;margin-bottom:8px">Você paga</div>
          <div style="display:flex;gap:8px">
            <input id="swapIn" type="number" step="0.0001" style="flex:1;background:#0a0f1c;border:1px solid #2a3344;color:#fff;padding:12px;border-radius:8px;font-size:18px" placeholder="0.0"/>
            <button style="background:#2a3344;border:0;color:#fff;padding:0 16px;border-radius:8px;font-weight:600">SOL</button>
          </div>
          <div id="swapInUSD" style="font-size:11px;color:#9fb3c8;margin-top:6px">≈ $0.00</div>
        </div>
        <div style="text-align:center;margin:8px 0;font-size:20px">↓</div>
        <div style="background:#1a2234;padding:16px;border-radius:12px;margin-bottom:16px">
          <div style="font-size:12px;color:#9fb3c8;margin-bottom:8px">Você recebe</div>
          <div style="display:flex;gap:8px">
            <input id="swapOut" style="flex:1;background:#0a0f1c;border:1px solid #2a3344;color:#fff;padding:12px;border-radius:8px;font-size:18px" placeholder="0.0" disabled/>
            <button style="background:#2a3344;border:0;color:#fff;padding:0 16px;border-radius:8px;font-weight:600">USDC</button>
          </div>
          <div id="swapOutUSD" style="font-size:11px;color:#9fb3c8;margin-top:6px">≈ $0.00</div>
        </div>
        <button id="swapBtn" onclick="execSwap()" style="width:100%;background:#1a6bff;border:0;color:#fff;padding:14px;border-radius:12px;font-weight:600;font-size:16px">Conectar Carteira</button>
        <div style="font-size:11px;color:#9fb3c8;text-align:center;margin-top:12px">Powered by Jupiter</div>
      </div>
    `;
    initSwap();
  }
  
  if (tab === 'news') await loadTwitterNews();
  if (tab === 'alpha') body.innerHTML = '<div style="padding:20px">Calls de alpha em breve...</div>';
  if (tab === 'airdrops') body.innerHTML = '<div style="padding:20px">Lista de airdrops em breve...</div>';
  if (tab === 'sponsors') body.innerHTML = '<div style="padding:20px">Parceiros oficiais em breve...</div>';
  if (tab === 'presales') body.innerHTML = '<div style="padding:20px">Pré-vendas ativas em breve...</div>';
}

function closeFull() {
  document.getElementById('fullScreen').classList.remove('active');
}

function closeAll() {
  closeDrawer();
  closeFull();
  closeModal();
}

// ══════════════════ SWAP JUPITER ══════════════════
function initSwap() {
  const input = document.getElementById('swapIn');
  input.oninput = debounce(async (e) => {
    const val = parseFloat(e.target.value);
    if (!val || val <= 0) {
      document.getElementById('swapOut').value = '';
      return;
    }
    try {
      const amount = Math.floor(val * 1e9);
      const quote = await getQuote(SOL_MINT, USDC_MINT, amount);
      const out = (quote.outAmount / 1e6).toFixed(2);
      document.getElementById('swapOut').value = out;
      document.getElementById('swapInUSD').textContent = `≈ $${(val * (quote.inAmountUSD || 0)).toFixed(2)}`;
      document.getElementById('swapOutUSD').textContent = `≈ $${(out * 1).toFixed(2)}`;
    } catch (err) {
      console.error(err);
    }
  }, 500);
}

async function getQuote(inputMint, outputMint, amount) {
  const url = `${JUPITER_QUOTE_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao buscar cotação');
  return await res.json();
}

async function connectWallet() {
  try {
    if (!window.solana) {
      window.open('https://phantom.app/', '_blank');
      throw new Error('Instala Phantom primeiro');
    }
    if (!wallet) {
      const resp = await window.solana.connect();
      wallet = resp.publicKey.toString();
    }
    return true;
  } catch (e) {
    alert(e.message || 'Carteira recusada');
    return false;
  }
}

async function execSwap() {
  const btn = document.getElementById('swapBtn');
  const amountIn = parseFloat(document.getElementById('swapIn').value);
  
  if (!amountIn || amountIn <= 0) return alert('Digita um valor');
  
  btn.disabled = true;
  btn.textContent = 'Conectando...';
  
  if (!await connectWallet()) {
    btn.textContent = 'Conectar Carteira';
    btn.disabled = false;
    return;
  }
  
  try {
    btn.textContent = 'Buscando rota...';
    const amount = Math.floor(amountIn * 1e9);
    const quote = await getQuote(SOL_MINT, USDC_MINT, amount);
    
    if (!quote.outAmount) throw new Error('Sem liquidez pra esse par');
    
    btn.textContent = 'Assine na carteira...';
    const swapRes = await fetch(`${JUPITER_QUOTE_API}/swap`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: wallet,
        wrapAndUnwrapSol: true
      })
    });
    
    const { swapTransaction } = await swapRes.json();
    const connection = new solanaWeb3.Connection(SOLANA_RPC);
    const txBuf = Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0));
    const transaction = solanaWeb3.Transaction.from(txBuf);
    const signed = await window.solana.signTransaction(transaction);
    
    btn.textContent = 'Enviando...';
    const txid = await connection.sendRawTransaction(signed.serialize());
    
    btn.textContent = 'Confirmando...';
    await connection.confirmTransaction(txid, 'confirmed');
    
    btn.textContent = 'Swap concluído!';
    setTimeout(() => {
      btn.textContent = 'Conectar Carteira';
      btn.disabled = false;
      document.getElementById('swapIn').value = '';
      document.getElementById('swapOut').value = '';
    }, 2000);
    
  } catch (e) {
    console.error(e);
    alert('Erro: ' + e.message);
    btn.textContent = 'Conectar Carteira';
    btn.disabled = false;
  }
}

// ══════════════════ NOTÍCIAS ══════════════════
async function loadTwitterNews() {
  const body = document.getElementById('fullBody');
  try {
    const res = await fetch('/api/news?source=twitter');
    const data = await res.json();
    if (!data.length) {
      body.innerHTML = '<div style="padding:20px;color:#ff5050">Sem notícias. API vazia.</div>';
      return;
    }
    body.innerHTML = data.map(t => `
      <div style="border-bottom:1px solid #2a3344;padding:16px">
        <div style="display:flex;gap:8px;margin-bottom:6px;align-items:center">
          <img src="${t.avatar||''}" style="width:32px;height:32px;border-radius:50%;background:#2a3344" onerror="this.style.display='none'">
          <div>
            <div style="font-weight:600">${t.author||t.source} ${t.verified?'✓':''}</div>
            <div style="font-size:12px;color:#9fb3c8">${t.handle} · ${new Date(t.publishedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        </div>
        <div style="margin:8px 0;line-height:1.4;white-space:pre-wrap">${t.summary}</div>
        <div style="font-size:12px;color:#9fb3c8">❤️ ${t.likes||0} 🔁 ${t.retweets||0} 💬 ${t.replies||0}</div>
      </div>
    `).join('');
  } catch(e) {
    body.innerHTML = `<div style="padding:20px;color:#ff5050">Erro: ${e.message}</div>`;
  }
}

// ══════════════════ MEMECOINS ══════════════════
async function loadMemecoins() {
  const grid = document.getElementById('memeGrid');
  grid.innerHTML = '<div class="loading-box">Carregando...</div>';
  try {
    const res = await fetch('/api/memecoins');
    const coins = await res.json();
    if (!coins.length) throw new Error('Vazio');
    
    grid.innerHTML = coins.map(c => `
      <div class="coin-card" onclick='openCoinModal(${JSON.stringify(c).replace(/'/g,"&apos;")})'>
        <img src="${c.image}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"40\\" height=\\"40\\"%3E%3Crect fill=\\"%232a3344\\" width=\\"40\\" height=\\"40\\"/%3E%3C/svg%3E'">
        <div style="font-weight:600;margin-top:8px">${c.name}</div>
        <div style="font-size:12px;color:#9fb3c8">${c.symbol}</div>
        <div style="font-size:18px;font-weight:700;margin-top:8px">$${formatPrice(c.price)}</div>
        <div style="color:${c.change>0?'#00d395':'#ff5050'};font-size:14px;font-weight:600">${c.change>0?'+':''}${c.change.toFixed(2)}%</div>
      </div>
    `).join('');
  } catch(e) {
    grid.innerHTML = '<div class="loading-box" style="color:#ff5050">Erro ao carregar. Verifica /api/memecoins</div>';
  }
}

// ══════════════════ MODAL TOKEN ══════════════════
function openCoinModal(coin) {
  if (typeof coin === 'string') coin = JSON.parse(coin);
  document.getElementById('tokenModal').classList.add('active');
  document.getElementById('m-logo').src = coin.image;
  document.getElementById('m-name').textContent = coin.name;
  document.getElementById('m-sym').textContent = coin.symbol;
  document.getElementById('m-price').textContent = '$' + formatPrice(coin.price);
  document.getElementById('m-chg').textContent = `${coin.change>0?'+':''}${coin.change.toFixed(2)}%`;
  document.getElementById('m-chg').style.color = coin.change>0?'#00d395':'#ff5050';
  document.getElementById('m-vol').textContent = '$' + formatNum(coin.volume);
  document.getElementById('m-liq').textContent = '$' + formatNum(coin.liquidity);
  document.getElementById('m-mc').textContent = '$' + formatNum(coin.marketCap);
  document.getElementById('m-addr').textContent = coin.address;
  
  document.getElementById('m-links').innerHTML = `
    <a href="https://dexscreener.com/solana/${coin.address}" target="_blank" style="background:#2a3344;padding:8px 12px;border-radius:8px;color:#fff;text-decoration:none;font-size:13px">DexScreener</a>
    <a href="https://solscan.io/token/${coin.address}" target="_blank" style="background:#2a3344;padding:8px 12px;border-radius:8px;color:#fff;text-decoration:none;font-size:13px">Solscan</a>
  `;
  
  loadChart(coin.address);
}

function closeModal() {
  document.getElementById('tokenModal').classList.remove('active');
  if (currentChart) currentChart.destroy();
}

// ══════════════════ GRÁFICO ══════════════════
async function loadChart(address) {
  const ctx = document.getElementById('m-chart');
  if (currentChart) currentChart.destroy();
  
  // Mock - troca por API real depois
  const labels = Array.from({length: 24}, (_,i) => `${i}h`);
  const data = Array.from({length: 24}, () => Math.random() * 100);
  
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#1a6bff',
        backgroundColor: 'rgba(26,107,255,0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function switchTab(btn, tf) {
  document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Recarrega gráfico com timeframe
}

// ══════════════════ TICKER ══════════════════
async function loadTicker() {
  try {
    const res = await fetch('/api/memecoins');
    const coins = await res.json();
    const top3 = coins.slice(0, 3);
    document.getElementById('tickerInner').innerHTML = top3.map(c => 
      `<span class="ticker-item">${c.symbol} $${formatPrice(c.price)} <span style="color:${c.change>0?'#00d395':'#ff5050'}">${c.change>0?'+':''}${c.change.toFixed(2)}%</span></span>`
    ).join('');
  } catch {}
}

// ══════════════════ UTILS ══════════════════
function formatPrice(n) {
  if (n < 0.00001) return n.toExponential(2);
  if (n < 0.01) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  return n.toFixed(2);
}

function formatNum(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(2) + 'K';
  return n.toFixed(0);
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// Lang dropdown
function toggleLang() {
  document.getElementById('langMenu').classList.toggle('active');
}
function setLang(lang, el) {
  document.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  toggleLang();
}

// Search - mock
function onSearch(val) {
  console.log('Buscar:', val);
}
function showResults() {}

// Chat - mock
function toggleChat() {
  document.getElementById('chatWindow').classList.toggle('active');
}
function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input.value) return;
  input.value = '';
}

// ══════════════════ INIT ══════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadMemecoins();
  loadTicker();
  setInterval(loadTicker, 30000); // Atualiza ticker a cada 30s
});
