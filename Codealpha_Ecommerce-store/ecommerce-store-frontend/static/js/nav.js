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

  // Dynamic Account Link & Logout Logic
  const token = localStorage.getItem('auth_token');
  const userInfoStr = localStorage.getItem('user_info');
  let userInfo = null;
  if (userInfoStr) {
    try { userInfo = JSON.parse(userInfoStr); } catch(e) {}
  }

  if (token) {
    const userName = userInfo && userInfo.first_name ? userInfo.first_name : (userInfo && userInfo.username ? userInfo.username.split('@')[0] : 'Account');
    
    // Desktop Nav
    document.querySelectorAll('a[aria-label="Account"]').forEach(el => {
      el.outerHTML = `
        <div class="user-dropdown-container" style="position:relative; display:inline-block; margin-left: 8px;">
          <button class="btn-icon" style="display:flex; align-items:center; gap:6px; font-size:0.95rem; font-weight:600; cursor:pointer; background:none; border:none; color:var(--text-primary); padding:4px 8px; border-radius:var(--radius);">
            <i data-lucide="user" width="20" height="20"></i>
            <span class="desktop-nav-username" style="display:none;">${userName}</span>
          </button>
          <div class="user-dropdown-menu" style="display:none; position:absolute; right:0; top:calc(100% + 10px); background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius); padding:8px; box-shadow:var(--shadow-md); z-index:100; min-width:140px;">
             <div style="padding: 8px 12px; font-weight:700; border-bottom:1px solid var(--border-color); margin-bottom:4px; font-size:0.9rem;">Hi, ${userName}</div>
             <a href="account.html" style="display:block; padding:10px 12px; color:var(--text-primary); text-decoration:none; font-size:0.95rem; font-weight:500;">My Account</a>
             <button class="logout-btn" style="display:block; width:100%; text-align:left; padding:10px 12px; color:var(--accent-color); background:none; border:none; cursor:pointer; font-size:0.95rem; font-weight:500;">Logout</button>
          </div>
        </div>
      `;
    });

    // Mobile Nav
    document.querySelectorAll('.mobile-user-btn[href="login.html"]').forEach(el => {
      el.outerHTML = `
        <a href="account.html" class="mobile-user-btn">
          <i data-lucide="user" width="18" height="18"></i>
          <span>Account (${userName})</span>
        </a>
        <button class="mobile-user-btn logout-btn" style="background:none; border:none; width:100%; text-align:left; cursor:pointer; color:var(--accent-color); margin-top:4px;">
          <i data-lucide="log-out" width="18" height="18"></i>
          <span>Logout</span>
        </button>
      `;
    });

    // Re-initialize icons for newly added HTML
    if (window.lucide) window.lucide.createIcons();

    // Add CSS for desktop username visibility
    const style = document.createElement('style');
    style.innerHTML = '@media (min-width: 1024px) { .desktop-nav-username { display: inline !important; } }';
    document.head.appendChild(style);

    // Dropdown toggle logic
    document.querySelectorAll('.user-dropdown-container > button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        const isVisible = menu.style.display === 'block';
        document.querySelectorAll('.user-dropdown-menu').forEach(m => m.style.display = 'none');
        if (!isVisible) menu.style.display = 'block';
      });
    });
    
    document.addEventListener('click', () => {
      document.querySelectorAll('.user-dropdown-menu').forEach(menu => menu.style.display = 'none');
    });

    // Logout logic
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const t = localStorage.getItem('auth_token');
        if (t) {
           try {
             await fetch('http://127.0.0.1:8000/api/auth/logout/', {
               method: 'POST',
               headers: { 'Authorization': 'Token ' + t }
             });
           } catch(e) { console.error('Logout failed:', e); }
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        window.location.reload();
      });
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