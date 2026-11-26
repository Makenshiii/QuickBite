const products = [
  {
    id: "chicken-rice",
    name: "Sunny chicken rice",
    description: "Herby rice, crispy chicken, bright greens",
    category: "Meals",
    price: 129,
    rating: "4.9",
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "avocado-toast",
    name: "Green goddess toast",
    description: "Smashed avo, chili flakes, sourdough",
    category: "Snacks",
    price: 99,
    rating: "4.8",
    badge: "LOCAL FAVE",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "iced-matcha",
    name: "Iced matcha cloud",
    description: "Ceremonial matcha, oat milk, a little honey",
    category: "Drinks",
    price: 75,
    rating: "4.9",
    badge: "FEEL-GOOD",
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "berry-pancakes",
    name: "Berry brunch stack",
    description: "Fluffy pancakes, berries, maple drizzle",
    category: "Desserts",
    price: 145,
    rating: "5.0",
    badge: "SWEET PICK",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "salmon-bowl",
    name: "Sesame salmon bowl",
    description: "Glazed salmon, greens, sesame rice",
    category: "Meals",
    price: 189,
    rating: "4.9",
    badge: "FRESH PICK",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "croissant",
    name: "Butter me up croissant",
    description: "Golden, flaky, baked this morning",
    category: "Snacks",
    price: 65,
    rating: "4.8",
    badge: "BAKED TODAY",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "lemonade",
    name: "Sunny side lemonade",
    description: "Fresh lemon, a hint of mint, lots of ice",
    category: "Drinks",
    price: 55,
    rating: "4.7",
    badge: "FAN FAVORITE",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "chocolate-cake",
    name: "Midnight chocolate cake",
    description: "Rich cocoa, soft crumb, zero regrets",
    category: "Desserts",
    price: 89,
    rating: "4.9",
    badge: "TREAT YOURSELF",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
  }
];

const cart = new Map();
const favorites = new Set();
const deliveryFee = 25;
const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#menu-search");
const emptyState = document.querySelector("#empty-state");
const overlay = document.querySelector("#cart-overlay");
const cartContent = document.querySelector("#cart-content");
const cartFooter = document.querySelector("#cart-footer");
const toast = document.querySelector("#toast");
let selectedCategory = "All";
let toastTimer;
let checkoutMode = false;

const formatPrice = amount => `₱${amount}`;

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge">${product.badge}</span>
        <button class="favorite-button${favorites.has(product.id) ? " liked" : ""}" type="button" data-favorite="${product.id}" aria-label="${favorites.has(product.id) ? "Remove from" : "Add to"} favorites" aria-pressed="${favorites.has(product.id)}">♡</button>
      </div>
      <div class="product-info">
        <div class="product-topline"><h4 class="product-name">${product.name}</h4><span class="product-rating"><span>★</span> ${product.rating}</span></div>
        <p class="product-description">${product.description}</p>
        <div class="product-bottom"><span class="product-price">${formatPrice(product.price)} <small>• ${product.category}</small></span><button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">+</button></div>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visibleProducts.length > 0;
  grid.hidden = visibleProducts.length === 0;
}

function cartQuantity() {
  return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
}

function cartSubtotal() {
  return [...cart.entries()].reduce((sum, [id, quantity]) => {
    const product = products.find(item => item.id === id);
    return sum + product.price * quantity;
  }, 0);
}

function updateCartBadges() {
  document.querySelectorAll("[data-cart-count]").forEach(badge => {
    badge.textContent = cartQuantity();
  });
}

function renderCart() {
  const entries = [...cart.entries()];
  if (!entries.length) {
    cartContent.innerHTML = `<div class="empty-cart"><span class="empty-cart-icon">🥡</span><h3>Your cart's taking a nap</h3><p>Let's find something delicious to wake it up.</p><button class="button button-dark" type="button" data-browse-menu>Explore the menu <span aria-hidden="true">↗</span></button></div>`;
    cartFooter.innerHTML = "";
    updateCartBadges();
    return;
  }

  cartContent.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    return `<div class="cart-line">
      <img src="${product.image}" alt="">
      <div class="cart-line-info"><strong>${product.name}</strong><small>${formatPrice(product.price)} each</small></div>
      <div class="quantity-control" aria-label="Quantity for ${product.name}">
        <button type="button" data-quantity="${id}" data-change="-1" aria-label="Remove one ${product.name}">−</button>
        <span>${quantity}</span>
        <button type="button" data-quantity="${id}" data-change="1" aria-label="Add one ${product.name}">+</button>
      </div>
    </div>`;
  }).join("");

  const subtotal = cartSubtotal();
  const fee = subtotal > 0 ? deliveryFee : 0;
  cartFooter.innerHTML = `<div class="cart-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
    <div class="cart-row"><span>Delivery fee</span><strong>${formatPrice(fee)}</strong></div>
    <div class="cart-row total"><span>Total</span><span>${formatPrice(subtotal + fee)}</span></div>
    <button class="button button-dark checkout-button" type="button" data-checkout>Continue to checkout <span aria-hidden="true">→</span></button>
    <p class="checkout-note">Delivery estimate: 25–35 min · No surprise fees</p>`;
  updateCartBadges();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function openCart() {
  checkoutMode = false;
  renderCart();
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.querySelector(".close-button").focus();
}

function closeCart() {
  overlay.hidden = true;
  document.body.style.overflow = "";
  checkoutMode = false;
}

function renderCheckout() {
  checkoutMode = true;
  cartContent.innerHTML = `<form class="checkout-form" id="checkout-form">
    <h3>Almost there — delivery details</h3>
    <div class="form-field"><label for="delivery-address">Delivery address</label><input id="delivery-address" name="address" type="text" placeholder="Street, building, apartment" required autocomplete="street-address"></div>
    <div class="form-field"><label for="delivery-name">Name for your order</label><input id="delivery-name" name="name" type="text" placeholder="Your name" required autocomplete="name"></div>
    <div class="form-field"><label for="delivery-phone">Phone number</label><input id="delivery-phone" name="phone" type="tel" placeholder="09xx xxx xxxx" required autocomplete="tel"></div>
    <fieldset class="payment-options" style="border:0;padding:0;margin:0">
      <legend class="payment-title" style="padding:0 0 8px">How would you like to pay?</legend>
      <label class="payment-option"><input type="radio" name="payment" value="Cash on delivery" checked> Cash on delivery</label>
      <label class="payment-option"><input type="radio" name="payment" value="E-wallet"> E-wallet</label>
    </fieldset>
  </form>`;
  renderCartFooter();
  cartContent.scrollTop = 0;
}

function renderCartFooter() {
  const subtotal = cartSubtotal();
  cartFooter.innerHTML = `<div class="cart-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
    <div class="cart-row"><span>Delivery fee</span><strong>${formatPrice(deliveryFee)}</strong></div>
    <div class="cart-row total"><span>Total</span><span>${formatPrice(subtotal + deliveryFee)}</span></div>
    <button class="button button-dark checkout-button" type="submit" form="checkout-form">Place my order <span aria-hidden="true">→</span></button>
    <p class="checkout-note">Your order will arrive in about 25–35 min</p>`;
}

function showOrderConfirmation(orderNumber, firstName) {
  cartContent.innerHTML = `<div class="order-success"><span class="success-mark">✓</span><h3>It's on its way, ${firstName}!</h3><p>Your order is in good hands. We'll keep you posted as it makes its way to your door.</p><div class="order-number">ORDER ${orderNumber}</div><button class="button button-dark" type="button" data-finish-order>Back to browsing <span aria-hidden="true">↗</span></button></div>`;
  cartFooter.innerHTML = "";
  cart.clear();
  updateCartBadges();
}

grid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) {
    const id = addButton.dataset.add;
    cart.set(id, (cart.get(id) || 0) + 1);
    updateCartBadges();
    showToast(`${products.find(product => product.id === id).name} added to your cart`);
  }
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    renderProducts();
  }
});

document.querySelector(".category-row").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach(chip => chip.classList.toggle("active", chip === button));
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
document.querySelector("[data-focus-search]").addEventListener("click", () => {
  document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => searchInput.focus(), 350);
});
document.querySelector("[data-menu-toggle]").addEventListener("click", event => {
  const isExpanded = event.currentTarget.getAttribute("aria-expanded") === "true";
  event.currentTarget.setAttribute("aria-expanded", String(!isExpanded));
  event.currentTarget.setAttribute("aria-label", isExpanded ? "Open menu" : "Close menu");
  document.querySelector(".main-nav").classList.toggle("is-open", !isExpanded);
});
document.querySelector(".main-nav").addEventListener("click", event => {
  if (!event.target.closest("a")) return;
  document.querySelector(".main-nav").classList.remove("is-open");
  document.querySelector("[data-menu-toggle]").setAttribute("aria-expanded", "false");
  document.querySelector("[data-menu-toggle]").setAttribute("aria-label", "Open menu");
});
document.querySelector("[data-show-all]").addEventListener("click", () => {
  selectedCategory = "All";
  document.querySelectorAll("[data-category]").forEach(chip => chip.classList.toggle("active", chip.dataset.category === "All"));
  searchInput.value = "";
  renderProducts();
});
document.querySelector("[data-promo]").addEventListener("click", () => {
  if (!navigator.clipboard) {
    showToast("Use code FIRSTBITE for 20% off your first order");
    return;
  }
  navigator.clipboard.writeText("FIRSTBITE")
    .then(() => showToast("Code FIRSTBITE copied — enjoy 20% off!"))
    .catch(() => showToast("Use code FIRSTBITE for 20% off your first order"));
});
document.querySelector("[data-open-cart]").addEventListener("click", openCart);
overlay.addEventListener("click", event => {
  if (event.target.closest("[data-close-cart]")) closeCart();
  if (event.target.closest("[data-browse-menu]")) {
    closeCart();
    document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
  }
  if (event.target.closest("[data-finish-order]")) {
    closeCart();
    showToast("Thanks for choosing QuickBite!");
  }
});
overlay.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    const id = quantityButton.dataset.quantity;
    const nextQuantity = (cart.get(id) || 0) + Number(quantityButton.dataset.change);
    if (nextQuantity <= 0) cart.delete(id);
    else cart.set(id, nextQuantity);
    renderCart();
    return;
  }
  if (event.target.closest("[data-checkout]")) {
    renderCheckout();
    return;
  }
});
overlay.addEventListener("submit", event => {
  if (event.target.id !== "checkout-form") return;
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  const name = new FormData(event.target).get("name").trim().split(/\s+/)[0];
  const orderNumber = `QB${Math.floor(100000 + Math.random() * 900000)}`;
  showOrderConfirmation(orderNumber, name);
});
document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchInput.focus(), 350);
  }
  if (event.key === "Escape" && !overlay.hidden) closeCart();
});

renderProducts();
updateCartBadges();
