import { useState, useMemo, useCallback } from "react";
import { normalizeCategory, getCategoryIcon } from "../utils/constants";
import { sound } from "../utils/sound";

const LOOT_PERKS = [
  { title: "Golden Treasury Blessing! 👑", desc: "You unlocked the Frugal King aura. Keep dining out under ₹2,000 to double your weekend XP bonus!", bonus: "+300 XP" },
  { title: "Ironclad Shield Boost! 🛡️", desc: "Perimeter fortified! Your discipline prevented ₹1,500 in impulse purchases this week.", bonus: "+250 XP" },
  { title: "Critical Spend Deflection! ⚡", desc: "You resisted lifestyle creep! Cash reserves expanded by 4.2% month-over-month.", bonus: "+400 XP" },
  { title: "Diamond Vault Discovery! 💎", desc: "Compound interest engine active: Safe buffers in utilities and groceries detected.", bonus: "+350 XP" },
  { title: "Hermit's Frugal Elixir! 🧪", desc: "Home-cooked meals buff applied: +15% defense against delivery app surcharges!", bonus: "+200 XP" }
];

function Budget({ transactions, budgets, setBudgets, showToast }) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeLoot, setActiveLoot] = useState(null);
  const [isOpeningLoot, setIsOpeningLoot] = useState(false);

  const categories = Object.keys(budgets);

  function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  }

  // Calculate spent per category
  const spent = useCallback((category) => {
    const norm = normalizeCategory(category);
    return transactions
      .filter(item => item.type?.toLowerCase() === "expense" && normalizeCategory(item.category) === norm)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [transactions]);

  // Update a category's budget limit
  function updateBudget(category, value) {
    const num = Math.max(0, Number(value) || 0);
    setBudgets({
      ...budgets,
      [category]: num
    });
  }

  // Quick adjust limit by delta with sound
  function adjustLimit(category, delta) {
    const current = budgets[category] || 0;
    const updated = Math.max(0, current + delta);
    updateBudget(category, updated);
    if (delta > 0) {
      sound.playPowerup();
    } else {
      sound.playHit();
    }
  }

  // Fortify All Shields buff (+₹1,000 to all categories)
  const handleFortifyAll = () => {
    sound.playLevelUp();
    const updated = {};
    categories.forEach(cat => {
      updated[cat] = (budgets[cat] || 0) + 1000;
    });
    setBudgets(updated);
    if (showToast) {
      showToast("🛡️ Kingdom Shield Fortified! (+₹1,000 cap added to all bastions)");
    }
  };

  // Emergency Ration protocol (-10% to all categories)
  const handleEmergencyRation = () => {
    sound.playHit();
    const updated = {};
    categories.forEach(cat => {
      updated[cat] = Math.max(1000, Math.round((budgets[cat] || 0) * 0.9));
    });
    setBudgets(updated);
    if (showToast) {
      showToast("⚔️ Emergency Ration Protocol Enacted! (-10% spending cap applied)", "warning");
    }
  };

  // Open Daily Loot Chest mini-game
  const handleOpenLootChest = () => {
    sound.playCoin();
    setIsOpeningLoot(true);
    setTimeout(() => {
      const randomPerk = LOOT_PERKS[Math.floor(Math.random() * LOOT_PERKS.length)];
      setActiveLoot(randomPerk);
      setIsOpeningLoot(false);
      sound.playLevelUp();
    }, 600);
  };

  // Add new budget category
  function handleAddCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert("Please enter a category name");
      return;
    }
    const limit = Number(newCatLimit) || 5000;
    setBudgets({
      ...budgets,
      [newCatName.trim()]: limit
    });
    setNewCatName("");
    setNewCatLimit("");
    setShowAddModal(false);
    sound.playLevelUp();
    if (showToast) {
      showToast(`🎯 New Defense Tower erected: "${newCatName.trim()}"!`);
    }
  }

  // Master stats
  const { totalBudget, totalSpent, overallPct, isOverallOver, remainingBudget, survivedCount } = useMemo(() => {
    const bTotal = categories.reduce((sum, cat) => sum + (Number(budgets[cat]) || 0), 0);
    const sTotal = categories.reduce((sum, cat) => sum + spent(cat), 0);
    const pct = bTotal > 0 ? Math.round((sTotal / bTotal) * 100) : 0;
    const survived = categories.filter(c => spent(c) <= (budgets[c] || 0)).length;

    return {
      totalBudget: bTotal,
      totalSpent: sTotal,
      overallPct: pct,
      isOverallOver: sTotal > bTotal,
      remainingBudget: bTotal - sTotal,
      survivedCount: survived
    };
  }, [categories, budgets, spent]);

  const fortressShieldHP = Math.max(0, totalBudget - totalSpent);
  const shieldIntegrityPct = totalBudget > 0 ? Math.max(0, Math.round((fortressShieldHP / totalBudget) * 100)) : 0;

  return (
    <div className="page budget-page game-mode-active">
      {/* Header */}
      <div className="page-header game-header-bar">
        <div>
          <div className="eyebrow game-eyebrow">
            <span className="game-star">🛡️</span>
            KINGDOM DEFENSE & BUDGET BATTLEGROUNDS
          </div>
          <h1>Fortress Guardrails: Level 10 Defense</h1>
          <p>Defend your treasury bastions, reallocate energy shields, and survive month-end raids.</p>
        </div>

        <div className="budget-game-top-actions">
          <button className="loot-chest-btn" onClick={handleOpenLootChest} disabled={isOpeningLoot}>
            <span>🎁</span>
            <span>{isOpeningLoot ? "Opening Chest..." : "Daily Loot Chest"}</span>
          </button>
          <button className="primary-btn glow-btn" onClick={() => setShowAddModal(true)}>
            <span className="plus-sign">+</span>
            <span>Erect New Bastion</span>
          </button>
        </div>
      </div>

      {/* Fortress Master Defense Hub Banner */}
      <div className="kingdom-fortress-banner">
        <div className="fortress-left-column">
          <div className="shield-title-row">
            <span className="fortress-badge">CITADEL SHIELD GENERATOR</span>
            <span className="tower-count-badge">{survivedCount} / {categories.length} Bastions Standing</span>
          </div>

          <h2>{shieldIntegrityPct}% Fortress Shield Integrity</h2>
          <p>
            {isOverallOver
              ? `🚨 CRITICAL BREACH! Outflow has shattered perimeter shields by ${money(Math.abs(remainingBudget))}.`
              : `🛡️ SHIELDS ONLINE: Your citadel holds ${money(fortressShieldHP)} in active defensive energy.`}
          </p>

          <div className="fortress-shield-track">
            <div
              className={`fortress-shield-fill ${
                shieldIntegrityPct < 25 ? "critical-shield" : shieldIntegrityPct < 50 ? "warning-shield" : "max-shield"
              }`}
              style={{ width: `${shieldIntegrityPct}%` }}
            />
          </div>

          <div className="fortress-buff-buttons">
            <button className="buff-action-btn buff-green" onClick={handleFortifyAll} title="Add +₹1,000 cap to all categories">
              <span>🛡️ Fortify All Bastions (+₹1,000 Cap)</span>
            </button>
            <button className="buff-action-btn buff-amber" onClick={handleEmergencyRation} title="Apply 10% cut across all categories">
              <span>⚔️ Emergency Ration (-10% Cap)</span>
            </button>
          </div>
        </div>

        <div className="fortress-metrics-stack">
          <div className="fortress-metric-card">
            <span className="f-metric-label">MAX ENERGY CAPACITY</span>
            <strong>{money(totalBudget)}</strong>
            <small>Total kingdom budget cap</small>
          </div>
          <div className="fortress-metric-card">
            <span className="f-metric-label">DAMAGE TAKEN (BURN)</span>
            <strong className={isOverallOver ? "text-red" : "text-amber"}>{money(totalSpent)}</strong>
            <small>{overallPct}% of shield consumed</small>
          </div>
          <div className="fortress-metric-card">
            <span className="f-metric-label">DEFENSIVE STATUS</span>
            <strong className={shieldIntegrityPct > 50 ? "text-green" : "text-red"}>
              {shieldIntegrityPct > 70 ? "★ Fortified" : shieldIntegrityPct > 40 ? "Guarded" : "Critical"}
            </strong>
            <small>Threat level monitoring</small>
          </div>
        </div>
      </div>

      {/* Defense Towers Grid (Categories) */}
      <div className="bastions-grid">
        {categories.map(category => {
          const amount = spent(category);
          const limit = budgets[category] || 0;
          const percentage = limit > 0 ? Math.round((amount / limit) * 100) : 0;
          const over = amount > limit;
          const remainingHP = Math.max(0, limit - amount);
          const shieldPct = limit > 0 ? Math.max(0, 100 - percentage) : 0;
          const icon = getCategoryIcon(category);

          // Star Rating
          let stars = "⭐⭐⭐";
          let badgeStatus = "FLAWLESS";
          if (over) {
            stars = "💥💥💥";
            badgeStatus = "BREACHED";
          } else if (percentage > 80) {
            stars = "⭐";
            badgeStatus = "CRITICAL";
          } else if (percentage > 50) {
            stars = "⭐⭐";
            badgeStatus = "STABLE";
          }

          return (
            <div
              className={`bastion-card ${over ? "bastion-breached" : ""}`}
              key={category}
            >
              <div className="bastion-header">
                <div className="bastion-icon-box">
                  <span className="bastion-emoji">{icon}</span>
                  <span className="tower-rank">BASTION</span>
                </div>

                <div className="bastion-title-block">
                  <h3>{category}</h3>
                  <div className="bastion-star-line">
                    <span className="star-emojis">{stars}</span>
                    <span className={`bastion-status-chip ${over ? "chip-breached" : percentage > 80 ? "chip-warning" : "chip-secure"}`}>
                      {badgeStatus}
                    </span>
                  </div>
                </div>

                <div className="bastion-shield-percent">
                  <span className="shield-num">{shieldPct}%</span>
                  <small>SHIELD HP</small>
                </div>
              </div>

              <div className="bastion-damage-report">
                <div className="report-item">
                  <span className="report-label">Damage Taken (Spent)</span>
                  <strong className={over ? "text-red" : ""}>{money(amount)}</strong>
                </div>
                <div className="report-item text-right">
                  <span className="report-label">Max Barrier (Limit)</span>
                  <strong>{money(limit)}</strong>
                </div>
              </div>

              {/* Shield Energy Bar */}
              <div className="bastion-energy-track">
                <div
                  className={`bastion-energy-fill ${over ? "energy-depleted" : percentage > 80 ? "energy-warning" : "energy-full"}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="bastion-headroom-meta">
                {over ? (
                  <strong className="damage-overflow-text">
                    🚨 BREACH OVERFLOW: -{money(amount - limit)} DMG taken!
                  </strong>
                ) : (
                  <span className="shield-cushion-text">
                    🛡️ Barrier Buffer: {money(remainingHP)} remaining HP
                  </span>
                )}
              </div>

              {/* Energy Tuning / Steppers */}
              <div className="bastion-controls-zone">
                <div className="controls-label-row">
                  <span>ENERGY ALLOCATION (₹)</span>
                  <span className="adjust-hint">Quick Tuning</span>
                </div>
                <div className="game-stepper-row">
                  <button
                    type="button"
                    className="game-stepper-btn minus"
                    onClick={() => adjustLimit(category, -1000)}
                    title="Trim -₹1,000 capacity"
                  >
                    −₹1k
                  </button>
                  <input
                    type="number"
                    value={budgets[category] || 0}
                    onChange={e => updateBudget(category, e.target.value)}
                    className="game-limit-input"
                  />
                  <button
                    type="button"
                    className="game-stepper-btn plus"
                    onClick={() => adjustLimit(category, 1000)}
                    title="Boost +₹1,000 capacity"
                  >
                    +₹1k
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Loot Chest Modal */}
      {activeLoot && (
        <div className="modal-backdrop" onClick={() => setActiveLoot(null)}>
          <div className="modal-card loot-modal-card" onClick={e => e.stopPropagation()}>
            <div className="loot-modal-sparkles">✨ 🎉 ✨</div>
            <span className="loot-oracle-tag">ORACLE OF PROSPERITY</span>
            <h2>{activeLoot.title}</h2>
            <p className="loot-desc">{activeLoot.desc}</p>
            <div className="loot-reward-badge">
              <span>PERK BONUS:</span>
              <strong>{activeLoot.bonus}</strong>
            </div>
            <button
              className="claim-loot-btn"
              onClick={() => {
                sound.playLevelUp();
                setActiveLoot(null);
                if (showToast) showToast("Claimed Daily Loot Blessing! 🌟");
              }}
            >
              Claim Reward & Equip Buff →
            </button>
          </div>
        </div>
      )}

      {/* Add New Bastion Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-eyebrow">CITADEL EXPANSION</span>
                <h3>Erect New Defense Bastion</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="modal-form-group">
                <label>BASTION / CATEGORY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Subscriptions, Gaming, Cloud, Education"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-form-group">
                <label>INITIAL SHIELD HP (₹ CAP)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newCatLimit}
                  onChange={e => setNewCatLimit(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Erect Defense Bastion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budget;
