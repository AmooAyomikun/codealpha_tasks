/**
 * Nexara Search Engine & Overlay (Upgraded with Baymard UX best practices)
 * Features:
 * - Instant live autocomplete suggestions appearing as you type
 * - Fuzzy matching & typo tolerance (Levenshtein distance) for minor misspellings ("iphon" -> iPhone)
 * - Trending / Popular Search pills and Quick Category jumps when input is empty
 * - Search history tracking in localStorage ('nexara_search_history')
 * - Keyboard navigation (up/down arrows, enter, escape)
 */

const SEARCH_HISTORY_KEY = 'nexara_search_history';

/**
 * Levenshtein distance between two strings
 */
function levenshteinDistance(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Compute typo-tolerant match score between a product and a query string
 * Returns: { score: number, isTypoMatch: boolean, matchedTerm: string }
 */
function computeProductMatch(product, query) {
  const q = query.toLowerCase().trim();
  if (!q) return { score: 0, isTypoMatch: false, matchedTerm: '' };

  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();

  // 1. Exact substring or prefix matches
  if (name.includes(q)) {
    return { score: 100 + (name.startsWith(q) ? 20 : 0), isTypoMatch: false, matchedTerm: product.name };
  }
  if (brand.includes(q)) {
    return { score: 90 + (brand === q ? 20 : 0), isTypoMatch: false, matchedTerm: product.brand };
  }
  if (category.includes(q)) {
    return { score: 85 + (category === q ? 15 : 0), isTypoMatch: false, matchedTerm: product.category };
  }
  if (slug.includes(q)) {
    return { score: 80, isTypoMatch: false, matchedTerm: product.name };
  }

  // If query is less than 3 chars, strict substring is sufficient
  if (q.length < 3) return { score: 0, isTypoMatch: false, matchedTerm: '' };

  // 2. Tokenized & Fuzzy matching (Levenshtein distance)
  const qTokens = q.split(/\s+/).filter(Boolean);
  const pTokens = `${name} ${brand} ${category}`.split(/\s+/).filter(Boolean);

  let totalTokenScore = 0;
  let allTokensMatched = true;
  let hasTypoMatch = false;
  let matchedWord = '';

  for (const qTok of qTokens) {
    let bestTokenScore = 0;
    for (const pTok of pTokens) {
      if (pTok.includes(qTok) || qTok.includes(pTok)) {
        bestTokenScore = Math.max(bestTokenScore, 70);
        if (!matchedWord) matchedWord = pTok;
        continue;
      }

      const dist = levenshteinDistance(qTok, pTok);
      const prefixDist = levenshteinDistance(qTok, pTok.slice(0, Math.max(qTok.length, 3)));
      const minDist = Math.min(dist, prefixDist);

      const maxDist = qTok.length <= 4 ? 1 : 2;
      if (minDist <= maxDist) {
        bestTokenScore = Math.max(bestTokenScore, 65 - minDist * 12);
        hasTypoMatch = true;
        if (!matchedWord) matchedWord = pTok;
      }
    }
    if (bestTokenScore === 0) {
      allTokensMatched = false;
    } else {
      totalTokenScore += bestTokenScore;
    }
  }

  if (allTokensMatched && totalTokenScore > 0) {
    return {
      score: (totalTokenScore / qTokens.length) + (hasTypoMatch ? 0 : 10),
      isTypoMatch: hasTypoMatch,
      matchedTerm: matchedWord ? matchedWord.charAt(0).toUpperCase() + matchedWord.slice(1) : product.name
    };
  }

  // 3. Overall brand/category Levenshtein (e.g. "samsng" or "laptp")
  const brandDist = levenshteinDistance(q, brand);
  if (brandDist <= (q.length <= 4 ? 1 : 2)) {
    return { score: 60 - brandDist * 5, isTypoMatch: true, matchedTerm: product.brand };
  }

  const catDist = levenshteinDistance(q, category);
  if (catDist <= (q.length <= 4 ? 1 : 2)) {
    return { score: 55 - catDist * 5, isTypoMatch: true, matchedTerm: product.category };
  }

  // 4. Description check
  if (desc.includes(q)) {
    return { score: 40, isTypoMatch: false, matchedTerm: product.name };
  }

  return { score: 0, isTypoMatch: false, matchedTerm: '' };
}

function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveSearchHistory(term) {
  if (!term || !term.trim()) return;
  const cleaned = term.trim();
  let history = getSearchHistory();
  history = history.filter(h => h.toLowerCase() !== cleaned.toLowerCase());
  history.unshift(cleaned);
  if (history.length > 6) history = history.slice(0, 6);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.querySelector('[aria-label="Search"]');
  if (!searchBtn) return;

  let overlay = null;
  let allProducts = [];

  async function loadProducts() {
    if (allProducts.length) return allProducts;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/products/');
      allProducts = await res.json();
    } catch (e) {
      allProducts = [];
    }
    return allProducts;
  }

  function buildOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'nexara-search-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(17,17,17,0.65); backdrop-filter: blur(4px);
      z-index: 1100; display: flex; align-items: flex-start; justify-content: center;
      padding: 50px 16px 20px;
    `;
    overlay.innerHTML = `
      <div style="background: var(--bg-secondary, #fff); width: 100%; max-width: 660px; border-radius: 16px; border: 1px solid var(--border-color, #E5E5E5); box-shadow: 0 25px 60px -12px rgba(0,0,0,0.35); overflow: hidden; display: flex; flex-direction: column; max-height: 85vh; animation: searchSlideDown 0.2s ease-out;">
        <!-- Search Header -->
        <div style="display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border-color, #F0F0F0); background: var(--bg-secondary, #fff);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-tertiary, #888); flex-shrink: 0;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input id="nexara-search-input" type="text" placeholder="Search products, brands, or categories (e.g. iPhone, Samsung, Earbuds)..." autocomplete="off"
            style="width: 100%; border: none; outline: none; font-size: 1.05rem; background: transparent; color: var(--text-primary, #111); font-family: inherit;">
          <button type="button" id="btn-clear-search-input" aria-label="Clear Input" style="display: none; background: var(--bg-tertiary, #f5f5f5); border: none; cursor: pointer; color: var(--text-tertiary, #888); padding: 5px; border-radius: 50%; display: none; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <span style="font-size: 0.72rem; background: var(--bg-tertiary, #f5f5f5); color: var(--text-tertiary, #888); padding: 4px 8px; border-radius: 6px; font-weight: 700; letter-spacing: 0.05em; border: 1px solid var(--border-color, #E5E5E5);">ESC</span>
        </div>

        <!-- Search Body Content -->
        <div id="nexara-search-body" style="padding: 20px; overflow-y: auto; flex: 1;">
          <!-- Populated via renderResults -->
        </div>
      </div>
    `;

    if (!document.getElementById('search-overlay-style')) {
      const style = document.createElement('style');
      style.id = 'search-overlay-style';
      style.innerHTML = `
        @keyframes searchSlideDown {
          from { opacity: 0; transform: translateY(-16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .search-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--bg-tertiary, #f5f5f5); border: 1px solid var(--border-color, #E5E5E5);
          color: var(--text-primary, #111); padding: 6px 14px; border-radius: 999px;
          font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.15s ease;
          text-decoration: none;
        }
        .search-pill:hover {
          background: var(--accent-color, #f97316); color: #fff; border-color: var(--accent-color, #f97316);
        }
        .search-result-row {
          display: flex; align-items: center; justify-content: space-between; gap: 14px;
          padding: 12px 10px; border-radius: 10px; text-decoration: none; color: inherit;
          transition: background 0.15s ease; border-bottom: 1px solid var(--border-color, #F0F0F0);
        }
        .search-result-row:hover {
          background: var(--bg-tertiary, #f5f5f5);
        }
      `;
      document.head.appendChild(style);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#nexara-search-input');
    const clearBtn = overlay.querySelector('#btn-clear-search-input');

    input.addEventListener('input', () => {
      clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
      renderResults(input.value);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      renderResults('');
      input.focus();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        saveSearchHistory(input.value.trim());
        window.location.href = `product_list.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });

    renderResults('');
    input.focus();
    if (window.lucide) lucide.createIcons();
  }

  function renderResults(query) {
    if (!overlay) return;
    const bodyEl = overlay.querySelector('#nexara-search-body');
    const q = query.trim();

    // CASE 1: Empty Input (Show Trending, Categories & History)
    if (!q) {
      const history = getSearchHistory();
      const historyHtml = history.length ? `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary, #888);">Recent Searches</span>
            <button type="button" id="btn-clear-history-trigger" style="background: none; border: none; font-size: 0.78rem; color: var(--text-tertiary, #888); cursor: pointer; text-decoration: underline;">Clear</button>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${history.map(h => `<button type="button" class="search-pill history-pill" data-query="${h}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg> ${h}</button>`).join('')}
          </div>
        </div>
      ` : '';

      bodyEl.innerHTML = `
        ${historyHtml}
        <div style="margin-bottom: 24px;">
          <span style="display: block; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary, #888); margin-bottom: 10px;">Popular Searches</span>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button type="button" class="search-pill popular-pill" data-query="iPhone 15 Pro">iPhone 15 Pro</button>
            <button type="button" class="search-pill popular-pill" data-query="Samsung S24 Ultra">Samsung S24 Ultra</button>
            <button type="button" class="search-pill popular-pill" data-query="MacBook Air M3">MacBook Air M3</button>
            <button type="button" class="search-pill popular-pill" data-query="Earbuds">Wireless Earbuds</button>
            <button type="button" class="search-pill popular-pill" data-query="Oura Ring">Oura Ring</button>
            <button type="button" class="search-pill popular-pill" data-query="Gaming">Gaming</button>
          </div>
        </div>
        <div>
          <span style="display: block; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary, #888); margin-bottom: 10px;">Quick Categories</span>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <a href="product_list.html?category=phones" class="search-pill">Phones</a>
            <a href="product_list.html?category=laptops" class="search-pill">Laptops</a>
            <a href="product_list.html?category=audio" class="search-pill">Audio</a>
            <a href="product_list.html?category=wearables" class="search-pill">Wearables</a>
            <a href="product_list.html?category=tvs" class="search-pill">TVs</a>
            <a href="product_list.html?category=gaming" class="search-pill">Gaming</a>
            <a href="product_list.html?category=accessories" class="search-pill">Accessories</a>
          </div>
        </div>
      `;

      // Wire up pill clicks
      bodyEl.querySelectorAll('.history-pill, .popular-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const queryText = btn.getAttribute('data-query');
          const input = overlay.querySelector('#nexara-search-input');
          if (input) {
            input.value = queryText;
            overlay.querySelector('#btn-clear-search-input').style.display = 'flex';
            renderResults(queryText);
          }
        });
      });

      const clearHistBtn = bodyEl.querySelector('#btn-clear-history-trigger');
      if (clearHistBtn) {
        clearHistBtn.addEventListener('click', () => {
          clearSearchHistory();
          renderResults('');
        });
      }
      return;
    }

    // CASE 2: Active Query with Fuzzy & Typo Tolerance
    const evaluated = allProducts.map(p => {
      const match = computeProductMatch(p, q);
      return { product: p, ...match };
    }).filter(item => item.score > 0);

    // Sort by highest match score, then by review count
    evaluated.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 5) return b.score - a.score;
      return (b.product.review_count || 0) - (a.product.review_count || 0);
    });

    if (!evaluated.length) {
      bodyEl.innerHTML = `
        <div style="text-align: center; padding: 36px 12px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--bg-tertiary, #f5f5f5); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--text-tertiary, #888);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 1.05rem; color: var(--text-primary, #111);">No matches found for "${q}"</h4>
          <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary, #666);">Try checking your spelling, or search using broader terms like "Phone" or "Audio".</p>
        </div>
      `;
      return;
    }

    const topMatch = evaluated[0];
    const isTypoCorrection = topMatch.isTypoMatch;

    // Build Instant Suggestions Section (Autocomplete queries per Baymard UX)
    const suggestionsSet = new Set();
    if (isTypoCorrection && topMatch.matchedTerm && topMatch.matchedTerm.toLowerCase() !== q.toLowerCase()) {
      suggestionsSet.add({ text: topMatch.matchedTerm, label: 'Did you mean?' });
    }
    // Add top matched category or brand
    if (topMatch.product.category && !q.toLowerCase().includes(topMatch.product.category.toLowerCase())) {
      const catLabel = topMatch.product.category.charAt(0).toUpperCase() + topMatch.product.category.slice(1);
      suggestionsSet.add({ text: catLabel, label: 'in Categories' });
    }
    // Add top match product name as quick query
    suggestionsSet.add({ text: topMatch.product.name, label: 'Exact product' });

    const suggestionsArr = Array.from(suggestionsSet).slice(0, 3);
    const suggestionsHtml = suggestionsArr.length ? `
      <div style="margin-bottom: 20px; background: var(--bg-tertiary, #f8f9fa); border-radius: 10px; padding: 12px 14px; border: 1px solid var(--border-color, #E5E5E5);">
        <span style="font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-color, #f97316); display: block; margin-bottom: 8px;">Instant Suggestions</span>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${suggestionsArr.map(s => `
            <div class="suggestion-item" data-query="${s.text}" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 4px 6px; border-radius: 6px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.92rem; font-weight: 600; color: var(--text-primary, #111);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent-color, #f97316);"><polyline points="9 18 15 12 9 6"></polyline></svg>
                ${s.text}
              </div>
              <span style="font-size: 0.78rem; color: var(--text-tertiary, #888); font-weight: 500;">${s.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Build Product Results Rows
    const topResults = evaluated.slice(0, 6);
    const resultsHtml = topResults.map(item => {
      const p = item.product;
      const formattedPrice = typeof formatNaira === 'function'
        ? formatNaira(p.price)
        : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(p.price);

      const typoBadge = item.isTypoMatch ? `
        <span style="font-size: 0.72rem; background: rgba(245, 158, 11, 0.12); color: #F59E0B; padding: 2px 7px; border-radius: 4px; font-weight: 600; border: 1px solid rgba(245, 158, 11, 0.3);">Typo Match</span>
      ` : '';

      return `
        <a href="product_detail.html?id=${p.id}" class="search-result-row" onclick="saveSearchHistory('${q.replace(/'/g, "\\'")}')">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${p.image}" alt="${p.name}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; background: var(--bg-tertiary, #f5f5f5); flex-shrink: 0; border: 1px solid var(--border-color, #E5E5E5);">
            <div>
              <div style="font-size: 0.78rem; color: var(--text-tertiary, #888); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;">
                ${p.brand || 'Nexara'} • ${p.category}
              </div>
              <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary, #111); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                ${p.name}
                ${typoBadge}
              </div>
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-weight: 700; font-size: 0.96rem; color: var(--text-primary, #111);">${formattedPrice}</div>
            ${p.originalPrice ? `<div style="font-size: 0.78rem; color: var(--text-tertiary, #888); text-decoration: line-through;">${typeof formatNaira === 'function' ? formatNaira(p.originalPrice) : p.originalPrice}</div>` : ''}
          </div>
        </a>
      `;
    }).join('');

    const viewAllHtml = evaluated.length > 6 ? `
      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-color, #F0F0F0);">
        <a href="product_list.html?search=${encodeURIComponent(q)}" class="btn btn-outline" onclick="saveSearchHistory('${q.replace(/'/g, "\\'")}')" style="display: block; width: 100%; text-align: center; padding: 11px; font-weight: 600; font-size: 0.92rem; border-radius: 8px; border: 1px solid var(--border-color, #E5E5E5); color: var(--text-primary, #111); text-decoration: none;">
          View all ${evaluated.length} results for "${q}" →
        </a>
      </div>
    ` : '';

    bodyEl.innerHTML = `
      ${suggestionsHtml}
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary, #888); margin-bottom: 8px; display: block;">Matching Products (${evaluated.length})</span>
        ${resultsHtml}
      </div>
      ${viewAllHtml}
    `;

    // Wire up suggestion item clicks
    bodyEl.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const queryText = item.getAttribute('data-query');
        const inputEl = overlay.querySelector('#nexara-search-input');
        if (inputEl) {
          inputEl.value = queryText;
          renderResults(queryText);
        }
      });
    });
  }

  function closeOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  // Make closeOverlay globally accessible for inline handlers if needed
  window.closeNexaraSearch = closeOverlay;
  window.saveSearchHistory = saveSearchHistory;

  searchBtn.addEventListener('click', async () => {
    if (overlay) { closeOverlay(); return; }
    await loadProducts();
    buildOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay();
  });
});