import React from "react";
import { MaterialProperties } from "../types";
import { TMNS_LABELS } from "../constants";
import { HelpCircle, Beaker, Layers, Sparkles } from "lucide-react";
import { NumericInput } from "./NumericInput";

interface MaterialFormProps {
  materials: MaterialProperties;
  onChange: (materials: MaterialProperties) => void;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({ materials, onChange }) => {
  const handleInputChange = (field: keyof MaterialProperties, value: any) => {
    onChange({
      ...materials,
      [field]: value,
    });
  };

  const handleAggregateMaxNominalSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange("coarseMaxNominalSize", e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* CEMENT SECTION */}
      <div id="cement-card" className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600" />
          1. Propiedades del Cemento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              Peso Específico Seco (g/cm³)
              <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                <HelpCircle className="h-3 w-3" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block z-10">
                  Por lo general se utiliza 3.12 o 3.15 g/cm³ para cemento Portland.
                </span>
              </span>
            </label>
            <NumericInput
              id="cement-density-input"
              step="0.01"
              min="2.00"
              max="4.00"
              value={materials.cementSpecificGravity}
              onChange={(val) => handleInputChange("cementSpecificGravity", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* COARSE AGGREGATE SECTION (PIEDRA) */}
      <div id="coarse-aggregate-card" className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          2. Agregado Grueso (Piedra)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              TMN (Tamaño Máximo Nominal)
            </label>
            <select
              id="coarse-tmn-select"
              value={materials.coarseMaxNominalSize}
              onChange={handleAggregateMaxNominalSize}
              className="w-full text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(TMNS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Peso Específico Seco (g/cm³)
            </label>
            <NumericInput
              id="coarse-density-input"
              step="0.01"
              value={materials.coarseSpecificGravity}
              onChange={(val) => handleInputChange("coarseSpecificGravity", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              P.U.C.S. (kg/m³)
              <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                <HelpCircle className="h-3 w-3" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block z-10">
                  Peso Unitario Compactado Seco. Generalmente entre 1400 y 1700 kg/m³.
                </span>
              </span>
            </label>
            <NumericInput
              id="coarse-unit-weight-input"
              step="10"
              value={materials.coarseDryRoddedUnitWeight}
              onChange={(val) => handleInputChange("coarseDryRoddedUnitWeight", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              P.U.S. (kg/m³) - Suelto
              <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                <HelpCircle className="h-3 w-3" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block z-10">
                  Peso Unitario Suelto de la Piedra Húmeda en Obra. Usualmente entre 1300 y 1550 kg/m³.
                </span>
              </span>
            </label>
            <NumericInput
              id="coarse-loose-weight-input"
              step="10"
              value={materials.coarseLooseUnitWeight || 1420}
              onChange={(val) => handleInputChange("coarseLooseUnitWeight", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Humedad (%)
            </label>
            <NumericInput
              id="coarse-humidity-input"
              step="0.1"
              value={materials.coarseHumidity}
              onChange={(val) => handleInputChange("coarseHumidity", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Absorción (%)
            </label>
            <NumericInput
              id="coarse-absorption-input"
              step="0.1"
              value={materials.coarseAbsorption}
              onChange={(val) => handleInputChange("coarseAbsorption", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* FINE AGGREGATE SECTION (ARENA) */}
      <div id="fine-aggregate-card" className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
          3. Agregado Fino (Arena)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              Módulo de Fineza (MF)
              <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                <HelpCircle className="h-3 w-3" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block z-10">
                  Generalmente entre 2.30 y 3.10. El método ACI interpola en base a este factor.
                </span>
              </span>
            </label>
            <NumericInput
              id="fine-fm-input"
              step="0.01"
              min="2.0"
              max="3.5"
              value={materials.fineFinenessModulus}
              onChange={(val) => handleInputChange("fineFinenessModulus", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Peso Específico Seco (g/cm³)
            </label>
            <NumericInput
              id="fine-density-input"
              step="0.01"
              value={materials.fineSpecificGravity}
              onChange={(val) => handleInputChange("fineSpecificGravity", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              P.U.S. (kg/m³) - Suelto
              <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
                <HelpCircle className="h-3 w-3" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block z-10">
                  Peso Unitario Suelto de la Arena Húmeda en Obra. Usualmente entre 1400 y 1650 kg/m³.
                </span>
              </span>
            </label>
            <NumericInput
              id="fine-loose-weight-input"
              step="10"
              value={materials.fineLooseUnitWeight || 1520}
              onChange={(val) => handleInputChange("fineLooseUnitWeight", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Humedad (%)
            </label>
            <NumericInput
              id="fine-humidity-input"
              step="0.1"
              value={materials.fineHumidity}
              onChange={(val) => handleInputChange("fineHumidity", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Absorción (%)
            </label>
            <NumericInput
              id="fine-absorption-input"
              step="0.1"
              value={materials.fineAbsorption}
              onChange={(val) => handleInputChange("fineAbsorption", val)}
              className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ADDITIVE SECTION (ADITIVO PLASTIFICANTE) */}
      <div id="additive-card" className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
            <Beaker className="h-4 w-4 text-emerald-600" />
            4. Aditivo Químico (Plastificante / Reductor de Agua)
          </h3>
          <div className="flex items-center">
            <input
              id="has-additive-checkbox"
              type="checkbox"
              checked={materials.hasAdditive}
              onChange={(e) => handleInputChange("hasAdditive", e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded-xs"
            />
            <label htmlFor="has-additive-checkbox" className="ml-2 text-xs font-semibold text-emerald-900 cursor-pointer">
              {materials.hasAdditive ? "ACTIVADO" : "DESACTIVADO"}
            </label>
          </div>
        </div>

        {materials.hasAdditive ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-emerald-800 mb-1 flex items-center gap-1">
                Reducción de Agua Esperada (%)
                <span className="group relative cursor-pointer text-emerald-600 hover:text-emerald-800">
                  <HelpCircle className="h-3 w-3" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block z-10">
                    Porcentaje de agua que el aditivo reduce (Plastificantes: 5-12%, Superplastificantes: 12-30%).
                  </span>
                </span>
              </label>
              <NumericInput
                id="additive-reduction-input"
                step="0.5"
                min="0"
                max="40"
                value={materials.additiveWaterReduction}
                onChange={(val) => handleInputChange("additiveWaterReduction", val)}
                className="w-full text-slate-800 px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-800 mb-1 flex items-center gap-1">
                Dosificación (% del peso del cemento)
                <span className="group relative cursor-pointer text-emerald-600 hover:text-emerald-800">
                  <HelpCircle className="h-3 w-3" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block z-10">
                    Proporción en peso recomendada por el fabricante (usualmente 0.5% a 2.0%).
                  </span>
                </span>
              </label>
              <NumericInput
                id="additive-dosage-input"
                step="0.05"
                min="0.0"
                max="5.0"
                value={materials.additiveDosage}
                onChange={(val) => handleInputChange("additiveDosage", val)}
                className="w-full text-slate-800 px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-800 mb-1">
                Densidad del Aditivo (g/cm³)
              </label>
              <NumericInput
                id="additive-density-input-field"
                step="0.01"
                min="0.5"
                max="2.5"
                value={materials.additiveSpecificGravity}
                onChange={(val) => handleInputChange("additiveSpecificGravity", val)}
                className="w-full text-slate-800 px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-emerald-700/80 italic">
            El aditivo está desactivado. Active la casilla si desea realizar un rediseño de agua y evaluar el impacto del plastificante en los volúmenes absolutos de los agregados.
          </p>
        )}
      </div>
    </div>
  );
};
