// Random events that can occur during gameplay
import { GameEvent } from '../types';
import { generateId } from '../utils/random';

// Event templates - effects are applied in the store
export interface EventTemplate {
  type: 'market' | 'personal' | 'investigation';
  title: string;
  description: string;
  weight: number; // Higher = more likely
  minDay: number; // Earliest day this can appear
  minHeat?: number; // Minimum heat required
  maxHeat?: number; // Maximum heat allowed
  choices?: {
    text: string;
    effectKey: string; // Key to look up effect in store
  }[];
  effectKey?: string; // For single-effect events
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  // Market Events
  {
    type: 'market',
    title: 'BULL MARKET',
    description: 'Wall Street is buzzing! All stocks trending up for the next few days.',
    weight: 15,
    minDay: 3,
    effectKey: 'bullMarket',
  },
  {
    type: 'market',
    title: 'BEAR MARKET',
    description: 'Market crash incoming. Prices falling across the board.',
    weight: 10,
    minDay: 5,
    effectKey: 'bearMarket',
  },
  {
    type: 'market',
    title: 'TECH SECTOR BOOM',
    description: 'Tech stocks are on fire! APEX, NEXTECH surging.',
    weight: 12,
    minDay: 2,
    effectKey: 'techBoom',
  },
  {
    type: 'market',
    title: 'ENERGY CRISIS',
    description: 'Oil prices spike. Energy sector in chaos.',
    weight: 8,
    minDay: 7,
    effectKey: 'energyCrisis',
  },
  {
    type: 'market',
    title: 'HOT TIP',
    description: 'Your cousin works at Goldman. He says OMEGA is about to announce a big contract.',
    weight: 10,
    minDay: 1,
    effectKey: 'hotTip',
  },

  // Personal Events
  {
    type: 'personal',
    title: 'CALLER FLIPS',
    description: 'One of your callers got picked up by the feds. They\'re singing like a canary!',
    weight: 8,
    minDay: 14,
    minHeat: 30,
    effectKey: 'callerFlips',
  },
  {
    type: 'personal',
    title: 'LUCKY BREAK',
    description: 'Evidence warehouse fire. Some files related to your operation were "lost".',
    weight: 5,
    minDay: 10,
    minHeat: 40,
    effectKey: 'luckyBreak',
  },
  {
    type: 'personal',
    title: 'WHISTLEBLOWER',
    description: 'A former mark is talking to reporters. This could get ugly.',
    weight: 7,
    minDay: 10,
    minHeat: 20,
    effectKey: 'whistleblower',
  },
  {
    type: 'personal',
    title: 'RIVAL FIRM',
    description: 'Another boiler room is muscling into your territory. Competition for marks!',
    weight: 10,
    minDay: 7,
    effectKey: 'rivalFirm',
  },
  {
    type: 'personal',
    title: 'MEDIA ATTENTION',
    description: 'A journalist is sniffing around penny stocks. Lay low or make a move?',
    weight: 8,
    minDay: 14,
    choices: [
      { text: 'Lay low (-5 Heat, no pump for 3 days)', effectKey: 'mediaLayLow' },
      { text: 'Bribe journalist ($25,000)', effectKey: 'mediaBribe' },
      { text: 'Ignore it', effectKey: 'mediaIgnore' },
    ],
  },
  {
    type: 'personal',
    title: 'MARK WINDFALL',
    description: 'One of your marks just inherited $500,000. They want to invest it all with you.',
    weight: 12,
    minDay: 5,
    effectKey: 'markWindfall',
  },
  {
    type: 'personal',
    title: 'OFFICE THEFT',
    description: 'Someone broke in overnight. You\'re missing cash from the safe.',
    weight: 6,
    minDay: 7,
    effectKey: 'officeTheft',
  },
  {
    type: 'personal',
    title: 'STAR CALLER',
    description: 'A legendary closer wants to join your team. But he doesn\'t come cheap.',
    weight: 8,
    minDay: 10,
    choices: [
      { text: 'Hire him ($50,000)', effectKey: 'hireStarCaller' },
      { text: 'Pass', effectKey: 'passStarCaller' },
    ],
  },

  // Investigation Events
  {
    type: 'investigation',
    title: 'SEC INQUIRY',
    description: 'The SEC has requested trading records. This looks routine... for now.',
    weight: 10,
    minDay: 10,
    minHeat: 35,
    effectKey: 'secInquiry',
  },
  {
    type: 'investigation',
    title: 'SUSPICIOUS MARK',
    description: 'A mark is asking too many questions. Could be undercover.',
    weight: 12,
    minDay: 7,
    minHeat: 20,
    choices: [
      { text: 'Cut them loose', effectKey: 'cutSuspiciousMark' },
      { text: 'Keep selling to them', effectKey: 'keepSuspiciousMark' },
    ],
  },
  {
    type: 'investigation',
    title: 'AUDIT NOTICE',
    description: 'IRS wants to audit your firm\'s books. Better get a lawyer.',
    weight: 8,
    minDay: 14,
    minHeat: 40,
    effectKey: 'auditNotice',
  },
  {
    type: 'investigation',
    title: 'TIP-OFF',
    description: 'A friendly detective gives you a heads up - they\'re planning a raid next week.',
    weight: 5,
    minDay: 21,
    minHeat: 50,
    choices: [
      { text: 'Shred everything ($10,000)', effectKey: 'shredDocuments' },
      { text: 'Flee now ($100,000)', effectKey: 'fleeEarly' },
      { text: 'Ride it out', effectKey: 'rideItOut' },
    ],
  },
];

// Pick a random event based on current game state
export const pickRandomEvent = (
  day: number,
  heat: number,
  hasCallers: boolean
): EventTemplate | null => {
  // Filter eligible events
  const eligible = EVENT_TEMPLATES.filter(e => {
    if (day < e.minDay) return false;
    if (e.minHeat && heat < e.minHeat) return false;
    if (e.maxHeat && heat > e.maxHeat) return false;
    // Can't have caller flip if no callers
    if (e.effectKey === 'callerFlips' && !hasCallers) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  // Weighted random selection
  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const event of eligible) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }

  return eligible[0];
};

// Create a GameEvent from a template
export const createEventFromTemplate = (template: EventTemplate): GameEvent => {
  return {
    id: generateId(),
    type: template.type,
    title: template.title,
    description: template.description,
    choices: template.choices?.map(c => ({
      text: c.text,
      effect: () => {}, // Will be replaced in store
    })),
  };
};
