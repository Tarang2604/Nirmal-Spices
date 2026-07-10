/**
 * Nirmal's Spices – Main Application JavaScript
 * Handles: Cart, Wishlist, Search, Animations, UI Interactions
 */

'use strict';

// ============================================================
// PRODUCT DATA
// ============================================================
const PRODUCTS = [
  { id: 1,  name: 'Jaljeera Masala',             slug: 'jaljeera-masala',             category: 'blend-spices',   price: 50,  mrp: 64,  weight: '100g', rating: 4.7, reviews: 142, badge: 'new',        img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/b60f1a2a8f5a2e3d1ca7d1db3f874d76.png', desc: 'Refreshing Jaljeera blend perfect for summer drinks and chaats. Made with cumin, black pepper, dry mango powder and cooling spices.' },
  { id: 2,  name: 'Idli Mix',                    slug: 'idli-mix',                    category: 'instant-mix',    price: 80,  mrp: 112, weight: '500g', rating: 4.8, reviews: 96,  badge: 'new',        img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/73f009dd1f0decf8e8069e2f28dbbdce.png', desc: 'Instant Idli Mix for fluffy, soft idlis every time. Made from quality rice and urad dal. Ready in minutes, perfect for breakfast.' },
  { id: 3,  name: 'Gulab Jamun Instant Mix',     slug: 'gulab-jamun-instant-mix',     category: 'instant-mix',    price: 250, mrp: 450, weight: '500g', rating: 4.9, reviews: 203, badge: 'hot',        img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/571f0ca02fc89608fe2021266429dd15.png', desc: 'Make restaurant-quality Gulab Jamun at home with our premium instant mix. Soft, spongy, and melt-in-mouth guaranteed.' },
  { id: 4,  name: 'Garam Masala Powder',         slug: 'garam-masala-powder',         category: 'blend-spices',   price: 9,   mrp: 10,  weight: '10g',  rating: 4.6, reviews: 315, badge: 'bestseller', img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/b0d1bfd52a15e987f3d1c4197197cb32.png', desc: 'Aromatic Garam Masala powder with perfect blend of cinnamon, cardamom, cloves, and other warming spices. Essential for Indian cooking.' },
  { id: 5,  name: 'Dal Tadka Masala (100g)',     slug: 'dal-tadka-masala',            category: 'blend-spices',   price: 70,  mrp: 84,  weight: '100g', rating: 4.8, reviews: 178, badge: 'bestseller', img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/b936ce8b9d0beb80811bb9fa83dbd1a0.png', desc: 'Perfect blend for authentic dal tadka. Gives restaurant-style flavor to any dal with just a pinch.' },
  { id: 6,  name: 'Chicken Masala',              slug: 'chicken-masala',              category: 'blend-spices',   price: 80,  mrp: 96,  weight: '100g', rating: 4.9, reviews: 238, badge: 'bestseller', img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/b486b7b4c7f8d6026543aff732e0114f.png', desc: 'Rich, flavorful Chicken Masala for the most delicious chicken curries. Balanced blend of over 15 spices.' },
  { id: 7,  name: 'Chana Masala',                slug: 'chana-masala',                category: 'blend-spices',   price: 60,  mrp: 76,  weight: '100g', rating: 4.7, reviews: 156, badge: null,         img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/4b635cca3058b810858630eb1f6baba7.png', desc: 'Authentic Chana Masala blend for tangy, flavorful chole. Perfect balance of amchur, pomegranate, and aromatic spices.' },
  { id: 8,  name: 'Biryani Masala',              slug: 'biryani-masala',              category: 'blend-spices',   price: 80,  mrp: 96,  weight: '100g', rating: 4.9, reviews: 289, badge: 'hot',        img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/ec0a81b0c9742fa370c0161ed8506208.png', desc: 'Complete Biryani Masala with saffron notes for an aromatic, restaurant-style biryani every time.' },
  { id: 9,  name: 'Achar Masala Pouch',          slug: 'achar-masala-pouch',          category: 'blend-spices',   price: 120, mrp: 152, weight: '200g', rating: 4.6, reviews: 112, badge: null,         img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/be41fcbabc898f51afde67b5232918b0.png', desc: 'Traditional pickle masala with mustard, fenugreek, and kalonji. Makes perfectly spiced homemade achars.' },
  { id: 10, name: 'White Pepper Powder',         slug: 'white-pepper-powder',         category: 'ground-spices',  price: 220, mrp: 320, weight: '100g', rating: 4.8, reviews: 87,  badge: 'featured',   img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/d60051351c445a60b8039507de247546.png', desc: 'Premium White Pepper Powder with a mild, refined heat. Perfect for white sauces, soups, and continental dishes.' },
  { id: 11, name: 'Souf / Fennel Seeds',         slug: 'souf-whole-spices',           category: 'whole-spices',   price: 120, mrp: 150, weight: '200g', rating: 4.7, reviews: 134, badge: 'featured',   img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/182a1856076599dde3a082a026d9943f.png', desc: 'Fresh, fragrant Fennel Seeds (Souf) with sweet licorice flavor. Used in cooking and as digestive after meals.' },
  { id: 12, name: 'Sendha Namak (1 Kg)',         slug: 'sendha-namak',                category: 'salts',          price: 60,  mrp: 150, weight: '1 Kg', rating: 4.9, reviews: 201, badge: 'hot',        img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/5f1d2d6c73f62eec2565036041fef956.png', desc: 'Pure Rock Salt (Sendha Namak) ideal for fasting days and everyday use. Rich in minerals, chemical-free.' },
  { id: 13, name: 'Sabji Masala (100g)',         slug: 'sabji-masala',                category: 'blend-spices',   price: 70,  mrp: 84,  weight: '100g', rating: 4.7, reviews: 167, badge: null,         img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/7f57407352c51cd90ed359a85aaf5cb5.png', desc: 'All-in-one Sabji Masala for any vegetable dish. Saves time while delivering authentic homemade flavors.' },
  { id: 14, name: 'Paneer Masala',               slug: 'paneer-masala',               category: 'blend-spices',   price: 80,  mrp: 96,  weight: '100g', rating: 4.8, reviews: 145, badge: null,         img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/b486b7b4c7f8d6026543aff732e0114f.png', desc: 'Rich and creamy Paneer Masala blend for silky, flavorful paneer curries that rival restaurant dishes.' },
  { id: 15, name: 'Turmeric Powder (200g)',      slug: 'turmeric-powder',             category: 'ground-spices',  price: 65,  mrp: 80,  weight: '200g', rating: 4.9, reviews: 312, badge: 'bestseller', img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/9a4e37aaa0230393899e7ca28d4ff971.png', desc: 'Pure Haldi (Turmeric) powder with high curcumin content. Vibrant golden color and earthy flavor. Certified pure.' },
  { id: 16, name: 'Red Chili Powder (200g)',     slug: 'red-chili-powder',            category: 'ground-spices',  price: 75,  mrp: 90,  weight: '200g', rating: 4.8, reviews: 278, badge: 'bestseller', img: 'https://nirmalspices.in/admin/images/media_gallery/thumb/b0d1bfd52a15e987f3d1c4197197cb32.png', desc: 'Fiery Red Chili Powder made from premium Harda-region chilies. Deep red color with balanced heat and pungency.' },
];

const CATEGORY_LABELS = {
  'ground-spices': 'Ground Spices',
  'blend-spices':  'Blend Spices',
  'whole-spices':  'Whole Spices',
  'instant-mix':   'Instant Mix',
  'salts':         'Salts',
  'flour':         'Flour',
};

// ============================================================
// STATE
// ============================================================
let cart     = JSON.parse(localStorage.getItem('nirmal_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('nirmal_wishlist') || '[]');
let currentTab = 'all';
let activeQuickView = null;
const COUPON_CODES = { 'NIRMAL20': 20, 'FIRST10': 10, 'HARDA15': 15 };

// ============================================================
// PERSISTENCE
// ============================================================
function saveCart()     { localStorage.setItem('nirmal_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('nirmal_wishlist', JSON.stringify(wishlist)); }

// ============================================================
// TOAST SYSTEM
// ============================================================
function showToast(msg, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ============================================================
// CART
// ============================================================
function getCartItem(id) { return cart.find(i => i.id === id); }

function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = getCartItem(productId);
  if (existing) {
    if (existing.qty >= 10) { showToast('Maximum quantity reached!', 'info'); return; }
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart! 🛒`, 'success');
}

function removeFromCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
  if (product) showToast(`${product.name} removed from cart`, 'info');
}

function updateCartQty(productId, delta) {
  const item = getCartItem(productId);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) { removeFromCart(productId); return; }
  if (newQty > 10) { showToast('Maximum 10 units per item', 'info'); return; }
  item.qty = newQty;
  saveCart();
  updateCartUI();
}

function getCartTotal() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery  = subtotal >= 499 ? 0 : 40;
  return { subtotal, delivery, total: subtotal + delivery };
}

function getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

function updateCartUI() {
  const count = getCartCount();

  // Badges
  ['cartBadge', 'cartItemCount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
  });

  // Cart items
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');

  if (!itemsEl) return;

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'block';

  // Re-render cart items
  const existingItems = itemsEl.querySelectorAll('.cart-item');
  existingItems.forEach(el => el.remove());

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.setAttribute('role', 'listitem');
    el.dataset.id = item.id;
    el.innerHTML = `
      <img src="${item.img}" class="cart-item-img" alt="${item.name}" loading="lazy" width="72" height="72">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.weight} · ${CATEGORY_LABELS[item.category] || 'Spice'}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
      <div class="cart-item-controls">
        <div class="qty-control" aria-label="Quantity control for ${item.name}">
          <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-value" aria-label="${item.qty} items">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name} from cart">
          <i class="ri-delete-bin-line" aria-hidden="true"></i> Remove
        </button>
      </div>
    `;
    itemsEl.appendChild(el);
  });

  // Update totals
  const { subtotal, delivery, total } = getCartTotal();
  const subtotalEl  = document.getElementById('cartSubtotal');
  const deliveryEl  = document.getElementById('cartDelivery');
  const totalEl     = document.getElementById('cartTotal');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (deliveryEl) deliveryEl.textContent = delivery === 0 ? '🎉 FREE' : `₹${delivery}`;
  if (totalEl)    totalEl.textContent    = `₹${total.toLocaleString('en-IN')}`;

  // Wishlist badge
  const wishBadge = document.getElementById('wishlistBadge');
  if (wishBadge) {
    wishBadge.textContent = wishlist.length;
    wishBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

// ============================================================
// CART SIDEBAR
// ============================================================
function openCart() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  if (overlay) { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); }
  if (sidebar) { sidebar.classList.add('open'); sidebar.setAttribute('aria-hidden', 'false'); }
  document.body.classList.add('no-scroll');
}

function closeCart() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  if (overlay) { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
  if (sidebar) { sidebar.classList.remove('open'); sidebar.setAttribute('aria-hidden', 'true'); }
  document.body.classList.remove('no-scroll');
}

// Coupon
let appliedCoupon = null;
function applyCoupon() {
  const input = document.getElementById('couponInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  const discount = COUPON_CODES[code];
  if (!discount) { showToast('Invalid coupon code!', 'error'); return; }
  appliedCoupon = { code, discount };
  input.value = '';
  showToast(`Coupon ${code} applied! ${discount}% off!`, 'success');
  updateCartUI();
}

// ============================================================
// WISHLIST
// ============================================================
function toggleWishlist(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const idx = wishlist.findIndex(i => i.id === productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast(`Removed from wishlist`, 'info');
  } else {
    if (product) wishlist.push(product);
    showToast(`${product?.name} added to wishlist ❤️`, 'success');
  }
  saveWishlist();
  updateCartUI();
  // Update wishlist buttons
  document.querySelectorAll(`[data-wishlist="${productId}"]`).forEach(btn => {
    btn.classList.toggle('active', wishlist.some(i => i.id === productId));
    btn.setAttribute('aria-pressed', wishlist.some(i => i.id === productId));
  });
}

function isInWishlist(id) { return wishlist.some(i => i.id === id); }

// ============================================================
// PRODUCT RENDERING
// ============================================================
function getBadgeHtml(badge) {
  if (!badge) return '';
  const labels = { new: 'New', hot: '🔥 Hot', bestseller: '⭐ Best', featured: 'Featured', sale: 'Sale' };
  return `<span class="badge badge-${badge}">${labels[badge] || badge}</span>`;
}

function getDiscountPct(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round((1 - price / mrp) * 100);
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function createProductCard(product) {
  const discount = getDiscountPct(product.price, product.mrp);
  const inWish   = isInWishlist(product.id);

  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('aria-label', `${product.name}, ₹${product.price}`);

  card.innerHTML = `
    <div class="product-badges" aria-hidden="true">${getBadgeHtml(product.badge)}</div>

    <button class="product-wishlist ${inWish ? 'active' : ''}"
            data-wishlist="${product.id}"
            onclick="toggleWishlist(${product.id})"
            aria-label="${inWish ? 'Remove from wishlist' : 'Add to wishlist'}: ${product.name}"
            aria-pressed="${inWish}">
      <i class="${inWish ? 'ri-heart-fill' : 'ri-heart-line'}" aria-hidden="true"></i>
    </button>

    <div class="product-img-wrap" onclick="openQuickView(${product.id})">
      <img src="${product.img}"
           alt="${product.name}"
           loading="lazy"
           width="300" height="300">
      <span class="product-quick-view" aria-hidden="true">
        <i class="ri-eye-line"></i> Quick View
      </span>
    </div>

    <div class="product-info">
      <div class="product-category">${CATEGORY_LABELS[product.category] || 'Spice'}</div>
      <h3 class="product-name">
        <a href="product.html?slug=${product.slug}">${product.name}</a>
      </h3>
      <div class="product-meta">
        <span class="product-weight">${product.weight}</span>
        <div class="product-rating" aria-label="${product.rating} out of 5 stars, ${product.reviews} reviews">
          <span class="stars" aria-hidden="true">${renderStars(product.rating)}</span>
          <span class="rating-count">(${product.reviews})</span>
        </div>
      </div>
      <div class="product-price-row">
        <span class="price-current" aria-label="Price ₹${product.price}">₹${product.price}</span>
        ${product.mrp > product.price ? `<span class="price-original" aria-label="Original price ₹${product.mrp}">₹${product.mrp}</span>` : ''}
        ${discount > 0 ? `<span class="price-off" aria-label="${discount}% off">${discount}% off</span>` : ''}
      </div>
      <button class="product-add-btn"
              id="add-btn-${product.id}"
              onclick="handleAddToCart(${product.id})"
              aria-label="Add ${product.name} to cart">
        <i class="ri-shopping-bag-3-line" aria-hidden="true"></i> Add to Cart
      </button>
    </div>
  `;

  return card;
}

function handleAddToCart(productId) {
  addToCart(productId);
  const btn = document.getElementById(`add-btn-${productId}`);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '<i class="ri-check-line"></i> Added!';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '<i class="ri-shopping-bag-3-line"></i> Add to Cart';
    }, 1800);
  }
}

// ============================================================
// PRODUCT GRIDS
// ============================================================
function renderProductsGrid(containerId, filterFn, limit = 8) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const filtered = PRODUCTS.filter(filterFn).slice(0, limit);
  filtered.forEach((p, i) => {
    const card = createProductCard(p);
    card.classList.add('animate-on-scroll', `delay-${(i % 4) + 1}`);
    container.appendChild(card);
  });

  observeAnimations();
}

function filterByTab(tab) {
  if (tab === 'all') return () => true;
  if (tab === 'new') return p => p.badge === 'new';
  if (tab === 'featured') return p => p.badge === 'featured';
  if (tab === 'bestseller') return p => p.badge === 'bestseller';
  return () => true;
}

function initProductGrids() {
  renderProductsGrid('productsGrid', filterByTab(currentTab), 8);
  renderProductsGrid('bestSellersGrid', p => p.badge === 'bestseller', 4);
}

// ============================================================
// QUICK VIEW MODAL
// ============================================================
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  activeQuickView = productId;

  const modal  = document.getElementById('quickViewModal');
  const imgEl  = document.getElementById('modalProductImg');
  const infoEl = document.getElementById('modalProductInfo');

  if (!modal || !imgEl || !infoEl) return;

  const discount = getDiscountPct(product.price, product.mrp);
  const inWish   = isInWishlist(productId);

  imgEl.src = product.img;
  imgEl.alt = product.name;

  infoEl.innerHTML = `
    <div class="product-detail-category">${CATEGORY_LABELS[product.category] || 'Spice'}</div>
    <h2 class="product-name" style="font-size:1.5rem;margin-bottom:var(--space-md)">${product.name}</h2>
    <div class="product-detail-rating">
      <span class="stars" style="font-size:1.1rem;color:var(--saffron-light)" aria-label="${product.rating} stars">${renderStars(product.rating)}</span>
      <span style="font-size:0.85rem;color:var(--muted)">${product.rating} · ${product.reviews} reviews</span>
    </div>
    <div class="product-detail-price">
      <span class="price-current">₹${product.price}</span>
      ${product.mrp > product.price ? `<span class="price-original">₹${product.mrp}</span>` : ''}
      ${discount > 0 ? `<span class="price-off">${discount}% off</span>` : ''}
    </div>
    <p class="modal-product-desc">${product.desc}</p>
    <div class="product-trust-badges" style="margin-bottom:var(--space-lg)">
      <div class="trust-badge-item"><span class="icon">✅</span> 100% Pure</div>
      <div class="trust-badge-item"><span class="icon">✅</span> No Additives</div>
      <div class="trust-badge-item"><span class="icon">✅</span> Free Delivery ₹499+</div>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-primary" style="flex:1" onclick="addToCart(${product.id});closeQuickView()">
        <i class="ri-shopping-bag-3-line"></i> Add to Cart
      </button>
      <a href="product.html?slug=${product.slug}" class="btn btn-secondary">
        View Details
      </a>
    </div>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  document.body.classList.remove('no-scroll');
  activeQuickView = null;
}

// ============================================================
// SEARCH
// ============================================================
function handleSearch(query) {
  const dropdown = document.getElementById('searchDropdown');
  if (!dropdown) return;

  query = query.trim().toLowerCase();
  if (!query) { dropdown.classList.remove('open'); return; }

  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.replace('-', ' ').includes(query) ||
    p.desc.toLowerCase().includes(query)
  ).slice(0, 6);

  if (results.length === 0) {
    dropdown.innerHTML = '<div style="padding:16px;text-align:center;color:var(--muted);font-size:0.875rem">No spices found for "<strong>' + query + '"</strong></div>';
    dropdown.classList.add('open');
    return;
  }

  dropdown.innerHTML = results.map(p => `
    <div class="search-result-item" onclick="window.location.href='product.html?slug=${p.slug}'" role="option">
      <img src="${p.img}" class="search-result-img" alt="${p.name}" width="48" height="48" loading="lazy">
      <div class="search-result-info">
        <strong>${p.name}</strong>
        <span>₹${p.price} &nbsp;·&nbsp; ${p.weight}</span>
      </div>
    </div>
  `).join('');

  dropdown.classList.add('open');
}

// ============================================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================================
function observeAnimations() {
  const items = document.querySelectorAll('.animate-on-scroll');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

// ============================================================
// HERO PARTICLES
// ============================================================
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const spices = ['🌶️', '🧂', '🌿', '✨', '⭐', '🍂'];
  const colors = ['#E74C3C', '#E67E22', '#F39C12', '#D4AC0D'];

  for (let i = 0; i < 18; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 6 + 3}px;
      height: ${Math.random() * 6 + 3}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(particle);
  }
}

// ============================================================
// MOBILE NAV
// ============================================================
function openMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) { nav.classList.add('open'); document.body.classList.add('no-scroll'); }
  const toggle = document.getElementById('mobileMenuToggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
}

function closeMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) { nav.classList.remove('open'); document.body.classList.remove('no-scroll'); }
  const toggle = document.getElementById('mobileMenuToggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

// ============================================================
// SCROLL EFFECTS
// ============================================================
function handleScroll() {
  const header   = document.getElementById('header');
  const backTop  = document.getElementById('backToTop');

  if (header)  header.classList.toggle('scrolled', window.scrollY > 50);
  if (backTop) {
    backTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
  }
}

// ============================================================
// COUPON COPY
// ============================================================
function copyCoupon() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText('NIRMAL20').then(() => {
      showToast('Coupon code NIRMAL20 copied! 🎉', 'success');
    });
  } else {
    showToast('Use code NIRMAL20 for 20% off!', 'info');
  }
}

// ============================================================
// NEWSLETTER
// ============================================================
function handleNewsletter(e) {
  e.preventDefault();
  const emailEl = document.getElementById('newsletterEmail');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  if (!email) return;

  // Simulate API call
  emailEl.value = '';
  showToast(`You're subscribed! Welcome to Nirmal's family 🌶️`, 'success', 4000);
}

// ============================================================
// PRODUCT TAB SWITCHING
// ============================================================
function initProductTabs() {
  document.querySelectorAll('.product-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      document.querySelectorAll('.product-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      renderProductsGrid('productsGrid', filterByTab(currentTab), 8);
    });
  });
}

// ============================================================
// KEYBOARD ACCESSIBILITY
// ============================================================
function initKeyboardNav() {
  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeQuickView();
      closeMobileNav();
      const dropdown = document.getElementById('searchDropdown');
      if (dropdown) dropdown.classList.remove('open');
    }
  });

  // Category cards keyboard
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  initHeroParticles();
  initProductGrids();
  initProductTabs();
  initKeyboardNav();
  observeAnimations();
  updateCartUI();

  // Event: Cart Toggle
  const cartToggle  = document.getElementById('cartToggle');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartToggle)  cartToggle.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Event: Modal Close
  const modalClose   = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('quickViewModal');
  if (modalClose)   modalClose.addEventListener('click', closeQuickView);
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeQuickView();
  });

  // Event: Mobile Nav
  const menuToggle   = document.getElementById('mobileMenuToggle');
  const navClose     = document.getElementById('mobileNavClose');
  const navOverlay   = document.getElementById('mobileNavOverlay');
  if (menuToggle)  menuToggle.addEventListener('click', openMobileNav);
  if (navClose)    navClose.addEventListener('click', closeMobileNav);
  if (navOverlay)  navOverlay.addEventListener('click', closeMobileNav);

  // Event: Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => handleSearch(e.target.value), 250);
    });
    searchInput.addEventListener('focus', (e) => {
      if (e.target.value) handleSearch(e.target.value);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search')) {
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) dropdown.classList.remove('open');
      }
    });
  }

  // Event: Scroll
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Event: Back to Top
  const backTop = document.getElementById('backToTop');
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ARIA: cart badge aria-label update
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    const obs = new MutationObserver(() => {
      const cartToggleBtn = document.getElementById('cartToggle');
      if (cartToggleBtn) cartToggleBtn.setAttribute('aria-label', `Shopping cart (${cartBadge.textContent} items)`);
    });
    obs.observe(cartBadge, { childList: true });
  }
});

// Expose functions globally for inline handlers
window.addToCart       = addToCart;
window.handleAddToCart = handleAddToCart;
window.removeFromCart  = removeFromCart;
window.updateCartQty   = updateCartQty;
window.toggleWishlist  = toggleWishlist;
window.openQuickView   = openQuickView;
window.closeQuickView  = closeQuickView;
window.openCart        = openCart;
window.closeCart       = closeCart;
window.applyCoupon     = applyCoupon;
window.copyCoupon      = copyCoupon;
window.handleNewsletter = handleNewsletter;
window.showToast       = showToast;
window.PRODUCTS        = PRODUCTS;
window.CATEGORY_LABELS = CATEGORY_LABELS;
