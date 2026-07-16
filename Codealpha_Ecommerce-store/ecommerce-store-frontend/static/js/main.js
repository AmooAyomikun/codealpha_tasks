/**
 * Nexara Main JS
 * Note: formatNaira() now lives in cart.js (loaded before this file), and renderSharedProductCard() lives in cards.js.
 */

document.addEventListener('DOMContentLoaded', () => {
  initFeaturedProducts();
  initBestSellers();
  initFlashDeals();
  initNewArrivals();
  initReviewsCarousel();
});

/**
 * Fetch products from JSON and populate the featured section (`id="featured-products"`)
 * Requirement 1: 4-across grid showing image, name, star rating, price, and BOTH "Add to Cart" and "Quick View" buttons side by side.
 */
async function initFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  container.innerHTML = Array(4).fill(0).map(() => `
    <div class="product-card" style="border:none;">
      <div class="product-image-wrap" style="animation: pulse 1.5s infinite; background: var(--bg-tertiary);"></div>
      <div class="product-info" style="gap: 8px;">
        <div style="height: 12px; width: 40%; background: var(--bg-tertiary); border-radius: 4px; animation: pulse 1.5s infinite;"></div>
        <div style="height: 16px; width: 80%; background: var(--bg-tertiary); border-radius: 4px; animation: pulse 1.5s infinite;"></div>
        <div style="height: 20px; width: 30%; background: var(--bg-tertiary); border-radius: 4px; margin-top: auto; animation: pulse 1.5s infinite;"></div>
      </div>
    </div>
  `).join('');

  if (!document.getElementById('pulse-style')) {
    const style = document.createElement('style');
    style.id = 'pulse-style';
    style.innerHTML = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
    `;
    document.head.appendChild(style);
  }

  try {
    const response = await fetch('../data/products.json');
    if (!response.ok) throw new Error('Network response was not ok');

    const products = await response.json();
    const featuredProducts = products.filter(p => p.featured).slice(0, 4);

    container.innerHTML = featuredProducts.map(product => renderSharedProductCard(product, { showQuickView: true })).join('');

  } catch (error) {
    console.error('Error fetching products:', error);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: var(--space-4); text-align: center; color: var(--text-tertiary);">
        Unable to load products. Please try again later.
      </div>
    `;
  }
}

/**
 * Best Sellers / Trending Now section — sorted by reviewCount descending
 * Requirement 4: Add star rating + review count via renderSharedProductCard
 */
async function initBestSellers() {
  const container = document.getElementById('best-sellers');
  if (!container) return;

  try {
    const response = await fetch('../data/products.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const products = await response.json();

    const bestSellers = [...products]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 4);

    container.innerHTML = bestSellers.map(product => renderSharedProductCard(product, { showQuickView: false })).join('');
  } catch (error) {
    console.error('Error fetching best sellers:', error);
  }
}

/**
 * Flash Deals section — products with badge === "sale"
 * Requirement 4: Add star rating + review count via renderSharedProductCard
 */
async function initFlashDeals() {
  const container = document.getElementById('flash-deals-grid');
  if (!container) return;

  try {
    const response = await fetch('../data/products.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const products = await response.json();

    const saleProducts = products.filter(p => p.badge === 'sale').slice(0, 4);

    container.innerHTML = saleProducts.map(product => renderSharedProductCard(product, { badge: 'sale', showQuickView: false })).join('');
  } catch (error) {
    console.error('Error fetching flash deals:', error);
  }
}

/**
 * New Arrivals section (`id="new-arrivals-grid"`)
 * Requirement 4: Add star rating + review count via renderSharedProductCard
 */
async function initNewArrivals() {
  const container = document.getElementById('new-arrivals-grid');
  if (!container) return;

  try {
    const response = await fetch('../data/products.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const products = await response.json();

    const newArrivals = products.filter(p => p.badge === 'new' || !p.featured).slice(-4).reverse();

    container.innerHTML = newArrivals.map(product => renderSharedProductCard(product, { showQuickView: false })).join('');
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
  }
}

/**
 * Countdown timer for Flash Deals — counts down to end of today
 */
function initCountdown() {
  const el = document.getElementById('countdown-timer');
  if (!el) return;

  function update() {
    const now = new Date();
    const eod = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = eod - now;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  update();
  setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', initCountdown);

/**
 * Reviews carousel auto-scroll
 */
function initReviewsCarousel() {
  const track = document.getElementById('reviews-track');
  if (!track) return;

  let scrollPos = 0;
  const speed = 1;
  let isPaused = false;

  track.addEventListener('mouseenter', () => isPaused = true);
  track.addEventListener('mouseleave', () => isPaused = false);
  track.addEventListener('touchstart', () => isPaused = true);
  track.addEventListener('touchend', () => { setTimeout(() => isPaused = false, 2000); });

  function animate() {
    if (!isPaused) {
      scrollPos += speed;
      if (scrollPos >= track.scrollWidth - track.clientWidth) {
        scrollPos = 0;
      }
      track.scrollLeft = scrollPos;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/**
 * Backward-compatibility wrapper pointing to renderSharedProductCard in cards.js
 */
function renderProductCard(product) {
  if (typeof renderSharedProductCard === 'function') {
    return renderSharedProductCard(product);
  }
  return '';
}