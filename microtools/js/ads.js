// ============================================================
// SISTEMA DE ANUNCIOS
// ============================================================
// Por defecto muestra un placeholder ("Anuncio").
// Cuando AdSense te apruebe:
//   1. En index.html, descomenta el <script> de adsbygoogle.
//   2. Aquí abajo, pon ADSENSE_ENABLED = true y rellena tu
//      AD_CLIENT y los AD_SLOTS con los IDs que te genere AdSense
//      al crear los bloques de anuncios en su panel.
// ============================================================

const ADSENSE_ENABLED = false;
const AD_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
const AD_SLOTS = {
  grid: 'XXXXXXXXXX',    // bloque "horizontal" para el grid de tools
  tool: 'XXXXXXXXXX',    // bloque al pie de cada herramienta
};

function adSlot(kind = 'grid'){
  if(ADSENSE_ENABLED){
    return `<div class="ad-slot">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${AD_CLIENT}"
           data-ad-slot="${AD_SLOTS[kind] || AD_SLOTS.grid}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>`;
  }
  // Placeholder mientras esperas la aprobación de AdSense
  return `<div class="ad-slot">
    <div class="ad-inner">
      <span class="ad-label">Espacio publicitario</span>
      <span class="ad-cta">Aquí irá un anuncio cuando AdSense apruebe la web</span>
    </div>
  </div>`;
}

// Llama esto después de inyectar un anuncio en el DOM (solo si AdSense activo)
function refreshAds(){
  if(!ADSENSE_ENABLED) return;
  try{
    document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])').forEach(() => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }catch(e){ /* AdSense aún no cargado */ }
}

// Toast (lo usaba premium.js; lo mantengo porque algunas tools lo llaman)
function toast(msg){
  let t = document.getElementById('toast');
  if(t) t.remove();
  t = document.createElement('div');
  t.id = 'toast'; t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300) }, 2400);
}
