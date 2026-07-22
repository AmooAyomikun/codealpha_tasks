/**
 * Nexara Wishlist Logic
 * Connects to Django Backend via API.
 * Requires auth_token in localStorage.
 */

const API_BASE = 'http://127.0.0.1:8000/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

// --- Core API ---

async function getWishlist() {
  const token = getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE}/wishlist/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return data.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        image: item.product.image || 'placeholder.jpg',
        category: item.product.category || 'general',
        brand: 'Nexara',
        wishlist_item_id: item.id
      }));
    }
  } catch (e) {
    console.error('Error fetching wishlist:', e);
  }
  return [];
}

async function isInWishlist(productId) {
  if (!productId) return false;
  const items = await getWishlist();
  return items.some(item => String(item.id) === String(productId));
}

async function addToWishlist(product) {
  if (!product || !product.id) return;
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/wishlist/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product_id: product.id })
    });
    if (res.ok) {
      window.dispatchEvent(new Event('wishlistUpdated'));
      if (typeof showToast === 'function') {
        showToast(`Saved ${product.name} to Wishlist`);
      } else {
        showWishlistToast(`Saved ${product.name} to Wishlist`);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function removeFromWishlist(productId) {
  const items = await getWishlist();
  const item = items.find(item => String(item.id) === String(productId));
  if (item) {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/wishlist/remove/${item.wishlist_item_id}/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        window.dispatchEvent(new Event('wishlistUpdated'));
        if (typeof showToast === 'function') {
          showToast(`Removed ${item.name} from Wishlist`);
        } else {
          showWishlistToast(`Removed ${item.name} from Wishlist`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

async function toggleWishlist(event, id, name, price, image, category, brand) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const isSaved = await isInWishlist(id);
  if (isSaved) {
    await removeFromWishlist(id);
  } else {
    await addToWishlist({ id, name, price, image, category, brand });
  }
}

async function moveToCartFromWishlist(productId) {
  const items = await getWishlist();
  const item = items.find(i => String(i.id) === String(productId));
  if (item) {
    if (typeof addItem === 'function') {
      await addItem(item, 1);
      await removeFromWishlist(productId);
    }
  }
}

async function clearWishlist() {
  const items = await getWishlist();
  for (let item of items) {
    const token = getToken();
    await fetch(`${API_BASE}/wishlist/remove/${item.wishlist_item_id}/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` }
    });
  }
  window.dispatchEvent(new Event('wishlistUpdated'));
}

// --- UI & Drawer Management ---

async function updateWishlistBadgesAndButtons() {
  const items = await getWishlist();
  const count = items.length;

  // Update navbar count badges
  document.querySelectorAll('.wishlist-count, .wishlist-count-badge, .wishlist-count-mobile').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });

  // Update card heart buttons across DOM
  document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
    const id = btn.dataset.wishlistToggle;
    const isSaved = items.some(item => String(item.id) === String(id));
    btn.classList.toggle('active', isSaved);
    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', isSaved ? '#EF4444' : 'none');
      svg.setAttribute('stroke', isSaved ? '#EF4444' : 'currentColor');
    }
  });

  // Update PDP heart button if present
  const pdpBtn = document.getElementById('pdp-wishlist-btn');
  if (pdpBtn) {
    const id = pdpBtn.dataset.id;
    const isSaved = items.some(item => String(item.id) === String(id));
    pdpBtn.classList.toggle('active', isSaved);
    pdpBtn.innerHTML = isSaved
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Saved to Wishlist`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Save for Later`;
  }

  // Update drawer content if open
  await renderWishlistDrawerContent();
}

function showWishlistToast(message) {
  if (typeof showToast === 'function') {
    showToast(message);
    return;
  }
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex; flex-direction: column; gap: 8px;`;
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.style.cssText = `background-color: var(--text-primary, #111); color: var(--bg-secondary, #fff); padding: 12px 24px; border-radius: 8px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px; animation: slideUpFade 0.3s forwards;`;
  toast.innerHTML = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Wishlist Slide-Out Drawer DOM Injection ---

function injectWishlistDrawer() {
  if (document.getElementById('nexara-wishlist-drawer')) return;

  const drawerHtml = `
    <div class="wishlist-backdrop" id="wishlist-backdrop"></div>
    <aside class="wishlist-drawer" id="nexara-wishlist-drawer" aria-label="Wishlist Drawer">
      <div class="wishlist-drawer-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <h2 style="font-size:1.25rem; font-weight:700; margin:0;">Saved for Later (<span id="wishlist-drawer-count">0</span>)</h2>
        </div>
        <button class="wishlist-drawer-close" id="wishlist-drawer-close" aria-label="Close Wishlist">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="wishlist-drawer-body" id="wishlist-drawer-body">
        <!-- Injected via JS -->
      </div>
      <div class="wishlist-drawer-footer" id="wishlist-drawer-footer">
        <a href="wishlist.html" class="btn btn-outline" style="width:100%; text-align:center; display:block; margin-bottom:8px; font-weight:600;">View Full Wishlist Page</a>
      </div>
    </aside>
  `;

  const container = document.createElement('div');
  container.innerHTML = drawerHtml;
  document.body.appendChild(container);

  if (!document.getElementById('wishlist-styles')) {
    const style = document.createElement('style');
    style.id = 'wishlist-styles';
    style.innerHTML = `
      .wishlist-backdrop {
        position: fixed; top:0; left:0; right:0; bottom:0;
        background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(3px);
        z-index: 2000; opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .wishlist-backdrop.open { opacity: 1; pointer-events: auto; }
      
      .wishlist-drawer {
        position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 420px;
        background: var(--bg-secondary, #fff); z-index: 2001;
        box-shadow: -6px 0 24px rgba(0,0,0,0.15);
        display: flex; flex-direction: column;
        transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .wishlist-drawer.open { transform: translateX(0); }
      
      .wishlist-drawer-header {
        padding: 20px 24px; border-bottom: 1px solid var(--border-color, #eaeaea);
        display: flex; align-items: center; justify-content: space-between;
      }
      .wishlist-drawer-close {
        background: none; border: none; cursor: pointer; color: var(--text-secondary);
        padding: 4px; border-radius: 4px; transition: color 0.2s;
      }
      .wishlist-drawer-close:hover { color: var(--text-primary); }
      
      .wishlist-drawer-body {
        flex: 1; overflow-y: auto; padding: 20px 24px;
      }
      .wishlist-drawer-footer {
        padding: 16px 24px; border-top: 1px solid var(--border-color, #eaeaea); background: var(--bg-primary, #fcfcfc);
      }
      
      .wishlist-drawer-item {
        display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border-color, #f0f0f0);
        align-items: center;
      }
      .wishlist-drawer-img {
        width: 70px; height: 70px; object-fit: cover; border-radius: var(--radius, 8px); background: #f8f9fa;
      }
      .wishlist-drawer-info { flex: 1; min-width: 0; }
      .wishlist-drawer-title {
        font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .wishlist-drawer-title a { color: var(--text-primary); text-decoration: none; }
      .wishlist-drawer-title a:hover { color: var(--accent-color); }
      .wishlist-drawer-price { font-size: 0.9rem; font-weight: 700; color: var(--accent-color); margin-bottom: 8px; }
      .wishlist-drawer-actions { display: flex; gap: 8px; align-items: center; }
      
      .wishlist-card-btn {
        position: absolute; top: 12px; right: 12px; z-index: 10;
        width: 36px; height: 36px; border-radius: 50%;
        background: #FFFFFF;
        border: 1px solid rgba(0,0,0,0.08);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 10px rgba(0,0,0,0.08); color: #555;
      }
      .wishlist-card-btn:hover { transform: scale(1.15); background: #fff; color: #EF4444; }
      .wishlist-card-btn.active { color: #EF4444; }
      .wishlist-card-btn.active svg { fill: #EF4444; stroke: #EF4444; animation: heartPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      
      @keyframes heartPop {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      
      .wishlist-count {
        position: absolute; top: -6px; right: -8px;
        background: #EF4444; color: #fff; font-size: 0.72rem; font-weight: 700;
        min-width: 18px; height: 18px; border-radius: 9px;
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0 4px; border: 2px solid var(--bg-secondary, #fff);
      }
      .wishlist-btn { position: relative; }
    `;
    document.head.appendChild(style);
  }

  const closeBtn = document.getElementById('wishlist-drawer-close');
  const backdrop = document.getElementById('wishlist-backdrop');
  if (closeBtn) closeBtn.addEventListener('click', closeWishlistDrawer);
  if (backdrop) backdrop.addEventListener('click', closeWishlistDrawer);
}

async function openWishlistDrawer() {
  injectWishlistDrawer();
  await renderWishlistDrawerContent();
  const drawer = document.getElementById('nexara-wishlist-drawer');
  const backdrop = document.getElementById('wishlist-backdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('nexara-wishlist-drawer');
  const backdrop = document.getElementById('wishlist-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

async function renderWishlistDrawerContent() {
  const body = document.getElementById('wishlist-drawer-body');
  const countEl = document.getElementById('wishlist-drawer-count');
  const footer = document.getElementById('wishlist-drawer-footer');
  if (!body) return;

  const items = await getWishlist();
  if (countEl) countEl.textContent = items.length;

  if (items.length === 0) {
    body.innerHTML = `
      <div style="text-align:center; padding: 60px 20px;">
        <div style="width:64px; height:64px; border-radius:50%; background:#f8f9fa; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:#EF4444;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </div>
        <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:8px;">Your Wishlist is Empty</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:20px; line-height:1.5;">Tap the heart icon on any product while browsing to save items you love for later.</p>
        <a href="product_list.html" class="btn btn-primary" onclick="closeWishlistDrawer()" style="display:inline-block; padding: 10px 20px;">Explore Products</a>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  body.innerHTML = items.map(item => `
    <div class="wishlist-drawer-item">
      <img src="../static/images/${item.image}?v=20260714-50" alt="${item.name}" class="wishlist-drawer-img">
      <div class="wishlist-drawer-info">
        <h4 class="wishlist-drawer-title"><a href="product_detail.html?id=${item.id}">${item.name}</a></h4>
        <div class="wishlist-drawer-price">${formatNaira ? formatNaira(item.price) : '₦' + item.price.toLocaleString()}</div>
        <div class="wishlist-drawer-actions">
          <button class="btn btn-primary btn-sm" onclick="moveToCartFromWishlist(${item.id})" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;">
            Move to Cart
          </button>
          <button class="btn-icon" onclick="removeFromWishlist(${item.id})" title="Remove from wishlist" style="color:var(--text-secondary); padding:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Global Event Delegation ---

document.addEventListener('click', (e) => {
  // Toggle heart button on product cards
  const toggleBtn = e.target.closest('[data-wishlist-toggle]');
  if (toggleBtn) {
    e.preventDefault();
    e.stopPropagation();
    const id = toggleBtn.dataset.wishlistToggle;
    const name = toggleBtn.dataset.name || 'Product';
    const price = parseFloat(toggleBtn.dataset.price || 0);
    const image = toggleBtn.dataset.image || 'placeholder.jpg';
    const category = toggleBtn.dataset.category || 'general';
    const brand = toggleBtn.dataset.brand || 'Nexara';
    toggleWishlist(e, id, name, price, image, category, brand);
    return;
  }

  // Open wishlist drawer
  const openBtn = e.target.closest('[data-open-wishlist]');
  if (openBtn) {
    e.preventDefault();
    openWishlistDrawer();
    return;
  }
});

window.addEventListener('wishlistUpdated', updateWishlistBadgesAndButtons);
document.addEventListener('DOMContentLoaded', () => {
  injectWishlistDrawer();
  updateWishlistBadgesAndButtons();
});
