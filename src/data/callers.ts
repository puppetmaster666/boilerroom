import { CallerTier, CallerPersonality } from '../types';

export interface CallerTemplate {
  tier: CallerTier;
  name: string;
  costToHire: number;
  salary: number;
  callsPerDay: number;
  conversionRate: number;
  description: string;
}

export const CALLER_TIERS: Record<CallerTier, CallerTemplate> = {
  1: {
    tier: 1,
    name: 'Rookie',
    costToHire: 1000,
    salary: 500,
    callsPerDay: 50,
    conversionRate: 0.05,
    description: 'Fresh out of college. Eager but green.',
  },
  2: {
    tier: 2,
    name: 'Smooth Talker',
    costToHire: 5000,
    salary: 1000,
    callsPerDay: 75,
    conversionRate: 0.10,
    description: 'Knows the script. Can close small fish.',
  },
  3: {
    tier: 3,
    name: 'Closer',
    costToHire: 15000,
    salary: 3000,
    callsPerDay: 100,
    conversionRate: 0.15,
    description: 'Never takes no for an answer.',
  },
  4: {
    tier: 4,
    name: 'Shark',
    costToHire: 50000,
    salary: 8000,
    callsPerDay: 150,
    conversionRate: 0.25,
    description: 'Could sell ice to an Eskimo. Top predator.',
  },
};

// Personality effects
export const PERSONALITY_EFFECTS: Record<CallerPersonality, {
  flipChance: number;
  description: string;
  salaryMultiplier: number;
}> = {
  loyal: {
    flipChance: 0.02, // 2% chance to flip to feds when pressured
    description: 'Reliable. Will take the fall for you.',
    salaryMultiplier: 1.2, // Costs 20% more
  },
  greedy: {
    flipChance: 0.10, // 10% chance to flip
    description: 'Only cares about money. Will sell you out.',
    salaryMultiplier: 0.9, // Cheaper
  },
  nervous: {
    flipChance: 0.25, // 25% chance to flip under pressure
    description: 'Easily spooked. First to crack.',
    salaryMultiplier: 0.8, // Cheapest
  },
};

// Office capacity by level
export const OFFICE_CAPACITY = {
  home: 0, // Just you, no callers
  small: 5,
  full: 15,
  empire: 25,
};

// Office costs
export const OFFICE_COSTS = {
  home: { upgrade: 0, rent: 0 },
  small: { upgrade: 10000, rent: 2000 },
  full: { upgrade: 50000, rent: 10000 },
  empire: { upgrade: 200000, rent: 25000 },
};

// Random name generator for callers
const FIRST_NAMES = [
  'Tony', 'Vinny', 'Joey', 'Sal', 'Mike', 'Frank', 'Johnny', 'Bobby',
  'Danny', 'Paulie', 'Carmine', 'Rico', 'Gio', 'Marco', 'Nicky',
  'Chad', 'Brad', 'Todd', 'Skip', 'Chip', 'Biff', 'Brett', 'Trevor',
];

const LAST_NAMES = [
  'Moretti', 'Russo', 'Colombo', 'Romano', 'Ferrari', 'Bianchi',
  'Goldman', 'Silverman', 'Rothstein', 'Weinberg', 'Berkowitz',
  'Smith', 'Johnson', 'Williams', 'Davis', 'Miller', 'Wilson',
];

export const generateCallerName = (): string => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

export const generatePersonality = (): CallerPersonality => {
  const roll = Math.random();
  if (roll < 0.2) return 'loyal';
  if (roll < 0.6) return 'greedy';
  return 'nervous';
};
