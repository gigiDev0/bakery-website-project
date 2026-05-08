/* =====================================================
   GOLDEN CRUMB BAKERY – Main Script
   Sunyani, Bono Region, Ghana
   ===================================================== */

/* ── Theme Toggle ──────────────────────────────────── */
const themeToggle   = document.getElementById('theme-toggle');
const themeIcon     = document.getElementById('theme-icon');
const savedTheme    = localStorage.getItem('theme') || 'light';

document.documentElement.setAttribute('data-theme', savedTheme);
if (themeIcon) themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  if (themeIcon) themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
});

/* ── Loader ────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 700);
  }
});

/* ── Navbar ────────────────────────────────────────── */
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.btn-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  const btt = document.getElementById('back-to-top');
  if (btt) btt.classList.toggle('visible', window.scrollY > 400);
});

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu?.classList.toggle('open');
});

// Active nav link
const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
navLinks.forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

/* ── Back to Top ───────────────────────────────────── */
document.getElementById('back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Scroll Reveal ─────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Toast Notifications ───────────────────────────── */
function showToast(message, icon = '🧁') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ── Cart System ───────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('gcb_cart') || '[]');

function saveCart() {
  localStorage.setItem('gcb_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const counts = document.querySelectorAll('.cart-count');
  const total  = cart.reduce((s, i) => s + i.qty, 0);
  counts.forEach(el => {
    el.textContent = total;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 200);
  });
  renderCartDrawer();
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  showToast(`<strong>${product.name}</strong> added to cart!`, '🛒');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function renderCartDrawer() {
  const body  = document.getElementById('cart-items');
  const total = document.getElementById('cart-total');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty"><span>🛒</span>Your cart is empty.<br>Start adding some treats!</div>`;
  } else {
    body.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">GHS ${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="btn-qty" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  if (total) {
    const sum = cart.reduce((s, i) => s + i.price * i.qty, 0);
    total.textContent = `GHS ${sum.toFixed(2)}`;
  }
}

// Cart Drawer toggle
document.getElementById('cart-btn')?.addEventListener('click', openCart);
document.getElementById('cart-btn-mobile')?.addEventListener('click', openCart);
document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
document.getElementById('btn-close-cart')?.addEventListener('click', closeCart);

function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
}
function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

// Init cart on page load
updateCartUI();

/* ── Review System ─────────────────────────────────── */
let reviews = JSON.parse(localStorage.getItem('gcb_reviews') || '[]');
let currentReviewProduct = null;
let selectedRating = 0;

function openReviewModal(productId, productName) {
  currentReviewProduct = productId;
  const modal = document.getElementById('review-modal');
  const title = document.getElementById('review-product-name');
  if (title) title.textContent = productName;
  if (modal) modal.classList.add('open');
  selectedRating = 0;
  renderStars(0);
  document.getElementById('review-form')?.reset();
}

function closeReviewModal() {
  document.getElementById('review-modal')?.classList.remove('open');
  currentReviewProduct = null;
}

document.getElementById('btn-close-modal')?.addEventListener('click', closeReviewModal);
document.getElementById('review-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeReviewModal();
});

function renderStars(rating) {
  document.querySelectorAll('.star-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i < rating);
  });
}

document.querySelectorAll('.star-btn').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    selectedRating = i + 1;
    renderStars(selectedRating);
  });
  btn.addEventListener('mouseenter', () => renderStars(i + 1));
  btn.addEventListener('mouseleave',  () => renderStars(selectedRating));
});

document.getElementById('review-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!selectedRating) { showToast('Please select a star rating.', '⭐'); return; }
  const name    = document.getElementById('reviewer-name').value.trim();
  const comment = document.getElementById('reviewer-comment').value.trim();
  if (!name || !comment) return;

  const review = {
    id: Date.now(),
    productId: currentReviewProduct,
    name, comment,
    rating: selectedRating,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };
  reviews.unshift(review);
  localStorage.setItem('gcb_reviews', JSON.stringify(reviews));
  closeReviewModal();
  showToast('Thank you for your review! 🌟', '🌟');
  renderReviews();
});

function renderReviews() {
  const container = document.getElementById('reviews-list');
  if (!container) return;
  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-family:var(--font-accent);font-style:italic;">No reviews yet. Be the first to share your experience!</p>';
    return;
  }
  container.innerHTML = reviews.slice(0, 6).map(r => `
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <p class="testimonial-text">${r.comment}</p>
      <div class="testimonial-author">
        <div>
          <div class="author-name">${r.name}</div>
          <div class="author-loc">${r.date} · ${r.productId ? 'Product Review' : 'General Review'}</div>
        </div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

renderReviews();

/* ── Contact Form ──────────────────────────────────── */
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  const fields = [
    { id: 'contact-name',    msg: 'Please enter your name.' },
    { id: 'contact-email',   msg: 'Please enter a valid email.' },
    { id: 'contact-message', msg: 'Please enter a message.' }
  ];

  fields.forEach(({ id, msg }) => {
    const group = document.getElementById(id)?.closest('.form-group');
    const val   = document.getElementById(id)?.value.trim();
    if (!val || (id === 'contact-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))) {
      group?.classList.add('error');
      group?.querySelector('.error-msg') && (group.querySelector('.error-msg').textContent = msg);
      valid = false;
    } else {
      group?.classList.remove('error');
    }
  });

  if (valid) {
    const success = document.getElementById('contact-success');
    if (success) success.classList.add('visible');
    e.target.reset();
    showToast('Message sent! We\'ll get back to you soon.', '📬');
    setTimeout(() => success?.classList.remove('visible'), 6000);
  }
});

document.querySelectorAll('#contact-name, #contact-email, #contact-message').forEach(el => {
  el.addEventListener('input', () => el.closest('.form-group')?.classList.remove('error'));
});
