import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { normalizeCategory, getCategoryIcon } from "../utils/constants";
import { sound } from "../utils/sound";

const CATEGORY_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4"
];

function AnalyticsCustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-recharts-tooltip game-tooltip">
        <p className="tooltip-label">⚔️ {label} BATTLE STATS</p>
        {payload.map((entry, index) => (
          <div key={index} className="tooltip-row" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <strong>₹{Number(entry.value).toLocaleString("en-IN")}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function Analytics({ transactions }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [simulationCut, setSimulationCut] = useState(15); // 15% spend cut simulation
  const [bossAttackAnim, setBossAttackAnim] = useState(false);

  const toggleSound = () => {
    sound.muted = soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Financial metrics
  const { income, expense, balance, savingsRate, avgDailySpend } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let maxExp = 0;

    transactions.forEach(t => {
      const isInc = t.type?.toLowerCase() === "income";
      const val = Number(t.amount) || 0;
      if (isInc) {
        inc += val;
      } else {
        exp += val;
        if (val > maxExp) maxExp = val;
      }
    });

    const bal = inc - exp;
    const rate = inc > 0 ? Math.round((bal / inc) * 100) : 0;
    const daily = Math.round(exp / 30);

    return {
      income: inc,
      expense: exp,
      balance: bal,
      savingsRate: rate,
      highestExpense: maxExp,
      avgDailySpend: daily
    };
  }, [transactions]);

  // Gamified XP & Level calculation
  const { currentLevel, levelTitle, currentXP, nextLevelXP, xpPercentage } = useMemo(() => {
    let xp = 200; // Base XP
    xp += transactions.length * 45; // XP per transaction
    if (savingsRate >= 20) xp += 400;
    if (savingsRate >= 35) xp += 500;
    if (balance > 15000) xp += 350;
    if (balance > 40000) xp += 500;

    const level = Math.floor(xp / 500) + 1;
    const levelXP = (level - 1) * 500;
    const currentInLevel = xp - levelXP;
    const maxInLevel = 500;
    const pct = Math.min(Math.round((currentInLevel / maxInLevel) * 100), 100);

    let title = "Novice Spender";
    if (level >= 8) title = "Grandmaster of Wealth 👑";
    else if (level >= 6) title = "Financial Strategist 🔮";
    else if (level >= 4) title = "Budget Vanguard 🛡️";
    else if (level >= 2) title = "Apprentice Saver ⚡";

    return {
      currentLevel: level,
      levelTitle: title,
      currentXP: currentInLevel,
      nextLevelXP: maxInLevel,
      xpPercentage: pct
    };
  }, [transactions, savingsRate, balance]);

  // Spending by Category
  const categoryData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.type?.toLowerCase() === "expense") {
        const cat = normalizeCategory(t.category);
        map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
      }
    });

    return Object.keys(map)
      .map((cat, idx) => ({
        name: cat,
        value: map[cat],
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Six-Month historical data
  const monthlyData = useMemo(() => {
    return [
      { month: "Apr", income: 45000, expense: 22000 },
      { month: "May", income: 52000, expense: 24000 },
      { month: "Jun", income: 58000, expense: 28500 },
      { month: "Jul", income: 61000, expense: 25000 },
      { month: "Aug", income: 68000, expense: 27800 },
      { month: "Sep (Current)", income: income || 72000, expense: expense || 24500 }
    ];
  }, [income, expense]);

  // Boss Battle Stats: The Inflation Behemoth
  const bossStats = useMemo(() => {
    const totalBossHP = Math.max(income, 50000);
    // Damage dealt is your net positive balance
    const damageDealt = Math.max(0, balance);
    const bossRemainingHP = Math.max(0, totalBossHP - damageDealt);
    const bossHPPct = Math.round((bossRemainingHP / totalBossHP) * 100);

    return {
      bossName: "The Lifestyle Creep Dragon 🐉",
      totalHP: totalBossHP,
      currentHP: bossRemainingHP,
      hpPct: bossHPPct,
      isDefeated: bossRemainingHP === 0,
      damageDealt
    };
  }, [income, balance]);

  const handleBossStrike = () => {
    sound.playHit();
    setBossAttackAnim(true);
    setTimeout(() => {
      setBossAttackAnim(false);
      sound.playLevelUp();
    }, 400);
  };

  // Achievement Badges
  const badges = [
    {
      id: "savings_ninja",
      name: "Frugal Ninja",
      icon: "🥷",
      desc: "Maintain a Savings Rate of 25% or higher",
      unlocked: savingsRate >= 25,
      reward: "+400 XP"
    },
    {
      id: "vault_keeper",
      name: "Diamond Vault",
      icon: "💎",
      desc: "Accumulate net positive reserves exceeding ₹25,000",
      unlocked: balance >= 25000,
      reward: "+500 XP"
    },
    {
      id: "ledger_master",
      name: "Ledger Legend",
      icon: "📜",
      desc: "Record at least 8 verified transactions",
      unlocked: transactions.length >= 8,
      reward: "+300 XP"
    },
    {
      id: "cashflow_titan",
      name: "Inflow Sovereign",
      icon: "👑",
      desc: "Generate total inflow greater than ₹50,000",
      unlocked: income >= 50000,
      reward: "+350 XP"
    },
    {
      id: "shield_bearer",
      name: "Budget Shield",
      icon: "🛡️",
      desc: "Track spending across 4 or more distinct categories",
      unlocked: categoryData.length >= 4,
      reward: "+250 XP"
    },
    {
      id: "dragon_slayer",
      name: "Dragon Slayer",
      icon: "⚔️",
      desc: "Deal over 50% damage to the Lifestyle Creep Dragon",
      unlocked: bossStats.hpPct <= 50,
      reward: "+600 XP"
    }
  ];

  function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  }

  // Simulation calculations
  const monthlySavingsSimulation = Math.round(expense * (simulationCut / 100));
  const yearlySavingsSimulation = monthlySavingsSimulation * 12;

  return (
    <div className="page analytics-page game-mode-active">
      {/* Game Header */}
      <div className="page-header game-header-bar">
        <div>
          <div className="eyebrow game-eyebrow">
            <span className="game-star">⭐</span>
            FINANCIAL RPG & BATTLE ARENA
          </div>
          <h1>Wealth Quest: Level {currentLevel}</h1>
          <p>Level up your wealth avatar, slay lifestyle creep, and unlock legendary achievements.</p>
        </div>

        <div className="game-header-controls">
          <button
            className={`sound-toggle-btn ${soundEnabled ? "sound-on" : "sound-off"}`}
            onClick={toggleSound}
            title={soundEnabled ? "Mute Game Audio" : "Enable Game Audio"}
          >
            {soundEnabled ? "🔊 SFX ON" : "🔇 MUTED"}
          </button>
        </div>
      </div>

      {/* Hero Character Card & XP Bar */}
      <div className="rpg-character-banner">
        <div className="character-avatar-zone">
          <div className="avatar-shield-circle">
            <span className="avatar-icon">🧙‍♂️</span>
            <span className="level-badge">LVL {currentLevel}</span>
          </div>
          <div className="character-details">
            <div className="char-rank-row">
              <h2>{levelTitle}</h2>
              <span className="pvp-rank-pill">DIAMOND TIER I</span>
            </div>
            <div className="xp-bar-container">
              <div className="xp-labels">
                <span>EXPERIENCE POINTS (XP)</span>
                <strong>{currentXP} / {nextLevelXP} XP ({xpPercentage}%)</strong>
              </div>
              <div className="xp-track">
                <div className="xp-fill" style={{ width: `${xpPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="character-stats-summary">
          <div className="rpg-stat-box">
            <span className="rpg-stat-label">HEALTH (RESERVES)</span>
            <strong className="rpg-stat-val text-green">{money(balance)}</strong>
          </div>
          <div className="rpg-stat-divider"></div>
          <div className="rpg-stat-box">
            <span className="rpg-stat-label">ARMOR (SAVINGS RATE)</span>
            <strong className="rpg-stat-val text-purple">{savingsRate}% DEF</strong>
          </div>
          <div className="rpg-stat-divider"></div>
          <div className="rpg-stat-box">
            <span className="rpg-stat-label">BURN VELOCITY</span>
            <strong className="rpg-stat-val text-amber">{money(avgDailySpend)}/day</strong>
          </div>
        </div>
      </div>

      {/* Boss Battle Arena: The Lifestyle Creep Dragon */}
      <div className={`boss-battle-card ${bossAttackAnim ? "boss-taking-damage" : ""}`}>
        <div className="boss-header-row">
          <div className="boss-info-group">
            <span className="boss-tag">⚠️ RAID BOSS ENCOUNTER</span>
            <h3>{bossStats.bossName}</h3>
            <p>Your retained savings deal direct damage to the Lifestyle Creep Dragon!</p>
          </div>
          <button
            className="attack-boss-btn"
            onClick={handleBossStrike}
            title="Cast Savings Strike"
          >
            ⚡ Cast Savings Strike!
          </button>
        </div>

        <div className="boss-hp-section">
          <div className="boss-hp-labels">
            <span>BOSS INTEGRITY</span>
            <strong>
              {bossStats.currentHP > 0
                ? `${money(bossStats.currentHP)} HP (${bossStats.hpPct}%)`
                : "DEFEATED! 🎉"}
            </strong>
          </div>
          <div className="boss-hp-track">
            <div
              className={`boss-hp-fill ${bossStats.hpPct < 30 ? "critical-hp" : ""}`}
              style={{ width: `${bossStats.hpPct}%` }}
            ></div>
          </div>
          <div className="boss-status-text">
            <span>
              ⚔️ Total Damage Dealt: <strong className="text-green">{money(bossStats.damageDealt)}</strong>
            </span>
            <span className="boss-combat-badge">
              {bossStats.hpPct < 30 ? "🔥 ENRAGED / NEAR DEFEAT" : "🛡️ ACTIVE THREAT"}
            </span>
          </div>
        </div>
      </div>

      {/* Trophy Cabinet & Achievements */}
      <div className="panel badges-cabinet-panel">
        <div className="panel-heading">
          <div>
            <h2>Trophy Cabinet & Quest Badges</h2>
            <p>Complete financial milestones to unlock legendary prestige medals</p>
          </div>
          <span className="badge-count">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="badges-grid">
          {badges.map(b => (
            <div
              key={b.id}
              className={`badge-card-item ${b.unlocked ? "unlocked" : "locked"} ${selectedBadge?.id === b.id ? "selected" : ""}`}
              onClick={() => {
                setSelectedBadge(b);
                if (b.unlocked) sound.playCoin();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="badge-icon-bubble">
                <span>{b.icon}</span>
                {b.unlocked && <span className="star-corner">⭐</span>}
              </div>
              <strong className="badge-name">{b.name}</strong>
              <small className="badge-desc">{b.desc}</small>
              <div className="badge-footer">
                <span className="badge-reward">{b.reward}</span>
                <span className={`badge-status-pill ${b.unlocked ? "pill-unlocked" : "pill-locked"}`}>
                  {b.unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Financial Time Machine / What-If Simulator */}
      <div className="panel simulator-panel">
        <div className="panel-heading">
          <div>
            <h2>Financial Time Machine: Spend Optimizer</h2>
            <p>Slide to simulate reducing monthly discretionary outlays and calculate compound wealth gain</p>
          </div>
          <span className="simulator-tag">SIMULATOR MINI-GAME</span>
        </div>

        <div className="simulator-body">
          <div className="slider-control-group">
            <div className="slider-label-row">
              <span>Optimization Slider: <strong>Cut Expenses by {simulationCut}%</strong></span>
              <span className="sim-chip">+{Math.round(simulationCut * 20)} Bonus XP</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={simulationCut}
              onChange={(e) => {
                setSimulationCut(Number(e.target.value));
                sound.playCoin();
              }}
              className="game-slider"
            />
            <div className="slider-marks">
              <span>5% (Light)</span>
              <span>25% (Balanced)</span>
              <span>50% (Hardcore Ninja)</span>
            </div>
          </div>

          <div className="simulator-results-grid">
            <div className="sim-result-card">
              <span className="sim-card-title">MONTHLY CASH HARVEST</span>
              <strong className="text-green">+{money(monthlySavingsSimulation)}/mo</strong>
              <small>Extra retained liquidity</small>
            </div>

            <div className="sim-result-card">
              <span className="sim-card-title">1-YEAR COMPOUND FORTUNE</span>
              <strong className="text-purple">+{money(yearlySavingsSimulation)}</strong>
              <small>Projected annual stash</small>
            </div>

            <div className="sim-result-card">
              <span className="sim-card-title">AVATAR XP REWARD</span>
              <strong className="text-amber">+{Math.round(simulationCut * 20)} XP</strong>
              <small>Instant rank booster</small>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log (Charts & Distribution) */}
      <div className="analytics-grid">
        <div className="panel analytics-bar-panel">
          <div className="panel-heading">
            <div>
              <h2>Cash Flow Battle Timeline</h2>
              <p>Six-month comparative income inflows vs expense outlays</p>
            </div>
            <span className="period-label">BATTLE LOG</span>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + "k" : val}`}
                />
                <Tooltip content={<AnalyticsCustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                <Bar
                  dataKey="income"
                  name="Inflow (Heal)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expense"
                  name="Outflow (Damage)"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel analytics-donut-panel">
          <div className="panel-heading">
            <div>
              <h2>Loot Distribution by Category</h2>
              <p>Where your resources were allocated</p>
            </div>
          </div>

          <div className="analytics-donut">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={96}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {categoryData.map((item, index) => (
                      <Cell key={index} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<AnalyticsCustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-card">
                <span>📉</span>
                <p>No expense data logged.</p>
              </div>
            )}
          </div>

          <div className="analytics-category-list">
            {categoryData.map(item => {
              const pct = expense > 0 ? Math.round((item.value / expense) * 100) : 0;
              return (
                <div className="analytics-category-row" key={item.name}>
                  <div className="cat-name-group">
                    <span className="cat-dot" style={{ background: item.color }}></span>
                    <span>{getCategoryIcon(item.name)} {item.name}</span>
                  </div>
                  <div className="cat-val-group">
                    <strong>{money(item.value)}</strong>
                    <span className="cat-pct-chip">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
