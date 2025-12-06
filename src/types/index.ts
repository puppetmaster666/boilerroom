// Core game types

export type CallerTier = 1 | 2 | 3 | 4;
export type CallerPersonality = 'loyal' | 'greedy' | 'nervous';
export type TrustLevel = 1 | 2 | 3 | 4 | 5;
export type MarkSentiment = 'happy' | 'neutral' | 'suspicious' | 'angry';
export type OfficeLevel = 'home' | 'small' | 'full' | 'empire';
export type Volatility = 'low' | 'medium' | 'high' | 'extreme';
export type InvestigationType = 'audit' | 'raid' | 'subpoena' | 'indictment';

export interface Caller {
  id: string;
  name: string;
  tier: CallerTier;
  personality: CallerPersonality;
  callsPerDay: number;
  conversionRate: number;
  salary: number;
  daysEmployed: number;
}

export interface Mark {
  id: string;
  name: string;
  netWorth: number;
  trust: TrustLevel;
  holdings: Record<string, number>;
  sentiment: MarkSentiment;
  daysAsClient: number;
  invested: number; // total $ invested with us
}

export interface StockState {
  key: string;
  name: string;
  sector: string;
  price: number;
  previousPrice: number;
  isBlueChip: boolean;
  volatility: Volatility;
  hypeMultiplier: number;
  marketCap: number;
}

export interface Holding {
  stockKey: string;
  shares: number;
  avgCost: number;
}

export interface PumpState {
  stockKey: string;
  daysActive: number;
  totalVolumePumped: number;
  peakPrice: number;
  startPrice: number;
}

export interface Investigation {
  type: InvestigationType;
  daysRemaining: number;
  severity: number;
}

export interface GameState {
  // Meta
  firmName: string;
  day: number;
  gameStarted: boolean;
  gameOver: boolean;
  gameOverReason: string | null;
  won: boolean;

  // Resources
  cash: number;
  heat: number;
  reputation: number;

  // Office
  officeLevel: OfficeLevel;
  callers: Caller[];

  // Stocks
  stocks: Record<string, StockState>;
  portfolio: Record<string, Holding>;

  // Marks
  marks: Mark[];

  // Active operations
  activePump: PumpState | null;
  activeInvestigation: Investigation | null;
  currentEvent: GameEvent | null;

  // Flags
  hasRatHole: boolean;
  blockingSells: boolean;

  // Stats
  totalEarnings: number;
  totalPumps: number;
  marksScammed: number;
}

// Event types
export interface GameEvent {
  id: string;
  type: 'market' | 'personal' | 'investigation';
  title: string;
  description: string;
  choices?: EventChoice[];
  effect?: () => void;
}

export interface EventChoice {
  text: string;
  effect: () => void;
}
