// Genera sitemap.xml a partir de TOOL_SEO.
// Uso: node generate-sitemap.js
const fs = require('fs');
const path = require('path');

// Cargamos tools-data.js como texto y extraemos los slugs sin ejecutar el archivo entero.
const src = fs.readFileSync(path.join(__dirname,'js','tools-data.js'),'utf8');

// Sacamos SITE.url
const urlMatch = src.match(/url:\s*'([^']+)'/);
const BASE = urlMatch ? urlMatch[1] : 'https://toolhub.example';

// Sacamos slugs: cada entrada [slug, ...]
const slugs = Array.from(src.matchAll(/'([\w-]+)',\s*'[^']+',\s*'[^']+'\]/g)).map(m => m[1]);

const today = new Date().toISOString().slice(0,10);

const urls = [
  { loc: `${BASE}/`,  priority: '1.0', changefreq:'weekly' },
  { loc: `${BASE}/blog/`, priority: '0.9', changefreq:'weekly' },
  // Páginas estáticas legales y de blog
  { loc: `${BASE}/legal/aviso-legal.html`, priority:'0.4', changefreq:'yearly' },
  { loc: `${BASE}/legal/terminos.html`,    priority:'0.4', changefreq:'yearly' },
  { loc: `${BASE}/blog/calcular-hipoteca-paso-a-paso.html`, priority:'0.7', changefreq:'monthly' },
  { loc: `${BASE}/blog/que-es-imc-como-calcular.html`,      priority:'0.7', changefreq:'monthly' },
  ...Object.keys({converters:1,calculators:1,generators:1,text:1,color:1,network:1,hardware:1,time:1,files:1})
      .map(c => ({ loc:`${BASE}/c/${c}`, priority:'0.7', changefreq:'monthly' })),
  ...slugs.map(s => ({ loc: `${BASE}/h/${s}`, priority:'0.8', changefreq:'monthly' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(__dirname,'sitemap.xml'), xml);
console.log(`✓ sitemap.xml generado con ${urls.length} URLs`);
