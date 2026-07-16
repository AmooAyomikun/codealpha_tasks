/**
 * Nexara Orders Module
 * Requires cart.js to be loaded first (uses getCartItems, getCartTotals, clearCart).
 * Load this on checkout.html, order_confirmation.html, and account.html.
 */

const ORDERS_KEY = 'nexara_orders';

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function generateOrderId() {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${random}`;
}

/**
 * Snapshot the current cart into a new order, save it, and clear the cart.
 * @param {Object} shippingInfo - { firstName, lastName, address, city, state }
 * @param {String} paymentMethod - 'card' | 'transfer' | 'delivery'
 * @returns {Object} the newly created order
 */
function createOrder(shippingInfo = {}, paymentMethod = 'card') {
  const items = getCartItems();
  const totals = getCartTotals();

  const order = {
    id: generateOrderId(),
    date: new Date().toISOString(),
    status: 'Processing',
    items: items,
    totals: totals,
    shipping: shippingInfo,
    paymentMethod: paymentMethod
  };

  const orders = getOrders();
  orders.unshift(order); // newest first
  saveOrders(orders);

  clearCart();

  return order;
}

function getOrderById(id) {
  return getOrders().find(o => o.id === id) || null;
}

/**
 * Demo-only status simulation: since there's no backend advancing real order
 * status yet, this derives a display status from how long ago the order was
 * placed, purely so the Account page feels alive when reviewing the site.
 * Replace this with real status from the backend once orders are wired to Django.
 */
function getDisplayStatus(order) {
  if (order.customStatus) return order.customStatus;
  if (order.status && order.status !== 'Processing') return order.status;
  const minutesElapsed = (Date.now() - new Date(order.date).getTime()) / 60000;
  if (minutesElapsed < 1) return 'Processing';
  if (minutesElapsed < 2) return 'Shipped';
  if (minutesElapsed < 4) return 'Out for Delivery';
  return 'Delivered';
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = newStatus;
    orders[index].customStatus = newStatus;
    saveOrders(orders);
    return orders[index];
  }
  return null;
}