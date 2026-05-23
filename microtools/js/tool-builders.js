// Builders para herramientas no-conversores.
// Cada función recibe el container (body) y dibuja el UI completo.

const BUILDERS = {};

// ============ HELPERS ============
function el(html){
  const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild;
}
function row(label, input){
  return `<div class="field"><label>${label}</label>${input}</div>`;
}
function resultBox(initial='—', copyable=true){
  return `<div class="result-box">
    <div><div class="result-label">Resultado</div><div class="result-value" id="resultText">${initial}</div></div>
    ${copyable ? '<button class="copy-btn" id="copyBtn">Copiar</button>' : ''}
  </div>`;
}
function grid(html, cols=2){
  return `<div class="form-grid" style="grid-template-columns:repeat(${cols},1fr)">${html}</div>`;
}

// ============ CALCULADORAS ============
BUILDERS.mortgage = body => {
  body.innerHTML = `
    ${grid(
      row('Importe del préstamo (€)','<input type="number" id="amt" value="200000">') +
      row('Interés anual (%)','<input type="number" id="rate" value="3.5" step="0.01">') +
      row('Plazo (años)','<input type="number" id="years" value="25">'),
    3)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>`;
  const calc = () => {
    const P = +$('#amt').value, r = +$('#rate').value/100/12, n = +$('#years').value*12;
    if(!P||!n) return;
    const M = r === 0 ? P/n : P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    const total = M*n, intereses = total - P;
    $('#resultText').textContent = `Cuota: ${fmtEUR(M)} / mes`;
    $('#extra').innerHTML = `
      <div class="metric"><span class="metric-label">Total a pagar</span><span class="metric-value">${fmtEUR(total)}</span></div>
      <div class="metric"><span class="metric-label">Total intereses</span><span class="metric-value">${fmtEUR(intereses)}</span></div>
      <div class="metric"><span class="metric-label">Nº cuotas</span><span class="metric-value">${n}</span></div>`;
  };
  ['amt','rate','years'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.loan = BUILDERS.mortgage; // mismo cálculo

BUILDERS.compound = body => {
  body.innerHTML = `
    ${grid(
      row('Capital inicial (€)','<input type="number" id="P" value="1000">') +
      row('Aportación mensual (€)','<input type="number" id="pm" value="100">') +
      row('Interés anual (%)','<input type="number" id="r" value="7" step="0.1">') +
      row('Años','<input type="number" id="y" value="20">'),
    2)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>`;
  const calc = () => {
    const P=+$('#P').value, pm=+$('#pm').value, r=+$('#r').value/100/12, n=+$('#y').value*12;
    let total = P;
    for(let i=0;i<n;i++) total = total*(1+r) + pm;
    const aportado = P + pm*n;
    const ganado = total - aportado;
    $('#resultText').textContent = `Total final: ${fmtEUR(total)}`;
    $('#extra').innerHTML = `
      <div class="metric"><span class="metric-label">Aportado</span><span class="metric-value">${fmtEUR(aportado)}</span></div>
      <div class="metric"><span class="metric-label">Intereses ganados</span><span class="metric-value" style="color:#10b981">${fmtEUR(ganado)}</span></div>`;
  };
  ['P','pm','r','y'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.bmi = body => {
  body.innerHTML = `
    ${grid(
      row('Peso (kg)','<input type="number" id="w" value="70" step="0.1">') +
      row('Altura (cm)','<input type="number" id="h" value="175">'),
    2)}
    ${resultBox()}
    <div id="cat" style="margin-top:14px"></div>`;
  const calc = () => {
    const w=+$('#w').value, h=+$('#h').value/100;
    if(!w||!h) return;
    const b = w/(h*h);
    let cat='', color='';
    if(b<18.5){cat='Bajo peso';color='#3b82f6'}
    else if(b<25){cat='Peso normal';color='#10b981'}
    else if(b<30){cat='Sobrepeso';color='#f59e0b'}
    else{cat='Obesidad';color='#ef4444'}
    $('#resultText').textContent = `IMC: ${b.toFixed(1)}`;
    $('#cat').innerHTML = `<div class="badge" style="background:${color}20;color:${color};border-color:${color}40">${cat}</div>`;
  };
  ['w','h'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.calories = body => {
  body.innerHTML = `
    ${grid(
      row('Edad','<input type="number" id="age" value="30">') +
      row('Sexo','<select id="sex"><option value="m">Masculino</option><option value="f">Femenino</option></select>') +
      row('Peso (kg)','<input type="number" id="w" value="70">') +
      row('Altura (cm)','<input type="number" id="h" value="175">') +
      row('Actividad','<select id="act"><option value="1.2">Sedentaria</option><option value="1.375" selected>Ligera</option><option value="1.55">Moderada</option><option value="1.725">Intensa</option><option value="1.9">Muy intensa</option></select>'),
    3)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>`;
  const calc = () => {
    const age=+$('#age').value, w=+$('#w').value, h=+$('#h').value, sex=$('#sex').value, act=+$('#act').value;
    if(!age||!w||!h) return;
    const tmb = sex==='m' ? 10*w+6.25*h-5*age+5 : 10*w+6.25*h-5*age-161;
    const total = tmb*act;
    $('#resultText').textContent = `Calorías diarias: ${Math.round(total)} kcal`;
    $('#extra').innerHTML = `
      <div class="metric"><span class="metric-label">TMB (reposo)</span><span class="metric-value">${Math.round(tmb)} kcal</span></div>
      <div class="metric"><span class="metric-label">Para perder peso</span><span class="metric-value">${Math.round(total-500)} kcal</span></div>
      <div class="metric"><span class="metric-label">Para ganar peso</span><span class="metric-value">${Math.round(total+500)} kcal</span></div>`;
  };
  ['age','sex','w','h','act'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.tip = body => {
  body.innerHTML = `
    ${grid(
      row('Cuenta total (€)','<input type="number" id="bill" value="50" step="0.01">') +
      row('Propina (%)','<input type="number" id="pct" value="10">') +
      row('Personas','<input type="number" id="ppl" value="2" min="1">'),
    3)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>`;
  const calc = () => {
    const b=+$('#bill').value, p=+$('#pct').value, n=Math.max(1,+$('#ppl').value);
    const tip=b*p/100, total=b+tip;
    $('#resultText').textContent = `Total: ${fmtEUR(total)}`;
    $('#extra').innerHTML = `
      <div class="metric"><span class="metric-label">Propina</span><span class="metric-value">${fmtEUR(tip)}</span></div>
      <div class="metric"><span class="metric-label">Por persona</span><span class="metric-value">${fmtEUR(total/n)}</span></div>`;
  };
  ['bill','pct','ppl'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.percent = body => {
  body.innerHTML = `
    <p class="hint">Calculadora de porcentajes en varios modos</p>
    <div class="pct-rows">
      <div class="pct-row"><span>¿Cuánto es el</span><input type="number" id="p1a" value="20" style="width:90px"><span>% de</span><input type="number" id="p1b" value="200" style="width:120px"><span>?</span><strong id="r1">= 40</strong></div>
      <div class="pct-row"><input type="number" id="p2a" value="40" style="width:90px"><span>es qué % de</span><input type="number" id="p2b" value="200" style="width:120px"><span>?</span><strong id="r2">= 20%</strong></div>
      <div class="pct-row"><span>De</span><input type="number" id="p3a" value="200" style="width:120px"><span>a</span><input type="number" id="p3b" value="250" style="width:120px"><span>varía un</span><strong id="r3">= +25%</strong></div>
    </div>`;
  const calc = () => {
    $('#r1').textContent = `= ${(+$('#p1a').value * +$('#p1b').value / 100).toFixed(2)}`;
    $('#r2').textContent = `= ${(+$('#p2a').value / +$('#p2b').value * 100).toFixed(2)}%`;
    const a=+$('#p3a').value, b=+$('#p3b').value;
    const v = ((b-a)/a*100); $('#r3').textContent = `= ${v>=0?'+':''}${v.toFixed(2)}%`;
  };
  ['p1a','p1b','p2a','p2b','p3a','p3b'].forEach(id => $('#'+id).addEventListener('input', calc));
  calc();
};

BUILDERS.age = body => {
  const today = new Date().toISOString().slice(0,10);
  body.innerHTML = `
    ${grid(row('Fecha de nacimiento',`<input type="date" id="b" value="2000-01-01">`) + row('Hasta',`<input type="date" id="t" value="${today}">`),2)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>`;
  const calc = () => {
    const b = new Date($('#b').value), t = new Date($('#t').value);
    if(isNaN(b)||isNaN(t)) return;
    let y=t.getFullYear()-b.getFullYear(), m=t.getMonth()-b.getMonth(), d=t.getDate()-b.getDate();
    if(d<0){m--; d+=new Date(t.getFullYear(),t.getMonth(),0).getDate()}
    if(m<0){y--; m+=12}
    const days = Math.floor((t-b)/86400000);
    $('#resultText').textContent = `${y} años, ${m} meses, ${d} días`;
    $('#extra').innerHTML = `
      <div class="metric"><span class="metric-label">Días vividos</span><span class="metric-value">${days.toLocaleString('es')}</span></div>
      <div class="metric"><span class="metric-label">Horas</span><span class="metric-value">${(days*24).toLocaleString('es')}</span></div>
      <div class="metric"><span class="metric-label">Minutos</span><span class="metric-value">${(days*1440).toLocaleString('es')}</span></div>`;
  };
  ['b','t'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.datediff = BUILDERS.age;

BUILDERS.discount = body => {
  body.innerHTML = `
    ${grid(row('Precio original (€)','<input type="number" id="p" value="100">') + row('Descuento (%)','<input type="number" id="d" value="25">'),2)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>`;
  const calc = () => {
    const p=+$('#p').value, d=+$('#d').value;
    const save=p*d/100, final=p-save;
    $('#resultText').textContent = `Precio final: ${fmtEUR(final)}`;
    $('#extra').innerHTML = `<div class="metric"><span class="metric-label">Ahorras</span><span class="metric-value" style="color:#10b981">${fmtEUR(save)}</span></div>`;
  };
  ['p','d'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

// IRPF España (tramos estatales aprox 2024 — orientativo)
BUILDERS.irpf = body => {
  body.innerHTML = `
    ${grid(row('Bruto anual (€)','<input type="number" id="g" value="30000">') + row('Tipo','<select id="t"><option value="general">Renta general</option></select>'),2)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>
    <p class="hint">⚠️ Estimación orientativa basada en tramos estatales. No incluye autonómicas ni deducciones personales.</p>`;
  const tramos = [[12450,.19],[20200,.24],[35200,.30],[60000,.37],[300000,.45],[Infinity,.47]];
  const calc = () => {
    let g = +$('#g').value, prev=0, total=0;
    for(const [lim,t] of tramos){
      if(g<=0) break;
      const taxable = Math.min(g, lim-prev);
      total += taxable*t; g -= taxable; prev = lim;
    }
    const bruto = +$('#g').value;
    const neto = bruto - total;
    const tipoMedio = bruto>0 ? total/bruto*100 : 0;
    $('#resultText').textContent = `IRPF estimado: ${fmtEUR(total)}`;
    $('#extra').innerHTML = `
      <div class="metric"><span class="metric-label">Neto anual</span><span class="metric-value">${fmtEUR(neto)}</span></div>
      <div class="metric"><span class="metric-label">Neto mensual (×14)</span><span class="metric-value">${fmtEUR(neto/14)}</span></div>
      <div class="metric"><span class="metric-label">Tipo medio</span><span class="metric-value">${tipoMedio.toFixed(2)}%</span></div>`;
  };
  ['g'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

// ============ GENERADORES ============
BUILDERS.password = body => {
  body.innerHTML = `
    ${grid(
      row('Longitud','<input type="number" id="len" value="16" min="4" max="128">') +
      row('Cantidad','<input type="number" id="qty" value="1" min="1" max="50">'),
    2)}
    <div class="checkbox-row">
      <label><input type="checkbox" id="up" checked> Mayúsculas</label>
      <label><input type="checkbox" id="lo" checked> Minúsculas</label>
      <label><input type="checkbox" id="nu" checked> Números</label>
      <label><input type="checkbox" id="sy"> Símbolos</label>
    </div>
    <button class="btn btn-primary" id="gen">Generar</button>
    <div id="out" class="output-list"></div>`;
  const gen = () => {
    const len = +$('#len').value, qty = +$('#qty').value;
    let pool = '';
    if($('#up').checked) pool += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if($('#lo').checked) pool += 'abcdefghijkmnopqrstuvwxyz';
    if($('#nu').checked) pool += '23456789';
    if($('#sy').checked) pool += '!@#$%^&*-_=+?';
    if(!pool){ $('#out').innerHTML = '<p class="hint">Selecciona al menos una opción</p>'; return }
    const out = [];
    for(let i=0;i<qty;i++){
      let p='';
      const arr = new Uint32Array(len); crypto.getRandomValues(arr);
      for(let j=0;j<len;j++) p += pool[arr[j]%pool.length];
      out.push(p);
    }
    $('#out').innerHTML = out.map(p => `<div class="output-item"><code>${p}</code><button class="copy-mini" data-copy="${p}">Copiar</button></div>`).join('');
    $('#out').querySelectorAll('.copy-mini').forEach(b => b.onclick = () => { navigator.clipboard.writeText(b.dataset.copy); b.textContent='✓'; setTimeout(()=>b.textContent='Copiar',1200) });
  };
  $('#gen').onclick = gen; gen();
};

BUILDERS.uuid = body => {
  body.innerHTML = `
    ${row('Cantidad','<input type="number" id="qty" value="5" min="1" max="100">')}
    <button class="btn btn-primary" id="gen" style="margin-top:14px">Generar UUIDs</button>
    <div id="out" class="output-list"></div>`;
  const u = () => crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16)});
  const gen = () => {
    const n = +$('#qty').value;
    const arr = Array.from({length:n},u);
    $('#out').innerHTML = arr.map(x => `<div class="output-item"><code>${x}</code><button class="copy-mini" data-copy="${x}">Copiar</button></div>`).join('');
    $('#out').querySelectorAll('.copy-mini').forEach(b => b.onclick = () => { navigator.clipboard.writeText(b.dataset.copy); b.textContent='✓'; setTimeout(()=>b.textContent='Copiar',1200) });
  };
  $('#gen').onclick = gen; gen();
};

BUILDERS.qr = body => {
  body.innerHTML = `
    ${row('Texto o URL','<input type="text" id="t" value="https://toolhub.example">')}
    ${row('Tamaño','<select id="s"><option>200</option><option selected>300</option><option>400</option><option>600</option></select>')}
    <div id="qrout" style="margin-top:20px;text-align:center"></div>`;
  const draw = () => {
    const txt = encodeURIComponent($('#t').value || ' ');
    const sz = $('#s').value;
    $('#qrout').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${sz}x${sz}&data=${txt}" alt="QR" style="border-radius:14px;background:#fff;padding:14px;max-width:100%">
      <div style="margin-top:14px"><a class="btn btn-secondary" href="https://api.qrserver.com/v1/create-qr-code/?size=${sz}x${sz}&data=${txt}" download="qr.png">Descargar PNG</a></div>`;
  };
  ['t','s'].forEach(id => $('#'+id).addEventListener('input', draw));
  draw();
};

BUILDERS.lorem = body => {
  body.innerHTML = `
    ${grid(row('Párrafos','<input type="number" id="n" value="3" min="1" max="20">') + row('Tipo','<select id="t"><option value="p">Párrafos</option><option value="s">Frases</option><option value="w">Palabras</option></select>'),2)}
    <button class="btn btn-primary" id="gen" style="margin-top:14px">Generar</button>
    <textarea id="out" class="textarea" readonly style="margin-top:14px;min-height:240px"></textarea>
    <button class="copy-btn" id="copyBtn" style="margin-top:10px">Copiar</button>`;
  const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  const w = () => words[Math.floor(Math.random()*words.length)];
  const sentence = () => { const n=8+Math.floor(Math.random()*12); let s=''; for(let i=0;i<n;i++) s+=(i?' ':'')+w(); return s.charAt(0).toUpperCase()+s.slice(1)+'.'};
  const para = () => { const n=4+Math.floor(Math.random()*4); return Array.from({length:n},sentence).join(' ')};
  const gen = () => {
    const n=+$('#n').value, t=$('#t').value;
    let out='';
    if(t==='w') out = Array.from({length:n*5},w).join(' ');
    else if(t==='s') out = Array.from({length:n},sentence).join(' ');
    else out = Array.from({length:n},para).join('\n\n');
    $('#out').value = out;
  };
  $('#gen').onclick = gen;
  bindCopyText(() => $('#out').value); gen();
};

BUILDERS.random = body => {
  body.innerHTML = `
    ${grid(row('Mínimo','<input type="number" id="mn" value="1">') + row('Máximo','<input type="number" id="mx" value="100">'),2)}
    <button class="btn btn-primary" id="gen" style="margin-top:14px">Generar número</button>
    <div class="result-box" style="margin-top:16px"><div><div class="result-label">Número</div><div class="result-value" id="r" style="font-size:48px">—</div></div></div>`;
  const gen = () => {
    const a=+$('#mn').value, b=+$('#mx').value;
    const n = Math.floor(Math.random()*(b-a+1))+a;
    $('#r').textContent = n;
    $('#r').animate([{transform:'scale(.9)',opacity:.5},{transform:'scale(1)',opacity:1}],{duration:300,easing:'cubic-bezier(.22,.61,.36,1)'});
  };
  $('#gen').onclick = gen; gen();
};

BUILDERS.hash = body => {
  body.innerHTML = `
    ${row('Texto','<textarea id="t" class="textarea" style="min-height:100px">Hola mundo</textarea>')}
    ${row('Algoritmo','<select id="a"><option>SHA-1</option><option selected>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select>')}
    ${resultBox()}`;
  const calc = async () => {
    const enc = new TextEncoder().encode($('#t').value);
    const h = await crypto.subtle.digest($('#a').value, enc);
    const hex = Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
    $('#resultText').textContent = hex;
  };
  ['t','a'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.palette = body => {
  body.innerHTML = `
    ${row('Color base','<input type="color" id="c" value="#6366f1">')}
    ${row('Esquema','<select id="m"><option value="mono">Monocromático</option><option value="comp">Complementario</option><option value="tri" selected>Triádico</option><option value="ana">Análogo</option></select>')}
    <div class="palette-grid" id="pal" style="margin-top:18px"></div>`;
  const hexToHsl = h => { const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let H=0,S=0,L=(mx+mn)/2; if(mx!==mn){const d=mx-mn; S=L>.5?d/(2-mx-mn):d/(mx+mn); if(mx===r)H=(g-b)/d+(g<b?6:0);else if(mx===g)H=(b-r)/d+2;else H=(r-g)/d+4; H*=60} return [H,S*100,L*100]};
  const hslToHex = (h,s,l) => { s/=100; l/=100; const k=n=>(n+h/30)%12; const a=s*Math.min(l,1-l); const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1)); const t=x=>Math.round(x*255).toString(16).padStart(2,'0'); return '#'+t(f(0))+t(f(8))+t(f(4))};
  const draw = () => {
    const [h,s,l] = hexToHsl($('#c').value);
    const m = $('#m').value;
    let cols=[];
    if(m==='mono') cols = [.3,.5,.7,.9,1.2].map(x => hslToHex(h, s, Math.min(95,l*x)));
    else if(m==='comp') cols = [h, (h+180)%360].flatMap(H => [hslToHex(H,s,l), hslToHex(H,s,Math.min(85,l*1.3))]).slice(0,5);
    else if(m==='tri') cols = [h,(h+120)%360,(h+240)%360].flatMap(H => [hslToHex(H,s,l)]).concat([hslToHex(h,s,l*1.3),hslToHex(h,s,l*.7)]);
    else cols = [-30,-15,0,15,30].map(d => hslToHex((h+d+360)%360,s,l));
    $('#pal').innerHTML = cols.map(c => `<div class="swatch" style="background:${c}"><span>${c.toUpperCase()}</span><button class="copy-mini" data-copy="${c}">Copiar</button></div>`).join('');
    $('#pal').querySelectorAll('.copy-mini').forEach(b => b.onclick = () => { navigator.clipboard.writeText(b.dataset.copy); b.textContent='✓'; setTimeout(()=>b.textContent='Copiar',1200) });
  };
  ['c','m'].forEach(id => $('#'+id).addEventListener('input', draw));
  draw();
};

// ============ TEXTO ============
BUILDERS.wordcount = body => {
  body.innerHTML = `
    <textarea id="t" class="textarea" placeholder="Pega tu texto aquí…" style="min-height:200px"></textarea>
    <div class="result-grid" id="stats" style="margin-top:16px"></div>`;
  const calc = () => {
    const t = $('#t').value;
    const chars = t.length;
    const charsNoSp = t.replace(/\s/g,'').length;
    const words = (t.trim().match(/\S+/g) || []).length;
    const sentences = (t.match(/[.!?]+/g) || []).length;
    const lines = t ? t.split('\n').length : 0;
    const readMin = Math.max(1, Math.ceil(words/220));
    $('#stats').innerHTML = `
      <div class="metric"><span class="metric-label">Palabras</span><span class="metric-value">${words}</span></div>
      <div class="metric"><span class="metric-label">Caracteres</span><span class="metric-value">${chars}</span></div>
      <div class="metric"><span class="metric-label">Sin espacios</span><span class="metric-value">${charsNoSp}</span></div>
      <div class="metric"><span class="metric-label">Frases</span><span class="metric-value">${sentences}</span></div>
      <div class="metric"><span class="metric-label">Líneas</span><span class="metric-value">${lines}</span></div>
      <div class="metric"><span class="metric-label">Lectura</span><span class="metric-value">${readMin} min</span></div>`;
  };
  $('#t').addEventListener('input', calc); calc();
};

BUILDERS.case = body => {
  body.innerHTML = `
    <textarea id="t" class="textarea" style="min-height:120px">Hola Mundo, esto es Una Prueba</textarea>
    <div class="btn-group" style="margin-top:12px">
      <button class="btn" data-m="upper">MAYÚSCULAS</button>
      <button class="btn" data-m="lower">minúsculas</button>
      <button class="btn" data-m="title">Título</button>
      <button class="btn" data-m="sentence">Sentencia</button>
      <button class="btn" data-m="alt">aLtErNa</button>
      <button class="btn" data-m="camel">camelCase</button>
      <button class="btn" data-m="snake">snake_case</button>
      <button class="btn" data-m="kebab">kebab-case</button>
    </div>
    <textarea id="o" class="textarea" readonly style="margin-top:14px;min-height:120px"></textarea>
    <button class="copy-btn" id="copyBtn" style="margin-top:10px">Copiar</button>`;
  const transform = (t,m) => {
    if(m==='upper') return t.toUpperCase();
    if(m==='lower') return t.toLowerCase();
    if(m==='title') return t.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
    if(m==='sentence') return t.toLowerCase().replace(/(^|\.\s+)([a-z])/g,(_,a,b)=>a+b.toUpperCase());
    if(m==='alt') return [...t].map((c,i)=>i%2?c.toLowerCase():c.toUpperCase()).join('');
    if(m==='camel') return t.toLowerCase().replace(/[^a-z0-9]+(.)/g,(_,c)=>c.toUpperCase());
    if(m==='snake') return t.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
    if(m==='kebab') return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return t;
  };
  body.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { $('#o').value = transform($('#t').value, b.dataset.m) });
  bindCopyText(() => $('#o').value);
};

BUILDERS.slug = body => {
  body.innerHTML = `
    ${row('Texto','<input type="text" id="t" value="¡Hola Mundo! Esta es mi PRIMERA prueba">')}
    ${resultBox()}`;
  const calc = () => {
    const s = $('#t').value.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    $('#resultText').textContent = s || '—';
  };
  $('#t').addEventListener('input', calc);
  bindCopyText(() => $('#resultText').textContent); calc();
};

BUILDERS.reverse = body => {
  body.innerHTML = `
    <textarea id="t" class="textarea" style="min-height:120px">Hola mundo</textarea>
    <div class="btn-group" style="margin-top:12px">
      <button class="btn" data-m="chars">Invertir caracteres</button>
      <button class="btn" data-m="words">Invertir palabras</button>
      <button class="btn" data-m="lines">Invertir líneas</button>
    </div>
    <textarea id="o" class="textarea" readonly style="margin-top:14px;min-height:120px"></textarea>
    <button class="copy-btn" id="copyBtn" style="margin-top:10px">Copiar</button>`;
  const tr = (t,m) => {
    if(m==='chars') return [...t].reverse().join('');
    if(m==='words') return t.split(/\s+/).reverse().join(' ');
    if(m==='lines') return t.split('\n').reverse().join('\n');
  };
  body.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { $('#o').value = tr($('#t').value, b.dataset.m) });
  bindCopyText(() => $('#o').value);
};

BUILDERS.base64 = body => {
  body.innerHTML = `
    <textarea id="i" class="textarea" style="min-height:120px">Hola mundo</textarea>
    <div class="btn-group" style="margin-top:12px">
      <button class="btn btn-primary" id="enc">Codificar →</button>
      <button class="btn" id="dec">← Decodificar</button>
    </div>
    <textarea id="o" class="textarea" style="margin-top:14px;min-height:120px"></textarea>
    <button class="copy-btn" id="copyBtn" style="margin-top:10px">Copiar</button>`;
  $('#enc').onclick = () => { try{ $('#o').value = btoa(unescape(encodeURIComponent($('#i').value))) }catch(e){ $('#o').value='Error: '+e.message } };
  $('#dec').onclick = () => { try{ $('#o').value = decodeURIComponent(escape(atob($('#i').value))) }catch(e){ $('#o').value='Error: Base64 inválido' } };
  bindCopyText(() => $('#o').value); $('#enc').click();
};

BUILDERS.urlcode = body => {
  body.innerHTML = `
    <textarea id="i" class="textarea" style="min-height:120px">https://ejemplo.com/?q=hola mundo&x=á</textarea>
    <div class="btn-group" style="margin-top:12px">
      <button class="btn btn-primary" id="enc">Codificar →</button>
      <button class="btn" id="dec">← Decodificar</button>
    </div>
    <textarea id="o" class="textarea" style="margin-top:14px;min-height:120px"></textarea>
    <button class="copy-btn" id="copyBtn" style="margin-top:10px">Copiar</button>`;
  $('#enc').onclick = () => { $('#o').value = encodeURIComponent($('#i').value) };
  $('#dec').onclick = () => { try{ $('#o').value = decodeURIComponent($('#i').value) }catch(e){ $('#o').value='Error' } };
  bindCopyText(() => $('#o').value); $('#enc').click();
};

BUILDERS.json = body => {
  body.innerHTML = `
    <textarea id="i" class="textarea" style="min-height:160px">{"nombre":"Toolhub","activo":true,"tools":[1,2,3]}</textarea>
    <div class="btn-group" style="margin-top:12px">
      <button class="btn btn-primary" id="pretty">Embellecer</button>
      <button class="btn" id="mini">Minificar</button>
      <button class="btn" id="val">Validar</button>
    </div>
    <textarea id="o" class="textarea" style="margin-top:14px;min-height:160px"></textarea>
    <div id="status" style="margin-top:8px"></div>
    <button class="copy-btn" id="copyBtn" style="margin-top:10px">Copiar</button>`;
  const parse = () => { try{ return JSON.parse($('#i').value) }catch(e){ $('#status').innerHTML=`<span class="badge" style="background:#ef444420;color:#ef4444">❌ ${e.message}</span>`; return null } };
  $('#pretty').onclick = () => { const o=parse(); if(o!==null){ $('#o').value = JSON.stringify(o,null,2); $('#status').innerHTML='<span class="badge" style="background:#10b98120;color:#10b981">✓ JSON válido</span>' } };
  $('#mini').onclick = () => { const o=parse(); if(o!==null){ $('#o').value = JSON.stringify(o); $('#status').innerHTML='<span class="badge" style="background:#10b98120;color:#10b981">✓ Minificado</span>' } };
  $('#val').onclick = () => { const o=parse(); if(o!==null) $('#status').innerHTML='<span class="badge" style="background:#10b98120;color:#10b981">✓ JSON válido</span>' };
  bindCopyText(() => $('#o').value); $('#pretty').click();
};

// ============ COLOR ============
BUILDERS.colorconv = body => {
  body.innerHTML = `
    ${row('Color','<input type="color" id="c" value="#6366f1">')}
    <div class="result-grid" id="out" style="margin-top:16px"></div>`;
  const calc = () => {
    const h = $('#c').value;
    const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16);
    const rN=r/255, gN=g/255, bN=b/255;
    const mx=Math.max(rN,gN,bN), mn=Math.min(rN,gN,bN);
    let H=0,S=0,L=(mx+mn)/2;
    if(mx!==mn){ const d=mx-mn; S=L>.5?d/(2-mx-mn):d/(mx+mn); if(mx===rN)H=(gN-bN)/d+(gN<bN?6:0); else if(mx===gN)H=(bN-rN)/d+2; else H=(rN-gN)/d+4; H*=60 }
    const formats = [
      ['HEX', h.toUpperCase()],
      ['RGB', `rgb(${r}, ${g}, ${b})`],
      ['HSL', `hsl(${Math.round(H)}, ${Math.round(S*100)}%, ${Math.round(L*100)}%)`],
      ['HSV', (() => { const v=mx; const sv=mx===0?0:(mx-mn)/mx; return `hsv(${Math.round(H)}, ${Math.round(sv*100)}%, ${Math.round(v*100)}%)` })()],
      ['CMYK', (() => { const k=1-mx; const c=k===1?0:(1-rN-k)/(1-k); const mC=k===1?0:(1-gN-k)/(1-k); const y=k===1?0:(1-bN-k)/(1-k); return `cmyk(${Math.round(c*100)}%, ${Math.round(mC*100)}%, ${Math.round(y*100)}%, ${Math.round(k*100)}%)` })()],
    ];
    $('#out').innerHTML = formats.map(([n,v]) => `<div class="metric"><span class="metric-label">${n}</span><span class="metric-value" style="font-size:14px">${v}</span><button class="copy-mini" data-copy="${v}">Copiar</button></div>`).join('');
    $('#out').querySelectorAll('.copy-mini').forEach(bn => bn.onclick = () => { navigator.clipboard.writeText(bn.dataset.copy); bn.textContent='✓'; setTimeout(()=>bn.textContent='Copiar',1200) });
  };
  $('#c').addEventListener('input', calc); calc();
};

BUILDERS.colorpicker = body => {
  body.innerHTML = `
    <div class="picker-wrap">
      <input type="color" id="c" value="#6366f1" class="big-color">
      <div class="picker-preview" id="prev"></div>
    </div>
    <div class="result-grid" id="out" style="margin-top:16px"></div>`;
  const calc = () => {
    const h = $('#c').value;
    $('#prev').style.background = h;
    $('#out').innerHTML = `<div class="metric"><span class="metric-label">HEX</span><span class="metric-value">${h.toUpperCase()}</span></div>`;
  };
  $('#c').addEventListener('input', calc); calc();
};

// ============ RED ============
BUILDERS.myip = async body => {
  body.innerHTML = '<div class="empty">Detectando tu IP…</div>';
  try{
    const r = await fetch('https://ipapi.co/json/');
    const d = await r.json();
    body.innerHTML = `
      <div class="result-box"><div><div class="result-label">Tu IP pública</div><div class="result-value" id="resultText">${d.ip}</div></div><button class="copy-btn" id="copyBtn">Copiar</button></div>
      <div class="result-grid" style="margin-top:18px">
        <div class="metric"><span class="metric-label">País</span><span class="metric-value">${d.country_name} ${d.country_code? '('+d.country_code+')':''}</span></div>
        <div class="metric"><span class="metric-label">Ciudad</span><span class="metric-value">${d.city||'—'}</span></div>
        <div class="metric"><span class="metric-label">Región</span><span class="metric-value">${d.region||'—'}</span></div>
        <div class="metric"><span class="metric-label">ISP</span><span class="metric-value">${d.org||'—'}</span></div>
        <div class="metric"><span class="metric-label">Zona horaria</span><span class="metric-value">${d.timezone||'—'}</span></div>
        <div class="metric"><span class="metric-label">Coordenadas</span><span class="metric-value">${d.latitude}, ${d.longitude}</span></div>
      </div>`;
    bindCopyText(() => d.ip);
  }catch(e){
    body.innerHTML = '<div class="empty">No se pudo detectar la IP. Verifica tu conexión.</div>';
  }
};

BUILDERS.browserinfo = body => {
  const ua = navigator.userAgent;
  const items = [
    ['Navegador', detectBrowser(ua)],
    ['Sistema operativo', detectOS(ua)],
    ['Idioma', navigator.language],
    ['Pantalla', `${screen.width} × ${screen.height} px`],
    ['Ventana', `${window.innerWidth} × ${window.innerHeight} px`],
    ['Pixel ratio', `${window.devicePixelRatio}x`],
    ['Profundidad', `${screen.colorDepth} bits`],
    ['Cookies', navigator.cookieEnabled ? 'Habilitadas' : 'Bloqueadas'],
    ['Online', navigator.onLine ? 'Sí' : 'No'],
    ['CPU cores', navigator.hardwareConcurrency || '—'],
    ['RAM (aprox)', navigator.deviceMemory ? navigator.deviceMemory+' GB' : '—'],
    ['Touch', navigator.maxTouchPoints>0 ? 'Sí ('+navigator.maxTouchPoints+')' : 'No'],
  ];
  body.innerHTML = `
    <div class="result-grid">${items.map(([k,v])=>`<div class="metric"><span class="metric-label">${k}</span><span class="metric-value" style="font-size:14px">${v}</span></div>`).join('')}</div>
    <h3 style="margin:24px 0 8px;font-size:14px;color:var(--text-dim)">User Agent</h3>
    <code class="code-block">${ua}</code>`;
};
function detectBrowser(ua){
  if(/Edg\//.test(ua)) return 'Microsoft Edge';
  if(/Chrome\//.test(ua) && !/Edg/.test(ua)) return 'Chrome';
  if(/Firefox\//.test(ua)) return 'Firefox';
  if(/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if(/OPR\//.test(ua)) return 'Opera';
  return 'Desconocido';
}
function detectOS(ua){
  if(/Windows NT 10/.test(ua)) return 'Windows 10/11';
  if(/Windows/.test(ua)) return 'Windows';
  if(/Mac OS X/.test(ua)) return 'macOS';
  if(/Android/.test(ua)) return 'Android';
  if(/iPhone|iPad/.test(ua)) return 'iOS';
  if(/Linux/.test(ua)) return 'Linux';
  return 'Desconocido';
}

BUILDERS.speedtest = body => {
  body.innerHTML = `
    <p class="hint">Descarga un archivo de prueba para estimar tu velocidad de bajada.</p>
    <button class="btn btn-primary" id="run" style="margin-top:10px">▶ Iniciar test</button>
    <div class="result-box" style="margin-top:18px">
      <div><div class="result-label">Descarga</div><div class="result-value" id="resultText">— Mbps</div></div>
    </div>
    <div id="status" style="margin-top:12px;color:var(--text-dim);font-size:13px"></div>`;
  $('#run').onclick = async () => {
    const btn = $('#run'); btn.disabled = true; btn.textContent = 'Midiendo…';
    $('#status').textContent = 'Descargando archivo de prueba…';
    // Cloudflare ofrece archivos de speedtest sin CORS issues vía su endpoint
    const sizeMB = 10;
    const url = `https://speed.cloudflare.com/__down?bytes=${sizeMB*1024*1024}&t=${Date.now()}`;
    try{
      const t0 = performance.now();
      const r = await fetch(url, { cache:'no-store' });
      const reader = r.body.getReader();
      let received = 0;
      while(true){
        const {done,value} = await reader.read();
        if(done) break;
        received += value.length;
        const sec = (performance.now()-t0)/1000;
        const mbps = (received*8)/(sec*1e6);
        $('#resultText').textContent = `${mbps.toFixed(2)} Mbps`;
        $('#status').textContent = `Descargados ${(received/1048576).toFixed(1)} MB en ${sec.toFixed(1)}s`;
      }
      const total = (performance.now()-t0)/1000;
      const final = (received*8)/(total*1e6);
      $('#resultText').textContent = `${final.toFixed(2)} Mbps`;
      $('#status').textContent = `✓ Test completado · ${(received/1048576).toFixed(1)} MB en ${total.toFixed(2)}s`;
    }catch(e){
      $('#status').textContent = '❌ Error en el test';
    }
    btn.disabled = false; btn.textContent = '▶ Repetir test';
  };
};

// ============ HARDWARE ============
BUILDERS.monitorhz = body => {
  body.innerHTML = `
    <p class="hint">Mide la tasa de refresco real del monitor (FPS de tu pantalla).</p>
    <button class="btn btn-primary" id="run" style="margin-top:10px">▶ Medir durante 3 segundos</button>
    <div class="result-box" style="margin-top:18px"><div><div class="result-label">Refresh rate</div><div class="result-value" id="resultText">— Hz</div></div></div>
    <div id="hint" style="margin-top:10px;font-size:13px;color:var(--text-dim)"></div>`;
  $('#run').onclick = () => {
    const btn = $('#run'); btn.disabled = true; btn.textContent = 'Midiendo…';
    let count = 0, t0 = 0;
    const tick = ts => {
      if(!t0) t0 = ts;
      count++;
      if(ts - t0 < 3000) requestAnimationFrame(tick);
      else {
        const hz = count / ((ts-t0)/1000);
        const closest = [60,75,90,120,144,165,170,180,200,240,360].reduce((a,b)=>Math.abs(b-hz)<Math.abs(a-hz)?b:a);
        $('#resultText').textContent = `${hz.toFixed(1)} Hz`;
        $('#hint').textContent = `Tu monitor es probablemente de ${closest} Hz`;
        btn.disabled = false; btn.textContent = '▶ Repetir';
      }
    };
    requestAnimationFrame(tick);
  };
};

BUILDERS.mousehz = body => {
  body.innerHTML = `
    <p class="hint">Mueve el ratón en círculos rápidamente sobre la zona azul durante unos segundos.</p>
    <div id="pad" class="mouse-pad">Mueve el ratón aquí</div>
    <div class="result-box" style="margin-top:18px">
      <div><div class="result-label">Polling rate (Hz)</div><div class="result-value" id="resultText">— Hz</div></div>
    </div>
    <div class="result-grid" id="extra" style="margin-top:14px"></div>`;
  const pad = $('#pad');
  const samples = [];
  let last = 0, max = 0;
  pad.addEventListener('mousemove', e => {
    const t = performance.now();
    if(last){
      const dt = t - last;
      if(dt > 0 && dt < 100){
        samples.push(dt);
        if(samples.length > 200) samples.shift();
        const avg = samples.reduce((a,b)=>a+b,0)/samples.length;
        const hz = 1000/avg;
        if(hz > max) max = hz;
        $('#resultText').textContent = `${Math.round(hz)} Hz`;
        $('#extra').innerHTML = `<div class="metric"><span class="metric-label">Máximo</span><span class="metric-value">${Math.round(max)} Hz</span></div><div class="metric"><span class="metric-label">Muestras</span><span class="metric-value">${samples.length}</span></div>`;
      }
    }
    last = t;
  });
};

BUILDERS.cps = body => {
  body.innerHTML = `
    <p class="hint">Haz clic lo más rápido posible durante 10 segundos.</p>
    <button class="btn-cps" id="pad">CLICK!</button>
    <div class="result-grid" id="stats" style="margin-top:16px"></div>`;
  let clicks = 0, t0 = 0, end = 0, running = false;
  const update = () => {
    const now = performance.now();
    const remaining = Math.max(0, (end-now)/1000);
    $('#stats').innerHTML = `
      <div class="metric"><span class="metric-label">Clicks</span><span class="metric-value">${clicks}</span></div>
      <div class="metric"><span class="metric-label">CPS</span><span class="metric-value">${(clicks/Math.max(0.01,(now-t0)/1000)).toFixed(2)}</span></div>
      <div class="metric"><span class="metric-label">Tiempo</span><span class="metric-value">${remaining.toFixed(1)}s</span></div>`;
    if(running && now < end) requestAnimationFrame(update);
    else if(running){ running = false; $('#pad').textContent = '🔁 Reintentar'; toast(`¡${(clicks/10).toFixed(2)} CPS!`) }
  };
  $('#pad').onclick = () => {
    if(!running){ clicks = 0; t0 = performance.now(); end = t0+10000; running = true; $('#pad').textContent='CLICK!'; update() }
    else clicks++;
  };
};

BUILDERS.reaction = body => {
  body.innerHTML = `
    <p class="hint">Cuando la zona se ponga verde, haz clic lo más rápido posible.</p>
    <div id="pad" class="reaction-pad waiting">Haz clic para empezar</div>
    <div class="result-grid" id="stats" style="margin-top:14px"></div>`;
  const pad = $('#pad');
  let state = 'idle', t0 = 0, timer, times = [];
  pad.onclick = () => {
    if(state === 'idle' || state === 'done'){
      state = 'waiting'; pad.className = 'reaction-pad red'; pad.textContent = 'Espera al verde…';
      timer = setTimeout(() => { state='ready'; pad.className='reaction-pad green'; pad.textContent='¡CLICK YA!'; t0 = performance.now() }, 1500+Math.random()*3000);
    } else if(state === 'waiting'){
      clearTimeout(timer); state = 'done'; pad.className='reaction-pad waiting'; pad.textContent='⚠ Demasiado pronto. Click para reintentar';
    } else if(state === 'ready'){
      const ms = performance.now()-t0; times.push(ms); state='done';
      pad.className='reaction-pad waiting'; pad.textContent = `${Math.round(ms)} ms · Click para reintentar`;
      const avg = times.reduce((a,b)=>a+b,0)/times.length, best = Math.min(...times);
      $('#stats').innerHTML = `
        <div class="metric"><span class="metric-label">Último</span><span class="metric-value">${Math.round(ms)} ms</span></div>
        <div class="metric"><span class="metric-label">Mejor</span><span class="metric-value">${Math.round(best)} ms</span></div>
        <div class="metric"><span class="metric-label">Media</span><span class="metric-value">${Math.round(avg)} ms</span></div>
        <div class="metric"><span class="metric-label">Intentos</span><span class="metric-value">${times.length}</span></div>`;
    }
  };
};

BUILDERS.dpi = body => {
  body.innerHTML = `
    <p class="hint">Convierte sensibilidad entre dos DPIs manteniendo el mismo eDPI.</p>
    ${grid(
      row('DPI actual','<input type="number" id="d1" value="800">') +
      row('Sensibilidad actual (juego)','<input type="number" id="s1" value="1.2" step="0.01">') +
      row('DPI nuevo','<input type="number" id="d2" value="1600">'),
    3)}
    ${resultBox()}
    <div class="result-grid" id="extra"></div>`;
  const calc = () => {
    const d1=+$('#d1').value, s1=+$('#s1').value, d2=+$('#d2').value;
    if(!d1||!d2) return;
    const eDPI = d1*s1;
    const s2 = eDPI/d2;
    $('#resultText').textContent = `Nueva sensibilidad: ${s2.toFixed(4)}`;
    $('#extra').innerHTML = `
      <div class="metric"><span class="metric-label">eDPI (constante)</span><span class="metric-value">${eDPI.toFixed(0)}</span></div>
      <div class="metric"><span class="metric-label">cm/360° aprox</span><span class="metric-value">${(2.54*360/(eDPI*0.022)).toFixed(1)} cm</span></div>`;
  };
  ['d1','s1','d2'].forEach(id => $('#'+id).addEventListener('input', calc));
  bindCopyText(() => $('#resultText').textContent); calc();
};

// ============ TIEMPO ============
BUILDERS.stopwatch = body => {
  body.innerHTML = `
    <div class="big-time" id="t">00:00.00</div>
    <div class="btn-group" style="margin-top:18px">
      <button class="btn btn-primary" id="go">▶ Iniciar</button>
      <button class="btn" id="lap">Vuelta</button>
      <button class="btn" id="reset">Reset</button>
    </div>
    <div id="laps" class="laps"></div>`;
  let t0=0, elapsed=0, raf=0, running=false, laps=[];
  const fmt = ms => { const m=Math.floor(ms/60000), s=Math.floor(ms/1000)%60, c=Math.floor(ms/10)%100; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(c).padStart(2,'0')}` };
  const tick = () => { const now = performance.now(); $('#t').textContent = fmt(elapsed + (now-t0)); raf = requestAnimationFrame(tick) };
  $('#go').onclick = () => {
    if(!running){ running=true; t0=performance.now(); $('#go').textContent='⏸ Pausar'; tick() }
    else { running=false; elapsed += performance.now()-t0; cancelAnimationFrame(raf); $('#go').textContent='▶ Continuar' }
  };
  $('#lap').onclick = () => { if(running){ laps.push(elapsed + (performance.now()-t0)); $('#laps').innerHTML = laps.map((l,i)=>`<div class="lap-row"><span>Vuelta ${i+1}</span><span>${fmt(l)}</span></div>`).reverse().join('') } };
  $('#reset').onclick = () => { running=false; cancelAnimationFrame(raf); elapsed=0; laps=[]; $('#t').textContent='00:00.00'; $('#laps').innerHTML=''; $('#go').textContent='▶ Iniciar' };
};

BUILDERS.timer = body => {
  body.innerHTML = `
    ${grid(row('Minutos','<input type="number" id="mm" value="5" min="0">') + row('Segundos','<input type="number" id="ss" value="0" min="0" max="59">'),2)}
    <div class="big-time" id="t" style="margin-top:16px">05:00</div>
    <div class="btn-group">
      <button class="btn btn-primary" id="go">▶ Iniciar</button>
      <button class="btn" id="reset">Reset</button>
    </div>`;
  let remaining=0, raf=0, running=false, endAt=0;
  const fmt = s => { const m=Math.floor(s/60), x=Math.floor(s%60); return `${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}` };
  const tick = () => {
    const left = Math.max(0,(endAt-performance.now())/1000);
    $('#t').textContent = fmt(left);
    if(left>0) raf = requestAnimationFrame(tick);
    else { running=false; toast('⏰ ¡Tiempo!'); try{ new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play() }catch{} }
  };
  $('#go').onclick = () => {
    if(running) return;
    const total = (+$('#mm').value)*60 + (+$('#ss').value);
    if(total<=0) return;
    endAt = performance.now() + total*1000; running=true; tick();
  };
  $('#reset').onclick = () => { cancelAnimationFrame(raf); running=false; $('#t').textContent = fmt((+$('#mm').value)*60+(+$('#ss').value)) };
  const sync = () => $('#t').textContent = fmt((+$('#mm').value)*60+(+$('#ss').value));
  ['mm','ss'].forEach(id => $('#'+id).addEventListener('input', sync));
};

BUILDERS.worldclock = body => {
  const cities = [
    ['Madrid','Europe/Madrid'],['Londres','Europe/London'],['Nueva York','America/New_York'],
    ['Los Ángeles','America/Los_Angeles'],['Buenos Aires','America/Argentina/Buenos_Aires'],
    ['Ciudad de México','America/Mexico_City'],['Tokio','Asia/Tokyo'],['Pekín','Asia/Shanghai'],
    ['Sídney','Australia/Sydney'],['Dubái','Asia/Dubai'],
  ];
  body.innerHTML = `<div class="clock-grid" id="cg"></div>`;
  const upd = () => {
    $('#cg').innerHTML = cities.map(([n,tz]) => {
      const d = new Date().toLocaleString('es-ES',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
      const date = new Date().toLocaleString('es-ES',{timeZone:tz,day:'2-digit',month:'short'});
      return `<div class="clock-card"><div class="clock-city">${n}</div><div class="clock-time">${d}</div><div class="clock-date">${date}</div></div>`;
    }).join('');
  };
  upd(); setInterval(upd, 1000);
};

BUILDERS.pomodoro = body => {
  body.innerHTML = `
    <div class="pom-tabs">
      <button class="pom-tab active" data-min="25">Trabajo · 25</button>
      <button class="pom-tab" data-min="5">Descanso · 5</button>
      <button class="pom-tab" data-min="15">Largo · 15</button>
    </div>
    <div class="big-time" id="t">25:00</div>
    <div class="btn-group">
      <button class="btn btn-primary" id="go">▶ Iniciar</button>
      <button class="btn" id="reset">Reset</button>
    </div>`;
  let mins=25, raf=0, running=false, endAt=0;
  const fmt = s => { const m=Math.floor(s/60), x=Math.floor(s%60); return `${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}` };
  const tick = () => {
    const left = Math.max(0,(endAt-performance.now())/1000);
    $('#t').textContent = fmt(left);
    if(left>0) raf = requestAnimationFrame(tick);
    else { running=false; toast('🍅 ¡Sesión completada!') }
  };
  body.querySelectorAll('.pom-tab').forEach(b => b.onclick = () => {
    body.querySelectorAll('.pom-tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); mins = +b.dataset.min; $('#t').textContent = `${String(mins).padStart(2,'0')}:00`;
    running=false; cancelAnimationFrame(raf); $('#go').textContent='▶ Iniciar';
  });
  $('#go').onclick = () => { if(running) return; endAt = performance.now()+mins*60*1000; running=true; tick(); $('#go').textContent='Corriendo…' };
  $('#reset').onclick = () => { cancelAnimationFrame(raf); running=false; $('#t').textContent=`${String(mins).padStart(2,'0')}:00`; $('#go').textContent='▶ Iniciar' };
};

// ============ UTILIDADES ============
const $ = sel => document.querySelector(sel);
function fmtEUR(n){ return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n) }
function bindCopyText(getter){
  const btn = $('#copyBtn'); if(!btn) return;
  btn.onclick = () => {
    navigator.clipboard.writeText(getter()).then(() => {
      btn.classList.add('copied'); const prev = btn.textContent; btn.textContent='✓ Copiado';
      setTimeout(() => { btn.classList.remove('copied'); btn.textContent = prev }, 1500);
    });
  };
}
