import ExcelJS from "exceljs";
import { MaterialProperties, DesignSpecifications, MixDesignResult } from "../types";

export async function exportToJuniorChillcceExcel(
  materials: MaterialProperties,
  specs: DesignSpecifications,
  result: MixDesignResult,
  projectName = "Mi Diseño de Mezcla"
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Diseño de Mezcla ACI 211.1");

  // Grid styling preferences
  worksheet.views = [{ showGridLines: true }];

  // Column widths
  worksheet.columns = [
    { width: 5 },   // A: Spacing
    { width: 42 },  // B: Parameter description
    { width: 14 },  // C: Value
    { width: 12 },  // D: Unit
    { width: 35 },  // E: Notes / Sub-calculations
    { width: 15 },  // F: Saco values
  ];

  // Helper for applying background fill to cell ranges
  const applyRangeColors = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    hexBgColor: string,
    hexTextColor = "000000",
    isBold = false,
    fontSize = 10,
    align: ExcelJS.Alignment["horizontal"] = "left"
  ) => {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = worksheet.getCell(r, c);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: hexBgColor.replace("#", "") },
        };
        cell.font = {
          name: "Segoe UI",
          size: fontSize,
          bold: isBold,
          color: { argb: hexTextColor.replace("#", "") },
        };
        cell.alignment = { horizontal: align, vertical: "middle" };
      }
    }
  };

  // Helper for setting cell value & styles
  const setCell = (
    rowNum: number,
    colNum: number,
    value: ExcelJS.CellValue,
    isBold = false,
    hexTextColor = "000000",
    align: ExcelJS.Alignment["horizontal"] = "left",
    numFmt?: string
  ) => {
    const cell = worksheet.getCell(rowNum, colNum);
    cell.value = value;
    cell.font = { name: "Segoe UI", size: 10, bold: isBold, color: { argb: hexTextColor.replace("#", "") } };
    cell.alignment = { horizontal: align, vertical: "middle" };
    if (numFmt) {
      cell.numFmt = numFmt;
    }
  };

  // Helper for borders
  const applyThinBorders = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    const thin = { style: "thin" as const, color: { argb: "CBD5E1" } };
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = worksheet.getCell(r, c);
        cell.border = { top: thin, left: thin, bottom: thin, right: thin };
      }
    }
  };

  // 1. HEADER TITLE BANNER (Junior Chillcce's Corporate aesthetic)
  worksheet.mergeCells("B2:E3");
  const mainHeader = worksheet.getCell(2, 2);
  mainHeader.value = "DISEÑO DE MEZCLAS DE CONCRETO MÉTODO ACI 211.1";
  mainHeader.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FFFFFF" } };
  mainHeader.alignment = { horizontal: "center", vertical: "middle" };
  applyRangeColors(2, 2, 3, 5, "1E293B", "FFFFFF"); // Navy Blue

  // Subtitle block
  worksheet.mergeCells("B4:E4");
  const subTitleHeader = worksheet.getCell(4, 2);
  subTitleHeader.value = `Proyecto: ${projectName.toUpperCase()} | Automatizado con Fórmulas Activas de Excel`;
  subTitleHeader.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "D1D5DB" } };
  subTitleHeader.alignment = { horizontal: "center", vertical: "middle" };
  applyRangeColors(4, 2, 4, 5, "334155", "F3F4F6");

  // SECTION 1: PROPIEDADES DE LOS MATERIALES
  worksheet.mergeCells("B6:E6");
  const section1Header = worksheet.getCell(6, 2);
  section1Header.value = "1. PROPIEDADES EXPERIMENTALES DE LOS MATERIALES";
  applyRangeColors(6, 2, 6, 5, "059669", "FFFFFF", true, 10, "left"); // Emerald green

  // Material entries
  // Row 7: Cemento
  worksheet.mergeCells("B7:E7");
  const cementLabel = worksheet.getCell(7, 2);
  cementLabel.value = "Cemento Portland Tipo I";
  applyRangeColors(7, 2, 7, 5, "E2E8F0", "1E293B", true, 9.5);
  applyThinBorders(7, 2, 7, 5);

  setCell(8, 2, "Peso específico del Cemento");
  setCell(8, 3, materials.cementSpecificGravity, true, "1E293B", "right", "0.00");
  setCell(8, 4, "g/cm³");
  setCell(8, 5, "Durable normal / standard ACI");
  applyThinBorders(8, 2, 8, 5);

  // Rows 9: Arena (Agregado Fino)
  worksheet.mergeCells("B9:E9");
  setCell(9, 2, "Agregado Fino (Arena)");
  applyRangeColors(9, 2, 9, 5, "E2E8F0", "1E293B", true, 9.5);
  applyThinBorders(9, 2, 9, 5);

  setCell(10, 2, "Peso específico de la Arena (Gravedad específica Bulk)");
  setCell(10, 3, materials.fineSpecificGravity, false, "000000", "right", "0.00");
  setCell(10, 4, "g/cm³");
  applyThinBorders(10, 2, 10, 5);

  setCell(11, 2, "Módulo de Finura de la Arena");
  setCell(11, 3, materials.fineFinenessModulus, false, "000000", "right", "0.00");
  setCell(11, 4, "");
  setCell(11, 5, "Rango usual: 2.30 - 3.10");
  applyThinBorders(11, 2, 11, 5);

  setCell(12, 2, "Humedad Natural de la Arena");
  setCell(12, 3, materials.fineHumidity / 100, false, "000000", "right", "0.0%");
  setCell(12, 4, "%");
  applyThinBorders(12, 2, 12, 5);

  setCell(13, 2, "Absorción de la Arena");
  setCell(13, 3, materials.fineAbsorption / 100, false, "000000", "right", "0.0%");
  setCell(13, 4, "%");
  applyThinBorders(13, 2, 13, 5);

  // Rows 14: Piedra (Agregado Grueso)
  worksheet.mergeCells("B14:E14");
  setCell(14, 2, "Agregado Grueso (Piedra Chonchilla / Piedra Chancada)");
  applyRangeColors(14, 2, 14, 5, "E2E8F0", "1E293B", true, 9.5);
  applyThinBorders(14, 2, 14, 5);

  setCell(15, 2, "Peso específico de la Piedra (Gravedad específica)");
  setCell(15, 3, materials.coarseSpecificGravity, false, "000000", "right", "0.00");
  setCell(15, 4, "g/cm³");
  applyThinBorders(15, 2, 15, 5);

  setCell(16, 2, "Peso Unitario Seco Compactado (PUCS)");
  setCell(16, 3, materials.coarseDryRoddedUnitWeight, false, "000000", "right", "#,##0");
  setCell(16, 4, "kg/m³");
  applyThinBorders(16, 2, 16, 5);

  setCell(17, 2, "Humedad de la Piedra");
  setCell(17, 3, materials.coarseHumidity / 100, false, "000000", "right", "0.0%");
  setCell(17, 4, "%");
  applyThinBorders(17, 2, 17, 5);

  setCell(18, 2, "Absorción de la Piedra");
  setCell(18, 3, materials.coarseAbsorption / 100, false, "000000", "right", "0.0%");
  setCell(18, 4, "%");
  applyThinBorders(18, 2, 18, 5);

  setCell(19, 2, "Tamaño Máximo Nominal (TMN)");
  setCell(19, 3, materials.coarseMaxNominalSize, true, "10B981", "right");
  setCell(19, 4, "pulgadas");
  applyThinBorders(19, 2, 19, 5);

  // Rows 20: Aditivos Plastificantes
  worksheet.mergeCells("B20:E20");
  setCell(20, 2, "Aditivo Plastificante / Regulador Técnico");
  applyRangeColors(20, 2, 20, 5, "E2E8F0", "1E293B", true, 9.5);
  applyThinBorders(20, 2, 20, 5);

  setCell(21, 2, "Usa Aditivo Plastificante");
  setCell(21, 3, materials.hasAdditive ? "SI" : "NO", true, materials.hasAdditive ? "10B981" : "334155", "right");
  setCell(21, 4, "");
  setCell(21, 5, "Reducción de Agua Activa");
  applyThinBorders(21, 2, 21, 5);

  setCell(22, 2, "Reducción de Agua por Aditivo");
  setCell(22, 3, materials.additiveWaterReduction / 100, false, "000000", "right", "0.0%");
  setCell(22, 4, "%");
  applyThinBorders(22, 2, 22, 5);

  setCell(23, 2, "Dosificación del Aditivo (% del Cemento)");
  setCell(23, 3, materials.additiveDosage / 100, false, "000000", "right", "0.00%");
  setCell(23, 4, "%");
  applyThinBorders(23, 2, 23, 5);

  setCell(24, 2, "Peso específico del Aditivo");
  setCell(24, 3, materials.additiveSpecificGravity, false, "000000", "right", "0.00");
  setCell(24, 4, "g/cm³");
  applyThinBorders(24, 2, 24, 5);


  // SECTION 2: DATOS DEL DISEÑO DE MEZCLA (ESPECIFICACIONES)
  worksheet.mergeCells("B26:E26");
  const section2Header = worksheet.getCell(26, 2);
  section2Header.value = "2. PARÁMETROS DE DISEÑO DEL PROYECTO (ACI 211.1)";
  applyRangeColors(26, 2, 26, 5, "D97706", "FFFFFF", true, 10, "left"); // Orange

  setCell(27, 2, "Resistencia Especificada en Obra (f'c)");
  setCell(27, 3, specs.specifiedStrength, true, "000000", "right", "#,##0");
  setCell(27, 4, "kg/cm²");
  applyThinBorders(27, 2, 27, 5);

  setCell(28, 2, "Utiliza Desviación Estándar de Obra (S)");
  setCell(28, 3, specs.useStandardDeviation ? "SI" : "NO", false, "000000", "right");
  setCell(28, 4, "");
  applyThinBorders(28, 2, 28, 5);

  setCell(29, 2, "Valor de Desviación Estándar (S_d)");
  setCell(29, 3, specs.standardDeviation, false, "000000", "right", "0.0");
  setCell(29, 4, "kg/cm²");
  applyThinBorders(29, 2, 29, 5);

  setCell(30, 2, "Asentamiento Requerido (Slump)");
  setCell(30, 3, specs.slumpRange, false, "000000", "right");
  setCell(30, 4, "pulgadas");
  applyThinBorders(30, 2, 30, 5);

  setCell(31, 2, "Con Aire Incorporado");
  setCell(31, 3, specs.airEntrained ? "SI" : "NO", false, "000000", "right");
  setCell(31, 4, "");
  applyThinBorders(31, 2, 31, 5);

  // HARDCODED FORMULA FOR f'cr - EXTREMELY REALISTIC EXCEL FORMULA!
  setCell(32, 2, "Resistencia Promedio Requerida (f'cr) - FÓRMULA EXCEL");
  worksheet.getCell(32, 3).value = {
    formula: `IF(C28="SI", IF(C27<=350, MAX(C27+1.34*C29, C27+2.33*C29-35), MAX(C27+1.34*C29, 0.9*C27+2.33*C29)), IF(C27<210, C27+70, IF(C27<=350, C27+85, C27+100)))`,
    result: result.targetStrength,
  };
  applyRangeColors(32, 2, 32, 5, "FEF3C7", "92400E", true); // Light yellow highlight
  applyThinBorders(32, 2, 32, 5);
  setCell(32, 4, "kg/cm²", true, "92400E");


  // SECTION 3: PASOS DEL DISEÑO DE MEZCLA
  worksheet.mergeCells("B34:E34");
  setCell(34, 2, "3. SECUENCIA PASO A PASO DE CÁLCULO");
  applyRangeColors(34, 2, 34, 5, "1E3A8A", "FFFFFF", true, 10); // Royal blue

  setCell(35, 2, "Paso 1: Volumen de Agua de Diseño Base (ACI 211.1)");
  setCell(35, 3, result.baseWaterVol, false, "000000", "right", "0.0");
  setCell(35, 4, "L/m³");
  setCell(35, 5, "De tabla ACI según Asentamiento");
  applyThinBorders(35, 2, 35, 5);

  setCell(36, 2, "Paso 2: Contenido de Aire Base (%)");
  setCell(36, 3, result.baseAirPct / 100, false, "000000", "right", "0.00%");
  setCell(36, 4, "%");
  applyThinBorders(36, 2, 36, 5);

  // Agua Ajustada por Aditivo (FÓRMULA)
  setCell(37, 2, "Agua Ajustada por Reductor de Aditivo (FÓRMULA)");
  worksheet.getCell(37, 3).value = {
    formula: `IF(C21="SI", C35*(1-C22), C35)`,
    result: result.adjustedWaterVol,
  };
  worksheet.getCell(37, 3).numFmt = "0.0";
  applyThinBorders(37, 2, 37, 5);
  setCell(37, 4, "L/m³");
  setCell(37, 5, "Agua neta requerida");

  // Relación Agua/Cemento (Interpolado de tabla o cargado)
  setCell(38, 2, "Paso 3: Relación Agua/Cemento (A/C) interpolada");
  setCell(38, 3, result.waterCementRatio, true, "000000", "right", "0.000");
  setCell(38, 4, "A/C");
  setCell(38, 5, "Por resistencia y aire (Tabla ACI)");
  applyThinBorders(38, 2, 38, 5);

  // Peso de Cemento Portland (FÓRMULA)
  setCell(39, 2, "Paso 4: Peso de Cemento Portland (FÓRMULA)");
  worksheet.getCell(39, 3).value = {
    formula: `C37/C38`,
    result: result.cementWeight,
  };
  worksheet.getCell(39, 3).numFmt = "0.00";
  setCell(39, 4, "kg");
  setCell(39, 5, `Equivale a ${(result.cementWeight / 42.5).toFixed(2)} bolsas de 42.5 kg`);
  applyThinBorders(39, 2, 39, 5);

  // Volumen Absoluto Cemento (FÓRMULA)
  setCell(40, 2, "Volumen absoluto de Cemento (FÓRMULA)");
  worksheet.getCell(40, 3).value = {
    formula: `C39/(C8*1000)`,
    result: result.cementVolume,
  };
  worksheet.getCell(40, 3).numFmt = "0.0000";
  setCell(40, 4, "m³");
  applyThinBorders(40, 2, 40, 5);

  // Peso y volumen de aditivo (FÓRMULAS)
  setCell(41, 2, "Peso del Aditivo Plastificante (FÓRMULA)");
  worksheet.getCell(41, 3).value = {
    formula: `IF(C21="SI", C39*C23, 0)`,
    result: result.additiveWeight,
  };
  worksheet.getCell(41, 3).numFmt = "0.00";
  setCell(41, 4, "kg");
  applyThinBorders(41, 2, 41, 5);

  setCell(42, 2, "Volumen absoluto de Aditivo (FÓRMULA)");
  worksheet.getCell(42, 3).value = {
    formula: `IF(C21="SI", C41/(C24*1000), 0)`,
    result: result.additiveVolume,
  };
  worksheet.getCell(42, 3).numFmt = "0.0000";
  setCell(42, 4, "m³");
  applyThinBorders(42, 2, 42, 5);

  // Paso 5: Coarse aggregate volume factor b/b0
  setCell(43, 2, "Paso 5: Volumen unitario compactado Piedra (b/b₀)");
  setCell(43, 3, result.coarseAggregateVolumeFactor, false, "000000", "right", "0.00");
  setCell(43, 5, "Por Módulo Finura Arena y TMN");
  applyThinBorders(43, 2, 43, 5);

  // Paso 6: Peso y volumen absoluto Piedra Seca (FÓRMULAS)
  setCell(44, 2, "Paso 6: Peso de Agregado Grueso Seco (FÓRMULA)");
  worksheet.getCell(44, 3).value = {
    formula: `C43*C16`,
    result: result.coarseAggregateDryWeight,
  };
  worksheet.getCell(44, 3).numFmt = "0.00";
  setCell(44, 4, "kg");
  applyThinBorders(44, 2, 44, 5);

  setCell(45, 2, "Volumen absoluto de Agregado Grueso (FÓRMULA)");
  worksheet.getCell(45, 3).value = {
    formula: `C44/(C15*1000)`,
    result: result.coarseAggregateVolume,
  };
  worksheet.getCell(45, 3).numFmt = "0.0000";
  setCell(45, 4, "m³");
  applyThinBorders(45, 2, 45, 5);

  // Volumen de agua y aire absolutos
  setCell(46, 2, "Volumen absoluto de Agua (FÓRMULA)");
  worksheet.getCell(46, 3).value = { formula: `C37/1000`, result: result.waterVolume };
  worksheet.getCell(46, 3).numFmt = "0.0000";
  setCell(46, 4, "m³");
  applyThinBorders(46, 2, 46, 5);

  setCell(47, 2, "Volumen absoluto de Aire Incorporado (FÓRMULA)");
  worksheet.getCell(47, 3).value = { formula: `C36`, result: result.airVolume };
  worksheet.getCell(47, 3).numFmt = "0.0000";
  setCell(47, 4, "m³");
  applyThinBorders(47, 2, 47, 5);

  // Paso 7: Volumen absoluto Agregado Fino (FÓRMULA)
  setCell(48, 2, "Paso 7: Volumen absoluto de Arena Libre (FÓRMULA)");
  worksheet.getCell(48, 3).value = {
    formula: `MAX(0, 1-(C40+C42+C45+C46+C47))`,
    result: result.fineAggregateVolume,
  };
  worksheet.getCell(48, 3).numFmt = "0.0000";
  setCell(48, 4, "m³");
  applyThinBorders(48, 2, 48, 5);

  // Peso de Arena Seca (FÓRMULA)
  setCell(49, 2, "Peso Agregado Fino Seco (FÓRMULA)");
  worksheet.getCell(49, 3).value = {
    formula: `C48*C10*1000`,
    result: result.fineAggregateDryWeight,
  };
  worksheet.getCell(49, 3).numFmt = "0.00";
  setCell(49, 4, "kg");
  applyThinBorders(49, 2, 49, 5);


  // SECTION 4: CORRECCIÓN POR HUMEDAD Y CONTRATACIONES
  worksheet.mergeCells("B51:E51");
  setCell(51, 2, "4. AJUSTE DE DISEÑO POR HUMEDAD REAL EN OBRA");
  applyRangeColors(51, 2, 51, 5, "10B981", "FFFFFF", true, 10); // Soft emerald

  // Wet weights formulas
  setCell(52, 2, "Peso Húmedo de Agregado Grueso (Piedra) (FÓRMULA)");
  worksheet.getCell(52, 3).value = { formula: `C44*(1+C17)`, result: result.coarseAggregateWetWeight };
  worksheet.getCell(52, 3).numFmt = "0.00";
  setCell(52, 4, "kg");
  applyThinBorders(52, 2, 52, 5);

  setCell(53, 2, "Peso Húmedo de Agregado Fino (Arena) (FÓRMULA)");
  worksheet.getCell(53, 3).value = { formula: `C49*(1+C12)`, result: result.fineAggregateWetWeight };
  worksheet.getCell(53, 3).numFmt = "0.00";
  setCell(53, 4, "kg");
  applyThinBorders(53, 2, 53, 5);

  // Aportes de agua
  setCell(54, 2, "Aporte de agua - Piedra (Aporte libre) (FÓRMULA)");
  worksheet.getCell(54, 3).value = { formula: `C44*(C17-C18)`, result: result.coarseAggregateWaterContribution };
  worksheet.getCell(54, 3).numFmt = "0.00";
  setCell(54, 4, "L / kg (P)");
  applyThinBorders(54, 2, 54, 5);

  setCell(55, 2, "Aporte de agua - Arena (Aporte libre) (FÓRMULA)");
  worksheet.getCell(55, 3).value = { formula: `C49*(C12-C13)`, result: result.fineAggregateWaterContribution };
  worksheet.getCell(55, 3).numFmt = "0.00";
  setCell(55, 4, "L / kg (A)");
  applyThinBorders(55, 2, 55, 5);

  setCell(56, 2, "Aporte total de agua por agregados húmedos (FÓRMULA)");
  worksheet.getCell(56, 3).value = { formula: `C54+C55`, result: result.totalWaterContribution };
  worksheet.getCell(56, 3).numFmt = "0.00";
  setCell(56, 4, "Litros");
  applyThinBorders(56, 2, 56, 5);

  // Agua Neta Corregida (FÓRMULA)
  setCell(57, 2, "Agua de Mezclado Corregida (Agua en obra) (FÓRMULA)");
  worksheet.getCell(57, 3).value = { formula: `MAX(0, C37-C56)`, result: result.correctedWaterVol };
  worksheet.getCell(57, 3).numFmt = "0.00";
  applyRangeColors(57, 2, 57, 5, "EFF6FF", "1D4ED8", true); // Soft blue selection
  setCell(57, 4, "Litros", true, "1D4ED8");
  applyThinBorders(57, 2, 57, 5);


  // SECTION 5: CUADRO DE DOSIFICACIÓN POR m3
  worksheet.mergeCells("B59:E59");
  setCell(59, 2, "5. CUADRO RESUMEN DE PROPORCIONES POR METRO CÚBICO (1.0 m³)");
  applyRangeColors(59, 2, 59, 5, "1E293B", "FFFFFF", true, 10);

  // Sub headers for table
  setCell(60, 2, "MATERIAL EN CONCEPTO", true, "1E293B");
  setCell(60, 3, "PESO SECO (kg)", true, "1E293B", "right");
  setCell(60, 4, "CORRECCIÓN (kg)", true, "1E293B", "right");
  setCell(60, 5, "PESO OBRA (kg)", true, "1E293B", "right");
  applyRangeColors(60, 2, 60, 5, "F1F5F9", "1E293B", true);
  applyThinBorders(60, 2, 60, 5);

  // Cemento row
  setCell(61, 2, "Cemento Portland Tipo I");
  worksheet.getCell(61, 3).value = { formula: `C39`, result: result.cementWeight };
  worksheet.getCell(61, 3).numFmt = "0.0";
  setCell(61, 4, "0.00 (Standard)", false, "64748B", "right");
  worksheet.getCell(61, 5).value = { formula: `C61`, result: result.cementWeight };
  worksheet.getCell(61, 5).numFmt = "0.0";
  applyThinBorders(61, 2, 61, 5);

  // Arena row
  setCell(62, 2, "Agregado Fino (Arena Húmeda)");
  worksheet.getCell(62, 3).value = { formula: `C49`, result: result.fineAggregateDryWeight };
  worksheet.getCell(62, 3).numFmt = "0.0";
  worksheet.getCell(62, 4).value = { formula: `C55`, result: result.fineAggregateWaterContribution };
  worksheet.getCell(62, 4).numFmt = "0.0";
  worksheet.getCell(62, 5).value = { formula: `C53`, result: result.fineAggregateWetWeight };
  worksheet.getCell(62, 5).numFmt = "0.0";
  applyThinBorders(62, 2, 62, 5);

  // Piedra row
  setCell(63, 2, "Agregado Grueso (Piedra Húmeda)");
  worksheet.getCell(63, 3).value = { formula: `C44`, result: result.coarseAggregateDryWeight };
  worksheet.getCell(63, 3).numFmt = "0.0";
  worksheet.getCell(63, 4).value = { formula: `C54`, result: result.coarseAggregateWaterContribution };
  worksheet.getCell(63, 4).numFmt = "0.0";
  worksheet.getCell(63, 5).value = { formula: `C52`, result: result.coarseAggregateWetWeight };
  worksheet.getCell(63, 5).numFmt = "0.0";
  applyThinBorders(63, 2, 63, 5);

  // Agua row
  setCell(64, 2, "Agua Efectiva a Añadir");
  worksheet.getCell(64, 3).value = { formula: `C37`, result: result.adjustedWaterVol };
  worksheet.getCell(64, 3).numFmt = "0.0";
  worksheet.getCell(64, 4).value = { formula: `-C56`, result: -result.totalWaterContribution };
  worksheet.getCell(64, 4).numFmt = "0.0";
  worksheet.getCell(64, 5).value = { formula: `C57`, result: result.correctedWaterVol };
  worksheet.getCell(64, 5).numFmt = "0.0";
  applyThinBorders(64, 2, 64, 5);

  // Aditivo row
  setCell(65, 2, "Aditivo Regulador");
  worksheet.getCell(65, 3).value = { formula: `C41`, result: result.additiveWeight };
  worksheet.getCell(65, 3).numFmt = "0.00";
  setCell(65, 4, "0.00 (Standard)", false, "64748B", "right");
  worksheet.getCell(65, 5).value = { formula: `C41`, result: result.additiveWeight };
  worksheet.getCell(65, 5).numFmt = "0.00";
  applyThinBorders(65, 2, 65, 5);

  // Totals row (FÓRMULAS)
  setCell(66, 2, "Suma Total de la Carga de Obra por m³", true, "1E293B");
  worksheet.getCell(66, 3).value = { formula: `SUM(C61:C65)`, result: result.totalDryWeight };
  worksheet.getCell(66, 3).numFmt = "0.0";
  worksheet.getCell(66, 3).font = { name: "Segoe UI", bold: true };
  setCell(66, 4, "Humedecida", false, "64748B", "right");
  worksheet.getCell(66, 5).value = { formula: `SUM(E61:E65)`, result: result.totalWetWeight };
  worksheet.getCell(66, 5).numFmt = "0.0";
  worksheet.getCell(66, 5).font = { name: "Segoe UI", bold: true };
  applyRangeColors(66, 2, 66, 5, "F1F5F9", "1E293B", true);
  applyThinBorders(66, 2, 66, 5);


  // SECTION 6: DOSIFICACIÓN PRÁCTICA POR SACO (42.5 kg)
  worksheet.mergeCells("B68:F68");
  setCell(68, 2, "6. DOSIFICACIÓN POR SACO DE CEMENTO (INTERFAZ PRÁCTICA DE OBRA)");
  applyRangeColors(68, 2, 68, 6, "111827", "FEF08A", true, 10); // Dark gray with yellow text

  // Table headers for saco
  setCell(69, 2, "COMPONENTE", true);
  setCell(69, 3, "POR m³ HÚMEDO", true, "000000", "right");
  setCell(69, 4, "FACTOR DE SACO", true, "000000", "right");
  setCell(69, 5, "DOSIS EN PESO (kg)", true, "000000", "right");
  setCell(69, 6, "DOSIS EN LATAS (20L)", true, "10B981", "right");
  applyRangeColors(69, 2, 69, 6, "F3F4F6", "111827", true);
  applyThinBorders(69, 2, 69, 6);

  // Row 70: Cemento (FÓRMULAS)
  setCell(70, 2, "Cemento Portland");
  worksheet.getCell(70, 3).value = { formula: `E61`, result: result.cementWeight };
  worksheet.getCell(70, 3).numFmt = "0.0";
  // Factor: 42.5 / Cemento m³
  worksheet.getCell(70, 4).value = { formula: `42.5/C70`, result: 42.5 / result.cementWeight };
  worksheet.getCell(70, 4).numFmt = "0.0000";
  worksheet.getCell(70, 5).value = 42.5; // Fixed 1 standard bag
  worksheet.getCell(70, 5).numFmt = "0.0";
  worksheet.getCell(70, 5).font = { name: "Segoe UI", bold: true };
  setCell(70, 6, "1 Bolsa (42.5 kg)", true, "111827", "right");
  applyThinBorders(70, 2, 70, 6);

  // Row 71: Arena
  setCell(71, 2, "Agregado Fino (Arena)");
  worksheet.getCell(71, 3).value = { formula: `E62`, result: result.fineAggregateWetWeight };
  worksheet.getCell(71, 3).numFmt = "0.0";
  worksheet.getCell(71, 4).value = { formula: `D70` }; // References same factor cell
  worksheet.getCell(71, 4).numFmt = "0.0000";
  worksheet.getCell(71, 5).value = { formula: `C71*D71`, result: result.oneBagBatch.fineWeight };
  worksheet.getCell(71, 5).numFmt = "0.0";
  // Latas: Peso / (PUS * 0.020)
  worksheet.getCell(71, 6).value = { formula: `E71/(${materials.fineLooseUnitWeight || 1600}*0.020)`, result: result.oneBagBatch.fineCans };
  worksheet.getCell(71, 6).numFmt = "0.0";
  applyThinBorders(71, 2, 71, 6);

  // Row 72: Piedra
  setCell(72, 2, "Agregado Grueso (Piedra)");
  worksheet.getCell(72, 3).value = { formula: `E63`, result: result.coarseAggregateWetWeight };
  worksheet.getCell(72, 3).numFmt = "0.0";
  worksheet.getCell(72, 4).value = { formula: `D70` };
  worksheet.getCell(72, 4).numFmt = "0.0000";
  worksheet.getCell(72, 5).value = { formula: `C72*D72`, result: result.oneBagBatch.coarseWeight };
  worksheet.getCell(72, 5).numFmt = "0.0";
  // Latas: Peso / (PUS * 0.020)
  worksheet.getCell(72, 6).value = { formula: `E72/(${materials.coarseLooseUnitWeight || 1550}*0.020)`, result: result.oneBagBatch.coarseCans };
  worksheet.getCell(72, 6).numFmt = "0.0";
  applyThinBorders(72, 2, 72, 6);

  // Row 73: Agua
  setCell(73, 2, "Agua Efectiva a Añadir");
  worksheet.getCell(73, 3).value = { formula: `E64`, result: result.correctedWaterVol };
  worksheet.getCell(73, 3).numFmt = "0.0";
  worksheet.getCell(73, 4).value = { formula: `D70` };
  worksheet.getCell(73, 4).numFmt = "0.0000";
  worksheet.getCell(73, 5).value = { formula: `C73*D73`, result: result.oneBagBatch.correctedWaterLiters };
  worksheet.getCell(73, 5).numFmt = "0.0";
  // Liters in latas: 1 lata is 20L
  worksheet.getCell(73, 6).value = { formula: `E73/20`, result: result.oneBagBatch.correctedWaterCans };
  worksheet.getCell(73, 6).numFmt = "0.0";
  worksheet.getCell(73, 6).font = { name: "Segoe UI", bold: true, color: { argb: "1D4ED8" } };
  applyThinBorders(73, 2, 73, 6);

  // Row 74: Aditivo (cc / mL)
  setCell(74, 2, "Aditivo Químico");
  worksheet.getCell(74, 3).value = { formula: `E65`, result: result.additiveWeight };
  worksheet.getCell(74, 3).numFmt = "0.00";
  worksheet.getCell(74, 4).value = { formula: `D70` };
  worksheet.getCell(74, 4).numFmt = "0.0000";
  worksheet.getCell(74, 5).value = { formula: `C74*D74`, result: result.oneBagBatch.additiveWeight };
  worksheet.getCell(74, 5).numFmt = "0.000";
  // In mL / cc: (Weight / specificGravity) * 1000
  worksheet.getCell(74, 6).value = { formula: `IF(C21="SI", (E74/C24)*1000, 0)`, result: result.oneBagBatch.additiveVolumeCc };
  worksheet.getCell(74, 6).numFmt = "#,##0";
  worksheet.getCell(74, 6).font = { name: "Segoe UI", bold: true, color: { argb: "B45309" } };
  setCell(74, 6, undefined, undefined, undefined, "right"); // right align
  applyThinBorders(74, 2, 74, 6);

  // Footer note on the latas conversion
  worksheet.mergeCells("B76:F76");
  const footerNote = worksheet.getCell(76, 2);
  footerNote.value = `*Nota técnica de Junior Chillcce: Se asume que 1 lata de construcción estándar equivale a 20 Litros (0.020 m³). El volumen húmedo se ha calculado con precisión física en base a los Pesos Unitarios Sueltos (P.U.S.) ingresados: Arena = ${materials.fineLooseUnitWeight || 1600} kg/m³, Piedra = ${materials.coarseLooseUnitWeight || 1550} kg/m³. Use baldes graduados para asegurar consistencia.`;
  footerNote.font = { name: "Segoe UI", size: 8, italic: true, color: { argb: "475569" } };
  footerNote.alignment = { wrapText: true };

  // Write and download sheet
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Junior_Chillcce_ACI_Plantilla_${projectName.replace(/\s+/g, "_")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
