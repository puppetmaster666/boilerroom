// Random utilities

// Get random number in range
export const randomInRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

// Get random integer in range (inclusive)
export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomInRange(min, max + 1));
};

// Get random item from array
export const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Weighted random selection
export const weightedRandom = <T>(items: T[], weights: number[]): T => {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
};

// Chance roll (returns true with given probability 0-1)
export const chance = (probability: number): boolean => {
  return Math.random() < probability;
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Shuffle array (Fisher-Yates)
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Clamp value between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Add variance to a value
export const addVariance = (base: number, variance: number): number => {
  return base + randomInRange(-variance, variance);
};
