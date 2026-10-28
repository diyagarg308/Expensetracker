import { useState, useMemo } from "react";
import { useApp } from "../context/useApp";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/common/Input";
import { sound } from "../utils/sound";

const SHOP_ITEMS = [
  {
    id: "item_shield",
    title: "Compound Interest Shield",
    category: "Buffs",
    price: 1499,
    icon: "🛡️",
    desc: "Adds +15% automatic defense against recurring subscription creep."
  },
  {
    id: "item_key",
    title: "Titan Vault Hardware Key",
    category: "Hardware",
    price: 4500,
    icon: "🗝️",
    desc: "Military-grade physical security key for offline ledger backup."
  },
  {
    id: "item_ai",
    title: "AI Tax Auditor Module",
    category: "Software",
    price: 2999,
    icon: "🤖",
    desc: "Autonomous invoice categorization and smart deduction finder."
  },
  {
    id: "item_coffee",
    title: "Frugal Coffee Pass",
    category: "Buffs",
    price: 499,
    icon: "☕",
    desc: "Daily habit reminder buffer saving an estimated ₹1,200/mo."
  },
  {
    id: "item_armor",
    title: "Dragon Slayer Armor Pack",
    category: "Buffs",
    price: 3200,
    icon: "⚔️",
    desc: "Cosmetic avatar gear granting +500 XP in the Analytics arena."
  },
  {
    id: "item_scroll",
    title: "Infinite Guild Scroll",
    category: "Software",
    price: 799,
    icon: "📜",
    desc: "Unlimited ledger export rows with automated PDF & CSV reporting."
  }
];

export function Shop() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    openCart,
    closeCart,
    addToast
  } = useApp();

  const [activeCategory, setActiveCategory] = useState("All");
  const [promoCode, setPromoCode] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({ name: "", address: "", city: "", zip: "" });

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return SHOP_ITEMS;
    return SHOP_ITEMS.filter(i => i.category === activeCategory);
  }, [activeCategory]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === "SAVE10" || clean === "25CSE0203") {
      setDiscountPct(10);
      sound.playLevelUp();
      addToast("Promo Code Applied! 10% Discount unlocked 🎉");
    } else {
      sound.playHit();
      addToast("Invalid promo code. Try '25CSE0203' or 'SAVE10'", "warning");
    }
  };

  const discountAmount = Math.round(cartTotal * (discountPct / 100));
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!shippingForm.name || !shippingForm.address) {
      alert("Please provide required shipping details.");
      return;
    }
    sound.playLevelUp();
    clearCart();
    setIsCheckoutOpen(false);
    closeCart();
    addToast(`Order Confirmed! Armory loot dispatched to ${shippingForm.name}! 📦`);
  };

  function money(val) {
    return "₹" + Number(val || 0).toLocaleString("en-IN");
  }

  return (
    <div className="page shop-page">
      {/* Shop Header */}
      <div className="page-header game-header-bar">
        <div>
          <div className="eyebrow game-eyebrow">
            <span className="game-star">🛒</span>
            MINI PROJECT: CONTEXT API SHOPPING CART
          </div>
          <h1>Guild Armory & Financial Perks Store</h1>
          <p>Equip powerful financial perks, hardware shields, and automated software modules.</p>
        </div>

        <button className="cart-trigger-btn" onClick={openCart}>
          <span className="cart-btn-icon">🛒</span>
          <span>View Cart</span>
          <span className="cart-badge-count">{cartCount}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="shop-filter-bar">
        {["All", "Hardware", "Software", "Buffs"].map(cat => (
          <button
            key={cat}
            className={`shop-filter-chip ${activeCategory === cat ? "active" : ""}`}
            onClick={() => {
              setActiveCategory(cat);
              sound.playCoin();
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Catalog Grid */}
      <div className="shop-items-grid">
        {filteredItems.map(item => (
          <div className="shop-product-card" key={item.id}>
            <div className="product-top-row">
              <span className="product-cat-tag">{item.category}</span>
              <span className="product-icon-socket">{item.icon}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <div className="product-footer-row">
              <strong className="product-price">{money(item.price)}</strong>
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(item)}
              >
                <span>+ Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shopping Cart Drawer Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={closeCart}
        eyebrow="GLOBAL CONTEXT STATE"
        title={`Your Armory Cart (${cartCount} items)`}
      >
        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <span className="empty-cart-icon">🛒</span>
            <h4>Your cart is empty</h4>
            <p>Explore the Armory above to add financial perks and software modules.</p>
            <button className="secondary-btn" onClick={closeCart}>
              Browse Armory Catalog
            </button>
          </div>
        ) : (
          <div className="cart-drawer-content">
            <div className="cart-items-list">
              {cart.map(item => (
                <div className="cart-item-row" key={item.id}>
                  <div className="cart-item-left">
                    <span className="cart-item-emoji">{item.icon}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{money(item.price)} each</small>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <div className="cart-stepper">
                      <button onClick={() => updateCartQty(item.id, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)}>+</button>
                    </div>
                    <strong className="item-subtotal">{money(item.price * item.qty)}</strong>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="promo-code-box">
              <input
                type="text"
                placeholder="Promo Code (Try: 25CSE0203)"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
              <button type="submit">Apply</button>
            </form>

            {/* Cart Summary */}
            <div className="cart-totals-breakdown">
              <div className="cart-total-row">
                <span>Cart Subtotal</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              {discountPct > 0 && (
                <div className="cart-total-row text-green">
                  <span>Student Promo ({discountPct}%)</span>
                  <strong>−{money(discountAmount)}</strong>
                </div>
              )}
              <div className="cart-total-row final-total-row">
                <span>Final Balance</span>
                <strong className="text-purple">{money(finalTotal)}</strong>
              </div>
            </div>

            <div className="cart-actions-row">
              <button
                type="button"
                className="cart-checkout-btn"
                onClick={() => {
                  sound.playLevelUp();
                  setIsCheckoutOpen(true);
                }}
              >
                Proceed to Guild Checkout →
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        eyebrow="CHECKOUT ORDER CONFIRMATION"
        title="Complete Your Armory Order"
      >
        <form onSubmit={handleCheckoutSubmit}>
          <Input
            label="RECIPIENT NAME"
            name="name"
            placeholder="Guild Commander / Student"
            value={shippingForm.name}
            onChange={e => setShippingForm({ ...shippingForm, name: e.target.value })}
            required
          />

          <Input
            label="DISPATCH ADDRESS"
            name="address"
            placeholder="104 Engineering Block, Campus Ave"
            value={shippingForm.address}
            onChange={e => setShippingForm({ ...shippingForm, address: e.target.value })}
            required
          />

          <div className="form-row-grid">
            <Input
              label="CITY"
              name="city"
              placeholder="Bengaluru"
              value={shippingForm.city}
              onChange={e => setShippingForm({ ...shippingForm, city: e.target.value })}
              required
            />
            <Input
              label="POSTAL PINCODE"
              name="zip"
              placeholder="560001"
              value={shippingForm.zip}
              onChange={e => setShippingForm({ ...shippingForm, zip: e.target.value })}
              required
            />
          </div>

          <div className="checkout-summary-pill">
            <span>Total to Charge:</span>
            <strong>{money(finalTotal)}</strong>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              Authorize Payment & Dispatch 📦
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
