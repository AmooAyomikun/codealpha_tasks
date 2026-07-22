    lucide.createIcons();

    document.addEventListener('DOMContentLoaded', renderOrders);

    async function renderOrders() {
      const orders = await getOrders();
      const container = document.getElementById('orders-container');

      if (!orders || !orders.length) {
        container.innerHTML = `
          <div class="empty-cart">
            <i data-lucide="package" width="48" height="48" class="empty-cart-icon"></i>
            <h2>No orders yet</h2>
            <p style="margin-bottom: var(--space-6); color: var(--text-secondary);">When you place an order, it'll show up here.</p>
            <a href="product_list.html" class="btn btn-primary">Start Shopping</a>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      container.innerHTML = orders.map(order => {
        const status = getDisplayStatus(order);
        const statusClass = status.toLowerCase().replace(/\s+/g, '-');
        const orderDate = new Date(order.created_at || order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const itemsHtml = order.items.map(item => {
          const prod = item.product || item;
          const qty = item.quantity || item.qty;
          const price = item.price || prod.price;
          return `
          <div class="order-item-row">
            <img src="${prod.image}" alt="${prod.name}" class="order-item-img">
            <div class="order-item-info">
              <div class="order-item-title">${prod.name}</div>
              <div class="order-item-meta">${prod.variants && Object.keys(prod.variants).length ? Object.values(prod.variants).join(' / ') + ' &times; ' : ''}${qty}</div>
            </div>
            <div style="font-weight: 600;">${formatNaira(price * qty)}</div>
          </div>
        `}).join('');

        const payMethod = order.payment_method || order.paymentMethod;
        const totalAmount = order.total || (order.totals && order.totals.total) || 0;

        return `
          <div class="order-card">
            <div class="order-header">
              <div class="order-meta">
                <h3>Order #${order.id}</h3>
                <p>Placed on ${orderDate}</p>
              </div>
              <div>
                <span class="status-badge ${statusClass}">${status}</span>
              </div>
            </div>
            <div class="order-items">
              ${itemsHtml}
            </div>
            <div style="border-top: 1px solid var(--border-color); margin-top: var(--space-4); padding-top: var(--space-4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <span style="font-size: 0.82rem; color: var(--text-tertiary); display: block; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Payment: ${payMethod === 'delivery' ? 'Pay on Delivery' : payMethod === 'transfer' ? 'Bank Transfer' : 'Card'}</span>
                <span style="font-weight: 800; font-size: 1.15rem; color: var(--text-primary);">${formatNaira(totalAmount)}</span>
              </div>
              <a href="track_order.html?id=${order.id}" class="btn btn-primary" style="padding: 8px 18px; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                <i data-lucide="navigation" width="16" height="16"></i> Track Order Live
              </a>
            </div>
          </div>
        `;
      }).join('');

      lucide.createIcons();
    }

    // Tab Navigation Logic
    document.querySelectorAll('.account-nav-link[data-tab]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active link
        document.querySelectorAll('.account-nav-link[data-tab]').forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Update active tab
        const tabId = e.currentTarget.getAttribute('data-tab');
        document.querySelectorAll('.account-tab').forEach(tab => {
          tab.style.display = 'none';
        });
        const targetTab = document.getElementById('tab-' + tabId);
        if (targetTab) {
          targetTab.style.display = 'block';
        }
        
        lucide.createIcons();
      });
    });

    // Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        window.location.href = 'login.html';
      });
    }

    // --- Account Features Logic ---
    const API_BASE = 'http://127.0.0.1:8000/api';
    
    async function apiFetch(path, options = {}) {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };
      try {
        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (res.ok) {
          if (options.method === 'DELETE') return true;
          return await res.json();
        }
      } catch (e) {
        console.error('API Error:', e);
      }
      return null;
    }

    // Profile
    async function loadProfile() {
      const data = await apiFetch('/auth/profile/');
      if (data) {
        document.getElementById('profile-first').value = data.first_name || '';
        document.getElementById('profile-last').value = data.last_name || '';
        document.getElementById('profile-email').value = data.email || '';
      }
    }
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        first_name: document.getElementById('profile-first').value,
        last_name: document.getElementById('profile-last').value,
        email: document.getElementById('profile-email').value
      };
      const data = await apiFetch('/auth/profile/', { method: 'PUT', body: JSON.stringify(payload) });
      if (data) {
        localStorage.setItem('user_info', JSON.stringify(data));
        showToast ? showToast('Profile updated') : alert('Profile updated');
      }
    });

    // Addresses
    function showAddressForm() { document.getElementById('address-form-container').style.display = 'block'; }
    function hideAddressForm() { 
      document.getElementById('address-form-container').style.display = 'none'; 
      document.getElementById('address-form').reset();
      document.getElementById('addr-id').value = '';
    }
    
    async function loadAddresses() {
      const addresses = await apiFetch('/addresses/');
      const container = document.getElementById('addresses-container');
      if (!addresses || addresses.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);">No addresses saved.</p>';
        return;
      }
      container.innerHTML = addresses.map(addr => `
        <div style="border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius); display: flex; justify-content: space-between; align-items: flex-start; background: var(--bg-primary);">
          <div>
            ${addr.is_default ? '<span class="status-badge shipped" style="font-size:0.7rem; padding: 2px 6px; margin-bottom:8px;">Default</span>' : ''}
            <div style="font-weight: 600;">${addr.street}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">${addr.city}, ${addr.state}</div>
          </div>
          <div>
            <button class="btn-icon" onclick="deleteAddress(${addr.id})" title="Delete"><i data-lucide="trash-2" width="18" height="18"></i></button>
          </div>
        </div>
      `).join('');
      lucide.createIcons();
    }
    
    document.getElementById('address-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        street: document.getElementById('addr-street').value,
        city: document.getElementById('addr-city').value,
        state: document.getElementById('addr-state').value,
        is_default: document.getElementById('addr-default').checked
      };
      await apiFetch('/addresses/', { method: 'POST', body: JSON.stringify(payload) });
      hideAddressForm();
      loadAddresses();
    });

    async function deleteAddress(id) {
      if(confirm('Delete this address?')) {
        await apiFetch(`/addresses/${id}/`, { method: 'DELETE' });
        loadAddresses();
      }
    }

    // Payment Methods
    function showPaymentForm() { document.getElementById('payment-form-container').style.display = 'block'; }
    function hidePaymentForm() { 
      document.getElementById('payment-form-container').style.display = 'none';
      document.getElementById('payment-form').reset();
    }

    async function loadPaymentMethods() {
      const methods = await apiFetch('/payment-methods/');
      const container = document.getElementById('payment-container');
      if (!methods || methods.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);">No payment methods saved.</p>';
        return;
      }
      container.innerHTML = methods.map(pay => `
        <div style="border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius); display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary);">
          <div style="display: flex; gap: 12px; align-items: center;">
            <i data-lucide="credit-card" width="24" height="24"></i>
            <div>
              ${pay.is_default ? '<span class="status-badge shipped" style="font-size:0.7rem; padding: 2px 6px;">Default</span>' : ''}
              <div style="font-weight: 600;">${pay.card_type} **** ${pay.last4}</div>
              <div style="color: var(--text-secondary); font-size: 0.8rem;">Expires ${pay.exp_month}/${pay.exp_year}</div>
            </div>
          </div>
          <button class="btn-icon" onclick="deletePayment(${pay.id})" title="Delete"><i data-lucide="trash-2" width="18" height="18"></i></button>
        </div>
      `).join('');
      lucide.createIcons();
    }

    document.getElementById('payment-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const num = document.getElementById('pay-number').value;
      const exp = document.getElementById('pay-expiry').value.split('/');
      const payload = {
        card_type: num.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: num.slice(-4),
        exp_month: exp[0] || '12',
        exp_year: exp[1] || '25',
        is_default: document.getElementById('pay-default').checked
      };
      await apiFetch('/payment-methods/', { method: 'POST', body: JSON.stringify(payload) });
      hidePaymentForm();
      loadPaymentMethods();
    });

    async function deletePayment(id) {
      if(confirm('Delete this card?')) {
        await apiFetch(`/payment-methods/${id}/`, { method: 'DELETE' });
        loadPaymentMethods();
      }
    }

    // Load data on start
    document.addEventListener('DOMContentLoaded', () => {
      loadProfile();
      loadAddresses();
      loadPaymentMethods();
    });
  
