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
  
  // Additive water adjustment
  let adjustedWaterVol = baseWaterVol;
  if (materials.hasAdditive) {
    const reductionFactor = 1 - materials.additiveWaterReduction / 100;
    adjustedWaterVol = baseWaterVol * reductionFactor;
  }
  
  // Step 3: Water/Cement Ratio (A/C)
  const waterCementRatio = calculateWaterCementRatio(targetStrength, specs.airEntrained);
  
  // Step 4: Cement weight & volume
  const cementWeight = adjustedWaterVol / waterCementRatio;
  const cementVolume = cementWeight / (materials.cementSpecificGravity * 1000);
  
  // Step 5: Additive weight & volume
  let additiveWeight = 0;
  let additiveVolume = 0;
  if (materials.hasAdditive) {
    additiveWeight = cementWeight * (materials.additiveDosage / 100);
    additiveVolume = additiveWeight / (materials.additiveSpecificGravity * 1000);
  }
  
  // Step 6: Coarse Aggregate Volume & Weight
  const b_b0 = calculateCoarseFactor(tmnKey, materials.fineFinenessModulus);
  const coarseDryWeight = b_b0 * materials.coarseDryRoddedUnitWeight;
  const coarseVolume = coarseDryWeight / (materials.coarseSpecificGravity * 1000);
  
  // Step 7: Water & Air absolute volumes
  const waterVolume = adjustedWaterVol / 1000;
  const airVolume = baseAirPct / 100;
  
  // Step 8: Fine Aggregate Volume & Weight
  const occupiedVolume = cementVolume + additiveVolume + coarseVolume + waterVolume + airVolume;
  const fineVolume = Math.max(0, 1.0 - occupiedVolume);
  const fineDryWeight = fineVolume * materials.fineSpecificGravity * 1000;
  
  const totalDryWeight = cementWeight + coarseDryWeight + fineDryWeight + adjustedWaterVol + additiveWeight;
  const totalDryVolume = cementVolume + coarseVolume + fineVolume + waterVolume + airVolume + additiveVolume;
  
  // Step 9: Adjust for Moisture in Aggregates (Pesos Húmedos)
  const fineWetWeight = fineDryWeight * (1 + materials.fineHumidity / 100);
  const coarseWetWeight = coarseDryWeight * (1 + materials.coarseHumidity / 100);
  
  // Aggregates water contribution (free water)
  const fineWaterContribution = fineDryWeight * ((materials.fineHumidity - materials.fineAbsorption) / 100);
  const coarseWaterContribution = coarseDryWeight * ((materials.coarseHumidity - materials.coarseAbsorption) / 100);
  const totalWaterContribution = fineWaterContribution + coarseWaterContribution;
  
  // Corrected water to insert in mixer
  const correctedWaterVol = Math.max(0, adjustedWaterVol - totalWaterContribution);
  const totalWetWeight = cementWeight + fineWetWeight + coarseWetWeight + correctedWaterVol + additiveWeight;
  
  // Dry & Wet Proportions relative to unit weight of cement
  const dryProportions = {
    cement: 1,
    fine: parseFloat((fineDryWeight / cementWeight).toFixed(2)),
    coarse: parseFloat((coarseDryWeight / cementWeight).toFixed(2)),
    water: parseFloat((adjustedWaterVol / cementWeight).toFixed(3)),
  };
  
  const wetProportions = {
    cement: 1,
    fine: parseFloat((fineWetWeight / cementWeight).toFixed(2)),
    coarse: parseFloat((coarseWetWeight / cementWeight).toFixed(2)),
    water: parseFloat((correctedWaterVol / cementWeight).toFixed(3)),
  };
  
  // Proportions per 1 standard sack of cement (42.5 kg)
  const cementBagCount = 1;
  const bagCementWeight = 42.5;
  const ratio = bagCementWeight / cementWeight;
  
  const bagFineWeight = fineWetWeight * ratio;
  const bagCoarseWeight = coarseWetWeight * ratio;
  const bagCorrectedWater = correctedWaterVol * ratio;
  const bagAdditiveWeight = additiveWeight * ratio;
  
  // Additive volume in cc (ml) -> 1 L = 1000 cc
  // Volume (L) = Weight (kg) / Density (kg/L)
  // Volume (cc) = Volume (L) * 1000
  const bagAdditiveVolumeCc = (bagAdditiveWeight / materials.additiveSpecificGravity) * 1000;
  
  // Loose Volume conversions
  // default to 1520 if undefined (for old saved states or fallback)
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
    waterCementRatio: parseFloat(waterCementRatio.toFixed(3)),
    cementWeight: parseFloat(cementWeight.toFixed(2)),
    cementVolume: parseFloat(cementVolume.toFixed(4)),
    additiveWeight: parseFloat(additiveWeight.toFixed(2)),
    additiveVolume: parseFloat(additiveVolume.toFixed(4)),
    coarseAggregateVolumeFactor: parseFloat(b_b0.toFixed(3)),
    coarseAggregateDryWeight: parseFloat(coarseDryWeight.toFixed(2)),
    coarseAggregateVolume: parseFloat(coarseVolume.toFixed(4)),
    airVolume: parseFloat(airVolume.toFixed(4)),
    waterVolume: parseFloat(waterVolume.toFixed(4)),
    fineAggregateVolume: parseFloat(fineVolume.toFixed(4)),
    fineAggregateDryWeight: parseFloat(fineDryWeight.toFixed(2)),
    totalDryWeight: parseFloat(totalDryWeight.toFixed(2)),
    totalDryVolume: parseFloat(totalDryVolume.toFixed(4)),
    coarseAggregateWetWeight: parseFloat(coarseWetWeight.toFixed(2)),
    fineAggregateWetWeight: parseFloat(fineWetWeight.toFixed(2)),
    coarseAggregateWaterContribution: parseFloat(coarseWaterContribution.toFixed(2)),
    fineAggregateWaterContribution: parseFloat(fineWaterContribution.toFixed(2)),
    totalWaterContribution: parseFloat(totalWaterContribution.toFixed(2)),
    correctedWaterVol: parseFloat(correctedWaterVol.toFixed(2)),
    totalWetWeight: parseFloat(totalWetWeight.toFixed(2)),
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
