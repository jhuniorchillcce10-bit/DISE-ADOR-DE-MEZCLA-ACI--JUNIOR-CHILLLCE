import React from "react";
import { MixDesignResult } from "../types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieIcon, BarChart2 } from "lucide-react";

interface VisualizationsProps {
  result: MixDesignResult;
}

export const Visualizations: React.FC<VisualizationsProps> = ({ result }) => {
  // Proportions of volume (m3) totals for the mix
  const volumeData = [
    { name: "Cemento", value: result.cementVolume, color: "#475569" }, // slate
    { name: "Grava (Piedra)", value: result.coarseAggregateVolume, color: "#F59E0B" }, // amber
    { name: "Arena", value: result.fineAggregateVolume, color: "#FBBF24" }, // yellow
    { name: "Agua", value: result.waterVolume, color: "#06B6D4" }, // cyan
    { name: "Aire", value: result.airVolume, color: "#A5F3FC" }, // sky
  ];

  if (result.additiveVolume > 0) {
    volumeData.push({ name: "Aditivo", value: result.additiveVolume, color: "#10B981" }); // emerald
  }

  // Weight comparison: Dry vs Wet
  const weightData = [
    {
      name: "Arena (Fino)",
      Seco: result.fineAggregateDryWeight,
      Humedo: result.fineAggregateWetWeight,
    },
    {
      name: "Piedra (Grueso)",
      Seco: result.coarseAggregateDryWeight,
      Humedo: result.coarseAggregateWetWeight,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* VOLUME DISTRIBUTION PIE CHART */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col h-[340px]">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
          <PieIcon className="h-4 w-4 text-emerald-600" />
          Proporción de Componentes (En Volumen Absoluto m³)
        </h3>
        <p className="text-[10px] text-slate-400 mb-4">
          Visualización de la ocupación espacial real para sumar exactamente 1.0 m³ de mezcla de concreto fresco.
        </p>

        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-full sm:w-[50%] h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${(value * 1000).toFixed(1)} L (${(value * 100).toFixed(1)}%)`, "Volumen"]}
                  contentStyle={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", border: "none", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 text-[11px] w-full max-w-[200px] sm:max-w-none">
            {volumeData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 py-0.5">
                <span
                  className="h-2.5 w-2.5 rounded-xs flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-800">
                  {(item.value * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WEIGHT COMPARISON COLUMN CHART */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col h-[340px]">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
          <BarChart2 className="h-4 w-4 text-emerald-600" />
          Corrección de Humedad (Pesos Secos vs Húmedos kg/m³)
        </h3>
        <p className="text-[10px] text-slate-400 mb-4">
          Muestra la cantidad extra de peso que se introduce a causa del agua contenida en los agregados húmedos.
        </p>

        <div className="flex-1 h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="kg" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", border: "none", fontSize: "11px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
              <Bar dataKey="Seco" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Humedo" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
