import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types';

const SAVE_KEY = '@boilerroom_save';
const STATS_KEY = '@boilerroom_stats';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  highestNetWorth: number;
  fastestWin: number | null; // days
  totalEarnings: number;
  marksScammed: number;
}

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  highestNetWorth: 0,
  fastestWin: null,
  totalEarnings: 0,
  marksScammed: 0,
};

// Save game state
export const saveGame = async (state: GameState): Promise<void> => {
  try {
    const json = JSON.stringify(state);
    await AsyncStorage.setItem(SAVE_KEY, json);
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

// Load game state
export const loadGame = async (): Promise<GameState | null> => {
  try {
    const json = await AsyncStorage.getItem(SAVE_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return null;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

// Delete save
export const deleteSave = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to delete save:', error);
  }
};

// Check if save exists
export const hasSave = async (): Promise<boolean> => {
  try {
    const json = await AsyncStorage.getItem(SAVE_KEY);
    return json !== null;
  } catch (error) {
    console.error('Failed to check save:', error);
    return false;
  }
};

// Load stats
export const loadStats = async (): Promise<GameStats> => {
  try {
    const json = await AsyncStorage.getItem(STATS_KEY);
    if (json) {
      return { ...DEFAULT_STATS, ...JSON.parse(json) };
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Failed to load stats:', error);
    return DEFAULT_STATS;
  }
};

// Save stats
export const saveStats = async (stats: GameStats): Promise<void> => {
  try {
    const json = JSON.stringify(stats);
    await AsyncStorage.setItem(STATS_KEY, json);
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
};

// Update stats after game ends
export const updateStats = async (
  won: boolean,
  netWorth: number,
  days: number,
  earnings: number,
  scammed: number
): Promise<void> => {
  const stats = await loadStats();

  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    if (stats.fastestWin === null || days < stats.fastestWin) {
      stats.fastestWin = days;
    }
  }
  if (netWorth > stats.highestNetWorth) {
    stats.highestNetWorth = netWorth;
  }
  stats.totalEarnings += earnings;
  stats.marksScammed += scammed;

  await saveStats(stats);
};
