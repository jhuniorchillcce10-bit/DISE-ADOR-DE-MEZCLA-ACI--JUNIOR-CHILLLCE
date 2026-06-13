// ACI 211.1 standard tables

// 1. Water volume and air% table
// Keys: slumpRange, airEntrained, coarseMaxNominalSize
// Returns: [waterLiters, airPct]
export const WATER_AIR_TABLE: Record<
  string, // "no-air" | "with-air"
  Record<
    string, // "1-2" | "3-4" | "6-7"
    Record<string, { water: number; air: number }>
  >
> = {
  "no-air": {
    "1-2": {
      "3/8": { water: 207, air: 3.0 },
      "1/2": { water: 199, air: 2.5 },
      "3/4": { water: 190, air: 2.0 },
      "1": { water: 179, air: 1.5 },
      "1-1/2": { water: 166, air: 1.0 },
      "2": { water: 154, air: 0.5 },
      "3": { water: 130, air: 0.3 },
      "6": { water: 113, air: 0.2 },
    },
    "3-4": {
      "3/8": { water: 228, air: 3.0 },
      "1/2": { water: 216, air: 2.5 },
      "3/4": { water: 205, air: 2.0 },
      "1": { water: 193, air: 1.5 },
      "1-1/2": { water: 181, air: 1.0 },
      "2": { water: 169, air: 0.5 },
      "3": { water: 145, air: 0.3 },
      "6": { water: 124, air: 0.2 },
    },
    "6-7": {
      "3/8": { water: 243, air: 3.0 },
      "1/2": { water: 228, air: 2.5 },
      "3/4": { water: 216, air: 2.0 },
      "1": { water: 202, air: 1.5 },
      "1-1/2": { water: 190, air: 1.0 },
      "2": { water: 178, air: 0.5 },
      "3": { water: 160, air: 0.3 },
      "6": { water: 140, air: 0.2 },
    },
  },
  "with-air": {
    "1-2": {
      "3/8": { water: 181, air: 0 }, // air depends on exposure level
      "1/2": { water: 175, air: 0 },
      "3/4": { water: 168, air: 0 },
      "1": { water: 160, air: 0 },
      "1-1/2": { water: 150, air: 0 },
      "2": { water: 142, air: 0 },
      "3": { water: 122, air: 0 },
      "6": { water: 107, air: 0 },
    },
    "3-4": {
      "3/8": { water: 202, air: 0 },
      "1/2": { water: 193, air: 0 },
      "3/4": { water: 184, air: 0 },
      "1": { water: 175, air: 0 },
      "1-1/2": { water: 165, air: 0 },
      "2": { water: 157, air: 0 },
      "3": { water: 133, air: 0 },
      "6": { water: 119, air: 0 },
    },
    "6-7": {
      "3/8": { water: 216, air: 0 },
      "1/2": { water: 205, air: 0 },
      "3/4": { water: 197, air: 0 },
      "1": { water: 184, air: 0 },
      "1-1/2": { water: 174, air: 0 },
      "2": { water: 166, air: 0 },
      "3": { water: 154, air: 0 },
      "6": { water: 135, air: 0 },
    },
  },
};

// 2. Air content recommendations for air-entrained concrete based on exposure
// Keys: exposureLevel, TMNS
export const AIR_ENTRAINED_RECOMMENDED: Record<
  "mild" | "moderate" | "severe",
  Record<string, number>
> = {
  severe: {
    "3/8": 7.5,
    "1/2": 7.0,
    "3/4": 6.0,
    "1": 6.0,
    "1-1/2": 5.5,
    "2": 5.0,
    "3": 4.5,
    "6": 4.0,
  },
  moderate: {
    "3/8": 6.0,
    "1/2": 5.5,
    "3/4": 5.0,
    "1": 4.5,
    "1-1/2": 4.5,
    "2": 4.0,
    "3": 3.5,
    "6": 3.0,
  },
  mild: {
    "3/8": 4.5,
    "1/2": 4.0,
    "3/4": 3.5,
    "1": 3.0,
    "1-1/2": 2.5,
    "2": 2.0,
    "3": 1.5,
    "6": 1.0,
  },
};

// 3. Water-Cement ratio by Compressive Strength f'c
// Array of [f'c, non-air-entrained_AC, air-entrained_AC]
export const WC_STRENGTH_TABLE: Array<{
  fc: number;
  noAir: number;
  withAir: number;
}> = [
  { fc: 450, noAir: 0.38, withAir: 0.30 }, // extended extrapolated values
  { fc: 400, noAir: 0.43, withAir: 0.34 },
  { fc: 350, noAir: 0.48, withAir: 0.40 },
  { fc: 300, noAir: 0.55, withAir: 0.46 },
  { fc: 250, noAir: 0.62, withAir: 0.53 },
  { fc: 200, noAir: 0.70, withAir: 0.61 },
  { fc: 150, noAir: 0.80, withAir: 0.71 },
];

// 4. b/b0 Dry Bulk Volume of Coarse Aggregate per Unit Volume of Concrete
// Columns represent Sand Fineness Modulus (MF) of 2.40, 2.60, 2.80, 3.00
export const COARSE_BULK_VOL_TABLE: Record<
  string, // TMNS
  { 2.4: number; 2.6: number; 2.8: number; 3.0: number }
> = {
  "3/8": { 2.4: 0.50, 2.6: 0.48, 2.8: 0.46, 3.0: 0.44 },
  "1/2": { 2.4: 0.59, 2.6: 0.57, 2.8: 0.55, 3.0: 0.53 },
  "3/4": { 2.4: 0.66, 2.6: 0.64, 2.8: 0.62, 3.0: 0.60 },
  "1": { 2.4: 0.71, 2.6: 0.69, 2.8: 0.67, 3.0: 0.65 },
  "1-1/2": { 2.4: 0.76, 2.6: 0.74, 2.8: 0.72, 3.0: 0.70 },
  "2": { 2.4: 0.78, 2.6: 0.76, 2.8: 0.74, 3.0: 0.72 },
  "3": { 2.4: 0.81, 2.6: 0.79, 2.8: 0.77, 3.0: 0.75 },
  "6": { 2.4: 0.87, 2.6: 0.85, 2.8: 0.83, 3.0: 0.81 },
};
export const TMNS_LABELS: Record<string, string> = {
  "3/8": '3/8" (9.5 mm)',
  "1/2": '1/2" (12.5 mm)',
  "3/4": '3/4" (19.0 mm)',
  "1": '1" (25.0 mm)',
  "1-1/2": '1-1/2" (37.5 mm)',
  "2": '2" (50.0 mm)',
  "3": '3" (75.0 mm)',
  "6": '6" (150.0 mm)',
};
export const SLUMP_LABELS: Record<string, string> = {
  "1-2": '1" a 2" (Consistencia Seca)',
  "3-4": '3" a 4" (Consistencia Media)',
  "6-7": '6" a 7" (Consistencia Húmeda)',
};
export const EXPOSURE_LABELS: Record<string, string> = {
  mild: "Leve (Sin congelación, protegido)",
  moderate: "Moderada (Humedad o congelación leve)",
  severe: "Severa (Contacto con agua y congelación extrema, sales)",
};
