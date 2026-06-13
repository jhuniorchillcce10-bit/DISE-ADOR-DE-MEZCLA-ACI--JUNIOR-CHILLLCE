import React, { useState } from "react";
import { MaterialProperties, DesignSpecifications, MixDesignResult } from "../types";
import { exportToJuniorChillcceExcel } from "../utils/excelGenerator";
import { FileSpreadsheet, Download, RefreshCw, Eye, Info, Layers, BookOpen } from "lucide-react";

interface ExcelSimulatorProps {
  materials: MaterialProperties;
  specs: DesignSpecifications;
  result: MixDesignResult;
  projectName: string;
}

interface SelectedCell {
  row: number;
  col: string;
  label: string;
  value: string;
  formula: string;
}

export const ExcelSimulator: React.FC<ExcelSimulatorProps> = ({
  materials,
  specs,
  result,
  projectName,
}) => {
  const [selectedCell, setSelectedCell] = useState<SelectedCell>({
    row: 32,
    col: "C",
    label: "Resistencia Promedio Requerida (f'cr)",
    value: `${result.targetStrength} kg/cm²`,
    formula: `=IF(C28="SI", IF(C27<=350, MAX(C27+1.34*C29, C27+2.33*C29-35), MAX(C27+1.34*C29, 0.9*C27+2.33*C29)), IF(C27<210, C27+70, IF(C27<=350, C27+85, C27+100)))`,
  });

  const [activeSheet, setActiveSheet] = useState<"aci" | "help">("aci");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToJuniorChillcceExcel(materials, specs, result, projectName);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  // Standard representation of the main cells to display
  const renderFormulaBar = () => {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 flex items-center gap-2 font-mono text-xs shadow-xs mb-4">
        <span className="font-extrabold text-slate-500 bg-white border border-slate-300 px-2.5 py-1 rounded-sm min-w-[50px] text-center shadow-2xs">
          {selectedCell.col}{selectedCell.row}
        </span>
        <span className="text-emerald-700 font-bold italic select-none">fx</span>
        <div className="flex-1 bg-white border border-slate-300 px-3 py-1 rounded-sm text-slate-800 overflow-x-auto min-h-[26px] whitespace-nowrap flex items-center">
          {selectedCell.formula ? selectedCell.formula : selectedCell.value}
        </div>
      </div>
    );
  };

  const handleCellClick = (row: number, col: string, label: string, value: string, formula: string) => {
    setSelectedCell({ row, col, label, value, formula });
  };

  // Bold or custom conditional styling for select cells
  const getCellClasses = (row: number, col: string) => {
    const isSelected = selectedCell.row === row && selectedCell.col === col;
    let base = "p-2 text-xs border border-slate-200 transition-all cursor-pointer truncate font-medium select-none ";
    
    if (isSelected) {
      base += "ring-2 ring-emerald-500 ring-inset bg-emerald-50/50 ";
    }
    
    if (col === "A") {
      base += "bg-slate-50 text-slate-400 font-bold text-center w-8 ";
    }
    return base;
  };

  // Replicamos el layout exacto de Junior Chillcce
  return (
    <div className="space-y-6 text-slate-800">
      
      {/* EXCEL TITLE BAR & UTILITIES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
              Simulador de Plantilla de Excel Interactiva
            </h2>
            <p className="text-[10px] text-slate-400">
              Visualiza las fórmulas activas y descarga el archivo .xlsx cargado con macros y fórmulas de Junior Chillcce
            </p>
          </div>
        </div>
        
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Generando..." : "Descargar Plantilla Excel (.xlsx)"}
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xs">
        
        {/* EXCEL SHEET SELECT ROTATORS */}
        <div className="flex gap-1 border-b border-slate-200 pb-2 mb-3.5">
          <button
            onClick={() => setActiveSheet("aci")}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded-t-lg border-t-2 transition-all flex items-center gap-1.5 ${
              activeSheet === "aci"
                ? "bg-white text-emerald-700 border-t-emerald-600 border-x border-slate-200 shadow-2xs font-extrabold"
                : "text-slate-400 hover:bg-slate-100 border-t-transparent"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            ACI_Diseño_Aditivo
          </button>
          <button
            onClick={() => setActiveSheet("help")}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded-t-lg border-t-2 transition-all flex items-center gap-1.5 ${
              activeSheet === "help"
                ? "bg-white text-emerald-700 border-t-emerald-600 border-x border-slate-200 shadow-2xs font-extrabold"
                : "text-slate-400 hover:bg-slate-100 border-t-transparent"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Tabla_ACI_Referencias
          </button>
        </div>

        {activeSheet === "aci" ? (
          <div>
            {/* EXCEL FORMULA BAR */}
            {renderFormulaBar()}

            {/* SELECTION ASSIST NOTE */}
            <div className="bg-emerald-50 text-emerald-950 px-3.5 py-2.5 rounded-lg border border-emerald-100 text-[10px] mb-4 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                <strong>¿Cómo funciona?</strong> Haz clic en cualquier celda de la columna <span className="font-bold text-emerald-800">Valor (C)</span> para revisar la **fórmula de Excel** real formulada por
                <span className="font-semibold text-slate-900"> Junior Chillcce</span>. Los valores se actualizan dinámicamente cuando modificas los parámetros de entrada del menú lateral.
              </p>
            </div>

            {/* SPREADSHEET TABLE SIMULATOR */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
              <table className="w-full text-left font-sans border-collapse table-fixed min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[10.5px] font-bold">
                    <th className="w-[45px] p-1.5 text-center bg-slate-150 border-r border-slate-200"></th>
                    <th className="w-[40%] p-1.5 px-3 border-r border-slate-200 text-left">B - Concepto / Parámetro</th>
                    <th className="w-[18%] p-1.5 px-3 border-r border-slate-200 text-right">C - Valor</th>
                    <th className="w-[10%] p-1.5 px-3 border-r border-slate-200 text-center">D - Unidad</th>
                    <th className="w-[32%] p-1.5 px-3 text-left text-slate-400 italic">E - Fórmulas y Comentarios Técnicos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  
                  {/* HEADER 1 */}
                  <tr className="bg-emerald-600 text-white font-bold text-center">
                    <td className="bg-slate-100 text-slate-500 font-bold border-r border-slate-200 align-middle text-xs py-1">6</td>
                    <td colSpan={4} className="py-2 px-3 text-left uppercase text-xs tracking-wider">
                      1. PROPIEDADES EXPERIMENTALES DE LOS MATERIALES (Entradas de Laboratorio)
                    </td>
                  </tr>

                  {/* CEMENTO SUBSECTION */}
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <td className="bg-slate-150 text-slate-500 font-bold border-r border-slate-200 text-center text-xs py-1">7</td>
                    <td colSpan={4} className="py-1.5 px-3 text-left text-[11px] uppercase tracking-wide text-slate-600 border-b border-slate-200">
                      Cemento Portland Tipo I
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">8</td>
                    <td className="p-2 text-xs px-3 font-medium text-slate-700">Peso específico del Cemento</td>
                    <td
                      onClick={() => handleCellClick(8, "C", "Peso específico del Cemento", `${materials.cementSpecificGravity} g/cm³`, `${materials.cementSpecificGravity}`)}
                      className={getCellClasses(8, "C") + " text-right font-mono font-bold text-slate-900"}
                    >
                      {materials.cementSpecificGravity}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">g/cm³</td>
                    <td className="p-2 text-[11px] text-slate-400 italic font-mono">Dato estático experimental</td>
                  </tr>

                  {/* FINE AGGREGATE */}
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <td className="bg-slate-150 text-slate-500 font-bold border-r border-slate-200 text-center text-xs py-1">9</td>
                    <td colSpan={4} className="py-1.5 px-3 text-left text-[11px] uppercase tracking-wide text-slate-600 border-b border-slate-200">
                      Agregado Fino (Arena)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">10</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Peso específico de la Arena</td>
                    <td
                      onClick={() => handleCellClick(10, "C", "Peso específico de la Arena", `${materials.fineSpecificGravity} g/cm³`, `${materials.fineSpecificGravity}`)}
                      className={getCellClasses(10, "C") + " text-right font-mono text-slate-800"}
                    >
                      {materials.fineSpecificGravity}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">g/cm³</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Gravedad Bulk Seca</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">11</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Módulo de Finura de la Arena</td>
                    <td
                      onClick={() => handleCellClick(11, "C", "Módulo de Finura de la Arena", `${materials.fineFinenessModulus}`, `${materials.fineFinenessModulus}`)}
                      className={getCellClasses(11, "C") + " text-right font-mono text-slate-800"}
                    >
                      {materials.fineFinenessModulus}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">-</td>
                    <td className="p-2 text-[11px] text-slate-450 italic">Utilizado para calcular b/b₀</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">12</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-semibold text-emerald-800 bg-emerald-50/15">Humedad Natural de la Arena</td>
                    <td
                      onClick={() => handleCellClick(12, "C", "Humedad Natural de la Arena", `${materials.fineHumidity}%`, `${materials.fineHumidity / 100}`)}
                      className={getCellClasses(12, "C") + " text-right font-mono font-bold text-emerald-600 bg-emerald-500/5"}
                    >
                      {materials.fineHumidity}%
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500 bg-emerald-500/5">%</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Humedad en cantera</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">13</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Absorción de la Arena</td>
                    <td
                      onClick={() => handleCellClick(13, "C", "Absorción de la Arena", `${materials.fineAbsorption}%`, `${materials.fineAbsorption / 100}`)}
                      className={getCellClasses(13, "C") + " text-right font-mono text-slate-800"}
                    >
                      {materials.fineAbsorption}%
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">%</td>
                    <td className="p-2 text-[11px] text-slate-450 italic">Absorción de calibración</td>
                  </tr>

                  {/* COARSE AGGREGATE */}
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <td className="bg-slate-150 text-slate-500 font-bold border-r border-slate-200 text-center text-xs py-1">14</td>
                    <td colSpan={4} className="py-1.5 px-3 text-left text-[11px] uppercase tracking-wide text-slate-600 border-b border-slate-200">
                      Agregado Grueso (Piedra)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">15</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Peso específico de la Piedra</td>
                    <td
                      onClick={() => handleCellClick(15, "C", "Peso específico de la Piedra", `${materials.coarseSpecificGravity} g/cm³`, `${materials.coarseSpecificGravity}`)}
                      className={getCellClasses(15, "C") + " text-right font-mono text-slate-800"}
                    >
                      {materials.coarseSpecificGravity}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">g/cm³</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Piedra chancada canónica</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">16</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Peso Unitario Seco Compactado (PUCS)</td>
                    <td
                      onClick={() => handleCellClick(16, "C", "Peso Unitario Seco Compactado (PUCS)", `${materials.coarseDryRoddedUnitWeight} kg/m³`, `${materials.coarseDryRoddedUnitWeight}`)}
                      className={getCellClasses(16, "C") + " text-right font-mono text-slate-800"}
                    >
                      {materials.coarseDryRoddedUnitWeight}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500 bg-slate-50/10">kg/m³</td>
                    <td className="p-2 text-[11px] text-slate-450 italic">Peso unitario suelto/compactado</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">17</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-semibold text-emerald-800 bg-emerald-50/15">Humedad de la Piedra</td>
                    <td
                      onClick={() => handleCellClick(17, "C", "Humedad de la Piedra", `${materials.coarseHumidity}%`, `${materials.coarseHumidity / 100}`)}
                      className={getCellClasses(17, "C") + " text-right font-mono font-bold text-emerald-600 bg-emerald-500/5"}
                    >
                      {materials.coarseHumidity}%
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500 bg-emerald-500/5">%</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Contenido de humedad</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">18</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Absorción de la Piedra</td>
                    <td
                      onClick={() => handleCellClick(18, "C", "Absorción de la Piedra", `${materials.coarseAbsorption}%`, `${materials.coarseAbsorption / 100}`)}
                      className={getCellClasses(18, "C") + " text-right font-mono text-slate-800"}
                    >
                      {materials.coarseAbsorption}%
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">%</td>
                    <td className="p-2 text-[11px] text-slate-450 italic">Absorción técnica</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">19</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Tamaño Máximo Nominal (TMN)</td>
                    <td
                      onClick={() => handleCellClick(19, "C", "Tamaño Máximo Nominal (TMN)", `${materials.coarseMaxNominalSize} pulg`, `"${materials.coarseMaxNominalSize}"`)}
                      className={getCellClasses(19, "C") + " text-right font-mono font-bold text-emerald-600"}
                    >
                      {materials.coarseMaxNominalSize}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">pulgadas</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Factor crítico del diseño ACI</td>
                  </tr>

                  {/* ADITIVO PLASTIFICANTE */}
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <td className="bg-slate-150 text-slate-500 font-bold border-r border-slate-200 text-center text-xs py-1">20</td>
                    <td colSpan={4} className="py-1.5 px-3 text-left text-[11px] uppercase tracking-wide text-slate-600 border-b border-slate-200">
                      Aditivo Plastificante / Reductor Comercial
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">21</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-bold text-slate-800">¿Utiliza Aditivo Plastificante?</td>
                    <td
                      onClick={() => handleCellClick(21, "C", "Usa Aditivo Plastificante", materials.hasAdditive ? "SI" : "NO", materials.hasAdditive ? `"SI"` : `"NO"`)}
                      className={getCellClasses(21, "C") + " text-right font-mono font-black text-slate-900 bg-slate-100"}
                    >
                      {materials.hasAdditive ? "SI" : "NO"}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500 font-bold">-</td>
                    <td className="p-2 text-[11px] text-slate-400 italic font-mono">Moduladora de reductores de agua</td>
                  </tr>
                  {materials.hasAdditive && (
                    <>
                      <tr>
                        <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">22</td>
                        <td className="p-2 text-xs px-3 text-slate-700">Reducción de Agua Activa (Lab)</td>
                        <td
                          onClick={() => handleCellClick(22, "C", "Reducción de Agua", `${materials.additiveWaterReduction}%`, `${materials.additiveWaterReduction / 100}`)}
                          className={getCellClasses(22, "C") + " text-right font-mono text-slate-900 font-semibold"}
                        >
                          {materials.additiveWaterReduction}%
                        </td>
                        <td className="p-2 text-[11px] text-center text-slate-500">%</td>
                        <td className="p-2 text-[11px] text-slate-450 italic">Humedad reducida en paso de agua</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">23</td>
                        <td className="p-2 text-xs px-3 text-slate-700">Dosificación (% del peso del Cemento)</td>
                        <td
                          onClick={() => handleCellClick(23, "C", "Dosificación de Aditivo", `${materials.additiveDosage}%`, `${materials.additiveDosage / 100}`)}
                          className={getCellClasses(23, "C") + " text-right font-mono text-slate-900 font-semibold"}
                        >
                          {materials.additiveDosage}%
                        </td>
                        <td className="p-2 text-[11px] text-center text-slate-500">%</td>
                        <td className="p-2 text-[11px] text-slate-400 italic">Dosificación sobre peso de clinker</td>
                      </tr>
                    </>
                  )}

                  {/* SECTION 2 */}
                  <tr className="bg-amber-550 text-white font-bold text-center">
                    <td className="bg-slate-100 text-slate-500 font-bold border-r border-slate-200 align-middle text-xs py-1">26</td>
                    <td colSpan={4} className="py-2 px-3 text-left bg-amber-600 text-white uppercase text-xs tracking-wider">
                      2. PARÁMETROS DE DISEÑO DEL PROYECTO (Requerimientos de obra)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-100 text-center text-[10px]">27</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-bold">Resistencia de Especificación (f'c)</td>
                    <td
                      onClick={() => handleCellClick(27, "C", "Resistencia de Especificación (f'c)", `${specs.specifiedStrength} kg/cm²`, `${specs.specifiedStrength}`)}
                      className={getCellClasses(27, "C") + " text-right font-mono font-extrabold text-slate-950 bg-amber-500/5"}
                    >
                      {specs.specifiedStrength}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg/cm²</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Resistencia cilíndrica del proyecto</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-100 text-center text-[10px]">28</td>
                    <td className="p-2 text-xs px-3 text-slate-700">¿Tiene Desviación Estándar (S_d)?</td>
                    <td
                      onClick={() => handleCellClick(28, "C", "¿Usa desviación estándar?", specs.useStandardDeviation ? "SI" : "NO", specs.useStandardDeviation ? `"SI"` : `"NO"`)}
                      className={getCellClasses(28, "C") + " text-right font-mono text-slate-800"}
                    >
                      {specs.useStandardDeviation ? "SI" : "NO"}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">-</td>
                    <td className="p-2 text-[11px] text-slate-450 italic">Estadística de dosificación</td>
                  </tr>
                  {specs.useStandardDeviation && (
                    <tr>
                      <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-100 text-center text-[10px]">29</td>
                      <td className="p-2 text-xs px-3 text-slate-700">Valor Desviación Estándar (S_d)</td>
                      <td
                        onClick={() => handleCellClick(29, "C", "Desviación Estándar", `${specs.standardDeviation}`, `${specs.standardDeviation}`)}
                        className={getCellClasses(29, "C") + " text-right font-mono text-slate-800"}
                      >
                        {specs.standardDeviation}
                      </td>
                      <td className="p-2 text-[11px] text-center text-slate-500">kg/cm²</td>
                      <td className="p-2 text-[11px] text-slate-400 italic">Desviación del control de calidad</td>
                    </tr>
                  )}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-100 text-center text-[10px]">30</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Asentamiento Nominal (Slump)</td>
                    <td
                      onClick={() => handleCellClick(30, "C", "Asentamiento Requerido", `${specs.slumpRange} pulg`, `"${specs.slumpRange}"`)}
                      className={getCellClasses(30, "C") + " text-right font-mono text-slate-800"}
                    >
                      {specs.slumpRange}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">pulgadas</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">De obra para trabajabilidad</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-100 text-center text-[10px]">31</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Con Aire Incorporado (Químico)</td>
                    <td
                      onClick={() => handleCellClick(31, "C", "Aire Incorporado", specs.airEntrained ? "SI" : "NO", specs.airEntrained ? `"SI"` : `"NO"`)}
                      className={getCellClasses(31, "C") + " text-right font-mono text-slate-800"}
                    >
                      {specs.airEntrained ? "SI" : "NO"}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">-</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">¿Contiene incorporador de burbujas?</td>
                  </tr>

                  {/* f'cr EXCEL DYNAMIC CELL */}
                  <tr className="bg-amber-100/70 font-semibold">
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-150 text-center text-[10px]">32</td>
                    <td className="p-2 text-xs px-3 text-amber-900 font-bold">Resistencia Promedio Requerida (f'cr)</td>
                    <td
                      onClick={() => handleCellClick(
                        32, "C", "Resistencia Promedio Requerida (f'cr)",
                        `${result.targetStrength} kg/cm²`,
                        `=IF(C28="SI", IF(C27<=350, MAX(C27+1.34*C29, C27+2.33*C29-35), MAX(C27+1.34*C29, 0.9*C27+2.33*C29)), IF(C27<210, C27+70, IF(C27<=350, C27+85, C27+100)))`
                      )}
                      className={getCellClasses(32, "C") + " text-right font-mono font-extrabold text-amber-800 bg-amber-200/40 border border-amber-300"}
                    >
                      {result.targetStrength}
                    </td>
                    <td className="p-2 text-[11px] text-center text-amber-900 font-bold bg-amber-500/5">kg/cm²</td>
                    <td className="p-2 text-[10.5px] text-amber-800 font-bold italic bg-amber-500/5">
                      FÓRMULA ACTIVA ACI 318 / Excel
                    </td>
                  </tr>


                  {/* SECTION 3 */}
                  <tr className="bg-blue-600 text-white font-bold text-center">
                    <td className="bg-slate-100 text-slate-500 font-bold border-r border-slate-200 align-middle text-xs py-1">34</td>
                    <td colSpan={4} className="py-2 px-3 text-left bg-blue-700 text-white uppercase text-xs tracking-wider">
                      3. RESULTADO DEL PROCESAMIENTO PASO A PASO (Fórmulas Absolutas)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">35</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Agua de Diseño Base (Tabla ACI)</td>
                    <td
                      onClick={() => handleCellClick(35, "C", "Agua de Diseño Base", `${result.baseWaterVol} L`, `${result.baseWaterVol}`)}
                      className={getCellClasses(35, "C") + " text-right font-mono text-slate-800"}
                    >
                      {result.baseWaterVol}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">L/m³</td>
                    <td className="p-2 text-[11px] text-slate-450 italic">De tabla 211.1 para TMN y Slump</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">36</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Contenido de Aire Base (Tabla ACI)</td>
                    <td
                      onClick={() => handleCellClick(36, "C", "Contenido de Aire", `${result.baseAirPct}%`, `${result.baseAirPct / 100}`)}
                      className={getCellClasses(36, "C") + " text-right font-mono text-slate-800"}
                    >
                      {result.baseAirPct}%
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">%</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Aire atrapado/incorporado</td>
                  </tr>

                  {/* AGUA AJUSTADA FÓRMULA */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">37</td>
                    <td className="p-2 text-xs px-3 text-slate-850 font-semibold">Agua Ajustada por Regulador Plastificante</td>
                    <td
                      onClick={() => handleCellClick(
                        37, "C", "Agua Ajustada por Plastificante",
                        `${result.adjustedWaterVol} L`,
                        `=IF(C21="SI", C35*(1-C22), C35)`
                      )}
                      className={getCellClasses(37, "C") + " text-right font-mono font-bold text-emerald-800 bg-emerald-100/10 border border-emerald-300"}
                    >
                      {result.adjustedWaterVol}
                    </td>
                    <td className="p-2 text-[11px] text-center text-emerald-800 font-semibold">L/m³</td>
                    <td className="p-2 text-[11px] text-emerald-800 font-bold italic bg-emerald-500/5">
                      =IF(C21="SI", C35*(1-C22), C35)
                    </td>
                  </tr>

                  {/* RELACION A/C */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">38</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Relación Agua/Cemento (A/C) de Tabla</td>
                    <td
                      onClick={() => handleCellClick(38, "C", "Relación Agua/Cemento (A/C)", `${result.waterCementRatio}`, `${result.waterCementRatio}`)}
                      className={getCellClasses(38, "C") + " text-right font-mono font-bold text-slate-900"}
                    >
                      {result.waterCementRatio}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">A/C</td>
                    <td className="p-2 text-[11px] text-slate-450 italic">Calculado con interpolación de f'cr</td>
                  </tr>

                  {/* PESO CEMENTO FÓRMULA */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">39</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-semibold">Peso del Cemento Portland Requerido</td>
                    <td
                      onClick={() => handleCellClick(
                        39, "C", "Peso del Cemento",
                        `${result.cementWeight} kg`,
                        `=C37/C38`
                      )}
                      className={getCellClasses(39, "C") + " text-right font-mono font-bold text-slate-800 border border-blue-200 bg-blue-50/10"}
                    >
                      {result.cementWeight.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11px] text-slate-500 font-bold italic font-mono bg-blue-50/5">
                      =C37/C38
                    </td>
                  </tr>

                  {/* VOLUMEN CEMENTO FÓRMULA */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">40</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Volumen Absoluto de Cemento</td>
                    <td
                      onClick={() => handleCellClick(
                        40, "C", "Volumen absoluto de Cemento",
                        `${result.cementVolume} m³`,
                        `=C39/(C8*1000)`
                      )}
                      className={getCellClasses(40, "C") + " text-right font-mono text-slate-800 bg-slate-50/30"}
                    >
                      {result.cementVolume}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">m³</td>
                    <td className="p-2 text-[11px] text-slate-455 italic font-mono">
                      =C39/(C8*1000)
                    </td>
                  </tr>

                  {/* ADITIVO PESO FÓRMULA */}
                  {materials.hasAdditive && (
                    <>
                      <tr>
                        <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">41</td>
                        <td className="p-2 text-xs px-3 text-slate-700 font-semibold">Peso del Aditivo Químico</td>
                        <td
                          onClick={() => handleCellClick(
                            41, "C", "Peso del Aditivo",
                            `${result.additiveWeight} kg`,
                            `=IF(C21="SI", C39*C23, 0)`
                          )}
                          className={getCellClasses(41, "C") + " text-right font-mono font-bold text-slate-800"}
                        >
                          {result.additiveWeight}
                        </td>
                        <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                        <td className="p-2 text-[11px] text-slate-500 italic font-mono">
                          =IF(C21="SI", C39*C23, 0)
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">42</td>
                        <td className="p-2 text-xs px-3 text-slate-700">Volumen Absoluto de Aditivo</td>
                        <td
                          onClick={() => handleCellClick(
                            42, "C", "Volumen absoluto de Aditivo",
                            `${result.additiveVolume} m³`,
                            `=IF(C21="SI", C41/(C24*1000), 0)`
                          )}
                          className={getCellClasses(42, "C") + " text-right font-mono text-slate-800 bg-slate-50/20"}
                        >
                          {result.additiveVolume}
                        </td>
                        <td className="p-2 text-[11px] text-center text-slate-500">m³</td>
                        <td className="p-2 text-[11px] text-slate-450 italic font-mono">
                          =IF(C21="SI", C41/(C24*1000), 0)
                        </td>
                      </tr>
                    </>
                  )}

                  {/* AGREGADO GRUESO PIEDRA b/b0 */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">43</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Volumen Unitario Seco Compactado de Piedras (b/b₀)</td>
                    <td
                      onClick={() => handleCellClick(43, "C", "Piedra b/b₀", `${result.coarseAggregateVolumeFactor}`, `${result.coarseAggregateVolumeFactor}`)}
                      className={getCellClasses(43, "C") + " text-right font-mono font-bold text-slate-850"}
                    >
                      {result.coarseAggregateVolumeFactor}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">pulg³</td>
                    <td className="p-2 text-[11px] text-slate-400 italic">Interp. finura arena ({materials.fineFinenessModulus}) y TMN</td>
                  </tr>

                  {/* PESO Y VOLUMEN DE PIEDRA FÓRMULAS */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">44</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-semibold">Peso de la Piedra (Seco de Laboratorio)</td>
                    <td
                      onClick={() => handleCellClick(
                        44, "C", "Peso Agregado Grueso Seco",
                        `${result.coarseAggregateDryWeight} kg`,
                        `=C43*C16`
                      )}
                      className={getCellClasses(44, "C") + " text-right font-mono font-bold text-slate-800 border border-slate-200 bg-slate-50/10"}
                    >
                      {result.coarseAggregateDryWeight.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11.5px] text-slate-500 font-bold italic font-mono bg-slate-50/5">
                      =C43*C16
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">45</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Volumen Absoluto de la Piedra</td>
                    <td
                      onClick={() => handleCellClick(
                        45, "C", "Volumen absoluto de Piedra",
                        `${result.coarseAggregateVolume} m³`,
                        `=C44/(C15*1000)`
                      )}
                      className={getCellClasses(45, "C") + " text-right font-mono text-slate-800 bg-slate-50/20"}
                    >
                      {result.coarseAggregateVolume}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">m³</td>
                    <td className="p-2 text-[11px] text-slate-450 italic font-mono">
                      =C44/(C15*1000)
                    </td>
                  </tr>

                  {/* VOLUMEN DE ARENA DEDUCCIÓN ABSOLUTA FÓRMULA */}
                  <tr className="bg-emerald-500/5">
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">48</td>
                    <td className="p-2 text-xs px-3 text-emerald-950 font-bold">Volumen Absoluto de Arena Deductiva</td>
                    <td
                      onClick={() => handleCellClick(
                        48, "C", "Volumen absoluto de Arena Libre",
                        `${result.fineAggregateVolume} m³`,
                        `=MAX(0, 1-(C40+C42+C45+C46+C47))`
                      )}
                      className={getCellClasses(48, "C") + " text-right font-mono font-bold text-emerald-800 bg-emerald-100/10 border border-emerald-300"}
                    >
                      {result.fineAggregateVolume}
                    </td>
                    <td className="p-2 text-[11px] text-center text-emerald-950 font-bold">m³</td>
                    <td className="p-2 text-[10.5px] text-emerald-800 font-bold italic font-mono leading-none">
                      =1 - Suma(Vol. de Cto + Agua + Piedra + Aire + Adit)
                    </td>
                  </tr>

                  {/* PESO ARENA SECO */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">49</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-semibold">Peso Agregado Fino Seco (FÓRMULA)</td>
                    <td
                      onClick={() => handleCellClick(
                        49, "C", "Peso Agregado Fino Seco",
                        `${result.fineAggregateDryWeight} kg`,
                        `=C48*C10*1000`
                      )}
                      className={getCellClasses(49, "C") + " text-right font-mono font-bold text-slate-800 border border-slate-200 bg-slate-50/10"}
                    >
                      {result.fineAggregateDryWeight.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11.5px] text-slate-500 font-bold italic font-mono bg-slate-50/5 text-slate-500">
                      =C48*C10*1000
                    </td>
                  </tr>


                  {/* SECTION 4 - CORRECCIÓN POR HUMEDAD HÚMEDA */}
                  <tr className="bg-emerald-600 text-white font-bold text-center">
                    <td className="bg-slate-100 text-slate-500 font-bold border-r border-slate-200 align-middle text-xs py-1">51</td>
                    <td colSpan={4} className="py-2 px-3 text-left bg-emerald-600 text-white uppercase text-xs tracking-wider">
                      4. CORRECCIÓN DE AGUA EN MEZCLADORA POR HUMEDAD REAL EN OBRA
                    </td>
                  </tr>

                  {/* PESOS DE OBRA HÚMEDOS */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">52</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Peso Húmedo del Agregado Grueso (Obra)</td>
                    <td
                      onClick={() => handleCellClick(
                        52, "C", "Peso Coarse Húmedo",
                        `${result.coarseAggregateWetWeight} kg`,
                        `=C44*(1+C17)`
                      )}
                      className={getCellClasses(52, "C") + " text-right font-mono font-bold text-slate-850"}
                    >
                      {result.coarseAggregateWetWeight.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11px] text-slate-450 italic font-mono">
                      =C44*(1+Humedad_Piedra)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">53</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Peso Húmedo del Agregado Fino (Obra)</td>
                    <td
                      onClick={() => handleCellClick(
                        53, "C", "Peso Fine Húmedo",
                        `${result.fineAggregateWetWeight} kg`,
                        `=C49*(1+C12)`
                      )}
                      className={getCellClasses(53, "C") + " text-right font-mono font-bold text-slate-850"}
                    >
                      {result.fineAggregateWetWeight.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11px] text-slate-450 italic font-mono">
                      =C44*(1+Humedad_Arena)
                    </td>
                  </tr>

                  {/* APORTES DE AGUA LIBRE POR HUMEDAD */}
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">54</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Aporte de Agua Libre de la Piedra</td>
                    <td
                      onClick={() => handleCellClick(
                        54, "C", "Aporte de Agua - Piedra",
                        `${result.coarseAggregateWaterContribution} L`,
                        `=C44*(C17-C18)`
                      )}
                      className={getCellClasses(54, "C") + " text-right font-mono text-emerald-600 bg-emerald-500/5"}
                    >
                      {result.coarseAggregateWaterContribution.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500 bg-emerald-500/5">Litros</td>
                    <td className="p-2 text-[11px] text-slate-450 italic font-mono">
                      =C44*(Humedad_Piedra - Absorción_Piedra)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">55</td>
                    <td className="p-2 text-xs px-3 text-slate-700">Aporte de Agua Libre de la Arena</td>
                    <td
                      onClick={() => handleCellClick(
                        55, "C", "Aporte de Agua - Arena",
                        `${result.fineAggregateWaterContribution} L`,
                        `=C49*(C12-C13)`
                      )}
                      className={getCellClasses(55, "C") + " text-right font-mono text-emerald-600 bg-emerald-500/5"}
                    >
                      {result.fineAggregateWaterContribution.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500 bg-emerald-500/5">Litros</td>
                    <td className="p-2 text-[11px] text-slate-450 italic font-mono">
                      =C49*(Humedad_Arena - Absorción_Arena)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">56</td>
                    <td className="p-2 text-xs px-3 text-slate-755 font-bold">Total Humectación Excedente por Agregados</td>
                    <td
                      onClick={() => handleCellClick(
                        56, "C", "Total Humedad Libre",
                        `${result.totalWaterContribution} Litros`,
                        `=C54+C55`
                      )}
                      className={getCellClasses(56, "C") + " text-right font-mono font-bold text-emerald-700 bg-emerald-100/10"}
                    >
                      {result.totalWaterContribution.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500 bg-emerald-150">Litros</td>
                    <td className="p-2 text-[11px] text-slate-400 italic font-mono">
                      Suma de aportes libres de arena y piedra
                    </td>
                  </tr>

                  {/* AGUA NETA MEZCLADORA CORREGIDA */}
                  <tr className="bg-blue-500/5 font-extrabold text-blue-900">
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">57</td>
                    <td className="p-2 text-xs px-3 text-blue-950 font-black">AGUA NETA CORREGIDA PARA TROMPO / MEZCLADORA</td>
                    <td
                      onClick={() => handleCellClick(
                        57, "C", "Agua Neta Corregida",
                        `${result.correctedWaterVol} Litros`,
                        `=MAX(0, C37-C56)`
                      )}
                      className={getCellClasses(57, "C") + " text-right font-mono font-extrabold text-blue-700 bg-blue-100/35 border-2 border-blue-500/30"}
                    >
                      {result.correctedWaterVol.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-blue-900 font-bold bg-blue-500/5">Litros</td>
                    <td className="p-2 text-[10.5px] text-blue-800 font-extrabold italic bg-blue-500/5 border-2 border-blue-500/10">
                      =Agua Diseño Ajustada - Aporte Humedad
                    </td>
                  </tr>

                  {/* PRACTICAL BATIDA ONE BAG SECTION */}
                  <tr className="bg-slate-900 text-white font-bold text-center">
                    <td className="bg-slate-100 text-slate-500 font-bold border-r border-slate-200 align-middle text-xs py-1">68</td>
                    <td colSpan={4} className="py-2 px-3 text-left bg-slate-900 text-yellow-300 uppercase text-xs tracking-wider font-extrabold">
                      6. DOSIFICACIÓN POR SACO DE CEMENTO (Dosis de Obra en Latas de 20 Litros)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">70</td>
                    <td className="p-2 text-xs px-3 text-slate-800 font-bold">Masa de Cemento Base</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900 bg-slate-50/15">42.5</td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11px] text-slate-500 font-bold">1 Saco de Cemento (42.5 kg) estándar de obra</td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">71</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-semibold">Arena Húmeda por Saco</td>
                    <td
                      onClick={() => handleCellClick(71, "C", "Arena por Saco", `${result.oneBagBatch.fineWeight} kg`, `=(42.5/E61)*E62`)}
                      className={getCellClasses(71, "C") + " text-right font-mono font-bold text-slate-800"}
                    >
                      {result.oneBagBatch.fineWeight.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11px] text-emerald-700 font-extrabold italic bg-emerald-50/10">
                      Equivale a ~{result.oneBagBatch.fineCans.toFixed(1)} Latas (Baldes de 20 L)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">72</td>
                    <td className="p-2 text-xs px-3 text-slate-700 font-semibold">Piedra Húmeda por Saco</td>
                    <td
                      onClick={() => handleCellClick(72, "C", "Piedra por Saco", `${result.oneBagBatch.coarseWeight} kg`, `=(42.5/E61)*E63`)}
                      className={getCellClasses(72, "C") + " text-right font-mono font-bold text-slate-800"}
                    >
                      {result.oneBagBatch.coarseWeight.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-slate-500">kg</td>
                    <td className="p-2 text-[11px] text-emerald-700 font-extrabold italic bg-emerald-50/10">
                      Equivale a ~{result.oneBagBatch.coarseCans.toFixed(1)} Latas (Baldes de 20 L)
                    </td>
                  </tr>
                  <tr className="bg-blue-500/5">
                    <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">73</td>
                    <td className="p-2 text-xs px-3 text-blue-900 font-bold">Agua Corregida a Añadir por Saco</td>
                    <td
                      onClick={() => handleCellClick(73, "C", "Agua por Saco", `${result.oneBagBatch.correctedWaterLiters} L`, `=(42.5/E61)*E64`)}
                      className={getCellClasses(73, "C") + " text-right font-mono font-black text-blue-700 border border-blue-300 bg-blue-100/15"}
                    >
                      {result.oneBagBatch.correctedWaterLiters.toFixed(1)}
                    </td>
                    <td className="p-2 text-[11px] text-center text-blue-800 font-bold">Litros</td>
                    <td className="p-2 text-[11px] text-blue-700 font-extrabold italic bg-blue-500/5">
                      ¡Sólo añadir {result.oneBagBatch.correctedWaterLiters.toFixed(1)} L de agua! (~{result.oneBagBatch.correctedWaterCans.toFixed(1)} Latas)
                    </td>
                  </tr>
                  {materials.hasAdditive && (
                    <tr className="bg-amber-500/5">
                      <td className="bg-slate-50 text-slate-400 font-medium border-r border-slate-200 text-center text-[10px]">74</td>
                      <td className="p-2 text-xs px-3 text-amber-900 font-semibold">Aditivo Regulador Plastificante por Saco</td>
                      <td
                        onClick={() => handleCellClick(74, "C", "Aditivo por Saco", `${result.oneBagBatch.additiveVolumeCc.toFixed(0)} mL`, `=(42.5/E61)*E65/Density*1000`)}
                        className={getCellClasses(74, "C") + " text-right font-mono font-bold text-amber-600 bg-amber-500/5"}
                      >
                        {result.oneBagBatch.additiveVolumeCc.toFixed(0)}
                      </td>
                      <td className="p-2 text-[11px] text-center text-amber-900 font-bold">mL (cc)</td>
                      <td className="p-2 text-[11px] text-amber-800 font-black italic">
                        ¡Medir con probeta o dosificador: {result.oneBagBatch.additiveVolumeCc.toFixed(0)} mL!
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-4 max-w-2xl mx-auto">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Referencias Técnicas del Diseño ACI 211.1</h3>
            <p>
              La norma técnica de diseño de mezclas de concreto estructural de peso normal (<strong>ACI 211.1-91</strong>) provee tablas empíricas de correlación calibradas en laboratorio para deducir el volumen inicial de agua de mezclado y la relación Agua/Cemento según las propiedades del cemento y agregados.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Volumen de Agua (Tabla 6.3.3)</span>
                Agua de batida necesaria por m³ en función del Tamaño Máximo Nominal de la piedra (TMN) y del rango de consistencia (slump).
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Módulo b/b₀ de Piedra (Tabla 6.3.6)</span>
                Deduce el coeficiente de volumen seco compactado del agregado grueso en base al Módulo de fineza de la arena de obra.
              </div>
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-950 rounded-lg border border-emerald-100 font-mono text-[11px] space-y-1">
              <p className="font-bold text-emerald-800">Uso de Aditivos Plastificantes Reductores de Agua:</p>
              <p>• Los aditivos plastificantes de alto rango facilitan la dispersión de las partículas de cemento reduciendo la cohesividad viscosa del agua interfacial.</p>
              <p>• Permite disminuir el volumen de agua de amasado (porcentaje de reducción) manteniendo la consistencia de slump objetivo.</p>
              <p>• Esto optimiza los costos al reducir la cuantía requerida de cemento por m³ para cumplir la relación A/C de diseño.</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
