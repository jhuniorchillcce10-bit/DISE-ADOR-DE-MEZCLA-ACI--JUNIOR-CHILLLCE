import React, { useState, useEffect } from "react";
import { MaterialProperties, DesignSpecifications, SavedProject } from "./types";
import { PRESETS } from "./presets";
import { executeACIMixDesign } from "./calculations";
import { InteractiveWizard } from "./components/InteractiveWizard";
import { JocqLogo } from "./components/JocqLogo";
import { CalculationTemplates } from "./components/CalculationTemplates";
import {
  Download,
  Sparkles,
  Save,
  CheckCircle,
  Hammer,
  FolderOpen,
  Trash2,
  Shield,
  Building,
  Compass,
  Workflow,
  ClipboardList
} from "lucide-react";

export default function App() {
  // Raw states loaded from the first preset as default
  const defaultPreset = PRESETS[0];
  const [materials, setMaterials] = useState<MaterialProperties>(defaultPreset.materials);
  const [specs, setSpecs] = useState<DesignSpecifications>(defaultPreset.specs);
  
  // App variables
  const [activeTab, setActiveTab] = useState<"wizard" | "templates">("wizard");
  const [projectName, setProjectName] = useState<string>("Mi Diseño de Mezcla");
  const [companyName, setCompanyName] = useState<string>("JUNIOR CC");
  const [companyLogoIcon, setCompanyLogoIcon] = useState<"shield" | "building" | "compass" | "hammer" | "jocq">("jocq");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isSavedAlert, setIsSavedAlert] = useState<boolean>(false);
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);

  const renderLogoIcon = (className = "h-5 w-5 text-slate-100") => {
    switch (companyLogoIcon) {
      case "jocq":
        return <JocqLogo className={className} showText={false} showCel={false} theme="dark" />;
      case "shield":
        return <Shield className={className} />;
      case "compass":
        return <Compass className={className} />;
      case "hammer":
        return <Hammer className={className} />;
      case "building":
      default:
        return <Building className={className} />;
    }
  };

  // Load projects from localStorage on mount
  useEffect(() => {
    const list = localStorage.getItem("aci_projects");
    if (list) {
      try {
        setSavedProjects(JSON.parse(list));
      } catch (e) {
        console.error("Failed to parse saved projects from localStorage");
      }
    }
  }, []);

  // Recalculate results reactively based on calculations engine
  const calculationResult = executeACIMixDesign(materials, specs);

  // Load a preset
  const handleLoadPreset = (presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId);
    if (p) {
      setMaterials(p.materials);
      setSpecs(p.specs);
      setProjectName(p.name);
    }
  };

  // Save project to localStorage
  const handleSaveProject = () => {
    const newProj: SavedProject = {
      id: Math.random().toString(36).substring(2, 9),
      name: projectName,
      updatedAt: new Date().toLocaleDateString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      materials,
      specs,
    };
    
    const updatedList = [...savedProjects.filter((p) => p.name !== projectName), newProj];
    setSavedProjects(updatedList);
    localStorage.setItem("aci_projects", JSON.stringify(updatedList));
    
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleLoadSavedProject = (p: SavedProject) => {
    setMaterials(p.materials);
    setSpecs(p.specs);
    setProjectName(p.name);
    setShowLoadModal(false);
  };

  const handleDeleteSavedProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProjects.filter((x) => x.id !== id);
    setSavedProjects(updated);
    localStorage.setItem("aci_projects", JSON.stringify(updated));
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      
      {/* HEADER SECTION */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-xs sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className={companyLogoIcon === "jocq" ? "bg-slate-950 rounded-full p-1 flex items-center justify-center shadow-md ring-2 ring-blue-500/40" : "bg-emerald-500 rounded-lg p-2 flex items-center justify-center shadow-md ring-2 ring-emerald-400/40"}>
              {companyLogoIcon === "jocq" ? (
                <JocqLogo className="h-10 w-10" showText={false} showCel={false} theme="dark" />
              ) : (
                renderLogoIcon("h-5 w-5 text-slate-950 font-bold")
              )}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Diseñador de Mezclas ACI <span className="text-[10px] bg-emerald-600/30 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-sm">CON ADITIVO</span>
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold">{companyName.toUpperCase()}</p>
            </div>
          </div>
          
          {/* TOP CONTROLS */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="top-project-title-input"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 max-w-[180px] font-medium"
            />
            <button
              id="save-project-btn"
              onClick={handleSaveProject}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Guardar
            </button>
            <button
              id="open-projects-modal-btn"
              onClick={() => setShowLoadModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Mis Diseños ({savedProjects.length})
            </button>
            <button
              id="print-btn"
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar / Imprimir
            </button>
          </div>
        </div>
      </header>

      {/* CREATOR AND APP INFORMATION BANNER */}
      <div id="youtube-assistance-banner" className="bg-slate-900 border-b border-emerald-950 text-white px-4 py-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1 max-w-4xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Software Desarrollado por JHUNIOR CHILLCCE QUILCA
            </div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Plataforma de Ingeniería Civil: Dosificación ACI 211.1 & Plantillas RNE</span>
            </h2>
            <p className="text-[11px] text-slate-300 leading-relaxed md:w-[95%]">
              Esta plataforma profesional e inteligente ha sido diseñada y desarrollada por <span className="font-black text-white">JHUNIOR CHILLCCE QUILCA</span>, integrando el diseño avanzado de mezclas de concreto bajo las directrices del manual del <strong>American Concrete Institute (ACI 211.1)</strong> con una completa suite de plantillas de cálculo automatizadas en cumplimiento estricto del <strong>Reglamento Nacional de Edificaciones (RNE)</strong> del Perú (Normas de Carga E.020, Sismorresistente E.030, Suelos y Cimentaciones E.050, Concreto Armado E.060 y Albañilería E.070). Optimiza de forma interactiva la dosificación, ajustes por aditivo y corrección de humedad, junto con rigurosos análisis de longitudes de desarrollo, metrado de acero, rendimiento de ladrillos, capacidad portante, juntas sísmicas y diseño geométrico-cargado de escaleras.
            </p>
          </div>
          <div className="flex-shrink-0 bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-xs space-y-1 text-center md:text-left min-w-[200px]">
            <p className="font-semibold text-emerald-400">Estándares y Normas:</p>
            <p className="text-[10px] text-slate-300">• Concreto: ACI 211.1 / RNE E.060</p>
            <p className="text-[10px] text-slate-300">• Estructural: RNE E.020 - E.070 / SENCICO</p>
            <p className="text-[10px] text-slate-300">• Geotecnia: RNE E.050 (Sq. Terzaghi)</p>
          </div>
        </div>
      </div>

      {/* ALERT TOASTS */}
      {isSavedAlert && (
        <div id="save-toast" className="fixed bottom-4 right-4 bg-slate-900 border-l-4 border-emerald-500 text-white p-4.5 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <div className="text-xs">
            <p className="font-bold">Diseño Guardado Exitosamente</p>
            <p className="text-slate-400">Podrás recuperarlo en cualquier momento sobre "Mis Diseños".</p>
          </div>
        </div>
      )}

      {/* CORE APPLICATION CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        
        {/* GLOBAL TABS SELECTOR */}
        <div id="global-tabs-bar" className="flex border-b border-slate-200 pb-3 justify-between items-center mb-6 print:hidden">
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
            <button
              id="tab-wizard-btn"
              onClick={() => setActiveTab("wizard")}
              className={`px-3.5 py-2 text-xs font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "wizard" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <Workflow className="h-4 w-4" />
              Diseñador de Mezcla ACI
            </button>
            <button
              id="tab-templates-btn"
              onClick={() => setActiveTab("templates")}
              className={`px-3.5 py-2 text-xs font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "templates" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <Hammer className="h-4 w-4" />
              Plantillas para Cálculo
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-mono font-bold">Estado del Diseño</span>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Metodología JUNIOR CHILLCCE
            </span>
          </div>
        </div>

        {/* WORK BENCH CONTAINER */}
        {activeTab === "wizard" ? (
          <div id="immersive-wizard-viewport" className="animate-fade-in print:hidden">
            <InteractiveWizard
              materials={materials}
              specs={specs}
              result={calculationResult}
              onMaterialsChange={setMaterials}
              onSpecsChange={setSpecs}
              projectName={projectName}
              companyName={companyName}
            />
          </div>
        ) : (
          <div id="templates-viewport" className="animate-fade-in w-full">
            <CalculationTemplates />
          </div>
        )}

      </main>

      {/* PRINT-ONLY VISUAL REPORT LAYOUT */}
      {activeTab !== "templates" && (
        <div id="print-only-layout" className="hidden print:block max-w-4xl mx-auto bg-white p-12 text-slate-900 border border-slate-300 rounded-lg shadow-xs">
          <div className="flex justify-between items-center border-b-2 border-slate-950 pb-5 mb-8">
            <div className="flex items-center gap-4 text-left">
              <div className={companyLogoIcon === "jocq" ? "bg-white p-1 rounded-xl" : "bg-slate-950 text-white rounded-xl p-3 flex items-center justify-center"}>
                {companyLogoIcon === "jocq" ? (
                  <JocqLogo className="h-24 w-24" showText={true} showCel={true} theme="light" />
                ) : (
                  renderLogoIcon("h-6 w-6 text-white")
                )}
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-slate-800 leading-none">REPORTE TÉCNICO OFICIAL</h2>
                <p className="text-lg font-black text-slate-950 mt-1.5 uppercase">{companyName}</p>
                <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Dosificación de Concreto de Peso Normal • ACI 211.1</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] bg-slate-900 text-slate-100 font-extrabold px-3 py-1.5 rounded-md uppercase tracking-wider">CONFORME ACI</span>
              <span className="block text-[8px] text-slate-400 mt-1.5 font-mono">Generado: {new Date().toLocaleDateString("es-PE")}</span>
            </div>
          </div>

          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-450 block mb-1">Identificación del Proyecto</span>
            <span className="text-sm font-bold text-slate-800">Proyecto de Obra: <span className="text-emerald-700 font-extrabold text-base">{projectName.toUpperCase()}</span></span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2.5">1. Requerimientos de Diseño</h3>
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Resistencia f'c:</td><td className="text-right font-bold">{specs.specifiedStrength} kg/cm²</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Resistencia f'cr:</td><td className="text-right font-bold">{calculationResult.targetStrength} kg/cm²</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">TMN de Piedra:</td><td className="text-right font-bold">{materials.coarseMaxNominalSize} pulgadas</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Asentamiento:</td><td className="text-right font-bold">{specs.slumpRange} pulgadas</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Aire Libre:</td><td className="text-right font-bold">{calculationResult.baseAirPct}%</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2.5">2. Aditivos y Agregados</h3>
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Aditivo Plastificante:</td><td className="text-right font-bold">{materials.hasAdditive ? `Sí, reduct. ${materials.additiveWaterReduction}%` : "No utiliza"}</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Dosif. de Aditivo:</td><td className="text-right font-bold">{materials.hasAdditive ? `${materials.additiveDosage}% cto.` : "-"}</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Humedad Arena:</td><td className="text-right font-bold">{materials.fineHumidity}%</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">Humedad Piedra:</td><td className="text-right font-bold">{materials.coarseHumidity}%</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-1 font-semibold text-slate-500">A/C Resultante:</td><td className="text-right font-bold">{calculationResult.waterCementRatio}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-4">3. Cuadro Resumen de Proporciones (1 m³)</h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-300 text-slate-800 mb-8">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-r border-slate-300">Material</th>
                <th className="p-2 border-r border-slate-300 text-right">Peso Seco (kg)</th>
                <th className="p-2 border-r border-slate-300 text-right">Corrección Humedad (kg)</th>
                <th className="p-2 text-right">Peso de Obra Húmedo (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-semibold">Cemento</td>
                <td className="p-2 border-r border-slate-300 text-right">{calculationResult.cementWeight.toFixed(1)}</td>
                <td className="p-2 border-r border-slate-300 text-right">-</td>
                <td className="p-2 text-right font-bold">{calculationResult.cementWeight.toFixed(1)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-semibold">Arena (Agregado Fino)</td>
                <td className="p-2 border-r border-slate-300 text-right">{calculationResult.fineAggregateDryWeight.toFixed(1)}</td>
                <td className="p-2 border-r border-slate-300 text-right">+{calculationResult.fineAggregateWaterContribution.toFixed(1)}</td>
                <td className="p-2 text-right font-bold">{calculationResult.fineAggregateWetWeight.toFixed(1)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-semibold">Piedra (Agregado Grueso)</td>
                <td className="p-2 border-r border-slate-300 text-right">{calculationResult.coarseAggregateDryWeight.toFixed(1)}</td>
                <td className="p-2 border-r border-slate-300 text-right">+{calculationResult.coarseAggregateWaterContribution.toFixed(1)}</td>
                <td className="p-2 text-right font-bold">{calculationResult.coarseAggregateWetWeight.toFixed(1)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300 font-semibold">Agua Efectiva</td>
                <td className="p-2 border-r border-slate-300 text-right">{calculationResult.adjustedWaterVol.toFixed(1)} L</td>
                <td className="p-2 border-r border-slate-300 text-right">-{calculationResult.totalWaterContribution.toFixed(1)} L</td>
                <td className="p-2 text-right font-bold text-slate-900">{calculationResult.correctedWaterVol.toFixed(1)} L</td>
              </tr>
              {calculationResult.additiveWeight > 0 && (
                <tr className="border-b border-slate-200">
                  <td className="p-2 border-r border-slate-300 font-semibold">Aditivo</td>
                  <td className="p-2 border-r border-slate-300 text-right">{calculationResult.additiveWeight.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-300 text-right">Sin cambios</td>
                  <td className="p-2 text-right font-bold">{calculationResult.additiveWeight.toFixed(2)}</td>
                </tr>
              )}
              <tr className="bg-slate-100 font-black">
                <td className="p-2 border-r border-slate-300">TOTALES</td>
                <td className="p-2 border-r border-slate-300 text-right">{calculationResult.totalDryWeight.toFixed(1)} kg</td>
                <td className="p-2 border-r border-slate-300 text-right">Agua corregida</td>
                <td className="p-2 text-right">{calculationResult.totalWetWeight.toFixed(1)} kg</td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 mt-12 mb-20 text-xs text-center border-t border-slate-200 pt-16">
            <div>
              <div className="border-b-2 border-dotted border-slate-900 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold">Ingeniero Proyectista</p>
              <p className="text-slate-500">Diseño Tecnológico de Mezclas</p>
            </div>
            <div>
              <div className="border-b-2 border-dotted border-slate-900 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold">Control de Calidad Obra</p>
              <p className="text-slate-500">Supervisión Técnica</p>
            </div>
          </div>
        </div>
      )}

      {/* LOAD PROJECTS MODAL */}
      {showLoadModal && (
        <div id="saved-projects-modal" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 font-bold flex justify-between items-center text-sm uppercase tracking-wide border-b border-slate-800">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Mis Diseños Guardados
              </span>
              <button
                id="close-modal-x-btn"
                onClick={() => setShowLoadModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 max-h-[350px] overflow-y-auto space-y-2.5">
              {savedProjects.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-8">No tienes diseños guardados en esta computadora aún.</p>
              ) : (
                savedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleLoadSavedProject(p)}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.updatedAt} • f'c {p.specs.specifiedStrength} kg/cm²</p>
                    </div>
                    <button
                      id={`delete-project-${p.id}`}
                      onClick={(e) => handleDeleteSavedProject(p.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex justify-end">
              <button
                id="close-modal-btn"
                onClick={() => setShowLoadModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4  py-2 rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
