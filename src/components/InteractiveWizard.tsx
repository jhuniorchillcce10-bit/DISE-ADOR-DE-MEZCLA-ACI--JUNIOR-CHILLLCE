import React, { useState } from "react";
import { MaterialProperties, DesignSpecifications, MixDesignResult } from "../types";
import { NumericInput } from "./NumericInput";
import { PRESETS } from "../presets";
import {
  TMNS_LABELS,
  SLUMP_LABELS,
  EXPOSURE_LABELS,
  WATER_AIR_TABLE,
  AIR_ENTRAINED_RECOMMENDED,
  WC_STRENGTH_TABLE,
  COARSE_BULK_VOL_TABLE,
} from "../constants";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  Beaker,
  Scale,
  Droplet,
  Percent,
  Layers,
  Flame,
  Printer,
  Compass,
  Building,
  Shield,
  Workflow,
  Check,
  FileText,
  RotateCcw,
  Boxes,
  Truck,
  Calculator,
  Grid,
  FolderOpen
} from "lucide-react";

interface InteractiveWizardProps {
  materials: MaterialProperties;
  specs: DesignSpecifications;
  result: MixDesignResult;
  onMaterialsChange: (materials: MaterialProperties) => void;
  onSpecsChange: (specs: DesignSpecifications) => void;
  projectName: string;
  companyName: string;
}

export const InteractiveWizard: React.FC<InteractiveWizardProps> = ({
  materials,
  specs,
  result,
  onMaterialsChange,
  onSpecsChange,
  projectName,
  companyName,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  // States for Step 15: Volumen de Obra Real inputs
  const [geometryType, setGeometryType] = useState<"rect" | "column" | "cylinders" | "direct">("rect");
  const [rectLength, setRectLength] = useState<number>(12.0);
  const [rectWidth, setRectWidth] = useState<number>(8.0);
  const [rectThickness, setRectThickness] = useState<number>(0.20);
  const [rectQty, setRectQty] = useState<number>(1);
  const [colDiameter, setColDiameter] = useState<number>(0.40);
  const [colHeight, setColHeight] = useState<number>(3.0);
  const [colQty, setColQty] = useState<number>(12);
  const [cylDiameter, setCylDiameter] = useState<number>(0.15);
  const [cylHeight, setCylHeight] = useState<number>(0.30);
  const [cylQty, setCylQty] = useState<number>(12);
  const [directVol, setDirectVol] = useState<number>(25.0);
  const [wastePct, setWastePct] = useState<number>(5.0);

  // Helper code to update fields
  const setMaterialField = (field: keyof MaterialProperties, value: any) => {
    onMaterialsChange({
      ...materials,
      [field]: value,
    });
  };

  const setSpecField = (field: keyof DesignSpecifications, value: any) => {
    onSpecsChange({
      ...specs,
      [field]: value,
    });
  };

  // Define 15 Steps matching the Junior Chillcce methodology strictly!
  const stepsList = [
    { id: 1, title: "1. Resistencia f'cr", desc: "Objetivo y sobrediseño" },
    { id: 2, title: "2. Selección TMN", desc: "Tamaño máximo de piedra" },
    { id: 3, title: "3. Selección Slump", desc: "Asentamiento deseado" },
    { id: 4, title: "4. Agua de Diseño", desc: "L/m³ de la tabla ACI" },
    { id: 5, title: "5. Contenido de Aire", desc: "Porcentaje atrapado" },
    { id: 6, title: "6. Relación A/C", desc: "Resistencia e interpolación" },
    { id: 7, title: "7. Factor Cemento", desc: "Sacos y peso secos" },
    { id: 8, title: "8. Agregado Grueso", desc: "Punto b/b₀ y volumen" },
    { id: 9, title: "9. Volumen Absoluto", desc: "Suma de componentes" },
    { id: 10, title: "10. Agregado Fino", desc: "Diseño neto de arena" },
    { id: 11, title: "11. Diseño Seco", desc: "Pesos secos de diseño" },
    { id: 12, title: "12. Humedad y Obra", desc: "Pesos corregidos" },
    { id: 13, title: "13. Proporciones", desc: "Relación cemento : arena" },
    { id: 14, title: "14. Tanda por Bolsa", desc: "Dosificación en latas 20L" },
    { id: 15, title: "15. Volumen de Obra", desc: "Cómputos y desperdicios" },
  ];

  const handleNext = () => {
    if (activeStep < 15) setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  // Calculate concrete volumes for Step 15
  let calculatedVolume = 0;
  if (geometryType === "rect") {
    calculatedVolume = rectLength * rectWidth * rectThickness * rectQty;
  } else if (geometryType === "column") {
    calculatedVolume = Math.PI * Math.pow(colDiameter / 2, 2) * colHeight * colQty;
  } else if (geometryType === "cylinders") {
    calculatedVolume = Math.PI * Math.pow(cylDiameter / 2, 2) * cylHeight * cylQty;
  } else if (geometryType === "direct") {
    calculatedVolume = directVol;
  }

  const volumeWithWaste = calculatedVolume * (1 + wastePct / 100);

  // Material calculations for Step 15 based on the exact results computed
  const totalCementKgs = result.cementWeight * volumeWithWaste;
  const totalCementBags = totalCementKgs / 42.5;

  const totalFineAggWetKgs = result.fineAggregateWetWeight * volumeWithWaste;
  const totalFineAggLooseM3 = totalFineAggWetKgs / (materials.fineLooseUnitWeight || 1520);
  const totalFineAggLooseCans = (totalFineAggLooseM3 * 1000) / 20;

  const totalCoarseAggWetKgs = result.coarseAggregateWetWeight * volumeWithWaste;
  const totalCoarseAggLooseM3 = totalCoarseAggWetKgs / (materials.coarseLooseUnitWeight || 1420);
  const totalCoarseAggLooseCans = (totalCoarseAggLooseM3 * 1000) / 20;

  const totalWaterLiters = result.correctedWaterVol * volumeWithWaste;
  const totalWaterCans = totalWaterLiters / 20;

  const totalAdditiveKgs = result.additiveWeight * volumeWithWaste;
  const totalAdditiveCc = (totalAdditiveKgs / (materials.additiveSpecificGravity || 1.15)) * 1000;

  return (
    <div className="space-y-6 text-slate-800" id="interactive-wizard-container">
      {/* WIZARD TRACKER - NAVIGATION BAR */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4.5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
              <Workflow className="h-5.5 w-5.5 text-emerald-400 animate-pulse" />
            </span>
            <div>
              <span className="text-[11px] uppercase font-black text-emerald-400 tracking-wider">Metodología estandarizada • Junior Chillcce</span>
              <h2 className="text-base font-black text-white leading-tight uppercase tracking-wide">Diseño de Mezcla en 15 Pasos Conforme a Norma</h2>
            </div>
          </div>
          <div className="bg-slate-850/90 border border-slate-750 rounded-xl px-4 py-2 text-right flex items-center gap-3.5 shadow-sm">
            <div>
              <span className="block text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">Progreso del Asistente</span>
              <span className="text-sm font-black text-emerald-400 font-mono">Paso {activeStep} de 15 ({Math.round((activeStep / 15) * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* HORIZONTAL STEP CHIPS EN GRID RESPONSIVO */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-15 gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {stepsList.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`py-3.5 px-2.5 rounded-xl border text-left transition-all text-sm flex flex-col justify-between shadow-xs cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-md font-black scale-[1.02] ring-2 ring-emerald-500/20 z-10"
                    : isCompleted
                    ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-600"
                    : "bg-slate-800 border-slate-750/70 text-slate-400 hover:bg-slate-750/70 hover:text-slate-100 hover:border-slate-650"
                }`}
                style={{ minWidth: "125px" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`h-5 w-5 rounded-full text-[10px] flex items-center justify-center font-bold build-step-badge ${
                    isActive ? "bg-white text-emerald-700" : isCompleted ? "bg-emerald-500/20 text-emerald-400 font-extrabold" : "bg-slate-700 text-slate-400"
                  }`}>
                    {step.id}
                  </span>
                  <span className="font-extrabold text-[10.5px] tracking-tight truncate">Paso {step.id}</span>
                </div>
                <span className="text-[9.5px] opacity-90 truncate block leading-none font-medium">
                  {step.title.split(". ")[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE INPUT PANEL FOR THIS STEP (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md">
                INPUTS PASO {activeStep}
              </span>
              <span className="text-xs text-slate-500 font-medium">Variables e interacción:</span>
            </div>

            {/* RENDERING DYNAMIC INPUTS ACCORDING TO THE ACTIVE STEP */}
            {activeStep === 1 && (
              <div className="space-y-4 font-sans animate-fade-in">
                {/* Visual Preset Template Selector */}
                <div className="bg-emerald-50/55 p-3.5 rounded-xl border border-emerald-100 shadow-3xs">
                  <label className="block text-[10px] uppercase font-black text-emerald-800 tracking-wider mb-1.5 flex items-center gap-1.5 leading-none">
                    <FolderOpen className="h-4 w-4 text-emerald-600" />
                    Cargar Plantilla de Mezcla Rápida
                  </label>
                  <select
                    id="preset-template-select-wizard"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const p = PRESETS.find(item => item.id === val);
                        if (p) {
                          onMaterialsChange({ ...p.materials });
                          onSpecsChange({ ...p.specs });
                        }
                      }
                    }}
                    className="w-full bg-white text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    value=""
                  >
                    <option value="" disabled>-- Selecciona un diseño de mezcla predefinido --</option>
                    {PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                    Preestablece automáticamente las propiedades de agregados y resistencia según el ACI 211.1.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Resistencia de Diseño Especificada f'c (kg/cm²)
                  </label>
                  <NumericInput
                    step="10"
                    min="100"
                    max="500"
                    value={specs.specifiedStrength}
                    onChange={(val) => setSpecField("specifiedStrength", val)}
                    className="w-full text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-black text-rose-700"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 mb-2">
                    Es la resistencia estipulada en los planos (ej. 175, 210, 280, 350 kg/cm²).
                  </p>

                  {/* Quick selection preset chips matching Peru standard practices */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {[140, 175, 210, 245, 280, 350, 420].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSpecField("specifiedStrength", val)}
                        className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all cursor-pointer ${
                          specs.specifiedStrength === val
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/70"
                        }`}
                      >
                        f'c {val}
                      </button>
                    ))}
                  </div>

                  {/* Visually stunning TABLA N° 01 showing f'c vs f'cr criteria */}
                  <div className="mt-3 bg-[#fdfaf2] p-3 rounded-lg border border-amber-100 shadow-2xs space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        TABLA N° 01: RESISTENCIA PROMEDIO REQUERIDA (f'cr)
                      </span>
                    </div>
                    
                    <div className="overflow-x-auto select-none pt-1">
                      <table className="w-full text-left text-[9.5px] font-sans border-collapse">
                        <thead>
                          <tr className="bg-amber-100/60 text-amber-950 font-bold uppercase border-b border-amber-200 text-[8px]">
                            <th className="py-1 px-2 rounded-l-md text-left">f'c (Resistencia de Diseño)</th>
                            <th className="py-1 px-2 rounded-r-md text-right">f'cr (Resistencia Promedio)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-150/45">
                          {[
                            { label: 'f\'c < 210 kg/cm²', fcrLabel: "f'c + 70", check: (fc: number) => fc < 210, desc: "+70" },
                            { label: '210 a 350 kg/cm²', fcrLabel: "f'c + 84", check: (fc: number) => fc >= 210 && fc <= 350, desc: "+84" },
                            { label: 'f\'c > 350 kg/cm²', fcrLabel: "f'c + 98", check: (fc: number) => fc > 350, desc: "+98" },
                          ].map((row, idx) => {
                            const isSelected = row.check(specs.specifiedStrength || 0);
                            return (
                              <tr 
                                key={idx} 
                                className={`transition-all ${
                                  isSelected 
                                    ? "bg-emerald-50/90 border-l-3 border-l-emerald-600 font-extrabold text-slate-900 shadow-3xs" 
                                    : "hover:bg-amber-50/30 text-slate-600"
                                }`}
                              >
                                <td className="py-1.5 px-2 font-black text-[10px]">{row.label}</td>
                                <td className="py-1.5 px-2 text-right">
                                  <span className={`font-mono ${isSelected ? "text-emerald-700 font-extrabold" : ""}`}>{row.fcrLabel}</span>
                                  <span className="text-[8.5px] ml-1.5 text-slate-400 font-medium">({row.desc})</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9px] flex flex-col gap-1.5 font-sans mt-2">
                      <div className="flex items-start gap-1">
                        <Sparkles className="h-3 w-3 mt-0.5 text-emerald-600 shrink-0" />
                        <span>
                          Dado que f'c = <strong>{specs.specifiedStrength} kg/cm²</strong>
                          {specs.specifiedStrength < 210 
                            ? " (menor a 210)" 
                            : specs.specifiedStrength <= 350 
                            ? " (rango 210 a 350)" 
                            : " (mayor a 350)"
                          }, se aplica la fórmula:
                        </span>
                      </div>
                      <div className="pl-4 font-mono font-black text-[10.5px] text-emerald-800 bg-white/60 p-1.5 rounded-sm border border-emerald-150/40">
                        f'cr = {specs.specifiedStrength} + {specs.specifiedStrength < 210 ? "70" : specs.specifiedStrength <= 350 ? "84" : "98"} = {result.targetStrength} kg/cm²
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2.5">
                  <div className="flex items-center">
                    <input
                      id="step1-sd-check"
                      type="checkbox"
                      checked={specs.useStandardDeviation}
                      onChange={(e) => setSpecField("useStandardDeviation", e.target.checked)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded-xs cursor-pointer"
                    />
                    <label htmlFor="step1-sd-check" className="ml-2 text-xs font-bold text-slate-700 cursor-pointer">
                      ¿Se dispone de Desviación Estándar (S_d)?
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Opcional. Activa el cálculo estadístico si posees histórico de probetas ensayadas.
                  </p>

                  {specs.useStandardDeviation && (
                    <div className="pt-2 animate-fade-in">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Desviación Estándar S_d (kg/cm²)
                      </label>
                      <NumericInput
                        step="1"
                        min="15"
                        max="80"
                        value={specs.standardDeviation}
                        onChange={(val) => setSpecField("standardDeviation", val)}
                        className="w-full text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Selección del Tamaño Máximo Nominal (TMN) de Piedra
                  </label>
                  <p className="text-[10px] text-slate-450 mb-2">Conforme a la estructura o espaciamiento de barras de refuerzo.</p>
                  <select
                    value={materials.coarseMaxNominalSize}
                    onChange={(e) => setMaterialField("coarseMaxNominalSize", e.target.value)}
                    className="w-full text-slate-850 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.entries(TMNS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        Tamaño {val}" ({label})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-blue-50 text-blue-900 text-[10px] rounded-lg leading-relaxed border border-blue-100">
                  <strong>Recomendaciones Prácticas:</strong> Un TMN mayor reduce el volumen de poros y el requerimiento de pasta de cemento.
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1 uppercase tracking-wider text-rose-700">
                    PASO 3: SELECCIÓN DEL ASENTAMIENTO (SLUMP)
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-3">
                    De acuerdo a las especificaciones, las condiciones de colocación requieren determinar el asentamiento óptimo según la consistencia y el método de compactación.
                  </p>

                  {/* Interactivo ACI / Practice Table matching the provided image exactly */}
                  <div className="bg-[#fdfaf2] p-3 rounded-lg border border-amber-100 shadow-2xs space-y-2 text-left">
                    <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      TABLA DE CONSISTENCIA Y ASENTAMIENTO (SLUMP)
                    </span>
                    
                    <div className="overflow-x-auto select-none pt-1">
                      <table className="w-full text-left text-[9.5px] font-sans border-collapse">
                        <thead>
                          <tr className="bg-amber-100/60 text-amber-950 font-bold uppercase border-b border-amber-200 text-[8px]">
                            <th className="py-1 px-2 rounded-l-md text-left">Consistencia</th>
                            <th className="py-1 px-1 text-center">Slump (Pulg)</th>
                            <th className="py-1 px-1.5 text-center">Trabajabilidad</th>
                            <th className="py-1 px-2 rounded-r-md text-right">Método de Compactación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-150/45">
                          {[
                            { 
                              key: '1-2', 
                              cons: 'SECA', 
                              slump: '0" a 2"', 
                              trab: 'Poco trabajable', 
                              comp: 'Vibración normal' 
                            },
                            { 
                              key: '3-4', 
                              cons: 'PLÁSTICA', 
                              slump: '3" a 4"', 
                              trab: 'Trabajable', 
                              comp: 'Vibración ligera, chuseado' 
                            },
                            { 
                              key: '6-7', 
                              cons: 'FLUIDA', 
                              slump: '> 5" (6" a 7")', 
                              trab: 'Muy trabajable', 
                              comp: 'Chuseado' 
                            },
                          ].map((row) => {
                            const isSelected = specs.slumpRange === row.key;
                            return (
                              <tr 
                                key={row.key} 
                                onClick={() => setSpecField("slumpRange", row.key)}
                                className={`transition-all cursor-pointer ${
                                  isSelected 
                                    ? "bg-emerald-50/90 border-l-3 border-l-emerald-600 font-extrabold text-slate-900 shadow-3xs" 
                                    : "hover:bg-amber-50/40 text-slate-600"
                                }`}
                              >
                                <td className="py-2.5 px-2 font-black text-[10px] text-slate-800">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      name="step3-slump"
                                      type="radio"
                                      checked={isSelected}
                                      onChange={() => {}} // handled by tr click
                                      className="h-3 w-3 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                    />
                                    <span>{row.cons}</span>
                                  </div>
                                </td>
                                <td className={`py-2.5 px-1 text-center font-mono font-bold ${isSelected ? "text-emerald-700" : ""}`}>{row.slump}</td>
                                <td className="py-2.5 px-1.5 text-center text-slate-500 font-medium">{row.trab}</td>
                                <td className="py-2.5 px-2 text-right text-slate-500 font-medium leading-tight">{row.comp}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9px] flex flex-col gap-1.5 font-sans mt-2">
                      <div className="flex items-start gap-1">
                        <Sparkles className="h-3 w-3 mt-0.5 text-emerald-605 shrink-0" />
                        <span>
                          Consistencia seleccionada: <strong className="text-emerald-900">{specs.slumpRange === "1-2" ? "SECA" : specs.slumpRange === "3-4" ? "PLÁSTICA" : "FLUIDA"}</strong> con una trabajabilidad <strong>{specs.slumpRange === "1-2" ? "Poco trabajable" : specs.slumpRange === "3-4" ? "Trabajable" : "Muy trabajable"}</strong>.
                        </span>
                      </div>
                      <div className="pl-4 font-normal text-slate-600">
                        Se utilizará un asentamiento de <strong>{SLUMP_LABELS[specs.slumpRange]}</strong> para los cálculos automáticos de requerimiento de agua.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 4: VOLUMEN UNITARIO DE AGUA (Tabla 10.2.1)
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-3">
                    De acuerdo a la tabla de diseño ACI 211.1, determinamos el volumen unitario de agua (litros de agua por metro cúbico) según la consistencia (Slump) y el Tamaño Máximo Nominal (TMN) del agregado.
                  </p>

                  {/* VISUAL ACI TABLE 10.2.1 WITH INTERACTIVE CELL HIGHLIGHTING */}
                  <div className="bg-[#fdfaf2] p-3 rounded-lg border border-amber-100 shadow-2xs space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                        <Droplet className="h-4 w-4 text-blue-600 shrink-0" />
                        TABLA 10.2.1: VOLUMEN DE AGUA UNITARIO (L/m³)
                      </span>
                      <span className="text-[8px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-sm">
                        {specs.airEntrained ? "CON AIRE INCORPORADO" : "SIN AIRE INCORPORADO"}
                      </span>
                    </div>

                    <div className="overflow-x-auto pt-1">
                      <table className="w-full text-left text-[9px] font-sans border-collapse">
                        <thead>
                          <tr className="bg-amber-100/60 text-amber-950 font-bold uppercase border-b border-amber-250 text-[7.5px]">
                            <th className="py-1 px-1.5 rounded-l-md text-left">Asentamiento</th>
                            {['3/8"', '1/2"', '3/4"', '1"', '1-1/2"', '2"', '3"', '6"'].map((tmnCol) => {
                              const key = tmnCol.replace('"', '');
                              const isColActive = materials.coarseMaxNominalSize === key;
                              return (
                                <th 
                                  key={tmnCol} 
                                  className={`py-1 px-0.5 text-center font-bold ${
                                    isColActive ? "bg-amber-150 text-amber-950 px-1 border-x border-amber-200" : ""
                                  }`}
                                >
                                  {tmnCol}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-150/45">
                          {[
                            { range: "1-2", label: '1" a 2"' },
                            { range: "3-4", label: '3" a 4"' },
                            { range: "6-7", label: '6" a 7"' },
                          ].map((rowItem) => {
                            const isRowActive = specs.slumpRange === rowItem.range;
                            return (
                              <tr 
                                key={rowItem.range} 
                                className={`transition-all ${
                                  isRowActive ? "bg-amber-50/50" : ""
                                }`}
                              >
                                <td className={`py-1.5 px-1.5 font-bold ${isRowActive ? "text-amber-900 font-black border-l-2 border-emerald-500 pl-1" : "text-slate-600"}`}>
                                  {rowItem.label}
                                </td>
                                {['3/8', '1/2', '3/4', '1', '1-1/2', '2', '3', '6'].map((tmnKey) => {
                                  const isColActive = materials.coarseMaxNominalSize === tmnKey;
                                  const isIntersect = isRowActive && isColActive;
                                  const waterVal = WATER_AIR_TABLE[specs.airEntrained ? "with-air" : "no-air"]?.[rowItem.range]?.[tmnKey]?.water || 0;
                                  
                                  return (
                                    <td 
                                      key={tmnKey} 
                                      className={`py-1.5 px-0.5 text-center font-mono transition-all ${
                                        isIntersect 
                                          ? "bg-emerald-500 text-white font-black text-[11px] rounded-md scale-110 shadow-sm border border-emerald-600 animate-pulse" 
                                          : isColActive 
                                          ? "bg-amber-100/30 text-slate-800 font-semibold"
                                          : isRowActive 
                                          ? "text-slate-900 font-medium" 
                                          : "text-slate-450"
                                      }`}
                                    >
                                      {waterVal || "—"}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9.5px] leading-snug space-y-1 mt-2">
                      <div className="flex items-start gap-1 font-medium">
                        <Sparkles className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                        <span>
                          De acuerdo a la tabla, el volumen Unitario de agua, o agua de diseño necesario para una mezcla de concreto cuyo asentamiento es de <strong className="text-emerald-900">"{specs.slumpRange === "1-2" ? "1 a 2" : specs.slumpRange === "3-4" ? "3 a 4" : "6 a 7"}"</strong> en una mezcla <strong className="text-emerald-900">{specs.airEntrained ? "con aire incorporado" : "sin aire incorporado"}</strong> cuyo agregado tiene un TMN de <strong className="text-emerald-900">{materials.coarseMaxNominalSize}"</strong>, es de <strong className="text-emerald-800 text-[11px] font-black underline bg-white px-1 py-0.5 rounded-sm border border-emerald-200">{result.baseWaterVol} lt/m³</strong>.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional water reduction modifier */}
                  <div className="mt-4 bg-slate-50 p-3.5 rounded-lg border border-slate-150 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">¿Usar Aditivo Reductor / Plastificante?</span>
                        <span className="text-[9px] text-slate-400 block leading-tight">Reduce la cantidad de agua libre requerida sin perder trabajabilidad.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={materials.hasAdditive}
                        onChange={(e) => setMaterialField("hasAdditive", e.target.checked)}
                        className="h-4 w-4 text-emerald-600 rounded-sm cursor-pointer"
                      />
                    </div>

                    {materials.hasAdditive && (
                      <div className="pt-2.5 border-t border-slate-100 space-y-1.5 animate-fade-in text-xs">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Porcentaje de Reducción de Agua (%)</label>
                        <div className="flex gap-2 items-center">
                          <NumericInput
                            step="0.5"
                            min="5"
                            max="30"
                            value={materials.additiveWaterReduction}
                            onChange={(val) => setMaterialField("additiveWaterReduction", val)}
                            className="w-24 text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-rose-700"
                          />
                          <span className="text-[10px] text-slate-500">
                            Agua real ajustada: <strong>{result.adjustedWaterVol.toFixed(1)} L/m³</strong> (ahorro de {(result.baseWaterVol - result.adjustedWaterVol).toFixed(1)} L)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 5: CONTENIDO DE AIRE (Tabla 11.2.1)
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-3">
                    El concreto siempre contiene burbujas de aire atrapado de forma natural. De acuerdo a la norma ACI 211.1 y las condiciones de exposición, seleccionamos el porcentaje de aire correspondiente.
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 mb-3 text-left">
                    <div className="flex items-center">
                      <input
                        id="step5-air-check"
                        type="checkbox"
                        checked={specs.airEntrained}
                        onChange={(e) => setSpecField("airEntrained", e.target.checked)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded-xs cursor-pointer"
                      />
                      <label htmlFor="step5-air-check" className="ml-2 text-xs font-bold text-slate-700 cursor-pointer">
                        ¿Aire Incorporado Intencionalmente?
                      </label>
                    </div>

                    {specs.airEntrained && (
                      <div className="mt-3.5 pt-2 border-t border-slate-200 animate-fade-in">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nivel de Exposición</label>
                        <select
                          value={specs.exposureLevel}
                          onChange={(e) => setSpecField("exposureLevel", e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-hidden"
                        >
                          {Object.entries(EXPOSURE_LABELS).map(([k, l]) => (
                            <option key={k} value={k}>{l}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Visual ACI table showing the air based on TMN */}
                  <div className="bg-[#fdfaf2] p-3 rounded-lg border border-amber-100 shadow-2xs space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                        <Grid className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        Tabla 11.2.1: CONTENIDO DE AIRE ATRAPADO Y RECOMENDADO
                      </span>
                      <span className="text-[8px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-sm">
                        {specs.airEntrained ? "AIRE INCORPORADO" : "AIRE ATRAPADO NATURAL"}
                      </span>
                    </div>
                    
                    {/* Interactive visual mini ACI Table */}
                    <div className="overflow-x-auto select-none pt-1">
                      <table className="w-full text-left text-[9.5px] font-sans border-collapse">
                        <thead>
                          <tr className="bg-amber-100/60 text-amber-950 font-bold uppercase border-b border-amber-200 text-[8px]">
                            <th className="py-1 px-2 rounded-l-md text-left font-bold">Tamaño Máximo Nominal</th>
                            <th className="py-2 px-1 text-center font-bold">Aire Atrapado (Sin Aire)</th>
                            <th className="py-1 px-2 rounded-r-md text-right font-bold">Aire Incorporado (Promedio)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-150/45">
                          {[
                            { tmn: '3/8"', trap: '3.0%', inc: '4.5% / 6.0% / 7.5%', key: '3/8' },
                            { tmn: '1/2"', trap: '2.5%', inc: '4.0% / 5.5% / 7.0%', key: '1/2' },
                            { tmn: '3/4"', trap: '2.0%', inc: '3.5% / 5.0% / 6.0%', key: '3/4' },
                            { tmn: '1"', trap: '1.5%', inc: '3.0% / 4.5% / 6.0%', key: '1' },
                            { tmn: '1-1/2"', trap: '1.0%', inc: '2.5% / 4.5% / 5.5%', key: '1-1/2' },
                            { tmn: '2"', trap: '0.5%', inc: '2.0% / 4.0% / 5.0%', key: '2' },
                            { tmn: '3"', trap: '0.3%', inc: '1.5% / 3.5% / 4.5%', key: '3' },
                            { tmn: '6"', trap: '0.2%', inc: '1.0% / 3.0% / 4.0%', key: '6' },
                          ].map((row) => {
                            const isSelected = materials.coarseMaxNominalSize === row.key;
                            return (
                              <tr 
                                key={row.key} 
                                className={`transition-all ${
                                  isSelected 
                                    ? "bg-emerald-50/90 border-l-3 border-l-emerald-600 font-extrabold text-slate-900 shadow-3xs" 
                                    : "hover:bg-amber-50/30 text-slate-600"
                                }`}
                              >
                                <td className="py-1.5 px-2 font-black text-[10px]">{row.tmn}</td>
                                <td className={`py-1.5 px-1 text-center font-mono ${isSelected && !specs.airEntrained ? "text-emerald-700 font-black text-[11px]" : ""}`}>{row.trap}</td>
                                <td className={`py-1.5 px-2 text-right font-mono ${isSelected && specs.airEntrained ? "text-emerald-700 font-black text-[11px]" : ""}`}>{row.inc}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9.5px] leading-snug space-y-1 mt-2">
                      <div className="flex items-start gap-1">
                        <Sparkles className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                        <div>
                          <span>
                            De la tabla se determina que el contenido de aire <strong>{specs.airEntrained ? "incorporado" : "atrapado"}</strong> para un agregado grueso de TMN = <strong className="text-emerald-900">{TMNS_LABELS[materials.coarseMaxNominalSize]}</strong> es de <strong className="text-emerald-800 text-[11px] font-black underline bg-white px-1 py-0.5 rounded-sm border border-emerald-250">{result.baseAirPct.toFixed(1)}%</strong>.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 6 && (() => {
              const sortedTable = [...WC_STRENGTH_TABLE].sort((a, b) => b.fc - a.fc);
              const getVal = (item: (typeof WC_STRENGTH_TABLE)[0]) => 
                specs.airEntrained ? item.withAir : item.noAir;
              
              const fcrVal = result.targetStrength;
              const highest = sortedTable[0];
              const lowest = sortedTable[sortedTable.length - 1];
              
              let lowerBound = lowest;
              let upperBound = highest;
              
              if (fcrVal >= highest.fc) {
                lowerBound = highest;
                upperBound = highest;
              } else if (fcrVal <= lowest.fc) {
                lowerBound = lowest;
                upperBound = lowest;
              } else {
                for (let i = 0; i < sortedTable.length - 1; i++) {
                  const upper = sortedTable[i];
                  const lower = sortedTable[i + 1];
                  if (fcrVal <= upper.fc && fcrVal >= lower.fc) {
                    upperBound = upper;
                    lowerBound = lower;
                    break;
                  }
                }
              }

              const y1 = getVal(lowerBound);
              const y2 = getVal(upperBound);
              const x1 = lowerBound.fc;
              const x2 = upperBound.fc;

              const isExact = fcrVal === x1 || fcrVal === x2;
              const isClamped = fcrVal >= highest.fc || fcrVal <= lowest.fc;

              return (
                <div className="space-y-4 animate-fade-in text-left">
                  <div>
                    <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                      PASO 6: RELACIÓN AGUA/CEMENTO (A/C) POR RESISTENCIA
                    </label>
                    <p className="text-[10px] text-slate-500 leading-tight mb-3">
                      La relación agua/cemento (A/C) determina la resistencia y durabilidad del concreto. Para una resistencia f'cr de <strong className="text-slate-800">{fcrVal} kg/cm²</strong>, se realiza una interpolación lineal en la Tabla ACI 211.1.
                    </p>

                    {/* INTERACTIVE TABLE WITH HIGHLIGHTING */}
                    <div className="bg-[#fdfaf2] p-3 rounded-lg border border-amber-100 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                          <Calculator className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          TABLA RElACIÓN A/C POR COMBINACIÓN DE RESISTENCIA f'c
                        </span>
                        <span className="text-[8px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-sm border border-amber-200">
                          {specs.airEntrained ? "CON AIRE INCORPORADO" : "SIN AIRE INCORPORADO"}
                        </span>
                      </div>

                      <div className="overflow-x-auto pt-1">
                        <table className="w-full text-left text-[9px] font-sans border-collapse">
                          <thead>
                            <tr className="bg-amber-100/60 text-amber-950 font-bold uppercase border-b border-amber-250 text-[7.5px]">
                              <th className="py-1 px-2 rounded-l-md text-left font-bold">Resistencia f'c / f'cr (kg/cm²)</th>
                              <th className="py-1 px-1.5 text-center font-bold">Relación A/C (Sin Aire)</th>
                              <th className="py-1 px-2 rounded-r-md text-right font-bold">Relación A/C (Con Aire)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-150/45">
                            {sortedTable.map((row) => {
                              const isBetween = fcrVal <= upperBound.fc && fcrVal >= lowerBound.fc && (row.fc === upperBound.fc || row.fc === lowerBound.fc);
                              const isExactMatch = fcrVal === row.fc;
                              
                              let rowClass = "hover:bg-amber-100/20 text-slate-600";
                              if (isExactMatch) {
                                rowClass = "bg-emerald-100/80 border-l-3 border-l-emerald-600 font-extrabold text-emerald-950 shadow-3xs";
                              } else if (isBetween) {
                                rowClass = "bg-amber-50/90 border-l-3 border-l-amber-500 font-semibold text-slate-800 shadow-3xs";
                              }

                              return (
                                <tr key={row.fc} className={`transition-all ${rowClass}`}>
                                  <td className="py-1.5 px-2 font-black text-[10.5px]">
                                    {row.fc} kg/cm²
                                    {isExactMatch && <span className="ml-1 text-[8px] uppercase font-bold text-emerald-800 bg-emerald-200/50 px-1 py-0.5 rounded-sm">Exacto</span>}
                                    {!isExactMatch && isBetween && (
                                      <span className="ml-1 text-[8px] uppercase font-bold text-amber-800 bg-amber-200/50 px-1 py-0.5 rounded-sm">
                                        {row.fc === upperBound.fc ? "Límite Sup" : "Límite Inf"}
                                      </span>
                                    )}
                                  </td>
                                  <td className={`py-1.5 px-1.5 text-center font-mono ${!specs.airEntrained && (isExactMatch || isBetween) ? "text-emerald-700 font-extrabold text-[9.5px]" : ""}`}>
                                    {row.noAir.toFixed(2)}
                                  </td>
                                  <td className={`py-1.5 px-2 text-right font-mono ${specs.airEntrained && (isExactMatch || isBetween) ? "text-emerald-700 font-extrabold text-[9.5px]" : ""}`}>
                                    {row.withAir.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* STATS & MATH DETAILED INTERPOLATION */}
                      <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9.5px] leading-snug space-y-1.5 mt-2">
                        <div className="flex items-start gap-1 font-bold text-[10px] text-emerald-900 border-b border-emerald-150/40 pb-1 flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                            INTERPOLACIÓN DETALLADA (f'cr = {fcrVal} kg/cm²)
                          </span>
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded-sm border border-emerald-200 text-emerald-800 font-black">
                            A/C = {result.waterCementRatio.toFixed(2)}
                          </span>
                        </div>

                        {isClamped ? (
                          <div className="text-[9px] text-slate-600">
                            La resistencia promedio requerida <strong>f'cr ({fcrVal} kg/cm²)</strong> está fuera de los rangos típicos de la tabla, por lo que se utiliza el valor extremo de la tabla: <strong>{result.waterCementRatio.toFixed(2)}</strong>.
                          </div>
                        ) : isExact ? (
                          <div className="text-[9px] text-slate-600">
                            La resistencia promedio requerida coincide exactamente con un valor de la tabla. Se selecciona directamente: <strong>{result.waterCementRatio.toFixed(2)}</strong>.
                          </div>
                        ) : (
                          <div className="space-y-1 font-sans text-slate-700 text-[9px]">
                            <div className="grid grid-cols-2 gap-2 text-[8.5px] text-slate-500 font-mono">
                              <div>
                                • Límite Inferior (x₁): <strong>{x1} kg/cm²</strong> → A/C (y₁): <strong>{y1.toFixed(2)}</strong>
                              </div>
                              <div>
                                • Límite Superior (x₂): <strong>{x2} kg/cm²</strong> → A/C (y₂): <strong>{y2.toFixed(2)}</strong>
                              </div>
                            </div>
                            <div className="bg-white/60 p-2 rounded-sm border border-emerald-150/30 mt-1 font-mono text-[9px] text-emerald-900 overflow-x-auto">
                              <div>
                                <span>Fórmula: </span>
                                <span className="font-bold text-slate-600">y = y₁ + ((x - x₁) * (y₂ - y₁)) / (x₂ - x₁)</span>
                              </div>
                              <div className="mt-1 font-black">
                                <span>A/C = {y1.toFixed(2)} + (({fcrVal} - {x1}) * ({y2.toFixed(2)} - {y1.toFixed(2)})) / ({x2} - {x1})</span>
                              </div>
                              <div className="text-slate-500 font-medium">
                                A/C = {y1.toFixed(2)} + ({fcrVal - x1} * {(y2 - y1).toFixed(2)}) / {x2 - x1} = {y1.toFixed(2)} + ({( (fcrVal - x1) * (y2 - y1) ).toFixed(4)}) / {x2 - x1}
                              </div>
                              <div className="text-emerald-700 font-extrabold mt-0.5">
                                A/C = {y1.toFixed(2)} + ({( ((fcrVal - x1) * (y2 - y1)) / (x2 - x1) ).toFixed(4)}) = {result.waterCementRatio.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeStep === 7 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 7: FACTOR CEMENTO
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-3">
                    El contenido de cemento por unidad de volumen de concreto se determina dividiendo el volumen unitario de agua (Paso 4) entre la relación de diseño Agua/Cemento (Paso 6).
                  </p>

                  {/* MATHEMATICAL FORMULA CARD */}
                  <div className="bg-[#fdfaf2] p-4 rounded-lg border border-amber-100 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                        <Scale className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        CÁLCULO DEL FACTOR CEMENTO
                      </span>
                      <span className="text-[8px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-sm">
                        MÉTODO ACI 211.1
                      </span>
                    </div>

                    {/* Formula 1: factor cemento en Kg/m³ */}
                    <div className="p-3 bg-white rounded-md border border-amber-150/50 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        1. Contenido de Cemento en Peso
                      </div>
                      <div className="flex flex-col items-center py-2.5 bg-slate-50/50 rounded-sm border border-slate-100">
                        <div className="text-[10.5px] font-mono text-center font-black text-slate-700 flex flex-col items-center">
                          <span className="text-[12px] text-rose-700">Volumen unitario de agua</span>
                          <span className="h-0.5 w-40 bg-slate-400 my-1"></span>
                          <span className="text-[10px] text-slate-500">relación agua cemento</span>
                        </div>
                      </div>

                      <div className="pt-2 font-mono text-[10px] text-slate-700 space-y-1">
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-1 rounded-xs">
                          <span>• Volumen Unitario de Agua (Paso 4):</span>
                          <strong className="text-slate-900">{result.adjustedWaterVol.toFixed(3)} L/m³</strong>
                        </div>
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-1 rounded-xs mt-1">
                          <span>• Relación Agua / Cemento (Paso 6):</span>
                          <strong className="text-slate-900">{result.waterCementRatio.toFixed(2)}</strong>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center text-[10.5px] font-black text-emerald-900">
                          <span>Resultado:</span>
                          <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-sm border border-emerald-200">
                            {result.adjustedWaterVol.toFixed(3)} / {result.waterCementRatio.toFixed(2)} = {result.cementWeight.toFixed(3)} kg/m³
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Formula 2: factor cemento en bolsas/m³ */}
                    <div className="p-3 bg-white rounded-md border border-amber-150/50 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        2. Dosificación en Sacos / Bolsas
                      </div>
                      <div className="flex flex-col items-center py-2 bg-slate-50/50 rounded-sm border border-slate-100">
                        <div className="text-[10.5px] font-mono text-center font-black text-slate-700 flex flex-col items-center">
                          <span className="text-[11px] text-rose-700">peso del cemento {result.cementWeight.toFixed(3)} kg</span>
                          <span className="h-0.5 w-44 bg-slate-400 my-1"></span>
                          <span className="text-[10px] text-slate-500">peso de una bolsa (42.5 kg)</span>
                        </div>
                      </div>

                      <div className="pt-1.5 font-mono text-[10.5px] font-black text-slate-700 flex justify-between items-center">
                        <span className="text-amber-950 text-[10px]">Rendimiento del cemento:</span>
                        <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-sm border border-amber-200">
                          {(result.cementWeight / 42.5).toFixed(3)} bolsas/m³
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9.5px] leading-snug space-y-1">
                      <div className="flex items-start gap-1 font-medium">
                        <Sparkles className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                        <span>
                          Para la resistencia calculada de <strong className="text-emerald-900">{result.targetStrength} kg/cm²</strong> con un agua de <strong className="text-emerald-900">{result.adjustedWaterVol.toFixed(3)} L</strong> y A/C de <strong className="text-emerald-900">{result.waterCementRatio.toFixed(2)}</strong>, el diseño requiere <strong className="text-emerald-800 text-[11px] font-black underline bg-white px-1 py-0.5 rounded-sm border border-emerald-250">{result.cementWeight.toFixed(3)} kg/m³</strong> de cemento, equivalente a <strong className="text-emerald-800 text-[11px] font-black underline bg-white px-1 py-0.5 rounded-sm border border-emerald-250">{(result.cementWeight / 42.5).toFixed(3)} bolsas/m³</strong>.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INPUT SPECIFIC GRAVITY */}
                  <div className="mt-4 bg-slate-50 p-3.5 rounded-lg border border-slate-150 space-y-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 mb-0.5">
                        Gravedad Específica del Cemento (Pe)
                      </label>
                      <div className="flex gap-2 items-center">
                        <NumericInput
                          step="0.01"
                          min="2.8"
                          max="3.4"
                          value={materials.cementSpecificGravity}
                          onChange={(val) => setMaterialField("cementSpecificGravity", val)}
                          className="w-24 text-slate-800 px-3 py-1.5 bg-white border border-slate-205 rounded-lg text-xs font-black text-rose-700"
                        />
                        <span className="text-[10px] text-slate-500">
                          Típicamente <strong>3.12</strong> o <strong>3.15 g/cm³</strong> (Portland Tipo I).
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 8 && (() => {
              const fm = materials.fineFinenessModulus;
              const tmnKey = materials.coarseMaxNominalSize;
              const rowData = COARSE_BULK_VOL_TABLE[tmnKey] || { 2.4: 0.66, 2.6: 0.64, 2.8: 0.62, 3.0: 0.60 };
              
              // Find neighboring points for the current fineFinenessModulus
              const standardCols = [2.4, 2.6, 2.8, 3.0];
              const isFmExact = standardCols.includes(fm);
              
              // We construct standard columns + custom column if not exact
              let colsToShow = [...standardCols];
              if (!isFmExact && fm > 2.4 && fm < 3.0) {
                colsToShow.push(fm);
              }
              colsToShow.sort((a, b) => a - b);

              // Find lower and upper bounds
              let fm1 = 2.8;
              let fm2 = 3.0;
              if (fm <= 2.4) {
                fm1 = 2.4; fm2 = 2.4;
              } else if (fm >= 3.0) {
                fm1 = 3.0; fm2 = 3.0;
              } else if (fm < 2.6) {
                fm1 = 2.4; fm2 = 2.6;
              } else if (fm < 2.8) {
                fm1 = 2.6; fm2 = 2.8;
              } else {
                fm1 = 2.8; fm2 = 3.0;
              }

              const y1 = rowData[fm1 as keyof typeof rowData] || 0;
              const y2 = rowData[fm2 as keyof typeof rowData] || 0;
              const xValue = result.coarseAggregateVolumeFactor;

              // Equation rendering helpers
              const isClamped = fm <= 2.4 || fm >= 3.0;

              return (
                <div className="space-y-4 animate-fade-in text-left">
                  <div>
                    <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                      PASO 8: CONTENIDO DE AGREGADO GRUESO (Tabla 16.2.2)
                    </label>
                    <p className="text-[10px] text-slate-500 leading-tight mb-3">
                      De acuerdo a la tabla ACI 211.1, determinamos el factor volumétrico <strong className="text-slate-800">b/b₀</strong> (volumen de piedra seca compactada por unidad de volumen de concreto) según el TMN y el Módulo de Fineza (FM) de la arena.
                    </p>

                    {/* INTERACTIVE TABLE 16.2.2 */}
                    <div className="bg-[#fdfaf2] p-3 rounded-lg border border-amber-100 shadow-2xs space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                          <Grid className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          TABLA 16.2.2: SELECCIÓN DEL FACTOR b/b₀
                        </span>
                        <span className="text-[8.5px] bg-[#f8ebd0] text-amber-900 font-extrabold px-1.5 py-0.5 rounded-sm">
                          TMN: {materials.coarseMaxNominalSize}" | FM: {fm.toFixed(2)}
                        </span>
                      </div>

                      <div className="overflow-x-auto pt-1">
                        <table className="w-full text-left text-[9px] font-sans border-collapse">
                          <thead>
                            <tr className="bg-amber-100/60 text-amber-950 font-bold uppercase border-b border-amber-250 text-[7.5px]">
                              <th className="py-1 px-1.5 rounded-l-md text-left font-bold w-1/4">Tamaño Máximo</th>
                              {colsToShow.map((colVal) => {
                                const isUserCol = colVal === fm;
                                const isStdCol = standardCols.includes(colVal);
                                return (
                                  <th 
                                    key={colVal} 
                                    className={`py-1 px-1.5 text-center font-bold font-mono ${
                                      isUserCol 
                                        ? "text-rose-700 bg-rose-50 border-x border-rose-200 font-extrabold text-[10px] underline"
                                        : ""
                                    }`}
                                  >
                                    {colVal.toFixed(2)}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-150/45">
                            {Object.keys(COARSE_BULK_VOL_TABLE).map((tmnRowKey) => {
                              const isRowActive = tmnKey === tmnRowKey;
                              const rowValues = COARSE_BULK_VOL_TABLE[tmnRowKey];

                              return (
                                <tr 
                                  key={tmnRowKey} 
                                  className={`transition-all ${
                                    isRowActive ? "bg-amber-50/50" : ""
                                  }`}
                                >
                                  <td className={`py-1.5 px-1.5 font-bold ${isRowActive ? "text-amber-900 font-black border-l-2 border-emerald-500 pl-1" : "text-slate-600"}`}>
                                    {tmnRowKey}" ({tmnRowKey === "3/8" ? "9.5" : tmnRowKey === "1/2" ? "12.5" : tmnRowKey === "3/4" ? "19.0" : tmnRowKey === "1" ? "25" : tmnRowKey === "1-1/2" ? "38" : tmnRowKey === "2" ? "50" : tmnRowKey === "3" ? "75" : "150"} mm)
                                  </td>
                                  {colsToShow.map((colVal) => {
                                    const isUserCol = colVal === fm;
                                    const isIntersect = isRowActive && isUserCol;
                                    
                                    let cellValStr = "—";
                                    if (standardCols.includes(colVal)) {
                                      cellValStr = rowValues[colVal as keyof typeof rowValues].toFixed(2);
                                    } else if (isIntersect) {
                                      cellValStr = xValue.toFixed(2);
                                    }

                                    return (
                                      <td 
                                        key={colVal} 
                                        className={`py-1.5 px-1.5 text-center font-mono transition-all ${
                                          isIntersect 
                                            ? "bg-emerald-500 text-white font-black text-[11px] rounded-md scale-110 shadow-sm border border-emerald-600 animate-pulse" 
                                            : isUserCol && isRowActive 
                                            ? "bg-rose-100 text-rose-950 font-black"
                                            : isUserCol
                                            ? "bg-rose-50/15 text-slate-400"
                                            : isRowActive 
                                            ? "text-slate-900 font-bold bg-amber-100/10" 
                                            : "text-slate-450"
                                        }`}
                                      >
                                        {isIntersect ? `x = ${xValue.toFixed(2)}` : cellValStr}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* DETAILED INTERPOLATION VISUALIZATION & CALCULATION */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* LEFT FORMULAS */}
                        <div className="p-2.5 bg-white text-slate-800 rounded-md border border-amber-150/50 text-[9.5px] leading-snug space-y-2">
                          <div className="font-extrabold text-[10px] text-amber-900 border-b border-amber-100 pb-1 uppercase tracking-wider flex items-center gap-1">
                            <Calculator className="h-3.5 w-3.5 text-rose-600" />
                            INTERPOLACIÓN PARA b/b₀
                          </div>
                          
                          {isClamped ? (
                            <p className="text-[9px] text-slate-500 italic">
                              El módulo del fino {fm.toFixed(2)} está fuera de los límites de la tabla. Se utiliza el valor límite directo de la tabla de diseño: <strong className="text-slate-800">{xValue.toFixed(2)}</strong>.
                            </p>
                          ) : (
                            <div className="space-y-1.5 font-sans">
                              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                                <span>Límite Izquierdo (y₁): <strong>{y1.toFixed(2)}</strong> (FM: {fm1.toFixed(1)})</span>
                                <span>Límite Derecho (y₂): <strong>{y2.toFixed(2)}</strong> (FM: {fm2.toFixed(1)})</span>
                              </div>
                              
                              <div className="bg-slate-50 p-2 rounded-xs border border-slate-150 font-mono text-[8.5px] text-slate-700">
                                <div className="text-[7.5px] text-slate-450 uppercase font-black">Fórmula de interpolación:</div>
                                <div className="font-bold text-slate-800 mt-0.5">x = y1 + ((fm - fm1) * (y2 - y1)) / (fm2 - fm1)</div>
                                <div className="mt-1 font-semibold text-rose-800">
                                  x = {y1.toFixed(2)} + (({fm.toFixed(2)} - {fm1.toFixed(1)}) * ({y2.toFixed(2)} - {y1.toFixed(2)})) / ({fm2.toFixed(1)} - {fm1.toFixed(1)})
                                </div>
                                <div className="mt-0.5 font-bold text-emerald-800">
                                  x = {y1.toFixed(2)} + ({ (fm - fm1).toFixed(2) } * { (y2 - y1).toFixed(2) }) / 0.20 = {xValue.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="pt-1.5 border-t border-slate-100 space-y-1 text-[9px] text-slate-700">
                            <div className="flex justify-between">
                              <span>Volumen Seco Compactado (b/b₀):</span>
                              <strong className="text-slate-900">{xValue.toFixed(2)}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>P.U.C.S. Piedra (Laboratorio):</span>
                              <strong className="text-slate-900">{materials.coarseDryRoddedUnitWeight.toFixed(1)} kg/m³</strong>
                            </div>
                            <div className="flex justify-between text-emerald-900 font-extrabold bg-emerald-50 px-1 rounded-sm">
                              <span>Peso Seco de Agregado Grueso:</span>
                              <span>{result.coarseAggregateDryWeight.toFixed(3)} kg/m³</span>
                            </div>
                          </div>
                        </div>

                        {/* DIGITAL CASIO CALCULATOR SCREEN */}
                        <div className="bg-stone-900 text-emerald-400 p-2.5 rounded-lg border-2 border-stone-800 font-mono text-[9px] relative ring-1 ring-black/40 shadow-inner">
                          <div className="absolute top-1 right-2 text-[6.5px] text-stone-500 uppercase tracking-widest font-sans font-black select-none">
                            Casio fx-991ES Plus
                          </div>
                          <div className="space-y-1 pt-1.5">
                            <div className="text-stone-500 text-[8px] flex justify-between tracking-wide select-none">
                              <span>SOLVE</span>
                              <span>DEG</span>
                            </div>
                            <div className="border-t border-stone-800/80 my-1"></div>
                            
                            {!isClamped ? (
                              <div className="space-y-1.5 leading-tight">
                                <div className="text-[10px] text-emerald-300 font-bold">
                                  {fm2.toFixed(2)} - {fm1.toFixed(2)} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {fm2.toFixed(2)} - {fm.toFixed(2)}
                                </div>
                                <div className="text-emerald-300">
                                  ───────────── = ─────────────
                                </div>
                                <div className="text-[10px] text-emerald-300 font-bold">
                                  {y2.toFixed(2)} - {y1.toFixed(2)} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {y2.toFixed(2)} - X
                                </div>
                                <div className="mt-3 text-right text-[11px] font-black text-emerald-200">
                                  X = {xValue.toFixed(4)}
                                </div>
                                <div className="text-right text-[7.5px] text-stone-500">
                                  L - R =&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 0
                                </div>
                              </div>
                            ) : (
                              <div className="py-4 text-center text-stone-500 italic select-none">
                                Sin interpolación (Módulo Extremo)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SUMMARY BANNER */}
                      <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9.5px] leading-snug space-y-1 mt-2">
                        <div className="flex items-start gap-1">
                          <Sparkles className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                          <div>
                            <span>
                              Módulo b/b₀ obtenido por interpolación: <strong className="text-emerald-900">{xValue.toFixed(2)}</strong>.
                              Multiplicado por el Peso Unitario Seco Compactado de la piedra (<strong className="text-emerald-900">{materials.coarseDryRoddedUnitWeight.toFixed(1)} kg/m³</strong>), define el peso final seco de la piedra: <strong className="text-emerald-800 text-[11px] font-black underline bg-white px-1 py-0.5 rounded-sm border border-emerald-200">{result.coarseAggregateDryWeight.toFixed(3)} kg/m³</strong>.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TUNABLE INPUTS WITH CLARIFYING LABELS */}
                    <div className="mt-3 bg-slate-50 p-3.5 rounded-lg border border-slate-150 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-705 mb-1 flex items-center gap-1">
                          <Check className="h-3 w-3 text-rose-600 shrink-0" />
                          MÓDULO DE FINEZA DE LA ARENA (FM)
                        </label>
                        <NumericInput
                          step="0.01"
                          min="2.3"
                          max="3.2"
                          value={materials.fineFinenessModulus}
                          onChange={(val) => setMaterialField("fineFinenessModulus", val)}
                          className="w-full text-rose-700 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black"
                        />
                        <span className="text-[8.5px] text-slate-400 block mt-1 leading-snug">
                          Afecta la proporción de espacios vacíos a rellenar por el grueso.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-705 mb-1 flex items-center gap-1">
                          <Check className="h-3 w-3 text-rose-600 shrink-0" />
                          P.U.C.S. PIEDRA (kg/m³)
                        </label>
                        <NumericInput
                          step="1"
                          value={materials.coarseDryRoddedUnitWeight}
                          onChange={(val) => setMaterialField("coarseDryRoddedUnitWeight", val)}
                          className="w-full text-rose-700 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black"
                        />
                        <span className="text-[8.5px] text-slate-400 block mt-1 leading-snug">
                          Peso Unitario Seco Compactado registrado en laboratorio.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeStep === 9 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 9: CÁLCULO DE VOLÚMENES ABSOLUTOS
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-3">
                    Todos los componentes determinados anteriormente son convertidos a volumen absoluto (m³) utilizando la fórmula: 
                    <strong className="text-slate-700"> Volumen = Peso / (Gs × 1000)</strong>. Estos datos se arrastran automáticamente de los pasos anteriores.
                  </p>
                  {/* FORMULAS GRAPHICS EXACTLY AS IN SLIDES */}
                  <div className="bg-[#fdfaf2] p-4 rounded-lg border border-amber-100 shadow-2xs space-y-3">
                    <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      CÁLCULOS ANALÍTICOS DE VOLUMEN
                    </span>

                    {/* Cemento */}
                    <div className="p-2.5 bg-white rounded-md border border-amber-150/50 space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>• Cemento Portland</span>
                        <span className="text-rose-700 font-bold font-mono">Paso 7</span>
                      </div>
                      <div className="flex flex-col items-center py-1.5 bg-slate-50/50 rounded-sm">
                        <div className="text-[10px] font-mono text-center font-black text-slate-700 flex flex-col items-center">
                          <span className="text-rose-700">factor cemento = {result.cementWeight.toFixed(3)} kg</span>
                          <span className="h-0.5 w-36 bg-slate-300 my-0.5"></span>
                          <span className="text-slate-500">peso específico {materials.cementSpecificGravity.toFixed(2)} × 1000</span>
                        </div>
                      </div>
                      <div className="text-right text-[10.5px] font-mono font-black text-slate-800">
                        = {result.cementVolume.toFixed(4)} m³
                      </div>
                    </div>

                    {/* Agua */}
                    <div className="p-2.5 bg-white rounded-md border border-amber-150/50 space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>• Agua Unitario de Diseño</span>
                        <span className="text-rose-700 font-bold font-mono">Paso 4</span>
                      </div>
                      <div className="flex flex-col items-center py-1.5 bg-slate-50/50 rounded-sm">
                        <div className="text-[10px] font-mono text-center font-black text-slate-700 flex flex-col items-center">
                          <span className="text-rose-700">Volumen Unitario de agua = {result.adjustedWaterVol.toFixed(3)} kg</span>
                          <span className="h-0.5 w-36 bg-slate-300 my-0.5"></span>
                          <span className="text-slate-500">peso específico del agua (1) × 1000</span>
                        </div>
                      </div>
                      <div className="text-right text-[10.5px] font-mono font-black text-slate-800">
                        = {result.waterVolume.toFixed(4)} m³
                      </div>
                    </div>

                    {/* Aire */}
                    <div className="p-2.5 bg-white rounded-md border border-amber-150/50 space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>• Aire (Paso 5)</span>
                        <span className="text-rose-700 font-bold font-mono">Redondeado</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-sm font-mono text-[10px]">
                        <span>Aire: {materials.hasAdditive ? result.baseAirPct : result.baseAirPct}%</span>
                        <div className="text-right flex flex-col items-end">
                          <strong className="text-slate-855">= {result.airVolumeRounded.toFixed(2)} m³</strong>
                          <span className="text-[8px] text-slate-400 font-normal">({result.airVolume.toFixed(4)} m³ unrounded)</span>
                        </div>
                      </div>
                    </div>

                    {/* Agregado Grueso */}
                    <div className="p-2.5 bg-white rounded-md border border-amber-150/50 space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>• Agregado Grueso Seco</span>
                        <span className="text-rose-700 font-bold font-mono">Paso 8</span>
                      </div>
                      <div className="flex flex-col items-center py-1.5 bg-slate-50/50 rounded-sm">
                        <div className="text-[10px] font-mono text-center font-black text-slate-700 flex flex-col items-center">
                          <span className="text-rose-700">Peso Grueso Seco = {result.coarseAggregateDryWeight.toFixed(3)} kg</span>
                          <span className="h-0.5 w-36 bg-slate-300 my-0.5"></span>
                          <span className="text-slate-500">peso específico agregado {materials.coarseSpecificGravity.toFixed(2)} × 1000</span>
                        </div>
                      </div>
                      <div className="text-right text-[10.5px] font-mono font-black text-slate-800">
                        = {result.coarseAggregateVolume.toFixed(4)} m³
                      </div>
                    </div>

                    {/* SUM TOTAL */}
                    <div className="py-2.5 px-3 bg-emerald-50 border border-emerald-150 rounded-md flex justify-between items-center text-[10px] font-black text-emerald-950">
                      <span className="flex items-center gap-1 text-[8.5px] tracking-wider uppercase">
                        <Scale className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        ∑ Volúmenes Absolutos conocidos
                      </span>
                      <span className="bg-white text-emerald-900 border border-emerald-250 px-2 py-0.5 rounded-sm font-mono text-xs">
                        {(result.cementVolume + result.waterVolume + result.airVolumeRounded + result.coarseAggregateVolume + (materials.hasAdditive ? result.additiveVolume : 0)).toFixed(4)} m³
                      </span>
                    </div>
                  </div>

                  {/* QUICK TUNE SPECIFIC GRAVITIES ARRIVED FROM PREVIOUS STEPS */}
                  <div className="mt-4 bg-slate-50 p-3.5 rounded-lg border border-slate-150 space-y-3.5">
                    <span className="block text-[9.5px] font-black text-slate-700 uppercase tracking-wider">
                      REVISIÓN / EDICIÓN DE VALORES DE ENTRADA (Gs)
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-550 mb-1">
                          Pe (Gs) Cemento
                        </label>
                        <NumericInput
                          step="0.01"
                          value={materials.cementSpecificGravity}
                          onChange={(val) => setMaterialField("cementSpecificGravity", val)}
                          className="w-full text-rose-750 bg-white border border-slate-200 px-2 py-1.5 rounded-md text-[11px] font-black"
                        />
                        <span className="text-[8px] text-slate-450 block mt-0.5">Arrastrado del Paso 7</span>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-550 mb-1">
                          Pe (Gs) Piedra (Grueso)
                        </label>
                        <NumericInput
                          step="0.01"
                          value={materials.coarseSpecificGravity}
                          onChange={(val) => setMaterialField("coarseSpecificGravity", val)}
                          className="w-full text-rose-750 bg-white border border-slate-200 px-2 py-1.5 rounded-md text-[11px] font-black"
                        />
                        <span className="text-[8px] text-slate-450 block mt-0.5">Usado en Paso 8/9</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeStep === 10 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 10: CONTENIDO DE AGREGADO FINO
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-3">
                    La arena (Agregado Fino) actúa como el material de relleno final de la mezcla. Ocupa el volumen absoluto exacto restante indispensable para completar el diseño volumétrico de 1.0 m³ (1000 Litros).
                  </p>

                  {/* MATHEMATICAL FORMULA CARD */}
                  <div className="bg-[#fdfaf2] p-4 rounded-lg border border-amber-100 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        VOLUMEN Y PESO DE LA ARENA
                      </span>
                      <span className="text-[8px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-sm">
                        MÉTODO ACI 211.1
                      </span>
                    </div>

                    {/* Formula 1: Volumen absoluto agregado fino */}
                    <div className="p-3 bg-white rounded-md border border-amber-150/50 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        1. Volumen Absoluto del Agregado Fino
                      </div>
                      <div className="flex flex-col items-center py-2 bg-slate-50/50 rounded-sm border border-slate-100">
                        <div className="text-[10.5px] font-mono text-center font-black text-slate-700 flex flex-col items-center leading-tight">
                          <span className="text-[12px] text-rose-700">Volumen Fino = 1.0 m³ - ∑ Volúmenes conocidos</span>
                          <span className="text-[8.5px] text-slate-500 mt-1">
                            (Vol. Cemento + Vol. Agua + Vol. Aire + Vol. Piedra {materials.hasAdditive ? "+ Vol. Aditivo" : ""})
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 font-mono text-[10px] text-slate-705 space-y-1">
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-0.5 rounded-xs">
                          <span>• Vol. Cemento (Paso 9):</span>
                          <strong className="text-slate-900">{result.cementVolume.toFixed(4)} m³</strong>
                        </div>
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-0.5 rounded-xs">
                          <span>• Vol. Agua (Paso 9):</span>
                          <strong className="text-slate-900">{result.waterVolume.toFixed(4)} m³</strong>
                        </div>
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-0.5 rounded-xs">
                          <span>• Vol. Aire (Paso 5 - Redondeado):</span>
                          <strong className="text-slate-900">{result.airVolumeRounded.toFixed(2)} m³ <span className="text-[9px] text-slate-400 font-normal">({result.airVolume.toFixed(4)} m³)</span></strong>
                        </div>
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-0.5 rounded-xs">
                          <span>• Vol. Piedra (Paso 9):</span>
                          <strong className="text-slate-900">{result.coarseAggregateVolume.toFixed(4)} m³</strong>
                        </div>
                        {materials.hasAdditive && (
                          <div className="flex justify-between items-center bg-amber-50/30 px-2 py-0.5 rounded-xs">
                            <span>• Vol. Aditivo (Paso 9):</span>
                            <strong className="text-slate-900">{result.additiveVolume.toFixed(4)} m³</strong>
                          </div>
                        )}
                        
                        <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center text-[9.5px]">
                          <span>∑ Volúmenes Conocidos:</span>
                          <span className="text-slate-900 font-bold">
                            {(
                              result.cementVolume + 
                              result.waterVolume + 
                              result.airVolumeRounded + 
                              result.coarseAggregateVolume + 
                              (materials.hasAdditive ? result.additiveVolume : 0)
                            ).toFixed(3)} m³
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-slate-150 flex justify-between items-center text-[10.5px] font-black text-emerald-900 bg-emerald-50/50 px-2 py-1 rounded">
                          <span>Vol. Absoluto Fino:</span>
                          <span className="flex flex-col items-end">
                            <span>
                              1.0 - {(
                                result.cementVolume + 
                                result.waterVolume + 
                                result.airVolumeRounded + 
                                result.coarseAggregateVolume + 
                                (materials.hasAdditive ? result.additiveVolume : 0)
                              ).toFixed(3)} = <strong className="font-black underline decoration-amber-400">{result.fineAggregateVolume.toFixed(3)} m³</strong>
                            </span>
                            <span className="text-[9px] text-amber-900 font-bold mt-0.5 bg-amber-100/50 px-1 rounded-sm">
                              (Redondeado para diseño = <strong>{result.fineAggregateVolumeRounded.toFixed(3)} m³</strong>)
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Formula 2: Peso agregado fino en seco */}
                    <div className="p-3 bg-white rounded-md border border-amber-150/50 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        2. Peso Seco del Agregado Fino
                      </div>
                      <div className="flex flex-col items-center py-2 bg-slate-50/50 rounded-sm border border-slate-100">
                        <div className="text-[10.5px] font-mono text-center font-black text-slate-700 flex flex-col items-center leading-tight">
                          <span className="text-[11.5px] text-rose-700">Peso Fino Seco = Vol. Fino × Gs × 1000</span>
                        </div>
                      </div>

                      <div className="pt-1.5 font-mono text-[10.5px] text-slate-700 space-y-1">
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-1 rounded-xs">
                          <span>• Vol. Absoluto Arena:</span>
                          <span className="text-right">
                            <span className="text-[9px] text-slate-500 mr-1">({result.fineAggregateVolume.toFixed(3)} m³)</span>
                            <strong className="text-indigo-800 font-black">→ {result.fineAggregateVolumeRounded.toFixed(3)} m³</strong>
                            <span className="text-[8px] block text-slate-400 leading-none">(Redondeado)</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-amber-50/30 px-2 py-1 rounded-xs">
                          <span>• Pe (Gs) de Arena (Laboratorio):</span>
                          <strong className="text-slate-900">{materials.fineSpecificGravity.toFixed(3)}</strong>
                        </div>
                        <div className="pt-1.5 border-t border-slate-150 flex justify-between items-center text-[10.5px] font-black text-emerald-900 bg-emerald-100/70 px-2 py-1 rounded">
                          <span>Peso Fino Seco:</span>
                          <span className="text-right flex flex-col items-end">
                            <span>
                              {result.fineAggregateVolumeRounded.toFixed(3)} × {materials.fineSpecificGravity.toFixed(3)} × 1000 = {result.fineAggregateDryWeight.toFixed(1)} kg/m³
                            </span>
                            <span className="text-[8px] text-emerald-750 font-normal leading-none mt-0.5">
                              * Calculado con volumen redondeado a {result.fineAggregateVolumeRounded.toFixed(3)} m³
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-md border border-emerald-100 text-[9.5px] leading-snug space-y-1">
                      <div className="flex items-start gap-1 font-medium">
                        <Sparkles className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
                        <span>
                          La arena requerida para rellenar los espacios remanentes de la pasta y el grueso es de <strong className="text-emerald-800 text-[11px] font-black underline bg-white px-1 py-0.5 rounded-sm border border-emerald-250">{result.fineAggregateDryWeight.toFixed(1)} kg/m³</strong>, con un volumen absoluto de <strong className="text-emerald-800 font-bold">{result.fineAggregateVolume.toFixed(3)} m³</strong> (utilizando <span className="font-black bg-white/70 px-1 rounded">{result.fineAggregateVolumeRounded.toFixed(3)} m³</span> redondeado).
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INPUT SPECIFIC GRAVITY FOR ARENA */}
                  <div className="mt-4 bg-slate-50 p-3.5 rounded-lg border border-slate-150 space-y-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-700 mb-0.5">
                        Peso específico de masa de la Arena (Gs)
                      </label>
                      <div className="flex gap-2 items-center">
                        <NumericInput
                          step="0.01"
                          min="2.0"
                          max="3.0"
                          value={materials.fineSpecificGravity}
                          onChange={(val) => setMaterialField("fineSpecificGravity", val)}
                          className="w-24 text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-rose-700"
                        />
                        <span className="text-[10px] text-slate-500">
                          Típicamente <strong>2.50</strong> a <strong>2.70 g/cm³</strong> (Arena Natural).
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 11 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 11: VALORES DE DISEÑO DE MEZCLA
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-3">
                    Establecemos las proporciones y pesos del diseño de mezcla seco teórico por cada metro cúbico ($1\text{ }m^3$) de concreto antes de las correcciones de humedad de obra.
                  </p>

                  <div className="bg-[#fdfaf2] p-4 rounded-lg border border-amber-100 shadow-2xs space-y-3">
                    <span className="block text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      VALORES SELECCIONADOS
                    </span>
                    <p className="text-[9.5px] leading-tight text-slate-600">
                      Las cantidades mostradas aquí representan la dosificación neta de laboratorio en estado totalmente seco.
                    </p>
                    <div className="p-2.5 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-md text-[9px] leading-snug">
                      <strong className="text-emerald-900 block font-black uppercase text-[8px] tracking-widest mb-1">Trazabilidad del Diseño:</strong>
                      Estos pesos proceden en su totalidad de los cálculos secuenciales de los <strong>Pasos 4, 7, 8 y 10</strong>. Se actualizan de forma instantánea si regresas a modificar cualquier dato previo.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 12 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 12: CORRECCIÓN EN OBRA POR CONDICIÓN FÍSICA
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-4">
                    Suponiendo valores típicos de cantera o laboratorio. Los agregados absorben agua y retienen humedad libre en sus poros superficiales. Corregimos el volumen de agua ingresado en el Paso 4.
                  </p>

                  {/* Agregado Fino (Arena) */}
                  <div className="bg-[#fcfbf7] p-4 rounded-xl border border-amber-250/60 shadow-2xs space-y-3.5 mb-4">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                      <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Boxes className="h-4 w-4 text-amber-600 shrink-0" />
                        Agregado Fino (Arena)
                      </span>
                      <span className="text-[8.5px] font-mono text-slate-500">
                        Peso Diseño: {result.fineAggregateDryWeight.toFixed(3)} Kg
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[9.5px] font-black uppercase text-slate-650 mb-1">
                          Contenido de Humedad (%)
                        </label>
                        <NumericInput
                          step="0.001"
                          value={materials.fineHumidity}
                          onChange={(val) => setMaterialField("fineHumidity", val)}
                          className="w-full text-rose-750 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                        <span className="text-[8px] text-slate-450 block mt-0.5">Humedad natural en obra</span>
                      </div>
                      
                      <div>
                        <label className="block text-[9.5px] font-black uppercase text-slate-650 mb-1">
                          Capacidad del cantera absorción (%)
                        </label>
                        <NumericInput
                          step="0.001"
                          value={materials.fineAbsorption}
                          onChange={(val) => setMaterialField("fineAbsorption", val)}
                          className="w-full text-slate-850 bg-white border border-slate-202 px-3 py-1.5 rounded-lg text-xs font-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-[8px] text-slate-450 block mt-0.5">Absorción nominal de lab.</span>
                      </div>
                    </div>

                    {/* Quick analytics of Fine Aggregate */}
                    <div className="pt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-mono text-[9px] text-slate-705 space-y-1">
                      <div className="flex justify-between">
                        <span>• Incremento por humedad:</span>
                        <strong className="text-slate-900">
                          +{(result.fineAggregateDryWeight * materials.fineHumidity / 100).toFixed(3)} Kg/m³
                        </strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span>• Peso húmedo resultante:</span>
                        <strong className="text-rose-700 text-[10px] font-black">
                          {result.fineAggregateWetWeight.toFixed(3)} Kg/m³
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>• Humedad superficial (Libre):</span>
                        <strong className="text-emerald-700">
                          {materials.fineHumidity.toFixed(3)}% - {materials.fineAbsorption.toFixed(3)}% = {(materials.fineHumidity - materials.fineAbsorption).toFixed(3)}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Agregado Grueso (Piedra) */}
                  <div className="bg-[#f5f8fc] p-4 rounded-xl border border-blue-200 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                      <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Boxes className="h-4 w-4 text-blue-600 shrink-0" />
                        Agregado Grueso (Piedra)
                      </span>
                      <span className="text-[8.5px] font-mono text-slate-500">
                        Peso Diseño: {result.coarseAggregateDryWeight.toFixed(3)} Kg
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[9.5px] font-black uppercase text-slate-650 mb-1">
                          Contenido de Humedad (%)
                        </label>
                        <NumericInput
                          step="0.001"
                          value={materials.coarseHumidity}
                          onChange={(val) => setMaterialField("coarseHumidity", val)}
                          className="w-full text-rose-750 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                        <span className="text-[8px] text-slate-450 block mt-0.5">Humedad natural en obra</span>
                      </div>
                      
                      <div>
                        <label className="block text-[9.5px] font-black uppercase text-slate-650 mb-1">
                          Capacidad del cantera absorción (%)
                        </label>
                        <NumericInput
                          step="0.001"
                          value={materials.coarseAbsorption}
                          onChange={(val) => setMaterialField("coarseAbsorption", val)}
                          className="w-full text-slate-850 bg-white border border-slate-202 px-3 py-1.5 rounded-lg text-xs font-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-[8px] text-slate-450 block mt-0.5">Absorción nominal de lab.</span>
                      </div>
                    </div>

                    {/* Quick analytics of Coarse Aggregate */}
                    <div className="pt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-mono text-[9px] text-slate-705 space-y-1">
                      <div className="flex justify-between">
                        <span>• Incremento por humedad:</span>
                        <strong className="text-slate-900">
                          +{(result.coarseAggregateDryWeight * materials.coarseHumidity / 100).toFixed(3)} Kg/m³
                        </strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-150 pb-1">
                        <span>• Peso húmedo resultante:</span>
                        <strong className="text-rose-700 text-[10px] font-black">
                          {result.coarseAggregateWetWeight.toFixed(3)} Kg/m³
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>• Humedad superficial (Libre):</span>
                        <strong className="text-emerald-700">
                          {materials.coarseHumidity.toFixed(3)}% - {materials.coarseAbsorption.toFixed(3)}% = {(materials.coarseHumidity - materials.coarseAbsorption).toFixed(3)}%
                        </strong>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeStep === 13 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 13: PROPORCIÓN EN PESO (DOSIFICACIÓN DE OBRA)
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-4">
                    Establecemos las proporciones unificadas en peso del diseño referencial y obra por cada unidad de cemento presente en la mezcla.
                  </p>

                  <div className="bg-[#fcfbf7] p-4 rounded-xl border border-amber-250/60 shadow-2xs space-y-4.5">
                    <span className="block text-xs font-black text-amber-950 uppercase tracking-widest flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-amber-600 shrink-0" />
                      PROPORCIONES EN PESO
                    </span>
                    <p className="text-[10.5px] leading-relaxed text-slate-600">
                      Normalizamos las masas por cada metro cúbico ingresando el peso del cemento como el denominador universal (<strong>1.00</strong>). El agua de diseño y el agua corregida se expresan de manera práctica en <strong>litros por bolsa</strong> de cemento de 42.5 kg para su fácil control de campo.
                    </p>
                    <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-lg text-[9.5px] leading-snug">
                      <strong className="text-emerald-990 block font-black uppercase text-[8.5px] tracking-widest mb-1 font-sans">IMPACTO DE LA CORRECCIÓN DE OBRA:</strong>
                      La relación agua/cemento efectiva decrece de forma controlada considerando la humedad libre aportada por las canteras de los agregados finos y gruesos húmedos.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 14 && (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <label className="block text-xs font-black text-rose-700 uppercase tracking-wider mb-1">
                    PASO 14: PESO POR TANDA DE UN SACO (DOSIFICACIÓN DE OBRA)
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight mb-4">
                    Establecemos las proporciones físicas en kilogramos por cada una de las bolsas de cemento empleadas en la mezcladora, aplicando la relación de pesos unitarios sueltos para estimar su volumen en lata.
                  </p>

                  <div className="bg-[#fcfbf7] p-4 rounded-xl border border-amber-250/60 shadow-2xs space-y-4">
                    <span className="block text-xs font-black text-amber-950 uppercase tracking-widest flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-amber-600 shrink-0" />
                      PESOS UNITARIOS SUELTOS (PUS)
                    </span>
                    <p className="text-[10.5px] leading-relaxed text-slate-600">
                      Modifica los Pesos Unitarios Sueltos de cantera (PUS seco) para transformar con precisión milimétrica los pesos húmedos calculados en volumen práctico medido por baldes estándar de 20 Litros:
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Arena PUS (kg/m³)</label>
                        <NumericInput
                          step="10"
                          value={materials.fineLooseUnitWeight || 1520}
                          onChange={(val) => setMaterialField("fineLooseUnitWeight", val)}
                          className="w-full text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Piedra PUS (kg/m³)</label>
                        <NumericInput
                          step="10"
                          value={materials.coarseLooseUnitWeight || 1420}
                          onChange={(val) => setMaterialField("coarseLooseUnitWeight", val)}
                          className="w-full text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 15 && (
              <div className="space-y-4 animate-fade-in font-sans">
                <div className="border-b border-slate-100 pb-1.5">
                  <span className="block text-xs font-black text-rose-700 tracking-tight uppercase flex items-center gap-1">
                    <Calculator className="h-4 w-4" /> Cubicador de Obra Real
                  </span>
                  <p className="text-[9px] text-slate-500">Determina el volumen del proyecto y calcula los materiales con un click.</p>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700">Geometría del Elemento Estructural a Vaciar</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: "rect", label: "Rectangular" },
                      { id: "column", label: "Circular" },
                      { id: "cylinders", label: "Cilindros de Obra" },
                      { id: "direct", label: "Manual m³" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGeometryType(item.id as any)}
                        className={`py-2 px-1 text-[9px] border rounded-lg font-bold text-center cursor-pointer transition-all ${
                          geometryType === item.id
                            ? "bg-slate-900 border-slate-800 text-white shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-600"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {geometryType === "rect" && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-150 animate-fade-in">
                      <span className="block text-[9.5px] font-bold text-slate-400 uppercase">Zapatas, Vigas, Columnas Rect, Losas</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Largo (m)</label>
                          <NumericInput
                            step="0.10"
                            value={rectLength}
                            onChange={(val) => setRectLength(val)}
                            className="w-full bg-white text-slate-850 px-2 py-1 text-xs border border-slate-200 rounded font-black focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Ancho (m)</label>
                          <NumericInput
                            step="0.10"
                            value={rectWidth}
                            onChange={(val) => setRectWidth(val)}
                            className="w-full bg-white text-slate-850 px-2 py-1 text-xs border border-slate-200 rounded font-black focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Espesor (m)</label>
                          <NumericInput
                            step="0.05"
                            value={rectThickness}
                            onChange={(val) => setRectThickness(val)}
                            className="w-full bg-white text-slate-850 px-2 py-1 text-xs border border-slate-200 rounded font-black"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Cantidad (Vigoneadas / Elementos idénticos)</label>
                        <NumericInput
                          step="1"
                          value={rectQty}
                          onChange={(val) => setRectQty(val)}
                          className="w-full bg-white text-slate-850 px-2.5 py-1 text-xs border border-slate-200 rounded font-black"
                        />
                      </div>
                    </div>
                  )}

                  {geometryType === "column" && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-150 animate-fade-in">
                      <span className="block text-[9.5px] font-bold text-slate-400 uppercase">Columnas Circulares / Pilotes</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Diámetro (m)</label>
                          <NumericInput
                            step="0.05"
                            value={colDiameter}
                            onChange={(val) => setColDiameter(val)}
                            className="w-full bg-white text-slate-850 px-2 py-1 text-xs border border-slate-200 rounded font-black focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Altura (m)</label>
                          <NumericInput
                            step="0.5"
                            value={colHeight}
                            onChange={(val) => setColHeight(val)}
                            className="w-full bg-white text-slate-850 px-2 py-1 text-xs border border-slate-200 rounded font-black focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold mb-0.5 font-sans">Cantidad de Columnas</label>
                        <NumericInput
                          step="1"
                          value={colQty}
                          onChange={(val) => setColQty(val)}
                          className="w-full bg-white text-slate-850 px-2.5 py-1 text-xs border border-slate-200 rounded font-black focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {geometryType === "cylinders" && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-150 animate-fade-in col-span-1">
                      <span className="block text-[9.5px] font-bold text-slate-400 uppercase">Cilindros de Muestreo de Concreto (15x30cm)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Diámetro (m)</label>
                          <input
                            type="number"
                            disabled
                            value={cylDiameter}
                            className="w-full bg-slate-100 text-slate-450 px-2.5 py-1 text-xs border border-slate-200 rounded font-bold cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Altura (m)</label>
                          <input
                            type="number"
                            disabled
                            value={cylHeight}
                            className="w-full bg-slate-100 text-slate-450 px-2.5 py-1 text-xs border border-slate-200 rounded font-bold cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold mb-0.5">N° de Cilindros (Ej. 3, 6, 9 para roturas)</label>
                        <NumericInput
                          step="1"
                          value={cylQty}
                          onChange={(val) => setCylQty(val)}
                          className="w-full bg-white text-slate-850 px-2.5 py-1 text-xs border border-slate-200 rounded font-black"
                        />
                      </div>
                    </div>
                  )}

                  {geometryType === "direct" && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-150 animate-fade-in">
                      <span className="block text-[9.5px] font-bold text-slate-400 uppercase">Especificar volumen global directo</span>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Volumen de Concreto Requerido (m³)</label>
                        <NumericInput
                          step="0.5"
                          value={directVol}
                          onChange={(val) => setDirectVol(val)}
                          className="w-full bg-white text-slate-850 px-2.5 py-1 text-xs border border-slate-200 rounded font-black focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Waste Factor input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Porcentaje de Desperdicio Estimado en Obra (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={wastePct}
                        onChange={(e) => setWastePct(parseFloat(e.target.value) || 0)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <span className="font-extrabold text-xs bg-rose-50 text-rose-700 px-2 py-0.5 border border-rose-100 rounded-md">
                        {wastePct}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Conforme al ACI, se adiciona este porcentaje para prever mermas en transporte, colados o encofrados defectuosos (común 5%).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: GRAPHICS, ACI TABLES AND FORMULAS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MATH FORMULA DISPLAY ACCORDING TO ACTIVE STEP */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 block">
                  Metodología Junior Chillcce • Memorias Matemáticas
                </span>
                <h3 className="text-sm font-black text-white leading-tight">
                  Pausa Educativa: Desarrollo del Paso {activeStep}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 border border-slate-800 rounded font-bold uppercase">
                ACI 318
              </span>
            </div>

            {activeStep === 1 && (
              <div className="space-y-4 font-sans animate-fade-in text-slate-300 text-xs">
                <p>
                  Para garantizar la resistencia estructural contratada f'c en obra, adicionamos un margen de sobrediseño estadístico. En este paso calculamos la resistencia promedio requerida <strong className="text-emerald-400">f'cr (resistencia para dosificación)</strong>.
                </p>
                
                {specs.useStandardDeviation ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 text-slate-200">
                    <p className="text-slate-450">// Utilizando Desviación Estándar S_d = {specs.standardDeviation} kg/cm²:</p>
                    {specs.specifiedStrength <= 350 ? (
                      <>
                        <p>f'cr₁ = f'c + 1.34 × S_d</p>
                        <p className="text-white">f'cr₁ = {specs.specifiedStrength} + 1.34 × {specs.standardDeviation} = <span className="text-emerald-400">{(specs.specifiedStrength + 1.34 * specs.standardDeviation).toFixed(1)} kg/cm²</span></p>
                        <p className="pt-1">f'cr₂ = f'c + 2.33 × S_d - 35</p>
                        <p className="text-white">f'cr₂ = {specs.specifiedStrength} + 2.33 × {specs.standardDeviation} - 35 = <span className="text-emerald-400">{(specs.specifiedStrength + 2.33 * specs.standardDeviation - 35).toFixed(1)} kg/cm²</span></p>
                      </>
                    ) : (
                      <>
                        <p>f'cr₁ = f'c + 1.34 × S_d</p>
                        <p className="text-white">f'cr₁ = {specs.specifiedStrength} + 1.34 × {specs.standardDeviation} = <span className="text-emerald-400">{(specs.specifiedStrength + 1.34 * specs.standardDeviation).toFixed(1)} kg/cm²</span></p>
                        <p className="pt-1">f'cr₂ = 0.9 × f'c + 2.33 × S_d</p>
                        <p className="text-white">f'cr₂ = 0.9 × {specs.specifiedStrength} + 2.33 × {specs.standardDeviation} = <span className="text-emerald-400">{(0.9 * specs.specifiedStrength + 2.33 * specs.standardDeviation).toFixed(1)} kg/cm²</span></p>
                      </>
                    )}
                    <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs">
                      <span className="uppercase text-slate-450 font-black">f'cr Final (Mayor)</span>
                      <span className="text-base text-emerald-400 font-black font-mono">{result.targetStrength} kg/cm²</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 text-slate-200">
                    <p className="text-slate-450">// Sin datos estadísticos (Sobrediseños tabulados por defecto):</p>
                    {specs.specifiedStrength < 210 ? (
                      <>
                        <p>f'cr = f'c + 70</p>
                        <p className="text-white">f'cr = {specs.specifiedStrength} + 70 = <span className="text-emerald-400">{specs.specifiedStrength + 70} kg/cm²</span></p>
                      </>
                    ) : specs.specifiedStrength <= 350 ? (
                      <>
                        <p>f'cr = f'c + 84</p>
                        <p className="text-white font-semibold">f'cr = {specs.specifiedStrength} + 84 = <span className="text-emerald-400">{specs.specifiedStrength + 84} kg/cm²</span></p>
                      </>
                    ) : (
                      <>
                        <p>f'cr = f'c + 98</p>
                        <p className="text-white">f'cr = {specs.specifiedStrength} + 98 = <span className="text-emerald-400">{specs.specifiedStrength + 98} kg/cm²</span></p>
                      </>
                    )}
                    <div className="border-t border-slate-850 pt-2 flex justify-between items-center text-xs">
                      <span className="uppercase text-slate-450 font-bold">f'cr Elegido</span>
                      <span className="text-base text-emerald-400 font-mono font-black">{result.targetStrength} kg/cm²</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs text-slate-200">
                <p>
                  El Tamaño Máximo Nominal (TMN) de piedra gruesa seleccionada es de <strong className="text-emerald-400">{materials.coarseMaxNominalSize}"</strong>. Su valor altera de forma directa el porcentaje de aire atrapado y de agua unitaria libre de la pasta de cemento.
                </p>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                  <p className="text-slate-400">// Parámetros seleccionados:</p>
                  <p>• Piedra TMN: <span className="text-emerald-400 font-black">{materials.coarseMaxNominalSize} pulgadas</span></p>
                  <p>• Máximo comercial sugerido: Menor que 1/5 del encofrado mínimo, o 1/3 del espesor de losas, o 3/4 de la separación libre de barras.</p>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs">
                <p>
                  El asentamiento (Slump) mide la fluidez o trabajabilidad del concreto fresco. Has elegido un slump de <strong className="text-emerald-450">{specs.slumpRange}"</strong>.
                </p>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-[11px] font-mono leading-relaxed space-y-1">
                  <p className="text-slate-450">// Aplicaciones Típicas del Slump según ACI:</p>
                  <p>• 1" - 2" : Pavimentos rígidos, cimentaciones masivas.</p>
                  <p>• 3" - 4" : Losas, columnas, vigas estándar en edificación.</p>
                  <p>• 6" - 7" : Pilotes vaciados en lodo, concreto bombeado autocompactante.</p>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs">
                <p>
                  A partir del TMN seleccionado y el Slump, extraemos el volumen de agua de amasado. Con un aditivo plastificante, el agua de amasado real disminuye, optimizando el factor cemento.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-200">
                  <p className="text-slate-450">// Volumen Base (ACI Table 2.1.1):</p>
                  <p>Slump: {specs.slumpRange}" | TMN: {materials.coarseMaxNominalSize}"</p>
                  <p>Agua Base = <span className="text-emerald-400 font-bold">{result.baseWaterVol} Litros/m³</span></p>
                  
                  {materials.hasAdditive ? (
                    <>
                      <p className="text-slate-400 border-t border-slate-800 pt-2.5 mt-2">// Reducción por Aditivo Plastificante Reductor:</p>
                      <p>Reducción ingresada: {materials.additiveWaterReduction}%</p>
                      <p>Agua Ajustada = {result.baseWaterVol} × (1 - {materials.additiveWaterReduction}/100)</p>
                      <p className="text-white font-extrabold text-xs">
                        Agua de Diseño Ajustada = <span className="text-emerald-400 font-black">{result.adjustedWaterVol} Litros/m³</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-455 mt-2.5">// Sin aditivo plástico reductor de agua.</p>
                  )}
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs">
                <p>
                  La cantidad de espacio ocupado por el aire. El aire de porosidad estándar atrapado de forma natural en el concreto depende del TMN. El aire incorporado se adiciona intencionalmente para durabilidad química.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                  <p className="text-slate-400">// Contenido de Aire de Diseño:</p>
                  <p>• Tipo de Mezcla: {specs.airEntrained ? "Con Aire Incorporado" : "Aire Natural Atrapado"}</p>
                  <p>• Contenido de Aire = <span className="text-emerald-400 font-extrabold">{result.baseAirPct}% del volumen total</span></p>
                  <p className="text-white mt-2.5">
                    Volumen Neto de Aire = <span className="text-emerald-400 font-extrabold">{result.airVolume.toFixed(4)} m³/concreto</span>
                    <span className="text-amber-400 ml-1.5 font-bold block sm:inline mt-1 sm:mt-0">
                      (Redondeado = <strong className="underline text-emerald-400 font-black">{result.airVolumeRounded.toFixed(2)} m³</strong>; se trabaja con el valor redondeado)
                    </span>
                  </p>
                </div>
              </div>
            )}

            {activeStep === 6 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs">
                <p>
                  Determinamos la relación Agua/Cemento (A/C) interpolando linealmente los límites oficiales estipulados por el ACI basados en la resistencia promedio requerida f'cr.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-200">
                  <p className="text-slate-400">// Datos de interpolación para f'cr = {result.targetStrength} kg/cm²:</p>
                  <p>• Aire Incorporado: {specs.airEntrained ? "SÍ" : "NO"}</p>
                  <p className="text-white">
                    Fórmula: A/C = A/C₁ + [ (f'cr - fc₁) × (A/C₂ - A/C₁) ] / (fc₂ - fc₁)
                  </p>
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs">
                    <span className="uppercase text-slate-400 font-extrabold">Relación A/C Final</span>
                    <span className="text-emerald-400 font-black text-sm">{result.waterCementRatio}</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 7 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs">
                <p>
                  El factor cemento cuantifica el peso seco neto de cemento portland requerido para 1 m³ de concreto. Dividimos el volumen de agua ajustado entre la relación A/C de diseño.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 text-slate-200">
                  <p className="text-slate-400">// Ecuaciones:</p>
                  <p>• Peso Cemento = Agua de Diseño / (A/C) = {result.adjustedWaterVol} / {result.waterCementRatio}</p>
                  <p className="text-white font-extrabold text-xs">
                    Peso de Cemento = <span className="text-emerald-400">{result.cementWeight.toFixed(1)} kg/m³</span>
                  </p>
                  <p className="text-white font-extrabold">
                    Cantidad equivalente = <span className="text-emerald-400">{(result.cementWeight / 42.5).toFixed(2)} bolsas de 42.5 kg</span>
                  </p>
                  <p className="text-slate-400 pt-1 border-t border-slate-800 mt-2">// Volumen Absoluto del Cemento:</p>
                  <p>Volumen = Peso / (Gs_cement × 1000) = {result.cementWeight.toFixed(1)} / ({materials.cementSpecificGravity} × 1000)</p>
                  <p className="text-emerald-400 font-bold">Volumen Neto = {result.cementVolume} m³</p>
                </div>
              </div>
            )}

            {activeStep === 8 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs">
                <p>
                  El factor b/b₀ representa el volumen suelto de agregado grueso por unidad de volumen de concreto. Proviene de la tabla clásica de la metodología ACI interpolando el TMN y el módulo de fineza de la arena.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-250">
                  <p className="text-slate-400">// Cálculo de b/b₀ e Interpolación:</p>
                  <p>• TMN Piedra: {materials.coarseMaxNominalSize}" | Módulo Fineza Arena: {materials.fineFinenessModulus}</p>
                  <p>• Factor b/b₀ de tabla = <span className="text-emerald-400 font-black">{result.coarseAggregateVolumeFactor}</span></p>
                  <p className="pt-1.5 border-t border-slate-850 mt-1">Peso Coarse Seco = b/b₀ × P.U.C.S. (Piedra)</p>
                  <p className="text-white">Peso Seco de Piedra = {result.coarseAggregateVolumeFactor} × {materials.coarseDryRoddedUnitWeight} = <span className="text-emerald-400 font-black">{result.coarseAggregateDryWeight.toFixed(1)} kg/m³</span></p>
                  <p className="text-slate-400 pt-1.5">// Volumen Absoluto de Piedra Seca:</p>
                  <p>Volumen = Peso / (Gs_piedra × 1000) = {result.coarseAggregateVolume} m³</p>
                </div>
              </div>
            )}

            {activeStep === 9 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs text-slate-200">
                <p>
                  A continuación, realizamos la sumatoria analítica de todos los volúmenes absolutos de ingredientes secos que ya han sido determinados hasta el momento.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 text-slate-200">
                  <p className="text-slate-400">// Suma de Volúmenes por 1.0 m³:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>• Cemento Portland:</span><span>{result.cementVolume.toFixed(4)} m³</span></div>
                    <div className="flex justify-between"><span>• Agua Estándar:</span><span>{result.waterVolume.toFixed(4)} m³</span></div>
                    <div className="flex justify-between"><span>• Piedra (Agregado Grueso):</span><span>{result.coarseAggregateVolume.toFixed(4)} m³</span></div>
                    <div className="flex justify-between"><span>• Aire Incorporado/Atrapado:</span><span>{result.airVolume.toFixed(4)} m³</span></div>
                    {materials.hasAdditive && (
                      <div className="flex justify-between"><span>• Aditivo Químico:</span><span>{result.additiveVolume.toFixed(4)} m³</span></div>
                    )}
                  </div>
                  <div className="border-t border-slate-800 mt-2.5 pt-2 flex justify-between font-bold text-xs">
                    <span className="uppercase text-slate-400">Volumen Ocupado Acumulado</span>
                    <span className="text-emerald-400 font-mono text-sm font-black">{(1.0 - result.fineAggregateVolume).toFixed(3)} m³</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 10 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs">
                <p>
                  Deducimos el volumen absoluto disponible de la arena restando la suma total de ingredientes del volumen total de 1.0 m³. Posteriormente multiplicamos este remanente por el Gs de la arena.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-200">
                  <p className="text-slate-450">// Deducción de agregados finos:</p>
                  <p>
                    Volumen Libre Arena = 1.000 - {(1.0 - result.fineAggregateVolume).toFixed(3)} = <span className="text-emerald-400 font-black">{result.fineAggregateVolume.toFixed(3)} m³</span>
                    <span className="block text-[9px] text-slate-400 mt-1">
                      (Redondeado para diseño a <strong className="text-emerald-400 font-black">{result.fineAggregateVolumeRounded.toFixed(3)} m³</strong>)
                    </span>
                  </p>
                  <p className="pt-2 border-t border-slate-800 mt-2">
                    Peso Seco Arena = Vol. Redondeado ({result.fineAggregateVolumeRounded.toFixed(3)}) × Gs_Arena × 1000
                  </p>
                  <p className="text-white text-xs font-extrabold text-[12px]">
                    Peso Seco de Arena = <span className="text-emerald-400 font-black">{result.fineAggregateDryWeight.toFixed(1)} kg/m³</span>
                  </p>
                </div>
              </div>
            )}

            {activeStep === 11 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs shadow-xs">
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block mb-1">
                    PASO 11: VALORES DE DISEÑO DE MEZCLA
                  </span>
                  <p className="text-slate-400 mb-4 text-[10.5px]">
                    Las cantidades definitivas de materiales secos a ser empleadas como valores base de diseño de mezcla patrón por metro cúbico son:
                  </p>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                    <span className="font-extrabold text-slate-200 text-xs tracking-wider uppercase">
                      Materiales de Dosificación Base
                    </span>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                      Estado: Seco Teórico (1 m³)
                    </span>
                  </div>

                  {/* Cemento */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 hover:bg-slate-900/80 transition-colors">
                    <div className="space-y-0.5 text-left">
                      <span className="text-white font-extrabold text-[11px] block">Cemento Portland</span>
                      <span className="text-slate-500 font-mono text-[9px] block">factor Cemento (Paso 7)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-black text-sm">{result.cementWeight.toFixed(3)}</span>
                      <span className="text-slate-400 font-medium text-[10px] ml-1">Kg/m³</span>
                    </div>
                  </div>

                  {/* Agua */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 hover:bg-slate-900/80 transition-colors">
                    <div className="space-y-0.5 text-left">
                      <span className="text-white font-extrabold text-[11px] block">Agua de diseño</span>
                      <span className="text-slate-500 font-mono text-[9px] block">Volumen Unitario de agua (Paso 4)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-black text-sm">{result.adjustedWaterVol.toFixed(3)}</span>
                      <span className="text-slate-400 font-medium text-[10px] ml-1">lt/m³</span>
                    </div>
                  </div>

                  {/* Agregado Fino Seco */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 hover:bg-slate-900/80 transition-colors">
                    <div className="space-y-0.5 text-left">
                      <span className="text-white font-extrabold text-[11px] block">Agregado Fino seco (Arena)</span>
                      <span className="text-slate-500 font-mono text-[9px] block">peso de agregado fino seco (Paso 10)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-black text-sm">{result.fineAggregateDryWeight.toFixed(3)}</span>
                      <span className="text-slate-400 font-medium text-[10px] ml-1">Kg/m³</span>
                    </div>
                  </div>

                  {/* Agregado Grueso Seco */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 hover:bg-slate-900/80 transition-colors">
                    <div className="space-y-0.5 text-left">
                      <span className="text-white font-extrabold text-[11px] block">Agregado Grueso seco (Piedra)</span>
                      <span className="text-slate-500 font-mono text-[9px] block">peso del agregado grueso seco (Paso 8)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-black text-sm">{result.coarseAggregateDryWeight.toFixed(3)}</span>
                      <span className="text-slate-400 font-medium text-[10px] ml-1">Kg/m³</span>
                    </div>
                  </div>

                  {/* Aditivo (If has it) */}
                  {materials.hasAdditive && (
                    <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-slate-800/60 hover:bg-slate-900/50 transition-colors">
                      <div className="space-y-0.5 text-left">
                        <span className="text-white font-extrabold text-[11px] block">Aditivo Químico</span>
                        <span className="text-slate-500 font-mono text-[9px] block">aditivo reductor / incorporador (Paso 5)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-black text-sm">{result.additiveWeight.toFixed(3)}</span>
                        <span className="text-slate-400 font-medium text-[10px] ml-1">Kg/m³</span>
                      </div>
                    </div>
                  )}

                  {/* Suma de Peso Seco */}
                  <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-400 tracking-wider uppercase text-[10px]">
                      ∑ PESO UNITARIO GENERAL SECO
                    </span>
                    <div className="text-right font-mono text-white text-sm font-black">
                      {result.totalDryWeight.toFixed(3)} <span className="text-[10px] font-medium text-slate-400">Kg/m³</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-250/90 leading-relaxed font-sans text-left">
                  <strong>Nota del Ingeniero:</strong> Estos valores de diseño representan la dosificación teórica neta. En la práctica, se requiere corregir estos valores de acuerdo a la humedad natural y capacidad de absorción de las canteras activas antes de proceder al cargado en la mezcladora (Paso 12).
                </div>
              </div>
            )}

            {activeStep === 12 && (
              <div className="space-y-4 animate-fade-in text-slate-300 text-xs shadow-xs text-left">
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block mb-1">
                    PASO 12: MEMORÁNDUM DE CORRECCIÓN METODOLÓGICA
                  </span>
                  <p className="text-slate-400 mb-4 text-[10.5px]">
                    Cálculo secuencial paso a paso del incremento en peso por humedad de obra y determinación de la humedad libre superficial de cada agregado:
                  </p>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5 font-sans">
                  
                  {/* Agregado Fino */}
                  <div className="space-y-2 border-b border-slate-900 pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                        • Agregado Fino (Arena)
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        Humedad: {materials.fineHumidity.toFixed(3)}%
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] space-y-1.5 leading-relaxed">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valor de diseño seco:</span>
                        <span className="text-white font-bold">{result.fineAggregateDryWeight.toFixed(3)} Kg/m³</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Incremento por Humedad:</span>
                        <span>{materials.fineHumidity.toFixed(3)}% de {result.fineAggregateDryWeight.toFixed(3)} = <strong className="text-rose-400 font-black">+(+) {(result.fineAggregateDryWeight * materials.fineHumidity / 100).toFixed(3)} Kg/m³</strong></span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800 text-[10.5px]">
                        <span className="text-emerald-400 font-bold">Peso húmedo del agregado fino:</span>
                        <strong className="text-emerald-400 underline font-black">
                          {result.fineAggregateWetWeight.toFixed(3)} Kg/m³
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Agregado Grueso */}
                  <div className="space-y-2 border-b border-slate-900 pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                        • Agregado Grueso (Piedra)
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        Humedad: {materials.coarseHumidity.toFixed(3)}%
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] space-y-1.5 leading-relaxed">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valor de diseño seco:</span>
                        <span className="text-white font-bold">{result.coarseAggregateDryWeight.toFixed(3)} Kg/m³</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Incremento por Humedad:</span>
                        <span>{materials.coarseHumidity.toFixed(3)}% de {result.coarseAggregateDryWeight.toFixed(3)} = <strong className="text-rose-400 font-black">+(+) {(result.coarseAggregateDryWeight * materials.coarseHumidity / 100).toFixed(3)} Kg/m³</strong></span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800 text-[10.5px]">
                        <span className="text-emerald-400 font-bold">Peso húmedo del agregado grueso:</span>
                        <strong className="text-emerald-400 underline font-black">
                          {result.coarseAggregateWetWeight.toFixed(3)} Kg/m³
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Humedad Superficial de los Agregados */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">
                      LUEGO DETERMINAMOS (Humedad Superficial / Libre):
                    </span>
                    <div className="bg-amber-950/20 p-3.5 rounded-xl border border-amber-500/10 space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-350">➢ Humedad Superficial del agregado fino:</span>
                        <span className="text-white bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                          {materials.fineHumidity.toFixed(3)}% - {materials.fineAbsorption.toFixed(3)}% = <strong className="text-yellow-400">+{((materials.fineHumidity - materials.fineAbsorption)).toFixed(3)}%</strong>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-350">➢ Humedad Superficial del agregado grueso:</span>
                        <span className="text-white bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                          {materials.coarseHumidity.toFixed(3)}% - {materials.coarseAbsorption.toFixed(3)}% = <strong className="text-yellow-400">+{((materials.coarseHumidity - materials.coarseAbsorption)).toFixed(3)}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Impacto en Agua de Mezclado */}
                  <div className="pt-3 border-t border-slate-900 space-y-2.5 font-sans">
                    <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">
                      Aporte de Humedad de los Agregados:
                    </span>
                    
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 font-mono text-[9.5px] space-y-2">
                      <div className="flex flex-col md:flex-row md:justify-between text-slate-350 gap-0.5">
                        <span>➢ Aporte humedad agregado fino:</span>
                        <span className="text-white font-medium text-right">
                          {result.fineAggregateDryWeight.toFixed(3)} x {((materials.fineHumidity - materials.fineAbsorption) / 100).toFixed(5)} = <strong className="text-emerald-400">+{result.fineAggregateWaterContribution.toFixed(3)} lt/m³</strong>
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between text-slate-350 gap-0.5 border-b border-slate-900 pb-1.5">
                        <span>➢ Aporte humedad agregado grueso:</span>
                        <span className="text-white font-medium text-right">
                          {result.coarseAggregateDryWeight.toFixed(3)} x {((materials.coarseHumidity - materials.coarseAbsorption) / 100).toFixed(5)} = <strong className="text-emerald-400">+{result.coarseAggregateWaterContribution.toFixed(3)} lt/m³</strong>
                        </span>
                      </div>
                      <div className="flex justify-between pt-0.5 text-amber-400 font-extrabold text-[10px]">
                        <span>Aporte de Humedad de los Agregados:</span>
                        <span>+{result.totalWaterContribution.toFixed(3)} lt/m³</span>
                      </div>
                    </div>

                    <div className="bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl space-y-1">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        Agua Efectiva (Agua Neta Corregida):
                      </div>
                      <div className="text-[11px] text-slate-200 font-mono flex justify-between">
                        <span>{result.adjustedWaterVol.toFixed(3)} lt/m³ - {result.totalWaterContribution.toFixed(3)} lt/m³</span>
                        <span className="text-emerald-400 font-black text-xs font-mono">
                          = {result.correctedWaterVol.toFixed(3)} lt/m³
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pesos Corregidos Consolidados de Obra */}
                  <div className="pt-3 border-t border-slate-900 space-y-3 font-sans">
                    <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider block">
                      Y LOS PESOS DE LOS MATERIALES YA CORREGIDOS POR HUMEDAD DEL AGREGADO A SER EMPLEADOS EN LA MEZCLA SERÁN:
                    </span>
                    
                    <div className="bg-slate-900/50 rounded-xl divide-y divide-slate-900 overflow-hidden border border-slate-800">
                      <div className="p-2.5 flex justify-between items-center hover:bg-slate-905 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">➢</span>
                          <span className="text-slate-250 font-bold text-[10.5px]">Cemento</span>
                        </div>
                        <div className="font-mono text-right text-[10.5px] text-slate-200">
                          <strong className="text-white">{result.cementWeight.toFixed(3)} Kg/m³</strong>
                          <span className="text-slate-550 ml-1.5 font-sans">≈ {Math.round(result.cementWeight)} Kg/m³</span>
                        </div>
                      </div>

                      <div className="p-2.5 flex justify-between items-center hover:bg-slate-905 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">➢</span>
                          <span className="text-emerald-450 font-bold text-[10.5px]">Agua efectiva</span>
                        </div>
                        <div className="font-mono text-right text-[10.5px] text-emerald-400">
                          <strong className="text-emerald-400">{result.correctedWaterVol.toFixed(3)} lt/m³</strong>
                          <span className="text-slate-550 ml-1.5 font-sans">≈ {Math.round(result.correctedWaterVol)} lt/m³</span>
                        </div>
                      </div>

                      <div className="p-2.5 flex justify-between items-center hover:bg-slate-905 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">➢</span>
                          <span className="text-slate-250 font-bold text-[10.5px]">Agregado fino húmedo</span>
                        </div>
                        <div className="font-mono text-right text-[10.5px] text-slate-250">
                          <strong className="text-white">{result.fineAggregateWetWeight.toFixed(3)} Kg/m³</strong>
                          <span className="text-slate-550 ml-1.5 font-sans">≈ {Math.round(result.fineAggregateWetWeight)} Kg/m³</span>
                        </div>
                      </div>

                      <div className="p-2.5 flex justify-between items-center hover:bg-slate-905 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">➢</span>
                          <span className="text-slate-250 font-bold text-[10.5px]">Agregado grueso húmedo</span>
                        </div>
                        <div className="font-mono text-right text-[10.5px] text-slate-250">
                          <strong className="text-white">{result.coarseAggregateWetWeight.toFixed(3)} Kg/m³</strong>
                          <span className="text-slate-550 ml-1.5 font-sans">≈ {Math.round(result.coarseAggregateWetWeight)} Kg/m³</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-sans text-left">
                  <strong>Nota del Constructor:</strong> Al estar húmedos en campo, aportas parte del agua de mezclado de forma indirecta en los agregados. Por ende, la mezcladora debe cargar únicamente el agua corregida para evitar un slump excesivo y una pérdida indeseada de resistencia f&apos;c.
                </div>
              </div>
            )}

            {activeStep === 13 && (() => {
              const cementWeight = result.cementWeight;
              const cementBags = cementWeight / 42.5;
              const fineWet = result.fineAggregateWetWeight;
              const coarseWet = result.coarseAggregateWetWeight;
              const waterCorrected = result.correctedWaterVol;
              
              const slideCement = Math.round(cementWeight);
              const slideFineWet = Math.round(fineWet);
              const slideCoarseWet = Math.round(coarseWet);
              const slideWaterCorrected = Math.round(waterCorrected);
              const slideCementBags = parseFloat((slideCement / 42.5).toFixed(1)); // 8.6 bags
              
              const slideFineRatio = slideFineWet / slideCement;
              const slideCoarseRatio = slideCoarseWet / slideCement;
              const slideWaterCorrectedPerBag = slideWaterCorrected / slideCementBags;
              
              const dryFineRatio = result.fineAggregateDryWeight / cementWeight;
              const dryCoarseRatio = result.coarseAggregateDryWeight / cementWeight;
              const dryWaterPerBag = result.adjustedWaterVol / cementBags;
              
              const designWCR = result.adjustedWaterVol / cementWeight;
              const effectiveWCR = result.correctedWaterVol / cementWeight;
              
              return (
                <div className="space-y-4 animate-fade-in text-slate-300 text-xs text-left shadow-xs">
                  <div>
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block mb-1">
                      PASO 13: EVALUACIÓN DE LAS PROPORCIONES EN PESO
                    </span>
                    <p className="text-slate-400 mb-4 text-[10.5px]">
                      Determinación analítica de la dosificación final en obra y la relación agua/cemento efectiva post-corrección:
                    </p>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5 font-sans">
                    {/* Expresion de Formulas */}
                    <div className="space-y-2 border-b border-slate-900 pb-4">
                      <span className="text-[10px] font-black uppercase text-amber-550 tracking-wider block">
                        Cálculo Proporcional (Cemento : Arena Húmeda : Piedra Húmeda : Agua lt/bolsa)
                      </span>
                      <div className="bg-slate-900/65 p-3.5 rounded-xl border border-slate-850 font-mono text-center flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center justify-center gap-1.5 md:gap-3 text-slate-300 text-[11px] leading-none">
                          <div className="flex flex-col items-center">
                            <span className="border-b border-slate-600 pb-0.5 px-1">{slideCement}</span>
                            <span className="pt-0.5 text-slate-500">{slideCement}</span>
                          </div>
                          <span className="text-slate-500 text-[13px] font-bold">:</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-slate-600 pb-0.5 px-1">{slideFineWet}</span>
                            <span className="pt-0.5 text-slate-500">{slideCement}</span>
                          </div>
                          <span className="text-slate-500 text-[13px] font-bold">:</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-slate-600 pb-0.5 px-1">{slideCoarseWet}</span>
                            <span className="pt-0.5 text-slate-500">{slideCement}</span>
                          </div>
                          <span className="text-slate-500 text-[13px] font-bold">:</span>
                          <div className="flex flex-col items-center">
                            <span className="border-b border-slate-600 pb-0.5 px-1">{slideWaterCorrected}</span>
                            <span className="pt-0.5 text-slate-500">{slideCementBags.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resultado Consolidado en Obra */}
                    <div className="space-y-1.5">
                      <span className="text-[9.5px] font-black uppercase text-emerald-400 tracking-wider block">
                        PROPORCIÓN DE OBRA (HÚMEDA):
                      </span>
                      <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                        <span className="text-emerald-400 font-extrabold text-[12px] font-mono tracking-wider flex items-center gap-1">
                          <span className="text-emerald-500">❖</span> 1 : {slideFineRatio.toFixed(2)} : {slideCoarseRatio.toFixed(2)} : {slideWaterCorrectedPerBag.toFixed(2)} lt/bolsa
                        </span>
                      </div>
                    </div>

                    {/* Comparativo Seco Teórico */}
                    <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 font-mono text-[9px] text-slate-400 space-y-1">
                      <span className="block font-black uppercase text-slate-500 text-[8.5px] tracking-wider mb-1">
                        Proporción Seca Teórica (Referencial de Diseño):
                      </span>
                      <div className="flex justify-between">
                        <span>• Fórmula:</span>
                        <span>{slideCement}/{slideCement} : {Math.round(result.fineAggregateDryWeight)}/{slideCement} : {Math.round(result.coarseAggregateDryWeight)}/{slideCement} : {Math.round(result.adjustedWaterVol)}/{slideCementBags.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-black pt-1">
                        <span>• Dosificación Seca:</span>
                        <span>1 : {(result.fineAggregateDryWeight / cementWeight).toFixed(2)} : {(result.coarseAggregateDryWeight / cementWeight).toFixed(2)} : {(result.adjustedWaterVol / cementBags).toFixed(2)} lt/bolsa</span>
                      </div>
                    </div>

                    {/* Relaciones Agua / Cemento */}
                    <div className="pt-4 border-t border-slate-900 space-y-2.5">
                      <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">
                        Evaluación de Relación Agua/Cemento (a/c):
                      </span>
                      
                      <div className="bg-slate-900/80 rounded-xl border border-slate-850 font-mono text-[10px] space-y-2 p-3">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>☐ Relación agua/cemento de diseño:</span>
                          <span className="text-white font-bold">
                            {Math.round(result.adjustedWaterVol)} / {slideCement} = {designWCR.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-900 pt-2 text-emerald-400">
                          <span>☐ Relación agua/cemento efectiva (corregida):</span>
                          <span className="font-extrabold underline">
                            {slideWaterCorrected} / {slideCement} = {effectiveWCR.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-sans text-left">
                    <strong>Nota del Ingeniero:</strong> La relación agua/cemento efectiva de {effectiveWCR.toFixed(2)} es menor a la teórica de {designWCR.toFixed(2)} debido a que el agua libre en los agregados ya está dentro de la mezcla. La dosificación de campo se expresa siempre por cada 1 bolsa de cemento (42.5 kg).
                  </div>
                </div>
              );
            })()}

            {activeStep === 14 && (() => {
              const cementWeight = result.cementWeight;
              const cementBags = cementWeight / 42.5;
              const fineWet = result.fineAggregateWetWeight;
              const coarseWet = result.coarseAggregateWetWeight;
              const waterCorrected = result.correctedWaterVol;
              
              const slideCement = Math.round(cementWeight);
              const slideFineWet = Math.round(fineWet);
              const slideCoarseWet = Math.round(coarseWet);
              const slideWaterCorrected = Math.round(waterCorrected);
              const slideCementBags = parseFloat((slideCement / 42.5).toFixed(1)); // 8.6 bags
              
              const slideFineRatio = parseFloat((slideFineWet / slideCement).toFixed(2));
              const slideCoarseRatio = parseFloat((slideCoarseWet / slideCement).toFixed(2));
              const slideWaterCorrectedPerBag = slideWaterCorrected / slideCementBags;
              
              const cementSaco = 42.5;
              const fineSaco = parseFloat((slideFineRatio * cementSaco).toFixed(1));
              const coarseSaco = parseFloat((slideCoarseRatio * cementSaco).toFixed(1));
              const waterSaco = parseFloat(slideWaterCorrectedPerBag.toFixed(2));

              return (
                <div className="space-y-4 animate-fade-in text-slate-300 text-xs text-left shadow-xs">
                  <div>
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block mb-1">
                      PASO 14: PESO POR TANDA DE UN SACO
                    </span>
                    <p className="text-slate-400 mb-4 text-[10.5px]">
                      Calculamos la cantidad exacta de material húmedo por cada saco de cemento de 42.5 kg utilizando los ratios normalizados de obra:
                    </p>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5 font-sans">
                    {/* Exposición estilo diapositiva */}
                    <div className="space-y-3.5 border-b border-slate-900 pb-4">
                      <span className="text-[10px] font-black uppercase text-amber-550 tracking-wider block">
                        Pesos por Tanda de Un Saco (42.5 Kg)
                      </span>
                      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-850 font-mono text-[11px] space-y-3 text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold text-[12px]">➢</span>
                          <span className="w-44 text-slate-350">Cemento</span>
                          <span className="text-slate-500">: 1 x 42.5 = </span>
                          <span className="text-white font-black text-[11.5px] ml-auto">
                            42.5 Kg/saco
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold text-[12px]">➢</span>
                          <span className="w-44 text-slate-350">Agua Efectiva</span>
                          <span className="text-slate-500">: </span>
                          <span className="text-emerald-400 font-black text-[11.5px] ml-auto">
                            {waterSaco.toFixed(2)} lt/saco
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold text-[12px]">➢</span>
                          <span className="w-44 text-slate-350">Agregado fino húmedo</span>
                          <span className="text-slate-500">: {slideFineRatio.toFixed(2)} x 42.5 = </span>
                          <span className="text-white font-black text-[11.5px] ml-auto">
                            {fineSaco.toFixed(1)} Kg/saco
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold text-[12px]">➢</span>
                          <span className="w-44 text-slate-350">Agregado grueso húmedo</span>
                          <span className="text-slate-500">: {slideCoarseRatio.toFixed(2)} x 42.5 = </span>
                          <span className="text-white font-black text-[11.5px] ml-auto">
                            {coarseSaco.toFixed(1)} Kg/saco
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conversión Práctica a Baldes */}
                    <div className="space-y-2">
                      <span className="text-[9.5px] font-black uppercase text-emerald-400 tracking-wider block">
                        DOSIFICACIÓN EN OBRA EN BALDES DE 20 LITROS:
                      </span>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Usando los Pesos Unitarios Sueltos (PUS, configurados a la izquierda) de Arena (<strong>{materials.fineLooseUnitWeight || 1520} kg/m³</strong>) and Piedra (<strong>{materials.coarseLooseUnitWeight || 1420} kg/m³</strong>), convertimos la tanda de campo a volumen práctico:
                      </p>
                      
                      <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl space-y-2 font-mono text-[10.5px]">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>• Arena Húmeda ({fineSaco.toFixed(1)} kg) :</span>
                          <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {result.oneBagBatch.fineCans.toFixed(1)} Baldes 20L
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>• Piedra Húmeda ({coarseSaco.toFixed(1)} kg) :</span>
                          <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {result.oneBagBatch.coarseCans.toFixed(1)} Baldes 20L
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 border-t border-slate-900 pt-2">
                          <span className="font-bold">• Agua Corregida ({waterSaco.toFixed(2)} L) :</span>
                          <span className="font-black bg-slate-900/40 px-2 py-0.5 rounded border border-emerald-500/10">
                            {result.oneBagBatch.correctedWaterCans.toFixed(1)} Baldes 20L
                          </span>
                        </div>
                        {materials.hasAdditive && (
                          <div className="flex justify-between items-center text-amber-400 border-t border-slate-900 pt-2">
                            <span>• Aditivo Líquido :</span>
                            <span className="font-bold bg-slate-900/40 px-2 py-0.5 rounded border border-amber-500/10">
                              {result.oneBagBatch.additiveVolumeCc.toFixed(1)} mL (cc)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dosificación de pie cúbico */}
                    <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 font-mono text-[9px] text-slate-400 flex justify-between items-center">
                      <span className="uppercase font-black text-[8.5px] text-slate-400">Dosificación Volumétrica en ft³:</span>
                      <span className="text-emerald-400 font-extrabold font-sans">
                        1 saco : {result.oneBagBatch.fineLooseVolFt3} ft³ Arena : {result.oneBagBatch.coarseLooseVolFt3} ft³ Piedra
                      </span>
                    </div>

                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-sans text-left">
                    <strong>Nota del Ingeniero:</strong> Los baldes de 20 litros son el estándar en obra para dosificación manual en trompo mezclador de obra.
                  </div>
                </div>
              );
            })()}

            {activeStep === 15 && (() => {
              const cementWeight = result.cementWeight;
              const waterCorrected = result.correctedWaterVol;
              const fineWet = result.fineAggregateWetWeight;
              const coarseWet = result.coarseAggregateWetWeight;
              const additiveWeight = result.additiveWeight;
              const additiveSpGr = materials.additiveSpecificGravity || 1.15;

              // Rounded volume to 2 decimals as requested:
              const roundedVolumeValue = parseFloat(calculatedVolume.toFixed(2));

              // NET values (without waste) - calculated using roundedVolumeValue (2 decimal places)
              const netCementKgs = cementWeight * roundedVolumeValue;
              const netCementBags = netCementKgs / 42.5;

              const netWaterLiters = waterCorrected * roundedVolumeValue;
              const netWaterCans = netWaterLiters / 20;

              const netFineWetKgs = fineWet * roundedVolumeValue;
              const netFineLooseM3 = netFineWetKgs / (materials.fineLooseUnitWeight || 1520);
              const netFineCans = (netFineLooseM3 * 1000) / 20;

              const netCoarseWetKgs = coarseWet * roundedVolumeValue;
              const netCoarseLooseM3 = netCoarseWetKgs / (materials.coarseLooseUnitWeight || 1420);
              const netCoarseCans = (netCoarseLooseM3 * 1000) / 20;

              const netAdditiveKgs = additiveWeight * roundedVolumeValue;
              const netAdditiveCc = (netAdditiveKgs / additiveSpGr) * 1000;

              // WASTE values (Total including waste) - calculated using roundedVolumeValue (2 decimal places)
              const wasteFactor = 1 + wastePct / 100;
              const totalCementKgsLocal = netCementKgs * wasteFactor;
              const totalCementBagsLocal = totalCementKgsLocal / 42.5;

              const totalWaterLitersLocal = netWaterLiters * wasteFactor;
              const totalWaterCansLocal = totalWaterLitersLocal / 20;

              const totalFineWetKgsLocal = netFineWetKgs * wasteFactor;
              const totalFineLooseM3Local = totalFineWetKgsLocal / (materials.fineLooseUnitWeight || 1520);
              const totalFineCansLocal = (totalFineLooseM3Local * 1000) / 20;

              const totalCoarseWetKgsLocal = netCoarseWetKgs * wasteFactor;
              const totalCoarseLooseM3Local = totalCoarseWetKgsLocal / (materials.coarseLooseUnitWeight || 1420);
              const totalCoarseCansLocal = (totalCoarseLooseM3Local * 1000) / 20;

              const totalAdditiveKgsLocal = netAdditiveKgs * wasteFactor;
              const totalAdditiveCcLocal = (totalAdditiveKgsLocal / additiveSpGr) * 1000;
              
              // Custom title depending on element geometry selected
              let slideTitle = "PASO 15: CANTIDAD DE MATERIAL PARA EL TRABAJO DE OBRA (CUBICADOR)";
              let sectionLabel = "Medidas del trabajo de obra:";
              if (geometryType === "rect") {
                slideTitle = "PASO 15: CANTIDAD DE MATERIAL PARA EL TRABAJO (CUBICADOR RECTANGULAR)";
                sectionLabel = "Medidas de la estructura rectangular:";
              } else if (geometryType === "column") {
                slideTitle = "PASO 15: CANTIDAD DE MATERIAL PARA COLUMNAS CIRCULARES";
                sectionLabel = "Medidas de las columnas circulares:";
              } else if (geometryType === "cylinders") {
                slideTitle = `PASO 15: CANTIDAD DE MATERIAL PARA ${cylQty} PROBETAS CILÍNDRICAS`;
                sectionLabel = "Medidas de la probeta cilíndrica:";
              } else {
                slideTitle = "PASO 15: CANTIDAD DE MATERIAL PARA UN VOLUMEN GLOBAL DIRETO";
                sectionLabel = "Cálculo global directo:";
              }

              return (
                <div className="space-y-4 animate-fade-in text-slate-300 text-xs text-left">
                  <div>
                    <span className="text-[11px] font-bold text-rose-450 uppercase tracking-widest block mb-1">
                      {slideTitle}
                    </span>
                    <p className="text-slate-400 mb-4 text-[10.5px]">
                      A partir del volumen geométrico calculado de su proyecto, escalamos el peso seco corregido por metro cúbico para determinar las cantidades físicas exactas necesarias en obra.
                    </p>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4.5 font-sans shadow-xl">
                    
                    {/* Sección 1: Medidas del trabajo */}
                    <div className="space-y-2 border-b border-slate-900 pb-3">
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">
                        {sectionLabel}
                      </span>
                      <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-850 font-mono text-[10.5px] space-y-1 text-slate-300">
                        {geometryType === "rect" && (
                          <>
                            <p>Ancho: <span className="text-white font-extrabold">A = {rectWidth.toFixed(2)} m</span></p>
                            <p>Largo: <span className="text-white font-extrabold">L = {rectLength.toFixed(2)} m</span></p>
                            <p>Espesor: <span className="text-white font-extrabold">E = {rectThickness.toFixed(2)} m</span></p>
                            {rectQty > 1 && <p>Elementos: <span className="text-white font-extrabold">N = {rectQty}</span></p>}
                            <p className="border-t border-slate-850/60 mt-1.5 pt-1.5 text-emerald-400 font-extrabold text-[11px]">
                              Volumen: V = {rectWidth.toFixed(2)} x {rectLength.toFixed(2)} x {rectThickness.toFixed(2)} {rectQty > 1 ? `x ${rectQty}` : ""} = <span className="bg-emerald-950/80 text-white px-1.5 py-0.5 rounded border border-emerald-500/30">{calculatedVolume.toFixed(4)} m³</span>
                              <span className="text-amber-400 ml-1.5 font-bold block sm:inline mt-1 sm:mt-0">
                                (Redondeado = <strong className="underline text-emerald-400 font-black">{roundedVolumeValue.toFixed(2)} m³</strong>; se trabaja con el valor redondeado)
                              </span>
                            </p>
                          </>
                        )}
                        {geometryType === "column" && (
                          <>
                            <p>Diámetro: <span className="text-white font-extrabold">D = {colDiameter.toFixed(2)} m</span></p>
                            <p>Altura: <span className="text-white font-extrabold">h = {colHeight.toFixed(2)} m</span></p>
                            <p>Columnas: <span className="text-white font-extrabold">N = {colQty} unidades</span></p>
                            <p className="border-t border-slate-850/60 mt-1.5 pt-1.5 text-emerald-400 font-extrabold text-[11px]">
                              Volumen: V = (π x D² / 4) x h x N = <span className="bg-emerald-950/80 text-white px-1.5 py-0.5 rounded border border-emerald-500/30">{calculatedVolume.toFixed(4)} m³</span>
                              <span className="text-amber-400 ml-1.5 font-bold block sm:inline mt-1 sm:mt-0">
                                (Redondeado = <strong className="underline text-emerald-400 font-black">{roundedVolumeValue.toFixed(2)} m³</strong>; se trabaja con el valor redondeado)
                              </span>
                            </p>
                          </>
                        )}
                        {geometryType === "cylinders" && (
                          <>
                            <p>Altura: <span className="text-white font-extrabold">h = 0.30 m</span></p>
                            <p>Diámetro: <span className="text-white font-extrabold">D = 0.15 m</span></p>
                            <p>Probetas: <span className="text-white font-extrabold">N = {cylQty} cilindros</span></p>
                            <p className="border-t border-slate-850/60 mt-1.5 pt-1.5 text-emerald-400 font-extrabold text-[11px]">
                              Volumen: V = 0.0053 m³ x {cylQty} cilindros = <span className="bg-emerald-950/80 text-white px-1.5 py-0.5 rounded border border-emerald-500/30">{calculatedVolume.toFixed(4)} m³</span>
                              <span className="text-amber-400 ml-1.5 font-bold block sm:inline mt-1 sm:mt-0">
                                (Redondeado = <strong className="underline text-emerald-400 font-black">{roundedVolumeValue.toFixed(2)} m³</strong>; se trabaja con el valor redondeado)
                              </span>
                            </p>
                          </>
                        )}
                        {geometryType === "direct" && (
                          <>
                            <p className="text-emerald-400 font-extrabold text-[11px]">
                              Volumen directo especificado: V = <span className="bg-emerald-950/80 text-white px-1.5 py-0.5 rounded border border-emerald-500/30">{calculatedVolume.toFixed(4)} m³</span>
                              <span className="text-amber-400 ml-1.5 font-bold block sm:inline mt-1 sm:mt-0">
                                (Redondeado = <strong className="underline text-emerald-400 font-black">{roundedVolumeValue.toFixed(2)} m³</strong>; se trabaja con el valor redondeado)
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Sección 2: Cantidades Netas */}
                    <div className="space-y-2 border-b border-slate-900 pb-3">
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">
                        Cálculo de componentes netos (Sin desperdicio):
                      </span>
                      <div className="p-3.5 bg-slate-900/30 rounded-xl border border-slate-850 font-mono text-[10.5px] space-y-2.5 text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-400">Cant. Cemento</span>
                          <span className="text-slate-500">: {cementWeight.toFixed(2)} x {roundedVolumeValue.toFixed(2)} = </span>
                          <span className="text-white font-black text-[11px] ml-auto">{netCementKgs.toFixed(2)} Kg</span>
                          <span className="text-[9.5px] text-slate-450 ml-1">({netCementBags.toFixed(2)} bolsas)</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-400">Cant. Agua</span>
                          <span className="text-slate-500">: {waterCorrected.toFixed(2)} x {roundedVolumeValue.toFixed(2)} = </span>
                          <span className="text-emerald-400 font-black text-[11px] ml-auto">{netWaterLiters.toFixed(2)} lt</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-400">Cant. Agregado Fino</span>
                          <span className="text-slate-500">: {fineWet.toFixed(2)} x {roundedVolumeValue.toFixed(2)} = </span>
                          <span className="text-white font-black text-[11px] ml-auto">{netFineWetKgs.toFixed(2)} Kg</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-400">Cant. Agregado Grueso</span>
                          <span className="text-slate-500">: {coarseWet.toFixed(2)} x {roundedVolumeValue.toFixed(2)} = </span>
                          <span className="text-white font-black text-[11px] ml-auto">{netCoarseWetKgs.toFixed(2)} Kg</span>
                        </div>

                        {materials.hasAdditive && (
                          <div className="flex items-center gap-1.5 text-amber-400 border-t border-slate-850/60 pt-2">
                            <span className="text-amber-500 text-xs">➢</span>
                            <span className="w-32">Cant. Aditivo</span>
                            <span className="text-slate-500">: {additiveWeight.toFixed(2)} x {roundedVolumeValue.toFixed(2)} = </span>
                            <span className="font-bold ml-auto">{netAdditiveKgs.toFixed(2)} Kg</span>
                            <span className="text-[9.5px] ml-1">({(netAdditiveCc / 1000).toFixed(2)} lt)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sección 3: Con Desperdicio */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">
                        A cada material le adicionamos el {wastePct}% por desperdicios:
                      </span>
                      <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl font-mono text-[10.5px] space-y-2.5">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-450">Cant. Cemento</span>
                          <span className="text-slate-500">: {netCementKgs.toFixed(2)} Kg x {wasteFactor.toFixed(2)} = </span>
                          <span className="text-white font-black text-[11px] ml-auto">{totalCementKgsLocal.toFixed(2)} Kg</span>
                          <span className="text-[9.5px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400 border border-amber-500/10 ml-2">
                            {totalCementBagsLocal.toFixed(2)} Bolsas ({Math.ceil(totalCementBagsLocal)} para obra)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-200">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-450">Cant. Agua</span>
                          <span className="text-slate-500">: {netWaterLiters.toFixed(2)} lt x {wasteFactor.toFixed(2)} = </span>
                          <span className="text-emerald-400 font-black text-[11px] ml-auto">{totalWaterLitersLocal.toFixed(2)} lt</span>
                          <span className="text-[9.5px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/10 ml-2">
                            {totalWaterCansLocal.toFixed(2)} Baldes
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-200">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-450">Cant. Agregado Fino</span>
                          <span className="text-slate-500">: {netFineWetKgs.toFixed(2)} Kg x {wasteFactor.toFixed(2)} = </span>
                          <span className="text-white font-black text-[11px] ml-auto">{totalFineWetKgsLocal.toFixed(2)} Kg</span>
                          <span className="text-[9.5px] font-bold bg-slate-900 px-1.5 py-0.5 rounded text-slate-450 border border-slate-800 ml-2">
                            {totalFineCansLocal.toFixed(2)} Baldes
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-200">
                          <span className="text-amber-500 text-xs">➢</span>
                          <span className="w-32 text-slate-450">Cant. Agregado Grueso</span>
                          <span className="text-slate-500">: {netCoarseWetKgs.toFixed(2)} Kg x {wasteFactor.toFixed(2)} = </span>
                          <span className="text-white font-black text-[11px] ml-auto">{totalCoarseWetKgsLocal.toFixed(2)} Kg</span>
                          <span className="text-[9.5px] font-bold bg-slate-900 px-1.5 py-0.5 rounded text-slate-420 border border-slate-800 ml-2">
                            {totalCoarseCansLocal.toFixed(2)} Baldes
                          </span>
                        </div>

                        {materials.hasAdditive && (
                          <div className="flex items-center gap-1.5 text-amber-400 border-t border-emerald-500/10 pt-2 pb-0.5">
                            <span className="text-amber-500 text-xs">➢</span>
                            <span className="w-32">Cant. Aditivo</span>
                            <span className="text-slate-500">: {netAdditiveKgs.toFixed(2)} Kg x {wasteFactor.toFixed(2)} = </span>
                            <span className="font-bold ml-auto">{totalAdditiveKgsLocal.toFixed(2)} Kg</span>
                            <span className="text-[9.5px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-500 border border-amber-500/10 ml-2">
                              {totalAdditiveCcLocal.toFixed(2)} mL (cc)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-normal font-sans">
                    <strong>Resumen final de compra (con desperdicios):</strong> Para vaciar la estructura completa se precisan aproximadamente <strong>{Math.ceil(totalCementBagsLocal)} bolsas de cemento de 42.5kg</strong> (exacto: {totalCementBagsLocal.toFixed(2)} bolsas), <strong>{totalFineCansLocal.toFixed(2)} baldes sueltos de arena húmeda</strong>, <strong>{totalCoarseCansLocal.toFixed(2)} baldes sueltos de piedra chancada</strong> (botes de obra Standard de 20L), y un suministro de agua de <strong>{totalWaterLitersLocal.toFixed(2)} litros</strong> (que equivale a {totalWaterCansLocal.toFixed(2)} baldes).
                  </div>
                </div>
              );
            })()}
          </div>

          {/* DYNAMIC VISUAL ELEMENT TO EXPLAIN EACH STEP INTERACTIVELY */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
              Simulador Visual Junior Chillcce
            </span>
            <h4 className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-1">
              <Boxes className="h-4 w-4 text-emerald-600 animate-pulse" />
              Estado Dinámico del Concreto
            </h4>

            {activeStep <= 6 ? (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-150 flex flex-col items-center justify-center text-center space-y-3.5">
                <div className="relative h-24 w-24 rounded-full bg-slate-205/60 border-4 border-dashed border-emerald-500 flex items-center justify-center">
                  <div className="absolute inset-2 bg-emerald-500/10 rounded-full flex flex-col items-center justify-center">
                    <span className="text-slate-400 text-[9px] font-bold uppercase">f'cr</span>
                    <span className="font-mono text-xs font-black text-slate-900 leading-none">{result.targetStrength}</span>
                    <span className="text-[7px] text-slate-400 uppercase">kg/cm²</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Resistencia y Consistencia Inicial de Obra</span>
                  <p className="text-[10px] text-slate-450 max-w-sm">
                    En estas primeras etapas definimos la resistencia promedio requerida f'cr y la cantidad de agua y aire. El slump seleccionado de <strong className="font-bold">{specs.slumpRange}"</strong> dictamina la fluidez de trabajo.
                  </p>
                </div>
              </div>
            ) : activeStep <= 10 ? (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 space-y-4">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase block text-center">Distribución Absoluta de Volúmenes Tericos (1 m³ de Concreto)</span>
                
                {/* Horizontal cumulative volume bar */}
                <div className="h-7 w-full rounded-lg overflow-hidden flex text-white text-[9px] font-bold shadow-xs">
                  <div className="bg-slate-700 flex items-center justify-center" style={{ width: `${result.cementVolume * 100}%` }} title="Cemento">
                    Cto {Math.round(result.cementVolume * 100)}%
                  </div>
                  <div className="bg-blue-500 flex items-center justify-center" style={{ width: `${result.waterVolume * 100}%` }} title="Agua">
                    Agua {Math.round(result.waterVolume * 100)}%
                  </div>
                  <div className="bg-slate-400 flex items-center justify-center" style={{ width: `${result.coarseAggregateVolume * 100}%` }} title="Piedra">
                    Piedra {Math.round(result.coarseAggregateVolume * 100)}%
                  </div>
                  <div className="bg-teal-500 flex items-center justify-center" style={{ width: `${result.fineAggregateVolume * 100}%` }} title="Arena">
                    Arena {Math.round(result.fineAggregateVolume * 100)}%
                  </div>
                  <div className="bg-slate-800 flex items-center justify-center border-l border-white/25" style={{ width: `${result.airVolume * 100}%` }} title="Aire">
                    Aire {Math.round(result.airVolume * 100)}%
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-[9px] text-center font-bold text-slate-650">
                  <div className="flex flex-col items-center"><div className="h-2 w-2 rounded bg-slate-700 mb-0.5" /><span>Cto: {result.cementVolume.toFixed(4)} m³</span></div>
                  <div className="flex flex-col items-center"><div className="h-2 w-2 rounded bg-blue-500 mb-0.5" /><span>Agua: {result.waterVolume.toFixed(4)} m³</span></div>
                  <div className="flex flex-col items-center"><div className="h-2 w-2 rounded bg-slate-400 mb-0.5" /><span>Piedra: {result.coarseAggregateVolume.toFixed(4)} m³</span></div>
                  <div className="flex flex-col items-center"><div className="h-2 w-2 rounded bg-teal-500 mb-0.5" /><span>Arena: {result.fineAggregateVolume.toFixed(3)} m³</span></div>
                  <div className="flex flex-col items-center"><div className="h-2 w-2 rounded bg-slate-800 mb-0.5" /><span>Aire: {result.airVolume.toFixed(4)} m³</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3.5">
                <span className="text-[10px] text-slate-450 font-bold uppercase block text-center">Dosificación Equivalente en Latas de Construcción de 20L</span>

                <div className="flex items-center justify-around py-2.5 bg-white border border-slate-200/80 rounded-xl">
                  
                  {/* Cement Bag */}
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-slate-700 text-white font-black text-[10px] h-10 w-8.5 rounded-sm flex items-center justify-center shadow-xs border border-slate-600">
                      Saco
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-800 mt-1.5">1 Saco</span>
                    <span className="text-[8px] text-slate-400">Cemento (42.5kg)</span>
                  </div>

                  <span className="text-slate-400 font-extrabold text-xs">+</span>

                  {/* Sand Cans */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative flex items-end justify-center h-10 w-9 bg-slate-100 rounded-b-md border-x-2 border-b-2 border-slate-350">
                      <div className="absolute bottom-0 inset-x-0 bg-yellow-600/20 h-4/5 rounded-b-sm" />
                      <span className="text-[10px] font-black font-mono text-yellow-800 z-10">{result.oneBagBatch.fineCans.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-800 mt-1.5">Arena</span>
                    <span className="text-[8px] text-slate-400">Baldes de 20L</span>
                  </div>

                  <span className="text-slate-400 font-bold text-xs">+</span>

                  {/* Coarse Cans */}
                  <div className="flex flex-col items-center text-center font-sans">
                    <div className="relative flex items-end justify-center h-10 w-9 bg-slate-100 rounded-b-md border-x-2 border-b-2 border-slate-350">
                      <div className="absolute bottom-0 inset-x-0 bg-stone-700/20 h-[85%] rounded-b-xs" />
                      <span className="text-[10px] font-black font-mono text-stone-800 z-10">{result.oneBagBatch.coarseCans.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-800 mt-1.5">Piedra</span>
                    <span className="text-[8px] text-slate-400">Baldes de 20L</span>
                  </div>

                  <span className="text-slate-400 font-bold text-xs">+</span>

                  {/* Water buckets */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative flex items-end justify-center h-10 w-9 bg-slate-100 rounded-b-md border-x-2 border-b-2 border-slate-350">
                      <div className="absolute bottom-0 inset-x-0 bg-blue-500/20 h-[50%] rounded-b-xs" />
                      <span className="text-[10px] font-black font-mono text-blue-700 z-10">{result.oneBagBatch.correctedWaterCans.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-800 mt-1.5">Agua Corregida</span>
                    <span className="text-[8px] text-slate-400">Cans de 20L</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 rounded-xl text-[9.5px] text-amber-900 border border-amber-200/50 leading-relaxed text-center font-bold">
                  <strong>Dosificación en campo:</strong> Por cada un bolsa de cemento adiciona {result.oneBagBatch.fineCans.toFixed(1)} baldes sueltos de arena, {result.oneBagBatch.coarseCans.toFixed(1)} de piedra húmeda, y {result.oneBagBatch.correctedWaterCans.toFixed(1)} baldes de agua libre de obra.
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* NEXT/BACK BUTTON NAVIGATION AT THE VERY BOTTOM */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 justify-between items-center mt-8 bg-slate-50 p-5 rounded-2xl border border-slate-150">
        <button
          onClick={handleBack}
          disabled={activeStep === 1}
          className={`flex items-center justify-center gap-2 py-3 px-6 w-full sm:w-auto rounded-xl text-sm font-black border transition-all shadow-xs ${
            activeStep === 1
              ? "text-slate-400 border-slate-200 cursor-not-allowed bg-slate-100/60"
              : "text-slate-700 hover:bg-slate-100 bg-white border-slate-250 hover:border-slate-350 cursor-pointer"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          Atrás (Paso Anterior)
        </button>

        <div className="text-xs text-slate-450 font-mono font-bold uppercase hidden md:block">
          Paso {activeStep} de 15 • {Math.round((activeStep / 15) * 100)}% Completado
        </div>

        {activeStep < 15 ? (
          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2.5 py-4 px-10 w-full sm:w-auto rounded-xl text-sm md:text-base font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md hover:shadow-lg transform active:scale-98 transition-all"
          >
            Siguiente Paso ({activeStep + 1}/15)
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2.5 py-4 px-10 w-full sm:w-auto rounded-xl text-sm md:text-base font-black bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md hover:shadow-lg transform active:scale-98 transition-all"
          >
            <Printer className="h-5 w-5" />
            Imprimir reporte de Obra
          </button>
        )}
      </div>
    </div>
  );
};
