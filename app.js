/* ═══════════════════════════════════════
   CoinHatFeeds · app.js COMPLETO
   ═══════════════════════════════════════ */

const DEX_API = 'https://api.dexscreener.com/latest/dex';
const TRADE_API = 'https://api.jup.ag';
let allCoins = [];
let currentChart = null;

// ══════════════════ UTILS ══════════════════
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const formatNum = n => {
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(2) + 'K';
  return n?.toFixed(2) || '0';
};

const formatPrice = p => {
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.01) return p.toFixed(4);
  return p.toFixed(8);
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ══════════════════ HEADER ══════════════════
function toggleDrawer() {
  $('#drawer').classList.toggle('open');
  $('#overlay').classList.toggle('active');
}

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#overlay').classList.remove('active');
}

function toggleLangMenu() {
  $('#langMenu').classList.toggle('active');
}

// ══════════════════ BUSCA ══════════════════
async function loadMemecoins() {
  const grid = $('#memeGrid');
  grid.innerHTML = '<div class="loading-box">Carregando...</div>';
  
  try {
    const url = `${DEX_API}/search?q=SOL%20chainId%3Asolana`;
    const res = await fetch(url);
    const data = await res.json();
    
    allCoins = (data.pairs || [])
     .filter(p => p.chainId === 'solana' && p.liquidity?.usd > 50000)
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
    
    renderCoins(allCoins);
    
  } catch(e) {
    console.error(e);
    grid.innerHTML = '<div class="loading-box" style="color:#ff5050">Erro ao carregar moedas</div>';
  }
}

function renderCoins(coins) {
  const grid = $('#memeGrid');
  if (!coins.length) {
    grid.innerHTML = '<div class="loading-box">Nenhuma moeda encontrada</div>';
    return;
  }
  
  grid.innerHTML = coins.map(c => `
    <div class="coin-card" onclick='openCoinModal(${JSON.stringify(c).replace(/'/g,"&apos;")})'>
      <div class="meme-top">
        <img src="${c.image}" class="meme-logo" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"44\\" height=\\"44\\"%3E%3Crect fill=\\"%232a3344\\" width=\\"44\\" height=\\"44\\"/%3E%3C/svg%3E'">
        <div>
          <div class="meme-name">${c.name}</div>
          <div class="meme-sym">${c.symbol}</div>
        </div>
      </div>
      <div class="meme-price">$${formatPrice(c.price)}</div>
      <div class="meme-chg" style="color:${c.change>0?'#00d395':'#ff5050'}">${c.change>0?'+':''}${c.change.toFixed(2)}%</div>
    </div>
  `).join('');
}

function onSearch(val) {
  const results = $('#search-results');
  
  if (!val || val.length < 2) { 
    results.style.display = 'none'; 
    renderCoins(allCoins);
    return; 
  }
  
  const searchTerm = val.toLowerCase();
  const filtered = allCoins.filter(c => 
    c.name.toLowerCase().includes(searchTerm) || 
    c.symbol.toLowerCase().includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm)
  );
  
  renderCoins(filtered);
  
  results.style.display = 'block';
  results.innerHTML = filtered.slice(0, 5).map(c => `
    <div onclick='openCoinModal(${JSON.stringify(c).replace(/'/g,"&apos;")});$("#search-results").style.display="none"' style="padding:12px;border-bottom:1px solid #2a3344;cursor:pointer;display:flex;gap:10px;align-items:center">
      <img src="${c.image}" style="width:32px;height:32px;border-radius:50%" onerror="this.style.display='none'">
      <div>
        <div style="font-weight:600;font-size:14px">${c.name}</div>
        <div style="font-size:12px;color:#9fb3c8">${c.symbol} · $${formatPrice(c.price)}</div>
      </div>
    </div>
  `).join('') || '<div style="padding:12px;color:#9fb3c8">Nada encontrado</div>';
}

function showResults() {
  if ($('#searchInput').value.length >= 2) {
    $('#search-results').style.display = 'block';
  }
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) {
    $('#search-results').style.display = 'none';
  }
  if (!e.target.closest('.lang-dropdown')) {
    $('#langMenu').classList.remove('active');
  }
});

// ══════════════════ MODAL TOKEN ══════════════════
function openCoinModal(coin) {
  if (typeof coin === 'string') coin = JSON.parse(coin);
  const modal = $('#tokenModal');
  modal.classList.add('active');
  document.body.classList.add('modal-open');
  
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  
  $('#m-logo').src = coin.image;
  $('#m-name').textContent = coin.name;
  $('#m-sym').textContent = coin.symbol;
  $('#m-price').textContent = '$' + formatPrice(coin.price);
  $('#m-chg').textContent = `${coin.change>0?'+':''}${coin.change.toFixed(2)}%`;
  $('#m-chg').style.color = coin.change>0?'#00d395':'#ff5050';
  $('#m-vol').textContent = '$' + formatNum(coin.volume);
  $('#m-liq').textContent = '$' + formatNum(coin.liquidity);
  $('#m-mc').textContent = '$' + formatNum(coin.marketCap);
  $('#m-addr').textContent = coin.address;
  
  $('#m-links').innerHTML = `
    <a href="https://dexscreener.com/solana/${coin.address}" target="_blank">DexScreener</a>
    <a href="https://solscan.io/token/${coin.address}" target="_blank">Solscan</a>
    <a href="https://jup.ag/swap/SOL-${coin.address}" target="_blank">Comprar</a>
  `;
  
  loadChart(coin.address);
}

function closeModal() {
  const modal = $('#tokenModal');
  modal.classList.remove('active');
  modal.onclick = null;
  document.body.classList.remove('modal-open');
  $('.custom-chart-wrap').innerHTML = '';
}

async function loadChart(address) {
  const wrap = $('.custom-chart-wrap');
  wrap.innerHTML = `
    <iframe 
      src="https://dexscreener.com/solana/${address}?embed=1&theme=light&trades=0&info=0" 
      style="width:100%;height:250px;border:0;border-radius:8px" 
      frameborder="0">
    </iframe>
  `;
}

// ══════════════════ TABS DRAWER ══════════════════
function switchTab(el, tab) {
  $$('.dtab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  closeDrawer();
  
  if (tab === 'home') {
    loadMemecoins();
  }
}

// ══════════════════ CHAT ══════════════════
function toggleChat() {
  $('#chatWindow').classList.toggle('active');
}

function sendMessage() {
  const input = $('#chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  
  const messages = $('#chatMessages');
  messages.innerHTML += `
    <div style="text-align:right;margin:8px 0">
      <div style="display:inline-block;background:var(--blue);color:#fff;padding:8px 12px;border-radius:12px;max-width:80%">${msg}</div>
    </div>
  `;
  
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
  
  // Resposta fake do bot
  setTimeout(() => {
    messages.innerHTML += `
      <div style="margin:8px 0">
        <div style="display:inline-block;background:#1a2234;color:#fff;padding:8px 12px;border-radius:12px;max-width:80%">Ainda tô aprendendo a responder isso 😅</div>
      </div>
    `;
    messages.scrollTop = messages.scrollHeight;
  }, 600);
}

// ══════════════════ TICKER ══════════════════
function updateTicker() {
  const ticker = $('#tickerInner');
  if (!allCoins.length) return;
  
  ticker.innerHTML = allCoins.map(c => `
    <div class="ticker-item">
      ${c.symbol} $${formatPrice(c.price)} 
      <span style="color:${c.change>0?'#00d395':'#ff5050'}">${c.change>0?'+':''}${c.change.toFixed(2)}%</span>
    </div>
  `).join('');
}

// ══════════════════ INIT ══════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadMemecoins();
  
  // Enter no chat
  $('#chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Atualiza ticker a cada 30s
  setInterval(updateTicker, 30000);
});
