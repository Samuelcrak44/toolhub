# 🚀 Guía para publicar ToolHub en Cloudflare Pages (0€)

## Resultado final
Tu web estará online en `https://TUNOMBRE.pages.dev` con HTTPS, CDN global y tráfico ilimitado, **gratis para siempre**.

---

## Paso 1 — Crear cuenta en GitHub (si no tienes) — 2 min

1. Ve a https://github.com → **Sign up**
2. Crea un repositorio nuevo:
   - Click **+** arriba a la derecha → **New repository**
   - **Repository name**: `toolhub` (o el que quieras)
   - Marca **Public**
   - Click **Create repository**

---

## Paso 2 — Subir tu código a GitHub — 3 min

### Opción A: arrastrar y soltar (más fácil)

1. En la página de tu repo recién creado, click en *"uploading an existing file"*
2. Abre la carpeta `C:\Users\samue\microtools` en el explorador de Windows
3. Selecciona **TODOS los archivos y carpetas** (Ctrl+A) y arrástralos al navegador
4. Espera a que se suban (verás barras de progreso)
5. Abajo escribe un mensaje: "Primer deploy"
6. Click **Commit changes**

### Opción B: con Git desde terminal

```bash
cd C:\Users\samue\microtools
git init
git add .
git commit -m "Primer deploy"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/toolhub.git
git push -u origin main
```

---

## Paso 3 — Crear cuenta en Cloudflare — 2 min

1. Ve a https://dash.cloudflare.com/sign-up
2. Email + contraseña
3. Confirma el email

---

## Paso 4 — Desplegar — 3 min

1. En el dashboard de Cloudflare, menú izquierdo → **Workers & Pages**
2. **Create** → pestaña **Pages** → **Connect to Git**
3. Autoriza Cloudflare en GitHub
4. Selecciona tu repo `toolhub`
5. Configura:
   - **Project name**: `toolhub` (será tu URL: `toolhub.pages.dev`)
   - **Production branch**: `main`
   - **Framework preset**: None
   - **Build command**: déjalo vacío
   - **Build output directory**: `/`
6. Click **Save and Deploy**
7. Espera ~1–2 minutos hasta que aparezca *"Success! Your project is live"*
8. Click en la URL `https://toolhub.pages.dev` → 🎉 **TU WEB ESTÁ ONLINE**

---

## Paso 5 — Antes de monetizar, cambia 2 cosas

### Cambia la URL del sitio en tu código

Edita `js/tools-data.js`, busca:
```js
const SITE = {
  url: 'https://toolhub.example',  // ← cámbialo
```

Pon ahí tu URL real (ejemplo: `https://toolhub.pages.dev`).

### Edita también `robots.txt`:
```
Sitemap: https://toolhub.pages.dev/sitemap.xml
```

### Regenera el sitemap:
```bash
node generate-sitemap.js
```

Sube los cambios a GitHub (drag & drop sobre los archivos que cambiaste, o `git push`). Cloudflare redesplegará automáticamente en ~30 segundos.

---

## Paso 6 — Google Search Console (indexar en Google) — 5 min

1. Ve a https://search.google.com/search-console
2. Login con tu cuenta de Google
3. **Add property** → "URL prefix" → pega tu URL completa (`https://toolhub.pages.dev`)
4. Te pedirá verificar la propiedad. La forma más fácil:
   - Elige **HTML tag**
   - Te dará un `<meta name="google-site-verification" content="...">`
   - Pégalo en `index.html` dentro de `<head>`
   - Sube el cambio a GitHub
   - Espera 1 minuto y click **Verify** en Search Console
5. Una vez verificado, menú izquierdo → **Sitemaps** → escribe `sitemap.xml` → **Submit**
6. ✅ Google empezará a indexar tus 67 páginas en 1–4 semanas

---

## Paso 7 — Solicitar Google AdSense — 5 min

1. Ve a https://adsense.google.com → **Empezar**
2. Pon tu URL: `https://toolhub.pages.dev`
3. Acepta los términos
4. AdSense te dará un código `<script async src="...?client=ca-pub-XXXXX">`
5. En `index.html`, **descomenta** el bloque de AdSense que ya tienes preparado y **reemplaza** `ca-pub-XXXXXXXXXXXXXXXX` por tu ID real
6. Sube cambios a GitHub
7. En el panel de AdSense, click **Solicitar revisión**

### Espera ⏳

AdSense suele tardar **1–4 semanas** en aprobarte. Pueden rechazarte por:
- **Contenido escaso**: te recomiendo añadir 2–3 artículos de blog explicando algunas tools antes de pedir aprobación
- **Falta de páginas legales**: necesitas tener "Aviso legal", "Política de privacidad" y "Política de cookies" enlazadas desde el footer. Genéralas gratis en https://termly.io o https://iubenda.com

### Cuando te aprueben:

1. En el panel de AdSense → **Anuncios** → **Por unidad de anuncio** → **Crear unidad**
2. Crea dos bloques:
   - Uno tipo *"Responsive display"* → llámalo "Grid"
   - Otro igual → llámalo "Tool"
3. Cada uno te dará un **slot ID** (10 dígitos)
4. Edita `js/ads.js`:
   ```js
   const ADSENSE_ENABLED = true;
   const AD_CLIENT = 'ca-pub-TUNUMERO';
   const AD_SLOTS = {
     grid: '1234567890',
     tool: '9876543210',
   };
   ```
5. Sube el cambio → **YA ESTÁS GANANDO DINERO** 💰

---

## Paso 8 — Promocionar para conseguir tráfico

Sin visitantes no hay dinero. Cosas que funcionan:

- **Comparte en Reddit** (subreddits relevantes: `r/argentina`, `r/españa`, `r/webdev` con su web)
- **Twitter/X** con hashtags como `#herramientas` `#productividad`
- **Hacker News** (en `news.ycombinator.com`, postea como "Show HN")
- **Product Hunt** (lanza el día que esté pulido)
- **Foros temáticos** donde la gente busque conversores/calculadoras

**Cuánto puedes ganar (realista):**
- 1.000 visitas/mes ≈ 1–3€
- 10.000 visitas/mes ≈ 10–30€
- 100.000 visitas/mes ≈ 100–300€
- 1.000.000 visitas/mes ≈ 1.000–3.000€

El crecimiento es lento al principio pero exponencial si las tools son útiles y posicionas bien.

---

## Cuando quieras dominio propio (9€/año)

Comprar dominio te da:
- ✅ URL más profesional (`toolhub.com` vs `toolhub.pages.dev`)
- ✅ Mejor SEO (Google posiciona mejor dominios propios)
- ✅ Algunos anunciantes prefieren dominios propios

### Pasos:
1. Compra en https://www.cloudflare.com/products/registrar/ (precio sin markup, ~9€/año .com)
2. En Cloudflare Pages → tu proyecto → **Custom domains** → **Set up a custom domain** → escribe tu dominio
3. Cloudflare lo configura automáticamente
4. Actualiza `SITE.url` en `tools-data.js` y `robots.txt`, regenera sitemap, sube cambios
5. En Google Search Console añade la nueva propiedad y vuelve a enviar sitemap

---

## 🆘 Si algo falla

- **Las URLs `/h/conversor-longitud` dan 404**: verifica que el archivo `_redirects` está en la raíz del repo. Sin él, Cloudflare no sabe rutear las URLs SPA.
- **No veo los anuncios**: si pusiste `ADSENSE_ENABLED = true` antes de que te aprueben, no aparecerán. Espera la aprobación.
- **AdSense me rechaza**: añade más contenido (blog), añade páginas legales, espera 2 semanas y vuelve a solicitar.
