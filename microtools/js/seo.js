// SEO: actualiza meta tags y JSON-LD según la ruta actual.
const SEO = {
  setHome(){
    this._apply({
      title: SITE.defaultTitle,
      desc: SITE.defaultDesc,
      url: SITE.url + '/',
      type: 'website',
    });
    document.getElementById('ldTool').textContent = '';
  },

  setTool(tool){
    const [slug, title, desc] = TOOL_SEO[tool.id] || [tool.id, tool.name, tool.desc];
    const fullTitle = `${title} | ${SITE.name}`;
    const url = `${SITE.url}/h/${slug}`;
    this._apply({ title: fullTitle, desc, url, type: 'article' });

    // JSON-LD por herramienta — la marca como SoftwareApplication / WebApplication
    const ld = {
      "@context":"https://schema.org",
      "@type":"WebApplication",
      "name": title,
      "url": url,
      "description": desc,
      "applicationCategory": this._catName(tool.cat),
      "operatingSystem": "Any (web)",
      "browserRequirements":"Requires JavaScript",
      "offers":{
        "@type":"Offer",
        "price": tool.premium ? "3.00" : "0",
        "priceCurrency":"EUR"
      },
      "isAccessibleForFree": !tool.premium,
      "inLanguage":"es",
      "publisher":{ "@type":"Organization", "name": SITE.name, "url": SITE.url }
    };
    document.getElementById('ldTool').textContent = JSON.stringify(ld);
  },

  _apply({title, desc, url, type}){
    document.title = title;
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('metaDesc').setAttribute('content', desc);
    document.getElementById('canonical').setAttribute('href', url);
    document.getElementById('ogTitle').setAttribute('content', title);
    document.getElementById('ogDesc').setAttribute('content', desc);
    document.getElementById('ogUrl').setAttribute('content', url);
    document.querySelector('meta[property="og:type"]').setAttribute('content', type);
    document.getElementById('twTitle').setAttribute('content', title);
    document.getElementById('twDesc').setAttribute('content', desc);
  },

  _catName(c){
    return ({
      converters:'UtilityApplication',
      calculators:'FinanceApplication',
      generators:'UtilityApplication',
      text:'UtilityApplication',
      color:'DesignApplication',
      network:'NetworkingApplication',
      hardware:'UtilityApplication',
      time:'UtilityApplication',
      files:'BusinessApplication',
    })[c] || 'UtilityApplication';
  }
};

// Router con History API. Rutas:
//   /                → home
//   /h/<slug>        → tool
//   /c/<category>    → home con categoría filtrada
const Router = {
  init(onTool, onHome, onCategory){
    this.onTool = onTool; this.onHome = onHome; this.onCategory = onCategory;
    window.addEventListener('popstate', () => this.resolve());
    this.resolve();
  },

  resolve(){
    const path = location.pathname;
    const m1 = path.match(/^\/h\/([\w-]+)\/?$/);
    if(m1){
      const id = SLUG_TO_ID[m1[1]];
      if(id){
        const tool = TOOLS.find(t => t.id === id);
        if(tool){ this.onTool(tool, true); return }
      }
    }
    const m2 = path.match(/^\/c\/([\w-]+)\/?$/);
    if(m2 && CATEGORIES[m2[1]]){ this.onCategory(m2[1]); return }
    this.onHome();
  },

  goTool(tool){
    const slug = TOOL_SEO[tool.id]?.[0] || tool.id;
    history.pushState({}, '', `/h/${slug}`);
    this.onTool(tool, false);
  },
  goHome(){
    history.pushState({}, '', '/');
    this.onHome();
  },
  goCategory(cat){
    history.pushState({}, '', cat === 'all' ? '/' : `/c/${cat}`);
    this.onCategory(cat);
  }
};
