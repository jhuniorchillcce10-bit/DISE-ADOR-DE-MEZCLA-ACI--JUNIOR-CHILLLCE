import React from "react";
import { MaterialProperties, DesignSpecifications, MixDesignResult } from "../types";
import { TMNS_LABELS, SLUMP_LABELS, EXPOSURE_LABELS } from "../constants";
import { BookOpen, ArrowRight, HelpCircle } from "lucide-react";

interface StepByStepCalculationsProps {
  materials: MaterialProperties;
  specs: DesignSpecifications;
  result: MixDesignResult;
}

export const StepByStepCalculations: React.FC<StepByStepCalculationsProps> = ({
  materials,
  specs,
  result,
}) => {
  return (
    <div className="space-y-6 text-slate-800">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <BookOpen className="h-5 w-5 text-emerald-600" />
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
          Memoria de Cálculo Técnico (Paso a Paso)
        </h2>
      </div>

      {/* STEP 1: f'cr */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</span>
          <h3 className="font-bold text-sm text-slate-850 uppercase">Determinación de la Resistencia Requerida (f'cr)</h3>
        </div>
        <div className="pl-8 text-xs text-slate-600 space-y-2">
          <p>
            La resistencia de especificación es <span className="font-bold text-slate-900">f'c = {specs.specifiedStrength} kg/cm²</span>.
          </p>
          {specs.useStandardDeviation ? (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono space-y-1">
              <p>Utilizando Desviación Estándar (S_d) = {specs.standardDeviation.toFixed(3)} kg/cm² según ACI 318:</p>
              {specs.specifiedStrength <= 350 ? (
                <>
                  <p>f'cr₁ = f'c + 1.34 × S_d = {specs.specifiedStrength.toFixed(3)} + 1.34 × {specs.standardDeviation.toFixed(3)} = {(specs.specifiedStrength + 1.34 * specs.standardDeviation).toFixed(3)} kg/cm²</p>
                  <p>f'cr₂ = f'c + 2.33 × S_d - 35 = {specs.specifiedStrength.toFixed(3)} + 2.33 × {specs.standardDeviation.toFixed(3)} - 35 = {(specs.specifiedStrength + 2.33 * specs.standardDeviation - 35).toFixed(3)} kg/cm²</p>
                </>
              ) : (
                <>
                  <p>f'cr₁ = f'c + 1.34 × S_d = {specs.specifiedStrength.toFixed(3)} + 1.34 × {specs.standardDeviation.toFixed(3)} = {(specs.specifiedStrength + 1.34 * specs.standardDeviation).toFixed(3)} kg/cm²</p>
                  <p>f'cr₂ = 0.9 × f'c + 2.33 × S_d = 0.9 × {specs.specifiedStrength.toFixed(3)} + 2.33 × {specs.standardDeviation.toFixed(3)} = {(0.9 * specs.specifiedStrength + 2.33 * specs.standardDeviation).toFixed(3)} kg/cm²</p>
                </>
              )}
              <p className="text-emerald-700 font-bold mt-1">f'cr Seleccionado (Mayor) = {result.targetStrength.toFixed(3)} kg/cm²</p>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono space-y-1">
              <p>Sin datos estadísticos de obra (Sobrediseño estándar ACI):</p>
              {specs.specifiedStrength < 210 ? (
                <p>f'cr = f'c + 70 = {specs.specifiedStrength.toFixed(3)} + 70 = {(specs.specifiedStrength + 70).toFixed(3)} kg/cm²</p>
              ) : specs.specifiedStrength <= 350 ? (
                <p>f'cr = f'c + 85 = {specs.specifiedStrength.toFixed(3)} + 85 = {(specs.specifiedStrength + 85).toFixed(3)} kg/cm²</p>
              ) : (
                <p>f'cr = f'c + 100 = {specs.specifiedStrength.toFixed(3)} + 100 = {(specs.specifiedStrength + 100).toFixed(3)} kg/cm²</p>
              )}
              <p className="text-emerald-700 font-bold mt-1">f'cr Seleccionado = {result.targetStrength.toFixed(3)} kg/cm²</p>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2: Slump & Design Water */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</span>
          <h3 className="font-bold text-sm text-slate-850 uppercase">Selección del Volumen de Agua y Contenido de Aire</h3>
        </div>
        <div className="pl-8 text-xs text-slate-600 space-y-2">
          <p>
            A partir del TMN = <span className="font-semibold text-slate-900">{TMNS_LABELS[materials.coarseMaxNominalSize]}</span> y un Asentamiento = <span className="font-semibold text-slate-900">{SLUMP_LABELS[specs.slumpRange]}</span>:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <p className="font-semibold text-slate-700">Valores de la Tabla ACI 211.1:</p>
            <p>• Volumen de Agua Base: <span className="font-bold text-slate-800">{result.baseWaterVol.toFixed(3)} Litros/m³</span></p>
            <p>• Aire {specs.airEntrained ? "Incorp. (Exp. " + specs.exposureLevel + ")" : "Atrapado"}: <span className="font-bold text-slate-800">{result.baseAirPct.toFixed(3)}%</span></p>
          </div>

          {materials.hasAdditive ? (
            <div className="bg-emerald-50 text-emerald-950 p-3 rounded-lg border border-emerald-100 font-mono text-[11px] space-y-1">
              <p className="font-bold text-emerald-800">Rediseño por Aditivo Plastificante:</p>
              <p>• Reducción de Agua: {materials.additiveWaterReduction.toFixed(3)}%</p>
              <p>• Agua Ajustada = Agua Base × (1 - {materials.additiveWaterReduction.toFixed(3)}/100)</p>
              <p>• Agua Ajustada = {result.baseWaterVol.toFixed(3)} × {(1 - materials.additiveWaterReduction/100).toFixed(3)} = <span className="font-bold text-emerald-700">{result.adjustedWaterVol.toFixed(3)} L/m³</span></p>
            </div>
          ) : (
            <p className="italic text-slate-400">Sin aditivos, se mantiene el agua base de {result.baseWaterVol.toFixed(3)} L/m³.</p>
          )}
        </div>
      </div>

      {/* STEP 3: Water/Cement Ratio */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">3</span>
          <h3 className="font-bold text-sm text-slate-850 uppercase">Relación Agua/Cemento (A/C)</h3>
        </div>
        <div className="pl-8 text-xs text-slate-600 space-y-2">
          <p>
            Para una resistencia objetivo <span className="font-bold text-slate-900">f'cr = {result.targetStrength.toFixed(3)} kg/cm²</span> se realiza una interpolación lineal en la Tabla ACI:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px]">
            <p>Relación A/C interpolada ({specs.airEntrained ? "Con Aire" : "Sin Aire"}) = <span className="text-emerald-700 font-bold">{result.waterCementRatio.toFixed(3)}</span></p>
          </div>
        </div>
      </div>

      {/* STEP 4: Cement weight & volume */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">4</span>
          <h3 className="font-bold text-sm text-slate-850 uppercase">Factor Cemento (Peso y Volumen)</h3>
        </div>
        <div className="pl-8 text-xs text-slate-600 space-y-2">
          <p>El consumo de cemento de determina en peso dividiendo el agua neta ajustada entre la relación A/C:</p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1">
            <p>• Peso de Cemento = Agua Ajustada / (A/C) = {result.adjustedWaterVol.toFixed(3)} / {result.waterCementRatio.toFixed(3)} = <span className="font-bold text-slate-800">{result.cementWeight.toFixed(3)} kg</span></p>
            <p>• En Bolsas / Sacos (42.5 kg) = {result.cementWeight.toFixed(3)} / 42.5 = <span className="font-bold text-slate-800">{(result.cementWeight / 42.5).toFixed(3)} bolsas</span></p>
            <p>• Peso específico = {materials.cementSpecificGravity.toFixed(3)} g/cm³</p>
            <p>• Volumen absoluto = Peso / (Pe × 1000) = {result.cementWeight.toFixed(3)} / ({materials.cementSpecificGravity.toFixed(3)} × 1000) = <span className="font-bold text-emerald-700">{result.cementVolume.toFixed(3)} m³</span></p>
          </div>
        </div>
      </div>

      {/* STEP 5: Additive calculation */}
      {materials.hasAdditive && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">5</span>
            <h3 className="font-bold text-sm text-slate-850 uppercase">Cálculo de Aditivo Plastificante</h3>
          </div>
          <div className="pl-8 text-xs text-slate-600 space-y-2">
            <p>El peso y volumen de aditivo se calculan en base a la dosificación y su gravedad específica:</p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1">
              <p>• Dosificación = {materials.additiveDosage.toFixed(3)}% en base al cemento</p>
              <p>• Peso de Aditivo = Cemento × {materials.additiveDosage.toFixed(3)}% = {result.cementWeight.toFixed(3)} × {(materials.additiveDosage / 100).toFixed(3)} = <span className="font-bold text-slate-800">{result.additiveWeight.toFixed(3)} kg</span></p>
              <p>• Volumen absoluto = {result.additiveWeight.toFixed(3)} / ({materials.additiveSpecificGravity.toFixed(3)} × 1000) = <span className="font-bold text-emerald-700">{result.additiveVolume.toFixed(3)} m³</span></p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Coarse Aggregate absolute values */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{materials.hasAdditive ? 6 : 5}</span>
          <h3 className="font-bold text-sm text-slate-850 uppercase">Determinación del Agregado Grueso (Piedra)</h3>
        </div>
        <div className="pl-8 text-xs text-slate-600 space-y-2">
          <p>
            A partir de la finenez de la arena (Módulo de Fineza: <span className="font-bold text-slate-800">{materials.fineFinenessModulus.toFixed(3)}</span>) y el TMN: <span className="font-bold text-slate-800">{TMNS_LABELS[materials.coarseMaxNominalSize]}</span> se obtiene el factor de volumen seco compactado por unidad de volumen de concreto b/b₀:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1">
            <p>• b/b₀ Interpolado = <span className="font-bold text-slate-800">{result.coarseAggregateVolumeFactor.toFixed(3)} m³</span></p>
            <p>• P.U.C.S. del Agregado Grueso = {materials.coarseDryRoddedUnitWeight.toFixed(3)} kg/m³</p>
            <p>• Peso Seco = (b/b₀) × P.U.C.S. = {result.coarseAggregateVolumeFactor.toFixed(3)} × {materials.coarseDryRoddedUnitWeight.toFixed(3)} = <span className="font-bold text-slate-800">{result.coarseAggregateDryWeight.toFixed(3)} kg</span></p>
            <p>• Volumen absoluto = Peso / (Pe × 1000) = {result.coarseAggregateDryWeight.toFixed(3)} / ({materials.coarseSpecificGravity.toFixed(3)} × 1000) = <span className="font-bold text-emerald-700">{result.coarseAggregateVolume.toFixed(3)} m³</span></p>
          </div>
        </div>
      </div>

      {/* STEP 7: Fine Aggregate volumes deduction */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{materials.hasAdditive ? 7 : 6}</span>
          <h3 className="font-bold text-sm text-slate-850 uppercase">Determinación del Agregado Fino (Método Volumen Absoluto)</h3>
        </div>
        <div className="pl-8 text-xs text-slate-600 space-y-2">
          <p>Se deduce el volumen de arena restando de 1.0 m³ el volumen de todos los demás componentes:</p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] space-y-2">
            <div className="grid grid-cols-2 gap-y-1 border-b border-slate-200 pb-2">
              <div>Volumen Cemento:</div>
              <div className="text-right">{result.cementVolume.toFixed(3)} m³</div>

              {materials.hasAdditive && (
                <>
                  <div>Volumen Aditivo:</div>
                  <div className="text-right">{result.additiveVolume.toFixed(3)} m³</div>
                </>
              )}

              <div>Volumen Piedra (Seca):</div>
              <div className="text-right">{result.coarseAggregateVolume.toFixed(3)} m³</div>

              <div>Volumen Agua de Diseño:</div>
              <div className="text-right">{result.waterVolume.toFixed(3)} m³</div>

              <div>Volumen de Aire:</div>
              <div className="text-right">{result.airVolume.toFixed(3)} m³</div>
            </div>
            
            <div className="grid grid-cols-2 text-emerald-800 font-bold">
              <div>Suma Volúmenes Ocupados:</div>
              <div className="text-right">{(1.0 - result.fineAggregateVolume).toFixed(3)} m³</div>
              
              <div>Volumen Libre para Arena:</div>
              <div className="text-right">{result.fineAggregateVolume.toFixed(3)} m³</div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p>• Peso Seco Arena = Volumen Libre × Pe arena × 1000 = {result.fineAggregateVolume.toFixed(3)} × {materials.fineSpecificGravity.toFixed(3)} × 1000 = <span className="font-bold text-emerald-700">{result.fineAggregateDryWeight.toFixed(3)} kg</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 8: Moisture adjustments */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{materials.hasAdditive ? 8 : 7}</span>
          <h3 className="font-bold text-sm text-slate-850 uppercase">Corrección por Humedad y Agua de Mezclado</h3>
        </div>
        <div className="pl-8 text-xs text-slate-600 space-y-2">
          <p>Se ajustan los pesos secos de los agregados de acuerdo con su humedad natural, y se calcula el agua libre:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1">
              <p className="font-bold text-slate-800">Agregado Grueso:</p>
              <p>• Humedad: {materials.coarseHumidity.toFixed(3)}%, Absorción: {materials.coarseAbsorption.toFixed(3)}%</p>
              <p>• Humedad Libre = {materials.coarseHumidity.toFixed(3)} - {materials.coarseAbsorption.toFixed(3)} = {(materials.coarseHumidity - materials.coarseAbsorption).toFixed(3)}%</p>
              <p>• Peso de Obra Húmedo = {result.coarseAggregateDryWeight.toFixed(3)} × (1 + {materials.coarseHumidity.toFixed(3)}%) = <span className="font-bold text-slate-800">{result.coarseAggregateWetWeight.toFixed(3)} kg</span></p>
              <p>• Aporte de Agua = {result.coarseAggregateDryWeight.toFixed(3)} × {(materials.coarseHumidity - materials.coarseAbsorption).toFixed(3)}% = <span className="font-bold text-emerald-700">{result.coarseAggregateWaterContribution.toFixed(3)} Litros</span></p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1">
              <p className="font-bold text-slate-800">Agregado Fino:</p>
              <p>• Humedad: {materials.fineHumidity.toFixed(3)}%, Absorción: {materials.fineAbsorption.toFixed(3)}%</p>
              <p>• Humedad Libre = {materials.fineHumidity.toFixed(3)} - {materials.fineAbsorption.toFixed(3)} = {(materials.fineHumidity - materials.fineAbsorption).toFixed(3)}%</p>
              <p>• Peso de Obra Húmedo = {result.fineAggregateDryWeight.toFixed(3)} × (1 + {materials.fineHumidity.toFixed(3)}%) = <span className="font-bold text-slate-800">{result.fineAggregateWetWeight.toFixed(3)} kg</span></p>
              <p>• Aporte de Agua = {result.fineAggregateDryWeight.toFixed(3)} × {(materials.fineHumidity - materials.fineAbsorption).toFixed(3)}% = <span className="font-bold text-emerald-700">{result.fineAggregateWaterContribution.toFixed(3)} Litros</span></p>
            </div>
          </div>

          <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10 font-mono text-xs space-y-1">
            <p className="font-bold text-slate-800">Cálculo del Agua Efectiva en Mezcladora:</p>
            <p>• Agua de diseño ajustada por aditivo = {result.adjustedWaterVol.toFixed(3)} L</p>
            <p>• Total agua libre agregada = {result.coarseAggregateWaterContribution.toFixed(3)} + {result.fineAggregateWaterContribution.toFixed(3)} = {result.totalWaterContribution.toFixed(3)} L (exceso aportado)</p>
            <p>• Agua neta a añadir en trompo = Agua diseño - Total agua libre</p>
            <p>• Agua neta a añadir = {result.adjustedWaterVol.toFixed(3)} - {result.totalWaterContribution.toFixed(3)} = <span className="bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm">{result.correctedWaterVol.toFixed(3)} L</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
