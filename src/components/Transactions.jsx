import { useState, useMemo } from "react";
import { normalizeCategory, getCategoryIcon } from "../utils/constants";
import { sound } from "../utils/sound";
import "./Transactions.css";

const SPELL_RUNES = [
  { name: "Food & Dining", title: "Feast Guild 🍗", icon: "🍴", color: "#f59e0b" },
  { name: "Transport", title: "Warp Transit 🚀", icon: "🚗", color: "#3b82f6" },
  { name: "Shopping", title: "Armory & Gear 🛍️", icon: "🛍️", color: "#ec4899" },
  { name: "Bills & Utilities", title: "Cyber Grid ⚡", icon: "⚡", color: "#8b5cf6" },
  { name: "Entertainment", title: "Tavern & Lore 🎭", icon: "🎬", color: "#06b6d4" },
  { name: "Other", title: "Mystery Loot 📦", icon: "📦", color: "#10b981" }
];

function Transactions({ transactions, setTransactions, budgets, showToast }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Food & Dining");
  const [note, setNote] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [rarityFilter, setRarityFilter] = useState("all");

  // Inflow / Outflow totals
  const { balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      const isInc = t.type?.toLowerCase() === "income";
      const val = Number(t.amount) || 0;
      if (isInc) inc += val;
      else exp += val;
    });
    return { balance: inc - exp };
  }, [transactions]);

  // Calculate spent per category
  const categorySpent = (categoryName) => {
    const targetNorm = normalizeCategory(categoryName);
    return transactions
      .filter(t => t.type?.toLowerCase() === "expense" && normalizeCategory(t.category) === targetNorm)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  const currentCategorySpent = categorySpent(category);

  // Quick Coin Injector Handler
  const handleAddCoins = (coinVal) => {
    sound.playCoin();
    const current = Number(amount) || 0;
    setAmount(String(current + coinVal));
  };

  // Submit / Forge Transaction
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("Please inject at least 1 Gold Coin into the forge!");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title: note.trim() || (type === "expense" ? `${category} debit` : "Guild reward deposit"),
      category: type === "income" ? "Income" : category,
      date,
      amount: Number(amount),
      type: type.toLowerCase(),
      note: note.trim() || undefined
    };

    setTransactions([newTransaction, ...transactions]);
    sound.playLevelUp();
    if (showToast) {
      showToast(`⚡ Forged ₹${Number(amount).toLocaleString("en-IN")} ${type.toUpperCase()} spell into the ledger!`);
    }

    setAmount("");
    setNote("");
  };

  const deleteTransaction = (id) => {
    sound.playHit();
    const item = transactions.find(t => t.id === id);
    setTransactions(transactions.filter(t => t.id !== id));
    if (showToast) {
      showToast(`Vanquished "${item?.title || "entry"}" from the chronicles`, "info");
    }
  };

  // CSV Export feature
  const exportCSV = () => {
    sound.playCoin();
    if (transactions.length === 0) {
      alert("No quest records available in the chronicle.");
      return;
    }

    const headers = ["Quest_ID", "Date", "Title", "Type", "Category", "Gold_Amount", "Lore_Note"];
    const rows = transactions.map(t => [
      t.id,
      t.date || "",
      `"${(t.title || "").replace(/"/g, '""')}"`,
      t.type || "expense",
      `"${(t.category || "").replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ExpenseIQ_Guild_Chronicles_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast("📜 Guild Chronicles successfully downloaded! 🌟");
    }
  };

  function money(val) {
    return "₹" + Number(val || 0).toLocaleString("en-IN");
  }

  // Active budget list
  const budgetList = useMemo(() => {
    return Object.keys(budgets || {}).map(name => ({
      name,
      limit: budgets[name]
    }));
  }, [budgets]);

  // Filtered & Sorted Transactions with Rarity calculation
  const filteredTransactions = useMemo(() => {
    let result = [...transactions].map(t => {
      const amt = Number(t.amount) || 0;
      let rarity = "COMMON";
      let rarityTier = 1;
      let rarityClass = "rarity-common";
      if (amt >= 20000) {
        rarity = "LEGENDARY";
        rarityTier = 4;
        rarityClass = "rarity-legendary";
      } else if (amt >= 5000) {
        rarity = "EPIC";
        rarityTier = 3;
        rarityClass = "rarity-epic";
      } else if (amt >= 1000) {
        rarity = "RARE";
        rarityTier = 2;
        rarityClass = "rarity-rare";
      }
      return { ...t, rarity, rarityTier, rarityClass };
    });

    if (filter === "Income") {
      result = result.filter(t => t.type?.toLowerCase() === "income");
    } else if (filter === "Expense") {
      result = result.filter(t => t.type?.toLowerCase() === "expense");
    } else if (filter === "This Month") {
      const currentMonthPrefix = new Date().toISOString().slice(0, 7);
      result = result.filter(t => (t.date || "").startsWith(currentMonthPrefix) || (t.date || "").includes("2026-09"));
    }

    if (rarityFilter !== "all") {
      result = result.filter(t => t.rarity.toLowerCase() === rarityFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        (t.title || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.note || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "newest") {
      result.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.id - a.id));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.id - b.id));
    } else if (sortBy === "highest") {
      result.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
    }

    return result;
  }, [transactions, filter, search, sortBy, rarityFilter]);

  return (
    <div className="transactions-page game-mode-active">
      {/* Header HUD */}
      <div className="transactions-heading game-header-bar">
        <div className="heading-left">
          <span className="section-label game-eyebrow">
            <span className="game-star">🔮</span>
            ALCHEMIST'S TRANSMUTATION FORGE & LEDGER
          </span>
          <h1>Guild Quest & Transaction Forge</h1>
          <p>Cast financial spells, throw gold coins into the crucible, and record epic loot into the guild chronicles.</p>
        </div>

        <div className="heading-stats-badge">
          <div className="h-stat">
            <small>Vault Reserves</small>
            <strong className="text-purple">{money(balance)}</strong>
          </div>
          <div className="h-stat-divider"></div>
          <div className="h-stat">
            <small>Chronicle Feats</small>
            <strong className="text-amber">{transactions.length} Records</strong>
          </div>
        </div>
      </div>

      {/* Main Game Forge & Hologram Terminal */}
      <section className="entry-section">
        {/* Left: The Alchemist's Forge Terminal */}
        <div className="entry-card alchemist-forge-card">
          <div className="forge-header">
            <div className="forge-title-row">
              <span className="forge-flame">🔥</span>
              <h3>Transmutation Crucible</h3>
            </div>
            <span className="forge-status-tag">FORGE READY</span>
          </div>

          {/* Stance Selector */}
          <div className="type-switch game-stance-switch">
            <button
              className={type === "expense" ? "active active-debit" : ""}
              onClick={() => {
                setType("expense");
                sound.playHit();
              }}
              type="button"
            >
              ⚔️ Resource Outlay (Expense)
            </button>
            <button
              className={type === "income" ? "active active-income" : ""}
              onClick={() => {
                setType("income");
                sound.playPowerup();
              }}
              type="button"
            >
              🪙 Mana Harvest (Income)
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Arcade Digital Counter Display */}
            <div className="form-group counter-group">
              <label>FORGE COUNTER (GOLD AMOUNT)</label>
              <div className="arcade-display-screen">
                <span className="arcade-currency">₹</span>
                <input
                  type="number"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="arcade-input"
                  required
                />
              </div>

              {/* Clickable Coin & Gem Injectors */}
              <div className="arcade-coin-thrower">
                <span className="coin-thrower-hint">🪙 Click Coins to Inject:</span>
                <div className="coin-buttons-row">
                  <button type="button" className="coin-chip copper" onClick={() => handleAddCoins(100)}>
                    +₹100
                  </button>
                  <button type="button" className="coin-chip silver" onClick={() => handleAddCoins(500)}>
                    +₹500
                  </button>
                  <button type="button" className="coin-chip gold" onClick={() => handleAddCoins(1000)}>
                    +₹1,000
                  </button>
                  <button type="button" className="coin-chip platinum" onClick={() => handleAddCoins(2500)}>
                    +₹2,500
                  </button>
                  <button type="button" className="coin-chip royal" onClick={() => handleAddCoins(5000)}>
                    +₹5,000
                  </button>
                  <button
                    type="button"
                    className="coin-chip reset"
                    onClick={() => {
                      setAmount("");
                      sound.playHit();
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Rune Spell Glyphs Category Selector */}
            {type === "expense" && (
              <div className="form-group category-group">
                <label>SPELL RUNES (SELECT GUILD BASTION)</label>
                <div className="rune-glyphs-grid">
                  {SPELL_RUNES.map((rune) => {
                    const isSelected = category === rune.name;
                    return (
                      <div
                        key={rune.name}
                        className={`rune-glyph-card ${isSelected ? "selected-glyph" : ""}`}
                        onClick={() => {
                          setCategory(rune.name);
                          sound.playCoin();
                        }}
                        style={{ "--glyph-color": rune.color }}
                        role="button"
                        tabIndex={0}
                      >
                        <span className="rune-icon">{rune.icon}</span>
                        <span className="rune-label">{rune.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>FORGE DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="game-form-input"
                />
              </div>

              <div className="form-group">
                <label>QUEST LORE / NOTE</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy feast, Apple keyboard, Client contract"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="game-form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setAmount("");
                  setNote("");
                  sound.playHit();
                }}
              >
                Clear Crucible
              </button>

              <button type="submit" className="save-btn forge-submit-btn">
                <span>⚡ Cast Spell into Ledger</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Holographic Radar & Live Impact HUD */}
        <div className="preview-column">
          <div className="live-preview hologram-preview-card">
            <div className="preview-top-badge">
              <span className="live-dot-pulse">●</span>
              <span>HOLOGRAPHIC PROJECTION</span>
            </div>

            <h2 className="preview-dynamic-amt">
              {type === "expense" ? "−" : "+"} {money(amount || 0)}
            </h2>

            <p className="preview-text">
              Real-time projection calculated prior to ledger commitment.
            </p>

            <div className="preview-row">
              <span>Projected Vault Level</span>
              <strong className="text-purple">
                {money(
                  balance + (type === "income" ? Number(amount || 0) : -Number(amount || 0))
                )}
              </strong>
            </div>

            <div className="preview-row">
              <span>Target Bastion</span>
              <strong>
                {type === "income" ? "💰 Guild Inflow" : `${getCategoryIcon(category)} ${category}`}
              </strong>
            </div>

            {type === "expense" && (
              <div className="preview-row">
                <span>Current Category Drain</span>
                <strong className="text-amber">{money(currentCategorySpent + Number(amount || 0))}</strong>
              </div>
            )}
          </div>

          {/* Quick Bastion Shield Bars */}
          <div className="budget-status game-status-card">
            <div className="card-title-row">
              <h3>Bastion Barrier Health</h3>
              <span className="status-live-pill">RADAR LIVE</span>
            </div>

            {budgetList.slice(0, 4).map((budget) => {
              const spent = categorySpent(budget.name);
              const percentage = Math.min(Math.round((spent / budget.limit) * 100), 100);
              const isOver = spent > budget.limit;

              return (
                <div className="budget-item" key={budget.name}>
                  <div className="budget-top">
                    <span className="budget-name">
                      {getCategoryIcon(budget.name)} {budget.name}
                    </span>
                    <span className="budget-vals">
                      {money(spent)} / {money(budget.limit)}
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${isOver ? "over" : percentage > 75 ? "warning" : ""}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="budget-item-footer">
                    <small>{percentage}% absorbed</small>
                    {isOver && <span className="over-budget-tag">BARRIER BREACHED</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chronicle of Quests Ledger & Rarity Terminal */}
      <section className="all-transactions-section">
        <div className="section-top">
          <div className="section-top-info">
            <span className="section-label game-eyebrow">
              <span className="game-star">📜</span>
              GUILD ARCHIVES & FEATS
            </span>
            <h2>Chronicle of Quests Ledger</h2>
          </div>

          <div className="section-top-actions">
            <button className="export-btn guild-export-btn" onClick={exportCSV} title="Download CSV scroll">
              <span>📜 Download Guild Scroll (CSV)</span>
            </button>
          </div>
        </div>

        {/* Filter & Rarity Toolbar */}
        <div className="filters-toolbar game-toolbar">
          <div className="filter-buttons">
            {["All", "Income", "Expense", "This Month"].map((item) => (
              <button
                key={item}
                className={filter === item ? "filter-btn active-filter" : "filter-btn"}
                onClick={() => {
                  setFilter(item);
                  sound.playCoin();
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Rarity Tier Filter */}
          <div className="rarity-filter-buttons">
            <button
              className={`rarity-chip ${rarityFilter === "all" ? "active-rarity" : ""}`}
              onClick={() => setRarityFilter("all")}
            >
              All Tiers
            </button>
            <button
              className={`rarity-chip chip-legendary ${rarityFilter === "legendary" ? "active-rarity" : ""}`}
              onClick={() => setRarityFilter("legendary")}
            >
              🌟 Legendary
            </button>
            <button
              className={`rarity-chip chip-epic ${rarityFilter === "epic" ? "active-rarity" : ""}`}
              onClick={() => setRarityFilter("epic")}
            >
              💜 Epic
            </button>
            <button
              className={`rarity-chip chip-rare ${rarityFilter === "rare" ? "active-rarity" : ""}`}
              onClick={() => setRarityFilter("rare")}
            >
              💙 Rare
            </button>
          </div>

          <div className="filter-controls-right">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                type="text"
                placeholder="Search quest chronicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-search-btn" onClick={() => setSearch("")}>✕</button>
              )}
            </div>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Rarity</option>
              <option value="lowest">Sort: Lowest Rarity</option>
            </select>
          </div>
        </div>

        {/* Quest Chronicle Cards Feed */}
        <div className="transactions-content">
          <div className="transaction-list-card game-list-card">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⚔️</div>
                <h3>No Quest Feats Found</h3>
                <p>Try clearing your search query or reset the active filter tier.</p>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setFilter("All");
                    setRarityFilter("all");
                    setSearch("");
                  }}
                >
                  Reset Chronicle Filters
                </button>
              </div>
            ) : (
              <div className="quest-rows-feed">
                {filteredTransactions.map((tx) => {
                  const isInc = tx.type?.toLowerCase() === "income";
                  const icon = getCategoryIcon(tx.category);

                  return (
                    <div className={`quest-table-row ${tx.rarityClass}`} key={tx.id}>
                      <div className="quest-row-left">
                        <div className={`quest-row-icon ${isInc ? "icon-income" : "icon-expense"}`}>
                          <span>{icon}</span>
                        </div>
                        <div className="quest-row-info">
                          <div className="quest-row-title-row">
                            <strong>{tx.title}</strong>
                            <span className={`rarity-badge-mini ${tx.rarityClass}`}>
                              {tx.rarity}
                            </span>
                          </div>
                          <div className="quest-row-meta">
                            <span>{tx.category}</span>
                            <span>•</span>
                            <span>{tx.date}</span>
                            {tx.note && (
                              <>
                                <span>•</span>
                                <span className="quest-row-note">"{tx.note}"</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="quest-row-right">
                        <strong className={`quest-row-amt ${isInc ? "income-text" : "expense-text"}`}>
                          {isInc ? "+" : "−"} {money(tx.amount)}
                        </strong>
                        <button
                          className="quest-delete-btn"
                          onClick={() => deleteTransaction(tx.id)}
                          title="Vanquish Quest Entry"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="right-summary">
            <div className="filter-summary game-summary-card">
              <h3>Chronicle Intelligence</h3>
              <div className="summary-stat-row">
                <span>Displaying</span>
                <strong>{filteredTransactions.length} of {transactions.length} records</strong>
              </div>
              <div className="summary-stat-row">
                <span>Filter Net Flow</span>
                <strong className={balance >= 0 ? "summary-green" : "summary-red"}>
                  {money(balance)}
                </strong>
              </div>
              <div className="summary-stat-row">
                <span>Chronicle Status</span>
                <span className="ready-badge">Encrypted Ledger</span>
              </div>
            </div>

            <div className="category-budget-card game-summary-card">
              <h3>Guild Bastion Limits</h3>
              {budgetList.map((budget) => {
                const spent = categorySpent(budget.name);
                const percentage = Math.min(Math.round((spent / budget.limit) * 100), 100);
                const isOver = spent > budget.limit;

                return (
                  <div className="category-budget" key={budget.name}>
                    <div className="category-budget-head">
                      <strong>{getCategoryIcon(budget.name)} {budget.name}</strong>
                      <span>{money(spent)} / {money(budget.limit)}</span>
                    </div>

                    <div className="budget-bar">
                      <div
                        className={isOver ? "over" : percentage > 75 ? "warning" : ""}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {isOver && <small>⚠ BREACHED BY {money(spent - budget.limit)}</small>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Transactions;
