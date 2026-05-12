// ══════════════════ CONFIG ══════════════════
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
const SOL_MINT = 'So11111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const DEX_API = 'https://api.dexscreener.com/latest/dex';
let wallet = null;
let currentChart = null;
let solPriceUSD = 0;

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
    await getSolPrice();
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
async function getSolPrice() {
  try {
    const res = await fetch(`${DEX_API}/tokens/${SOL_MINT}`);
    const data = await res.json();
    solPriceUSD = parseFloat(data.pairs?.[0]?.priceUsd || 150);
  } catch { solPriceUSD = 150; }
}

function initSwap() {
  const input = document.getElementById('swapIn');
  input.oninput = debounce(async (e) => {
    const val = parseFloat(e.target.value);
    if (!val || val <= 0) {
      document.getElementById('swapOut').value = '';
      document.getElementById('swapInUSD').textContent = '≈ $0.00';
      document.getElementById('swapOutUSD').textContent = '≈ $0.00';
      return;
    }
    try {
      const amount = Math.floor(val * 1e9);
      const quote = await getQuote(SOL_MINT, USDC_MINT, amount);
      const out = (quote.outAmount / 1e6).toFixed(2);
      document.getElementById('swapOut').value = out;
      document.getElementById('swapInUSD').textContent = `≈ $${(val * solPriceUSD).toFixed(2)}`;
      document.getElementById('swapOutUSD').textContent = `≈ $${out}`;
    } catch (err) {
      console.error(err);
      document.getElementById('swapOut').value = '';
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
      document.getElementById('swapInUSD').textContent = '≈ $0.00';
      document.getElementById('swapOutUSD').textContent = '≈ $0.00';
    }, 2000);

  } catch (e) {
    console.error(e);
    alert('Erro: ' + e.message);
    btn.textContent = 'Conectar Carteira';
    btn.disabled = false;
  }
}

// ══════════════════ NOTÍCIAS - MOCK ══════════════════
async function loadTwitterNews() {
  const body = document.getElementById('fullBody');
  // Github Pages não tem backend, então mock
  const mockTweets = [
    {author:'Solana',handle:'@solana',avatar:'https://pbs.twimg.com/profile_images/1740002364116910080/KsRY5bWJ_400x400.jpg',verified:true,summary:'Solana ultrapassa 65k TPS em testnet. Mainnet em breve.',likes:4200,retweets:890,replies:320,publishedAt:Date.now()-3600000},
    {author:'CoinHatFeeds',handle:'@coinhatfeeds',verified:false,summary:'Nova memecoin $CHAT listada na Jupiter. Liquidez: $2M',likes:1200,retweets:340,replies:89,publishedAt:Date.now()-7200000},
    {author:'Jupiter Exchange',handle:'@JupiterExchange',avatar:'https://pbs.twimg.com/profile_images/1750859647629828096/GyYJX0vS_400x400.jpg',verified:true,summary:'Volume de swap bate $1.2B em 24h. Novo recorde histórico.',likes:5600,retweets:1200,replies:450,publishedAt:Date.now()-10800000}
  ];

  body.innerHTML = mockTweets.map(t => `
    <div style="border-bottom:1px solid #2a3344;padding:16px">
      <div style="display:flex;gap:8px;margin-bottom:6px;align-items:center">
        <img src="${t.avatar||''}" style="width:32px;height:32px;border-radius:50%;background:#2a3344" onerror="this.style.display='none'">
        <div>
          <div style="font-weight:600">${t.author} ${t.verified?'✓':''}</div>
          <div style="font-size:12px;color:#9fb3c8">${t.handle} · ${new Date(t.publishedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
      </div>
      <div style="margin:8px 0;line-height:1.4;white-space:pre-wrap">${t.summary}</div>
      <div style="font-size:12px;color:#9fb3c8">❤️ ${t.likes} 🔁 ${t.retweets} 💬 ${t.replies}</div>
    </div>
  `).join('');
}

// ══════════════════ MEMECOINS - DEXSCREENER DIRETO ══════════════════
async function loadMemecoins() {
  const grid = document.getElementById('memeGrid');
  grid.innerHTML = '<div class="loading-box">Carregando...</div>';

  try {
    const url = `${DEX_API}/search?q=SOL%20chainId%3Asolana`;
    const res = await fetch(url);
    const data = await res.json();

    const coins = (data.pairs || [])
     .filter(p => p.chainId === 'solana' && p.liquidity?.usd > 50000 && p.fdv < 100000000)
     .sort((a, b) => b.volume.h24 - a.volume.h24)
     .slice(0, 20)
     .map(p => ({
        id: p.baseToken.address,
        name: p.baseToken.name,
        symbol: p.baseToken.symbol,
        image: p.info?.imageUrl || '',
        price: parseFloat(p.priceUsd || 0),
        change: parseFloat(p.priceChange?.h24 || 0),
        volume: p.volume?.h24 || 0,
        liquidity: p.liquidity?.usd || 0,
        marketCap: p.fdv || 0,
        address: p.baseToken.address
      }));

    if (!coins.length) throw new Error('Nenhuma memecoin encontrada');

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
    console.error(e);
    grid.innerHTML = '<div class="loading-box" style="color:#ff5050">Erro ao carregar. Tenta de novo.</div>';
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
    <a href="https://dexscreener.com/solana/${coin.address}" target="_blank">DexScreener</a>
    <a href="https://solscan.io/token/${coin.address}" target="_blank">Solscan</a>
    <a href="https://jup.ag/swap/SOL-${coin.address}" target="_blank">Comprar</a>
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
  const loading = document.getElementById('chartLoading');
  if (currentChart) currentChart.destroy();
  loading.style.display = 'flex';

  try {
    // Pega candles do DexScreener
    const url = `${DEX_API}/pairs/solana/${address}`;
    const res = await fetch(url);
    const data = await res.json();
    const pair = data.pair || data.pairs?.[0];

    // DexScreener não tem API de candle grátis, então simula
    const basePrice = parseFloat(pair?.priceUsd || 0.001);
    const labels = Array.from({length: 24}, (_,i) => `${23-i}h`);
    const chartData = Array.from({length: 24}, (_,i) => {
      const variation = (Math.random() - 0.5) * 0.1;
      return basePrice * (1 + variation * (i/24));
    });

    loading.style.display = 'none';
    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: chartData,
          borderColor: '#1a6bff',
          backgroundColor: 'rgba(26,107,255,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
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
  } catch(e) {
    loading.style.display = 'none';
    console.error('Erro gráfico:', e);
  }
}

function switchTab(btn, tf) {
  document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Recarrega gráfico com timeframe - implementa depois
}

// ══════════════════ TICKER ══════════════════
async function loadTicker() {
  try {
    const url = `${DEX_API}/tokens/${SOL_MINT},EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`;
    const res = await fetch(url);
    const data = await res.json();

    const pairs = data.pairs || [];
    const sol = pairs.find(p => p.baseToken.address === SOL_MINT) || {priceUsd: 150, priceChange: {h24: 0}};
    const usdc = pairs.find(p => p.baseToken.address === USDC_MINT) || {priceUsd: 1, priceChange: {h24: 0}};

    document.getElementById('tickerInner').innerHTML = `
      <span class="ticker-item">SOL $${formatPrice(sol.priceUsd)} <span style="color:${sol.priceChange.h24>0?'#00d395':'#ff5050'}">${sol.priceChange.h24>0?'+':''}${sol.priceChange.h24.toFixed(2)}%</span></span>
      <span class="ticker-item">USDC $${formatPrice(usdc.priceUsd)} <span style="color:${usdc.priceChange.h24>0?'#00d395':'#ff5050'}">${usdc.priceChange.h24>0?'+':''}${usdc.priceChange.h24.toFixed(2)}%</span></span>
      <span class="ticker-item">JUP $0.85 <span style="color:#00d395">+2.4%</span></span>
    `;
  } catch(e) {
    document.getElementById('tickerInner').innerHTML = '<span class="ticker-item">SOL $150.00</span>';
  }
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

// Search
function onSearch(val) {
  const results = document.getElementById('search-results');
  if (!val) { results.style.display = 'none'; return; }
  results.style.display = 'block';
  results.innerHTML = '<div style="padding:12px;color:#9fb3c8">Busca em breve...</div>';
}
function showResults() {}

// Chat
function toggleChat() {
  document.getElementById('chatWindow').classList.toggle('active');
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = document.getElementById('chatMessages');
  if (!input.value) return;
  msg.innerHTML += `<div style="padding:8px;margin:4px 0;background:#0a0f1c;border-radius:8px;text-align:right">${input.value}</div>`;
  msg.innerHTML += `<div style="padding:8px;margin:4px 0;background:#1a2234;border-radius:8px">Em breve respondo isso aí 🤖</div>`;
  input.value = '';
  msg.scrollTop = msg.scrollHeight;
}

// ══════════════════ INIT ══════════════════
document.addEventListener('DOMContentLoaded', async () => {
  await loadMemecoins();
  await loadTicker();
  setInterval(loadTicker, 30000);

  // Fecha lang menu se clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-dropdown')) {
      document.getElementById('langMenu').classList.remove('active');
    }
  });
});
