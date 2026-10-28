import { useState, useEffect, useMemo, useCallback } from "react";
import { AppContext } from "./context";
import { DEFAULT_TRANSACTIONS, DEFAULT_BUDGETS } from "../utils/constants";
import { sound } from "../utils/sound";

export function AppProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem("expenseIQ_theme") || "dark");

  // User Auth state (Global state vs Local state)
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("userEmail");
    const remember = localStorage.getItem("rememberMe");
    return email && remember ? { email, name: email.split("@")[0] } : null;
  });

  // Global Ledger Transactions
  const [transactions, setTransactions] = useState(() => {
    const email = localStorage.getItem("userEmail") || "demo@expenseiq.com";
    const saved = localStorage.getItem(`expenseIQ_transactions_${email}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  // Global Budgets
  const [budgets, setBudgets] = useState(() => {
    const email = localStorage.getItem("userEmail") || "demo@expenseiq.com";
    const saved = localStorage.getItem(`expenseIQ_budgets_${email}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse budgets", e);
      }
    }
    return DEFAULT_BUDGETS;
  });

  // Global Shopping Cart state (Syllabus mini-project: shopping cart)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("expenseIQ_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Global Modal state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Global Toast Notifications Queue
  const [toasts, setToasts] = useState([]);

  // Theme synchronization
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("expenseIQ_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Toast helper
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth actions
  const login = useCallback((email, _password = "") => {
    const cleanEmail = email || "demo@expenseiq.com";
    const userData = { email: cleanEmail, name: cleanEmail.split("@")[0] };
    setUser(userData);
    localStorage.setItem("userEmail", cleanEmail);

    // Load or initialize user-scoped data
    const savedTx = localStorage.getItem(`expenseIQ_transactions_${cleanEmail}`);
    if (savedTx) {
      try {
        const parsed = JSON.parse(savedTx);
        setTransactions(parsed.length > 0 ? parsed : DEFAULT_TRANSACTIONS);
      } catch {
        setTransactions(DEFAULT_TRANSACTIONS);
      }
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
      localStorage.setItem(`expenseIQ_transactions_${cleanEmail}`, JSON.stringify(DEFAULT_TRANSACTIONS));
    }

    const savedBg = localStorage.getItem(`expenseIQ_budgets_${cleanEmail}`);
    if (savedBg) {
      try {
        setBudgets(JSON.parse(savedBg));
      } catch {
        setBudgets(DEFAULT_BUDGETS);
      }
    } else {
      setBudgets(DEFAULT_BUDGETS);
    }

    addToast(`Welcome back, ${userData.name}! 🌟`);
  }, [addToast]);

  const logout = useCallback(() => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("rememberMe");
    setUser(null);
    addToast("Signed out from session.", "info");
  }, [addToast]);

  // Ledger actions
  const addTransaction = useCallback((newTx) => {
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      const email = localStorage.getItem("userEmail") || "demo@expenseiq.com";
      localStorage.setItem(`expenseIQ_transactions_${email}`, JSON.stringify(updated));
      return updated;
    });
    sound.playLevelUp();
    addToast(`Forged ₹${Number(newTx.amount).toLocaleString("en-IN")} ${newTx.type}! 🚀`);
  }, [addToast]);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      const email = localStorage.getItem("userEmail") || "demo@expenseiq.com";
      localStorage.setItem(`expenseIQ_transactions_${email}`, JSON.stringify(updated));
      return updated;
    });
    sound.playHit();
    addToast("Entry removed from ledger.", "info");
  }, [addToast]);

  const updateBudget = useCallback((category, value) => {
    setBudgets(prev => {
      const updated = { ...prev, [category]: Math.max(0, Number(value) || 0) };
      const email = localStorage.getItem("userEmail") || "demo@expenseiq.com";
      localStorage.setItem(`expenseIQ_budgets_${email}`, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetDemoData = useCallback(() => {
    const email = localStorage.getItem("userEmail") || "demo@expenseiq.com";
    setTransactions(DEFAULT_TRANSACTIONS);
    setBudgets(DEFAULT_BUDGETS);
    localStorage.setItem(`expenseIQ_transactions_${email}`, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(`expenseIQ_budgets_${email}`, JSON.stringify(DEFAULT_BUDGETS));
    sound.playPowerup();
    addToast("Demo dataset refreshed successfully! ⚡");
  }, [addToast]);

  const clearAllData = useCallback(() => {
    const email = localStorage.getItem("userEmail") || "demo@expenseiq.com";
    setTransactions([]);
    localStorage.setItem(`expenseIQ_transactions_${email}`, JSON.stringify([]));
    sound.playHit();
    addToast("All ledger records cleared.", "warning");
  }, [addToast]);

  // Shopping Cart Actions (Syllabus mini-project: shopping cart)
  const addToCart = useCallback((item) => {
    sound.playCoin();
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let updated;
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      } else {
        updated = [...prev, { ...item, qty: 1 }];
      }
      localStorage.setItem("expenseIQ_cart", JSON.stringify(updated));
      return updated;
    });
    addToast(`Added "${item.title}" to Armory Cart! 🛒`);
  }, [addToast]);

  const removeFromCart = useCallback((id) => {
    sound.playHit();
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem("expenseIQ_cart", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateCartQty = useCallback((id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => {
        if (i.id === id) {
          const newQty = i.qty + delta;
          return newQty > 0 ? { ...i, qty: newQty } : null;
        }
        return i;
      }).filter(Boolean);
      localStorage.setItem("expenseIQ_cart", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("expenseIQ_cart");
  }, []);

  const { cartTotal, cartCount } = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    return { cartTotal: total, cartCount: count };
  }, [cart]);

  const value = {
    theme,
    toggleTheme,
    user,
    login,
    logout,
    transactions,
    addTransaction,
    deleteTransaction,
    setTransactions,
    budgets,
    setBudgets,
    updateBudget,
    resetDemoData,
    clearAllData,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    isQuickAddOpen,
    openQuickAdd: () => setIsQuickAddOpen(true),
    closeQuickAdd: () => setIsQuickAddOpen(false),
    toasts,
    addToast,
    removeToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}