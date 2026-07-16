/**
 * ElectroStore Filters and Product List Logic
 */

let allProducts = [];
let currentProducts = [];
let currentSpecialFilter = null;
let currentSearchQuery = null;

document.addEventListener('DOMContentLoaded', () => {
  initProductList();
});

async function initProductList() {
  const container = document.getElementById('product-list-grid');
  if (!container) return;

  try {
    const response = await fetch('http://127.0.0.1:8000/api/products/');
    if (!response.ok) throw new Error('Failed to load products');
    
    allProducts = await response.json();
    
    // Parse URL parameters for initial category, filter, and sort selection
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const filterParam = urlParams.get('filter');
    const sortParam = urlParams.get('sort');
    const searchParam = urlParams.get('search') || urlParams.get('q');

    if (categoryParam) {
      const categoryCheckbox = document.querySelector(`input[name="category"][value="${categoryParam}"]`);
      if (categoryCheckbox) {
        categoryCheckbox.checked = true;
      }
    }
    
    if (filterParam) {
      currentSpecialFilter = filterParam.toLowerCase();
    }

    if (searchParam) {
      currentSearchQuery = searchParam.trim();
    }

    if (currentSpecialFilter || currentSearchQuery) {
      updateSpecialFilterBanner();
    }
    
    if (sortParam) {
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.value = sortParam;
      }
    }
    
    // Setup event listeners
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
      filterForm.addEventListener('change', applyFiltersAndSort);
    }
    
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', applyFiltersAndSort);
    }
    
    // Initial render
    applyFiltersAndSort();
    
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div style="grid-column: 1 / -1; padding: var(--space-4); text-align: center;">Unable to load products.</div>';
  }
}

let lastSelectedCategoriesKey = null;

function updateBrandFilters(selectedCategories) {
  const brandContainer = document.getElementById('brand-filters');
  if (!brandContainer) return;
  
  const categoriesKey = selectedCategories.slice().sort().join('|');
  if (categoriesKey === lastSelectedCategoriesKey && lastSelectedCategoriesKey !== null) {
    return; // No change to selected categories, keep current brand checkboxes intact
  }
  lastSelectedCategoriesKey = categoriesKey;
  
  // Save currently checked brand values to preserve selections if still valid
  const currentlyChecked = new Set(
    Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(i => i.value)
  );
  
  // Filter available products by selected categories
  const availableProducts = selectedCategories.length > 0
    ? allProducts.filter(p => selectedCategories.includes(p.category))
    : allProducts;
    
  const brands = [...new Set(availableProducts.map(p => p.brand))].sort();
  
  brandContainer.innerHTML = brands.map(brand => `
    <label class="checkbox-label">
      <input type="checkbox" name="brand" value="${brand}" class="checkbox-input" ${currentlyChecked.has(brand) ? 'checked' : ''}>
      <span class="checkbox-custom"></span>
      ${brand}
    </label>
  `).join('');
}

function updateSpecialFilterBanner() {
  const banner = document.getElementById('special-filter-banner');
  const textEl = document.getElementById('special-filter-text');
  if (!banner || !textEl) return;
  
  if (!currentSpecialFilter && !currentSearchQuery) {
    banner.style.display = 'none';
    return;
  }
  
  let label = '';
  if (currentSearchQuery && currentSpecialFilter) {
    label = `Search: "${currentSearchQuery}" in ${currentSpecialFilter.toUpperCase()}`;
  } else if (currentSearchQuery) {
    label = `Search results for "${currentSearchQuery}"`;
  } else if (currentSpecialFilter === 'featured') label = 'Featured Products & Curated Picks';
  else if (currentSpecialFilter === 'trending') label = 'Trending & Top Rated Best Sellers';
  else if (currentSpecialFilter === 'new') label = 'Fresh Drops & New Arrivals';
  else if (currentSpecialFilter === 'sale') label = 'Flash Deals & Items On Sale';
  else label = `${currentSpecialFilter}`;
  
  textEl.textContent = label;
  banner.style.display = 'flex';
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

function clearSpecialFilter() {
  currentSpecialFilter = null;
  currentSearchQuery = null;
  updateSpecialFilterBanner();
  const url = new URL(window.location);
  url.searchParams.delete('filter');
  url.searchParams.delete('search');
  url.searchParams.delete('q');
  window.history.pushState({}, '', url);
  applyFiltersAndSort();
}

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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function computeProductScoreForList(product, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();

  if (name.includes(q)) return 100 + (name.startsWith(q) ? 20 : 0);
  if (brand.includes(q)) return 90 + (brand === q ? 20 : 0);
  if (category.includes(q)) return 85 + (category === q ? 15 : 0);
  if (q.length < 3) return 0;

  const qTokens = q.split(/\s+/).filter(Boolean);
  const pTokens = `${name} ${brand} ${category}`.split(/\s+/).filter(Boolean);
  let totalScore = 0;
  let allMatched = true;

  for (const qTok of qTokens) {
    let best = 0;
    for (const pTok of pTokens) {
      if (pTok.includes(qTok) || qTok.includes(pTok)) {
        best = Math.max(best, 70);
        continue;
      }
      const dist = levenshteinDistance(qTok, pTok);
      const prefixDist = levenshteinDistance(qTok, pTok.slice(0, Math.max(qTok.length, 3)));
      const minDist = Math.min(dist, prefixDist);
      if (minDist <= (qTok.length <= 4 ? 1 : 2)) {
        best = Math.max(best, 65 - minDist * 12);
      }
    }
    if (best === 0) allMatched = false;
    else totalScore += best;
  }

  if (allMatched && totalScore > 0) return totalScore / qTokens.length;
  if (levenshteinDistance(q, brand) <= (q.length <= 4 ? 1 : 2)) return 55;
  if (levenshteinDistance(q, category) <= (q.length <= 4 ? 1 : 2)) return 50;
  if (desc.includes(q)) return 40;
  return 0;
}

function updatePageTitles(selectedCategories) {
  const breadcrumbEl = document.getElementById('breadcrumb-current');
  const titleEl = document.getElementById('page-title-heading');
  const subtitleEl = document.getElementById('page-subtitle');
  if (!titleEl) return;

  let title = 'All Products';
  let breadcrumb = 'All Products';
  let subtitle = 'Browse our complete catalog of high-performance electronics and accessories.';

  if (currentSpecialFilter === 'featured') {
    title = 'Featured Products & Curated Picks';
    breadcrumb = 'Featured Products';
    subtitle = 'Handpicked flagship devices and tech selections highlighted by our editorial team.';
  } else if (currentSpecialFilter === 'trending') {
    title = 'Trending & Top Rated Best Sellers';
    breadcrumb = 'Trending Now';
    subtitle = 'The most loved devices, highest-rated gadgets, and community bestsellers right now.';
  } else if (currentSpecialFilter === 'new') {
    title = 'Fresh Drops & New Arrivals';
    breadcrumb = 'New Arrivals';
    subtitle = 'Explore our newest tech releases, latest flagship editions, and recently launched accessories.';
  } else if (currentSpecialFilter === 'sale') {
    title = 'Flash Deals & Special Offers';
    breadcrumb = 'Flash Deals & Sale';
    subtitle = 'Unmatched savings on premium computing, audio equipment, and smartphone gear.';
  } else if (currentSearchQuery) {
    title = `Search Results for "${currentSearchQuery}"`;
    breadcrumb = 'Search Results';
    subtitle = `Displaying products matching "${currentSearchQuery}".`;
  } else if (selectedCategories && selectedCategories.length === 1) {
    const cat = selectedCategories[0];
    const catMap = {
      phones: { t: 'Smartphones & Mobile Devices', s: 'Discover flagship phones, folding screens, and high-performance mobile devices.' },
      laptops: { t: 'Laptops & Computing', s: 'Ultra-fast notebooks, developer machines, and high-end workstation setups.' },
      audio: { t: 'Premium Audio & Studio Gear', s: 'Audiophile headphones, true wireless earbuds, and precision sound systems.' },
      wearables: { t: 'Smart Wearables & Fitness Tech', s: 'Advanced health monitoring, titanium smartwatches, and everyday wearables.' },
      tvs: { t: '4K TVs & Home Cinema', s: 'OLED displays, immersive soundbars, and next-gen living room entertainment.' },
      gaming: { t: 'Gaming Consoles & Hardware', s: 'Next-gen consoles, pro controllers, and competitive gaming gear.' },
      accessories: { t: 'Power & Precision Accessories', s: 'GaN chargers, magnetic power banks, and essential everyday carry accessories.' }
    };
    if (catMap[cat]) {
      title = catMap[cat].t;
      breadcrumb = catMap[cat].t.split(' & ')[0];
      subtitle = catMap[cat].s;
    }
  }

  if (breadcrumbEl) breadcrumbEl.textContent = breadcrumb;
  titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

function applyFiltersAndSort() {
  // 1. Get current filter values
  const categoryInputs = Array.from(document.querySelectorAll('input[name="category"]:checked'));
  const selectedCategories = categoryInputs.map(input => input.value);
  
  // Dynamically update brand checkboxes based on currently selected categories
  updateBrandFilters(selectedCategories);
  
  const brandInputs = Array.from(document.querySelectorAll('input[name="brand"]:checked'));
  const selectedBrands = brandInputs.map(input => input.value);
  
  const priceInput = document.querySelector('input[name="price"]:checked');
  const priceFilter = priceInput ? priceInput.value : 'all';
  
  updatePageTitles(selectedCategories);

  // 2. Filter data
  currentProducts = allProducts.filter(product => {
    // Search query match (exact or typo-tolerant Levenshtein match)
    if (currentSearchQuery && computeProductScoreForList(product, currentSearchQuery) <= 0) {
      return false;
    }

    // Special filter match (Featured, Trending, New, Sale)
    if (currentSpecialFilter === 'featured' && !product.featured) {
      return false;
    }
    if (currentSpecialFilter === 'trending' && product.reviewCount < 300 && product.rating < 4.7) {
      return false;
    }
    if (currentSpecialFilter === 'new' && product.badge !== 'new' && product.featured && product.id < 45) {
      return false;
    }
    if (currentSpecialFilter === 'sale' && product.badge !== 'sale' && !product.originalPrice) {
      return false;
    }

    // Category match
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    
    // Brand match
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    
    // Price match
    if (priceFilter === '0-500000' && product.price >= 500000) return false;
    if (priceFilter === '500000-1000000' && (product.price < 500000 || product.price > 1000000)) return false;
    if (priceFilter === '1000000-plus' && product.price <= 1000000) return false;
    
    return true;
  });
  
  // 3. Sort data
  const sortSelect = document.getElementById('sort-select');
  const sortValue = sortSelect ? sortSelect.value : 'newest';
  
  if (currentSearchQuery && (sortValue === 'newest' || !sortValue)) {
    currentProducts.sort((a, b) => computeProductScoreForList(b, currentSearchQuery) - computeProductScoreForList(a, currentSearchQuery));
  } else if (sortValue === 'price-asc') {
    currentProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'price-desc') {
    currentProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === 'rating') {
    currentProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === 'newest') {
    // Simulated newest by ID descending (mock data assumption)
    currentProducts.sort((a, b) => b.id - a.id);
  }
  
  // 4. Update UI
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById('product-list-grid');
  const countEl = document.getElementById('results-count');
  const noResultsEl = document.getElementById('no-results');
  
  if (!container) return;
  
  // Update count
  if (countEl) {
    countEl.textContent = `Showing ${currentProducts.length} product${currentProducts.length !== 1 ? 's' : ''}`;
  }
  
  // Handle empty state
  if (currentProducts.length === 0) {
    container.innerHTML = '';
    if (noResultsEl) noResultsEl.style.display = 'block';
    return;
  }
  
  if (noResultsEl) noResultsEl.style.display = 'none';
  
  // Render cards
  // Render cards using centralized shared card renderer
  container.innerHTML = currentProducts.map(product => {
    if (typeof renderSharedProductCard === 'function') {
      return renderSharedProductCard(product, { showQuickView: false });
    }
    // Fallback if cards.js wasn't loaded
    return `
      <article class="product-card">
        ${product.badge ? `<div class="product-badge ${product.badge}">${product.badge}</div>` : ''}
        <div class="product-image-wrap">
          <img src="../static/images/${product.image}?v=20260714-50" alt="${product.name}" class="product-image" loading="lazy">
        </div>
        <div class="product-info">
          <span class="product-brand">${product.brand}</span>
          <h3 class="product-title"><a href="product_detail.html?id=${product.id}" class="product-title-link">${product.name}</a></h3>
          <div class="star-rating" style="margin-bottom: var(--space-1);">
            ${getStarsHtml(product.rating)}
            <span class="rating-text">(${product.reviewCount})</span>
          </div>
          <div class="product-price-row"><span class="price">${formatNaira(product.price)}</span></div>
          <button class="btn btn-primary" style="width:100%; margin-top: var(--space-2); white-space: nowrap;" data-add-to-cart data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}?v=20260714-50">Add to Cart</button>
        </div>
      </article>
    `;
  }).join('');
}

function getStarsHtml(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
  }
  if (hasHalfStar) {
    html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
  }
  return html;
}