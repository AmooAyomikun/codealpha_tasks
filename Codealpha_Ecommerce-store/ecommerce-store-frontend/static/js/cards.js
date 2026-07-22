/**
 * Shared Product Card & Star Rating Utilities for Nexara Store
 * Fulfills requirement for centralized card & star rendering across all pages.
 */

/**
 * Returns star rating SVG HTML matching product_list.html exact specification.
 */
function getStarsHtml(rating = 0) {
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

/**
 * Reusable product card renderer used site-wide:
 * - Homepage sections (Featured Products, Trending Now, Flash Deals, New Arrivals)
 * - Product List page
 * - Product Detail page (Related Products)
 *
 * @param {Object} product
 * @param {Object} options { showQuickView: boolean, badge: string }
 */
function renderSharedProductCard(product, options = {}) {
  const badgeText = options.badge || product.badge;
  let badgeHtml = '';
  if (badgeText) {
    badgeHtml = `<div class="product-badge ${badgeText === 'sale' ? 'sale' : badgeText}">${badgeText}</div>`;
  }

  let priceHtml = `<span class="price">${formatNaira(product.price)}</span>`;
  if (product.originalPrice) {
    priceHtml += `<span class="price-original">${formatNaira(product.originalPrice)}</span>`;
  }

  const savings = (badgeText === 'sale' && product.originalPrice)
    ? `<div style="font-size:0.8rem; color:var(--accent-color); font-weight:600; margin-bottom: var(--space-1);">Save ${formatNaira(product.originalPrice - product.price)}</div>`
    : '';

  let buttonsHtml = '';
  if (options.showQuickView) {
    // Featured Products grid: both Add to Cart and Quick View side by side
    buttonsHtml = `
      <div class="card-actions-grid">
        <button class="btn btn-primary btn-sm add-to-cart-btn" style="width:100%; padding: 8px 6px; font-size: 0.85rem; white-space: nowrap;" data-add-to-cart data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}?v=20260714-50">
          Add to Cart
        </button>
        <a href="product_detail.html?id=${product.id}" class="btn btn-outline btn-sm" style="width:100%; padding: 8px 6px; font-size: 0.85rem; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-dark); color: var(--text-primary); border-radius: var(--radius); font-weight: 600; white-space: nowrap;">
          Quick View
        </a>
      </div>
    `;
  } else {
    buttonsHtml = `
      <button class="btn btn-primary add-to-cart-btn" style="width:100%; margin-top: var(--space-2); white-space: nowrap;" data-add-to-cart data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}?v=20260714-50">
        Add to Cart
      </button>
    `;
  }

  const isSaved = (typeof isInWishlist === 'function') && isInWishlist(product.id);
  const wishlistBtnHtml = `
    <button type="button" class="wishlist-card-btn ${isSaved ? 'active' : ''}" data-wishlist-toggle="${product.id}" data-name="${(product.name || '').replace(/"/g, '&quot;')}" data-price="${product.price}" data-image="${product.image}" data-category="${product.category || 'general'}" data-brand="${product.brand || 'Nexara'}" aria-label="Save for later" title="Save for later">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? '#EF4444' : 'none'}" stroke="${isSaved ? '#EF4444' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    </button>
  `;

  return `
    <article class="product-card">
      ${badgeHtml}
      <div class="product-image-wrap">
        ${wishlistBtnHtml}
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand || 'Nexara'}</span>
        <h3 class="product-title">
          <a href="product_detail.html?id=${product.id}" class="product-title-link">${product.name}</a>
        </h3>
        <div class="star-rating" style="margin-bottom: var(--space-1);">
          ${getStarsHtml(product.rating || 4.5)}
          <span class="rating-text">(${product.reviewCount || 12})</span>
        </div>
        <div class="product-price-row">
          ${priceHtml}
        </div>
        ${savings}
        ${buttonsHtml}
      </div>
    </article>
  `;
}

/**
 * Track a product in localStorage ('nexara_recently_viewed')
 */
function trackRecentlyViewed(product) {
  if (!product || !product.id) return;
  let viewed = [];
  try {
    viewed = JSON.parse(localStorage.getItem('nexara_recently_viewed')) || [];
  } catch (e) {
    viewed = [];
  }
  // Filter out existing occurrence of this product so we can place it at index 0
  viewed = viewed.filter(id => String(id) !== String(product.id) && Number(id) !== Number(product.id));
  viewed.unshift(product.id);
  // Keep the most recent 12 product IDs
  if (viewed.length > 12) viewed = viewed.slice(0, 12);
  localStorage.setItem('nexara_recently_viewed', JSON.stringify(viewed));
}

/**
 * Clear Recently Viewed history
 */
function clearRecentlyViewed() {
  localStorage.removeItem('nexara_recently_viewed');
  const section = document.getElementById('recently-viewed-section');
  if (section) {
    section.style.display = 'none';
  }
}

/**
 * Initialize and render Recently Viewed strip on Homepage or Product Detail page (`#recently-viewed-section`)
 */
async function initRecentlyViewed() {
  const container = document.getElementById('recently-viewed-grid');
  const section = document.getElementById('recently-viewed-section');
  if (!container || !section) return;

  let viewedIds = [];
  try {
    viewedIds = JSON.parse(localStorage.getItem('nexara_recently_viewed')) || [];
  } catch (e) {
    viewedIds = [];
  }

  // If we are on a product detail page, omit the currently viewed item from the strip
  const params = new URLSearchParams(window.location.search);
  const currentId = params.get('id');
  if (currentId) {
    viewedIds = viewedIds.filter(id => String(id) !== String(currentId));
  }

  if (!viewedIds.length) {
    section.style.display = 'none';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/products/');
    if (!response.ok) return;
    const allProducts = await response.json();

    const viewedProducts = viewedIds
      .map(id => allProducts.find(p => String(p.id) === String(id)))
      .filter(Boolean)
      .slice(0, 4);

    if (!viewedProducts.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    container.innerHTML = viewedProducts.map(product => renderSharedProductCard(product, { showQuickView: false })).join('');
    if (window.lucide) lucide.createIcons();
  } catch (error) {
    console.error('Error rendering recently viewed products:', error);
    section.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', initRecentlyViewed);

