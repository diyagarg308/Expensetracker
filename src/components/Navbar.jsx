import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";

function Navbar() {
  const navigate = useNavigate();
  const {
    user,
    logout,
    theme,
    toggleTheme,
    transactions,
    resetDemoData,
    clearAllData,
    cartCount,
    openCart,
    openQuickAdd
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const email = user?.email || localStorage.getItem("userEmail") || "student@university.edu";
  const initial = email.charAt(0).toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="navbar-container">
      <nav className="navbar">
        {/* Brand Link */}
        <Link to="/" className="brand">
          <div className="brand-icon-wrapper">
            <span className="brand-icon">₹</span>
            <div className="brand-pulse"></div>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h2>ExpenseIQ</h2>
              <span className="pro-pill">SPA v2.5</span>
            </div>
            <span className="brand-subtitle">25CSE0203 Engineering Hub</span>
          </div>
        </Link>

        {/* Multi-Page SPA Navigation Links */}
        <div className="nav-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">🔮</span>
            <span>Transactions</span>
            {transactions.length > 0 && (
              <span className="nav-counter">{transactions.length}</span>
            )}
          </NavLink>

          <NavLink
            to="/budget"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">🛡️</span>
            <span>Budget</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">🎮</span>
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">🛒</span>
            <span>Armory Shop</span>
            {cartCount > 0 && (
              <span className="nav-counter cart-highlight">{cartCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/explorer"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">📡</span>
            <span>REST API</span>
          </NavLink>

          <NavLink
            to="/portfolio"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">🎓</span>
            <span>Portfolio</span>
          </NavLink>
        </div>

        {/* Right Action Icons */}
        <div className="nav-actions">
          {/* Quick Add Modal Trigger */}
          <button
            className="nav-quick-add-btn"
            onClick={openQuickAdd}
            title="Quick add transaction"
          >
            <span className="plus-sign">+</span>
            <span>Forge</span>
          </button>

          {/* Cart Icon */}
          <button
            className="nav-cart-btn"
            onClick={openCart}
            title="Open Armory Cart"
          >
            <span>🛒</span>
            {cartCount > 0 && <span className="cart-badge-pill">{cartCount}</span>}
          </button>

          {/* Theme Switcher */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Profile Dropdown */}
          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-label="User profile menu"
            >
              <div className="profile-avatar">{initial}</div>
              <span className="profile-status-dot"></span>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown-card">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">{initial}</div>
                  <div className="dropdown-user-details">
                    <strong>{user?.name || "Student User"}</strong>
                    <span>{email}</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-meta-row">
                  <span>Course</span>
                  <strong>25CSE0203</strong>
                </div>

                <div className="dropdown-meta-row">
                  <span>Routing Architecture</span>
                  <strong className="status-live">● React Router v7 SPA</strong>
                </div>

                <div className="dropdown-meta-row">
                  <span>State Store</span>
                  <strong className="status-live">● React Context API</strong>
                </div>

                <div className="dropdown-divider" />

                <Link
                  to="/portfolio"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dropdown-item-icon">🎓</span>
                  <span>Course Syllabus Hub</span>
                </Link>

                <Link
                  to="/register"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dropdown-item-icon">📝</span>
                  <span>Validation Registration</span>
                </Link>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    resetDemoData();
                    setDropdownOpen(false);
                  }}
                >
                  <span className="dropdown-item-icon">⚡</span>
                  <span>Reload Demo Ledger</span>
                </button>

                <button
                  className="dropdown-item text-warning"
                  onClick={() => {
                    if (window.confirm("Clear all transactions from memory?")) {
                      clearAllData();
                      setDropdownOpen(false);
                    }
                  }}
                >
                  <span className="dropdown-item-icon">🗑️</span>
                  <span>Clear All Ledger</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                    navigate("/login");
                  }}
                >
                  <span className="dropdown-item-icon">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;