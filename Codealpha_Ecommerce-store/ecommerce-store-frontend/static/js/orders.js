/**
 * Nexara Orders Module
 * Connects to Django Backend via API.
 * Requires auth_token in localStorage.
 */

const ORDERS_API_BASE = 'http://127.0.0.1:8000/api';

function getOrdersToken() {
  return localStorage.getItem('auth_token');
}

async function getOrders() {
  const token = getOrdersToken();
  if (!token) return [];

  try {
    const res = await fetch(`${ORDERS_API_BASE}/orders/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Error fetching orders:', e);
  }
  return [];
}

async function createOrder(shippingInfo = {}, paymentMethod = 'card') {
  const token = getOrdersToken();
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }

  const payload = {
    full_name: `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim(),
    address: shippingInfo.address || '',
    phone: shippingInfo.phone || '',
    delivery_state: shippingInfo.state || '',
    payment_method: paymentMethod
  };

  try {
    const res = await fetch(`${ORDERS_API_BASE}/orders/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const order = await res.json();
      localStorage.removeItem('applied_coupon');
      window.dispatchEvent(new Event('cartUpdated')); // since cart is cleared on backend
      return order;
    }
  } catch (e) {
    console.error('Error creating order:', e);
  }
  return null;
}

async function getOrderById(id) {
  const token = getOrdersToken();
  if (!token) return null;

  try {
    const res = await fetch(`${ORDERS_API_BASE}/orders/${id}/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Error fetching order detail:', e);
  }
  return null;
}

function getDisplayStatus(order) {
  return order.status || 'Processing';
}

// updateOrderStatus is removed or kept as a dummy, since regular users shouldn't update status arbitrarily via frontend
async function updateOrderStatus(orderId, newStatus) {
  console.warn("Status update should happen via backend Admin. This is a no-op.");
  return await getOrderById(orderId);
}
