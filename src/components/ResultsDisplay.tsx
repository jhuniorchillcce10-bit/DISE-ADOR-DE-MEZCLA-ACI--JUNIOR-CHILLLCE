import React, { useState } from "react";
import { MixDesignResult } from "../types";
import { Scale, Droplet, ShoppingBag, Eye, RefreshCw } from "lucide-react";

interface ResultsDisplayProps {
  result: MixDesignResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [siteVolume, setSiteVolume] = useState<number>(0.2); // Default site mixer volume in m3 (e.g., typical trompo is 0.2 m3)
  const [dosageMode, setDosageMode] = useState<"bag" | "volume">("bag");

  const siteCementWeight = result.cementWeight * siteVolume;
  const siteFineWeight = result.fineAggregateWetWeight * siteVolume;
  const siteCoarseWeight = result.coarseAggregateWetWeight * siteVolume;
  const siteWaterLiters = result.correctedWaterVol * siteVolume;
  const siteAdditiveVolume = (result.oneBagBatch.additiveVolumeCc / 42.5) * siteCementWeight;
  const siteBagsCount = siteCementWeight / 42.5;

  return (
    <div className="space-y-6">
      {/* SUMMARY BADGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-4 rounded-xl text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Resistencia Promedio (f'cr)</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-emerald-400">{result.targetStrength.toFixed(3)} <span className="text-xs">kg/cm²</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-xs">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Cemento por m³</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-slate-800">{result.cementWeight.toFixed(3)} <span className="text-xs text-slate-500">kg</span></p>
          <p className="text-[9px] text-slate-400 mt-0.5">~{(result.cementWeight / 42.5).toFixed(3)} bolsas / m³</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-xs">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Agua Efectiva</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-slate-800">{result.adjustedWaterVol.toFixed(3)} <span className="text-xs text-slate-500">L</span></p>
          <p className="text-[9px] text-slate-400 mt-0.5">Relación A/C: <span className="font-semibold text-slate-600">{result.waterCementRatio.toFixed(3)}</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-xs">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Peso Unitario (Húmedo)</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-slate-800">{result.totalWetWeight.toFixed(3)} <span className="text-xs text-slate-500">kg/m³</span></p>
          <p className="text-[9px] text-slate-400 mt-0.5">Seco: {result.totalDryWeight.toFixed(3)} kg</p>
        </div>
      </div>

      {/* CORE WEIGHT TABLE (WET & DRY comparison) */}
      <div id="weights-table-card" className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-600" />
            Dosificación por Metro Cúbico (1 m³)
          </h3>
          <span className="text-[10px] text-slate-500 bg-emerald-100/60 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
            ACI 211.1
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-2.5 px-4 font-semibold text-slate-500">Material</th>
                <th className="py-2.5 px-4 font-semibold text-slate-500 text-right">Peso Seco (kg)</th>
                <th className="py-2.5 px-4 font-semibold text-slate-500 text-right">Ajuste / Corrección</th>
                <th className="py-2.5 px-4 font-semibold text-slate-500 text-right bg-emerald-50/30 text-emerald-900">Peso de Obra Húmedo (kg)</th>
                <th className="py-2.5 px-4 font-semibold text-slate-500 text-right">Volumen Absoluto (m³)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-medium">Cemento Portland</td>
                <td className="py-3 px-4 text-right">{result.cementWeight.toFixed(3)}</td>
                <td className="py-3 px-4 text-right text-slate-400">Sin cambio</td>
                <td className="py-3 px-4 text-right bg-emerald-50/30 font-semibold">{result.cementWeight.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-mono text-[11px]">{result.cementVolume.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Agregado Grueso (Piedra)</td>
                <td className="py-3 px-4 text-right">{result.coarseAggregateDryWeight.toFixed(3)}</td>
                <td className="py-3 px-4 text-right text-emerald-600">
                  +{result.coarseAggregateWaterContribution.toFixed(3)} kg (Humedad)
                </td>
                <td className="py-3 px-4 text-right bg-emerald-50/30 font-semibold">{result.coarseAggregateWetWeight.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-mono text-[11px]">{result.coarseAggregateVolume.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Agregado Fino (Arena)</td>
                <td className="py-3 px-4 text-right">{result.fineAggregateDryWeight.toFixed(3)}</td>
                <td className="py-3 px-4 text-right text-emerald-600">
                  +{result.fineAggregateWaterContribution.toFixed(3)} kg (Humedad)
                </td>
                <td className="py-3 px-4 text-right bg-emerald-50/30 font-semibold">{result.fineAggregateWetWeight.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-mono text-[11px]">{result.fineAggregateVolume.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Agua de Mezclado (Litros)</td>
                <td className="py-3 px-4 text-right">{result.adjustedWaterVol.toFixed(3)}</td>
                <td className="py-3 px-4 text-right text-rose-600">
                  -{result.totalWaterContribution.toFixed(3)} L (Aporte)
                </td>
                <td className="py-3 px-4 text-right bg-emerald-50/30 font-semibold text-emerald-700">{result.correctedWaterVol.toFixed(3)}</td>
                <td className="py-3 px-4 text-right font-mono text-[11px]">{result.waterVolume.toFixed(3)}</td>
              </tr>
              {result.additiveWeight > 0 && (
                <tr>
                   <td className="py-3 px-4 font-medium text-emerald-700">Aditivo Químico</td>
                  <td className="py-3 px-4 text-right text-emerald-700">{result.additiveWeight.toFixed(3)}</td>
                  <td className="py-3 px-4 text-right text-slate-400">Sin cambio</td>
                  <td className="py-3 px-4 text-right bg-emerald-50/30 font-semibold text-emerald-700">{result.additiveWeight.toFixed(3)}</td>
                  <td className="py-3 px-4 text-right font-mono text-[11px]">{result.additiveVolume.toFixed(3)}</td>
                </tr>
              )}
              <tr className="bg-slate-50/60">
                <td className="py-3 px-4 font-medium">Aire Atrapado / Incorporado</td>
                <td className="py-3 px-4 text-right text-slate-400">-</td>
                <td className="py-3 px-4 text-right text-slate-400">-</td>
                <td className="py-3 px-4 text-right bg-emerald-50/30 font-medium">-</td>
                <td className="py-3 px-4 text-right font-mono text-[11px]">{result.airVolume.toFixed(3)}</td>
              </tr>
              <tr className="bg-emerald-500/10 font-bold text-slate-900 border-t border-emerald-500/25">
                <td className="py-3 px-4">TOTAL (Masa y Volumen Absoluto)</td>
                <td className="py-3 px-4 text-right">{result.totalDryWeight.toFixed(3)} kg</td>
                <td className="py-3 px-4 text-right text-slate-500">Correctores incluidos</td>
                <td className="py-3 px-4 text-right text-emerald-950 font-extrabold">{result.totalWetWeight.toFixed(3)} kg</td>
                <td className="py-3 px-4 text-right text-emerald-950 font-mono text-[11px]">{result.totalDryVolume.toFixed(3)} m³</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PROPORTION RELATION CARDS */}
      <div id="proportions-card" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Proporciones en Peso Seco (Canónico)</h4>
          <div className="flex items-center justify-around bg-slate-50 px-3 py-3 rounded-lg border border-slate-100 font-mono text-xs">
            <div className="text-center">
              <span className="block text-[8px] text-slate-400 uppercase font-sans">Cemento</span>
              <span className="font-bold text-slate-800 text-sm">1.000</span>
            </div>
            <span className="text-slate-300 font-bold text-xs">:</span>
            <div className="text-center">
              <span className="block text-[8px] text-slate-400 uppercase font-sans">Arena</span>
              <span className="font-bold text-slate-800 text-sm">{result.dryProportions.fine.toFixed(3)}</span>
            </div>
            <span className="text-slate-300 font-bold text-xs">:</span>
            <div className="text-center">
              <span className="block text-[8px] text-slate-400 uppercase font-sans">Piedra</span>
              <span className="font-bold text-slate-800 text-sm">{result.dryProportions.coarse.toFixed(3)}</span>
            </div>
            <span className="text-slate-300 font-semibold">/</span>
            <div className="text-center">
              <span className="block text-[8px] text-slate-400 uppercase font-sans">Agua (L/sac)</span>
              <span className="font-bold text-emerald-600 text-sm">{(result.dryProportions.water * 42.5).toFixed(3)} L</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Proporciones en Peso Húmedo (De Obra)</h4>
          <div className="flex items-center justify-around bg-emerald-500/5 px-3 py-3 rounded-lg border border-emerald-500/10 font-mono text-xs">
            <div className="text-center">
              <span className="block text-[8px] text-emerald-800/60 uppercase font-sans">Cemento</span>
              <span className="font-extrabold text-emerald-950 text-sm">1.000</span>
            </div>
            <span className="text-emerald-300 font-bold text-xs">:</span>
            <div className="text-center">
              <span className="block text-[8px] text-emerald-800/60 uppercase font-sans">Arena Húm.</span>
              <span className="font-extrabold text-emerald-950 text-sm">{result.wetProportions.fine.toFixed(3)}</span>
            </div>
            <span className="text-emerald-300 font-bold text-xs">:</span>
            <div className="text-center">
              <span className="block text-[8px] text-emerald-800/60 uppercase font-sans">Piedra Húm.</span>
              <span className="font-extrabold text-emerald-950 text-sm">{result.wetProportions.coarse.toFixed(3)}</span>
            </div>
            <span className="text-emerald-300 font-semibold">/</span>
            <div className="text-center">
              <span className="block text-[8px] text-emerald-800/60 uppercase font-sans">Agua Cor.</span>
              <span className="font-extrabold text-emerald-700 text-sm">{(result.wetProportions.water * 42.5).toFixed(3)} L</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Proporciones por Volumen Suelto (Pies³)</h4>
          <div className="flex items-center justify-around bg-blue-500/5 px-3 py-3 rounded-lg border border-blue-500/10 font-mono text-xs">
            <div className="text-center">
              <span className="block text-[8px] text-blue-800/60 uppercase font-sans">Cemento</span>
              <span className="font-extrabold text-blue-950 text-sm">1.000 Saco</span>
            </div>
            <span className="text-blue-300 font-bold text-xs">:</span>
            <div className="text-center">
              <span className="block text-[8px] text-blue-800/60 uppercase font-sans">Arena Ft³</span>
              <span className="font-extrabold text-blue-950 text-sm">{result.oneBagBatch.fineLooseVolFt3.toFixed(3)}</span>
            </div>
            <span className="text-blue-300 font-bold text-xs">:</span>
            <div className="text-center">
              <span className="block text-[8px] text-blue-800/60 uppercase font-sans">Piedra Ft³</span>
              <span className="font-extrabold text-blue-950 text-sm">{result.oneBagBatch.coarseLooseVolFt3.toFixed(3)}</span>
            </div>
            <span className="text-blue-300 font-semibold">/</span>
            <div className="text-center">
              <span className="block text-[8px] text-blue-800/60 uppercase font-sans">Agua (L/sac)</span>
              <span className="font-extrabold text-blue-700 text-sm">{result.oneBagBatch.correctedWaterLiters.toFixed(3)} L</span>
            </div>
          </div>
        </div>
      </div>

      {/* DOSIFICADOR PRÁCTICO PLAYGROUND (Sacks or Mixer volume) */}
      <div id="builder-calculator-card" className="bg-emerald-800 text-white rounded-xl shadow-md p-5 border border-emerald-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-700 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-300" />
              Dosificación Práctica para Obra
            </h3>
            <p className="text-[10px] text-emerald-200 mt-0.5">Calculadora de batida/tanda interactiva según tu volumen de mezclador.</p>
          </div>
          <div className="mt-2.5 sm:mt-0 bg-emerald-900/60 p-1 rounded-lg border border-emerald-700/50 flex gap-1">
            <button
              id="dosage-mode-bag"
              onClick={() => setDosageMode("bag")}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md transition-colors ${dosageMode === "bag" ? "bg-emerald-500 text-white shadow-xs" : "text-emerald-200 hover:bg-emerald-800/40"}`}
            >
              1 Saco (42.5 kg)
            </button>
            <button
              id="dosage-mode-volume"
              onClick={() => setDosageMode("volume")}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md transition-colors ${dosageMode === "volume" ? "bg-emerald-500 text-white shadow-xs" : "text-emerald-200 hover:bg-emerald-800/40"}`}
            >
              Volumen de Trompo / Mezcladora
            </button>
          </div>
        </div>

        {dosageMode === "volume" && (
          <div className="mb-4 bg-emerald-900/40 p-4 rounded-lg border border-emerald-700/50 animate-fade-in">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-emerald-200 uppercase">Capacidad de mezcla efectiva (Volumen m³)</label>
              <span className="text-sm font-mono font-extrabold bg-emerald-500 px-2 py-0.5 rounded-sm">{siteVolume.toFixed(3)} m³</span>
            </div>
            <input
              id="site-volume-slider"
              type="range"
              min="0.05"
              max="1.5"
              step="0.05"
              value={siteVolume}
              onChange={(e) => setSiteVolume(parseFloat(e.target.value))}
              className="w-full accent-white mb-2"
            />
            <p className="text-[9px] text-emerald-300/80 italic">
              Un "trompo" revolvedor típico tiene una capacidad de batida efectiva de 0.15 a 0.25 m³. Se calculan los pesos húmedos de obra y la cantidad necesaria de bolsas de cemento.
            </p>
          </div>
        )}

        {/* BATCH RESULT TABLES */}
        {dosageMode === "bag" ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mt-2">
              <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center">
                <span className="block text-[9px] text-emerald-300 uppercase font-medium">Cemento Portland</span>
                <span className="block text-lg font-bold mt-1 text-white">42.500 <span className="text-[10px]">kg</span></span>
                <span className="block text-[8px] text-emerald-200 mt-1">1.000 saco / bolsa</span>
              </div>
              <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center">
                <span className="block text-[9px] text-emerald-300 uppercase font-medium">Arena Húmeda</span>
                <span className="block text-lg font-bold mt-1 text-white">{result.oneBagBatch.fineWeight.toFixed(3)} <span className="text-[10px]">kg</span></span>
                <span className="block text-[8px] text-emerald-200 mt-1 font-semibold text-emerald-100">~{result.oneBagBatch.fineCans.toFixed(3)} latas (20L)*</span>
              </div>
              <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center">
                <span className="block text-[9px] text-emerald-300 uppercase font-medium">Piedra Húmeda</span>
                <span className="block text-lg font-bold mt-1 text-white">{result.oneBagBatch.coarseWeight.toFixed(3)} <span className="text-[10px]">kg</span></span>
                <span className="block text-[8px] text-emerald-200 mt-1 font-semibold text-emerald-100">~{result.oneBagBatch.coarseCans.toFixed(3)} latas (20L)*</span>
              </div>
              <div className="bg-emerald-950 p-3 rounded-lg border border-emerald-500/30 text-center ring-2 ring-emerald-400/40">
                <span className="block text-[9px] text-emerald-300 uppercase font-semibold flex items-center justify-center gap-1">
                  <Droplet className="h-3 w-3 text-cyan-300 animate-pulse" />
                  Agua Corregida
                </span>
                <span className="block text-lg font-bold mt-1 text-cyan-200">{result.oneBagBatch.correctedWaterLiters.toFixed(3)} <span className="text-[10px]">L</span></span>
                <span className="block text-[8px] text-cyan-100 mt-1 font-semibold text-cyan-200">~{result.oneBagBatch.correctedWaterCans.toFixed(3)} latas (20L)</span>
              </div>
              {result.oneBagBatch.additiveWeight > 0 ? (
                <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center col-span-2 sm:col-span-1">
                  <span className="block text-[9px] text-emerald-300 uppercase font-medium">Aditivo Químico</span>
                  <span className="block text-lg font-bold mt-1 text-amber-300">
                    {result.oneBagBatch.additiveVolumeCc.toFixed(3)} <span className="text-[10px]">mL (cc)</span>
                  </span>
                  <span className="block text-[8px] text-emerald-200 mt-1">~{result.oneBagBatch.additiveWeight.toFixed(3)} kg</span>
                </div>
              ) : (
                <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-800/30 text-center col-span-2 sm:col-span-1 opacity-50 flex items-center justify-center">
                  <span className="text-[10px] text-emerald-400/80 uppercase">No tiene aditivo</span>
                </div>
              )}
            </div>
            <p className="text-[9px] text-emerald-300/60 mt-3 text-right">
              *Nota: Cantidades en "latas" calculadas con precisión física usando los Pesos Unitarios Sueltos (P.U.S.) ingresados. 1 lata = 20 Litros (0.020 m³).
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mt-2">
              <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center">
                <span className="block text-[9px] text-emerald-300 uppercase font-medium">Cemento Portland</span>
                <span className="block text-lg font-bold mt-1 text-white">{siteCementWeight.toFixed(3)} <span className="text-[10px]">kg</span></span>
                <span className="block text-[8px] text-emerald-200 mt-1 font-semibold">{siteBagsCount.toFixed(3)} bolsas (42.5kg)</span>
              </div>
              <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center">
                <span className="block text-[9px] text-emerald-300 uppercase font-medium">Arena Húmeda de Obra</span>
                <span className="block text-lg font-bold mt-1 text-white">{siteFineWeight.toFixed(3)} <span className="text-[10px]">kg</span></span>
                <span className="block text-[8px] text-emerald-200 mt-1 font-semibold text-emerald-100">~{(result.oneBagBatch.fineCans * siteBagsCount).toFixed(3)} latas*</span>
              </div>
              <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center">
                <span className="block text-[9px] text-emerald-300 uppercase font-medium">Piedra Húmeda de Obra</span>
                <span className="block text-lg font-bold mt-1 text-white">{siteCoarseWeight.toFixed(3)} <span className="text-[10px]">kg</span></span>
                <span className="block text-[8px] text-emerald-200 mt-1 font-semibold text-emerald-100">~{(result.oneBagBatch.coarseCans * siteBagsCount).toFixed(3)} latas*</span>
              </div>
              <div className="bg-emerald-950 p-3 rounded-lg border border-emerald-500/30 text-center ring-2 ring-emerald-400/40">
                <span className="block text-[9px] text-emerald-300 uppercase font-semibold flex items-center justify-center gap-1">
                  <Droplet className="h-3 w-3 text-cyan-300 animate-pulse" />
                  Agua Corregida
                </span>
                <span className="block text-lg font-bold mt-1 text-cyan-200">{siteWaterLiters.toFixed(3)} <span className="text-[10px]">L</span></span>
                <span className="block text-[8px] text-cyan-100 mt-1 font-semibold text-cyan-200">~{(result.oneBagBatch.correctedWaterCans * siteBagsCount).toFixed(3)} latas (20L)*</span>
              </div>
              {result.oneBagBatch.additiveWeight > 0 ? (
                <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/65 text-center col-span-2 sm:col-span-1">
                  <span className="block text-[9px] text-emerald-300 uppercase font-medium">Aditivo Químico</span>
                  <span className="block text-lg font-bold mt-1 text-amber-300">
                    {siteAdditiveVolume.toFixed(3)} <span className="text-[10px]">mL (cc)</span>
                  </span>
                  <span className="block text-[8px] text-emerald-200 mt-1">Dosificado al {(result.oneBagBatch.additiveWeight / 42.5 * 100).toFixed(3)}%</span>
                </div>
              ) : (
                <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-800/30 text-center col-span-2 sm:col-span-1 opacity-50 flex items-center justify-center">
                  <span className="text-[10px] text-emerald-400/80 uppercase">No tiene aditivo</span>
                </div>
              )}
            </div>
            <p className="text-[9px] text-emerald-300/60 mt-3 text-right">
              *Pesos ajustados y cantidades de volumen en latas físicas de 20 Litros calculadas con precisión para un volumen neto de mezcla de {(siteVolume * 1000).toFixed(3)} litros reales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
