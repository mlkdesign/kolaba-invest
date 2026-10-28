export type ScenarioInputs = {
  creatorProfiles: number;
  businessProfiles: number;
  /** Percent, 0–100. */
  creatorConversion: number;
  /** Percent, 0–100. */
  businessConversion: number;
  /** Percent of paying creators on annual billing, 0–100. */
  annualShare: number;
};

export type InputKey = keyof ScenarioInputs;
export type PresetId = 'conservative' | 'base' | 'upside';
export type ScenarioId = PresetId | 'custom';

export const INPUT_LIMITS: Record<InputKey, { min: number; max: number; step: number }> = {
  creatorProfiles: { min: 0, max: 50_000, step: 100 },
  businessProfiles: { min: 0, max: 5_000, step: 10 },
  creatorConversion: { min: 0, max: 100, step: 1 },
  businessConversion: { min: 0, max: 100, step: 1 },
  annualShare: { min: 0, max: 100, step: 5 },
};

export const INPUT_ORDER: InputKey[] = [
  'creatorProfiles',
  'businessProfiles',
  'creatorConversion',
  'businessConversion',
  'annualShare',
];

export const PRESETS: Record<PresetId, ScenarioInputs> = {
  conservative: {
    creatorProfiles: 2_500,
    businessProfiles: 150,
    creatorConversion: 3,
    businessConversion: 8,
    annualShare: 30,
  },
  base: {
    creatorProfiles: 6_000,
    businessProfiles: 400,
    creatorConversion: 5,
    businessConversion: 12,
    annualShare: 30,
  },
  upside: {
    creatorProfiles: 12_000,
    businessProfiles: 900,
    creatorConversion: 7,
    businessConversion: 18,
    annualShare: 30,
  },
};

export const PRESET_ORDER: PresetId[] = ['conservative', 'base', 'upside'];
export const DEFAULT_SCENARIO: PresetId = 'base';
