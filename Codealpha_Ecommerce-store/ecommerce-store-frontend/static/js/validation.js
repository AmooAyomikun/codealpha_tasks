/**
 * Nexara Validation Logic
 * Shared between Login and Register forms
 */

const ValidationRules = {
  email: (val) => {
    if (!val) return 'Email is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val) ? null : 'Please enter a valid email address';
  },
  password: (val) => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(val)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(val)) return 'Password must contain a number';
    return null;
  },
  required: (val) => {
    return val.trim() ? null : 'This field is required';
  }
};

/**
 * Validates an input element and updates its UI
 * @param {HTMLInputElement} input
 * @param {String} type - The rule to apply (e.g. 'email', 'password', 'required')
 * @returns {Boolean} true if valid
 */
function validateInput(input, type) {
  const value = input.value;
  const errorMsg = ValidationRules[type](value);
  
  // Find or create the validation message container
  let msgContainer = input.nextElementSibling;
  if (!msgContainer || !msgContainer.classList.contains('validation-msg')) {
    msgContainer = document.createElement('div');
    msgContainer.className = 'validation-msg';
    // Insert after input
    input.parentNode.insertBefore(msgContainer, input.nextSibling);
  }

  if (errorMsg) {
    input.classList.add('is-invalid');
    msgContainer.innerHTML = `<i data-lucide="alert-circle" width="14" height="14"></i> ${errorMsg}`;
    msgContainer.classList.add('visible');
    if (window.lucide) lucide.createIcons();
    return false;
  } else {
    input.classList.remove('is-invalid');
    msgContainer.classList.remove('visible');
    msgContainer.innerHTML = '';
    return true;
  }
}

/**
 * Helper for password match validation
 */
function validateMatch(input1, input2) {
  const value = input2.value;
  
  let msgContainer = input2.nextElementSibling;
  if (!msgContainer || !msgContainer.classList.contains('validation-msg')) {
    msgContainer = document.createElement('div');
    msgContainer.className = 'validation-msg';
    input2.parentNode.insertBefore(msgContainer, input2.nextSibling);
  }

  if (value !== input1.value) {
    input2.classList.add('is-invalid');
    msgContainer.innerHTML = `<i data-lucide="alert-circle" width="14" height="14"></i> Passwords do not match`;
    msgContainer.classList.add('visible');
    if (window.lucide) lucide.createIcons();
    return false;
  } else {
    input2.classList.remove('is-invalid');
    msgContainer.classList.remove('visible');
    msgContainer.innerHTML = '';
    return true;
  }
}

/**
 * Binds validation to an entire form
 * @param {HTMLFormElement} form 
 * @param {Object} config - Mapping of input IDs to rule types { 'email-input': 'email' }
 */
function bindFormValidation(form, config) {
  Object.keys(config).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    const rule = config[id];
    
    // Validate on blur (when user leaves field)
    input.addEventListener('blur', () => {
      validateInput(input, rule);
    });

    // Clear error as soon as user starts typing again
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateInput(input, rule);
      }
    });
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Run all validations
    Object.keys(config).forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        if (!validateInput(input, config[id])) {
          isValid = false;
        }
      }
    });

    // Special case for confirm password if it exists in the form
    const pwd1 = document.getElementById('reg-password');
    const pwd2 = document.getElementById('reg-confirm');
    if (pwd1 && pwd2) {
      if (!validateMatch(pwd1, pwd2)) {
        isValid = false;
      }
    }

    if (isValid) {
      // Form is valid! In a real app, send to server.
      // Here, we redirect to Account page
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="loader" class="spin" width="20" height="20"></i> Processing...';
      btn.disabled = true;
      if (window.lucide) lucide.createIcons();
      
      // Inject spin animation if needed
      if(!document.getElementById('spin-style')) {
        const style = document.createElement('style');
        style.id = 'spin-style';
        style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }';
        document.head.appendChild(style);
      }

      setTimeout(() => {
        window.location.href = 'account.html';
      }, 1000);
    }
  });
}
