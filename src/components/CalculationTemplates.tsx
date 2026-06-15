import React, { useState } from "react";
import {
  Scale,
  ArrowRight,
  BookOpen,
  Info,
  HelpCircle,
  Hammer,
  Printer,
  Sparkles,
  Check,
  RotateCcw,
  GitCommit,
  Layers,
  ArrowRightLeft,
  Building2,
  Grid,
  Columns,
  Scissors,
  Box,
  Sliders,
  Activity,
  Wind
} from "lucide-react";

interface BarSize {
  name: string;
  diameterInch: string;
  dbCm: number;
  areaCm2: number;
  weightKgM: number;
}

const COMMERCIAL_BARS: BarSize[] = [
  { name: "6 mm (Nacional)", diameterInch: "6 mm", dbCm: 0.60, areaCm2: 0.28, weightKgM: 0.222 },
  { name: "8 mm (Nacional)", diameterInch: "8 mm", dbCm: 0.80, areaCm2: 0.50, weightKgM: 0.395 },
  { name: "3/8\" (Grado 60)", diameterInch: "3/8\"", dbCm: 0.953, areaCm2: 0.71, weightKgM: 0.560 },
  { name: "1/2\" (Grado 60)", diameterInch: "1/2\"", dbCm: 1.270, areaCm2: 1.29, weightKgM: 0.994 },
  { name: "5/8\" (Grado 60)", diameterInch: "5/8\"", dbCm: 1.588, areaCm2: 2.00, weightKgM: 1.552 },
  { name: "3/4\" (Grado 60)", diameterInch: "3/4\"", dbCm: 1.905, areaCm2: 2.84, weightKgM: 2.235 },
  { name: "1\" (Grado 60)", diameterInch: "1\"", dbCm: 2.540, areaCm2: 5.10, weightKgM: 3.973 },
  { name: "1 3/8\" (Grado 60)", diameterInch: "1 3/8\"", dbCm: 3.493, areaCm2: 9.58, weightKgM: 7.907 }
];

export function CalculationTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<
    | "ld_acero"
    | "traslapes"
    | "cuantia"
    | "vigas"
    | "losas"
    | "columnas"
    | "estribos"
    | "zapatas"
    | "losas_macizas"
    | "muros"
    | "combinaciones"
    | "cortante_basal"
    | "control_calidad"
    | "metrado_acero"
    | "rendimiento_ladrillos"
    | "sismo_junta"
    | "carga_viento"
    | "densidad_muros"
    | "diseno_escaleras"
    | "capacidad_portante"
  >("ld_acero");

  // State for Ld calculation
  const [barIndex, setBarIndex] = useState<number>(3); // Default 1/2"
  const [fc, setFc] = useState<number>(21); // Standard fc in MPa (eq to 210 kg/cm²)
  const [fy, setFy] = useState<number>(420); // Standard fy in Peru in MPa (eq to 4200 kg/cm²)
  const [psiT, setPsiT] = useState<number>(1.0); // Location factor: 1.0 or 1.3
  const [psiE, setPsiE] = useState<number>(1.0); // Epoxy coating factor: 1.0 or 1.2/1.5
  const [customDb, setCustomDb] = useState<number>(1.27);
  const [isCustomBar, setIsCustomBar] = useState<boolean>(false);
  const [ldConfined, setLdConfined] = useState<boolean>(true); // E.060 Art. 12.2.2: True = 2.1/1.7 factors, False = 2.6/2.1 factors

  // State variables for Traslapes calculation
  const [lapType, setLapType] = useState<"traccion" | "compresion">("traccion");
  const [lapTensionClass, setLapTensionClass] = useState<"clase_a" | "clase_b">("clase_b");
  const [lapBarIndex, setLapBarIndex] = useState<number>(3); // Default 1/2"
  const [lapIsCustomBar, setLapIsCustomBar] = useState<boolean>(false);
  const [lapCustomDb, setLapCustomDb] = useState<number>(1.27);

  // Optional different diameters
  const [useDifferentDiameters, setUseDifferentDiameters] = useState<boolean>(false);
  const [lapBarIndex2, setLapBarIndex2] = useState<number>(2); // Default 3/8"
  const [lapIsCustomBar2, setLapIsCustomBar2] = useState<boolean>(false);
  const [lapCustomDb2, setLapCustomDb2] = useState<number>(0.953);

  // Material properties for traslapes (independent)
  const [lapFc, setLapFc] = useState<number>(21); 
  const [lapFy, setLapFy] = useState<number>(420);

  // Tension modifiers for traslapes
  const [lapPsiT, setLapPsiT] = useState<number>(1.0);
  const [lapPsiE, setLapPsiE] = useState<number>(1.0);

  // Splicing bundle sizes (1, 3, or 4 bars)
  const [lapBundleCount, setLapBundleCount] = useState<number>(1);

  // State variables for Cuantía de Acero calculation (RNE E.060)
  const [ratioAs, setRatioAs] = useState<number>(5.08); // default cm², e.g. 4 varillas de 1/2" is ~5.16 cm², but preset is customized
  const [ratioB, setRatioB] = useState<number>(0.30); // Width of beam in meters
  const [ratioH, setRatioH] = useState<number>(0.50); // Total depth of beam in meters
  const [ratioRecubrimiento, setRatioRecubrimiento] = useState<number>(0.04); // default recubrimiento (0.04 m cover)
  const [ratioD, setRatioD] = useState<number>(0.46); // effective depth in meters (h - r)
  const [ratioFc, setRatioFc] = useState<number>(21); // concrete strength: 21 MPa = 210 kg/cm²
  const [ratioFy, setRatioFy] = useState<number>(420); // steel strength: 420 MPa = 4200 kg/cm²
  const [ratioIsSeismic, setRatioIsSeismic] = useState<boolean>(true); // Seismic design limit 0.50*rhoB vs conventional 0.75*rhoB

  // --- MÓDULO 4: Predimensionamiento de Vigas ---
  const [beamL, setBeamL] = useState<number>(6.0); // Luz libre de viga in meters (default 6.00 m)
  const [beamType, setBeamType] = useState<"principal" | "secundaria">("principal");
  const [beamCategory, setBeamCategory] = useState<"A" | "B" | "C">("C");

  // --- MÓDULO 5: Predimensionamiento de Losas Aligeradas ---
  const [slabL, setSlabL] = useState<number>(4.5); // Luz libre de losa in meters (default 4.50 m)

  // --- MÓDULO 6: Predimensionamiento de Columnas ---
  const [colAtrib, setColAtrib] = useState<number>(24.0); // Área tributaria in square meters (default 24.00 m²)
  const [colNpisos, setColNpisos] = useState<number>(4); // Número de pisos (default 4)
  const [colCategory, setColCategory] = useState<"A" | "B" | "C">("C");
  const [colType, setColType] = useState<"centrada" | "excentrica" | "esquinera">("centrada");
  const [colFc, setColFc] = useState<number>(210); // f'c in kg/cm² (default 210)

  // --- MÓDULO 7: Predimensionamiento de Estribos ---
  const [stirrupH, setStirrupH] = useState<number>(0.50); // Peralte total de la viga en metros (default 0.50m)
  const [stirrupLongDbIndex, setStirrupLongDbIndex] = useState<number>(3); // Diámetro longitudinal principal, default 1/2"
  const [stirrupStirrupDbIndex, setStirrupStirrupDbIndex] = useState<number>(2); // Diámetro del estribo, default 3/8"
  const [stirrupIsSeismic, setStirrupIsSeismic] = useState<boolean>(true); // Aplicar zona sísmica de confinamiento (Art. 21.4.4)

  // --- MÓDULO 8: Predimensionamiento de Zapatas Aisladas ---
  const [zapP, setZapP] = useState<number>(80.0); // Carga de servicio en Toneladas (default 80.0 T)
  const [zapQa, setZapQa] = useState<number>(1.5); // Capacidad portante admisible del suelo (q_a) en kg/cm² (default 1.5)
  const [zapBcol, setZapBcol] = useState<number>(0.35); // Ancho de columna b en m
  const [zapHcol, setZapHcol] = useState<number>(0.35); // Peralte de columna t en m
  const [zapHz, setZapHz] = useState<number>(0.50); // Espesor o peralte de zapata en m (default 0.50m)
  const [zapUseDetailedP, setZapUseDetailedP] = useState<boolean>(false);
  const [zapPuso, setZapPuso] = useState<number>(1000); // kg/m2
  const [zapAt, setZapAt] = useState<number>(20.0); // m2
  const [zapNp, setZapNp] = useState<number>(4); // stories
  const [zapDbIndex, setZapDbIndex] = useState<number>(4); // For steel anchorage depth verification (default 5/8" bar)

  // --- MÓDULO 9: Predimensionamiento de Losas Macizas ---
  const [macizL, setMacizL] = useState<number>(4.0); // Luz libre corta en m (default 4.0m)
  const [macizL2, setMacizL2] = useState<number>(5.0); // Luz libre larga en m (default 5.0m) / para bidireccional
  const [macizType, setMacizType] = useState<"unidireccional" | "bidireccional">("unidireccional");
  const [macizSupport, setMacizSupport] = useState<"simplemente_apoyada" | "un_extremo_continuo" | "ambos_extremos_continuos" | "cantilever">("ambos_extremos_continuos");

  // --- MÓDULO 10: Predimensionamiento de Muros y Placas ---
  const [wallType, setWallType] = useState<"muro_corte" | "muro_ductilidad_limitada">("muro_corte");
  const [wallH, setWallH] = useState<number>(2.80); // Altura libre de piso en metros (default 2.80m)
  const [wallL, setWallL] = useState<number>(4.50); // Largo del muro en metros (default 4.50m)
  const [wallNpisos, setWallNpisos] = useState<number>(5); // Número de pisos para MDI (muro ductilidad limitada)

  // --- MÓDULO 11: Combinaciones de Carga Requeridas (E.060 Cap. 9) ---
  const [combD, setCombD] = useState<number>(15.0);
  const [combL, setCombL] = useState<number>(8.0);
  const [combWx, setCombWx] = useState<number>(12.0);
  const [combWy, setCombWy] = useState<number>(9.0);

  // --- MÓDULO 12: Cortante Basal Estático Equivalente (E.030) ---
  const [basalZVal, setBasalZVal] = useState<number>(0.45); // Zona 4
  const [basalUVal, setBasalUVal] = useState<number>(1.0); // Cat C
  const [basalCVal, setBasalCVal] = useState<number>(2.5); // C = 2.5
  const [basalSProfile, setBasalSProfile] = useState<"S0" | "S1" | "S2" | "S3">("S2"); // Suelo S2
  const [basalRVal, setBasalRVal] = useState<number>(8); // Pórticos
  const [basalPVal, setBasalPVal] = useState<number>(500.0); // Peso total en tn

  // --- MÓDULO 13: Control de Calidad y Aceptación de Concreto ---
  const [qcFcVal, setQcFcVal] = useState<number>(210); // f'c de diseño
  const [qcE1, setQcE1] = useState<number>(215); // Ensayo 1
  const [qcE2, setQcE2] = useState<number>(220); // Ensayo 2
  const [qcE3, setQcE3] = useState<number>(218); // Ensayo 3
  const [qcAgeDays, setQcAgeDays] = useState<number>(28); // Concrete curing days for resistance evolution f'c(t)

  // --- MÓDULO 14: Metrado en Kilogramos de Acero de Refuerzo ---
  const [steelDiameter, setSteelDiameter] = useState<"3/8" | "1/2" | "5/8" | "3/4" | "1">("1/2");
  const [steelLength, setSteelLength] = useState<number>(100.0);

  // --- MÓDULO 15: Rendimiento de Ladrillos para Muros y Techos ---
  const [brickElemType, setBrickElemType] = useState<"soga" | "cabeza" | "losa">("soga");
  const [brickL, setBrickL] = useState<number>(0.24); // m
  const [brickH, setBrickH] = useState<number>(0.09); // m
  const [brickJ, setBrickJ] = useState<number>(0.015); // m

  // --- MÓDULO 16: Junta Sísmica y Choque (E.030 Art. 16) ---
  const [juntaH, setJuntaH] = useState<number>(15.0); // m
  const [juntaNeighborH, setJuntaNeighborH] = useState<number>(12.0); // m

  // --- MÓDULO 17: Presión de Viento (E.020 Art. 12) ---
  const [windBaseV, setWindBaseV] = useState<number>(75.0); // km/h
  const [windH, setWindH] = useState<number>(12.0); // m
  const [windC, setWindC] = useState<number>(0.8); // Coeficiente de forma C

  // --- MÓDULO 18: Densidad Mínima de Muros de Albañilería Confinada (E.070) ---
  const [densidadZ, setDensidadZ] = useState<number>(0.45); // Zona 4
  const [densidadU, setDensidadU] = useState<number>(1.0); // Común
  const [densidadS, setDensidadS] = useState<number>(1.05); // S2
  const [densidadN, setDensidadN] = useState<number>(3); // Pisos
  const [densidadAp, setDensidadAp] = useState<number>(120.0); // Área planta m²
  const [densidadT, setDensidadT] = useState<number>(0.13); // Espesor m
  const [densidadSumL, setDensidadSumL] = useState<number>(25.0); // Sumatoria longitudes m

  // --- MÓDULO 19: Diseño de Escalera (E.060) ---
  const [stairL, setStairL] = useState<number>(4.2); // Luz de escalera en m
  const [stairPaso, setStairPaso] = useState<number>(0.25); // Paso en m
  const [stairContra, setStairContra] = useState<number>(0.17); // Contrapaso en m
  const [stairFc, setStairFc] = useState<number>(210); // f'c en kg/cm²
  const [stairFy, setStairFy] = useState<number>(4200); // f_y en kg/cm²
  const [stairLiveLoad, setStairLiveLoad] = useState<number>(200); // S/C en kg/m²
  const [stairAcabados, setStairAcabados] = useState<number>(100); // Acabados kg/m²
  const [stairThickness, setStairThickness] = useState<number>(0.15); // Espesor garganta m

  // --- MÓDULO 20: Capacidad Portante Terzaghi (E.050) ---
  const [soilCohesion, setSoilCohesion] = useState<number>(0.15); // c en kg/cm²
  const [soilPhi, setSoilPhi] = useState<number>(26.0); // Ángulo en grados
  const [soilGamma, setSoilGamma] = useState<number>(1.8); // Tn/m³
  const [soilDf, setSoilDf] = useState<number>(1.50); // Df en m
  const [soilB, setSoilB] = useState<number>(1.20); // Ancho en m
  const [soilFS, setSoilFS] = useState<number>(3.0); // Factor de seguridad

  // As assistant states
  const [assistantActive, setAssistantActive] = useState<boolean>(false);
  const [assistantQty1, setAssistantQty1] = useState<number>(4);
  const [assistantBarIndex1, setAssistantBarIndex1] = useState<number>(3); // Default 1/2"
  const [assistantQty2, setAssistantQty2] = useState<number>(0);
  const [assistantBarIndex2, setAssistantBarIndex2] = useState<number>(2); // Default 3/8"

  const selectedBar = COMMERCIAL_BARS[barIndex];
  const db = isCustomBar ? customDb : selectedBar.dbCm;

  // Determine classification (3/4" or smaller is <= 1.905 cm)
  const isSmallBar = db <= 1.905;
  const denominatorCoeff = ldConfined 
    ? (isSmallBar ? 2.1 : 1.7) 
    : (isSmallBar ? 2.6 : 2.1);

  // Check product of psi_t and psi_e (does not need to exceed 1.7 per norm)
  const psiProduct = psiT * psiE;
  const psiProductClamped = Math.min(1.7, psiProduct);

  // ld mathematical calculation
  // Ld = ((fy * psi_t * psi_e) / (coeff * sqrt(fc))) * db
  const sqrtFc = Math.sqrt(fc);
  const calculatedLd = ((fy * psiT * psiE) / (denominatorCoeff * sqrtFc)) * db;
  const clampedLd = Math.max(30, calculatedLd); // Minimum requirement is 30 cm

  // Hook development length Ldh (90°) according to RNE / ACI:
  // Ldh = (0.24 * fy / sqrt(fc)) * db in MPa
  const calculatedLdh = ((0.24 * fy) / sqrtFc) * db;
  // Standard minimum hook is max(15cm, 8 * db, calculated value)
  const clampedLdh = Math.max(15, Math.max(8 * db, calculatedLdh));

  // Anchor development length la according to RNE / ACI:
  // la = (0.075 * fy / sqrt(fc)) * db in MPa
  const calculatedLa = ((0.075 * fy) / sqrtFc) * db;
  const clampedLa = Math.max(30, calculatedLa);

  // -------------------------------------------------------------
  // EMPALMES Y TRASLAPES MATHEMATIC CALCULATIONS
  // -------------------------------------------------------------
  const selectedLapBar1 = COMMERCIAL_BARS[lapBarIndex];
  const db1 = lapIsCustomBar ? lapCustomDb : selectedLapBar1.dbCm;

  const selectedLapBar2 = COMMERCIAL_BARS[lapBarIndex2];
  const db2 = lapIsCustomBar2 ? lapCustomDb2 : selectedLapBar2.dbCm;

  // Identify larger and smaller bar diameters
  const largerDb = useDifferentDiameters ? Math.max(db1, db2) : db1;
  const smallerDb = useDifferentDiameters ? Math.min(db1, db2) : db1;

  // Determine if larger/smaller is custom
  const isLargerCustom = useDifferentDiameters 
    ? (db1 >= db2 ? lapIsCustomBar : lapIsCustomBar2) 
    : lapIsCustomBar;
  const isSmallerCustom = useDifferentDiameters 
    ? (db1 < db2 ? lapIsCustomBar : lapIsCustomBar2) 
    : lapIsCustomBar;

  const largerBarLabel = useDifferentDiameters
    ? (db1 >= db2 
        ? (lapIsCustomBar ? `${lapCustomDb.toFixed(2)} cm` : selectedLapBar1.diameterInch)
        : (lapIsCustomBar2 ? `${lapCustomDb2.toFixed(2)} cm` : selectedLapBar2.diameterInch))
    : (lapIsCustomBar ? `${lapCustomDb.toFixed(2)} cm` : selectedLapBar1.diameterInch);

  const smallerBarLabel = useDifferentDiameters
    ? (db1 < db2 
        ? (lapIsCustomBar ? `${lapCustomDb.toFixed(2)} cm` : selectedLapBar1.diameterInch)
        : (lapIsCustomBar2 ? `${lapCustomDb2.toFixed(2)} cm` : selectedLapBar2.diameterInch))
    : (lapIsCustomBar ? `${lapCustomDb.toFixed(2)} cm` : selectedLapBar1.diameterInch);

  // 1. Calculate Ld for tension of the larger bar
  const isSmallLargerBar = largerDb <= 1.905;
  const largerDenominator = isSmallLargerBar ? 2.1 : 1.7;
  const largerSqrtFc = Math.sqrt(lapFc);
  const ldLarger = ((lapFy * lapPsiT * lapPsiE) / (largerDenominator * largerSqrtFc)) * largerDb;

  // 2. Calculate Lsc for compression of the smaller bar
  // fy in kg/cm2 = lapFy * 10
  const fyKgCm2 = lapFy * 10;
  let lscDirect = 0;
  if (fyKgCm2 <= 4200) {
    lscDirect = 0.007 * fyKgCm2 * smallerDb;
  } else {
    lscDirect = (0.013 * fyKgCm2 - 24) * smallerDb;
  }
  
  // Low-concrete check: fc < 210 kg/cm2 (eq. to lapFc < 21 MPa)
  const isLowStrengthConcrete = lapFc < 21;
  const lscWithConcreteCorrection = isLowStrengthConcrete ? lscDirect * 1.33 : lscDirect;

  // Paquetes/bundles modifier
  const bundleMultiplier = lapBundleCount === 3 ? 1.20 : lapBundleCount === 4 ? 1.33 : 1.0;

  // Calculate final lap based on selected type and different diameters condition
  let finalLapCalculated = 0;
  let lapTensionBase = 0;
  let lapCompressionBase = 0;

  const tensionMultiplier = lapTensionClass === "clase_a" ? 1.0 : 1.3;
  lapTensionBase = ldLarger * tensionMultiplier;
  lapCompressionBase = lscWithConcreteCorrection;

  if (lapType === "traccion") {
    if (useDifferentDiameters) {
      // Different diameters: maximum of ld of larger and lsc of smaller
      finalLapCalculated = Math.max(lapTensionBase, lapCompressionBase);
    } else {
      finalLapCalculated = lapTensionBase;
    }
  } else {
    // Compression Lap
    if (useDifferentDiameters) {
      finalLapCalculated = Math.max(lapTensionBase, lapCompressionBase);
    } else {
      finalLapCalculated = lscWithConcreteCorrection;
    }
  }

  // Apply bundle multiplier
  const finalLapWithBundle = finalLapCalculated * bundleMultiplier;

  // Absolute minimum is 30 cm
  const clampedLap = Math.max(30, finalLapWithBundle);

  // -------------------------------------------------------------
  // CUANTÍA DE ACERO MATHEMATIC CALCULATIONS (RNE E.060)
  // -------------------------------------------------------------
  const barArea1 = COMMERCIAL_BARS[assistantBarIndex1]?.areaCm2 || 0;
  const barArea2 = COMMERCIAL_BARS[assistantBarIndex2]?.areaCm2 || 0;
  const calculatedAsFromAssistant = (assistantQty1 * barArea1) + (assistantQty2 * barArea2);
  const finalAs = assistantActive ? calculatedAsFromAssistant : ratioAs;

  const ratioB_cm = ratioB * 100;
  const ratioD_cm = ratioD * 100;
  const computedRho = finalAs / (ratioB_cm * ratioD_cm);

  const fcKg = ratioFc * 10;
  const fyKg = ratioFy * 10;
  const rhoMin = Math.max((0.7 * Math.sqrt(fcKg)) / fyKg, 14 / fyKg);

  let beta1 = 0.85;
  if (fcKg > 280) {
    beta1 = 0.85 - (0.05 * (fcKg - 280)) / 70;
    if (beta1 < 0.65) beta1 = 0.65;
  }

  const rhoBalanced = ((0.85 * beta1 * fcKg) / fyKg) * (6000 / (6000 + fyKg));
  const rhoMaxConv = 0.75 * rhoBalanced;
  const rhoMaxSeismic = 0.50 * rhoBalanced;
  const rhoMaxActive = ratioIsSeismic ? rhoMaxSeismic : rhoMaxConv;

  // --- CALCULACIONES DE PREDIMENSIONAMIENTO DE VIGAS ---
  // Paso 1: Divisor (alpha)
  let alpha = 12;
  if (beamType === "principal") {
    if (beamCategory === "A") alpha = 10;
    else if (beamCategory === "B") alpha = 11;
    else alpha = 12;
  } else {
    if (beamCategory === "A") alpha = 12;
    else if (beamCategory === "B") alpha = 13;
    else alpha = 14;
  }
  // Paso 2: Calcular peralte base (h_base)
  const beamHbase = beamL / alpha;
  // Paso 3: Redondeo comercial a múltiples de 5 cm (0.05 m)
  const beamH = Math.ceil(beamHbase / 0.05) * 0.05;

  // Ancho (b)
  // Paso 1: Calcular ancho base b_base = h / 2
  const beamBbase = beamH / 2;
  // Paso 2: Redondeo comercial inicial (b_calc)
  const beamBcalc = Math.ceil(beamBbase / 0.05) * 0.05;
  // Paso 3: Restricción por Esbeltez (Art. 21.4.4.1) -> max(b_calc, ceil(0.3 * h / 5)*5)
  const esbeltezLimit = Math.ceil((0.30 * beamH) / 0.05) * 0.05;
  const beamBesbeltez = Math.max(beamBcalc, esbeltezLimit);
  // Paso 4: Restricción por Mínimo Absoluto RNE (Capítulo 21) -> b = max(b_esbeltez, 25 cm = 0.25 m)
  const beamB = Math.max(beamBesbeltez, 0.25);


  // --- CALCULACIONES DE PREDIMENSIONAMIENTO DE LOSAS ALIGERADAS ---
  // Paso 1: Espesor base H_base = L_losa / 25
  const slabHbase = slabL / 25;
  // Paso 2: Condicional de asignación comercial estricta según RNE (en metros)
  let slabH = 0.17;
  const slabHbaseCm = slabHbase * 100;
  if (slabHbaseCm <= 17) {
    slabH = 0.17;
  } else if (slabHbaseCm <= 20) {
    slabH = 0.20;
  } else if (slabHbaseCm <= 25) {
    slabH = 0.25;
  } else if (slabHbaseCm <= 30) {
    slabH = 0.30;
  } else {
    slabH = (Math.ceil(slabHbaseCm / 5) * 5) / 100;
  }


  // --- CALCULACIONES DE PREDIMENSIONAMIENTO DE COLUMNAS ---
  // Paso 1: Carga de servicio (P)
  let colPmuro = 0.0100; // kg/cm^2
  if (colCategory === "A") colPmuro = 0.0150;
  else if (colCategory === "B") colPmuro = 0.0125;
  else colPmuro = 0.0100;

  // area tributaria en cm2: colAtrib * 10000
  const colAtribCm2 = colAtrib * 10000;
  const colP = colPmuro * colAtribCm2 * colNpisos; // Carga en kg

  // Paso 2: Factores normativos lambda y n
  let colLambda = 1.10;
  let colN = 0.30;
  if (colType === "excentrica") {
    colLambda = 1.25;
    colN = 0.25;
  } else if (colType === "esquinera") {
    colLambda = 1.25;
    colN = 0.25;
  }

  // Paso 3: Área Bruta Mínima
  const colAgBase = (colLambda * colP) / (colN * colFc); // in cm2
  // Restricción por Mínimo Absoluto RNE (Art. 21.6.1)
  const colAg = Math.max(colAgBase, 1000); // in cm2
  const colAgM2 = colAg / 10000; // in m2

  // --- CALCULACIONES DE PREDIMENSIONAMIENTO DE ESTRIBOS (E.060 Art. 11.5 & Cap. 21) ---
  const stirrupD = stirrupH - 0.06; // Peralte efectivo d (m)
  const stirrupLo = 2 * stirrupH; // Longitud de confinamiento mínima (m) de la viga
  const stirrupDbLong = COMMERCIAL_BARS[stirrupLongDbIndex]?.dbCm || 1.27; // db longitudinal en cm
  const stirrupDbStirrup = COMMERCIAL_BARS[stirrupStirrupDbIndex]?.dbCm || 0.953; // db estribo en cm

  // Límites de espaciamiento en zona de confinamiento (Capítulo 21 - Art. 21.4.4)
  const stirrupSconf_d4 = (stirrupD * 100) / 4; // d/4 en cm
  const stirrupSconf_8db = 8 * stirrupDbLong; // 8 x db longitudinal
  const stirrupSconf_24dbe = 24 * stirrupDbStirrup; // 24 x db estribo
  const stirrupSconf_limit = 30.0; // Límite máximo absoluto 30 cm

  // Espaciamiento final calculado de confinamiento (redondeado hacia abajo a múltiplos de 0.5 cm para facilidad en obra)
  const stirrupSconfTheor = Math.min(stirrupSconf_d4, stirrupSconf_8db, stirrupSconf_24dbe, stirrupSconf_limit);
  const stirrupSconf = Math.max(5.0, Math.floor(stirrupSconfTheor * 2) / 2); // Mínimo de obra 5cm, paso de 0.5cm

  // Espaciamiento en zona central (fuera de confinamiento)
  // RNE estándar: d/2, máx 30 cm. Sismorresistente solicitado: 10 * db, máx 30 cm.
  const stirrupScentral_10db = 10 * stirrupDbLong;
  const stirrupScentralTheor = stirrupIsSeismic 
    ? Math.min(30.0, (stirrupD * 100) / 2, stirrupScentral_10db)
    : Math.min(30.0, (stirrupD * 100) / 2);
  const stirrupScentral = Math.floor(stirrupScentralTheor);

  // Cantidad de estribos en zona de confinamiento (L_o)
  const stirrupNconf = Math.max(1, Math.floor(((stirrupLo * 100) - 5) / stirrupSconf));
  // Distribución típica sismorresistente: 1 @ 0.05, N @ Sconf, Resto @ Scentral en cada extremo
  const stirrupDistributionText = `1 @ 0.05m, ${stirrupNconf} @ ${(stirrupSconf / 100).toFixed(3)}m, resto @ ${(stirrupScentral / 100).toFixed(2)}m c/u`;


  // --- CALCULACIONES DE PREDIMENSIONAMIENTO DE ZAPATAS (E.050 / E.060) ---
  const zapPservTons = zapUseDetailedP 
    ? (zapPuso * zapAt * zapNp) / 1000 
    : zapP;
  const zapPtotal = zapPservTons * 1.10; // Carga de servicio con sobrecosto por peso propio y suelo de relleno
  const zapQaTm2 = zapQa * 10; // Capacidad admisible en Toneladas/m²
  const zapAreq = zapPtotal / zapQaTm2; // Área de zapata requerida en m²

  // Dimensionamiento para mantener concentricidad: bcol + 2x = L, tcol + 2x = B (por ende: L - Hcol = B - Bcol)
  const zapOffset = (zapHcol - zapBcol) / 2; // Diferencia de lados de columna dividida por 2
  const zapLtheor = Math.sqrt(zapAreq) + zapOffset;
  const zapBtheor = Math.sqrt(zapAreq) - zapOffset;

  // Redondeo comercial a múltiplos de 10 cm (0.10 m) y mínimo absoluto de 0.80 m
  const zapL = Math.max(0.80, Math.ceil(zapLtheor * 10) / 10);
  const zapB = Math.max(0.80, Math.ceil(zapBtheor * 10) / 10);
  const zapAactual = zapL * zapB; // Área real construida en m²

  // Footing Depth/Length requirement LP (Peralte de Zapata para anclaje de columna)
  // LP = (0.075 * fy / sqrt(f'c)) * db + 0.10 m (minimum 0.30 m)
  // Using standard steel fy = 420 MPa and f'c = 21 MPa (minimum for reinforced footings RNE E.060)
  const zapDbLong = COMMERCIAL_BARS[zapDbIndex].dbCm / 100; // db in meters
  const zapLpTheor = ((0.075 * 420) / Math.sqrt(21)) * zapDbLong + 0.10; // in meters
  const zapLp = Math.max(0.30, zapLpTheor); // minimum 0.30 m per user formula and code

  const zapD = zapHz - 0.075; // Peralte efectivo de zapata considerando 7.5 cm de recubrimiento en contacto con suelo (m)
  const zapBo = 2 * ((zapBcol + zapD) + (zapHcol + zapD)); // Perímetro crítico de punzonamiento a d/2 de la columna


  // --- CALCULACIONES DE PREDIMENSIONAMIENTO DE LOSAS MACIZAS (E.060 Art. 9.5.2 & Cap. 13) ---
  let macizHtheor = 0.10;
  if (macizType === "unidireccional") {
    // Tabla 9.1 de RNE E.060
    if (macizSupport === "simplemente_apoyada") macizHtheor = macizL / 20;
    else if (macizSupport === "un_extremo_continuo") macizHtheor = macizL / 24;
    else if (macizSupport === "ambos_extremos_continuos") macizHtheor = macizL / 28;
    else if (macizSupport === "cantilever") macizHtheor = macizL / 10;
  } else {
    // Losas macizas bidireccionales apoyadas en vigas en todo su perímetro (Capítulo 13)
    const macizPerimeter = 2 * (macizL + macizL2);
    macizHtheor = macizPerimeter / 180; // Criterio aproximado sismorresistente
  }
  // Espesor comercial de losa maciza redondeado al cm con mínimo reglamentario absoluto de 9 cm (0.09 m)
  const macizH = Math.max(0.09, Math.ceil(macizHtheor * 100) / 100);


  // --- CALCULACIONES DE PREDIMENSIONAMIENTO DE MUROS Y PLACAS (E.060 Cap. 21/22) ---
  let wallT = 0.15;
  let wallTtheor = 0.15;
  if (wallType === "muro_corte") {
    wallTtheor = wallH / 25; // Espesor mínimo por esbeltez RNE Art. 21.9
    // Redondeo comercial a múltiplos de 5 cm (0.05m) con un mínimo absoluto de 15 cm (0.15m)
    wallT = Math.max(0.15, Math.ceil(wallTtheor / 0.05) * 0.05);
  } else {
    // Muros de Ductilidad Limitada (MDL) - RNE E.060 Capítulo 22
    // En Perú, para edificaciones MDL de hasta 7 pisos se emplea t=10cm de manera estándar
    if (wallNpisos <= 7) {
      wallT = 0.10;
    } else if (wallNpisos <= 10) {
      wallT = 0.12;
    } else {
      wallT = 0.15;
    }
    wallTtheor = 0.10;
  }

  // --- CALCULACIONES DE COMBINACIONES DE CARGA (E.060 Cap. 9) ---
  const u1 = 1.4 * combD + 1.7 * combL;
  const u2 = 1.25 * (combD + combL) + 1.0 * combWx;
  const u3 = 1.25 * (combD + combL) - 1.0 * combWx;
  const u4 = 1.25 * (combD + combL) + 1.0 * combWy;
  const u5 = 1.25 * (combD + combL) - 1.0 * combWy;
  const u6 = 0.9 * combD + 1.0 * combWx;
  const u7 = 0.9 * combD - 1.0 * combWx;
  const u8 = 0.9 * combD + 1.0 * combWy;
  const u9 = 0.9 * combD - 1.0 * combWy;

  const uMax = Math.max(
    Math.abs(u1),
    Math.abs(u2),
    Math.abs(u3),
    Math.abs(u4),
    Math.abs(u5),
    Math.abs(u6),
    Math.abs(u7),
    Math.abs(u8),
    Math.abs(u9)
  );

  // --- CALCULACIONES DE CORTANTE BASAL ESTÁTICO EQUIVALENTE (E.030) ---
  let basalSVal = 1.20;
  if (basalZVal === 0.45) { // Z4
    if (basalSProfile === "S0") basalSVal = 0.80;
    else if (basalSProfile === "S1") basalSVal = 1.00;
    else if (basalSProfile === "S2") basalSVal = 1.05;
    else if (basalSProfile === "S3") basalSVal = 1.10;
  } else if (basalZVal === 0.35) { // Z3
    if (basalSProfile === "S0") basalSVal = 0.80;
    else if (basalSProfile === "S1") basalSVal = 1.00;
    else if (basalSProfile === "S2") basalSVal = 1.15;
    else if (basalSProfile === "S3") basalSVal = 1.20;
  } else if (basalZVal === 0.25) { // Z2
    if (basalSProfile === "S0") basalSVal = 0.80;
    else if (basalSProfile === "S1") basalSVal = 1.00;
    else if (basalSProfile === "S2") basalSVal = 1.20;
    else if (basalSProfile === "S3") basalSVal = 1.40;
  } else { // Z1 (0.10)
    if (basalSProfile === "S0") basalSVal = 0.80;
    else if (basalSProfile === "S1") basalSVal = 1.00;
    else if (basalSProfile === "S2") basalSVal = 1.40;
    else if (basalSProfile === "S3") basalSVal = 2.00;
  }

  const basalRatioCR = basalCVal / basalRVal;
  const isRatioRestricted = basalRatioCR < 0.11;
  const activatedRatio = isRatioRestricted ? 0.11 : basalRatioCR;
  const basalV = basalZVal * basalUVal * basalSVal * activatedRatio * basalPVal;

  // --- CALCULACIONES DE CONTROL DE CALIDAD Y ACEPTACIÓN DEL CONCRETO ---
  const qcAvg = (qcE1 + qcE2 + qcE3) / 3;
  const qcMin = Math.min(qcE1, qcE2, qcE3);
  const qcPassed = qcAvg >= qcFcVal && qcMin >= (qcFcVal - 35);

  // Evolución de f'c en el tiempo (Resistencia Esperada con t en días):
  // f'c(t) = f'c * (t / (4 + 0.85 * t))
  const qcEvolutionFactor = qcAgeDays / (4 + 0.85 * qcAgeDays);
  const qcEvolutionFct = qcFcVal * qcEvolutionFactor;

  // --- CALCULACIONES DE METRADO EN KILOGRAMOS DE ACERO DE REFUERZO ---
  let steelFactor = 0.994;
  if (steelDiameter === "3/8") steelFactor = 0.560;
  else if (steelDiameter === "1/2") steelFactor = 0.994;
  else if (steelDiameter === "5/8") steelFactor = 1.552;
  else if (steelDiameter === "3/4") steelFactor = 2.235;
  else if (steelDiameter === "1") steelFactor = 3.973;

  const steelTotalWeight = steelLength * steelFactor;

  // --- CALCULACIONES DE RENDIMIENTO DE LADRILLOS PARA MUROS Y TECHOS ---
  let brickQty = 0;
  if (brickElemType === "soga" || brickElemType === "cabeza") {
    brickQty = (1 / ((brickL + brickJ) * (brickH + brickJ))) * 1.05;
  } else {
    brickQty = (1 / (0.40 * (brickL + 0.01))) * 1.05;
  }

  // --- CALCULACIONES DE SISMO Y JUNTA SÍSMICA (E.030 Art. 16) ---
  const sismoSmin = Math.max(0.03, 0.006 * juntaH);
  const sismoSneighbor = juntaH > 6 ? (0.03 + 0.004 * (juntaH - 6)) : 0.03;

  // --- CALCULACIONES DE PRESIÓN DE VIENTO (E.020 Art. 12) ---
  const windVh = windBaseV * Math.pow(Math.max(10, windH) / 10, 0.22);
  const windPh = 0.005 * windC * Math.pow(windVh, 2);

  // --- CALCULACIONES DE DENSIDAD MÍNIMA DE MUROS E.070 ---
  const densidadAreaMuros = densidadSumL * densidadT;
  const densidadReal = densidadAreaMuros / densidadAp;
  const densidadReq = (densidadZ * densidadU * densidadS * densidadN) / 56;
  const densidadCumple = densidadReal >= densidadReq;

  // --- CALCULACIONES DE DISEÑO DE ESCALERAS (E.060) ---
  const stairThetaRad = Math.atan(stairContra / stairPaso);
  const stairThetaDeg = (stairThetaRad * 180) / Math.PI;
  const stairWeightSlab = (2400 * stairThickness) / Math.cos(stairThetaRad);
  const stairWeightSteps = 2400 * (stairContra / 2);
  const stairDeadLoad = stairWeightSlab + stairWeightSteps + stairAcabados;
  const stairWu = 1.4 * stairDeadLoad + 1.7 * stairLiveLoad;
  const stairMu = (stairWu * Math.pow(stairL, 2)) / 8; // kg-m/m
  const stairD = stairThickness * 100 - 3; // d en cm (3cm recubrimiento)
  const stairAsRequired = (stairMu * 100) / (0.9 * stairFy * 0.9 * stairD); // cm²/m
  const stairAsMin = 0.0018 * 100 * (stairThickness * 100); // cm²/m (fraguado de temperatura)
  const stairAsFinal = Math.max(stairAsMin, stairAsRequired);

  // --- CALCULACIONES DE CAPACIDAD PORTANTE TERZAGHI (E.050) ---
  const soilPhiRad = (soilPhi * Math.PI) / 180;
  const soilNq = Math.pow(Math.tan((45 + soilPhi / 2) * Math.PI / 180), 2) * Math.exp(Math.PI * Math.tan(soilPhiRad));
  const soilNc = soilPhi > 0 ? (soilNq - 1) / Math.tan(soilPhiRad) : 5.7;
  const soilNgamma = 2 * (soilNq + 1) * Math.tan(soilPhiRad);
  const soilCTnm2 = soilCohesion * 10;
  const soilQ = soilGamma * soilDf;
  const soilQult = 1.3 * soilCTnm2 * soilNc + soilQ * soilNq + 0.4 * soilGamma * soilB * soilNgamma;
  const soilQadm = soilQult / soilFS;
  const soilQadmKg = soilQadm / 10;

  const handleReset = () => {
    if (selectedTemplate === "ld_acero") {
      setBarIndex(3);
      setFc(21);
      setFy(420);
      setPsiT(1.0);
      setPsiE(1.0);
      setIsCustomBar(false);
    } else if (selectedTemplate === "traslapes") {
      setLapType("traccion");
      setLapTensionClass("clase_b");
      setLapBarIndex(3);
      setLapIsCustomBar(false);
      setLapCustomDb(1.27);
      setUseDifferentDiameters(false);
      setLapBarIndex2(2);
      setLapIsCustomBar2(false);
      setLapCustomDb2(0.953);
      setLapFc(21);
      setLapFy(420);
      setLapPsiT(1.0);
      setLapPsiE(1.0);
      setLapBundleCount(1);
    } else if (selectedTemplate === "cuantia") {
      setRatioAs(5.08);
      setRatioB(0.30);
      setRatioH(0.50);
      setRatioRecubrimiento(0.04);
      setRatioD(0.46);
      setRatioFc(21);
      setRatioFy(420);
      setRatioIsSeismic(true);
      setAssistantActive(false);
      setAssistantQty1(4);
      setAssistantBarIndex1(3);
      setAssistantQty2(0);
      setAssistantBarIndex2(2);
    } else if (selectedTemplate === "vigas") {
      setBeamL(6.0);
      setBeamType("principal");
      setBeamCategory("C");
    } else if (selectedTemplate === "losas") {
      setSlabL(4.5);
    } else if (selectedTemplate === "columnas") {
      setColAtrib(24.0);
      setColNpisos(4);
      setColCategory("C");
      setColType("centrada");
      setColFc(210);
    } else if (selectedTemplate === "estribos") {
      setStirrupH(0.50);
      setStirrupLongDbIndex(3);
      setStirrupStirrupDbIndex(2);
      setStirrupIsSeismic(true);
    } else if (selectedTemplate === "zapatas") {
      setZapP(80.0);
      setZapQa(1.5);
      setZapBcol(0.35);
      setZapHcol(0.35);
      setZapHz(0.50);
    } else if (selectedTemplate === "losas_macizas") {
      setMacizL(4.0);
      setMacizL2(5.0);
      setMacizType("unidireccional");
      setMacizSupport("ambos_extremos_continuos");
    } else if (selectedTemplate === "muros") {
      setWallType("muro_corte");
      setWallH(2.80);
      setWallL(4.50);
      setWallNpisos(5);
    } else if (selectedTemplate === "combinaciones") {
      setCombD(15.0);
      setCombL(8.0);
      setCombWx(12.0);
      setCombWy(9.0);
    } else if (selectedTemplate === "cortante_basal") {
      setBasalZVal(0.45);
      setBasalUVal(1.0);
      setBasalCVal(2.5);
      setBasalSProfile("S2");
      setBasalRVal(8);
      setBasalPVal(500.0);
    } else if (selectedTemplate === "control_calidad") {
      setQcFcVal(210);
      setQcE1(215);
      setQcE2(220);
      setQcE3(218);
    } else if (selectedTemplate === "metrado_acero") {
      setSteelDiameter("1/2");
      setSteelLength(100.0);
    } else if (selectedTemplate === "rendimiento_ladrillos") {
      setBrickElemType("soga");
      setBrickL(0.24);
      setBrickH(0.09);
      setBrickJ(0.015);
    } else if (selectedTemplate === "sismo_junta") {
      setJuntaH(15.0);
      setJuntaNeighborH(12.0);
    } else if (selectedTemplate === "carga_viento") {
      setWindBaseV(75.0);
      setWindH(12.0);
      setWindC(0.8);
    } else if (selectedTemplate === "densidad_muros") {
      setDensidadZ(0.45);
      setDensidadU(1.0);
      setDensidadS(1.05);
      setDensidadN(3);
      setDensidadAp(120.0);
      setDensidadT(0.13);
      setDensidadSumL(25.0);
    } else if (selectedTemplate === "diseno_escaleras") {
      setStairL(4.2);
      setStairPaso(0.25);
      setStairContra(0.17);
      setStairFc(210);
      setStairFy(4200);
      setStairLiveLoad(200);
      setStairAcabados(100);
      setStairThickness(0.15);
    } else if (selectedTemplate === "capacidad_portante") {
      setSoilCohesion(0.15);
      setSoilPhi(26.0);
      setSoilGamma(1.8);
      setSoilDf(1.50);
      setSoilB(1.20);
      setSoilFS(3.0);
    }
  };

  const handlePrintTemplate = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="templates-tab-viewport">
      
      {/* LEFT SIDEBAR: MENU OF TEMPLATES */}
      <div className="lg:col-span-3 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 print:hidden">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
          <Layers className="h-4.5 w-4.5 text-slate-600" />
          Módulos de Cálculo
        </h3>
        
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedTemplate("ld_acero")}
            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "ld_acero"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <GitCommit className={`h-4.5 w-4.5 ${selectedTemplate === "ld_acero" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 1</span>
              <span>Longitud de Desarrollo ($l_d$)</span>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedTemplate("traslapes")}
            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "traslapes"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <ArrowRightLeft className={`h-4.5 w-4.5 ${selectedTemplate === "traslapes" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 2</span>
              <span>Empalmes y Traslapes</span>
            </div>
          </button>

          <button
            id="btn-mod-cuantia"
            onClick={() => setSelectedTemplate("cuantia")}
            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "cuantia"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Scale className={`h-4.5 w-4.5 ${selectedTemplate === "cuantia" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 3</span>
              <span>Cuantía de Acero (ρ)</span>
            </div>
          </button>
          
          <button
            id="btn-mod-vigas"
            onClick={() => setSelectedTemplate("vigas")}
            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "vigas"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Columns className={`h-4.5 w-4.5 ${selectedTemplate === "vigas" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 4</span>
              <span>Predimensionamiento de Vigas</span>
            </div>
          </button>

          <button
            id="btn-mod-losas"
            onClick={() => setSelectedTemplate("losas")}
            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "losas"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Grid className={`h-4.5 w-4.5 ${selectedTemplate === "losas" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 5</span>
              <span>Predimensionamiento de Losas</span>
            </div>
          </button>

          <button
            id="btn-mod-columnas"
            onClick={() => setSelectedTemplate("columnas")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "columnas"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Building2 className={`h-4.5 w-4.5 ${selectedTemplate === "columnas" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 6</span>
              <span>Predimensionamiento Columnas</span>
            </div>
          </button>

          <button
            id="btn-mod-estribos"
            onClick={() => setSelectedTemplate("estribos")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "estribos"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Scissors className={`h-4.5 w-4.5 ${selectedTemplate === "estribos" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 7</span>
              <span>Predimensionamiento Estribos</span>
            </div>
          </button>

          <button
            id="btn-mod-zapatas"
            onClick={() => setSelectedTemplate("zapatas")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "zapatas"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Box className={`h-4.5 w-4.5 ${selectedTemplate === "zapatas" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 8</span>
              <span>Zapatas Aisladas RNE</span>
            </div>
          </button>

          <button
            id="btn-mod-losas-macizas"
            onClick={() => setSelectedTemplate("losas_macizas")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "losas_macizas"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Sliders className={`h-4.5 w-4.5 ${selectedTemplate === "losas_macizas" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 9</span>
              <span>Losas Macizas E.060</span>
            </div>
          </button>

          <button
            id="btn-mod-muros"
            onClick={() => setSelectedTemplate("muros")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "muros"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Activity className={`h-4.5 w-4.5 ${selectedTemplate === "muros" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 10</span>
              <span>Muros y Placas (MDL)</span>
            </div>
          </button>

          <button
            id="btn-mod-combinaciones"
            onClick={() => setSelectedTemplate("combinaciones")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "combinaciones"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Layers className={`h-4.5 w-4.5 ${selectedTemplate === "combinaciones" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 11</span>
              <span>Combinaciones de Carga E.060</span>
            </div>
          </button>

          <button
            id="btn-mod-cortante-basal"
            onClick={() => setSelectedTemplate("cortante_basal")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "cortante_basal"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Activity className={`h-4.5 w-4.5 ${selectedTemplate === "cortante_basal" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 12</span>
              <span>Cortante Basal E.030</span>
            </div>
          </button>

          <button
            id="btn-mod-control-calidad"
            onClick={() => setSelectedTemplate("control_calidad")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "control_calidad"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Check className={`h-4.5 w-4.5 ${selectedTemplate === "control_calidad" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 13</span>
              <span>Control de Calidad Concreto</span>
            </div>
          </button>

          <button
            id="btn-mod-metrado-acero"
            onClick={() => setSelectedTemplate("metrado_acero")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "metrado_acero"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Scale className={`h-4.5 w-4.5 ${selectedTemplate === "metrado_acero" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 14</span>
              <span>Metrado Acero de Refuerzo</span>
            </div>
          </button>

          <button
            id="btn-mod-rendimiento-ladrillos"
            onClick={() => setSelectedTemplate("rendimiento_ladrillos")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "rendimiento_ladrillos"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Grid className={`h-4.5 w-4.5 ${selectedTemplate === "rendimiento_ladrillos" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 15</span>
              <span>Rendimiento de Ladrillos</span>
            </div>
          </button>

          <button
            id="btn-mod-sismo-junta"
            onClick={() => setSelectedTemplate("sismo_junta")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "sismo_junta"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <GitCommit className={`h-4.5 w-4.5 ${selectedTemplate === "sismo_junta" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 16 (E.030)</span>
              <span>Junta Sísmica y Choque</span>
            </div>
          </button>

          <button
            id="btn-mod-carga-viento"
            onClick={() => setSelectedTemplate("carga_viento")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "carga_viento"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Wind className={`h-4.5 w-4.5 ${selectedTemplate === "carga_viento" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 17 (E.020)</span>
              <span>Presión de Viento</span>
            </div>
          </button>

          <button
            id="btn-mod-densidad-muros"
            onClick={() => setSelectedTemplate("densidad_muros")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "densidad_muros"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Building2 className={`h-4.5 w-4.5 ${selectedTemplate === "densidad_muros" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 18 (E.070)</span>
              <span>Densidad Mínima Muros</span>
            </div>
          </button>

          <button
            id="btn-mod-diseno-escaleras"
            onClick={() => setSelectedTemplate("diseno_escaleras")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "diseno_escaleras"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Sliders className={`h-4.5 w-4.5 ${selectedTemplate === "diseno_escaleras" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 19 (E.060)</span>
              <span>Diseño de Escaleras C.A.</span>
            </div>
          </button>

          <button
            id="btn-mod-capacidad-portante"
            onClick={() => setSelectedTemplate("capacidad_portante")}
            className={`w-full text-left p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedTemplate === "capacidad_portante"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-102"
                : "bg-slate-50 text-slate-650 border-slate-150 hover:bg-slate-100"
            }`}
          >
            <Box className={`h-4.5 w-4.5 ${selectedTemplate === "capacidad_portante" ? "text-emerald-400" : "text-slate-400"}`} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Módulo 20 (E.050)</span>
              <span>Capacidad Portante Suelo</span>
            </div>
          </button>
        </div>

        <div className="bg-emerald-500/5 text-emerald-800 p-3 rounded-xl border border-emerald-500/10 text-[10px] leading-relaxed">
          <span className="font-extrabold flex items-center gap-1 mb-1 text-emerald-900">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            Reglamento Nacional de Edificaciones (RNE)
          </span>
          Estas planillas aplican estrictamente los principios físicos, geométricos, de sismo y de materiales estandarizados por el Reglamento Nacional de Edificaciones del Perú (Normas E.020, E.030, E.050, E.060, E.070).
        </div>
      </div>

      {/* RIGHT WORKBENCH: SELECTED TEMPLATE VIEW */}
      <div className="lg:col-span-9 space-y-6">
        {selectedTemplate === "ld_acero" && (
          <div className="space-y-6">
            
            {/* INPUT PANEL & RESULTS HERO PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT CONTROLS PANEL (7 cols) */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      SUBTÍTULO 1
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      1: Longitud de Desarrollo de Acero
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer valores por defecto"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  
                  {/* BAR DIAMETER SELECTOR */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Diámetro de la Barra de Acero ($d_b$)
                      </label>
                      <button
                        onClick={() => setIsCustomBar(!isCustomBar)}
                        className="text-[10px] font-black text-emerald-700 hover:underline cursor-pointer"
                      >
                        {isCustomBar ? "Ver lista comercial" : "Ingresar personalizado"}
                      </button>
                    </div>

                    {!isCustomBar ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {COMMERCIAL_BARS.map((item, index) => {
                          const isSelected = barIndex === index;
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => setBarIndex(index)}
                              className={`py-2 px-1 rounded-xl border text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-slate-900 text-white border-slate-900 font-extrabold scale-[1.02] shadow-xs"
                                  : "bg-slate-100/70 text-slate-650 border-slate-200 hover:bg-slate-200/50"
                              }`}
                            >
                              <span className="text-xs block font-black">{item.diameterInch}</span>
                              <span className="text-[8.5px] text-slate-400 mt-0.5">{item.dbCm} cm</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="w-1/2">
                          <span className="text-[9px] uppercase font-bold text-slate-450 block mb-1">Diámetro Custom (cm)</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.1"
                            value={customDb}
                            onChange={(e) => setCustomDb(parseFloat(e.target.value) || 1.27)}
                            className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <div className="text-right text-[10px] text-slate-500 w-1/2 font-mono">
                          Equivale a aproximado: {(customDb / 2.54).toFixed(3)} pulgadas.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* F'C CONCRETE STRENGTH & FY STEEL YIELD STRENGTH IN MEGAPASCALS WITH SIDE KG/CM² AUTO-CONVERTER */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CONCRETE STRENGTH SECTION */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                          Resistencia Concreto ($f'_c$)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">Unidad: MPa (kg/cm²)</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Megapascals Direct Input */}
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            value={fc}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setFc(val);
                            }}
                            className="w-full bg-white border border-slate-250 rounded-xl pl-3 pr-9 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="MPa"
                          />
                          <div className="absolute right-2.5 top-2.5 text-[9px] uppercase tracking-wider text-slate-400 font-black pointer-events-none">
                            MPa
                          </div>
                        </div>
                        
                        {/* Kg/cm² Companion Input (Updates MPa on change) */}
                        <div className="relative w-[112px] shrink-0">
                          <input
                            type="number"
                            step="5"
                            min="10"
                            value={Math.round(fc * 10)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setFc(val / 10);
                            }}
                            className="w-full bg-emerald-50 border border-emerald-200 rounded-xl pl-2 pr-[48px] py-1.5 text-xs font-black text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="kg/cm²"
                          />
                          <div className="absolute right-2 top-2.5 text-[8px] text-emerald-600 font-black tracking-tighter pointer-events-none">
                            kg/cm²
                          </div>
                        </div>
                      </div>
                      
                      {/* Standard presets helper */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setFc(17.5)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${fc === 17.5 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          175 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => setFc(21)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${fc === 21 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          210 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => setFc(28)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${fc === 28 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          280 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => setFc(35)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${fc === 35 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          350 kg
                        </button>
                      </div>
                    </div>

                    {/* STEEL STRENGTH SECTION */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                          Fluencia Acero ($f_y$)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">Unidad: MPa (kg/cm²)</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Megapascals Direct Input */}
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="10"
                            min="10"
                            value={fy}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setFy(val);
                            }}
                            className="w-full bg-white border border-slate-250 rounded-xl pl-3 pr-9 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="MPa"
                          />
                          <div className="absolute right-2.5 top-2.5 text-[9px] uppercase tracking-wider text-slate-400 font-black pointer-events-none">
                            MPa
                          </div>
                        </div>
                        
                        {/* Kg/cm² Companion Input (Updates MPa on change) */}
                        <div className="relative w-[112px] shrink-0">
                          <input
                            type="number"
                            step="50"
                            min="100"
                            value={Math.round(fy * 10)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setFy(val / 10);
                            }}
                            className="w-full bg-emerald-50 border border-emerald-200 rounded-xl pl-2 pr-[48px] py-1.5 text-xs font-black text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="kg/cm²"
                          />
                          <div className="absolute right-2 top-2.5 text-[8px] text-emerald-600 font-black tracking-tighter pointer-events-none">
                            kg/cm²
                          </div>
                        </div>
                      </div>
                      
                      {/* Standard presets helper */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setFy(420)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${fy === 420 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          Grado 60 (4200 kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFy(280)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${fy === 280 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          Grado 40 (2800 kg)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION FACTOR PSI_T */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Ubicación del Refuerzo ($\psi_t$)
                    </label>
                    <select
                      value={psiT}
                      onChange={(e) => setPsiT(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <option value={1.3}>
                        Acero Superior • Más de 30cm de concreto fresco abajo de la barra (ψt = 1.3)
                      </option>
                      <option value={1.0}>
                        Otros • Columnas, zapatas, vigas inferiores o estribos comunes (ψt = 1.0)
                      </option>
                    </select>
                  </div>

                  {/* COATING FACTOR PSI_E */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Revestimiento / Tratamiento Adherente ($\psi_e$)
                    </label>
                    <select
                      value={psiE}
                      onChange={(e) => setPsiE(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <option value={1.0}>Sin recubrimiento / Barras comunes o galvanizadas (ψe = 1.0)</option>
                      <option value={1.2}>Revestimiento epóxico con recubrimiento &lt; 3db o espaciado libre &lt; 6db (ψe = 1.2)</option>
                      <option value={1.5}>Revestimiento epóxico en otras condiciones severas (ψe = 1.5)</option>
                    </select>
                  </div>

                  {/* CONFINEMENT FACTOR SECTION */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Condiciones de Confinamiento y Espaciamiento (E.060 Art. 12.2)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLdConfined(true)}
                        className={`py-2 px-2.5 rounded-xl border text-center text-[10.5px] leading-tight font-extrabold transition-all cursor-pointer ${
                          ldConfined
                            ? "bg-slate-905 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="block font-black">Estándar / Confinado</span>
                        <span className="block text-[8px] opacity-80 font-medium">Factores: 2.1 (≤3/4") / 1.7 (≥1")</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLdConfined(false)}
                        className={`py-2 px-2.5 rounded-xl border text-center text-[10.5px] leading-tight font-extrabold transition-all cursor-pointer ${
                          !ldConfined
                            ? "bg-slate-905 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="block font-black">Otros Casos / No Confinado</span>
                        <span className="block text-[8px] opacity-80 font-medium">Factores: 2.6 (≤3/4") / 2.1 (≥1")</span>
                      </button>
                    </div>
                  </div>

                  {/* EXPLANATORY ALERT */}
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-900 leading-normal flex gap-2">
                    <Info className="h-4 w-4 text-indigo-700 shrink-0" />
                    <div>
                      El Reglamento Nacional de Edificaciones (RNE E.060 Art. 12.2.4) limita el producto del factor de ubicación superior y el factor de epóxico a un valor máximo de 1.7. Es decir: <strong>(ψt × ψe) ≤ 1.7</strong>. En tus coeficientes da: 
                      <span className="font-extrabold ml-1 bg-white px-1 rounded border border-indigo-200">{(psiT * psiE).toFixed(2)}</span>.
                    </div>
                  </div>

                </div>
              </div>

              {/* DYNAMIC RESULTS PANEL (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                
                {/* CORE SUMMARY DISPLAY */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex-1 flex flex-col justify-between">
                  <div className="w-full space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest leading-none">
                      <span>Resultado Final</span>
                      <span className="bg-emerald-500/15 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/20">Norma E.060</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Longitud de desarrollo requerida ($l_d$):</p>
                  </div>

                  <div className="py-5 text-center">
                    <span className="block text-5xl font-black text-white font-mono tracking-tight">
                      {clampedLd.toFixed(1)} <span className="text-xl text-emerald-400">cm</span>
                    </span>
                    <span className="block text-xs font-mono text-slate-400 mt-1 uppercase font-bold">
                      = {(clampedLd / 100).toFixed(3)} metros
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3 text-[10px]">
                    <div className="flex justify-between text-slate-350">
                      <span>• Valor Calculado Directo:</span>
                      <span className="font-mono text-white font-black">{calculatedLd.toFixed(2)} cm</span>
                    </div>
                    
                    <div className="flex justify-between text-slate-350 items-center">
                      <span>• Límite Mínimo Normativo:</span>
                      <span className="font-mono text-emerald-400 font-black">30.00 cm</span>
                    </div>

                    <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between mt-2.5">
                      <span className="text-slate-400 font-medium">Diámetro empleado:</span>
                      <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {isCustomBar ? `${customDb.toFixed(2)} cm` : `${selectedBar.diameterInch} (${db.toFixed(3)} cm)`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ANCHORAGE AND HOOK SPECIAL ANALYSIS */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                    Ganchos y Anclajes Especiales (RNE / ACI)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* GANCHO 90° Ldh */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[9px] font-black text-slate-450 uppercase block">Gancho Estándar 90° (L_dh)</span>
                      <strong className="text-md font-black text-slate-800 font-mono block">{clampedLdh.toFixed(1)} cm</strong>
                      <span className="text-[8px] font-mono text-slate-400 block">Fórmula: [0.24 × fy / √f'c] × db</span>
                      <span className="text-[8.5px] text-emerald-600 font-bold block mt-1">Límite mín: {Math.max(15, 8 * db).toFixed(1)} cm</span>
                    </div>

                    {/* ANCLAJE DIRECTO la */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[9px] font-black text-slate-450 uppercase block">Desarrollo de Anclaje ($l_a$)</span>
                      <strong className="text-md font-black text-indigo-700 font-mono block">{clampedLa.toFixed(1)} cm</strong>
                      <span className="text-[8px] font-mono text-slate-400 block">Fórmula: [0.075 × fy / √f'c] × db</span>
                      <span className="text-[8.5px] text-emerald-600 font-bold block mt-1">Límite mín: 30.0 cm</span>
                    </div>
                  </div>
                </div>

                {/* GRAPHIC ILLUSTRATION VIEWPORT (SVG DYNAMIC DRAWER) */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2.5 flex items-center gap-1.5">
                    <GitCommit className="h-4.5 w-4.5 text-emerald-600" />
                    Simulación Visual de Anclaje
                  </h4>
                  
                  {/* BEAUTIFUL COMPACT SVG FOR STEEL STEEL ANCHORAGE */}
                  <div className="w-full bg-slate-50 rounded-xl border border-slate-150 p-2 text-center">
                    <svg viewBox="0 0 400 130" className="w-full h-auto">
                      {/* Concrete block */}
                      <rect x="130" y="20" width="250" height="90" rx="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                      {/* concrete pattern dots */}
                      <circle cx="160" cy="40" r="1.5" fill="#64748b" />
                      <circle cx="210" cy="80" r="1.5" fill="#64748b" />
                      <circle cx="310" cy="50" r="1.5" fill="#64748b" />
                      <circle cx="340" cy="90" r="1.5" fill="#64748b" />
                      <circle cx="250" cy="100" r="1.5" fill="#64748b" />
                      <circle cx="180" cy="70" r="3" fill="#94a3b8" />
                      <circle cx="280" cy="40" r="2.5" fill="#94a3b8" />
                      <circle cx="350" cy="65" r="3" fill="#94a3b8" />
                      
                      {/* Concrete Limit Label */}
                      <text x="250" y="105" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">Estuches de Concreto f'c</text>

                      {/* Steel Bar */}
                      {/* Ribbed rebar rendering bar */}
                      <line x1="20" y1="65" x2="350" y2="65" stroke="#334155" strokeWidth={Math.max(3, Math.min(10, db * 4))} strokeLinecap="round" />
                      {/* Ribbed markings on steel */}
                      <line x1="60" y1="60" x2="65" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="90" y1="60" x2="95" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="120" y1="60" x2="125" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="150" y1="60" x2="155" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="180" y1="60" x2="185" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="210" y1="60" x2="215" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="240" y1="60" x2="245" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="270" y1="60" x2="275" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="300" y1="60" x2="305" y2="70" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="330" y1="60" x2="335" y2="70" stroke="#1e293b" strokeWidth="1.5" />

                      {/* Line marking Ld */}
                      {/* Leader lines */}
                      <line x1="130" y1="20" x2="130" y2="105" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="350" y1="65" x2="350" y2="105" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
                      
                      {/* Double arrow for ld */}
                      <line x1="130" y1="100" x2="350" y2="100" stroke="#dc2626" strokeWidth="1.5" />
                      <polygon points="135,97 130,100 135,103" fill="#dc2626" />
                      <polygon points="345,97 350,100 345,103" fill="#dc2626" />

                      {/* Text label */}
                      <text x="240" y="93" fill="#dc2626" fontSize="10.5" fontWeight="black" textAnchor="middle">
                        ld = {clampedLd.toFixed(1)} cm
                      </text>

                      {/* Label of exposed part */}
                      <text x="75" y="45" fill="#334155" fontSize="9.5" fontWeight="bold" textAnchor="middle">Barra de Acero db</text>
                    </svg>
                    <span className="text-[9px] text-slate-400 mt-1 block font-medium uppercase font-mono">
                      La longitud de anclaje empotrado mínima garantiza la adherencia completa.
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* STEP-BY-STEP MATHEMATICAL DEDUCTION MEMORY */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 print:border print:shadow-none">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3.5">
                <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
                Memoria de Cálculo Técnico • Sustentación RNE
              </h3>

              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <p>
                  El Reglamento Nacional de Edificaciones (RNE) del Perú, en su Capítulo de Concreto Armado (Norma Técnica E.060, Artículo 12.2), regula la longitud mínima de desarrollo para barras sometidas a tracción. La ecuación simplificada depende directamente del diámetro del elemento metálico de de inserción (db):
                </p>

                {/* THE MATHEMATICAL FORMULAS DISPLAY BOX */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4.5 border border-slate-800 font-mono text-[11px] sm:text-xs">
                  <p className="text-emerald-400 font-bold mb-3 uppercase tracking-wider">// Criterios de Selección del Factor de Diámetro:</p>
                  
                  {/* SMALL BAR FORMULA */}
                  <div className={`p-3.5 rounded-lg border transition-all mb-3 ${isSmallBar ? "bg-slate-950 border-emerald-500/40 text-white" : "border-slate-800 text-slate-400"}`}>
                    <p className="font-extrabold flex items-center justify-between">
                      <span>• Para barras de 3/4" (1.905 cm) o menores:</span>
                      {isSmallBar && <span className="bg-emerald-600/20 text-emerald-400 px-1.5 rounded text-[9px]">Fórmula Aplicada</span>}
                    </p>
                    <div className="text-center py-3 my-1">
                      <span className="text-sm font-black text-slate-200 block">
                        {"l_d = [ ( f_y * ψ_t * ψ_e ) / ( 2.1 * √f'_c ) ] * d_b"}
                      </span>
                    </div>
                  </div>

                  {/* LARGE BAR FORMULA */}
                  <div className={`p-3.5 rounded-lg border transition-all ${!isSmallBar ? "bg-slate-950 border-emerald-500/40 text-white" : "border-slate-800 text-slate-400"}`}>
                    <p className="font-extrabold flex items-center justify-between">
                      <span>• Para barras de 1" (2.540 cm) o mayores:</span>
                      {!isSmallBar && <span className="bg-emerald-600/20 text-emerald-400 px-1.5 rounded text-[9px]">Fórmula Aplicada</span>}
                    </p>
                    <div className="text-center py-3 my-1">
                      <span className="text-sm font-black text-slate-200 block">
                        {"l_d = [ ( f_y * ψ_t * ψ_e ) / ( 1.7 * √f'_c ) ] * d_b"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DETAILED MATH SUBSTITUTION STEPS */}
                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-150 space-y-3 font-mono text-[11px]">
                  <p className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5 uppercase">Reemplazo Dinámico de Valores:</p>
                  
                  {/* STEP 1 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">1.</span>
                    <p>
                      <strong>Clasificación:</strong> Diámetro nominal d_b = {db.toFixed(3)} cm ({isCustomBar ? "Personalizado" : selectedBar.diameterInch}). Al ser{" "}
                      <span className="font-extrabold text-emerald-850 px-1 bg-white/80 rounded border border-slate-200">
                        {isSmallBar ? "menor o igual a 3/4\" (1.9 cm)" : "mayor de 3/4\" (1.9 cm)"}
                      </span>{" "}
                      corresponde aplicar un divisor constante de <span className="font-black underline">{denominatorCoeff}</span>.
                    </p>
                  </div>

                  {/* STEP 2 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">2.</span>
                    <p>
                      <strong>Coeficientes de Material:</strong> Fluencia de diseño f_y = {fy} MPa ({Math.round(fy * 10)} kg/cm²), resistencia del concreto de diseño f'_c = {fc} MPa ({Math.round(fc * 10)} kg/cm²) (por ende, √f'_c = {sqrtFc.toFixed(3)} MPa).
                    </p>
                  </div>

                  {/* STEP 3 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">3.</span>
                    <p>
                      <strong>Factores de Modificación:</strong> Ubicación superior ψ_t = {psiT}, revestimiento adherente ψ_e = {psiE}.
                    </p>
                  </div>

                  {/* STEP 4 */}
                  <div className="flex items-start gap-1 pb-1.5 border-b border-slate-200">
                    <span className="text-emerald-700 font-extrabold shrink-0">4.</span>
                    <p>
                      <strong>Ecuación de cálculo:</strong>
                      <span className="block mt-2 bg-white px-3 py-2 rounded border border-slate-200 text-center text-xs text-indigo-900 font-bold">
                        {`l_d = [ (${fy} * ${psiT} * ${psiE}) / (${denominatorCoeff} * ${sqrtFc.toFixed(3)}) ] * ${db.toFixed(3)}`}
                      </span>
                      <span className="block mt-1.5 text-center text-slate-600">
                        {`l_d = [ ${(fy * psiT * psiE).toFixed(1)} / ${(denominatorCoeff * sqrtFc).toFixed(3)} ] * ${db.toFixed(3)} = `}<strong>{calculatedLd.toFixed(2)} cm</strong>.
                      </span>
                    </p>
                  </div>

                  {/* STEP 5 */}
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">5.</span>
                    <p>
                      <strong>Criterio de Longitud Mínima:</strong> El reglamento determina que en ningún caso la longitud de desarrollo en tracción podrá ser menor que 30 cm.
                      <span className="block mt-2 text-slate-800 font-extrabold">
                        Resultado final de colocación en Obra: <span className="text-emerald-700 px-1 font-mono text-xs underline bg-white border border-slate-200 rounded">{clampedLd.toFixed(1)} cm</span>.
                      </span>
                    </p>
                  </div>
                </div>

                {/* COMPLEMENTARY FORMULAS PORTFOLIO FOR GANCHOS AND ANCLAJES */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4.5 border border-slate-800 font-mono text-[10.5px] mt-4 space-y-3.5">
                  <p className="text-emerald-400 font-bold uppercase tracking-wider">// Ecuaciones Complementarias de Gancho a 90° y Anclaje Directo (RNE E.060):</p>
                  
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                    <p className="font-extrabold text-white flex justify-between items-center">
                      <span>• Gancho Estándar a 90° (L_dh):</span>
                      <span className="bg-emerald-600/20 text-emerald-400 px-1.5 rounded text-[8.5px]">Cálculo Activo</span>
                    </p>
                    <div className="text-center py-2">
                      <span className="text-slate-200 font-bold block bg-slate-900 py-1 rounded">
                        {"L_dh = [ ( 0.24 * f_y ) / √f'_c ] * d_b"}
                      </span>
                    </div>
                    <p className="text-slate-450 text-[9.5px] leading-relaxed">
                      Sustitución en MPa: [ ( 0.24 * {fy} ) / {sqrtFc.toFixed(3)} ] * {db.toFixed(3)} = <strong>{calculatedLdh.toFixed(2)} cm</strong>.
                    </p>
                    <p className="text-slate-450 text-[9.5px] leading-relaxed">
                      Límite normativo mínimo: max(15 cm, 8 × d_b) = <strong>{Math.max(15, 8 * db).toFixed(1)} cm</strong>. 
                      Anclaje en gancho a 90° final: <strong className="text-emerald-400 font-black">{clampedLdh.toFixed(1)} cm</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                    <p className="font-extrabold text-white flex justify-between items-center">
                      <span>• Longitud de Anclaje Directo ($l_a$):</span>
                      <span className="bg-indigo-600/20 text-indigo-400 px-1.5 rounded text-[8.5px]">Cálculo Activo</span>
                    </p>
                    <div className="text-center py-2">
                      <span className="text-slate-200 font-bold block bg-slate-900 py-1 rounded">
                        {"l_a = [ ( 0.075 * f_y ) / √f'_c ] * d_b"}
                      </span>
                    </div>
                    <p className="text-slate-450 text-[9.5px] leading-relaxed">
                      Sustitución en MPa: [ ( 0.075 * {fy} ) / {sqrtFc.toFixed(3)} ] * {db.toFixed(3)} = <strong>{calculatedLa.toFixed(2)} cm</strong>.
                    </p>
                    <p className="text-slate-450 text-[9.5px] leading-relaxed">
                      Límite normativo mínimo en tracción ordinaria = <strong>30.0 cm</strong>.
                      Longitud de anclaje final sugerido: <strong className="text-indigo-400 font-black">{clampedLa.toFixed(1)} cm</strong> (desde la cara de la columna).
                    </p>
                  </div>
                </div>
                </div>

                {/* WARNING / SPECIFICATIONS LABELS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                  <div className="p-3.5 bg-slate-55 border border-slate-150 rounded-xl">
                    <span className="font-extrabold text-[10px] uppercase text-emerald-800 block mb-1">• Acero Superior (ψt = 1.3):</span>
                    Afecta a barras colocadas en vigas u otros elementos horizontales donde el concreto colocado fresco debajo del anclaje excede los 30 cm, aumentando la longitud requerida debido al atrapamiento de aire/agua.
                  </div>
                  <div className="p-3.5 bg-slate-55 border border-slate-150 rounded-xl">
                    <span className="font-extrabold text-[10px] uppercase text-emerald-800 block mb-1">• Factor de Recalificación Mínima (30 cm):</span>
                    Es un factor restrictivo de seguridad obligatorio. Aunque la fórmula matemática arroje 15 cm o 22 cm, constructivamente el anclaje mínimo normatizado inquebrantable siempre es de 30 cm.
                  </div>
                </div>

              </div>

            {/* PRINT OPTION ACTUATOR CARD */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir este reporte individual de cálculo?</h4>
                  <p className="text-[10px] text-slate-500">Se adapta de inmediato al formato A4 estándar para memoria descriptiva de ingeniería civil.</p>
                </div>
              </div>
              <button
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>

          </div>
        )}

        {selectedTemplate === "traslapes" && (
          <div className="space-y-6">
            
            {/* INPUT PANEL & RESULTS HERO PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
              
              {/* INPUT CONTROLS PANEL (7 cols) */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      MÓDULO 2 • NORMA E.060
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Empalmes y Traslapes de Acero
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer valores por defecto"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* SELECT LAP TYPE (TRACCIÓN O COMPRESIÓN) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                      Tipo de Esfuerzo en el Sifón/Empalme
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLapType("traccion")}
                        className={`py-2 px-3 rounded-xl border text-center text-xs font-extrabold transition-all cursor-pointer ${
                          lapType === "traccion"
                            ? "bg-slate-905 text-white border-slate-900 shadow-xs scale-101"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-101"
                        }`}
                      >
                        Tracción (Tension)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLapType("compresion")}
                        className={`py-2 px-3 rounded-xl border text-center text-xs font-extrabold transition-all cursor-pointer ${
                          lapType === "compresion"
                            ? "bg-slate-905 text-white border-slate-900 shadow-xs scale-101"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-101"
                        }`}
                      >
                        Compresión (Compression)
                      </button>
                    </div>
                  </div>

                  {/* SPLICING CLASS (TENSION ONLY) */}
                  {lapType === "traccion" && (
                    <div className="space-y-1.5 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                      <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        Clasificación del Traslape (Norma E.060 Art. 12.15)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLapTensionClass("clase_a")}
                          className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                            lapTensionClass === "clase_a"
                              ? "bg-white border-indigo-500 text-indigo-900 font-bold shadow-xs"
                              : "bg-slate-50/55 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="block text-[9.5px] font-black text-indigo-600 uppercase">Clase A (lst = 1.0 × ld)</span>
                          <span className="block text-[8.5px] text-slate-500 font-medium leading-tight mt-0.5">
                            As/prov ≥ 2 × As/req, y se traslapa el 50% o menos del acero.
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLapTensionClass("clase_b")}
                          className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                            lapTensionClass === "clase_b"
                              ? "bg-white border-indigo-500 text-indigo-900 font-bold shadow-xs"
                              : "bg-slate-50/55 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="block text-[9.5px] font-black text-indigo-600 uppercase">Clase B (lst = 1.3 × ld)</span>
                          <span className="block text-[8.5px] text-slate-500 font-medium leading-tight mt-0.5">
                            Condición estándar de seguridad. Se traslapa más del 50% del acero.
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BAR 1 DIAMETER SELECTOR */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        {useDifferentDiameters ? "Diámetro de Barra Mayor (db1)" : "Diámetro de la Barra de Acero (db)"}
                      </label>
                      <button
                        onClick={() => setLapIsCustomBar(!lapIsCustomBar)}
                        className="text-[10px] font-black text-indigo-700 hover:underline cursor-pointer"
                      >
                        {lapIsCustomBar ? "Ver lista comercial" : "Ingresar personalizado"}
                      </button>
                    </div>

                    {!lapIsCustomBar ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {COMMERCIAL_BARS.map((item, index) => {
                          const isSelected = lapBarIndex === index;
                          return (
                            <button
                              key={`lap1-${item.name}`}
                              type="button"
                              onClick={() => setLapBarIndex(index)}
                              className={`py-2 px-1 rounded-xl border text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-slate-900 text-white border-slate-900 font-extrabold scale-[1.02] shadow-xs"
                                  : "bg-slate-100/70 text-slate-650 border-slate-200 hover:bg-slate-200/50"
                              }`}
                            >
                              <span className="text-xs block font-black">{item.diameterInch}</span>
                              <span className="text-[8.5px] text-slate-400 mt-0.5">{item.dbCm} cm</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="w-1/2">
                          <span className="text-[9px] uppercase font-bold text-slate-450 block mb-1">Diámetro Custom (cm)</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.1"
                            value={lapCustomDb}
                            onChange={(e) => setLapCustomDb(parseFloat(e.target.value) || 1.27)}
                            className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <div className="text-right text-[10px] text-slate-500 w-1/2 font-mono">
                          Equivale a aproximado: {(lapCustomDb / 2.54).toFixed(3)} pulgadas.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DIFFERENT DIAMETERS TOGGLE CHECKBOX */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-black text-slate-800 block">Diferentes Diámetros</span>
                      <span className="text-[9.5px] text-slate-500 block leading-tight">
                        Empalmar varillas de distinto espesor (Norma E.060 Art. 12.16.2)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={useDifferentDiameters}
                        onChange={(e) => setUseDifferentDiameters(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>

                  {/* BAR 2 DIAMETER SELECTOR */}
                  {useDifferentDiameters && (
                    <div className="space-y-2 p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl animate-fade-in">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                          Diámetro de Barra Menor (db2)
                        </label>
                        <button
                          onClick={() => setLapIsCustomBar2(!lapIsCustomBar2)}
                          className="text-[10px] font-black text-indigo-700 hover:underline cursor-pointer"
                        >
                          {lapIsCustomBar2 ? "Ver lista comercial" : "Ingresar personalizado"}
                        </button>
                      </div>

                      {!lapIsCustomBar2 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {COMMERCIAL_BARS.map((item, index) => {
                            const isSelected = lapBarIndex2 === index;
                            return (
                              <button
                                key={`lap2-${item.name}`}
                                type="button"
                                onClick={() => setLapBarIndex2(index)}
                                className={`py-2 px-1 rounded-xl border text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-slate-900 text-white border-slate-900 font-extrabold scale-[1.02] shadow-xs"
                                    : "bg-white text-slate-650 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <span className="text-xs block font-black">{item.diameterInch}</span>
                                <span className="text-[8.5px] text-slate-400 mt-0.5">{item.dbCm} cm</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                          <div className="w-1/2">
                            <span className="text-[9px] uppercase font-bold text-slate-450 block mb-1">Diámetro Custom (db2 cm)</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.1"
                              value={lapCustomDb2}
                              onChange={(e) => setLapCustomDb2(parseFloat(e.target.value) || 0.953)}
                              className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs font-bold"
                            />
                          </div>
                          <div className="text-right text-[10px] text-slate-500 w-1/2 font-mono">
                            Equivale a aproximado: {(lapCustomDb2 / 2.54).toFixed(3)} pulgadas.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* F'C CONCRETE STRENGTH & FY STEEL YIELD STRENGTH WITH COMPANION AUTOMATIC DUAL-CONVERSION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CONCRETE STRENGTH SECTION */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                          Resistencia Concreto ($f'_c$)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">Unidad: MPa (kg/cm²)</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Megapascals Direct Input */}
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            value={lapFc}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setLapFc(val);
                            }}
                            className="w-full bg-white border border-slate-250 rounded-xl pl-3 pr-9 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="MPa"
                          />
                          <div className="absolute right-2.5 top-2.5 text-[9px] uppercase tracking-wider text-slate-400 font-black pointer-events-none">
                            MPa
                          </div>
                        </div>
                        
                        {/* Kg/cm² Companion Input (Updates MPa on change) */}
                        <div className="relative w-[112px] shrink-0">
                          <input
                            type="number"
                            step="5"
                            min="10"
                            value={Math.round(lapFc * 10)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setLapFc(val / 10);
                            }}
                            className="w-full bg-emerald-50 border border-emerald-250 rounded-xl pl-2 pr-[48px] py-1.5 text-xs font-black text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="kg/cm²"
                          />
                          <div className="absolute right-2 top-2.5 text-[8px] text-emerald-600 font-black tracking-tighter pointer-events-none">
                            kg/cm²
                          </div>
                        </div>
                      </div>
                      
                      {/* Standard presets helper */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setLapFc(17.5)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${lapFc === 17.5 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          175 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => setLapFc(21)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${lapFc === 21 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          210 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => setLapFc(28)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${lapFc === 28 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          280 kg
                        </button>
                        <button
                          type="button"
                          onClick={() => setLapFc(35)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${lapFc === 35 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          350 kg
                        </button>
                      </div>
                    </div>

                    {/* STEEL STRENGTH SECTION */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                          Fluencia Acero ($f_y$)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">Unidad: MPa (kg/cm²)</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Megapascals Direct Input */}
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="10"
                            min="10"
                            value={lapFy}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setLapFy(val);
                            }}
                            className="w-full bg-white border border-slate-250 rounded-xl pl-3 pr-9 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="MPa"
                          />
                          <div className="absolute right-2.5 top-2.5 text-[9px] uppercase tracking-wider text-slate-400 font-black pointer-events-none">
                            MPa
                          </div>
                        </div>
                        
                        {/* Kg/cm² Companion Input (Updates MPa on change) */}
                        <div className="relative w-[112px] shrink-0">
                          <input
                            type="number"
                            step="50"
                            min="100"
                            value={Math.round(lapFy * 10)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setLapFy(val / 10);
                            }}
                            className="w-full bg-emerald-50 border border-emerald-200 rounded-xl pl-2 pr-[48px] py-1.5 text-xs font-black text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="kg/cm²"
                          />
                          <div className="absolute right-2 top-2.5 text-[8px] text-emerald-600 font-black tracking-tighter pointer-events-none">
                            kg/cm²
                          </div>
                        </div>
                      </div>
                      
                      {/* Standard presets helper */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setLapFy(420)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${lapFy === 420 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          Grado 60 (4200 kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLapFy(280)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${lapFy === 280 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                        >
                          Grado 40 (2800 kg)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SPLICING IN BUNDLES (PAQUETES DE BARRAS) Art. 12.14.2.2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Configuración del Paquete de Barras (RNE Art. 12.14.2)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setLapBundleCount(1)}
                        className={`py-1.5 px-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          lapBundleCount === 1
                            ? "bg-slate-900 text-white border-slate-900 font-extrabold"
                            : "bg-slate-55 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => setLapBundleCount(3)}
                        className={`py-1.5 px-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          lapBundleCount === 3
                            ? "bg-slate-900 text-white border-slate-900 font-extrabold"
                            : "bg-slate-55 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Paquete 3 (+20%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLapBundleCount(4)}
                        className={`py-1.5 px-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          lapBundleCount === 4
                            ? "bg-slate-900 text-white border-slate-900 font-extrabold"
                            : "bg-slate-55 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Paquete 4 (+33%)
                      </button>
                    </div>
                  </div>

                  {/* TENSION FACTORS PSI_T & PSI_E (ONLY VALID FOR TENSION CALCULATIONS) */}
                  {lapType === "traccion" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* LOCATION FACTOR PSI_T */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                          Ubicación Refuerzo ($\psi_t$)
                        </label>
                        <select
                          value={lapPsiT}
                          onChange={(e) => setLapPsiT(parseFloat(e.target.value))}
                          className="w-full bg-slate-55 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                        >
                          <option value={1.3}>Superior &gt; 30cm concreto fresco (ψt = 1.3)</option>
                          <option value={1.0}>Otros e inferiores (ψt = 1.0)</option>
                        </select>
                      </div>

                      {/* COATING FACTOR PSI_E */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                          Revestimiento ($\psi_e$)
                        </label>
                        <select
                          value={lapPsiE}
                          onChange={(e) => setLapPsiE(parseFloat(e.target.value))}
                          className="w-full bg-slate-55 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                        >
                          <option value={1.0}>Sin recubrimiento / galvanizado (ψe = 1.0)</option>
                          <option value={1.2}>Epóxico con recubrimiento &lt; 3db (ψe = 1.2)</option>
                          <option value={1.5}>Severo epóxico tracción (ψe = 1.5)</option>
                        </select>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* DYNAMIC RESULTS PANEL (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                
                {/* CORE L_ST / L_SC SUMMARY DISPLAY */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex-1 flex flex-col justify-between">
                  <div className="w-full space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest leading-none">
                      <span>Longitud de Empalme</span>
                      <span className="bg-emerald-500/15 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/20">Norma E.060</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                      {lapType === "traccion" ? "Traslape por Tracción requerido (lst):" : "Traslape por Compresión requerido (lsc):"}
                    </p>
                  </div>

                  <div className="py-5 text-center">
                    <span className="block text-5.55xl font-black text-white font-mono tracking-tight text-emerald-400">
                      {clampedLap.toFixed(1)} <span className="text-xl text-white">cm</span>
                    </span>
                    <span className="block text-xs font-mono text-slate-400 mt-1 uppercase font-bold">
                      = {(clampedLap / 100).toFixed(3)} metros
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3 text-[10px]">
                    <div className="flex justify-between text-slate-350">
                      <span>• Valor Base Calculado:</span>
                      <span className="font-mono text-white font-black">{finalLapCalculated.toFixed(2)} cm</span>
                    </div>
                    
                    {lapType === "traccion" && (
                      <div className="flex justify-between text-slate-350">
                        <span>• Desarrollo Mayor ($l_d$):</span>
                        <span className="font-mono text-slate-200">{ldLarger.toFixed(2)} cm</span>
                      </div>
                    )}

                    {lapType === "compresion" && (
                      <div className="flex justify-between text-slate-350">
                        <span>• Fórmula Directa Compresión:</span>
                        <span className="font-mono text-slate-200">{lscDirect.toFixed(2)} cm</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-350 items-center">
                      <span>• Límite Mínimo Normativo:</span>
                      <span className="font-mono text-emerald-400 font-black">30.00 cm</span>
                    </div>

                    {isLowStrengthConcrete && lapType === "compresion" && (
                      <div className="flex justify-between text-amber-300 font-extrabold bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30">
                        <span>• Concreto Baja Resistencia:</span>
                        <span>x 1.33</span>
                      </div>
                    )}

                    {lapBundleCount > 1 && (
                      <div className="flex justify-between text-emerald-300 font-extrabold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                        <span>• Coeficiente por Paquete:</span>
                        <span>x {bundleMultiplier.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 flex flex-col gap-1 mt-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Barra principal {useDifferentDiameters && "(Mayor)"}:</span>
                        <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                          {largerBarLabel} ({largerDb.toFixed(3)} cm)
                        </strong>
                      </div>
                      
                      {useDifferentDiameters && (
                        <div className="flex items-center justify-between border-t border-slate-800/40 pt-1 mt-1">
                          <span className="text-slate-400 font-medium">Barra secundaria (Menor):</span>
                          <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                            {smallerBarLabel} ({smallerDb.toFixed(3)} cm)
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* GRAPHIC ILLUSTRATION VIEWPORT FOR SPLICE */}
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                    <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
                    Detalle Visual de Empalme por Traslape
                  </h4>
                  
                  <div className="w-full bg-slate-50 rounded-xl border border-slate-150 p-2 text-center">
                    <svg viewBox="0 0 420 140" className="w-full h-auto">
                      {/* Concrete block */}
                      <rect x="15" y="15" width="390" height="110" rx="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                      {/* concrete pattern dots */}
                      <circle cx="210" cy="80" r="1.5" fill="#64748b" />
                      <circle cx="340" cy="90" r="1.5" fill="#64748b" />
                      
                      {/* Spliced Bar 1 (Top Left entering) */}
                      <line 
                        x1="20" 
                        y1="48" 
                        x2="280" 
                        y2="48" 
                        stroke="#334155" 
                        strokeWidth={Math.max(3.5, Math.min(11, largerDb * 4))} 
                        strokeLinecap="round" 
                      />
                      {/* Ribs for Bar 1 */}
                      <line x1="50" y1="43" x2="55" y2="53" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="90" y1="43" x2="95" y2="53" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="130" y1="43" x2="135" y2="53" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="170" y1="43" x2="175" y2="53" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="210" y1="43" x2="215" y2="53" stroke="#1e293b" strokeWidth="1.5" />
                      <line x1="250" y1="43" x2="255" y2="53" stroke="#1e293b" strokeWidth="1.5" />

                      {/* Spliced Bar 2 (Bottom Right entering) */}
                      <line 
                        x1="140" 
                        y1="72" 
                        x2="400" 
                        y2="72" 
                        stroke="#475569" 
                        strokeWidth={Math.max(2.5, Math.min(10, smallerDb * 4))} 
                        strokeLinecap="round" 
                      />
                      {/* Ribs for Bar 2 */}
                      <line x1="160" y1="67" x2="165" y2="77" stroke="#334155" strokeWidth="1.5" />
                      <line x1="200" y1="67" x2="205" y2="77" stroke="#334155" strokeWidth="1.5" />
                      <line x1="240" y1="67" x2="245" y2="77" stroke="#334155" strokeWidth="1.5" />
                      <line x1="280" y1="67" x2="285" y2="77" stroke="#334155" strokeWidth="1.5" />
                      <line x1="320" y1="67" x2="325" y2="77" stroke="#334155" strokeWidth="1.5" />
                      <line x1="360" y1="67" x2="365" y2="77" stroke="#334155" strokeWidth="1.5" />

                      {/* Overlap dimension markers (lst / lsc) */}
                      <line x1="140" y1="20" x2="140" y2="110" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="280" y1="20" x2="280" y2="110" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />

                      {/* Double-headed arrow indicator */}
                      <line x1="140" y1="102" x2="280" y2="102" stroke="#dc2626" strokeWidth="1.5" />
                      <polygon points="145,99 140,102 145,105" fill="#dc2626" />
                      <polygon points="275,99 280,102 275,105" fill="#dc2626" />

                      {/* Overlap Text */}
                      <text x="210" y="95" fill="#dc2626" fontSize="10.5" fontWeight="black" textAnchor="middle">
                        Overlap = {clampedLap.toFixed(1)} cm
                      </text>

                      {/* Labels for bars */}
                      <text x="75" y="38" fill="#1e293b" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                        Varilla 1: {largerBarLabel}
                      </text>
                      <text x="340" y="85" fill="#334155" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                        Varilla 2: {useDifferentDiameters ? smallerBarLabel : largerBarLabel}
                      </text>
                    </svg>
                    
                    <span className="text-[9px] text-slate-400 mt-1 block font-medium uppercase font-mono">
                      La longitud de solape garantiza la transmisión de esfuerzos por adherencia superficial.
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* STEP-BY-STEP MATHEMATICAL DEDUCTION MEMORY FOR TRASLAPES */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 print:border print:shadow-none">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3.5">
                <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
                Memoria de Cálculo Técnico • Sustentación RNE E.060
              </h3>

              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <p>
                  El Reglamento Nacional de Edificaciones (RNE) del Perú, en su Norma Técnica E.060 (Capítulo 12.14, 12.15, 12.16), define detalladamente los traslapes de barras según el tipo de esfuerzo sometido: Tracción o Compresión.
                </p>

                {/* SHUTTLE FOR FORMULAS TO COMPUTE FOR BOTH TENSION / COMPRESSION */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4.5 border border-slate-800 font-mono text-[11px] sm:text-xs space-y-4">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider">// 1. Criterio de Empalme en Tracción (Art. 12.15):</span>
                    <p className="text-slate-400 leading-normal pl-3">
                      La longitud del traslape en tracción depende de la longitud de desarrollo ld modificada por la clase de empalme:
                    </p>
                    <ul className="list-disc list-inside pl-6 text-slate-350 space-y-1 mt-1 text-[10.5px]">
                      <li><strong className="text-slate-200">Clase A:</strong> l_st = 1.0 × ld (Mínimo absoluto: 30 cm)</li>
                      <li><strong className="text-slate-200">Clase B:</strong> l_st = 1.3 × ld (Mínimo absoluto: 30 cm)</li>
                    </ul>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider">// 2. Criterio de Empalme en Compresión (Art. 12.16):</span>
                    <p className="text-slate-400 leading-normal pl-3">
                      Regido por el límite de fluencia fy (kg/cm²) y el diámetro de la barra db:
                    </p>
                    <ul className="list-disc list-inside pl-6 text-slate-350 space-y-1 mt-1 text-[10.5px]">
                      <li>Para fy ≤ 4200 kg/cm²: l_sc = 0.007 × fy × db (para un acero típico da exactamente 29.4 × db)</li>
                      <li>Para fy &gt; 4200 kg/cm²: l_sc = (0.013 × fy - 24) × db</li>
                      <li><strong className="text-slate-200">Condición para Concretos de Baja Resistencia (f'c &lt; 210 kg/cm²):</strong> Incrementar el traslape calculado multiplicando por un factor de 1.33.</li>
                      <li>Mínimo absoluto inquebrantable: 30 cm.</li>
                    </ul>
                  </div>
                </div>

                {/* STEP-BY-STEP CALCULATION PROGRESSION */}
                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-150 space-y-3 font-mono text-[11px]">
                  <p className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5 uppercase">Reemplazo Dinámico de Valores:</p>
                  
                  {/* STEP 1 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">1.</span>
                    <p>
                      <strong>Dimensiones de Barras:</strong> Varilla principal d_b = {db1.toFixed(3)} cm ({largerBarLabel}){useDifferentDiameters && ` y acoplada d_b2 = ${db2.toFixed(3)} cm (${smallerBarLabel})`}. El diámetro mayor para cálculo de desarrollo es <strong>{largerDb.toFixed(3)} cm</strong> y el menor para compresión es <strong>{smallerDb.toFixed(3)} cm</strong>.
                    </p>
                  </div>

                  {/* STEP 2 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">2.</span>
                    <p>
                      <strong>Materiales:</strong> Concreto f'_c = {lapFc} MPa ({Math.round(lapFc * 10)} kg/cm²) donde √f'_c = {largerSqrtFc.toFixed(3)}. Fluencia Acero f_y = {lapFy} MPa ({Math.round(lapFy * 10)} kg/cm²).
                    </p>
                  </div>

                  {/* STEP 3 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">3.</span>
                    <p>
                      <strong>Longitud de Desarrollo de referencia ($l_d$):</strong> Se calcula para la varilla de mayor diámetro con los factores ψ_t={lapPsiT} y ψ_e={lapPsiE}, resultando $l_d = [({lapFy} \times {lapPsiT} \times {lapPsiE}) / ({largerDenominator} \times {largerSqrtFc.toFixed(3)})] \times {largerDb.toFixed(3)} =$ <strong>{ldLarger.toFixed(2)} cm</strong>.
                    </p>
                  </div>

                  {/* STEP 4 */}
                  <div className="flex items-start gap-1 pb-1 border-b border-slate-200">
                    <span className="text-emerald-700 font-extrabold shrink-0">4.</span>
                    <div className="space-y-1">
                      <p>
                        <strong>Criterio de Empalme ({lapType === "traccion" ? "Tracción" : "Compresión"}):</strong>
                      </p>
                      {lapType === "traccion" ? (
                        <div className="text-slate-650 bg-white p-2.5 rounded border border-slate-200 space-y-1">
                          <p>Se aplica traslape {lapTensionClass === "clase_a" ? "Clase A (1.0 × ld)" : "Clase B (1.3 × ld)"}.</p>
                          <span className="block mt-1 text-slate-900 font-semibold text-[11.5px]">
                            {`lst = ${tensionMultiplier} × ${ldLarger.toFixed(2)} cm = `}<strong>{(ldLarger * tensionMultiplier).toFixed(2)} cm</strong>.
                          </span>
                          {useDifferentDiameters && (
                            <span className="block text-[10px] text-indigo-700 font-bold mt-1.5 bg-indigo-50/50 p-1.5 rounded">
                              * Diferentes diámetros: Se compara el l_st calculado de la barra mayor ({lapTensionBase.toFixed(2)} cm) con el l_sc de compresión de la barra más pequeña ({lapCompressionBase.toFixed(2)} cm), tomando el mayor de ambos: <strong>{Math.max(lapTensionBase, lapCompressionBase).toFixed(2)} cm</strong>.
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-650 bg-white p-2.5 rounded border border-slate-200">
                          {fyKgCm2 <= 4200 ? (
                            <span>Fórmula ≤ 4200: $0.007 \times f_y \times d_b = 0.007 \times 4200 \times {smallerDb.toFixed(3)} =$ <strong>{lscDirect.toFixed(2)} cm</strong>.</span>
                          ) : (
                            <span>Fórmula &gt; 4200: $(0.013 \times {fyKgCm2} - 24) \times {smallerDb.toFixed(3)} =$ <strong>{lscDirect.toFixed(2)} cm</strong>.</span>
                          )}
                          {isLowStrengthConcrete && (
                            <span className="block mt-1 font-bold text-amber-800">
                              * f'c Baja Resistencia (f'c &lt; 210 kg/cm²): {lscDirect.toFixed(2)} cm × 1.33 = {lscWithConcreteCorrection.toFixed(2)} cm.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 5 */}
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">5.</span>
                    <p>
                      <strong>Coeficiente de Paquetes y Límite Mínimo:</strong> Con factor multiplicador de paquete por valor de xl = {bundleMultiplier}. Multiplicando da {(finalLapCalculated * bundleMultiplier).toFixed(2)} cm. Finalmente se compara con el límite mínimo del Reglamento que es de <span className="font-bold underline">30 cm</span>.
                      <span className="block mt-2 text-slate-800 font-black text-xs animate-pulse">
                        Longitud de Traslape definitiva en obra: <span className="text-emerald-700 px-1.5 py-0.5 bg-white border border-slate-200 rounded">{clampedLap.toFixed(1)} cm</span>.
                      </span>
                    </p>
                  </div>
                </div>

                {/* RNE EXPLANATION WARNS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-950">
                    <span className="font-extrabold text-[10px] uppercase text-rose-800 block mb-1">🚫 Prohibición de Ganchos Estándar:</span>
                    La Norma Técnica E.060 prohíbe tajantemente el uso de ganchos estándar para terminar o complementar empalmes por traslape en tracción. La longitud de adherencia calculada debe ser siempre puramente recta y continua.
                  </div>
                  <div className="p-3.5 bg-slate-55 border border-slate-150 rounded-xl">
                    <span className="font-extrabold text-[10px] uppercase text-indigo-950 block mb-1">⚖️ Diferencia de Diámetro en Tracción:</span>
                    Si acoplas barras de diferentes espesores en tracción, se calcula el traslape como si fuesen de la misma sección mayor, excepto si se verifica la compresión de la varilla menor. Es una medida preventiva contra fallas cortantes en el nudo de traslape.
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION ACTUATOR CARD FOR TRASLAPES */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte para traslapes?</h4>
                  <p className="text-[10px] text-slate-500">Formateado con parámetros de la Norma E.060 del Perú en tamaño A4 internacional.</p>
                </div>
              </div>
              <button
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>

          </div>
        )}

        {selectedTemplate === "cuantia" && (
          <div className="space-y-6" id="cuantia-panel-viewport">
            
            {/* WORKBENCH WORK AREA */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUTS PANEL (7 cols) */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="cuantia-input-section">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span id="label-subtitulo-cuantia" className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 3
                    </span>
                    <h2 id="heading-template-cuantia" className="text-sm font-black text-slate-800 uppercase mt-1">
                      Cuantía de Acero en Vigas (RNE E.060)
                    </h2>
                  </div>
                  <button
                    id="btn-reset-cuantia"
                    onClick={handleReset}
                    title="Restablecer valores por defecto"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  
                  {/* GEOMETRIC DATA FOR THE CROSS-SECTION */}
                  <div className="space-y-3" id="geom-section">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                      Geometría de la Sección Transversal
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="input-ratioB" className="text-[11px] font-bold text-slate-650 block">Ancho b (m)</label>
                          <span className="text-[9px] font-mono text-slate-400">({(ratioB * 100).toFixed(0)} cm)</span>
                        </div>
                        <input
                          id="input-ratioB"
                          type="number"
                          step="0.01"
                          min="0.10"
                          max="2.00"
                          value={ratioB}
                          onChange={(e) => setRatioB(parseFloat(e.target.value) || 0.30)}
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="input-ratioH" className="text-[11px] font-bold text-slate-650 block">Alto h (m)</label>
                          <span className="text-[9px] font-mono text-slate-400">({(ratioH * 100).toFixed(0)} cm)</span>
                        </div>
                        <input
                          id="input-ratioH"
                          type="number"
                          step="0.01"
                          min="0.15"
                          max="3.00"
                          value={ratioH}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.50;
                            setRatioH(val);
                            setRatioD(parseFloat((val - ratioRecubrimiento).toFixed(3)));
                          }}
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="input-ratioRecubrimiento" className="text-[11px] font-bold text-slate-650 block">Recubrimiento r (m)</label>
                          <span className="text-[9px] font-mono text-slate-400">({(ratioRecubrimiento * 100).toFixed(1)} cm)</span>
                        </div>
                        <input
                          id="input-ratioRecubrimiento"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="0.25"
                          value={ratioRecubrimiento}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.04;
                            setRatioRecubrimiento(val);
                            setRatioD(parseFloat((ratioH - val).toFixed(3)));
                          }}
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="bg-indigo-50/55 p-2.5 rounded-xl border border-indigo-100 flex justify-between items-center text-[11px]">
                      <span className="text-slate-600 font-medium">Peralte Efectivo Calculado (d = h - r):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-mono text-slate-400">({(ratioD * 100).toFixed(1)} cm)</span>
                        <input
                          id="input-ratioD"
                          type="number"
                          step="0.01"
                          min="0.10"
                          value={ratioD}
                          onChange={(e) => setRatioD(parseFloat(e.target.value) || 0.46)}
                          className="w-20 bg-white border border-indigo-250 rounded-md px-2 py-0.5 text-center text-xs font-black text-indigo-900"
                        />
                        <span className="text-indigo-950 font-bold font-mono">m</span>
                      </div>
                    </div>
                  </div>

                  {/* STEEL DESIGN PREVAILED OR ASSISTANT */}
                  <div className="space-y-3" id="steel-area-selector-section">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-900"></span>
                        Área de Refuerzo de Acero (As)
                      </h4>
                      <button
                        id="toggle-assistant-btn"
                        onClick={() => setAssistantActive(!assistantActive)}
                        className="text-[10px] font-black text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {assistantActive ? "Ingresar As manual" : "Usar Asistente de Varillas 💡"}
                      </button>
                    </div>

                    {!assistantActive ? (
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 block">Área de Acero colocada (As):</span>
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <input
                              id="input-direct-ratioAs"
                              type="number"
                              step="0.01"
                              min="0.1"
                              value={ratioAs}
                              onChange={(e) => setRatioAs(parseFloat(e.target.value) || 5.08)}
                              className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800"
                            />
                            <div className="absolute right-3 top-2 text-[10px] font-black text-slate-400">cm²</div>
                          </div>
                          <div className="text-[10px] text-slate-450 leading-tight w-2/5 font-mono">
                            Equivalencias:<br />
                            • 2 varillas de 5/8" ≈ 4.0 cm²<br />
                            • 4 varillas de 1/2" ≈ 5.16 cm²
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/40 p-4.5 rounded-2xl border border-emerald-100 space-y-3.5" id="assistant-container">
                        <div className="text-[10.5px] text-emerald-950 bg-emerald-500/10 p-2 rounded-lg font-medium">
                          <strong>Asistente Activo:</strong> Seleccione las varillas comerciales del plano peruano para calcular el área total (As) acumulada automáticamente.
                        </div>

                        {/* LINE/GROUP 1 */}
                        <div className="grid grid-cols-12 gap-2.5 items-center">
                          <div className="col-span-3 text-[10.5px] font-bold text-slate-600 font-mono">Grupo A:</div>
                          <div className="col-span-4">
                            <select
                              id="select-assistant-bar1"
                              value={assistantBarIndex1}
                              onChange={(e) => setAssistantBarIndex1(parseInt(e.target.value))}
                              className="w-full bg-white border border-slate-250 rounded-lg text-[11px] p-1.5 font-bold cursor-pointer"
                            >
                              {COMMERCIAL_BARS.map((bar, i) => (
                                <option key={`as1-${bar.name}`} value={i}>
                                  {bar.diameterInch} ({bar.areaCm2} cm²)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-1 text-center font-bold text-slate-400 text-xs">×</div>
                          <div className="col-span-4 flex items-center gap-1.5">
                            <input
                              id="input-qty1"
                              type="number"
                              min="0"
                              max="30"
                              value={assistantQty1}
                              onChange={(e) => setAssistantQty1(parseInt(e.target.value) || 0)}
                              className="w-16 bg-white border border-slate-250 rounded-lg text-center text-xs font-black p-1.5"
                            />
                            <span className="text-[10px] text-slate-400">Pzas</span>
                          </div>
                        </div>

                        {/* LINE/GROUP 2 */}
                        <div className="grid grid-cols-12 gap-2.5 items-center pt-1">
                          <div className="col-span-3 text-[10.5px] font-bold text-slate-600 font-mono">Grupo B:</div>
                          <div className="col-span-4">
                            <select
                              id="select-assistant-bar2"
                              value={assistantBarIndex2}
                              onChange={(e) => setAssistantBarIndex2(parseInt(e.target.value))}
                              className="w-full bg-white border border-slate-250 rounded-lg text-[11px] p-1.5 font-bold cursor-pointer"
                            >
                              {COMMERCIAL_BARS.map((bar, i) => (
                                <option key={`as2-${bar.name}`} value={i}>
                                  {bar.diameterInch} ({bar.areaCm2} cm²)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-1 text-center font-bold text-slate-400 text-xs">×</div>
                          <div className="col-span-4 flex items-center gap-1.5">
                            <input
                              id="input-qty2"
                              type="number"
                              min="0"
                              max="30"
                              value={assistantQty2}
                              onChange={(e) => setAssistantQty2(parseInt(e.target.value) || 0)}
                              className="w-16 bg-white border border-slate-250 rounded-lg text-center text-xs font-black p-1.5"
                            />
                            <span className="text-[10px] text-slate-400">Pzas</span>
                          </div>
                        </div>

                        {/* RESULT IN REAL-TIME FOR THE ASSISTANT */}
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex justify-between items-center text-[11px] font-mono">
                          <span className="text-slate-600">Área Acumulada Calculada:</span>
                          <span className="text-emerald-800 font-extrabold text-sm bg-emerald-55 px-2 py-0.5 rounded border border-emerald-100">
                            As = {calculatedAsFromAssistant.toFixed(2)} cm²
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DESIGN CRITERIA & MATERIAL SELECTIONS */}
                  <div className="space-y-3" id="material-criteria-section">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                      Resistencias de Materiales e Hipótesis
                    </h4>

                    {/* F'C CONCRETE STRENGTH & FY STEEL YIELD STRENGTH */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Concrete Strength */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="input-ratioFc-mpa" className="text-[11.5px] font-bold text-slate-700">Resistencia del Concreto (f'c)</label>
                          <span className="text-[9px] font-mono text-slate-400">MPa (kg/cm²)</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              id="input-ratioFc-mpa"
                              type="number"
                              step="0.1"
                              min="1"
                              value={ratioFc}
                              onChange={(e) => setRatioFc(parseFloat(e.target.value) || 21)}
                              className="w-full bg-white border border-slate-250 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold"
                            />
                            <span className="absolute right-2.5 top-2 text-[9px] text-slate-400 font-extrabold">MPa</span>
                          </div>
                          
                          <div className="relative w-24 shrink-0">
                            <input
                              id="input-ratioFc-kg"
                              type="number"
                              step="5"
                              value={Math.round(ratioFc * 10)}
                              onChange={(e) => setRatioFc((parseFloat(e.target.value) || 210) / 10)}
                              className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl pl-2 pr-[35px] py-1.5 text-xs font-black text-center"
                            />
                            <span className="absolute right-1.5 top-2 text-[8px] text-emerald-600 font-extrabold">kg/cm²</span>
                          </div>
                        </div>
                        
                        {/* Concrete Presets */}
                        <div className="flex gap-1">
                          {[17.5, 21, 28, 35].map((preset) => (
                            <button
                              key={`pfc-${preset}`}
                              type="button"
                              onClick={() => setRatioFc(preset)}
                              className={`p-1 rounded text-[9px] font-mono border transition-all ${
                                ratioFc === preset
                                  ? "bg-indigo-55 border-indigo-200 text-indigo-750 font-bold"
                                  : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {Math.round(preset * 10)} kg
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Steel Strength */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="input-ratioFy-mpa" className="text-[11.5px] font-bold text-slate-700">Fluencia del Acero (fy)</label>
                          <span className="text-[9px] font-mono text-slate-400">MPa (kg/cm²)</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              id="input-ratioFy-mpa"
                              type="number"
                              step="10"
                              min="1"
                              value={ratioFy}
                              onChange={(e) => setRatioFy(parseFloat(e.target.value) || 420)}
                              className="w-full bg-white border border-slate-250 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold"
                            />
                            <span className="absolute right-2.5 top-2 text-[9px] text-slate-400 font-extrabold">MPa</span>
                          </div>
                          
                          <div className="relative w-24 shrink-0">
                            <input
                              id="input-ratioFy-kg"
                              type="number"
                              step="100"
                              value={Math.round(ratioFy * 10)}
                              onChange={(e) => setRatioFy((parseFloat(e.target.value) || 4200) / 10)}
                              className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl pl-2 pr-[35px] py-1.5 text-xs font-black text-center"
                            />
                            <span className="absolute right-1.5 top-2 text-[8px] text-emerald-600 font-extrabold">kg/cm²</span>
                          </div>
                        </div>

                        {/* Steel Presets */}
                        <div className="flex gap-1">
                          {[280, 420].map((preset) => (
                            <button
                              key={`pfy-${preset}`}
                              type="button"
                              onClick={() => setRatioFy(preset)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${
                                ratioFy === preset
                                  ? "bg-indigo-55 border-indigo-200 text-indigo-750 font-bold"
                                  : "bg-slate-55 text-slate-500 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              fy {Math.round(preset * 10)} kg
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SEISMIC CRITERIA / SISMO RESTRICCIÓN PERÚ (ART 21) */}
                    <div className="bg-amber-500/5 p-3.5 rounded-2xl border border-amber-500/10 space-y-2 mt-4" id="seismic-zone-pane">
                      <div className="flex items-center justify-between">
                        <label htmlFor="checkbox-isSeismic" className="text-[11.5px] font-bold text-amber-950 flex items-center gap-2 cursor-pointer">
                          <input
                            id="checkbox-isSeismic"
                            type="checkbox"
                            checked={ratioIsSeismic}
                            onChange={(e) => setRatioIsSeismic(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                          />
                          ¿Es Pórtico de Diseño Sismorresistente? (Cap. 21)
                        </label>
                        <span className="text-[8.5px] bg-amber-500/20 text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                          Norma E.060
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-805 leading-normal">
                        Para vigas sismorresistentes en zonas de alto riesgo sísmico del Perú (Zonas de costa nacional), la norma restringe de forma estricta la cuantía máxima al <strong>50% de la cuantía balanceada (ρ_máx = 0.50 ρ_b)</strong> para garantizar una gran capacidad de deformación y disipación de energía, a diferencia del 75% reglamentario en diseño regular.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* RESULTS SUMMARY PAGE (5 cols) */}
              <div className="md:col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between print:border print:shadow-none" id="cuantia-result-section">
                
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2.5">
                    Resultados de la Cuantía (ρ)
                  </h3>

                  {/* HERO RATIO SCORE */}
                  <div className="bg-slate-900 rounded-2xl p-4 text-center text-white border border-slate-800" id="cuantia-score-card">
                    <span className="text-[9.5px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Cuantía de Refuerzo Calculada (ρ)</span>
                    <div className="text-3xl font-black font-mono tracking-tight mt-1 text-emerald-400">
                      {(computedRho * 100).toFixed(4)}%
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      (ρ = {finalAs.toFixed(2)} cm² / ({ratioB} m × {ratioD} m) [{(ratioB * 100).toFixed(0)} cm × {(ratioD * 100).toFixed(0)} cm])
                    </div>
                  </div>

                  {/* DIAGNOSTIC STATE CONTAINER */}
                  <div className="space-y-2">
                    <span className="text-[10.5px] font-mono uppercase font-black text-slate-400 tracking-wider">Estado del Diseño en RNE:</span>
                    <div>
                      {computedRho < rhoMin ? (
                        <div id="state-insufficient" className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-950 text-xs shadow-xs">
                          <div className="font-extrabold flex items-center gap-1.5 uppercase text-rose-800">
                            <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
                            ⚠️ FALLA FRÁGIL / ACERO INSUFICIENTE
                          </div>
                          <p className="mt-1.5 leading-normal text-rose-800">
                            La cuantía real ({(computedRho * 100).toFixed(3)}%) es inferior al mínimo absoluto reglamentario del RNE ({(rhoMin * 100).toFixed(3)}%). Existe riesgo de agrietamiento descontrolado sin aviso al traccionarse el concreto.
                          </p>
                        </div>
                      ) : computedRho <= rhoMaxActive ? (
                        <div id="state-ductile" className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-950 text-xs shadow-xs">
                          <div className="font-extrabold flex items-center gap-1.5 uppercase text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                            ✅ DISEÑO RECOMENDADO / FALLA DÚCTIL
                          </div>
                          <p className="mt-1.5 leading-normal text-emerald-800">
                            ¡Sección Óptima! Cumple con la cuantía mínima del RNE ({(rhoMin * 100).toFixed(3)}%) y no supera el máximo sismorresistente / convencional ({(rhoMaxActive * 100).toFixed(3)}%). El acero de refuerzo fluirá primero ante sobrecargas, garantizando una deformación progresiva segura.
                          </p>
                        </div>
                      ) : computedRho <= rhoBalanced ? (
                        <div id="state-overreinforced" className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-950 text-xs shadow-xs">
                          <div className="font-extrabold flex items-center gap-1.5 uppercase text-amber-800">
                            <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse"></span>
                            ⚡ SOBRE-REFORZADO / RNE NO RECOMIENDA
                          </div>
                          <p className="mt-1.5 leading-normal text-amber-800">
                            Supera la cuantía máxima normativa ({(rhoMaxActive * 100).toFixed(3)}%). Aunque es menor a la cuantía balanceada ({(rhoBalanced * 100).toFixed(3)}%), la Norma E.060 prohíbe exceder el valor máximo para evitar fallas trágicas repentinas por aplastamiento de concreto sin fluidez.
                          </p>
                        </div>
                      ) : (
                        <div id="state-brittle" className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-950 text-xs shadow-xs">
                          <div className="font-extrabold flex items-center gap-1.5 uppercase text-red-800">
                            <span className="h-2 w-2 rounded-full bg-red-600 animate-bounce"></span>
                            🚨 SECCIÓN SOBREREFORZADA / ROTURA EXPLOSIVA
                          </div>
                          <p className="mt-1.5 leading-normal text-red-800">
                            ¡Riesgo crítico! Excede la cuantía balanceada de la sección ({(rhoBalanced * 100).toFixed(3)}%). El concreto se aplastará bruscamente antes de que el acero fluya. Se debe redimensionar aumentando el ancho (b) y peralte (d), o reducir el acero provisto.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HIGH METRICS BAR PANEL COMPARATIVE WITH EXACT VALUES */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-150 font-mono text-[10.5px] leading-relaxed">
                    <span className="font-extrabold text-[10.5px] uppercase text-slate-800 block border-b border-slate-250 pb-1 mb-1.5">Límites Normativos del RNE:</span>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-550 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        Cuantía Mínima (ρ_mín):
                      </span>
                      <span className="font-black text-slate-800">{(rhoMin * 100).toFixed(3)}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-550 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Cuantía Máxima (ρ_máx):
                      </span>
                      <span className="font-black text-slate-800">
                        {(rhoMaxActive * 100).toFixed(3)}% <span className="text-[8.5px] text-slate-400 font-mono">({ratioIsSeismic ? "Sísmica" : "Normal"})</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-550 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        Cuantía Balanceada (ρ_b):
                      </span>
                      <span className="font-black text-slate-800">{(rhoBalanced * 100).toFixed(3)}%</span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-slate-800 font-bold">
                      <span>Tu Cuantía Calculada (ρ):</span>
                      <span className={computedRho < rhoMin || computedRho > rhoMaxActive ? "text-rose-600 font-black" : "text-emerald-700 font-black"}>
                        {(computedRho * 100).toFixed(4)}%
                      </span>
                    </div>
                  </div>

                  {/* CUSTOM SCHEMATIC SVG GAGE */}
                  <div className="space-y-1 my-2">
                    <span className="text-[10.5px] font-bold text-slate-500 block">Esquema Gráfico en la Sección:</span>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center">
                      <svg viewBox="0 0 380 90" className="w-full h-auto">
                        {/* Gauge track */}
                        <rect x="15" y="45" width="350" height="11" rx="5" fill="#e2e8f0" />
                        
                        {/* Zones */}
                        {/* Insufficient Zone */}
                        <path d="M 15 45 L 85 45 L 85 56 L 15 56 Z" fill="#f87171" opacity="0.3" />
                        {/* Recommended Ductile Zone */}
                        <path d="M 85 45 L 210 45 L 210 56 L 85 56 Z" fill="#4ade80" opacity="0.45" />
                        {/* High Reinforced Zone */}
                        <path d="M 210 45 L 300 45 L 300 56 L 210 56 Z" fill="#fb923c" opacity="0.45" />
                        {/* Heavy brittle over balanced */}
                        <path d="M 300 45 L 365 45 L 365 56 L 300 56 Z" fill="#ef4444" opacity="0.75" />

                        {/* Limit indicators */}
                        {/* rho_min mark at 85 */}
                        <line x1="85" y1="40" x2="85" y2="61" stroke="#dc2626" strokeWidth="1.5" />
                        <text x="85" y="32" fill="#dc2626" fontSize="7.5" fontWeight="bold" textAnchor="middle">ρ_mín</text>

                        {/* rho_max mark at 210 */}
                        <line x1="210" y1="40" x2="210" y2="61" stroke="#15803d" strokeWidth="1.5" />
                        <text x="210" y="32" fill="#15803d" fontSize="7.5" fontWeight="bold" textAnchor="middle">ρ_máx</text>

                        {/* rho_b mark at 300 */}
                        <line x1="300" y1="40" x2="300" y2="61" stroke="#1d4ed8" strokeWidth="1.5" />
                        <text x="300" y="32" fill="#1d4ed8" fontSize="7.5" fontWeight="bold" textAnchor="middle">ρ_b</text>

                        {/* Real-time Indicator Pointer */}
                        {(() => {
                          const maxMappedRatio = rhoBalanced * 1.3;
                          const ratioFrac = Math.min(1.0, Math.max(0.0, computedRho / (maxMappedRatio || 0.01)));
                          const pointerX = 15 + ratioFrac * 350;
                          return (
                            <g>
                              <polygon points={`${pointerX},41 ${pointerX-5.5},34 ${pointerX+5.5},34`} fill="#1e293b" />
                              <line x1={pointerX} y1="36" x2={pointerX} y2="67" stroke="#000" strokeWidth="2" />
                              <circle cx={pointerX} cy="67" r="4.5" fill="#000" />
                              <text x={pointerX} y="79" fill="#000" fontSize="8" fontWeight="black" textAnchor="middle">Tu ρ</text>
                            </g>
                          );
                        })()}
                      </svg>
                      <span className="text-[9px] text-slate-400 mt-1 block font-medium uppercase font-mono text-center">
                        La aguja ideal debe ubicarse dentro del tramo verde claro (Falla Dúctil) para validar estructuralmente.
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* TECHNICAL DEDUCTION FOR CUANTIA */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 print:border print:shadow-none" id="cuantia-technical-sustenance">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3.5">
                <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
                Memoria de Cálculo Técnico • Sustentación RNE E.060 (Capítulo 10)
              </h3>

              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <p>
                  El Reglamento Nacional de Edificaciones (RNE) del Perú, en su Norma Técnica E.060 (Artículos 10.3, 10.5 y Capítulo 21), exige controles precisos de la cuantía de acero para garantizar que los elementos de concreto armado sufran una falla por tracción (fluencia del acero) antes que fallas repentinas e imprevistas por compresión del bloque de concreto.
                </p>

                {/* EQUATIONS PANEL */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4.5 border border-slate-800 font-mono text-[11px] sm:text-xs space-y-4">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider">// 1. Cuantía Mecánica (ρ):</span>
                    <p className="text-slate-400 mb-1 text-[11px]">
                      Mide el porcentaje relativo de refuerzo longitudinal en la sección respecto al peralte efectivo:
                    </p>
                    <div className="bg-slate-950 p-2 rounded-lg text-center text-slate-200 font-bold my-1 text-sm">
                      ρ = As / (b × d)
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider">// 2. Cuantía Mínima (Art. 10.5.1):</span>
                    <p className="text-slate-400 mb-1 text-[11px]">
                      Para evitar una falla frágil y catastrófica en el instante del primer agrietamiento de tracción:
                    </p>
                    <div className="bg-slate-950 p-2 rounded-lg text-center text-slate-200 font-bold my-1 text-sm">
                      ρ_mín = MÁX( (0.7 × √f'c) / fy , 14 / fy )
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider">// 3. Cuantía Balanceada (ρ_b) y Coeficiente β₁:</span>
                    <p className="text-slate-400 leading-normal mb-1.5 text-[10.5px]">
                      Donde β₁ representa la profundidad del bloque de esfuerzos a compresión del concreto. Si f'c ≤ 280 kg/cm² entonces β₁ = 0.85, disminuyendo 0.05 por cada 70 kg/cm² por encima, hasta un tope mínimo de 0.65:
                    </p>
                    <div className="bg-slate-950 p-2 rounded-lg text-center text-slate-200 font-bold my-1 text-xs">
                      β₁ = f'c ≤ 280 ? 0.85 : MÁX(0.65, 0.85 - 0.05 × (f'c - 280)/70)
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg text-center text-slate-200 font-bold my-1 text-sm">
                      ρ_b = ( ( 0.85 × β₁ × f'c ) / fy ) × ( 6000 / ( 6000 + fy ) )
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider">// 4. Cuantía Máxima reglamentaria (ρ_máx):</span>
                    <p className="text-slate-400 mb-1 text-[11px]">
                      Previene el sobredimensionamiento metálico y asegura extrema ductilidad bajo sismos peruanos:
                    </p>
                    <div className="bg-slate-950 p-2 rounded-lg text-[11px] text-slate-300">
                      • Diseño Convencional: ρ_máx = 0.75 × ρ_b<br />
                      • Diseño Sismorresistente (Cap. 21): ρ_máx = 0.50 × ρ_b
                    </div>
                  </div>
                </div>

                {/* STEP-BY-STEP CALCULATION PROGRESSION FOR CUANTIA */}
                <div id="cuantia-sustentacion-pasos" className="bg-slate-50 rounded-2xl p-4.5 border border-slate-150 space-y-3 font-mono text-[11px]">
                  <p className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5 uppercase">Memoria de Reemplazo e Iteración:</p>
                  
                  {/* STEP 1 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">1.</span>
                    <p>
                      <strong>Geometría de Viga:</strong> Ancho b = {ratioB} m ({(ratioB * 100).toFixed(0)} cm), Peralte Total h = {ratioH} m ({(ratioH * 100).toFixed(0)} cm), Recubrimiento r = {ratioRecubrimiento} m ({(ratioRecubrimiento * 100).toFixed(1)} cm). Peralte Efectivo d = h - r = <strong>{ratioD} m ({(ratioD * 100).toFixed(1)} cm)</strong>.
                    </p>
                  </div>

                  {/* STEP 2 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">2.</span>
                    <p>
                      <strong>Fuerza de Materiales (Preset):</strong> Concreto f'_c = {ratioFc} MPa ({fcKg} kg/cm²) donde √f'_c = {Math.sqrt(fcKg).toFixed(3)}. Fluencia del Acero f_y = {ratioFy} MPa ({fyKg} kg/cm²).
                    </p>
                  </div>

                  {/* STEP 3 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">3.</span>
                    <p>
                      <strong>Cálculo de Cuantía Mínima (ρ_mín):</strong> Se calcula del máximo de las dos ecuaciones del RNE: <br />
                      • Ecuación 1 (0.7 √f'_c / fy): (0.7 × {Math.sqrt(fcKg).toFixed(2)}) / {fyKg} = {((0.7 * Math.sqrt(fcKg)) / fyKg).toFixed(5)} <br />
                      • Ecuación 2 (14 / fy): 14 / {fyKg} = {(14 / fyKg).toFixed(5)} <br />
                      • Cuantía Mínima Máxima de ambas: <strong>{(rhoMin * 100).toFixed(3)}%</strong> (Equivale a un acero mínimo de {(rhoMin * ratioB_cm * ratioD_cm).toFixed(2)} cm²).
                    </p>
                  </div>

                  {/* STEP 4 */}
                  <div className="flex items-start gap-1 pb-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">4.</span>
                    <p>
                      <strong>Parámetro β₁ e Hipótesis Balanceada (ρ_b):</strong> <br />
                      • Coeficiente β₁ del bloque de compresión: <strong>{beta1.toFixed(3)}</strong>. <br />
                      • Cuantía balanceada calculada: ((0.85 × {beta1.toFixed(3)} × {fcKg}) / {fyKg}) × (6000 / (6000 + {fyKg})) = <strong>{(rhoBalanced * 100).toFixed(3)}%</strong>.
                    </p>
                  </div>

                  {/* STEP 5 */}
                  <div className="flex items-start gap-1 pb-1 border-b border-slate-200">
                    <span className="text-emerald-700 font-extrabold shrink-0">5.</span>
                    <p>
                      <strong>Límite de Cuantía Máxima Seguro (ρ_máx):</strong> <br />
                      • Con el criterio {ratioIsSeismic ? "Sismorresistente (0.50 × ρ_b)" : "Convencional (0.75 × ρ_b)"}, el límite superior estricto es <strong>{(rhoMaxActive * 100).toFixed(3)}%</strong> (Equivale a un acero máximo de {(rhoMaxActive * ratioB_cm * ratioD_cm).toFixed(2)} cm²).
                    </p>
                  </div>

                  {/* STEP 6 */}
                  <div className="flex items-start gap-1">
                    <span className="text-emerald-700 font-extrabold shrink-0">6.</span>
                    <p>
                      <strong>Verificación del Refuerzo Real Provisto:</strong> <br />
                      • Acero Real Provisto en plano As = <strong>{finalAs.toFixed(2)} cm²</strong>. <br />
                      • Cuantía Real de Refuerzo en Obra: {finalAs.toFixed(2)} cm² / ({ratioB} m × {ratioD} m) = {finalAs.toFixed(2)} cm² / ({ratioB_cm.toFixed(0)} cm × {ratioD_cm.toFixed(0)} cm) = <strong>{(computedRho * 100).toFixed(4)}%</strong>.
                      <span className="block mt-2 text-slate-800 font-black text-xs">
                        Resultado: {computedRho < rhoMin ? (
                          <span className="text-rose-600">Rechazado por estar por debajo del mínimo reglamentario.</span>
                        ) : computedRho > rhoMaxActive ? (
                          <span className="text-amber-700">Rechazado por superar el límite máximo de ductilidad sísmica RNE.</span>
                        ) : (
                          <span className="text-emerald-700">Aceptado y Validado de acuerdo al Reglamento Nacional de Edificaciones.</span>
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                {/* ADVICE INFO BOX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                  <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-sky-950">
                    <span className="font-extrabold text-[10px] uppercase text-sky-800 block mb-1">💡 Consejos de Diseño si f'c o fy varían:</span>
                    Incrementar la resistencia del concreto f'c aumenta la ductilidad de la sección y la cuantía balanceada (permitiendo colocar más acero longitudinal de tracción). Sin embargo, vigila siempre que las dimensiones sean suficientes para evitar fallas por corte.
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION CARD FOR CUANTIA */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de cuantía de acero?</h4>
                  <p className="text-[10px] text-slate-500">Muestra el cumplimiento del cálculo contra parámetros de los Capítulos 10 y 21 de la Norma E.060.</p>
                </div>
              </div>
              <button
                id="btn-print-cuantia"
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>

          </div>
        )}

        {selectedTemplate === "vigas" && (
          <div className="space-y-6">
            {/* Input & Output panels */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 4
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Predimensionamiento de Vigas
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer valores por defecto"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Luz Libre L (m) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-beamL" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Luz Libre de la Viga (L) en metros
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(beamL * 100).toFixed(0)} cm)</span>
                    </div>
                    <input
                      id="input-beamL"
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="20"
                      value={beamL}
                      onChange={(e) => setBeamL(parseFloat(e.target.value) || 6.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Tipo de Viga */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Tipo de Viga (Ubicación estructural)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBeamType("principal")}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          beamType === "principal"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Viga Principal (Carga)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBeamType("secundaria")}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          beamType === "secundaria"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Viga Secundaria (Amarre)
                      </button>
                    </div>
                  </div>

                  {/* Categoría de Edificación */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Categoría de la Edificación (Norma E.020)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setBeamCategory("A")}
                        className={`py-1.5 px-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          beamCategory === "A"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Cat A</span>
                        <span className="block text-[8px] font-mono opacity-60">Esenciales (α={beamType === "principal" ? "10" : "12"})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBeamCategory("B")}
                        className={`py-1.5 px-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          beamCategory === "B"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Cat B</span>
                        <span className="block text-[8px] font-mono opacity-60">Importantes (α={beamType === "principal" ? "11" : "13"})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBeamCategory("C")}
                        className={`py-1.5 px-2 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          beamCategory === "C"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Cat C</span>
                        <span className="block text-[8px] font-mono opacity-60 font-bold">Comunes (α={beamType === "principal" ? "12" : "14"})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL & GRAPHICS */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Dimensionamiento Calculado (RNE E.060)
                  </h3>

                  {/* Big Hero Results */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Peralte Final h</span>
                      <div className="text-2xl font-black font-mono leading-none mt-1 text-emerald-400">
                        {beamH.toFixed(2)} m
                      </div>
                      <span className="text-[10px] font-mono opacity-80 block mt-1">({(beamH * 100).toFixed(0)} cm)</span>
                      <div className="absolute right-3 bottom-2 text-slate-800 font-extrabold text-[8px] tracking-wider uppercase font-mono">COMERCIAL</div>
                    </div>

                    <div className="bg-indigo-950 text-indigo-100 p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold font-mono">Ancho Final b</span>
                      <div className="text-2xl font-black font-mono leading-none mt-1 text-teal-300">
                        {beamB.toFixed(2)} m
                      </div>
                      <span className="text-[10px] font-mono opacity-80 block mt-1">({(beamB * 100).toFixed(0)} cm)</span>
                      <div className="absolute right-3 bottom-2 text-indigo-900 font-extrabold text-[8px] tracking-wider uppercase font-mono">REGULADO</div>
                    </div>
                  </div>

                  {/* Calculations breakdown steps */}
                  <div className="mt-5 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Factor Divisor (α):</span>
                      <span className="font-mono font-bold text-slate-800">{alpha}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Peralte Base (h_base = L / α):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {beamHbase.toFixed(3)} m ({(beamHbase * 100).toFixed(1)} cm)
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Ancho Base (b_base = h / 2):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {beamBbase.toFixed(3)} m ({(beamBbase * 100).toFixed(1)} cm)
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-101 pb-1.5">
                      <span className="font-semibold">Ancho Inicial Comercial (b_calc):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {beamBcalc.toFixed(2)} m ({(beamBcalc * 100).toFixed(0)} cm)
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-101 pb-1.5">
                      <span className="font-semibold">Restricción de Esbeltez (0.3 × h):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {esbeltezLimit.toFixed(2)} m ({(esbeltezLimit * 100).toFixed(0)} cm)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Restricción Mínimo Absoluto RNE:</span>
                      <span className="font-mono font-bold text-slate-800">0.25 m (25 cm)</span>
                    </div>
                  </div>
                </div>

                {/* GRAPHICAL REPRESENTATION */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 flex items-center justify-center gap-6 mt-4">
                  <div className="relative border-4 border-slate-850 bg-white shadow-xs shrink-0" style={{ width: "90px", height: "135px" }}>
                    {/* Top Bars (placeholder representational) */}
                    <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                    {/* Bottom Bars */}
                    <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                    <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                    {/* Width label with lines */}
                    <div className="absolute -bottom-6 left-0 right-0 text-center font-mono text-[9px] font-black text-slate-800">
                      b = {beamB.toFixed(2)} m ({(beamB * 100).toFixed(0)} cm)
                    </div>
                    {/* Height label */}
                    <div className="absolute -right-24 top-0 bottom-0 flex items-center justify-center font-mono text-[9px] font-black text-slate-800 pointer-events-none">
                      h = {beamH.toFixed(2)} m ({(beamH * 100).toFixed(0)} cm)
                    </div>
                  </div>

                  <div className="text-[11px] leading-relaxed text-slate-500 ml-16">
                    <span className="font-black text-slate-800 block mb-1">🔍 Esbeltez y Consistencia Ventajosa:</span>
                    El RNE peruano (Capítulo 21) exige que el ancho mínimo de vigas sismorresistentes no sea menor a 25 cm (0.25 m), y que la relación b/h sea mayor o igual a 0.3 para resguardar la ductilidad sísmica.
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION CARD FOR VIGAS */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de vigas?</h4>
                  <p className="text-[10px] text-slate-500">Muestra el cumplimiento del cálculo contra parámetros de los Capítulos 10 y 21 de la Norma E.060 de Vigas.</p>
                </div>
              </div>
              <button
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "losas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 5
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Predimensionamiento de Losas
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer valores"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Luz l_losa (m) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-slabL" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Luz Libre de la Losa (L_losa) en metros
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(slabL * 100).toFixed(0)} cm)</span>
                    </div>
                    <input
                      id="input-slabL"
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="15"
                      value={slabL}
                      onChange={(e) => setSlabL(parseFloat(e.target.value) || 4.5)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] leading-relaxed text-indigo-950">
                    <span className="font-extrabold text-xs block mb-1">🏗️ Criterio RNE E.060 (Art. 9.5.2.1):</span>
                    Las losas aligeradas armadas en una sola dirección con luces libres menores o iguales a 7.5 m pueden predimensionarse con un espesor total H = L_losa / 25.
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Dimensionamiento de Losa Calculado
                  </h3>

                  {/* Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Espesor Comercial del Aligerado (H)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {slabH.toFixed(2)} m
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({(slabH * 100).toFixed(0)} cm)</span>
                    
                    {/* Brick and concrete detail */}
                    <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex justify-between items-center text-[11px] font-semibold text-slate-350">
                      <span>Ladrillo de Techo (H_ladrillo):</span>
                      <strong className="text-white font-mono">{((slabH * 100) - 5).toFixed(0)} cm</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-350 mt-1">
                      <span>Losa Superior de Concreto (H_losa_sup):</span>
                      <strong className="text-white font-mono">5 cm</strong>
                    </div>
                  </div>

                  {/* Step list / breakdown */}
                  <div className="mt-5 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Espesor Mínimo Base de Cálculo (H_base = L / 25):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {slabHbase.toFixed(3)} m ({(slabHbaseCm).toFixed(1)} cm)
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-205 mt-2 space-y-1.5">
                      <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Asignación Comercial Estricta RNE:</span>
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Si L/25 ≤ 17 cm:</span>
                        <span className={`font-mono font-bold ${slabHbaseCm <= 17 ? "text-emerald-600" : "text-slate-400"}`}>H = 17 cm (0.17 m)</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Si 17 &lt; L/25 ≤ 20 cm:</span>
                        <span className={`font-mono font-bold ${slabHbaseCm > 17 && slabHbaseCm <= 20 ? "text-emerald-600" : "text-slate-400"}`}>H = 20 cm (0.20 m)</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Si 20 &lt; L/25 ≤ 25 cm:</span>
                        <span className={`font-mono font-bold ${slabHbaseCm > 20 && slabHbaseCm <= 25 ? "text-emerald-600" : "text-slate-400"}`}>H = 25 cm (0.25 m)</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Si 25 &lt; L/25 ≤ 30 cm:</span>
                        <span className={`font-mono font-bold ${slabHbaseCm > 25 && slabHbaseCm <= 30 ? "text-emerald-600" : "text-slate-400"}`}>H = 30 cm (0.30 m)</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Si L/25 &gt; 30 cm:</span>
                        <span className={`font-mono font-bold ${slabHbaseCm > 30 ? "text-emerald-600" : "text-slate-400"}`}>Redondeo libre superior</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISUAL DIAGRAM OF THE ALIGERADO SLAB CROSS-SECTION */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 flex flex-col sm:flex-row items-center gap-4 mt-4">
                  <div className="flex gap-1.5 h-16 items-end shrink-0">
                    <div className="w-4 bg-slate-350 h-full relative rounded-t-sm">
                      <div className="absolute top-0 left-0 right-0 h-4 bg-slate-500 rounded-t-sm"></div>
                    </div>
                    <div className="w-10 bg-amber-100 h-12 relative border border-amber-250 rounded-t-sm flex items-center justify-center font-mono text-[9px] text-amber-800">10cm</div>
                    <div className="w-4 bg-slate-350 h-full relative rounded-t-sm">
                      <div className="absolute top-0 left-0 right-0 h-4 bg-slate-500 rounded-t-sm"></div>
                    </div>
                    <div className="w-10 bg-amber-100 h-12 relative border border-amber-250 rounded-t-sm flex items-center justify-center font-mono text-[9px] text-amber-800">ladrillo</div>
                    <div className="w-4 bg-slate-350 h-full relative rounded-t-sm">
                      <div className="absolute top-0 left-0 right-0 h-4 bg-slate-500 rounded-t-sm"></div>
                    </div>
                  </div>

                  <div className="text-[11px] leading-relaxed text-slate-500">
                    <span className="font-extrabold text-slate-800 block mb-0.5">📏 Detalle Típico de Vigueta:</span>
                    Las losas aligeradas constan de viguetas de 10 cm (0.10 m) de ancho espaciadas @ 40 cm entre ejes y un ladrillo de techo de 30 cm con un vaciado de concreto de 5 cm (0.05 m).
                  </div>
                </div>

              </div>
            </div>
            
            {/* PRINT OPTION CARD FOR LOSAS */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de losas aligeradas?</h4>
                  <p className="text-[10px] text-slate-500">Muestra el cumplimiento del espesor conforme al Art. 9.5.2 de la Norma E.060.</p>
                </div>
              </div>
              <button
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "columnas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 6
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Predimensionamiento de Columnas
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer valores"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Area Tributaria (m2) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-colAtrib" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Área Tributaria (A_trib) en m²
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(colAtrib * 10000).toLocaleString()} cm²)</span>
                    </div>
                    <input
                      id="input-colAtrib"
                      type="number"
                      step="0.5"
                      min="1"
                      max="1000"
                      value={colAtrib}
                      onChange={(e) => setColAtrib(parseFloat(e.target.value) || 24.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* N Pisos */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-colNpisos" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Número de Pisos de la edificación
                    </label>
                    <input
                      id="input-colNpisos"
                      type="number"
                      min="1"
                      max="100"
                      value={colNpisos}
                      onChange={(e) => setColNpisos(parseInt(e.target.value) || 4)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Categoria E.020 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Categoría de Edificación (Norma E.020)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setColCategory("A")}
                        className={`py-1.5 px-1 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                          colCategory === "A"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Cat A</span>
                        <span className="block text-[8px] font-mono opacity-60">1500 kg/m²</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setColCategory("B")}
                        className={`py-1.5 px-1 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                          colCategory === "B"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Cat B</span>
                        <span className="block text-[8px] font-mono opacity-60 font-bold">1250 kg/m²</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setColCategory("C")}
                        className={`py-1.5 px-1 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                          colCategory === "C"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Cat C</span>
                        <span className="block text-[8px] font-mono opacity-60 font-bold">1000 kg/m²</span>
                      </button>
                    </div>
                  </div>

                  {/* Tipo de Columna / Ubicacion */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Tipo de Columna (Ubicación Sísmica)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setColType("centrada")}
                        className={`py-1.5 px-1 rounded-xl border text-center font-bold text-[10.5px] cursor-pointer transition-all ${
                          colType === "centrada"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Centrada</span>
                        <span className="block text-[7.5px] font-mono opacity-60">λ=1.1, n=0.30</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setColType("excentrica")}
                        className={`py-1.5 px-1 rounded-xl border text-center font-bold text-[10.5px] cursor-pointer transition-all ${
                          colType === "excentrica"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Excéntrica</span>
                        <span className="block text-[7.5px] font-mono opacity-60">λ=1.25, n=0.25</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setColType("esquinera")}
                        className={`py-1.5 px-1 rounded-xl border text-center font-bold text-[10.5px] cursor-pointer transition-all ${
                          colType === "esquinera"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>Esquinera</span>
                        <span className="block text-[7.5px] font-mono opacity-60">λ=1.25, n=0.25</span>
                      </button>
                    </div>
                  </div>

                  {/* Resistencia Concreto (fc) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-colFc" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Resistencia Concreto (f'c)
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">kg/cm²</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="input-colFc"
                        type="number"
                        min="100"
                        max="1000"
                        value={colFc}
                        onChange={(e) => setColFc(parseInt(e.target.value) || 210)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setColFc(210)}
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${colFc === 210 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-white text-slate-500 border-slate-250 hover:bg-slate-50"}`}
                        >
                          210
                        </button>
                        <button
                          type="button"
                          onClick={() => setColFc(280)}
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${colFc === 280 ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-white text-slate-500 border-slate-250 hover:bg-slate-50"}`}
                        >
                          280
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Dimensionamiento de Columnas (Criterio Sísmico)
                  </h3>
                  <span className="text-[9.5px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black border border-indigo-150 font-mono uppercase tracking-wider">
                    Ecuación RNE: Ac = [ P_serv / (n * f'c) ]
                  </span>
                </div>

                {/* Hero Results block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 text-white p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Área de Columna Mínima (Ag)</span>
                    <div className="text-2xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {Math.ceil(colAg).toLocaleString()} cm²
                    </div>
                    <span className="text-[10px] font-mono opacity-80 block mt-1">({colAgM2.toFixed(4)} m²)</span>
                  </div>

                  <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Carga de Servicio Estimada (P)</span>
                    <div className="text-2xl font-black font-mono leading-none mt-1 text-slate-900">
                      {(colP / 1000).toFixed(2)} Tons
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">({colP.toLocaleString()} kg)</span>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold">Factor de Carga de Servicio (P_muro):</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(colPmuro * 10000).toFixed(0)} kg/m² ({colPmuro.toFixed(4)} kg/cm²)
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold">Carga de Servicio Amplificada (P_serv = &lambda; &times; P):</span>
                    <span className="font-mono font-bold text-slate-800">
                      {Math.round(colLambda * colP).toLocaleString()} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-semibold">Sustitución de Área: Ac = P_serv / (n &times; f'c):</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100 text-[11px]">
                      {"[ " + Math.round(colLambda * colP).toLocaleString() + " kg ] / [ " + colN + " × " + colFc + " kg/cm² ] = "}<strong>{colAgBase.toFixed(1)} cm²</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Límite Mínimo Absoluto RNE (Art. 21.6.1):</span>
                    <span className="font-mono font-bold text-slate-800">1,000 cm² (0.10 m²)</span>
                  </div>
                </div>

                {/* RECOMMENDED SECTIONS COMMERCIAL DETAILS IN METERS */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 space-y-3 mt-4">
                  <span className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider block">Dimensiones Recomendadas en Obra (Redondeado a múltiplos de 5cm / 0.05m):</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Seccion Cuadrada */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Sección Cuadrada</span>
                        <strong className="text-xs font-black text-slate-800 font-mono block">
                          {Math.max(0.25, (Math.ceil(Math.sqrt(colAg) / 5) * 5) / 100).toFixed(2)} m × {Math.max(0.25, (Math.ceil(Math.sqrt(colAg) / 5) * 5) / 100).toFixed(2)} m
                        </strong>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                          ({Math.max(25, Math.ceil(Math.sqrt(colAg) / 5) * 5)} cm × {Math.max(25, Math.ceil(Math.sqrt(colAg) / 5) * 5)} cm)
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded border-2 border-slate-700 bg-slate-50 shrink-0"></div>
                    </div>

                    {/* Seccion Circular */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Sección Circular</span>
                        <strong className="text-xs font-black text-slate-800 font-mono block">
                          ∅ {Math.max(0.25, (Math.ceil(Math.sqrt((4 * colAg) / Math.PI) / 5) * 5) / 100).toFixed(2)} m
                        </strong>
                        <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                          (Diámetro {Math.max(25, Math.ceil(Math.sqrt((4 * colAg) / Math.PI) / 5) * 5)} cm)
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-50 shrink-0"></div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-100 pt-1.5 mt-1">
                    * El Artículo 21.6.1 del RNE limita las secciones de columnas de pórticos sismorresistentes de concreto armado a un ancho mínimo absoluto de 25 cm (0.25 m) en cualquier dirección.
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION CARD FOR COLUMNAS */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden" id="card-print-columnas">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de columnas?</h4>
                  <p className="text-[10px] text-slate-500">Muestra el cumplimiento del área mínima Ag contra parámetros sismorresistentes del Capítulo 21 del RNE.</p>
                </div>
              </div>
              <button
                id="btn-print-columnas"
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "estribos" && (
          <div className="space-y-6" id="panel-estribos">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-estribos">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 7
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Predimensionamiento de Estribos
                    </h2>
                  </div>
                  <button
                    id="btn-reset-estribos"
                    onClick={handleReset}
                    title="Restablecer valores"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Viga total height h (m) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-stirrupH" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Peralte Total de la Viga ($h$) en metros
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(stirrupH * 100).toFixed(0)} cm)</span>
                    </div>
                    <input
                      id="input-stirrupH"
                      type="number"
                      step="0.05"
                      min="0.20"
                      max="1.50"
                      value={stirrupH}
                      onChange={(e) => setStirrupH(parseFloat(e.target.value) || 0.50)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Diámetro longitudinal */}
                  <div className="space-y-1.5">
                    <label htmlFor="select-stirrupLongDb" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Barra Longitudinal Menor en Flexión ($d_b$)
                    </label>
                    <select
                      id="select-stirrupLongDb"
                      value={stirrupLongDbIndex}
                      onChange={(e) => setStirrupLongDbIndex(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                    >
                      {COMMERCIAL_BARS.map((item, index) => (
                        <option key={`long-${index}`} value={index}>
                          {item.diameterInch} (db = {item.dbCm} cm)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Diámetro de estribo */}
                  <div className="space-y-1.5">
                    <label htmlFor="select-stirrupStirrupDb" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Diámetro del Estribo de Confinamiento (d_be)
                    </label>
                    <select
                      id="select-stirrupStirrupDb"
                      value={stirrupStirrupDbIndex}
                      onChange={(e) => setStirrupStirrupDbIndex(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value={1}>8 mm (N nacional)</option>
                      <option value={2}>3/8" (Normativo común)</option>
                      <option value={3}>1/2" (Vigas de gran peralte)</option>
                    </select>
                  </div>

                  {/* Zona Sísmica Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl" id="toggle-card-seismic">
                    <div className="space-y-0.5">
                      <label htmlFor="checkbox-stirrupSeismic" className="text-xs font-black text-slate-850 block cursor-pointer">
                        ¿Detallar para Zona de Confinamiento Sísmico?
                      </label>
                      <span className="text-[10px] text-slate-400 block font-semibold leading-tight">Aplica el Capítulo 21 del RNE E.060.</span>
                    </div>
                    <input
                      id="checkbox-stirrupSeismic"
                      type="checkbox"
                      checked={stirrupIsSeismic}
                      onChange={(e) => setStirrupIsSeismic(e.target.checked)}
                      className="h-4.5 w-4.5 text-slate-900 border-slate-250 bg-slate-50 rounded focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-estribos-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Cálculo y Distribución de Confinamiento de Estribos (Norma E.060)
                  </h3>

                  {/* Big Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Espaciamiento de Confinamiento (s_conf)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {stirrupIsSeismic ? `${stirrupSconf.toFixed(1)} cm` : "d / 2 constante"}
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({(stirrupSconf / 100).toFixed(3)} m)</span>
                    
                    <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-1.5 text-[11px] font-semibold text-slate-350">
                      <div className="flex justify-between items-center">
                        <span>Peralte Efectivo viga ($d$):</span>
                        <strong className="text-white font-mono">{(stirrupD * 100).toFixed(1)} cm</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Largo de Confinamiento ($L_o$):</span>
                        <strong className="text-white font-mono">{(stirrupLo * 100).toFixed(0)} cm ({stirrupLo.toFixed(2)} m)</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Distribución de Obra (Extremo):</span>
                        <strong className="text-emerald-400 font-mono text-xs">{stirrupIsSeismic ? stirrupDistributionText : "1 @ 0.05m, resto @ d/2"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Technical Limits list */}
                  {stirrupIsSeismic && (
                    <div className="mt-5 space-y-2 text-xs text-slate-600" id="limits-estribos">
                      <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Verificación de Límites Estrictos de Confinamiento (E.060 Art. 21.4.4):</span>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-semibold">a) Peralte Efectivo / 4 ($d / 4$):</span>
                        <span className="font-mono font-bold text-slate-800">{stirrupSconf_d4.toFixed(2)} cm</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-semibold">b) 8 veces diámetro barra longitudinal ($8 \times d_b$):</span>
                        <span className="font-mono font-bold text-slate-800">{stirrupSconf_8db.toFixed(2)} cm</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-semibold">c) 24 veces diámetro estribo (24 x d_be):</span>
                        <span className="font-mono font-bold text-slate-800">{stirrupSconf_24dbe.toFixed(2)} cm</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-semibold">d) Límite máximo absoluto normativo de confinamiento:</span>
                        <span className="font-mono font-bold text-slate-800">30.0 cm</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-semibold">e) Límite Zona Central Sísmica (min(10 &times; db, 30 cm)):</span>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">
                          {Math.min(10 * stirrupDbLong, 30.0).toFixed(1)} cm
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100 text-[11px] font-bold mt-1">
                        <span>Espaciamiento Comercial adoptado (Confinamiento):</span>
                        <span className="font-mono">{stirrupSconf.toFixed(1)} cm</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* GRAPHIC REPRESENTATION */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 space-y-3 mt-4" id="graphic-estribos">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Esquema de Distribución de Estribos en Viga:</span>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-center items-center relative overflow-hidden h-32">
                    {/* Support column representation */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-slate-300 border-r border-slate-400 flex items-center justify-center font-bold text-[8px] text-slate-600 uppercase vertical-text">COL</div>
                    
                    {/* Beam representation */}
                    <div className="w-4/5 h-16 border-2 border-slate-700 rounded relative flex items-center bg-slate-50/50">
                      {/* Longitudinal top bars */}
                      <div className="absolute top-1 right-0 left-0 h-1 bg-red-600"></div>
                      {/* Longitudinal bottom bars */}
                      <div className="absolute bottom-1 right-0 left-0 h-1 bg-red-600"></div>
                      
                      {/* First stirrup at 5cm */}
                      <div className="absolute top-1 bottom-1 w-0.5 bg-indigo-700 left-[10%]" title="1 @ 5 cm"></div>
                      
                      {/* Confinement stirrups */}
                      <div className="absolute top-1 bottom-1 w-0.5 bg-indigo-700 left-[18%]"></div>
                      <div className="absolute top-1 bottom-1 w-0.5 bg-indigo-700 left-[26%]"></div>
                      <div className="absolute top-1 bottom-1 w-0.5 bg-indigo-700 left-[34%]"></div>
                      <div className="absolute top-1 bottom-1 w-0.5 bg-indigo-700 left-[42%]"></div>
                      <div className="absolute top-1 bottom-1 w-0.5 bg-indigo-700 left-[50%]"></div>
                      
                      {/* Central stirrups (wider spacing) */}
                      <div className="absolute top-1 bottom-1 w-0.5 bg-slate-400 left-[68%]"></div>
                      <div className="absolute top-1 bottom-1 w-0.5 bg-slate-400 left-[86%]"></div>

                      {/* Dimension lines and labels */}
                      <div className="absolute top-[-18px] left-[10%] right-[40%] flex justify-between items-center border-b border-indigo-500 text-[8px] font-mono font-bold text-indigo-700">
                        <span>Zona Confinamiento (Lo = {stirrupLo.toFixed(2)}m)</span>
                      </div>
                      <div className="absolute bottom-[-18px] left-[10%] right-[10%] text-center font-mono text-[8.5px] font-bold text-slate-700">
                        Espaciamiento: 1@0.05m, {stirrupNconf}@{stirrupSconf.toFixed(1)}cm, resto @ {stirrupScentral}cm
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-1">
                    * El Artículo 21.4.4.1 de la Norma E.060 exige ganchos sísmicos doblados a 135° con una extensión de 10 veces el diámetro del estribo (10 x d_be) para garantizar que no se abran ante fuerzas cíclicas extremas.
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION CARD FOR ESTRIBOS */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden" id="card-print-estribos">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de estribos?</h4>
                  <p className="text-[10px] text-slate-500">Muestra el cumplimiento del cálculo contra parámetros de los Capitulos 11 y 21 del RNE.</p>
                </div>
              </div>
              <button
                id="btn-print-estribos"
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "zapatas" && (
          <div className="space-y-6" id="panel-zapatas">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-zapatas">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 8
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Predimensionamiento de Zapatas
                    </h2>
                  </div>
                  <button
                    id="btn-reset-zapatas"
                    onClick={handleReset}
                    title="Restablecer valores"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* SERVICE LOAD METHOD SELECTOR */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                      Método de Carga ($P_{serv}$)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setZapUseDetailedP(false)}
                        className={`py-1.5 px-2 rounded-xl border text-center text-[10px] font-extrabold transition-all cursor-pointer ${
                          !zapUseDetailedP
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Carga Directa P
                      </button>
                      <button
                        type="button"
                        onClick={() => setZapUseDetailedP(true)}
                        className={`py-1.5 px-2 rounded-xl border text-center text-[10px] font-extrabold transition-all cursor-pointer ${
                          zapUseDetailedP
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        P_uso × At × Np
                      </button>
                    </div>
                  </div>

                  {/* DETERMINATIVE LOADS INPUT */}
                  {!zapUseDetailedP ? (
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <label htmlFor="input-zapP" className="text-xs font-bold text-slate-700 block">
                        Carga de Servicio Acumulada ($P$) en Toneladas
                      </label>
                      <input
                        id="input-zapP"
                        type="number"
                        step="5"
                        min="5"
                        max="1500"
                        value={zapP}
                        onChange={(e) => setZapP(parseFloat(e.target.value) || 80.0)}
                        className="w-full bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/60 shadow-inner">
                      <span className="text-[9.5px] font-black uppercase text-indigo-700 tracking-wider block">Est. Tributaria: P = (Puso × At × Np) / 1000:</span>
                      
                      {/* P_uso */}
                      <div className="space-y-1">
                        <label htmlFor="input-zapPuso" className="text-[10.5px] font-bold text-slate-700 block">
                          Carga por m² ($P_{uso}$) en kg/m²
                        </label>
                        <input
                          id="input-zapPuso"
                          type="number"
                          step="50"
                          min="100"
                          max="2000"
                          value={zapPuso}
                          onChange={(e) => setZapPuso(parseFloat(e.target.value) || 1200)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                        />
                      </div>

                      {/* Area Tributaria At */}
                      <div className="space-y-1">
                        <label htmlFor="input-zapAt" className="text-[10.5px] font-bold text-slate-700 block">
                          Área Tributaria ($A_t$) en m²
                        </label>
                        <input
                          id="input-zapAt"
                          type="number"
                          step="0.5"
                          min="1"
                          max="500"
                          value={zapAt}
                          onChange={(e) => setZapAt(parseFloat(e.target.value) || 20.0)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                        />
                      </div>

                      {/* Numero de Pisos Np */}
                      <div className="space-y-1">
                        <label htmlFor="input-zapNp" className="text-[10.5px] font-bold text-slate-700 block">
                          Número de Pisos ($N_p$)
                        </label>
                        <input
                          id="input-zapNp"
                          type="number"
                          step="1"
                          min="1"
                          max="50"
                          value={zapNp}
                          onChange={(e) => setZapNp(parseInt(e.target.value) || 4)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Capacidad Portante admisible qa */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-zapQa" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Capacidad Suelo Admisible ($q_a$)
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(zapQa * 10).toFixed(0)} T/m²)</span>
                    </div>
                    <input
                      id="input-zapQa"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="15"
                      value={zapQa}
                      onChange={(e) => setZapQa(parseFloat(e.target.value) || 1.5)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Dimensiones columnas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="input-zapBcol" className="text-xs font-bold text-slate-700 block">
                        Columna Ancho (b_col) m
                      </label>
                      <input
                        id="input-zapBcol"
                        type="number"
                        step="0.05"
                        min="0.20"
                        max="1.50"
                        value={zapBcol}
                        onChange={(e) => setZapBcol(parseFloat(e.target.value) || 0.35)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="input-zapHcol" className="text-xs font-bold text-slate-700 block">
                        Columna Peralte (t_col) m
                      </label>
                      <input
                        id="input-zapHcol"
                        type="number"
                        step="0.05"
                        min="0.20"
                        max="1.50"
                        value={zapHcol}
                        onChange={(e) => setZapHcol(parseFloat(e.target.value) || 0.35)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Zapata depth Hz (m) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-zapHz" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Espesor Zapata ($h_z$) en metros
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(zapHz * 100).toFixed(0)} cm)</span>
                    </div>
                    <input
                      id="input-zapHz"
                      type="number"
                      step="0.05"
                      min="0.30"
                      max="1.50"
                      value={zapHz}
                      onChange={(e) => setZapHz(parseFloat(e.target.value) || 0.50)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Rebar selector for Footing depth calculations */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <label htmlFor="input-zapDbIndex" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                      Fierro Longitudinal Zapata ($d_b$) • Peralte $L_P$
                    </label>
                    <select
                      id="input-zapDbIndex"
                      value={zapDbIndex}
                      onChange={(e) => setZapDbIndex(parseInt(e.target.value) || 2)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      {COMMERCIAL_BARS.map((bar, idx) => (
                        <option key={idx} value={idx}>
                          {bar.diameterInch} (db = {bar.dbCm.toFixed(3)} cm)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-zapatas-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Dimensionamiento de Zapatas (Normas E.050 y E.060)
                  </h3>

                  {/* Big Hero Result */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Largo Zapata (L)</span>
                      <div className="text-2xl font-black font-mono leading-none mt-1 text-emerald-400">
                        {zapL.toFixed(2)} m
                      </div>
                      <span className="text-[10px] font-mono opacity-80 block mt-1">({(zapL * 100).toFixed(0)} cm)</span>
                      <div className="absolute right-3 bottom-2 text-slate-800 font-extrabold text-[8px] tracking-wider uppercase font-mono border border-slate-700/50 px-1 rounded">MÍN 0.80m</div>
                    </div>

                    <div className="bg-indigo-950 text-indigo-100 p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold font-mono">Ancho Zapata (B)</span>
                      <div className="text-2xl font-black font-mono leading-none mt-1 text-teal-300">
                        {zapB.toFixed(2)} m
                      </div>
                      <span className="text-[10px] font-mono opacity-80 block mt-1">({(zapB * 100).toFixed(0)} cm)</span>
                      <div className="absolute right-3 bottom-3 text-indigo-900 font-extrabold text-[8px] tracking-wider uppercase font-mono">CONCÉNTRICA</div>
                    </div>
                  </div>

                  {/* Breakdown calculations */}
                  <div className="mt-5 space-y-2 text-xs text-slate-600">
                    <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Memoria descriptiva de predimensionamiento:</span>
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Carga total con sobrecarga propia ($1.10 \times P$):</span>
                      <span className="font-mono font-bold text-slate-800">{zapPtotal.toFixed(2)} Tons</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Área requerida en contacto con el suelo (A_req):</span>
                      <span className="font-mono font-bold text-slate-800">{zapAreq.toFixed(4)} m² ({(zapAreq * 10000).toFixed(0)} cm²)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Área real construida para obra ($B \times L$):</span>
                      <span className="font-mono font-bold text-emerald-700">{zapAactual.toFixed(2)} m²</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Peralte efectivo Zapata ($d = h_z - 7.5cm$):</span>
                      <span className="font-mono font-bold text-slate-800">{(zapD * 100).toFixed(1)} cm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Perímetro critico de Punzonamiento ($b_o$):</span>
                      <span className="font-mono font-bold text-slate-800">{zapBo.toFixed(2)} m ({(zapBo * 100).toFixed(0)} cm)</span>
                    </div>
                  </div>
                </div>

                {/* DETAILED FORMULAS AND COMPLIANCE CHECK FOR ZAPATAS */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 mt-4 space-y-3" id="formulas-compliance-zapatas">
                  <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                    Ecuaciones y Criterios RNE - ACI Integrados
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-700">
                    {/* AREA DE ZAPATA CARD */}
                    <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1.5 shadow-xs">
                      <span className="text-[9px] font-black text-slate-450 uppercase block">Cálculo de Área ($A_Z$):</span>
                      <div className="bg-slate-900 text-slate-100 font-mono text-[10px] p-1.5 rounded text-center">
                        {"A_Z = P_serv / q_adm"}
                      </div>
                      <div className="text-[10px] space-y-1 mt-1 font-medium leading-relaxed">
                        <p>• Carga de sevicio: <strong>{zapPservTons.toFixed(2)} Tons</strong></p>
                        <p>• Sobrecosto (10%): <strong>{zapPtotal.toFixed(2)} Tons</strong></p>
                        <p>• Capacidad Suelo ($q_a$): <strong>{zapQa.toFixed(2)} kg/cm²</strong> ({zapQaTm2} T/m²)</p>
                        <p className="pt-1.5 border-t border-slate-100 text-[9.5px]">
                          Cálculo: {zapPtotal.toFixed(2)} / {zapQaTm2} = <strong className="text-indigo-750">{zapAreq.toFixed(3)} m²</strong> (Obra real: <strong className="text-emerald-700">{zapAactual.toFixed(2)} m²</strong>)
                        </p>
                      </div>
                    </div>

                    {/* PERALTE DE COMPACTACION LP CARD */}
                    <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1.5 shadow-xs">
                      <span className="text-[9px] font-black text-slate-450 uppercase block">Peralte Mínimo por Anclaje ($L_P$):</span>
                      <div className="bg-slate-900 text-slate-100 font-mono text-[10px] p-1.5 rounded text-center">
                        {"L_P = [ 0.075 * f_y / √f'_c ] * d_b + 0.10 m"}
                      </div>
                      <div className="text-[10px] space-y-1 mt-1 font-medium leading-relaxed">
                        <p>• Fierro Zapata ($d_b$): <strong>{COMMERCIAL_BARS[zapDbIndex].diameterInch}</strong> ({COMMERCIAL_BARS[zapDbIndex].dbCm.toFixed(3)} cm)</p>
                        <p>• Fluencia $f_y$ (Acero): <strong>420 MPa</strong></p>
                        <p>• Concreto $f'_c$ (Suelo): <strong>21 MPa</strong> (210 kg/cm²)</p>
                        <p className="pt-1.5 border-t border-slate-100 text-[9.5px]">
                          Requerido $L_P$: <strong className="text-indigo-750">{zapLp.toFixed(3)} m</strong> ({ (zapLp * 100).toFixed(1) } cm)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE COMPLIANCE BADGES */}
                  <div className="p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-bold leading-normal border transition-all bg-white shadow-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase text-slate-400 font-black block">Validación de Anclaje de Columna vs Espesor Zapata ($h_z$):</span>
                      <p className="text-slate-700 text-[10.5px]">
                        Espesor actual: <strong>{zapHz.toFixed(2)} m</strong> • Peralte Requerido $L_P$: <strong>{zapLp.toFixed(2)} m</strong>
                      </p>
                    </div>

                    {zapHz >= zapLp ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full border border-emerald-250 uppercase font-black tracking-wider shadow-xs shrink-0 inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Cumple Anclaje (h_z ≥ L_P)
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-700 text-[10px] px-2.5 py-1 rounded-full border border-rose-250 uppercase font-black tracking-wider shadow-xs shrink-0 inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
                        hz insuficiente (Aumentar hz)
                      </span>
                    )}
                  </div>
                </div>

                {/* VISUAL DIAGRAM */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 space-y-3 mt-4" id="graphic-zapatas">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Vista de Planta de Zapata con Columnado Concéntrico:</span>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-center items-center h-36 relative">
                    {/* Footing body */}
                    <div className="border-4 border-slate-800 bg-slate-100 shadow-xs flex items-center justify-center relative rounded-md" style={{ width: "120px", height: "120px" }}>
                      {/* Column block */}
                      <div className="w-8 h-8 bg-slate-900 text-white font-mono text-[8px] font-bold flex items-center justify-center shadow-xs rounded">COL</div>
                      
                      {/* Punching shear dashed perimeter */}
                      <div className="absolute border border-dashed border-red-500 rounded" style={{ width: "56px", height: "56px" }}></div>
                      
                      {/* Left-right arrows and dimensions */}
                      <div className="absolute -bottom-6 left-0 right-0 text-center font-mono text-[9px] font-bold text-slate-800">
                        B = {zapB.toFixed(2)} m
                      </div>
                      <div className="absolute -right-22 top-0 bottom-0 flex items-center justify-center font-mono text-[9px] font-bold text-slate-800">
                        L = {zapL.toFixed(2)} m
                      </div>
                      <div className="absolute -left-20 top-0 bottom-0 flex flex-col justify-center font-semibold text-[8px] text-red-650 leading-tight">
                        <span>Línea roja:</span>
                        <span>Frente Crítico</span>
                        <span>a d/2 de cara</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-slate-500 leading-normal border-t border-slate-101 pt-1.5 mt-1">
                    * La Norma E.050 de Suelos exige un factor de seguridad de 3 para la capacidad última. Para zapatas, el peralte total $h_z$ no debe ser inferior a 40 cm para garantizar un correcto empotramiento espacial.
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION CARD FOR ZAPATAS */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden" id="card-print-zapatas">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de zapatas?</h4>
                  <p className="text-[10px] text-slate-500">Muestra el cumplimiento del área requerida total conforme a la capacidad portante admisible de la Norma de Suelos.</p>
                </div>
              </div>
              <button
                id="btn-print-zapatas"
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "losas_macizas" && (
          <div className="space-y-6" id="panel-losas-macizas">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-losas-macizas">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 9
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Losas Macizas E.060
                    </h2>
                  </div>
                  <button
                    id="btn-reset-macizas"
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Tipo de Losa Maciza: Unidireccional o Bidireccional */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Configuración de Armado
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMacizType("unidireccional")}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          macizType === "unidireccional"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        En una Dirección
                      </button>
                      <button
                        type="button"
                        onClick={() => setMacizType("bidireccional")}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          macizType === "bidireccional"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        En dos Direcciones
                      </button>
                    </div>
                  </div>

                  {/* Luz Libre Principal (m) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-macizL" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        {macizType === "unidireccional" ? "Luz Libre Principal (L)" : "Luz Libre Corta ($L_n$)"} de Losa
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(macizL * 100).toFixed(0)} cm)</span>
                    </div>
                    <input
                      id="input-macizL"
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="15"
                      value={macizL}
                      onChange={(e) => setMacizL(parseFloat(e.target.value) || 4.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Segunda Luz (solo para bidireccional) */}
                  {macizType === "bidireccional" && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label htmlFor="input-macizL2" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                          Luz Libre Larga de Losa
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">({(macizL2 * 100).toFixed(0)} cm)</span>
                      </div>
                      <input
                        id="input-macizL2"
                        type="number"
                        step="0.05"
                        min="0.5"
                        max="15"
                        value={macizL2}
                        onChange={(e) => setMacizL2(parseFloat(e.target.value) || 5.0)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  )}

                  {/* Condiciones de Apoyo (Solo unidireccional) */}
                  {macizType === "unidireccional" && (
                    <div className="space-y-1.5" id="support-macizas">
                      <label htmlFor="select-macizSupport" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Condición de Apoyo Estructural
                      </label>
                      <select
                        id="select-macizSupport"
                        value={macizSupport}
                        onChange={(e: any) => setMacizSupport(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                      >
                        <option value="simplemente_apoyada">Simplemente Apoyada (L / 20)</option>
                        <option value="un_extremo_continuo">Un Extremo Continuo (L / 24)</option>
                        <option value="ambos_extremos_continuos">Ambos Extremos Continuos (L / 28)</option>
                        <option value="cantilever">Ménsula o Voladizo (L / 10)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between print:border print:shadow-none" id="outputs-losas-macizas-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Espesor Requerido para Losa Maciza (RNE E.060 Art 9.5.2)
                  </h3>

                  {/* Big Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Espesor Comercial Losa Maciza (H)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {macizH.toFixed(2)} m
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({(macizH * 100).toFixed(0)} cm)</span>
                    
                    <div className="mt-3 py-2 border-t border-slate-800 text-[11px] text-slate-350">
                      Espesor mínimo absoluto RNE para losas macizas estructurales de concreto: <strong className="text-white">9 cm (0.09 m)</strong>.
                    </div>
                  </div>

                  {/* Steps list */}
                  <div className="mt-5 space-y-2 text-xs text-slate-600" id="limits-macizas">
                    <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Verificación de Límites de Deformación Directa:</span>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Fórmula Teórica de Espantamiento Aplicada:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {macizType === "unidireccional" 
                          ? `h_base = L / ${macizSupport === "simplemente_apoyada" ? "20" : macizSupport === "un_extremo_continuo" ? "24" : macizSupport === "ambos_extremos_continuos" ? "28" : "10"}`
                          : "h_base = Perímetro / 180"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-semibold">Espesor Mínimo Teórico calculado (h_teor):</span>
                      <span className="font-mono font-bold text-slate-800">{(macizHtheor * 100).toFixed(1)} cm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Criterio RNE E.060 (Losa sin Encofrado de Viguetas):</span>
                      <span className="font-mono font-bold text-emerald-700">Satisfactorio (H ≥ {macizH * 100} cm)</span>
                    </div>
                  </div>
                </div>

                {/* GRAPHIC CROSS SECTION */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 flex items-center gap-6 mt-4" id="graphic-macizas">
                  <div className="w-24 bg-slate-400 h-10 border-y-4 border-slate-700 shrink-0 relative flex items-center justify-center font-bold text-white text-xs">
                    CONCRETO
                    {/* Width tag */}
                    <div className="absolute -right-24 top-0 bottom-0 flex items-center font-mono text-[9px] font-black text-slate-800">
                      H = {(macizH * 100).toFixed(0)} cm
                    </div>
                  </div>

                  <div className="text-[11px] leading-relaxed text-slate-500">
                    <span className="font-extrabold text-slate-800 block mb-0.5">💡 Ventaja de Losa Maciza:</span>
                    Las losas macizas proveen mayor aislamiento acústico, excelente resistencia a cargas pesadas dinámicas y óptimo diafragma rígido sismorresistente.
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION CARD FOR LOSAS MACIZAS */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden" id="card-print-macizas">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de losas macizas?</h4>
                  <p className="text-[10px] text-slate-500">Genera un reporte técnico de cumplimiento del Art. 9.5.2 de la Norma E.060.</p>
                </div>
              </div>
              <button
                id="btn-print-macizas"
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "muros" && (
          <div className="space-y-6" id="panel-muros">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-muros">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 10
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Muros y Placas de Concreto
                    </h2>
                  </div>
                  <button
                    id="btn-reset-muros"
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Tipo de Muro: Placa o MDL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Categoría de Muro de Carga
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWallType("muro_corte")}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          wallType === "muro_corte"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Placa / Muro de Corte
                      </button>
                      <button
                        type="button"
                        onClick={() => setWallType("muro_ductilidad_limitada")}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          wallType === "muro_ductilidad_limitada"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Ductilidad Limitada
                      </button>
                    </div>
                  </div>

                  {/* Altura de piso libre */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-wallH" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Altura Libre de Piso ($h_s$) en metros
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(wallH * 100).toFixed(0)} cm)</span>
                    </div>
                    <input
                      id="input-wallH"
                      type="number"
                      step="0.05"
                      min="1.50"
                      max="10.0"
                      value={wallH}
                      onChange={(e) => setWallH(parseFloat(e.target.value) || 2.80)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Largo del Muro */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-wallL" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Largo del Muro ($L_m$) en metros
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">({(wallL * 100).toFixed(0)} cm)</span>
                    </div>
                    <input
                      id="input-wallL"
                      type="number"
                      step="0.10"
                      min="0.50"
                      max="30.00"
                      value={wallL}
                      onChange={(e) => setWallL(parseFloat(e.target.value) || 4.50)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Número de pisos MDL */}
                  {wallType === "muro_ductilidad_limitada" && (
                    <div className="space-y-1.5" id="layers-muros">
                      <label htmlFor="input-wallNpisos" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Número de Pisos total del edificio
                      </label>
                      <input
                        id="input-wallNpisos"
                        type="number"
                        min="1"
                        max="100"
                        value={wallNpisos}
                        onChange={(e) => setWallNpisos(parseInt(e.target.value) || 5)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-muros-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Predimensionamiento de Espesor de Muro de Concreto
                  </h3>

                  {/* Big Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Espesor Técnico Comercial Recomendado</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {wallT.toFixed(2)} m
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({(wallT * 100).toFixed(0)} cm)</span>
                    
                    <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-350 font-semibold" id="conditions-muros">
                      <div className="flex justify-between items-center">
                        <span>Largo total del muro:</span>
                        <strong className="text-white">{wallL.toFixed(2)} m</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Peralte de esbeltez normativo mínimo ($h_s / 25$):</span>
                        <strong className="text-white font-mono">{(wallH / 25 * 100).toFixed(1)} cm ({ (wallH / 25).toFixed(3) } m)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Limits and text check */}
                  {wallType === "muro_corte" ? (
                    <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[11.5px] leading-relaxed text-indigo-950 mt-4" id="corte-notebox">
                      <span className="font-extrabold text-xs block mb-1">🏗️ Capítulo 21 (Placas Sismorresistentes):</span>
                      Por control sismorresistente frente al pandeo lateral local, el Reglamento Nacional de Edificaciones (RNE E.060) especifica que el espesor de placas sismorresistentes no debe ser inferior a 15 cm (0.15 m) en zonas sísmicas 3 y 4.
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11.5px] leading-relaxed text-amber-950 mt-4" id="mdl-notebox">
                      <span className="font-extrabold text-xs block mb-1">🏙️ Capítulo 22 (Muros de Ductilidad Limitada):</span>
                      En sistemas MDL de concreto armado peruanos, se usan espesores estándar de 10 cm (0.10 m) para edificaciones hasta 7 pisos para agilizar el encofrado y la dosificación de concreto fluido de piedra chica. Muros con más de 7 pisos aumentan el espesor a 12 cm o 15 cm por fines de pandeo.
                    </div>
                  )}
                </div>

                {/* GRAPHIC CROSS SECTION */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 space-y-3 mt-4" id="graphic-muros">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Vista Isométrica Tridimensional de Muro Proyectado:</span>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-center items-center h-36 relative overflow-hidden">
                    {/* Wall box perspective */}
                    <div className="relative border-2 border-slate-800 bg-slate-200/50 shrink-0" style={{ width: "160px", height: "80px" }}>
                      {/* Depth line */}
                      <div className="absolute top-0 right-0 bottom-0 w-[20px] bg-slate-350 border-l border-slate-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800 font-mono text-xs">
                        {wallType === "muro_corte" ? "PLACA DE MURO CORTE" : "MURO MDL"}
                      </div>
                      
                      {/* Dimensions tags */}
                      <div className="absolute -bottom-6 left-0 right-0 text-center font-mono text-[9px] font-bold text-slate-800">
                        Largo = {wallL.toFixed(2)} m
                      </div>
                      <div className="absolute -right-22 top-0 bottom-0 flex items-center font-mono text-[9px] font-bold text-slate-800">
                        Altura = {wallH.toFixed(2)} m
                      </div>
                      <div className="absolute -left-20 top-0 bottom-0 flex items-center font-mono text-[9px] font-extrabold text-indigo-700">
                        Espesor = {(wallT * 100).toFixed(0)} cm
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* PRINT OPTION CARD FOR MUROS */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden" id="card-print-muros">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Printer className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">¿Deseas imprimir el reporte de muros y placas?</h4>
                  <p className="text-[10px] text-slate-500">Genera la memoria de cálculo técnica de espesor contra pandeo bajo las especificaciones de la Norma E.060.</p>
                </div>
              </div>
              <button
                id="btn-print-muros"
                onClick={handlePrintTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Imprimir Reporte Técnico
              </button>
            </div>
          </div>
        )}

        {selectedTemplate === "combinaciones" && (
          <div className="space-y-6" id="panel-combinaciones">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-combinaciones">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 11
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Combinaciones de Carga
                    </h2>
                  </div>
                  <button
                    id="btn-reset-comb"
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Carga Muerta */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-combD" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Carga Muerta ($D$ / Carga Permanente) en t/m o tn
                    </label>
                    <input
                      id="input-combD"
                      type="number"
                      step="0.5"
                      min="0"
                      value={combD}
                      onChange={(e) => setCombD(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Carga Viva */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-combL" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Carga Viva ($L$ / Sobrecarga) en t/m o tn
                    </label>
                    <input
                      id="input-combL"
                      type="number"
                      step="0.5"
                      min="0"
                      value={combL}
                      onChange={(e) => setCombL(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Sismo X */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-combWx" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Sismo en Dirección X ($W_x$ / $S_x$) en t/m o tn
                    </label>
                    <input
                      id="input-combWx"
                      type="number"
                      step="0.5"
                      value={combWx}
                      onChange={(e) => setCombWx(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Sismo Y */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-combWy" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Sismo en Dirección Y ($W_y$ / $S_y$) en t/m o tn
                    </label>
                    <input
                      id="input-combWy"
                      type="number"
                      step="0.5"
                      value={combWy}
                      onChange={(e) => setCombWy(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-combinaciones-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Combinaciones Sismorresistentes de Carga Requerida (RNE E.060 Cap. 9)
                  </h3>

                  {/* Big Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Resistencia Requerida Máxima (U_max)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {uMax.toFixed(2)} tn
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">Este valor absoluto rige el diseño de los elementos estructurales.</span>
                  </div>

                  {/* Load combination lists */}
                  <div className="mt-4 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Detalle de combinaciones normativas:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U1: 1.4D + 1.7L:</span>
                        <span className="font-extrabold text-slate-800">{u1.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U2: 1.25(D+L) + Wx:</span>
                        <span className="font-extrabold text-slate-800">{u2.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U3: 1.25(D+L) - Wx:</span>
                        <span className="font-extrabold text-slate-800">{u3.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U4: 1.25(D+L) + Wy:</span>
                        <span className="font-extrabold text-slate-800">{u4.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U5: 1.25(D+L) - Wy:</span>
                        <span className="font-extrabold text-slate-800">{u5.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U6: 0.9D + Wx:</span>
                        <span className="font-extrabold text-slate-800">{u6.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U7: 0.9D - Wx:</span>
                        <span className="font-extrabold text-slate-800">{u7.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-bold">U8: 0.9D + Wy:</span>
                        <span className="font-extrabold text-slate-800">{u8.toFixed(2)}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between col-span-1 sm:col-span-2">
                        <span className="text-slate-500 font-bold">U9: 0.9D - Wy:</span>
                        <span className="font-extrabold text-slate-800">{u9.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[11.5px] leading-relaxed text-indigo-950 mt-4" id="comb-notebox">
                    <span className="font-extrabold text-xs block mb-1">🏗️ Norma E.060 - Capítulo 9 (Resistencia y Sismicidad):</span>
                    El cálculo calcula la envolvente sismorresistente del reglamento peruano. La carga muerta actúa de forma permanente ($1.4D$), mientras que la sismicidad requiere factores combinados para prever tanto cargas gravitacionales máximas ($1.25$ factor amplificado) como condiciones de sismo con cargas gravitatorias reducidas ($0.9D$) previniendo posibles efectos de levantamiento e inercia.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "cortante_basal" && (
          <div className="space-y-6" id="panel-cortante-basal">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-cortante-basal">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 12
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Cortante Basal Estático
                    </h2>
                  </div>
                  <button
                    id="btn-reset-basal"
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Factor Zona Z */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Zona Sísmica (Factor $Z$)
                    </label>
                    <select
                      value={basalZVal}
                      onChange={(e) => setBasalZVal(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="0.45">Zona 4 - Alta Sismicidad (Z = 0.45)</option>
                      <option value="0.35">Zona 3 - Sismicidad Media-Alta (Z = 0.35)</option>
                      <option value="0.25">Zona 2 - Sismicidad Media-Baja (Z = 0.25)</option>
                      <option value="0.10">Zona 1 - Baja Sismicidad (Z = 0.10)</option>
                    </select>
                  </div>

                  {/* Factor Uso U */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Categoría de Edificación (Factor $U$)
                    </label>
                    <select
                      value={basalUVal}
                      onChange={(e) => setBasalUVal(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="1.5">Categoría A - Edificación Esencial (U = 1.5)</option>
                      <option value="1.3">Categoría B - Edificación Importante (U = 1.3)</option>
                      <option value="1.0">Categoría C - Edificación Común (U = 1.0)</option>
                    </select>
                  </div>

                  {/* Suelo S */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Perfil de Suelo (Factor $S$)
                    </label>
                    <select
                      value={basalSProfile}
                      onChange={(e) => setBasalSProfile(e.target.value as "S0" | "S1" | "S2" | "S3")}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="S0">Roca Dura / Muy Rígida (S0)</option>
                      <option value="S1">Roca / Suelos Muy Rígidos (S1)</option>
                      <option value="S2">Suelos Intermedios (S2)</option>
                      <option value="S3">Suelos Blandos / Flexibles (S3)</option>
                    </select>
                  </div>

                  {/* Cociente C */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-basalC" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Factor de Amplificación Sísmica ($C$)
                    </label>
                    <input
                      id="input-basalC"
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="3.0"
                      value={basalCVal}
                      onChange={(e) => setBasalCVal(parseFloat(e.target.value) || 2.5)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Reducción R */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-basalR" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Coeficiente de Reducción Sísmica ($R$)
                    </label>
                    <input
                      id="input-basalR"
                      type="number"
                      step="1"
                      min="1"
                      max="10"
                      value={basalRVal}
                      onChange={(e) => setBasalRVal(parseInt(e.target.value) || 8)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Peso de Edificación P */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-basalP" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Peso Total de Edificación ($P$) en Toneladas (tn)
                    </label>
                    <input
                      id="input-basalP"
                      type="number"
                      step="10"
                      min="1"
                      value={basalPVal}
                      onChange={(e) => setBasalPVal(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-cortante-basal-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Fuerza Cortante en la Base ($V$) (RNE E.030 Art. 25)
                  </h3>

                  {/* Big Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Fuerza Cortante Basal Calculada ($V$)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {basalV.toFixed(2)} tn
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">Representa el cortante sismorresistente total estático actuante en la base.</span>
                  </div>

                  {/* Parameters lists */}
                  <div className="mt-4 space-y-2 text-xs" id="basal-details">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Factores Obtenidos de Rigidez y Suelo:</span>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold">Valor Z:</span>
                        <strong className="text-slate-800">{basalZVal.toFixed(2)}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold">Valor U:</span>
                        <strong className="text-slate-800">{basalUVal.toFixed(1)}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold">Valor C:</span>
                        <strong className="text-slate-800">{basalCVal.toFixed(1)}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold">Factor Suelo S:</span>
                        <strong className="text-slate-800">{basalSVal.toFixed(2)}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between col-span-2">
                        <span className="text-slate-500 font-semibold">Relación C / R:</span>
                        <strong className={`font-mono ${isRatioRestricted ? "text-amber-600 font-extrabold" : "text-slate-800"}`}>
                          {basalRatioCR.toFixed(3)} {isRatioRestricted ? "(Restringido a ≥ 0.11 por E.030)" : ""}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[11.5px] leading-relaxed text-indigo-950 mt-4" id="basal-notebox">
                    <span className="font-extrabold text-xs block mb-1">🏗️ Norma E.030 - Artículo 25 (Cortante en la Base):</span>
                    La fuerza cortante total en la base (V) correspondiente a la dirección considerada se determina con la ecuación estructural peruana: V = (Z * U * C * S / R) * P. La norma sismorresistente exige de manera explícita que el valor de la relación C/R no se considere menor que 0.11.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "control_calidad" && (
          <div className="space-y-6" id="panel-control-calidad">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* INPUT PANEL */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-control-calidad">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 13
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Control de Calidad (E.060)
                    </h2>
                  </div>
                  <button
                    id="btn-reset-qc"
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* f'c de diseño */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-qcFc" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Resistencia de Diseño (f'c) en kg/cm²
                    </label>
                    <input
                      id="input-qcFc"
                      type="number"
                      step="10"
                      min="140"
                      max="1000"
                      value={qcFcVal}
                      onChange={(e) => setQcFcVal(parseInt(e.target.value) || 210)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Ensayo 1 */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-qcE1" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Resistencia de Probeta 1 ($E_1$) en kg/cm²
                    </label>
                    <input
                      id="input-qcE1"
                      type="number"
                      step="5"
                      min="50"
                      value={qcE1}
                      onChange={(e) => setQcE1(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Ensayo 2 */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-qcE2" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Resistencia de Probeta 2 ($E_2$) en kg/cm²
                    </label>
                    <input
                      id="input-qcE2"
                      type="number"
                      step="5"
                      min="50"
                      value={qcE2}
                      onChange={(e) => setQcE2(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Ensayo 3 */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-qcE3" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Resistencia de Probeta 3 ($E_3$) en kg/cm²
                    </label>
                    <input
                      id="input-qcE3"
                      type="number"
                      step="5"
                      min="50"
                      value={qcE3}
                      onChange={(e) => setQcE3(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* CONCRETE EVOLUTION AGE IN TIME */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-qcAgeDays" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                        Edad de Curado del Concreto ($t$ en Días)
                      </label>
                      <span className="text-[10px] font-mono text-indigo-700 font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{qcAgeDays} días</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        id="input-qcAgeDays"
                        type="range"
                        min="1"
                        max="28"
                        value={qcAgeDays}
                        onChange={(e) => setQcAgeDays(parseInt(e.target.value) || 28)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={qcAgeDays}
                        onChange={(e) => setQcAgeDays(parseInt(e.target.value) || 28)}
                        className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-xs text-slate-800 shrink-0"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 block leading-normal font-medium">
                      Estima la ganancia de resistencia esperada en obra para programar descimbrado temprano de encofrados.
                    </span>
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-control-calidad-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Aceptación Oficial del Concreto (RNE E.060 Cap. 5)
                  </h3>

                  {/* Big Hero Result */}
                  <div className={`p-5 rounded-2xl relative overflow-hidden mt-4 transition-all ${qcPassed ? "bg-emerald-900 border border-emerald-500/20 text-white" : "bg-rose-950 border border-rose-500/20 text-white"}`}>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold font-mono opacity-85 block">Estado de Aceptación Técnica del Concreto</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1">
                      {qcPassed ? "APROBADO ✔" : "RECHAZADO ❌"}
                    </div>
                    <span className="text-xs block mt-1 opacity-90">
                      {qcPassed 
                        ? "Las probetas ensayadas cumplen cabalmente con todos los requerimientos de resistencia del RNE."
                        : "El ensayo no cumple con los intervalos requeridos de promedio o mínimos del reglamento peruano."}
                    </span>
                  </div>

                  {/* QC Calculations */}
                  <div className="mt-4 space-y-2 text-xs" id="qc-conditions">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Criterios de Verificación (E.060 Art 5.6.3):</span>
                    <div className="space-y-2 font-mono">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-800 block">1. Promedio de los 3 ensayos:</span>
                          <span className="text-[10px] text-slate-400">Requerido: ≥ {qcFcVal} kg/cm²</span>
                        </div>
                        <span className={`text-sm font-black ${qcAvg >= qcFcVal ? "text-emerald-600" : "text-rose-600"}`}>
                          {qcAvg.toFixed(1)} kg/cm²
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-800 block">2. Ensayo mínimo individual (E_min):</span>
                          <span className="text-[10px] text-slate-400">Requerido: ≥ {qcFcVal - 35} kg/cm² (f'c - 35)</span>
                        </div>
                        <span className={`text-sm font-black ${qcMin >= (qcFcVal - 35) ? "text-emerald-600" : "text-rose-600"}`}>
                          {qcMin} kg/cm²
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11.5px] leading-relaxed text-amber-950 mt-4" id="qc-notebox">
                    <span className="font-extrabold text-xs block mb-1">🏗️ Capítulo 5 de la Norma E.060 (Verificación de Concreto):</span>
                    El nivel de resistencia de un grupo de probetas se considera satisfactorio si se cumplen simultáneamente ambas condiciones: el promedio aritmético de tres ensayos de resistencia consecutivos cualesquiera es igual o mayor que f'c, y ningún ensayo de resistencia individual (promedio de dos probetas del mismo ensayo) es menor que el f'c en más de 35 kg/cm².
                  </div>

                  {/* TEMPORAL CONCRETE EVOLUTION CARD */}
                  <div className="p-4 bg-indigo-50/40 border border-indigo-200/50 rounded-xl space-y-3 mt-4" id="qc-evolution-time-card">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                        Evolución Temporal de la Resistencia ($f'_c$)
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">Modelo RNE E.060</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">Fórmula de Madurez del Concreto:</span>
                        <span className="font-mono text-[10.5px] bg-slate-900 text-slate-100 px-1.5 py-0.5 rounded">{"f'_c(t) = f'_c * [ t / (4 + 0.85*t) ]"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-inner">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Resistencia Calculada $f'_c({qcAgeDays}d)$:</span>
                          <span className="text-lg font-black font-mono text-indigo-750 block mt-0.5">
                            {qcEvolutionFct.toFixed(1)} <span className="text-xs font-bold text-slate-500">kg/cm²</span>
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-inner">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Porcentaje de Maduración:</span>
                          <span className="text-lg font-black font-mono text-emerald-700 block mt-0.5">
                            {((qcEvolutionFct / qcFcVal) * 100).toFixed(1)}% <span className="text-[10px] font-bold text-slate-500">de f'c</span>
                          </span>
                        </div>
                      </div>

                      {/* Percentage progress bar */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (qcEvolutionFct / qcFcVal) >= 0.90 
                                ? "bg-emerald-600" 
                                : (qcEvolutionFct / qcFcVal) >= 0.70 
                                  ? "bg-indigo-600" 
                                  : "bg-amber-500"
                            }`} 
                            style={{ width: `${Math.min(100, (qcEvolutionFct / qcFcVal) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                          <span>Día 1</span>
                          <span>Día 7 (~67%)</span>
                          <span>Día 14 (~86%)</span>
                          <span>Día 28 (~100%)</span>
                        </div>
                      </div>

                      {/* Stripping recommendations based on E.060 guidelines */}
                      <div className="p-2.5 bg-white border border-slate-150 rounded-lg text-[10.5px] leading-relaxed text-slate-700 space-y-1">
                        <span className="font-bold text-indigo-950 block">🛠️ Viabilidad de Desencofrado & Recomendación de Obra:</span>
                        {qcAgeDays < 4 ? (
                          <p className="text-rose-700 font-extrabold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full shrink-0"></span>
                            PELIGRO: El concreto está demasiado verde. Prohibido manipular o remover encofrados (Curado húmedo obligatorio).
                          </p>
                        ) : qcAgeDays < 7 ? (
                          <p className="text-amber-700 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full shrink-0"></span>
                            CURADO INICIAL CRÍTICO: Viable desencofrado de costeros de columnas o elementos que no carguen gravedad directa.
                          </p>
                        ) : qcAgeDays < 14 ? (
                          <p className="text-indigo-700 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                            MEDIO TERMINO: Se puede programar desencofrado seguro de muros, pantallas y encofrados laterales de vigas.
                          </p>
                        ) : qcAgeDays < 28 ? (
                          <p className="text-emerald-700 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                            ADECUADO: Seguro para desencofrar fondos de losas, vigas principales y elementos sometidos a flexión directa.
                          </p>
                        ) : (
                          <p className="text-emerald-850 font-black flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full shrink-0 animate-ping"></span>
                            MADUREZ TOTAL: Resistencia del 100% alcanzada. Ideal para colocación de cargas vivas superiores y uso definitivo.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "metrado_acero" && (
          <div className="space-y-6" id="panel-metrado-acero">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* INPUT PANEL */}
              <div className="md:col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-metrado-acero">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 14
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Metrado de Acero de Refuerzo
                    </h2>
                  </div>
                  <button
                    id="btn-reset-steel"
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Diámetro de barra */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Diámetro de Barra Comercial (RNE / ASTM)
                    </label>
                    <select
                      value={steelDiameter}
                      onChange={(e) => setSteelDiameter(e.target.value as "3/8" | "1/2" | "5/8" | "3/4" | "1")}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="3/8">ø 3/8" (0.560 kg/m)</option>
                      <option value="1/2">ø 1/2" (0.994 kg/m)</option>
                      <option value="5/8">ø 5/8" (1.552 kg/m)</option>
                      <option value="3/4">ø 3/4" (2.235 kg/m)</option>
                      <option value="1">ø 1" (3.973 kg/m)</option>
                    </select>
                  </div>

                  {/* Longitud total */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-steelLength" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Longitud Acumulada de Barras ($L$) en metros
                    </label>
                    <input
                      id="input-steelLength"
                      type="number"
                      step="5"
                      min="0.1"
                      value={steelLength}
                      onChange={(e) => setSteelLength(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-metrado-acero-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Resumen de Peso de Refuerzo Metrado (Kilogramos)
                  </h3>

                  {/* Big Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Peso Total de Acero Proyectado</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {steelTotalWeight.toFixed(2)} kg
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({(steelTotalWeight / 1000).toFixed(3)} toneladas métricas)</span>
                  </div>

                  {/* Steel details */}
                  <div className="mt-4 space-y-2 text-xs" id="steel-details">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Parámetros Físicos del Diámetro:</span>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold">Diámetro Nominal:</span>
                        <strong className="text-slate-800">{steelDiameter}"</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold font-mono">Factor Lineal:</span>
                        <strong className="text-indigo-700">{steelFactor.toFixed(3)} kg/m</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between col-span-2">
                        <span className="text-slate-500 font-semibold text-left">Longitud de Barras Metrada:</span>
                        <strong className="text-slate-800 font-mono">{steelLength.toFixed(2)} metros</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[11.5px] leading-relaxed text-indigo-950 mt-4" id="steel-notebox">
                    <span className="font-extrabold text-xs block mb-1">🏗️ Norma Técnica de Metrados para Edificaciones (Perú):</span>
                    El metrado de acero de refuerzo de concreto armado se computa de acuerdo con la longitud neta acumulada de las especificaciones de diseño multiplicada por su peso nominal unitario por unidad de longitud oficial expresada en kilogramos de acero de refuerzo comercial.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "rendimiento_ladrillos" && (
          <div className="space-y-6" id="panel-rendimiento-ladrillos">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* INPUT PANEL */}
              <div className="md:col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="inputs-rendimiento-ladrillos">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 15
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Rendimiento de Ladrillo
                    </h2>
                  </div>
                  <button
                    id="btn-reset-brick"
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Tipo de aparejo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Tipo de Elemento / Aparejo de Muro
                    </label>
                    <div className="grid grid-cols-3 gap-1 px-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBrickElemType("soga");
                          setBrickL(0.24);
                          setBrickH(0.09);
                        }}
                        className={`py-2 rounded-xl border text-center font-bold text-[10px] sm:text-xs cursor-pointer transition-all ${
                          brickElemType === "soga"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Aparejo Soga
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrickElemType("cabeza");
                          setBrickL(0.13); // se usa ancho como L de aparejo de frente
                          setBrickH(0.09);
                        }}
                        className={`py-2 rounded-xl border text-center font-bold text-[10px] sm:text-xs cursor-pointer transition-all ${
                          brickElemType === "cabeza"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Aparejo Cabeza
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrickElemType("losa");
                          setBrickL(0.30); // bloque de arcilla de losa standar
                          setBrickH(0.15); // peralte 15 standard
                        }}
                        className={`py-2 rounded-xl border text-center font-bold text-[10px] sm:text-xs cursor-pointer transition-all ${
                          brickElemType === "losa"
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Losa Aligerada
                      </button>
                    </div>
                  </div>

                  {/* Largo del ladrillo */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-brickL" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Largo del ladrillo visto de frente ($L$) en metros
                    </label>
                    <input
                      id="input-brickL"
                      type="number"
                      step="0.01"
                      min="0.05"
                      max="1.0"
                      value={brickL}
                      onChange={(e) => setBrickL(parseFloat(e.target.value) || 0.24)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Alto del ladrillo */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-brickH" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Alto o Espesor de ladrillo de frente ($h$) en metros
                    </label>
                    <input
                      id="input-brickH"
                      type="number"
                      step="0.01"
                      min="0.05"
                      max="1.0"
                      value={brickH}
                      onChange={(e) => setBrickH(parseFloat(e.target.value) || 0.09)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Espesor de junta */}
                  {brickElemType !== "losa" && (
                    <div className="space-y-1.5">
                      <label htmlFor="input-brickJ" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                        Espesor de Junta de Mortero ($J_h$) en metros
                      </label>
                      <input
                        id="input-brickJ"
                        type="number"
                        step="0.005"
                        min="0.005"
                        max="0.05"
                        value={brickJ}
                        onChange={(e) => setBrickJ(parseFloat(e.target.value) || 0.015)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="md:col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none" id="outputs-rendimiento-ladrillos-panel">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Rendimiento por Metro Cuadrado/Lineal
                  </h3>

                  {/* Big Hero Result */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Unidades Comerciales Requeridas (con 5% desperdicio)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {Math.ceil(brickQty).toFixed(0)} und
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({brickQty.toFixed(2)} und exactas estimadas por m² o m lineal)</span>
                  </div>

                  {/* Render values */}
                  <div className="mt-4 space-y-2 text-xs" id="brick-efficiency">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Valores del Material Estándar:</span>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold">Valor Neto Sin Desperdicio:</span>
                        <strong className="text-slate-800">{(brickQty / 1.05).toFixed(2)} und</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold font-mono">Merma Estimada:</span>
                        <strong className="text-amber-600">5.0% (estándar RNE)</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between col-span-2">
                        <span className="text-slate-500 font-semibold">Fórmula Utilizada:</span>
                        <strong className="text-indigo-600">
                          {brickElemType === "losa" 
                            ? "C = 1 / [0.40 * (L_brick + 0.01)]" 
                            : "C = 1 / [(L_brick + J) * (H_brick + J)]"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[11.5px] leading-relaxed text-indigo-950 mt-4" id="brick-notebox">
                    <span className="font-extrabold text-xs block mb-1">🏗️ SENCICO & Norma Técnica de Metrados peruana:</span>
                    El análisis de rendimiento básico por unidad determina la cantidad de unidades de albañilería (ladrillo King Kong, pandereta o ladrillo de techo Hueco de arcilla) con un porcentaje prudente de 5% de merma o roturas en transporte o manipuleo en obra.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "sismo_junta" && (
          <div className="space-y-6" id="panel-sismo-junta">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 16 (E.030)
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Junta Sísmica y Choques
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="input-juntaH" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Altura total de la Edificación ($h$) en metros
                    </label>
                    <input
                      id="input-juntaH"
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="150"
                      value={juntaH}
                      onChange={(e) => setJuntaH(parseFloat(e.target.value) || 15.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-juntaNeighbor" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Altura del Edificio Vecino en metros (opcional)
                    </label>
                    <input
                      id="input-juntaNeighbor"
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="150"
                      value={juntaNeighborH}
                      onChange={(e) => setJuntaNeighborH(parseFloat(e.target.value) || 12.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Junta de Separación Sísmica Requerida (s)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-900 text-white p-4 rounded-xl relative overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Con Límite de Propiedad</span>
                      <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                        {(sismoSmin * 100).toFixed(1)} cm
                      </div>
                      <span className="text-[9.5px] opacity-75 font-mono">({sismoSmin.toFixed(3)} m)</span>
                    </div>

                    <div className="bg-slate-800 text-white p-4 rounded-xl relative overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Junta con Colindante Existente</span>
                      <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                        {(sismoSneighbor * 100).toFixed(1)} cm
                      </div>
                      <span className="text-[9.5px] opacity-75 font-mono">({sismoSneighbor.toFixed(3)} m)</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Criterios de la Norma E.030 (Art. 16):</span>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 font-sans">
                      <div className="flex justify-between items-center text-[11.5px]">
                        <span className="text-slate-500 font-medium font-mono">Fórmula Base (Límite de Propiedad):</span>
                        <strong className="text-indigo-600 font-mono">s = 0.006 * h &gt;= 0.03 m</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11.5px]">
                        <span className="text-slate-500 font-medium font-mono">Fórmula Especial (Choques vecinos):</span>
                        <strong className="text-amber-700 font-mono">s = 3 cm + 0.004 * (h - 6 m)</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        Nota: Toda estructura debe estar separada de las colindantes una distancia estándar s para evitar el choque sismorresistente perjudicial ("pounding effect").
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[11.5px] leading-relaxed text-indigo-950 mt-4">
                    <span className="font-extrabold text-xs block mb-1">🏗️ E.030 Diseño Sismorresistente - Art. 16.1:</span>
                    La junta nunca será menor que 3 centímetros (0.03 metros). Para juntas entre bloques del mismo propietario, se puede calcular como la raíz cuadrada de (s1² + s2²) basándose en los desplazamientos máximos calculados.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "carga_viento" && (
          <div className="space-y-6" id="panel-carga-viento">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 17 (E.020)
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Presión de Viento
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="input-windBaseV" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Velocidad Básica del Viento ($V$) en km/h
                    </label>
                    <input
                      id="input-windBaseV"
                      type="number"
                      step="5"
                      min="10"
                      max="250"
                      value={windBaseV}
                      onChange={(e) => setWindBaseV(parseFloat(e.target.value) || 75.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setWindBaseV(75.0)} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded hover:bg-slate-200 font-bold">Lima/Costa (75)</button>
                      <button onClick={() => setWindBaseV(90.0)} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded hover:bg-slate-200 font-bold">Chiclayo/Vientos (90)</button>
                      <button onClick={() => setWindBaseV(120.0)} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded hover:bg-slate-200 font-bold">Selva/Huracanes (120)</button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-windH" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                      Altura sobre terreno ($h$) en metros
                    </label>
                    <input
                      id="input-windH"
                      type="number"
                      step="0.5"
                      min="1"
                      max="150"
                      value={windH}
                      onChange={(e) => setWindH(parseFloat(e.target.value) || 12.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                      Coeficiente de Forma ($C$)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setWindC(0.8)}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border ${windC === 0.8 ? "bg-slate-900 text-white" : "bg-slate-50 border-slate-205"}`}
                      >
                        Sotavento + Barlovento (0.8)
                      </button>
                      <button
                        onClick={() => setWindC(1.3)}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border ${windC === 1.3 ? "bg-slate-900 text-white" : "bg-slate-50 border-slate-205"}`}
                      >
                        Superficie Plana Vertical (1.3)
                      </button>
                      <button
                        onClick={() => setWindC(0.7)}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border ${windC === 0.7 ? "bg-slate-900 text-white" : "bg-slate-50 border-slate-205"}`}
                      >
                        Techo Inclinado soga (0.7)
                      </button>
                      <button
                        onClick={() => setWindC(-0.6)}
                        className={`text-[10px] font-bold p-1.5 rounded-lg border ${windC === -0.6 ? "bg-slate-900 text-white" : "bg-slate-50 border-slate-205"}`}
                      >
                        Succión Sotavento (-0.6)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Carga o Presión Dinámica de Viento Calculada
                  </h3>

                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Presión de vento estática de diseño ($P_h$)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {Math.abs(windPh).toFixed(2)} kg/m²
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({windPh > 0 ? "Presión / Empuje" : "Succión / Presión Negativa"})</span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Resultados Auxiliares:</span>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold text-xs">Velocidad Diseño ($V_h$):</span>
                        <strong className="text-slate-800">{windVh.toFixed(1)} km/h</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                        <span className="text-slate-500 font-semibold text-xs">Factor de Altura:</span>
                        <strong className="text-indigo-700">{Math.pow(Math.max(10, windH) / 10, 0.22).toFixed(3)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50/50 border border-red-150 rounded-xl text-[11.5px] leading-relaxed text-red-950 mt-4">
                    <span className="font-extrabold text-xs block mb-1 text-red-900">⚠️ Limitación reglamentaria de velocidad mínima:</span>
                    De acuerdo con el RNE E.020, la velocidad de diseño del viento $V_h$ en cualquier altura nunca debe considerarse menor que la velocidad básica de viento $V$ especificada según el mapa de isotacas del Perú.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "densidad_muros" && (
          <div className="space-y-6" id="panel-densidad-muros">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 18 (E.070)
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Densidad Mínima de Muros
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="input-densidadZ" className="text-[10px] uppercase font-bold text-slate-500">Factor de Zona ($Z$)</label>
                      <select
                        id="input-densidadZ"
                        value={densidadZ}
                        onChange={(e) => setDensidadZ(parseFloat(e.target.value) || 0.45)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                      >
                        <option value="0.45">Zona 4 - Costa (0.45)</option>
                        <option value="0.35">Zona 3 - Sierra (0.35)</option>
                        <option value="0.25">Zona 2 - Selva (0.25)</option>
                        <option value="0.10">Zona 1 - Bajo Sismo (0.10)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="input-densidadU" className="text-[10px] uppercase font-bold text-slate-500">Uso Importancia ($U$)</label>
                      <select
                        id="input-densidadU"
                        value={densidadU}
                        onChange={(e) => setDensidadU(parseFloat(e.target.value) || 1.0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                      >
                        <option value="1.0">Común - Cat C (1.0)</option>
                        <option value="1.3">Hospedajes/Oficinas (1.3)</option>
                        <option value="1.5">Esenciales - Cat A (1.5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="input-densidadS" className="text-[10px] uppercase font-bold text-slate-500">Tipo de Suelo ($S$)</label>
                      <select
                        id="input-densidadS"
                        value={densidadS}
                        onChange={(e) => setDensidadS(parseFloat(e.target.value) || 1.05)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                      >
                        <option value="0.80">Roca Dura S0 (0.80)</option>
                        <option value="1.00">Suelo Muy Rígido S1 (1.00)</option>
                        <option value="1.05">Suelo Intermedio S2 (1.05)</option>
                        <option value="1.10">Suelo Blando S3 (1.10)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="input-densidadN" className="text-[10px] uppercase font-bold text-slate-500">Número de Pisos ($N$)</label>
                      <input
                        id="input-densidadN"
                        type="number"
                        min="1"
                        max="6"
                        value={densidadN}
                        onChange={(e) => setDensidadN(parseInt(e.target.value) || 3)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase">Geometría y Paredes de Edificación</h4>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="input-densidadAp" className="text-xs font-bold text-slate-500">Área de Planta Típica ($A_p$) en m²</label>
                      <input
                        id="input-densidadAp"
                        type="number"
                        min="10"
                        max="1000"
                        value={densidadAp}
                        onChange={(e) => setDensidadAp(parseFloat(e.target.value) || 120.0)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="input-densidadSumL" className="text-xs font-bold text-slate-500">Sumatoria Longitud Muros Cortantes ($\sum L$) en metros</label>
                      <input
                        id="input-densidadSumL"
                        type="number"
                        min="1"
                        max="200"
                        value={densidadSumL}
                        onChange={(e) => setDensidadSumL(parseFloat(e.target.value) || 25.0)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Espesor Efectivo de Muro ($t$)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setDensidadT(0.13)}
                          className={`text-xs p-1.5 rounded-lg border font-bold ${densidadT === 0.13 ? "bg-slate-900 text-white" : "bg-slate-50"}`}
                        >
                          Aparejo Soga (13 cm)
                        </button>
                        <button
                          onClick={() => setDensidadT(0.23)}
                          className={`text-xs p-1.5 rounded-lg border font-bold ${densidadT === 0.23 ? "bg-slate-900 text-white" : "bg-slate-50"}`}
                        >
                          Aparejo Cabeza (23 cm)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Verificación de Densidad de Muros
                  </h3>

                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl text-center font-bold text-xs uppercase ${densidadCumple ? "bg-emerald-50 text-emerald-800 border border-emerald-250 animate-pulse" : "bg-red-50 text-red-800 border border-red-250"}`}>
                    {densidadCumple 
                      ? "✅ CUMPLE REGLAMENTO E.070 (La densidad es adecuada)" 
                      : "❌ REFUERCE O SISMORRESISTA (Aumente muros o use concreto en placas)"}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Densidad Real Existente</span>
                      <div className="text-2xl font-black font-mono mt-1 text-slate-800">
                        {(densidadReal * 100).toFixed(2)}%
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-extrabold text-indigo-500 tracking-wider">Densidad Mínima Requerida</span>
                      <div className="text-2xl font-black font-mono mt-1 text-indigo-700">
                        {(densidadReq * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Valores de Trabajo del Muro:</span>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">Área total muros:</span>
                        <strong className="text-slate-800">{densidadAreaMuros.toFixed(2)} m²</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                        <span className="text-slate-500">Demanda Sísmica:</span>
                        <strong className="text-indigo-800">{densidadReq.toFixed(4)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] leading-relaxed text-slate-650 mt-4">
                    <span className="font-extrabold text-xs block mb-1 text-slate-800">🏗️ RNE E.070 Albañilería - Art. 19.1:</span>
                    La densidad requerida se rige bajo la fórmula: (Σ L * t) / Ap &gt;= (Z * U * S * N) / 56. Si la edificación no satisface esta exigencia mínima de rigidez en ambas direcciones de análisis, se deberán reemplazar muros de albañilería por placas de concreto armado.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "diseno_escaleras" && (
          <div className="space-y-6" id="panel-diseno-escaleras">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12 lg:col-span-12 xl:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 19 (E.060)
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Diseño de Escaleras C.A.
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="input-stairL" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      Luz libre horizontal ($L$) en metros
                    </label>
                    <input
                      id="input-stairL"
                      type="number"
                      step="0.1"
                      min="1"
                      max="15"
                      value={stairL}
                      onChange={(e) => setStairL(parseFloat(e.target.value) || 4.2)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-stairThickness" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      Peralte de Garganta ($t$) en metros
                    </label>
                    <input
                      id="input-stairThickness"
                      type="number"
                      step="0.01"
                      min="0.08"
                      max="0.5"
                      value={stairThickness}
                      onChange={(e) => setStairThickness(parseFloat(e.target.value) || 0.15)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <span className="text-[9px] text-slate-500 font-bold block">Sugerido (L/20): {(stairL / 20).toFixed(2)} m</span>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-stairPaso" className="text-xs font-semibold text-slate-500">Paso ($p$) m</label>
                    <input
                      id="input-stairPaso"
                      type="number"
                      step="0.01"
                      min="0.2"
                      max="0.5"
                      value={stairPaso}
                      onChange={(e) => setStairPaso(parseFloat(e.target.value) || 0.25)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-stairContra" className="text-xs font-semibold text-slate-500">Contrapaso ($cp$) m</label>
                    <input
                      id="input-stairContra"
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="0.35"
                      value={stairContra}
                      onChange={(e) => setStairContra(parseFloat(e.target.value) || 0.17)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-stairLiveLoad" className="text-xs font-semibold text-slate-500">Surcharge S/C kg/m²</label>
                    <input
                      id="input-stairLiveLoad"
                      type="number"
                      step="50"
                      min="100"
                      max="1000"
                      value={stairLiveLoad}
                      onChange={(e) => setStairLiveLoad(parseFloat(e.target.value) || 200)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-stairAcabados" className="text-xs font-semibold text-slate-500">Acabados kg/m²</label>
                    <input
                      id="input-stairAcabados"
                      type="number"
                      step="50"
                      min="50"
                      max="500"
                      value={stairAcabados}
                      onChange={(e) => setStairAcabados(parseFloat(e.target.value) || 100)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-12 xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Análisis de Esfuerzos y Acero Requerido
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-900 text-white p-4 rounded-xl relative overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Acero de Tracción Requerido (As)</span>
                      <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                        {stairAsFinal.toFixed(2)} cm²/m
                      </div>
                      <span className="text-[9.5px] opacity-75 font-mono">
                        {stairAsRequired > stairAsMin ? "Rige por flexión" : "Rige por acero mínimo (fraguado)"}
                      </span>
                    </div>

                    <div className="bg-slate-800 text-white p-4 rounded-xl relative overflow-hidden flex flex-col justify-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Espaciamiento Recomendado (Ø 1/2")</span>
                      <div className="text-lg font-black font-mono text-amber-300 mt-0.5">
                        Ø 1/2" @ {(1.29 / stairAsFinal * 100).toFixed(0)} cm
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        O bual: Ø 3/8" @ {(0.71 / stairAsFinal * 100).toFixed(0)} cm
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Parámetros Estructurales Adicionales:</span>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-[11px]">
                        <span className="text-slate-500">Ángulo Inclinación (θ):</span>
                        <strong className="text-slate-800">{stairThetaDeg.toFixed(1)}°</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-[11px]">
                        <span className="text-slate-500">Momento de Diseño (Mu):</span>
                        <strong className="text-indigo-800">{(stairMu / 1000).toFixed(2)} Tn-m/m</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-[11px] col-span-2">
                        <span className="text-slate-500">Carga Facturada de Diseño (Wu):</span>
                        <strong className="text-slate-800">{stairWu.toFixed(1)} kg/m²</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-[11.5px] leading-relaxed text-indigo-950 mt-4">
                    <span className="font-extrabold text-xs block mb-1">🏗️ RNE E.060 Concreto Armado - Cálculo de Cargas:</span>
                    El peso propio se amplifica por el ángulo de inclinación θ: la garganta trabaja a flexión con una luz nominal L, considerando apoyos rígidos. Los coeficientes de combinación típicos en el Perú son 1.4 de carga muerta y 1.7 de carga viva.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === "capacidad_portante" && (
          <div className="space-y-6" id="panel-capacidad-portante">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12 lg:col-span-12 xl:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Módulo 20 (E.050)
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase mt-1">
                      Capacidad Portante de Suelos (Terzaghi)
                    </h2>
                  </div>
                  <button
                    onClick={handleReset}
                    title="Restablecer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer text-slate-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1">
                    <label htmlFor="input-soilCohesion" className="text-xs font-bold text-slate-700">Cohesión (c) kg/cm²</label>
                    <input
                      id="input-soilCohesion"
                      type="number"
                      step="0.05"
                      min="0.00"
                      max="10.0"
                      value={soilCohesion}
                      onChange={(e) => setSoilCohesion(parseFloat(e.target.value) || 0.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1">
                    <label htmlFor="input-soilPhi" className="text-xs font-bold text-slate-700">Ángulo de Fricción (φ) °</label>
                    <input
                      id="input-soilPhi"
                      type="number"
                      step="1"
                      min="0"
                      max="50"
                      value={soilPhi}
                      onChange={(e) => setSoilPhi(parseFloat(e.target.value) || 26.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-soilGamma" className="text-xs font-semibold text-slate-500">Peso Específico Suelo (γ) Tn/m³</label>
                    <input
                      id="input-soilGamma"
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="2.5"
                      value={soilGamma}
                      onChange={(e) => setSoilGamma(parseFloat(e.target.value) || 1.8)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-soilDf" className="text-xs font-semibold text-slate-500">Profundidad de Desplante (Df) m</label>
                    <input
                      id="input-soilDf"
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="10.0"
                      value={soilDf}
                      onChange={(e) => setSoilDf(parseFloat(e.target.value) || 1.50)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-soilB" className="text-xs font-semibold text-slate-500">Ancho Mínimo de Cimentación (B) m</label>
                    <input
                      id="input-soilB"
                      type="number"
                      step="0.1"
                      min="0.4"
                      max="10.0"
                      value={soilB}
                      onChange={(e) => setSoilB(parseFloat(e.target.value) || 1.2)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-soilFS" className="text-xs font-semibold text-slate-500">Factor de Seguridad (FS)</label>
                    <input
                      id="input-soilFS"
                      type="number"
                      step="0.5"
                      min="1.5"
                      max="5.0"
                      value={soilFS}
                      onChange={(e) => setSoilFS(parseFloat(e.target.value) || 3.0)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                    <span className="text-[9px] text-indigo-700 font-bold block">Suelo normal: 3.0 (E.050)</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-12 xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5 print:border print:shadow-none">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Capacidad Admisible de Carga Calculada (Terzaghi)
                  </h3>

                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold font-mono text-xs">Capacidad Admisible de Trabajo del Suelo (q_adm)</span>
                    <div className="text-3xl font-black font-mono leading-none mt-1 text-emerald-400">
                      {soilQadmKg.toFixed(2)} kg/cm²
                    </div>
                    <span className="text-xs font-mono opacity-80 block mt-1">({soilQadm.toFixed(1)} Tn/m² o {soilQadm.toFixed(1)} kN/m²)</span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">Factores de Capacidad de Carga Analíticos:</span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-center">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 block font-bold">Nc (Cohesión)</span>
                        <strong className="text-slate-800 font-mono">{soilNc.toFixed(2)}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 block font-bold">Nq (Sobrecarga)</span>
                        <strong className="text-slate-800 font-mono">{soilNq.toFixed(2)}</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 block font-bold">Nγ (Gravedad)</span>
                        <strong className="text-slate-800 font-mono">{soilNgamma.toFixed(2)}</strong>
                      </div>
                    </div>
                    
                    <div className="p-2.5 bg-slate-55 rounded-xl border border-slate-150 flex justify-between font-mono text-[11.5px] mt-2">
                      <span className="text-slate-500 font-bold">Capacidad Última Terzaghi (q_ult):</span>
                      <strong className="text-indigo-800">{(soilQult / 10).toFixed(2)} kg/cm² ({soilQult.toFixed(1)} Tn/m²)</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-205 rounded-xl text-[11.5px] leading-relaxed text-slate-650 mt-4">
                    <span className="font-extrabold text-xs block mb-1">🏗️ RNE E.050 Suelos y Cimentaciones - Terzaghi Square Foundation:</span>
                    La fórmula empleada aplica factores de forma para zapatas cuadradas (sc = 1.3, sγ = 0.8): q_ult = 1.3 * c * Nc + q * Nq + 0.4 * γ * B * Nγ. Los parámetros de resistencia al corte φ y c se obtienen por el Ensayo de Corte Directo o Triaxial.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
