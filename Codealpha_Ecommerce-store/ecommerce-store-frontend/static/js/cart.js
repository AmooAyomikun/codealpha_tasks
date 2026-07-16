/**
 * Nexara Cart Logic
 * Uses localStorage for persistence.
 * Single source of truth for cart state AND currency formatting AND add-to-cart wiring.
 * Load this on EVERY page, before any other script that touches the cart.
 */

const CART_KEY = 'nexara_cart';

// --- Core API ---

function getCartItems() {
  const cartData = localStorage.getItem(CART_KEY);
  return cartData ? JSON.parse(cartData) : [];
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Add an item to the cart
 * @param {Object} product - Must contain id, name, price, image
 * @param {Number} qty - Quantity to add
 * @param {Object} variants - e.g. { Color: 'Black', Storage: '256GB' }
 */
function addItem(product, qty = 1, variants = {}) {
  const items = getCartItems();

  const existingItemIndex = items.findIndex(item => {
    if (String(item.id) !== String(product.id)) return false;
    return JSON.stringify(item.variants || {}) === JSON.stringify(variants || {});
  });

  if (existingItemIndex > -1) {
    items[existingItemIndex].qty += qty;
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      variants: variants,
      qty: qty
    });
  }

  saveCart(items);
  showToast(`${product.name} added to cart`);
}

function removeItem(index) {
  const items = getCartItems();
  if (index >= 0 && index < items.length) {
    items.splice(index, 1);
    saveCart(items);
  }
}

function updateQty(index, newQty) {
  const items = getCartItems();
  if (index >= 0 && index < items.length) {
    if (newQty <= 0) {
      removeItem(index);
    } else {
      items[index].qty = newQty;
      saveCart(items);
    }
  }
}

/**
 * Naira-scale thresholds: free shipping over ₦500,000, flat ₦5,000 otherwise.
 * VAT in Nigeria is 7.5%.
 */
function getCartTotals() {
  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const shipping = subtotal > 500000 ? 0 : (subtotal > 0 ? 5000 : 0);
  const taxRate = 0.075; // 7.5% Nigerian VAT
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  return {
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    total: total,
    itemCount: items.reduce((sum, item) => sum + item.qty, 0)
  };
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
}

// --- Currency formatting (single source of truth — use this everywhere, never hardcode $) ---

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// --- UI Helpers ---

function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: var(--space-4);
      right: var(--space-4);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.style.cssText = `
    background-color: var(--text-primary);
    color: var(--bg-secondary);
    padding: 12px 24px;
    border-radius: var(--radius);
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideUpFade 0.3s forwards;
  `;

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent-color);"><path d="M20 6L9 17l-5-5"></path></svg>
    ${message}
  `;

  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      @keyframes slideUpFade {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
  }

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function updateCartBadges() {
  const counts = document.querySelectorAll('.cart-count');
  const totalItems = getCartTotals().itemCount;

  counts.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

window.addEventListener('cartUpdated', updateCartBadges);
document.addEventListener('DOMContentLoaded', updateCartBadges);

// --- Centralized "Add to Cart" wiring ---
// Any button anywhere on the site with these data attributes works automatically.
// This is the ONLY place this listener should exist — do not duplicate it in
// filters.js, main.js, or product_detail.html, or items will be added twice per click.
//   <button data-add-to-cart data-id="5" data-name="..." data-price="2080000" data-image="...">
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add-to-cart]');
  if (!btn) return;
  e.preventDefault();

  const product = {
    id: btn.dataset.id,
    name: btn.dataset.name,
    price: parseFloat(btn.dataset.price),
    image: btn.dataset.image
  };

  const qty = btn.dataset.qty ? parseInt(btn.dataset.qty, 10) : 1;
  addItem(product, qty);
});