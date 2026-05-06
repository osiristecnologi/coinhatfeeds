const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('drawer');
const tabs = document.querySelectorAll('.dtab');
const contents = document.querySelectorAll('.tab-content');

// Abre/fecha menu lateral
menuBtn.onclick = () => drawer.classList.toggle('open');

// Troca de aba
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    drawer.classList.remove('open');
    
    renderTab(tab.dataset.tab);
  }
});

function renderTab(tab) {
  const content = document.getElementById(tab);
  content.innerHTML = `Carregando ${tab}...`;
  // Depois a gente troca isso pelos fetch() da API
}

renderTab('news'); // Carrega primeira aba
