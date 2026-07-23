/**
 * Nexara Cart Logic
 * Connects to Django Backend via API.
 * Requires auth_token in localStorage.
 */

const API_BASE = 'http://127.0.0.1:8000/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

// --- Core API ---

async function getCartItems() {
  const token = getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE}/cart/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return data.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
        image: item.product.image || 'placeholder.jpg',
        qty: item.quantity,
        cart_item_id: item.id
      }));
    }
  } catch (e) {
    console.error('Error fetching cart:', e);
  }
  return [];
}

async function addItem(product, qty = 1, variants = {}) {
  const token = getToken();
  if (!token) {
    if (typeof showToast === 'function') {
      showToast('Please log in to continue.', 'error');
      setTimeout(() => {
        window.location.href = 'login.html?next=' + encodeURIComponent(window.location.href);
      }, 1500);
    } else {
      window.location.href = 'login.html?next=' + encodeURIComponent(window.location.href);
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart/add/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product_id: product.id, quantity: qty })
    });
    if (res.ok) {
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(`${product.name || 'Item'} added to cart`);
    } else {
      showToast('Error adding item to cart');
    }
  } catch (e) {
    console.error(e);
  }
}

async function removeItem(index) {
  // To remove an item by index, we first need its ID.
  const items = await getCartItems();
  if (index >= 0 && index < items.length) {
    const item = items[index];
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/cart/remove/${item.id}/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (e) {
      console.error(e);
    }
  }
}

async function updateQty(index, newQty) {
  const items = await getCartItems();
  if (index >= 0 && index < items.length) {
    if (newQty <= 0) {
      await removeItem(index);
    } else {
      const item = items[index];
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/cart/update/${item.id}/`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: newQty })
        });
        if (res.ok) {
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}

async function getCartTotals() {
  const items = await getCartItems();
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const shipping = subtotal > 500000 ? 0 : (subtotal > 0 ? 5000 : 0);
  const taxRate = 0.075; // 7.5% Nigerian VAT
  const tax = subtotal * taxRate;
  let total = subtotal + shipping + tax;
  
  let discount = 0;
  const savedCoupon = localStorage.getItem('applied_coupon');
  if (savedCoupon) {
    const coupon = JSON.parse(savedCoupon);
    if (coupon.discount_percent) {
      discount = subtotal * (coupon.discount_percent / 100);
    } else if (coupon.discount_amount) {
      discount = Number(coupon.discount_amount);
    }
    total = total - discount;
    if (total < 0) total = 0;
  }

  return {
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    discount: discount,
    total: total,
    itemCount: items.reduce((sum, item) => sum + item.qty, 0)
  };
}

async function applyCoupon(code) {
  try {
    const res = await fetch(`${API_BASE}/coupon/validate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (res.ok && !data.error) {
      localStorage.setItem('applied_coupon', JSON.stringify(data));
      window.dispatchEvent(new Event('cartUpdated'));
      return { success: true, message: 'Coupon applied successfully!' };
    }
    return { success: false, message: data.error || 'Invalid or expired coupon' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Error applying coupon' };
  }
}

async function clearCart() {
  // Backend clears cart on checkout. If we want a manual clear:
  const items = await getCartItems();
  for (let item of items) {
    const token = getToken();
    await fetch(`${API_BASE}/cart/remove/${item.id}/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` }
    });
  }
  window.dispatchEvent(new Event('cartUpdated'));
}

// --- Currency formatting ---
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

async function updateCartBadges() {
  const counts = document.querySelectorAll('.cart-count');
  const totals = await getCartTotals();
  const totalItems = totals.itemCount;

  counts.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

window.addEventListener('cartUpdated', updateCartBadges);
document.addEventListener('DOMContentLoaded', updateCartBadges);

// --- Centralized "Add to Cart" wiring ---
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