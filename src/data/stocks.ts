import { StockState } from '../types';

// Penny stocks - can be pumped
export const PENNY_STOCKS: StockState[] = [
  {
    key: 'MDYN',
    name: 'MicroDyne',
    sector: 'tech',
    price: 0.50,
    previousPrice: 0.50,
    isBlueChip: false,
    volatility: 'high',
    hypeMultiplier: 1.0,
    marketCap: 500000,
  },
  {
    key: 'BGEN',
    name: 'BioGen Labs',
    sector: 'pharma',
    price: 1.00,
    previousPrice: 1.00,
    isBlueChip: false,
    volatility: 'high',
    hypeMultiplier: 1.0,
    marketCap: 1000000,
  },
  {
    key: 'TCOM',
    name: 'TeleCom Plus',
    sector: 'telecom',
    price: 0.25,
    previousPrice: 0.25,
    isBlueChip: false,
    volatility: 'extreme',
    hypeMultiplier: 1.0,
    marketCap: 250000,
  },
  {
    key: 'DSFT',
    name: 'DataSoft Inc',
    sector: 'software',
    price: 2.00,
    previousPrice: 2.00,
    isBlueChip: false,
    volatility: 'medium',
    hypeMultiplier: 1.0,
    marketCap: 2000000,
  },
  {
    key: 'OTEX',
    name: 'OilTex Energy',
    sector: 'energy',
    price: 1.50,
    previousPrice: 1.50,
    isBlueChip: false,
    volatility: 'high',
    hypeMultiplier: 1.0,
    marketCap: 1500000,
  },
  {
    key: 'AMAX',
    name: 'AeroMax',
    sector: 'defense',
    price: 3.00,
    previousPrice: 3.00,
    isBlueChip: false,
    volatility: 'medium',
    hypeMultiplier: 1.0,
    marketCap: 3000000,
  },
];

// Blue chip stocks - safe, for building trust
export const BLUE_CHIP_STOCKS: StockState[] = [
  {
    key: 'GLD',
    name: 'Goldman & Co',
    sector: 'finance',
    price: 100.00,
    previousPrice: 100.00,
    isBlueChip: true,
    volatility: 'low',
    hypeMultiplier: 1.0,
    marketCap: 100000000,
  },
  {
    key: 'IBM',
    name: 'IBM Corp',
    sector: 'tech',
    price: 120.00,
    previousPrice: 120.00,
    isBlueChip: true,
    volatility: 'low',
    hypeMultiplier: 1.0,
    marketCap: 150000000,
  },
  {
    key: 'ATT',
    name: 'AT&T',
    sector: 'telecom',
    price: 60.00,
    previousPrice: 60.00,
    isBlueChip: true,
    volatility: 'low',
    hypeMultiplier: 1.0,
    marketCap: 80000000,
  },
];

// All stocks combined
export const ALL_STOCKS = [...PENNY_STOCKS, ...BLUE_CHIP_STOCKS];

// Create initial stocks record
export const createInitialStocks = (): Record<string, StockState> => {
  const stocks: Record<string, StockState> = {};
  ALL_STOCKS.forEach(stock => {
    stocks[stock.key] = { ...stock };
  });
  return stocks;
};

// Volatility multipliers for price movement
export const VOLATILITY_MULTIPLIERS = {
  low: 0.02,
  medium: 0.05,
  high: 0.10,
  extreme: 0.20,
};

// Sector correlations (stocks in same sector move together slightly)
export const SECTOR_CORRELATION = 0.3;
