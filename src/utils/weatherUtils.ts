import type { WeatherCondition } from '../types';

/**
 * Get color for weather condition
 */
export const getConditionColor = (condition: WeatherCondition): string => {
  const colors: Record<WeatherCondition, string> = {
    hot: '#fb923c',
    cold: '#38bdf8',
    windy: '#14b8a6',
    wet: '#6366f1',
    uncomfortable: '#fbbf24'
  };
  return colors[condition];
};

/**
 * Get description for weather condition
 */
export const getConditionDescription = (condition: WeatherCondition): string => {
  const descriptions: Record<WeatherCondition, string> = {
    hot: 'Dangerously high temperatures',
    cold: 'Extremely low temperatures',
    windy: 'Strong wind conditions',
    wet: 'Heavy precipitation',
    uncomfortable: 'Poor comfort index (heat/humidity)'
  };
  return descriptions[condition];
};

/**
 * Format probability percentage (for charts/labels)
 */
export const formatProbability = (probability: number): string => {
  if (probability >= 75) return 'Very High';
  if (probability >= 50) return 'High';
  if (probability >= 25) return 'Moderate';
  return 'Low';
};

/**
 * Simple wording for likelihood — easy for anyone to understand
 */
export const formatProbabilitySimple = (probability: number): string => {
  if (probability >= 95) return 'Almost certain';
  if (probability >= 75) return 'Very likely';
  if (probability >= 50) return 'Likely';
  if (probability >= 25) return 'Possible';
  if (probability >= 10) return 'Unlikely';
  if (probability >= 1) return 'Very unlikely';
  return 'Almost no chance';
};

/**
 * Unit label for temperature display (hot/cold). Use threshold unit or default °F.
 */
export const getTempUnitLabel = (condition: string, unitFromThreshold?: string): string => {
  if (condition === 'hot' || condition === 'cold') {
    const u = (unitFromThreshold || '°F').trim();
    if (u.includes('C') || u === '°C') return '°C';
    return '°F';
  }
  return '';
};

/**
 * Get risk level from probabilities
 */
export const calculateRiskLevel = (probabilities: number[]): 'low' | 'medium' | 'high' => {
  const avgProbability = probabilities.reduce((a, b) => a + b, 0) / probabilities.length;
  if (avgProbability >= 60) return 'high';
  if (avgProbability >= 30) return 'medium';
  return 'low';
};
