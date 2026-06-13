export interface MaterialProperties {
  // Cement
  cementSpecificGravity: number; // e.g. 3.12 g/cm3

  // Fine Aggregate (Arena)
  fineSpecificGravity: number; // e.g. 2.63 g/cm3
  fineFinenessModulus: number; // e.g. 2.70
  fineHumidity: number; // % e.g. 4.5%
  fineAbsorption: number; // % e.g. 1.2%
  fineLooseUnitWeight: number; // Peso unitario suelto kg/m3 e.g. 1520

  // Coarse Aggregate (Piedra)
  coarseSpecificGravity: number; // e.g. 2.68 g/cm3
  coarseDryRoddedUnitWeight: number; // PUCS kg/m3 e.g. 1600
  coarseHumidity: number; // % e.g. 1.5%
  coarseAbsorption: number; // % e.g. 0.8%
  coarseMaxNominalSize: string; // "3/8", "1/2", "3/4", "1", "1-1/2", "2", "3", "6"
  coarseLooseUnitWeight: number; // Peso unitario suelto kg/m3 e.g. 1420

  // Additive (Aditivo)
  hasAdditive: boolean;
  additiveWaterReduction: number; // % water reduction e.g. 10%
  additiveDosage: number; // % of cement weight e.g. 1.2%
  additiveSpecificGravity: number; // g/cm3 e.g. 1.18
}

export interface DesignSpecifications {
  specifiedStrength: number; // f'c kg/cm2, e.g. 210, 280, 350
  useStandardDeviation: boolean;
  standardDeviation: number; // kg/cm2, e.g. 35
  slumpRange: "1-2" | "3-4" | "6-7"; // in inches
  airEntrained: boolean;
  exposureLevel: "mild" | "moderate" | "severe"; // for air-entrained
}

export interface MixDesignResult {
  // Strengths
  targetStrength: number; // f'cr
  
  // Baseline values (pre-additive / ACI defaults)
  baseWaterVol: number; // L or kg
  baseAirPct: number; // %
  
  // Adjusted for additives
  adjustedWaterVol: number; // L or kg
  waterCementRatio: number; // A/C
  cementWeight: number; // kg
  cementVolume: number; // m3
  
  additiveWeight: number; // kg
  additiveVolume: number; // m3
  
  coarseAggregateVolumeFactor: number; // b/b0
  coarseAggregateDryWeight: number; // kg
  coarseAggregateVolume: number; // m3
  
  airVolume: number; // m3
  waterVolume: number; // m3
  
  fineAggregateVolume: number; // m3
  fineAggregateDryWeight: number; // kg
  
  // Totals dry
  totalDryWeight: number;
  totalDryVolume: number;
  
  // Adjusted for moisture
  coarseAggregateWetWeight: number; // kg
  fineAggregateWetWeight: number; // kg
  coarseAggregateWaterContribution: number; // kg
  fineAggregateWaterContribution: number; // kg
  totalWaterContribution: number; // kg
  correctedWaterVol: number; // kg or L
  
  // Totals wet
  totalWetWeight: number;
  
  // Proportions relative to 1 Part Cement (By Weight)
  dryProportions: {
    cement: number;
    fine: number;
    coarse: number;
    water: number;
  };
  
  wetProportions: {
    cement: number;
    fine: number;
    coarse: number;
    water: number;
  };
  
  // Dosage for 1 Bag of Cement (42.5 kg)
  oneBagBatch: {
    cementBagCount: number;
    cementWeight: number;
    fineWeight: number;
    coarseWeight: number;
    correctedWaterLiters: number;
    additiveWeight: number;
    additiveVolumeCc: number; // in ml or cc
    // New volumetric parameters
    fineLooseVolFt3: number;
    coarseLooseVolFt3: number;
    fineCans: number;
    coarseCans: number;
    correctedWaterCans: number;
    volumetricProportions: {
      cement: number;
      fine: number;
      coarse: number;
      waterLitersBag: number;
    };
  };
}

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: string;
  materials: MaterialProperties;
  specs: DesignSpecifications;
}
