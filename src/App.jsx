import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/useApp";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Analytics from "./components/Analytics";
import Budget from "./components/Budget";
import { Register } from "./pages/Register";
import { Portfolio } from "./pages/Portfolio";
import { Shop } from "./pages/Shop";
import { GitHubExplorer } from "./pages/GitHubExplorer";
import { Modal } from "./components/common/Modal";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const {
    theme,
    transactions,
    addTransaction,
    setTransactions,
    budgets,
    setBudgets,
    isQuickAddOpen,
    closeQuickAdd,
    openQuickAdd,
    toasts,
    removeToast,
    addToast
  } = useApp();

  // Quick Add state (Local Form State vs Global Store State)
  const [qaTitle, setQaTitle] = useState("");
  const [qaType, setQaType] = useState("expense");
  const [qaAmount, setQaAmount] = useState("");
  const [qaCategory, setQaCategory] = useState("Food & Dining");
  const [qaDate, setQaDate] = useState(() => new Date().toISOString().split("T")[0]);

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!qaAmount || Number(qaAmount) <= 0) {
      alert("Please enter a valid gold amount greater than 0");
      return;
    }

    const newTx = {
      id: Date.now(),
      title: qaTitle.trim() || (qaType === "expense" ? `${qaCategory} expense` : "Income deposit"),
      type: qaType,
      amount: Number(qaAmount),
      category: qaType === "income" ? "Income" : qaCategory,
      date: qaDate || new Date().toISOString().split("T")[0],
      note: "Added via Quick Entry"
    };

    addTransaction(newTx);
    setQaTitle("");
    setQaAmount("");
    closeQuickAdd();
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/";

  return (
    <div className={`app theme-${theme}`}>
      {/* Global Toast Notifications Stack */}
      <div className="toast-container-stack">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`app-toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-icon">
              {toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠" : "ℹ"}
            </span>
            <span>{toast.message}</span>
            <button className="toast-dismiss-x" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Persistent Navigation for SPA */}
      {!isAuthPage && <Navbar />}

      <main className={!isAuthPage ? "main-content" : "auth-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                transactions={transactions}
                onOpenQuickAdd={openQuickAdd}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <Transactions
                transactions={transactions}
                setTransactions={setTransactions}
                budgets={budgets}
                showToast={addToast}
              />
            }
          />
          <Route
            path="/budget"
            element={
              <Budget
                transactions={transactions}
                budgets={budgets}
                setBudgets={setBudgets}
                showToast={addToast}
              />
            }
          />
          <Route
            path="/analytics"
            element={<Analytics transactions={transactions} />}
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/explorer" element={<GitHubExplorer />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Quick Add Transaction Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        eyebrow="GLOBAL QUICK FORGE"
        title="Forge New Transaction Spell"
      >
        <form onSubmit={handleQuickAddSubmit}>
          <div className="modal-type-switch">
            <button
              type="button"
              className={qaType === "expense" ? "active-expense" : ""}
              onClick={() => setQaType("expense")}
            >
              − Expense Outflow
            </button>
            <button
              type="button"
              className={qaType === "income" ? "active-income" : ""}
              onClick={() => setQaType("income")}
            >
              + Income Inflow
            </button>
          </div>

          <div className="modal-form-group">
            <label>GOLD AMOUNT (₹)</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                autoFocus
                placeholder="0.00"
                value={qaAmount}
                onChange={(e) => setQaAmount(e.target.value)}
                required
              />
            </div>
            <div className="quick-chip-row">
              {[200, 500, 1000, 2500, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  className="quick-chip"
                  onClick={() => setQaAmount(String(val))}
                >
                  +₹{val.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form-group">
            <label>TITLE / DESCRIPTION</label>
            <input
              type="text"
              placeholder="e.g. Swiggy order, Client invoice, Transit pass"
              value={qaTitle}
              onChange={(e) => setQaTitle(e.target.value)}
            />
          </div>

          {qaType === "expense" && (
            <div className="modal-form-group">
              <label>CATEGORY BASTION</label>
              <select
                value={qaCategory}
                onChange={(e) => setQaCategory(e.target.value)}
              >
                <option value="Food & Dining">🍴 Food & Dining</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills & Utilities">⚡ Bills & Utilities</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
          )}

          <div className="modal-form-group">
            <label>TRANSACTION DATE</label>
            <input
              type="date"
              value={qaDate}
              onChange={(e) => setQaDate(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={closeQuickAdd}
            >
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              Forge into Ledger ⚡
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}