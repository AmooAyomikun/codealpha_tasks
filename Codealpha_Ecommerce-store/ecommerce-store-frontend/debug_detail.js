const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function run() {
  const html = fs.readFileSync('c:/Users/user/Documents/Internships/codealpha_tasks/Codealpha_Ecommerce-store/ecommerce-store-frontend/templates/product_detail.html', 'utf8');
  
  const dom = new JSDOM(html, {
    url: "http://127.0.0.1:3000/Codealpha_Ecommerce-store/ecommerce-store-frontend/templates/product_detail.html?id=5",
    runScripts: "dangerously",
    resources: "usable"
  });

  // Mock fetch
  dom.window.fetch = async (url) => {
    if (url === 'http://127.0.0.1:8000/api/products/5/') {
      return { ok: true, json: async () => JSON.parse(fs.readFileSync('prod5.json', 'utf8')) };
    }
    if (url === 'http://127.0.0.1:8000/api/products/') {
      return { ok: true, json: async () => JSON.parse(fs.readFileSync('allprods.json', 'utf8')) };
    }
    if (url.includes('/api/reviews/')) {
        return { ok: true, json: async () => [] };
    }
    return { ok: false };
  };

  dom.window.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };

  dom.window.formatNaira = (n) => "N" + n;
  dom.window.lucide = { createIcons: () => {} };

  dom.window.console.error = (msg, err) => {
    console.log("JSDOM ERROR:", msg, err);
  };

  // wait a bit for scripts to execute
  setTimeout(() => {
    console.log("Body innerHTML length:", dom.window.document.body.innerHTML.length);
    console.log("Loading text display:", dom.window.document.getElementById('pdp-loading').style.display);
  }, 2000);
}

run();
