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
  
  if (tab === 'swap') {
    title.textContent = 'Swap';
    body.innerHTML = `
      <div style="padding:16px">
        <div style="background:#1a2234;padding:16px;border-radius:12px;margin-bottom:12px">
          <div style="font-size:12px;color:#9fb3c8;margin-bottom:8px">Você paga</div>
          <div style="display:flex;gap:8px">
            <input id="swapIn" style="flex:1;background:#0a0f1c;border:1px solid #2a3344;color:#fff;padding:12px;border-radius:8px;font-size:18px" placeholder="0.0" type="number"/>
            <button style="background:#2a3344;border:0;color:#fff;padding:0 16px;border-radius:8px;font-weight:600">SOL</button>
          </div>
        </div>
        <div style="text-align:center;margin:8px 0;font-size:20px">↓</div>
        <div style="background:#1a2234;padding:16px;border-radius:12px;margin-bottom:16px">
          <div style="font-size:12px;color:#9fb3c8;margin-bottom:8px">Você recebe</div>
          <div style="display:flex;gap:8px">
            <input id="swapOut" style="flex:1;background:#0a0f1c;border:1px solid #2a3344;color:#fff;padding:12px;border-radius:8px;font-size:18px" placeholder="0.0" disabled/>
            <button style="background:#2a3344;border:0;color:#fff;padding:0 16px;border-radius:8px;font-weight:600">USDC</button>
          </div>
        </div>
        <button style="width:100%;background:#1a6bff;border:0;color:#fff;padding:14px;border-radius:12px;font-weight:600;font-size:16px">Conectar Carteira</button>
        <div style="font-size:11px;color:#9fb3c8;text-align:center;margin-top:12px">Powered by Jupiter</div>
      </div>
    `;
  }
  
  if (tab === 'news') {
    title.textContent = 'Notícias Twitter';
    try {
      const res = await fetch('/api/news?source=twitter');
      const data = await res.json();
      if (!data.length) {
        body.innerHTML = '<div style="padding:20px;color:#ff5050">Sem notícias. Verifica API.</div>';
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
          <div style="margin:8px 0;line-height:1.4">${t.summary}</div>
          <div style="font-size:12px;color:#9fb3c8">❤️ ${t.likes||0} 🔁 ${t.retweets||0} 💬 ${t.replies||0}</div>
        </div>
      `).join('');
    } catch(e) {
      body.innerHTML = `<div style="padding:20px;color:#ff5050">Erro: ${e.message}</div>`;
    }
  }
  
  if (tab === 'alpha') {
    title.textContent = 'Alpha';
    body.innerHTML = '<div style="padding:20px">Calls de alpha em breve...</div>';
  }
  
  if (tab === 'airdrops') {
    title.textContent = 'Airdrops';
    body.innerHTML = '<div style="padding:20px">Lista de airdrops em breve...</div>';
  }
  
  if (tab === 'sponsors') {
    title.textContent = 'Parceiros';
    body.innerHTML = '<div style="padding:20px">Parceiros oficiais em breve...</div>';
  }
  
  if (tab === 'presales') {
    title.textContent = 'Pré-vendas';
    body.innerHTML = '<div style="padding:20px">Pré-vendas ativas em breve...</div>';
  }
}

function closeFull() {
  document.getElementById('fullScreen').classList.remove('active');
}

function closeAll() {
  closeDrawer();
  closeFull();
  closeModal();
}

// ══════════════════ MODAL MEMECOIN ══════════════════
function closeModal() {
  document.getElementById('tokenModal').classList.remove('active');
}

// ══════════════════ MEMECOINS ══════════════════
async function loadMemecoins() {
  const grid = document.getElementById('memeGrid');
  grid.innerHTML = '<div class="loading-box">Carregando...</div>';
  try {
    const res = await fetch('/api/memecoins'); // tua API
    const coins = await res.json();
    grid.innerHTML = coins.map(c => `
      <div class="coin-card" onclick="openCoinModal('${c.id}')">
        <img src="${c.image}" style="width:40px;height:40px;border-radius:50%">
        <div style="font-weight:600">${c.name}</div>
        <div style="font-size:12px;color:#9fb3c8">${c.symbol}</div>
        <div style="font-size:18px;font-weight:700;margin-top:8px">$${c.price}</div>
        <div style="color:${c.change>0?'#00d395':'#ff5050'};font-size:14px">${c.change>0?'+':''}${c.change}%</div>
      </div>
    `).join('');
  } catch(e) {
    grid.innerHTML = '<div class="loading-box" style="color:#ff5050">Erro ao carregar</div>';
  }
}

// ══════════════════ INIT ══════════════════
loadMemecoins();
