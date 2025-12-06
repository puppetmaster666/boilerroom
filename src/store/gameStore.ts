import { create } from 'zustand';
import {
  GameState,
  GameEvent,
  Caller,
  Mark,
  StockState,
  Holding,
  PumpState,
  Investigation,
  OfficeLevel,
  CallerTier,
} from '../types';
import { createInitialStocks, VOLATILITY_MULTIPLIERS } from '../data/stocks';
import {
  CALLER_TIERS,
  OFFICE_CAPACITY,
  OFFICE_COSTS,
  generateCallerName,
  generatePersonality,
  PERSONALITY_EFFECTS,
} from '../data/callers';
import { generateMarkName, generateMarkNetWorth } from '../data/names';
import { generateId, randomInRange, clamp, chance, addVariance } from '../utils/random';
import { saveGame, loadGame, deleteSave } from '../utils/storage';
import { pickRandomEvent, createEventFromTemplate } from '../data/events';

// Initial state factory
const createInitialState = (): GameState => ({
  firmName: '',
  day: 1,
  gameStarted: false,
  gameOver: false,
  gameOverReason: null,
  won: false,

  cash: 5000, // Starting loan "from a guy"
  heat: 0,
  reputation: 50, // Neutral starting reputation

  officeLevel: 'home',
  callers: [],

  stocks: createInitialStocks(),
  portfolio: {},

  marks: [],

  activePump: null,
  activeInvestigation: null,
  currentEvent: null,

  hasRatHole: false,
  blockingSells: false,

  totalEarnings: 0,
  totalPumps: 0,
  marksScammed: 0,
});

// Calculate net worth
const calculateNetWorth = (state: GameState): number => {
  let worth = state.cash;

  // Add portfolio value
  Object.values(state.portfolio).forEach(holding => {
    const stock = state.stocks[holding.stockKey];
    if (stock) {
      worth += holding.shares * stock.price;
    }
  });

  return worth;
};

// Store interface
interface GameStore extends GameState {
  // Computed
  netWorth: () => number;
  weeklyExpenses: () => number;
  callerCapacity: () => number;

  // Game lifecycle
  startNewGame: (firmName: string) => void;
  loadSavedGame: () => Promise<boolean>;
  saveCurrentGame: () => Promise<void>;
  resetGame: () => void;

  // Day progression
  advanceDay: () => void;

  // Trading
  buyStock: (stockKey: string, shares: number) => boolean;
  sellStock: (stockKey: string, shares: number) => boolean;

  // Callers
  hireCaller: (tier: CallerTier) => boolean;
  fireCaller: (callerId: string) => void;

  // Office
  upgradeOffice: () => boolean;

  // Marks
  acquireMark: () => void;
  processMarks: () => void;
  sellToMark: (markId: string, stockKey: string, shares: number) => boolean;

  // Pumping
  startPump: (stockKey: string) => boolean;
  endPump: () => void;

  // Heat management
  addHeat: (amount: number) => void;
  reduceHeat: (amount: number) => void;
  bribeCop: (level: 'beat' | 'detective' | 'captain') => boolean;
  hireLawyer: (level: 'basic' | 'good' | 'best') => boolean;
  useFallGuy: () => boolean;

  // Events
  dismissEvent: () => void;
  handleEventChoice: (effectKey: string) => void;

  // Internal
  _updateStockPrices: () => void;
  _processWeeklyExpenses: () => void;
  _checkWinLose: () => void;
  _processPump: () => void;
  _triggerRandomEvent: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  // Computed values
  netWorth: () => calculateNetWorth(get()),

  weeklyExpenses: () => {
    const state = get();
    let expenses = 0;

    // Office rent
    expenses += OFFICE_COSTS[state.officeLevel].rent;

    // Caller salaries
    state.callers.forEach(caller => {
      expenses += caller.salary;
    });

    return expenses;
  },

  callerCapacity: () => {
    return OFFICE_CAPACITY[get().officeLevel];
  },

  // Game lifecycle
  startNewGame: (firmName: string) => {
    set({
      ...createInitialState(),
      firmName,
      gameStarted: true,
    });
  },

  loadSavedGame: async () => {
    const saved = await loadGame();
    if (saved) {
      set(saved);
      return true;
    }
    return false;
  },

  saveCurrentGame: async () => {
    const state = get();
    await saveGame(state);
  },

  resetGame: () => {
    deleteSave();
    set(createInitialState());
  },

  // Day progression
  advanceDay: () => {
    const state = get();
    if (state.gameOver) return;

    // Update stock prices
    get()._updateStockPrices();

    // Process pump if active
    if (state.activePump) {
      get()._processPump();
    }

    // Process weekly expenses on day 7, 14, 21, etc.
    if (state.day % 7 === 0) {
      get()._processWeeklyExpenses();
    }

    // Acquire new marks from cold calls
    get().acquireMark();

    // Process existing marks (check trust, sentiment)
    get().processMarks();

    // Natural heat decay when not pumping
    if (!state.activePump) {
      get().reduceHeat(3);
    }

    // Trigger random event
    get()._triggerRandomEvent();

    // Increment day
    set(s => ({ day: s.day + 1 }));

    // Check win/lose conditions
    get()._checkWinLose();

    // Auto-save
    get().saveCurrentGame();
  },

  // Trading
  buyStock: (stockKey: string, shares: number) => {
    const state = get();
    const stock = state.stocks[stockKey];
    if (!stock) return false;

    const cost = shares * stock.price;
    if (cost > state.cash) return false;

    const existing = state.portfolio[stockKey];
    const newShares = (existing?.shares || 0) + shares;
    const newAvgCost = existing
      ? ((existing.shares * existing.avgCost) + cost) / newShares
      : stock.price;

    set(s => ({
      cash: s.cash - cost,
      portfolio: {
        ...s.portfolio,
        [stockKey]: {
          stockKey,
          shares: newShares,
          avgCost: newAvgCost,
        },
      },
    }));

    return true;
  },

  sellStock: (stockKey: string, shares: number) => {
    const state = get();
    const stock = state.stocks[stockKey];
    const holding = state.portfolio[stockKey];

    if (!stock || !holding || holding.shares < shares) return false;

    const revenue = shares * stock.price;
    const profit = revenue - (shares * holding.avgCost);
    const remainingShares = holding.shares - shares;

    set(s => {
      const newPortfolio = { ...s.portfolio };
      if (remainingShares <= 0) {
        delete newPortfolio[stockKey];
      } else {
        newPortfolio[stockKey] = {
          ...holding,
          shares: remainingShares,
        };
      }

      return {
        cash: s.cash + revenue,
        portfolio: newPortfolio,
        totalEarnings: profit > 0 ? s.totalEarnings + profit : s.totalEarnings,
      };
    });

    return true;
  },

  // Callers
  hireCaller: (tier: CallerTier) => {
    const state = get();
    const template = CALLER_TIERS[tier];
    const capacity = OFFICE_CAPACITY[state.officeLevel];

    if (state.callers.length >= capacity) return false;
    if (state.cash < template.costToHire) return false;

    const personality = generatePersonality();
    const personalityEffect = PERSONALITY_EFFECTS[personality];

    const newCaller: Caller = {
      id: generateId(),
      name: generateCallerName(),
      tier,
      personality,
      callsPerDay: template.callsPerDay,
      conversionRate: template.conversionRate,
      salary: Math.floor(template.salary * personalityEffect.salaryMultiplier),
      daysEmployed: 0,
    };

    set(s => ({
      cash: s.cash - template.costToHire,
      callers: [...s.callers, newCaller],
    }));

    return true;
  },

  fireCaller: (callerId: string) => {
    set(s => ({
      callers: s.callers.filter(c => c.id !== callerId),
    }));
  },

  // Office
  upgradeOffice: () => {
    const state = get();
    const levels: OfficeLevel[] = ['home', 'small', 'full', 'empire'];
    const currentIndex = levels.indexOf(state.officeLevel);

    if (currentIndex >= levels.length - 1) return false;

    const nextLevel = levels[currentIndex + 1];
    const cost = OFFICE_COSTS[nextLevel].upgrade;

    if (state.cash < cost) return false;

    set(s => ({
      cash: s.cash - cost,
      officeLevel: nextLevel,
    }));

    return true;
  },

  // Marks
  acquireMark: () => {
    const state = get();

    // Calculate total calls per day
    let totalCalls = 50; // You make 50 calls yourself
    state.callers.forEach(caller => {
      totalCalls += caller.callsPerDay;
    });

    // Base conversion rate (yours is 8%)
    let avgConversion = 0.08;
    if (state.callers.length > 0) {
      const totalConversion = 0.08 + state.callers.reduce((sum, c) => sum + c.conversionRate, 0);
      avgConversion = totalConversion / (1 + state.callers.length);
    }

    // Reputation affects conversion
    const reputationBonus = (state.reputation - 50) / 500; // -10% to +10%

    // Expected marks = calls * conversion * reputation
    const expectedMarks = totalCalls * avgConversion * (1 + reputationBonus);

    // Add some randomness
    const newMarks = Math.floor(expectedMarks * randomInRange(0.5, 1.5));

    // Create new marks
    const marks: Mark[] = [];
    for (let i = 0; i < newMarks; i++) {
      marks.push({
        id: generateId(),
        name: generateMarkName(),
        netWorth: generateMarkNetWorth(),
        trust: 1,
        holdings: {},
        sentiment: 'neutral',
        daysAsClient: 0,
        invested: 0,
      });
    }

    if (marks.length > 0) {
      set(s => ({
        marks: [...s.marks, ...marks],
      }));
    }
  },

  processMarks: () => {
    // Process mark sentiment and trust changes based on their holdings
    set(s => {
      const updatedMarks = s.marks.map(mark => {
        let trustChange = 0;
        let newSentiment = mark.sentiment;

        // Check each holding
        Object.entries(mark.holdings).forEach(([stockKey, shares]) => {
          const stock = s.stocks[stockKey];
          if (!stock) return;

          // Very simplified: if price went up, trust increases
          const priceChange = (stock.price - stock.previousPrice) / stock.previousPrice;

          if (priceChange > 0.1) {
            trustChange += 1;
            newSentiment = 'happy';
          } else if (priceChange < -0.2) {
            trustChange -= 1;
            newSentiment = 'suspicious';
          }
        });

        const newTrust = clamp(mark.trust + trustChange, 1, 5) as 1 | 2 | 3 | 4 | 5;

        return {
          ...mark,
          trust: newTrust,
          sentiment: newSentiment,
          daysAsClient: mark.daysAsClient + 1,
        };
      });

      return { marks: updatedMarks };
    });
  },

  sellToMark: (markId: string, stockKey: string, shares: number) => {
    const state = get();
    const mark = state.marks.find(m => m.id === markId);
    const stock = state.stocks[stockKey];

    if (!mark || !stock || shares <= 0) return false;

    // Check if mark can buy this stock based on trust
    const isPennyStock = !stock.isBlueChip;
    if (isPennyStock && mark.trust < 3) return false;

    const cost = shares * stock.price;

    // Update mark's holdings
    set(s => ({
      marks: s.marks.map(m => {
        if (m.id !== markId) return m;

        const existingShares = m.holdings[stockKey] || 0;
        return {
          ...m,
          holdings: {
            ...m.holdings,
            [stockKey]: existingShares + shares,
          },
          invested: m.invested + cost,
        };
      }),
      // You get a commission (10% of sale)
      cash: s.cash + Math.floor(cost * 0.1),
    }));

    return true;
  },

  // Pumping
  startPump: (stockKey: string) => {
    const state = get();
    const stock = state.stocks[stockKey];

    if (!stock || stock.isBlueChip) return false;
    if (state.activePump) return false;

    set({
      activePump: {
        stockKey,
        daysActive: 0,
        totalVolumePumped: 0,
        peakPrice: stock.price,
        startPrice: stock.price,
      },
    });

    return true;
  },

  endPump: () => {
    const state = get();
    if (!state.activePump) return;

    // Reset hype multiplier
    set(s => ({
      activePump: null,
      stocks: {
        ...s.stocks,
        [state.activePump!.stockKey]: {
          ...s.stocks[state.activePump!.stockKey],
          hypeMultiplier: 1.0,
        },
      },
      totalPumps: s.totalPumps + 1,
    }));
  },

  // Heat management
  addHeat: (amount: number) => {
    set(s => ({
      heat: clamp(s.heat + amount, 0, 100),
    }));
  },

  reduceHeat: (amount: number) => {
    set(s => ({
      heat: clamp(s.heat - amount, 0, 100),
    }));
  },

  bribeCop: (level: 'beat' | 'detective' | 'captain') => {
    const state = get();
    const costs = { beat: 5000, detective: 20000, captain: 75000 };
    const reduction = { beat: 10, detective: 20, captain: 35 };
    const successRate = { beat: 0.9, detective: 0.75, captain: 0.6 };

    const cost = costs[level];
    if (state.cash < cost) return false;

    set(s => ({ cash: s.cash - cost }));

    if (chance(successRate[level])) {
      get().reduceHeat(reduction[level]);
      return true;
    } else {
      // Failed bribe - more heat!
      get().addHeat(20);
      return false;
    }
  },

  hireLawyer: (level: 'basic' | 'good' | 'best') => {
    const state = get();
    const costs = { basic: 10000, good: 50000, best: 200000 };
    const reduction = { basic: 15, good: 30, best: 50 };

    const cost = costs[level];
    if (state.cash < cost) return false;

    set(s => ({ cash: s.cash - cost }));
    get().reduceHeat(reduction[level]);

    return true;
  },

  useFallGuy: () => {
    const state = get();
    if (state.callers.length === 0) return false;
    if (state.cash < 10000) return false;

    // Remove a random caller (preferably nervous/greedy)
    const sortedCallers = [...state.callers].sort((a, b) => {
      const priority = { nervous: 0, greedy: 1, loyal: 2 };
      return priority[a.personality] - priority[b.personality];
    });

    const fallGuy = sortedCallers[0];

    set(s => ({
      cash: s.cash - 10000,
      callers: s.callers.filter(c => c.id !== fallGuy.id),
    }));

    get().reduceHeat(40);

    return true;
  },

  // Events
  dismissEvent: () => {
    set({ currentEvent: null });
  },

  handleEventChoice: (effectKey: string) => {
    const state = get();

    // Event effect handlers
    const effects: Record<string, () => void> = {
      // Market events
      bullMarket: () => {
        // All stocks get +10-20% boost
        set(s => ({
          stocks: Object.fromEntries(
            Object.entries(s.stocks).map(([key, stock]) => [
              key,
              { ...stock, price: stock.price * (1 + randomInRange(0.1, 0.2)) },
            ])
          ),
        }));
      },
      bearMarket: () => {
        // All stocks drop 10-20%
        set(s => ({
          stocks: Object.fromEntries(
            Object.entries(s.stocks).map(([key, stock]) => [
              key,
              { ...stock, price: Math.max(0.01, stock.price * (1 - randomInRange(0.1, 0.2))) },
            ])
          ),
        }));
      },
      techBoom: () => {
        // Tech stocks surge
        set(s => ({
          stocks: Object.fromEntries(
            Object.entries(s.stocks).map(([key, stock]) => [
              key,
              stock.sector === 'tech'
                ? { ...stock, price: stock.price * 1.25 }
                : stock,
            ])
          ),
        }));
      },
      energyCrisis: () => {
        // Energy stocks volatile
        set(s => ({
          stocks: Object.fromEntries(
            Object.entries(s.stocks).map(([key, stock]) => [
              key,
              stock.sector === 'energy'
                ? { ...stock, price: stock.price * randomInRange(0.7, 1.3) }
                : stock,
            ])
          ),
        }));
      },
      hotTip: () => {
        // Boost OMEGA stock
        set(s => ({
          stocks: {
            ...s.stocks,
            OMEGA: s.stocks.OMEGA
              ? { ...s.stocks.OMEGA, price: s.stocks.OMEGA.price * 1.15 }
              : s.stocks.OMEGA,
          },
        }));
      },

      // Personal events
      callerFlips: () => {
        get().addHeat(30);
        // Remove a random caller
        if (state.callers.length > 0) {
          const idx = Math.floor(Math.random() * state.callers.length);
          set(s => ({ callers: s.callers.filter((_, i) => i !== idx) }));
        }
      },
      luckyBreak: () => {
        get().reduceHeat(25);
      },
      whistleblower: () => {
        get().addHeat(15);
      },
      rivalFirm: () => {
        // Lose some marks to competition
        set(s => ({
          marks: s.marks.slice(Math.floor(s.marks.length * 0.8)),
        }));
      },
      markWindfall: () => {
        // Upgrade a random mark's net worth
        set(s => {
          if (s.marks.length === 0) return {};
          const marks = [...s.marks];
          const idx = Math.floor(Math.random() * marks.length);
          marks[idx] = { ...marks[idx], netWorth: marks[idx].netWorth + 500000 };
          return { marks };
        });
      },
      officeTheft: () => {
        const stolen = Math.min(state.cash, Math.floor(state.cash * 0.1) + 5000);
        set(s => ({ cash: s.cash - stolen }));
      },

      // Media choices
      mediaLayLow: () => {
        get().reduceHeat(5);
      },
      mediaBribe: () => {
        if (state.cash >= 25000) {
          set(s => ({ cash: s.cash - 25000 }));
          get().reduceHeat(10);
        }
      },
      mediaIgnore: () => {
        get().addHeat(10);
      },

      // Star caller choices
      hireStarCaller: () => {
        if (state.cash >= 50000) {
          const capacity = OFFICE_CAPACITY[state.officeLevel];
          if (state.callers.length < capacity) {
            const starCaller: Caller = {
              id: generateId(),
              name: 'Danny "The Closer" Porush',
              tier: 4,
              personality: 'greedy',
              callsPerDay: 150,
              conversionRate: 0.25,
              salary: 5000,
              daysEmployed: 0,
            };
            set(s => ({
              cash: s.cash - 50000,
              callers: [...s.callers, starCaller],
            }));
          }
        }
      },
      passStarCaller: () => {
        // No effect
      },

      // Investigation events
      secInquiry: () => {
        get().addHeat(10);
      },
      cutSuspiciousMark: () => {
        // Remove one mark but reduce heat
        set(s => ({
          marks: s.marks.slice(0, -1),
        }));
        get().reduceHeat(5);
      },
      keepSuspiciousMark: () => {
        // 50% chance it's an undercover
        if (chance(0.5)) {
          get().addHeat(25);
        }
      },
      auditNotice: () => {
        get().addHeat(15);
      },
      shredDocuments: () => {
        if (state.cash >= 10000) {
          set(s => ({ cash: s.cash - 10000 }));
          get().reduceHeat(20);
        }
      },
      fleeEarly: () => {
        if (state.cash >= 100000) {
          set(s => ({ cash: s.cash - 100000, heat: 0 }));
        }
      },
      rideItOut: () => {
        // 30% chance of raid
        if (chance(0.3)) {
          get().addHeat(35);
        }
      },
    };

    // Execute the effect
    const effect = effects[effectKey];
    if (effect) {
      effect();
    }

    // Clear the event
    get().dismissEvent();
  },

  // Internal methods
  _updateStockPrices: () => {
    set(s => {
      const updatedStocks: Record<string, StockState> = {};

      Object.values(s.stocks).forEach(stock => {
        if (!stock) return;
        const volatility = VOLATILITY_MULTIPLIERS[stock.volatility];
        let priceChange = randomInRange(-volatility, volatility);

        // Blue chips have slight upward bias
        if (stock.isBlueChip) {
          priceChange += 0.002;
        }

        // If this stock is being pumped, add pump effect
        if (s.activePump?.stockKey === stock.key) {
          const pumpBonus = 0.15 * stock.hypeMultiplier;
          priceChange += pumpBonus;
        }

        const newPrice = Math.max(0.01, stock.price * (1 + priceChange));

        updatedStocks[stock.key] = {
          ...stock,
          previousPrice: stock.price,
          price: Number(newPrice.toFixed(2)),
        };
      });

      return { stocks: updatedStocks };
    });
  },

  _processWeeklyExpenses: () => {
    const expenses = get().weeklyExpenses();
    set(s => ({
      cash: s.cash - expenses,
      callers: s.callers.map(c => ({
        ...c,
        daysEmployed: c.daysEmployed + 7,
      })),
    }));
  },

  _processPump: () => {
    const state = get();
    if (!state.activePump) return;

    const pump = state.activePump;
    const stock = state.stocks[pump.stockKey];

    // Calculate pump volume from marks with trust >= 3
    let pumpVolume = 0;
    const trustingMarks = state.marks.filter(m => m.trust >= 3);
    trustingMarks.forEach(mark => {
      const investAmount = mark.netWorth * 0.1; // They invest 10% of net worth per day
      pumpVolume += investAmount;
    });

    // Add heat based on volume
    let heatGain = 5; // Base
    if (pumpVolume > 10000) heatGain = 10;
    if (pumpVolume > 50000) heatGain = 15;
    if (pumpVolume > 200000) heatGain = 25;
    heatGain = addVariance(heatGain, 2);
    get().addHeat(Math.floor(heatGain));

    // Decay hype multiplier
    const newHype = Math.max(0.2, stock.hypeMultiplier * 0.85);

    // Check if pump is dead (7 days max)
    const newDaysActive = pump.daysActive + 1;
    if (newDaysActive >= 7) {
      get().endPump();
      return;
    }

    set(s => ({
      activePump: {
        ...pump,
        daysActive: newDaysActive,
        totalVolumePumped: pump.totalVolumePumped + pumpVolume,
        peakPrice: Math.max(pump.peakPrice, stock.price),
      },
      stocks: {
        ...s.stocks,
        [pump.stockKey]: {
          ...stock,
          hypeMultiplier: newHype,
        },
      },
    }));
  },

  _checkWinLose: () => {
    const state = get();
    const netWorth = calculateNetWorth(state);

    // Lose conditions
    if (state.heat >= 100) {
      set({
        gameOver: true,
        gameOverReason: 'ARRESTED! The feds finally caught up with you.',
        won: false,
      });
      return;
    }

    if (netWorth < 0) {
      set({
        gameOver: true,
        gameOverReason: 'BANKRUPT! You lost everything.',
        won: false,
      });
      return;
    }

    // Win condition
    if (netWorth >= 10000000) {
      let winType = 'Dirty Escape';
      if (state.heat < 25) winType = 'Clean Escape';
      if (state.heat < 10) winType = 'Legitimate Exit';

      set({
        gameOver: true,
        gameOverReason: `${winType}! You made it out with $${(netWorth / 1000000).toFixed(1)}M!`,
        won: true,
      });
    }
  },

  _triggerRandomEvent: () => {
    const state = get();
    // 20% chance of event per day, increased if not pumping
    const eventChance = state.activePump ? 0.15 : 0.25;

    if (chance(eventChance)) {
      const template = pickRandomEvent(state.day, state.heat, state.callers.length > 0);
      if (template) {
        const event = createEventFromTemplate(template);

        // If no choices, auto-apply effect
        if (!template.choices && template.effectKey) {
          get().handleEventChoice(template.effectKey);
          // Set event briefly for display
          set({ currentEvent: event });
        } else {
          set({ currentEvent: event });
        }
      }
    }
  },
}));
