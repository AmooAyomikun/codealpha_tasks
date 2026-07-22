/**
 * Nexara Nav Active State
 * Highlights the nav link matching the current page + category, on every page.
 * Include after the header markup exists in the DOM (anywhere before </body> works).
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUrl = new URL(window.location.href);
  const currentPath = currentUrl.pathname.split('/').pop() || 'index.html';
  const currentCategory = currentUrl.searchParams.get('category');

  document.querySelectorAll('.nav-link, .mobile-nav-link, .mobile-nested-link').forEach(link => {
    let linkUrl;
    try {
      linkUrl = new URL(link.getAttribute('href'), window.location.href);
    } catch (e) {
      return;
    }
    const linkPath = linkUrl.pathname.split('/').pop() || 'index.html';
    const linkCategory = linkUrl.searchParams.get('category');

    const isActive = linkPath === currentPath && linkCategory === currentCategory;
    if (isActive) {
      link.classList.add('active');
      link.style.color = 'var(--accent-color, #DB6E1F)';
      link.style.fontWeight = '600';
    }
  });

  // Dynamic Account Link
  const token = localStorage.getItem('auth_token');
  if (token) {
    document.querySelectorAll('a[aria-label="Account"]').forEach(el => {
      el.setAttribute('href', 'account.html');
    });
    document.querySelectorAll('.mobile-user-btn[href="login.html"]').forEach(el => {
      el.setAttribute('href', 'account.html');
    });
  }

  // Mobile Nav Drawer Controller
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileMenuClose = document.getElementById('mobile-nav-close');
  const mobileCategoriesToggle = document.getElementById('mobile-categories-toggle');
  const mobileCategoriesList = document.getElementById('mobile-categories-list');

  function openMobileNav() {
    if (mobileNavDrawer) mobileNavDrawer.classList.add('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.mobile-menu-btn').forEach(btn => {
    btn.addEventListener('click', openMobileNav);
  });

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileNav);
  }
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileNav);
  }

  if (mobileCategoriesToggle && mobileCategoriesList) {
    mobileCategoriesToggle.addEventListener('click', () => {
      mobileCategoriesToggle.classList.toggle('expanded');
      mobileCategoriesList.classList.toggle('open');
    });
  }

  document.querySelectorAll('.mobile-nav-link[href], .mobile-nested-link[href], .mobile-user-btn[href]').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
});