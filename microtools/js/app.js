// app.js — router + render + UI principal
'use strict';

const $$ = sel => Array.from(document.querySelectorAll(sel));

// ===== TEMA =====
const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = storedTheme;
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
});

// ===== AÑO =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== TABS DE CATEGORÍAS (dinámicos) =====
const catBar = document.getElementById('catTabs');
catBar.innerHTML = Object.entries(CATEGORIES).map(([id,c],i) =>
  `<button class="cat-tab${id==='all'?' active':''}" data-cat="${id}">${ICONS[c.icon]||''}<span>${c.name}</span></button>`
).join('');

let currentCat = 'all';
let currentSearch = '';

// ===== RENDER GRID =====
const grid = document.getElementById('toolsGrid');
function renderTools(){
  const q = currentSearch.toLowerCase().trim();
  const filtered = TOOLS.filter(t => {
    const catOk = currentCat === 'all' || t.cat === currentCat;
    const qOk = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.cat.includes(q);
    return catOk && qOk;
  });
  grid.innerHTML = '';
  if(!filtered.length){
    grid.innerHTML = '<div class="empty">No se encontraron herramientas.</div>';
    return;
  }
  filtered.forEach((t,i) => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.style.animationDelay = `${Math.min(i*25,500)}ms`;
    const tag = !t.ready ? '<span class="tool-tag">Pronto</span>' : '';
    card.innerHTML = `
      ${tag}
      <div class="tool-icon">${ICONS[t.icon] || ICONS.text}</div>
      <div class="tool-name">${t.name}</div>
      <div class="tool-desc">${t.desc}</div>`;
    card.addEventListener('click', () => openTool(t));
    grid.appendChild(card);
  });

  // Inyecta ads cada ~9 tarjetas
  if(filtered.length > 0){
    const cards = grid.querySelectorAll('.tool-card');
    for(let i = 8; i < cards.length; i += 9){
      const ad = document.createElement('div');
      ad.innerHTML = adSlot('grid');
      grid.insertBefore(ad.firstElementChild, cards[i]);
    }
    refreshAds();
  }
}

// ===== EVENTOS NAV =====
catBar.addEventListener('click', e => {
  const btn = e.target.closest('.cat-tab'); if(!btn) return;
  Router.goCategory(btn.dataset.cat);
});

function applyCategory(cat){
  currentCat = cat;
  catBar.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  renderTools();
  showView('home');
  SEO.setHome();
}

$$('[data-cat]').forEach(a => {
  if(a.classList.contains('cat-tab')) return;
  a.addEventListener('click', e => {
    e.preventDefault();
    Router.goCategory(a.dataset.cat);
  });
});
$$('[data-route="home"], [data-route="all"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    Router.goHome();
  });
});

document.getElementById('search').addEventListener('input', e => {
  currentSearch = e.target.value; renderTools();
});

// ===== VIEWS =====
function showView(name){
  $$('.view').forEach(v => v.classList.remove('active'));
  document.querySelector(`[data-view="${name}"]`).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function goHome(){ showView('home'); SEO.setHome() }
document.getElementById('backBtn').addEventListener('click', () => Router.goHome());

// ===== ABRIR HERRAMIENTA =====
const toolContent = document.getElementById('toolContent');

// openTool: handler de click. Navega vía Router (que llama a renderTool).
function openTool(t){
  Router.goTool(t);
}

// renderTool: dibuja la herramienta (lo invoca el router en push y en popstate).
function renderTool(t){
  SEO.setTool(t);
  if(!t.ready){
    toolContent.innerHTML = `
      ${toolHeader(t)}
      <div class="empty" style="padding:40px 0">
        <p style="font-size:18px;margin-bottom:8px">🚧 Próximamente</p>
        <p>Esta herramienta llegará muy pronto.</p>
      </div>
      ${adSlot('tool')}`;
    showView('tool'); return;
  }
  toolContent.innerHTML = `
    ${toolHeader(t)}
    <div id="toolBody"></div>
    <div style="margin-top:30px">${adSlot('tool')}</div>`;
  showView('tool');
  const body = document.getElementById('toolBody');

  // Conversores van por el módulo de conversores
  if(t.cat === 'converters') buildConverterUI(t, body);
  else if(BUILDERS[t.id]) BUILDERS[t.id](body);
  else body.innerHTML = '<div class="empty">Herramienta no encontrada.</div>';
}

function toolHeader(t){
  return `<div class="tool-header">
    <div class="tool-icon">${ICONS[t.icon]||ICONS.text}</div>
    <div><h2>${t.name}</h2><p>${t.desc}</p></div>
  </div>`;
}

// ===== CONVERSORES (incluye los anteriores) =====
function buildConverterUI(t, body){
  if(t.id === 'temperature') return buildTemperature(body);
  if(t.id === 'numbase')     return buildNumBase(body);
  if(t.id === 'roman')       return buildRoman(body);
  if(t.id === 'currency')    return buildCurrency(body);

  const def = CONVERTERS[t.id]; if(!def) return;
  const keys = Object.keys(def.units);
  const optHtml = keys.map(k => `<option value="${k}">${def.units[k].name}</option>`).join('');

  body.innerHTML = `
    <div class="converter-grid">
      <div class="field"><label>De</label>
        <input type="number" id="fromVal" value="1" step="any">
        <select id="fromUnit" style="margin-top:10px">${optHtml}</select></div>
      <button class="swap-btn" id="swap" aria-label="Intercambiar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/></svg></button>
      <div class="field"><label>A</label>
        <input type="number" id="toVal" step="any">
        <select id="toUnit" style="margin-top:10px">${optHtml}</select></div>
    </div>
    <div class="result-box">
      <div><div class="result-label">Resultado</div><div class="result-value" id="resultText">—</div></div>
      <button class="copy-btn" id="copyBtn">Copiar</button>
    </div>`;
  const fromUnit = document.getElementById('fromUnit'), toUnit = document.getElementById('toUnit');
  fromUnit.selectedIndex = 0; toUnit.selectedIndex = Math.min(1, keys.length-1);
  function compute(){
    const v = parseFloat(document.getElementById('fromVal').value);
    if(isNaN(v)){ document.getElementById('toVal').value=''; document.getElementById('resultText').textContent='—'; return }
    const base = v * def.units[fromUnit.value].f;
    const out = base / def.units[toUnit.value].f;
    const rounded = Number(out.toPrecision(10));
    document.getElementById('toVal').value = rounded;
    document.getElementById('resultText').textContent = `${formatNum(v)} ${def.units[fromUnit.value].name} = ${formatNum(rounded)} ${def.units[toUnit.value].name}`;
  }
  document.getElementById('fromVal').addEventListener('input', compute);
  document.getElementById('toVal').addEventListener('input', () => {
    const v = parseFloat(document.getElementById('toVal').value); if(isNaN(v)) return;
    const base = v * def.units[toUnit.value].f;
    const out = base / def.units[fromUnit.value].f;
    document.getElementById('fromVal').value = Number(out.toPrecision(10));
    compute();
  });
  fromUnit.addEventListener('change', compute);
  toUnit.addEventListener('change', compute);
  document.getElementById('swap').addEventListener('click', () => { const a = fromUnit.value; fromUnit.value = toUnit.value; toUnit.value = a; compute() });
  bindCopyText(() => document.getElementById('resultText').textContent);
  compute();
}

function buildTemperature(body){
  const keys = Object.keys(TEMPERATURE.units);
  const opt = keys.map(k=>`<option value="${k}">${TEMPERATURE.units[k]}</option>`).join('');
  body.innerHTML = `
    <div class="converter-grid">
      <div class="field"><label>De</label><input type="number" id="fromVal" value="0" step="any"><select id="fromUnit" style="margin-top:10px">${opt}</select></div>
      <button class="swap-btn" id="swap"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/></svg></button>
      <div class="field"><label>A</label><input type="number" id="toVal" step="any"><select id="toUnit" style="margin-top:10px">${opt}</select></div>
    </div>
    <div class="result-box"><div><div class="result-label">Resultado</div><div class="result-value" id="resultText">—</div></div><button class="copy-btn" id="copyBtn">Copiar</button></div>`;
  document.getElementById('toUnit').value = 'F';
  function compute(){
    const v = parseFloat(document.getElementById('fromVal').value);
    if(isNaN(v)){ document.getElementById('toVal').value=''; document.getElementById('resultText').textContent='—'; return }
    const c = TEMPERATURE.toC[document.getElementById('fromUnit').value](v);
    const out = TEMPERATURE.fromC[document.getElementById('toUnit').value](c);
    document.getElementById('toVal').value = Number(out.toPrecision(10));
    document.getElementById('resultText').textContent = `${formatNum(v)} °${document.getElementById('fromUnit').value} = ${formatNum(Number(out.toFixed(4)))} °${document.getElementById('toUnit').value}`;
  }
  ['fromVal','fromUnit','toUnit'].forEach(id => document.getElementById(id).addEventListener('input', compute));
  document.getElementById('swap').addEventListener('click', () => { const a=document.getElementById('fromUnit').value; document.getElementById('fromUnit').value=document.getElementById('toUnit').value; document.getElementById('toUnit').value=a; compute() });
  bindCopyText(() => document.getElementById('resultText').textContent); compute();
}

function buildNumBase(body){
  body.innerHTML = `
    <div class="converter-grid">
      <div class="field"><label>De (base)</label><input type="text" id="fromVal" value="255"><select id="fromUnit" style="margin-top:10px"><option value="2">Binario</option><option value="8">Octal</option><option value="10" selected>Decimal</option><option value="16">Hex</option></select></div>
      <button class="swap-btn" id="swap"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/></svg></button>
      <div class="field"><label>A (base)</label><input type="text" id="toVal" readonly><select id="toUnit" style="margin-top:10px"><option value="2">Binario</option><option value="8">Octal</option><option value="10">Decimal</option><option value="16" selected>Hex</option></select></div>
    </div>
    <div class="result-box"><div><div class="result-label">Resultado</div><div class="result-value" id="resultText">—</div></div><button class="copy-btn" id="copyBtn">Copiar</button></div>`;
  function compute(){
    const out = convertBase(document.getElementById('fromVal').value, +document.getElementById('fromUnit').value, +document.getElementById('toUnit').value);
    document.getElementById('toVal').value = out;
    document.getElementById('resultText').textContent = out ? `${document.getElementById('fromVal').value} → ${out}` : '—';
  }
  ['fromVal','fromUnit','toUnit'].forEach(id => document.getElementById(id).addEventListener('input', compute));
  document.getElementById('swap').addEventListener('click', () => { const a=document.getElementById('fromUnit').value; document.getElementById('fromUnit').value=document.getElementById('toUnit').value; document.getElementById('toUnit').value=a; document.getElementById('fromVal').value=document.getElementById('toVal').value; compute() });
  bindCopyText(() => document.getElementById('resultText').textContent); compute();
}

function buildRoman(body){
  body.innerHTML = `
    <div class="converter-grid">
      <div class="field"><label>Número decimal</label><input type="number" id="dec" value="2026" min="1" max="3999"></div>
      <div></div>
      <div class="field"><label>Romano</label><input type="text" id="rom" value="MMXXVI"></div>
    </div>
    <div class="result-box"><div><div class="result-label">Resultado</div><div class="result-value" id="resultText">—</div></div><button class="copy-btn" id="copyBtn">Copiar</button></div>`;
  let lock=false;
  document.getElementById('dec').addEventListener('input', () => {
    if(lock) return; lock=true;
    const r = toRoman(+document.getElementById('dec').value);
    document.getElementById('rom').value = r;
    document.getElementById('resultText').textContent = r ? `${document.getElementById('dec').value} = ${r}` : 'Rango: 1–3999';
    lock=false;
  });
  document.getElementById('rom').addEventListener('input', () => {
    if(lock) return; lock=true;
    const n = fromRoman(document.getElementById('rom').value);
    document.getElementById('dec').value = isNaN(n)?'':n;
    document.getElementById('resultText').textContent = isNaN(n) ? 'No válido' : `${document.getElementById('rom').value.toUpperCase()} = ${n}`;
    lock=false;
  });
  bindCopyText(() => document.getElementById('resultText').textContent);
  document.getElementById('dec').dispatchEvent(new Event('input'));
}

async function buildCurrency(body){
  body.innerHTML = `<div class="empty">Cargando tasas…</div>`;
  const rates = await fetchRates();
  const codes = Object.keys(CURRENCIES).filter(c => rates[c] !== undefined);
  const opt = codes.map(c => `<option value="${c}">${c} — ${CURRENCIES[c]}</option>`).join('');
  body.innerHTML = `
    <div class="converter-grid">
      <div class="field"><label>De</label><input type="number" id="fromVal" value="100" step="any"><select id="fromUnit" style="margin-top:10px">${opt}</select></div>
      <button class="swap-btn" id="swap"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/></svg></button>
      <div class="field"><label>A</label><input type="number" id="toVal" step="any"><select id="toUnit" style="margin-top:10px">${opt}</select></div>
    </div>
    <div class="result-box"><div><div class="result-label">Resultado</div><div class="result-value" id="resultText">—</div></div><button class="copy-btn" id="copyBtn">Copiar</button></div>
    <p class="hint" style="margin-top:14px">Tasas indicativas, no para transacciones reales.</p>`;
  document.getElementById('fromUnit').value = 'EUR';
  document.getElementById('toUnit').value = 'USD';
  function compute(){
    const v = parseFloat(document.getElementById('fromVal').value);
    if(isNaN(v)){ document.getElementById('toVal').value=''; document.getElementById('resultText').textContent='—'; return }
    const inEur = v / rates[document.getElementById('fromUnit').value];
    const out = inEur * rates[document.getElementById('toUnit').value];
    document.getElementById('toVal').value = Number(out.toFixed(4));
    document.getElementById('resultText').textContent = `${formatNum(v)} ${document.getElementById('fromUnit').value} = ${formatNum(Number(out.toFixed(2)))} ${document.getElementById('toUnit').value}`;
  }
  ['fromVal','fromUnit','toUnit'].forEach(id => document.getElementById(id).addEventListener('input', compute));
  document.getElementById('swap').addEventListener('click', () => { const a=document.getElementById('fromUnit').value; document.getElementById('fromUnit').value=document.getElementById('toUnit').value; document.getElementById('toUnit').value=a; compute() });
  bindCopyText(() => document.getElementById('resultText').textContent); compute();
}

function formatNum(n){
  if(n === '' || n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if(abs !== 0 && (abs < 0.0001 || abs >= 1e12)) return n.toExponential(4);
  return new Intl.NumberFormat('es-ES',{ maximumFractionDigits: 6 }).format(n);
}

// ===== INIT =====
renderTools();
Router.init(
  renderTool,                // /h/<slug>
  () => { showView('home'); SEO.setHome() },  // /
  applyCategory              // /c/<cat>
);
