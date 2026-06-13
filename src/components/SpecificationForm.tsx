import React from "react";
import { DesignSpecifications } from "../types";
import { SLUMP_LABELS, EXPOSURE_LABELS } from "../constants";
import { Gauge, ShieldAlert, Sliders, Settings } from "lucide-react";
import { NumericInput } from "./NumericInput";

interface SpecificationFormProps {
  specs: DesignSpecifications;
  onChange: (specs: DesignSpecifications) => void;
}

export const SpecificationForm: React.FC<SpecificationFormProps> = ({ specs, onChange }) => {
  const handleInputChange = (field: keyof DesignSpecifications, value: any) => {
    onChange({
      ...specs,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* COMPRESSIVE STRENGTH SPECIFICATION */}
      <div id="strength-card" className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-emerald-600" />
          1. Resistencia de Diseño (f'c)
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Resistencia de Especificación f'c (kg/cm²)
              </label>
              <NumericInput
                id="specs-fc-input"
                step="10"
                min="50"
                max="600"
                value={specs.specifiedStrength}
                onChange={(val) => handleInputChange("specifiedStrength", val)}
                className="w-full text-slate-800 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Resistencia requerida a la compresión a los 28 días.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                ¿Utilizar desviación estándar S_d (ACI 318)?
              </label>
              <div className="flex items-center h-10">
                <input
                  id="specs-use-sd-checkbox"
                  type="checkbox"
                  checked={specs.useStandardDeviation}
                  onChange={(e) => handleInputChange("useStandardDeviation", e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded-xs"
                />
                <label htmlFor="specs-use-sd-checkbox" className="ml-2 text-xs font-medium text-slate-700 cursor-pointer">
                  {specs.useStandardDeviation ? "Sí, usar estadística de obra" : "No, usar sobrediseño por defecto"}
                </label>
              </div>
            </div>
          </div>

          {specs.useStandardDeviation && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Desviación Estándar S_d (kg/cm²)
                  </label>
                  <NumericInput
                    id="specs-sd-input"
                    step="1"
                    min="10"
                    max="100"
                    value={specs.standardDeviation}
                    onChange={(val) => handleInputChange("standardDeviation", val)}
                    className="w-full text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Calculado a partir de ensayos anteriores (historial de planta o laboratorio).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONSISTENCY & AIR ENTRAINMENT SECTION */}
      <div id="consist-air-card" className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-600" />
          2. Asentamiento (Slump) & Aire Libre
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Asentamiento Requerido (Trabajabilidad)
            </label>
            <div className="space-y-2">
              {Object.entries(SLUMP_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center">
                  <input
                    id={`slump-${key}`}
                    name="slumpRange"
                    type="radio"
                    checked={specs.slumpRange === key}
                    onChange={() => handleInputChange("slumpRange", key)}
                    className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor={`slump-${key}`} className="ml-3 text-xs text-slate-700 cursor-pointer">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 space-y-4">
            <div>
              <div className="flex items-center">
                <input
                  id="specs-air-checkbox"
                  type="checkbox"
                  checked={specs.airEntrained}
                  onChange={(e) => handleInputChange("airEntrained", e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded-xs"
                />
                <label htmlFor="specs-air-checkbox" className="ml-2 text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                  ¿Incorporar Aire Intencionalmente?
                </label>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Recomendado en climas fríos para proteger el concreto contra ciclos de hielo-deshielo.
              </p>
            </div>

            {specs.airEntrained && (
              <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 animate-fade-in">
                <label className="block text-xs font-semibold text-rose-900 mb-1.5">
                  Grado de Exposición (Clima)
                </label>
                <select
                  id="specs-exposure-select"
                  value={specs.exposureLevel}
                  onChange={(e) => handleInputChange("exposureLevel", e.target.value)}
                  className="w-full text-slate-800 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {Object.entries(EXPOSURE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
