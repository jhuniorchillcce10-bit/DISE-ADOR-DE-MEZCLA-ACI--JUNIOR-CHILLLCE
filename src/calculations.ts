import { MaterialProperties, DesignSpecifications, MixDesignResult } from "./types";
import {
  WATER_AIR_TABLE,
  AIR_ENTRAINED_RECOMMENDED,
  WC_STRENGTH_TABLE,
  COARSE_BULK_VOL_TABLE,
} from "./constants";

// Helper for linear interpolation
function interpolate(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  if (x1 === x2) return y1;
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

// 1. Calculate f'cr (Required Average Strength)
export function calculateTargetStrength(specs: DesignSpecifications): number {
  const { specifiedStrength: fc, useStandardDeviation: useSd, standardDeviation: sd } = specs;
  
  if (!useSd) {
    if (fc < 210) return fc + 70;
    if (fc <= 350) return fc + 84;
    return fc + 98;
  }
  
  // With standard deviation (ACI 318)
  if (fc <= 350) {
    const fcr1 = fc + 1.34 * sd;
    const fcr2 = fc + 2.33 * sd - 35;
    return Math.max(fcr1, fcr2);
  } else {
    const fcr1 = fc + 1.34 * sd;
    const fcr2 = 0.9 * fc + 2.33 * sd;
    return Math.max(fcr1, fcr2);
  }
}

// 2. Get Coarse Aggregate dry volume factor b/b0 with Fineness Modulus interpolation
export function calculateCoarseFactor(
  tmn: string,
  finenessModulus: number
): number {
  const row = COARSE_BULK_VOL_TABLE[tmn];
  if (!row) return 0.60; // fallback standard 3/4"
  
  const mfs = [2.4, 2.6, 2.8, 3.0];
  const fm = Math.max(2.4, Math.min(3.0, finenessModulus));
  
  // Find neighboring points
  if (fm <= 2.4) return row[2.4];
  if (fm >= 3.0) return row[3.0];
  
  if (fm < 2.6) {
    return interpolate(fm, 2.4, row[2.4], 2.6, row[2.6]);
  } else if (fm < 2.8) {
    return interpolate(fm, 2.6, row[2.6], 2.8, row[2.8]);
  } else {
    return interpolate(fm, 2.8, row[2.8], 3.0, row[3.0]);
  }
}

// 3. Interpolate Water-Cement Ratio based on target strength f'cr
export function calculateWaterCementRatio(
  fcr: number,
  airEntrained: boolean
): number {
  // Sort WC_STRENGTH_TABLE descending on f'c
  const sortedTable = [...WC_STRENGTH_TABLE].sort((a, b) => b.fc - a.fc);
  
  const getVal = (item: typeof WC_STRENGTH_TABLE[0]) => 
    airEntrained ? item.withAir : item.noAir;
  
  // Clamp to edges
  const highest = sortedTable[0];
  const lowest = sortedTable[sortedTable.length - 1];
  
  if (fcr >= highest.fc) {
    return getVal(highest);
  }
  if (fcr <= lowest.fc) {
    return getVal(lowest);
  }
  
  // Find neighboring points for interpolation
  for (let i = 0; i < sortedTable.length - 1; i++) {
    const upper = sortedTable[i];
    const lower = sortedTable[i + 1];
    
    if (fcr <= upper.fc && fcr >= lower.fc) {
      return interpolate(fcr, lower.fc, getVal(lower), upper.fc, getVal(upper));
    }
  }
  
  return getVal(lowest);
}

// 4. Main ACI Mix Design Execution
export function executeACIMixDesign(
  materials: MaterialProperties,
  specs: DesignSpecifications
): MixDesignResult {
  // Step 1: Target Strength f'cr
  const targetStrength = calculateTargetStrength(specs);
  
  // Step 2: Base Water Content and Entrained Air percentage
  const airTypeKey = specs.airEntrained ? "with-air" : "no-air";
  const slumpKey = specs.slumpRange;
  const tmnKey = materials.coarseMaxNominalSize;
  
  const baseWater = WATER_AIR_TABLE[airTypeKey]?.[slumpKey]?.[tmnKey] || { water: 200, air: 2.0 };
  const baseWaterVol = baseWater.water;
  
  // Air percentage
  let baseAirPct = baseWater.air;
  if (specs.airEntrained) {
    baseAirPct = AIR_ENTRAINED_RECOMMENDED[specs.exposureLevel]?.[tmnKey] || 5.0;
  }
  
  // Additive water adjustment (rounded to 3 decimal places)
  let adjustedWaterVol = baseWaterVol;
  if (materials.hasAdditive) {
    const reductionFactor = 1 - materials.additiveWaterReduction / 100;
    adjustedWaterVol = parseFloat((baseWaterVol * reductionFactor).toFixed(3));
  } else {
    adjustedWaterVol = parseFloat(baseWaterVol.toFixed(3));
  }
  
  // Step 3: Water/Cement Ratio (A/C) -> Rounded to exactly 2 decimals as requested in step 6
  const waterCementRatio = parseFloat(calculateWaterCementRatio(targetStrength, specs.airEntrained).toFixed(2));
  
  // Step 4: Cement weight & volume -> Cement weight rounded to 3 decimal places as requested in step 7
  const cementWeight = parseFloat((adjustedWaterVol / waterCementRatio).toFixed(3));
  const cementVolume = parseFloat((cementWeight / (materials.cementSpecificGravity * 1000)).toFixed(4));
  
  // Step 5: Additive weight & volume
  let additiveWeight = 0;
  let additiveVolume = 0;
  if (materials.hasAdditive) {
    additiveWeight = parseFloat((cementWeight * (materials.additiveDosage / 100)).toFixed(3));
    additiveVolume = parseFloat((additiveWeight / (materials.additiveSpecificGravity * 1000)).toFixed(4));
  }
  
  // Step 6: Coarse Aggregate Factor -> Rounded to 2 decimal places as requested in step 8
  const b_b0 = parseFloat(calculateCoarseFactor(tmnKey, materials.fineFinenessModulus).toFixed(2));
  // Step 8 Weight of coarse aggregate (using the rounded 2-decimal factor) -> Round to 3 decimal places
  const coarseDryWeight = parseFloat((b_b0 * materials.coarseDryRoddedUnitWeight).toFixed(3));
  const coarseVolume = parseFloat((coarseDryWeight / (materials.coarseSpecificGravity * 1000)).toFixed(4));
  
  // Step 7: Water & Air absolute volumes
  const waterVolume = parseFloat((adjustedWaterVol / 1000).toFixed(4));
  const airVolume = parseFloat((baseAirPct / 100).toFixed(4));
  const airVolumeRounded = parseFloat(airVolume.toFixed(2));
  
  // Step 9: Absolute volumes summation (using rounded individual volumes—air volume is rounded to 2 decimal places as requested)
  const occupiedVolume = parseFloat((cementVolume + additiveVolume + coarseVolume + waterVolume + airVolumeRounded).toFixed(4));
  
  // Step 10: Fine Aggregate Volume -> exact subtraction using rounded sum
  const fineVolume = parseFloat(Math.max(0, 1.0 - occupiedVolume).toFixed(4));
  const fineVolumeRounded = parseFloat(fineVolume.toFixed(3));
  // Work with the 3-decimal rounded volume as requested:
  const fineDryWeight = parseFloat((fineVolumeRounded * materials.fineSpecificGravity * 1000).toFixed(3));
  
  // Totals dry
  const totalDryWeight = parseFloat((cementWeight + coarseDryWeight + fineDryWeight + adjustedWaterVol + additiveWeight).toFixed(3));
  const totalDryVolume = parseFloat((cementVolume + coarseVolume + fineVolume + waterVolume + airVolumeRounded + additiveVolume).toFixed(4));
  
  // Step 12: Adjust for Moisture in Aggregates (Pesos Húmedos & Water Contribution)
  const fineHumidityIncrement = parseFloat((fineDryWeight * (materials.fineHumidity / 100)).toFixed(3));
  const coarseHumidityIncrement = parseFloat((coarseDryWeight * (materials.coarseHumidity / 100)).toFixed(3));
  
  const fineWetWeight = parseFloat((fineDryWeight + fineHumidityIncrement).toFixed(3));
  const coarseWetWeight = parseFloat((coarseDryWeight + coarseHumidityIncrement).toFixed(3));
  
  // Aggregates water contribution (free water) -> Rounded to 3 decimal places
  const fineWaterContribution = parseFloat((fineDryWeight * ((materials.fineHumidity - materials.fineAbsorption) / 100)).toFixed(3));
  const coarseWaterContribution = parseFloat((coarseDryWeight * ((materials.coarseHumidity - materials.coarseAbsorption) / 100)).toFixed(3));
  const totalWaterContribution = parseFloat((fineWaterContribution + coarseWaterContribution).toFixed(3));
  
  // Corrected water to insert in mixer
  const correctedWaterVol = parseFloat((Math.max(0, adjustedWaterVol - totalWaterContribution)).toFixed(3));
  const totalWetWeight = parseFloat((cementWeight + fineWetWeight + coarseWetWeight + correctedWaterVol + additiveWeight).toFixed(3));
  
  // Step 13: Dry & Wet Proportions relative to 1 Part Cement (By Weight)
  const cementBags = cementWeight / 42.5;
  const dryProportions = {
    cement: 1,
    fine: parseFloat((fineDryWeight / cementWeight).toFixed(2)),
    coarse: parseFloat((coarseDryWeight / cementWeight).toFixed(2)),
    water: parseFloat((adjustedWaterVol / cementBags).toFixed(2)), // in lt/bag as used in UI comparisons
  };
  
  const wetProportions = {
    cement: 1,
    fine: parseFloat((fineWetWeight / cementWeight).toFixed(2)),
    coarse: parseFloat((coarseWetWeight / cementWeight).toFixed(2)),
    water: parseFloat((correctedWaterVol / cementBags).toFixed(2)), // in lt/bag as used in UI comparisons
  };
  
  // Proportions per 1 standard sack of cement (42.5 kg)
  const cementBagCount = 1;
  const bagCementWeight = 42.5;
  
  // Step 14 Batch quantities calculated exactly from the rounded ratios for ultimate field exactness
  const fineRatio = parseFloat((fineWetWeight / cementWeight).toFixed(2));
  const coarseRatio = parseFloat((coarseWetWeight / cementWeight).toFixed(2));
  const waterPerBag = parseFloat((correctedWaterVol / cementBags).toFixed(2));
  
  const bagFineWeight = parseFloat((fineRatio * bagCementWeight).toFixed(3));
  const bagCoarseWeight = parseFloat((coarseRatio * bagCementWeight).toFixed(3));
  const bagCorrectedWater = parseFloat(waterPerBag.toFixed(3));
  
  const bagAdditiveWeight = materials.hasAdditive 
    ? parseFloat((bagCementWeight * (materials.additiveDosage / 100)).toFixed(3)) 
    : 0;
  
  const bagAdditiveVolumeCc = materials.hasAdditive
    ? parseFloat(((bagAdditiveWeight / materials.additiveSpecificGravity) * 1000).toFixed(1))
    : 0;
  
  // Loose Volume conversions
  const finePUS = materials.fineLooseUnitWeight || 1520;
  const coarsePUS = materials.coarseLooseUnitWeight || 1420;
  
  // Vol (m3) = Weight (kg) / loose unit weight (kg/m3)
  const fineLooseVolM3 = bagFineWeight / finePUS;
  const coarseLooseVolM3 = bagCoarseWeight / coarsePUS;
  
  // ft3 = m3 * 35.3147
  const fineLooseVolFt3 = fineLooseVolM3 * 35.3147;
  const coarseLooseVolFt3 = coarseLooseVolM3 * 35.3147;
  
  // Cans of 20L = Volume (Liters) / 20 = Weight * 1000 / (PUS * 20)
  const fineCans = (fineLooseVolM3 * 1000) / 20;
  const coarseCans = (coarseLooseVolM3 * 1000) / 20;
  const correctedWaterCans = bagCorrectedWater / 20;
  
  return {
    targetStrength: Math.round(targetStrength),
    baseWaterVol,
    baseAirPct,
    adjustedWaterVol,
    waterCementRatio,
    cementWeight,
    cementVolume,
    additiveWeight,
    additiveVolume,
    coarseAggregateVolumeFactor: b_b0,
    coarseAggregateDryWeight: coarseDryWeight,
    coarseAggregateVolume: coarseVolume,
    airVolume,
    airVolumeRounded,
    waterVolume,
    fineAggregateVolume: fineVolume,
    fineAggregateVolumeRounded: fineVolumeRounded,
    fineAggregateDryWeight: fineDryWeight,
    totalDryWeight,
    totalDryVolume,
    coarseAggregateWetWeight: coarseWetWeight,
    fineAggregateWetWeight: fineWetWeight,
    coarseAggregateWaterContribution: coarseWaterContribution,
    fineAggregateWaterContribution: fineWaterContribution,
    totalWaterContribution,
    correctedWaterVol,
    totalWetWeight,
    dryProportions,
    wetProportions,
    oneBagBatch: {
      cementBagCount,
      cementWeight: bagCementWeight,
      fineWeight: parseFloat(bagFineWeight.toFixed(2)),
      coarseWeight: parseFloat(bagCoarseWeight.toFixed(2)),
      correctedWaterLiters: parseFloat(bagCorrectedWater.toFixed(2)),
      additiveWeight: parseFloat(bagAdditiveWeight.toFixed(3)),
      additiveVolumeCc: parseFloat(bagAdditiveVolumeCc.toFixed(1)),
      fineLooseVolFt3: parseFloat(fineLooseVolFt3.toFixed(2)),
      coarseLooseVolFt3: parseFloat(coarseLooseVolFt3.toFixed(2)),
      fineCans: parseFloat(fineCans.toFixed(1)),
      coarseCans: parseFloat(coarseCans.toFixed(1)),
      correctedWaterCans: parseFloat(correctedWaterCans.toFixed(1)),
      volumetricProportions: {
        cement: 1,
        fine: parseFloat(fineLooseVolFt3.toFixed(2)),
        coarse: parseFloat(coarseLooseVolFt3.toFixed(2)),
        waterLitersBag: parseFloat(bagCorrectedWater.toFixed(1)),
      },
    },
  };
}
