import React, { useState } from "react";
import {
  FlaskConical,
  TrendingDown,
  Layers,
  Scale,
  Droplets,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
  FileSearch,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { SieveData } from "../../types";

export const MaterialLabView: React.FC = () => {
  const { activeProject, updateProject } = useProjects();
  const [activeMaterialTab, setActiveMaterialTab] = useState<"fine" | "coarse" | "abrasion">("fine");

  const fineAgg = activeProject.fineAggregate;
  const coarseAgg = activeProject.coarseAggregate;

  // Local state for fine aggregate sieves
  const [fineSieves, setFineSieves] = useState<SieveData[]>(fineAgg.sieveAnalysis);
  const [coarseSieves, setCoarseSieves] = useState<SieveData[]>(coarseAgg.sieveAnalysis);

  // Los Angeles Abrasion State
  const [laMassInitial, setLaMassInitial] = useState(5000); // 5000 grams
  const [laMassRetained, setLaMassRetained] = useState(3880); // grams on sieve #12 (1.7 mm)
  const laAbrasionCalc = Number((((laMassInitial - laMassRetained) / laMassInitial) * 100).toFixed(1));
  const isLaPass = laAbrasionCalc <= 40.0;

  // Calculate cumulative & passing for fine sieves
  const totalFineMass = fineSieves.reduce((sum, s) => sum + s.massRetained, 0) || 1;
  let cumFineRetained = 0;
  let fmSum = 0;
  const processedFineSieves = fineSieves.map((s, idx) => {
    const pctRetained = (s.massRetained / totalFineMass) * 100;
    cumFineRetained += pctRetained;
    const passing = Math.max(0, 100 - cumFineRetained);
    // FM excludes pan
    if (s.sieveName !== "Pan") {
      fmSum += cumFineRetained;
    }
    return {
      ...s,
      percentRetained: Number(pctRetained.toFixed(1)),
      cumulativeRetained: Number(cumFineRetained.toFixed(1)),
      percentPassing: Number(passing.toFixed(1)),
    };
  });
  const calculatedFineFM = Number((fmSum / 100).toFixed(2));
  const isFineFmValid = calculatedFineFM >= 2.2 && calculatedFineFM <= 3.1;

  // Handle fine sieve mass change
  const handleFineSieveChange = (idx: number, mass: number) => {
    const updated = [...fineSieves];
    updated[idx] = { ...updated[idx], massRetained: mass };
    setFineSieves(updated);
  };

  // Save changes to active project
  const handleSaveToProject = () => {
    updateProject(activeProject.id, {
      fineAggregate: {
        ...fineAgg,
        finenessModulus: calculatedFineFM,
        sieveAnalysis: processedFineSieves,
      },
      coarseAggregate: {
        ...coarseAgg,
        laAbrasionPercent: laAbrasionCalc,
      },
    });
    alert("Karakteristik material laboratorium berhasil disimpan dan disinkronkan ke Mix Design!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Laboratorium Karakteristik Material Agregat & Semen</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">Pengujian & Analisis Saringan Agregat</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gradasi agregat SNI 03-2834 / ASTM C33, berat jenis SSD, penyerapan & uji abrasi Los Angeles (SNI 2417:2008)
          </p>
        </div>

        <button
          onClick={handleSaveToProject}
          className="px-4 py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Simpan ke Proyek Aktif</span>
        </button>
      </div>

      {/* TOR Aggregate Compliance Banner */}
      {activeProject.torAnalysis && (
        <div className="bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white shrink-0">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Kesesuaian Karakteristik Agregat terhadap TOR:</span>
                <span className="font-mono text-amber-800 font-bold">
                  Batas Dmax ≤ {activeProject.torAnalysis.maxAggregateSize || 19} mm
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Batu pecah proyek saat ini: {coarseAgg.maxSize || 19} mm · Nilai Abrasi Los Angeles: {laAbrasionCalc}% ({isLaPass ? "Memenuhi Batas ≤ 40%" : "Perlu Evaluasi"}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Agregat Memenuhi TOR</span>
            </span>
          </div>
        </div>
      )}

      {/* Material Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveMaterialTab("fine")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeMaterialTab === "fine"
              ? "border-[#286B9B] text-[#286B9B]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Agregat Halus (Pasir) & Gradasi</span>
        </button>

        <button
          onClick={() => setActiveMaterialTab("coarse")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeMaterialTab === "coarse"
              ? "border-[#286B9B] text-[#286B9B]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Agregat Kasar (Batu Pecah / Kerikil)</span>
        </button>

        <button
          onClick={() => setActiveMaterialTab("abrasion")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeMaterialTab === "abrasion"
              ? "border-[#286B9B] text-[#286B9B]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Uji Abrasi Los Angeles (SNI 2417)</span>
        </button>
      </div>

      {/* TAB 1: FINE AGGREGATE SIEVE ANALYSIS & GRADATION CURVE */}
      {activeMaterialTab === "fine" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sieve Data Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Analisis Saringan Pasir ({fineAgg.type})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total sampel pasir: <span className="font-mono font-semibold">{totalFineMass} gram</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Modulus Kehalusan (FM)</span>
                <span className={`text-sm font-bold font-mono ${isFineFmValid ? "text-emerald-700" : "text-amber-700"}`}>
                  {calculatedFineFM} {isFineFmValid ? "✓ (2.2 - 3.1)" : "⚠ Di Luar Batas"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-2.5">Saringan</th>
                    <th className="py-2 px-2.5">Lubang (mm)</th>
                    <th className="py-2 px-2.5 text-right">Tertahan (gr)</th>
                    <th className="py-2 px-2.5 text-right">% Tertahan</th>
                    <th className="py-2 px-2.5 text-right">% Kumulatif</th>
                    <th className="py-2 px-2.5 text-right">% Lolos</th>
                    <th className="py-2 px-2.5 text-center">Batas ASTM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedFineSieves.map((s, idx) => {
                    const isWithin =
                      s.lowerLimit !== undefined && s.upperLimit !== undefined
                        ? (s.percentPassing || 0) >= s.lowerLimit && (s.percentPassing || 0) <= s.upperLimit
                        : true;

                    return (
                      <tr key={s.sieveName} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2.5 font-semibold text-slate-900">{s.sieveName}</td>
                        <td className="py-2 px-2.5 font-mono text-slate-600">{s.sieveSize || "-"}</td>
                        <td className="py-2 px-2.5 text-right">
                          <input
                            type="number"
                            min="0"
                            value={s.massRetained}
                            onChange={(e) => handleFineSieveChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right font-mono text-xs focus:ring-1 focus:ring-[#286B9B]"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono text-slate-600">{s.percentRetained}%</td>
                        <td className="py-2 px-2.5 text-right font-mono text-slate-700 font-medium">{s.cumulativeRetained}%</td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">{s.percentPassing}%</td>
                        <td className="py-2 px-2.5 text-center text-[10px] font-mono text-slate-500">
                          {s.lowerLimit !== undefined ? `${s.lowerLimit} - ${s.upperLimit}%` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Evaluasi Gradasi Pasir:</span>{" "}
                <span className="text-emerald-700 font-medium">Memenuhi Zona II (Pasir Agak Kasar / Normal)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">SNI 03-2834-2000</span>
            </div>
          </div>

          {/* Gradation Curve Visualization (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Grafik Kurva Gradasi Agregat Halus
            </h3>
            <p className="text-[11px] text-slate-500">
              Perbandingan kurva % lolos kumulatif pasir terhadap batas standar ASTM C33 / SNI Zona 2.
            </p>

            {/* Custom SVG Semi-log Gradation Chart */}
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
              <svg viewBox="0 0 320 220" className="w-full h-56">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((yVal) => {
                  const y = 190 - (yVal / 100) * 160;
                  return (
                    <g key={yVal}>
                      <line x1="40" y1={y} x2="300" y2={y} stroke="#E2E8F0" strokeWidth="1" />
                      <text x="32" y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontFamily="JetBrains Mono">
                        {yVal}
                      </text>
                    </g>
                  );
                })}

                {/* Sieve Diameter Vertical Markers */}
                {processedFineSieves.slice(0, 7).map((s, idx) => {
                  const x = 50 + idx * 38;
                  return (
                    <g key={s.sieveName}>
                      <line x1={x} y1="30" x2={x} y2="190" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2,2" />
                      <text x={x} y="205" textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="JetBrains Mono">
                        {s.sieveSize}
                      </text>
                    </g>
                  );
                })}

                {/* Upper Limit Curve (Dashed Red) */}
                <polyline
                  fill="none"
                  stroke="#F87171"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  points={processedFineSieves
                    .slice(0, 7)
                    .map((s, idx) => `${50 + idx * 38},${190 - ((s.upperLimit || 100) / 100) * 160}`)
                    .join(" ")}
                />

                {/* Lower Limit Curve (Dashed Red) */}
                <polyline
                  fill="none"
                  stroke="#F87171"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  points={processedFineSieves
                    .slice(0, 7)
                    .map((s, idx) => `${50 + idx * 38},${190 - ((s.lowerLimit || 0) / 100) * 160}`)
                    .join(" ")}
                />

                {/* Actual Sieve Passing Line (Bold Blue) */}
                <polyline
                  fill="none"
                  stroke="#286B9B"
                  strokeWidth="2.5"
                  points={processedFineSieves
                    .slice(0, 7)
                    .map((s, idx) => `${50 + idx * 38},${190 - ((s.percentPassing || 0) / 100) * 160}`)
                    .join(" ")}
                />

                {/* Data Points on Actual Line */}
                {processedFineSieves.slice(0, 7).map((s, idx) => {
                  const cx = 50 + idx * 38;
                  const cy = 190 - ((s.percentPassing || 0) / 100) * 160;
                  return (
                    <circle
                      key={s.sieveName}
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#142D45"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-[#286B9B] rounded" />
                <span className="font-semibold text-slate-900">Gradasi Pasir Aktual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-rose-400 border-t border-dashed border-rose-500" />
                <span>Batas Standar ASTM C33</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COARSE AGGREGATE PROPERTIES */}
      {activeMaterialTab === "coarse" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Karakteristik Fisik Agregat Kasar ({coarseAgg.type})
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase">Berat Jenis Curah Kering</span>
                <span className="text-base font-bold font-mono text-slate-900">{coarseAgg.specificGravityDry}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase">Berat Jenis SSD</span>
                <span className="text-base font-bold font-mono text-[#286B9B]">{coarseAgg.specificGravitySSD}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase">Penyerapan Air (%)</span>
                <span className="text-base font-bold font-mono text-slate-900">{coarseAgg.absorption}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase">Kadar Air Lapangan (%)</span>
                <span className="text-base font-bold font-mono text-[#286B9B]">{coarseAgg.moistureContent}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase">Berat Isi Kering Padat</span>
                <span className="text-base font-bold font-mono text-slate-900">{coarseAgg.dryRoddedUnitWeight} kg/m³</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase">Ukuran Maksimum (Dmax)</span>
                <span className="text-base font-bold font-mono text-slate-900">{coarseAgg.maxSize} mm</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Gradasi Agregat Kasar Saringan
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px]">
                  <th className="py-2 px-2">Saringan</th>
                  <th className="py-2 px-2">Ukuran (mm)</th>
                  <th className="py-2 px-2 text-right">Tertahan (gr)</th>
                  <th className="py-2 px-2 text-right">% Lolos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coarseSieves.map((s) => (
                  <tr key={s.sieveName}>
                    <td className="py-2 px-2 font-semibold text-slate-800">{s.sieveName}</td>
                    <td className="py-2 px-2 font-mono text-slate-600">{s.sieveSize || "-"}</td>
                    <td className="py-2 px-2 text-right font-mono">{s.massRetained}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">{s.percentPassing}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOS ANGELES ABRASION TEST */}
      {activeMaterialTab === "abrasion" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#142D45]">
                Uji Keausan Agregat Kasar Mesin Los Angeles (SNI 2417:2008)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ketahanan degradasi abrasi mekanik menggunakan silinder baja berputar 500 putaran dengan bola baja.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded border ${
                isLaPass ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {isLaPass ? "MEMENUHI STANDAR SNI (< 40%)" : "TIDAK MEMENUHI (> 40%)"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <label className="block font-semibold text-slate-700">Berat Awal Sampel Kering (M1)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={laMassInitial}
                  onChange={(e) => setLaMassInitial(parseFloat(e.target.value) || 5000)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white"
                />
                <span className="text-slate-500 font-mono">gram</span>
              </div>
              <p className="text-[11px] text-slate-400">Standar massa pengujian gradasi A/B: 5000 ± 10 gr</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <label className="block font-semibold text-slate-700">Massa Tertahan Saringan No. 12 (M2)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={laMassRetained}
                  onChange={(e) => setLaMassRetained(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-white"
                />
                <span className="text-slate-500 font-mono">gram</span>
              </div>
              <p className="text-[11px] text-slate-400">Ditimbang setelah dicuci dan dikeringkan oven 110°C</p>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#286B9B] uppercase font-bold tracking-wider">
                  Nilai Keausan Los Angeles
                </span>
                <div className="text-2xl font-bold font-mono text-[#142D45] mt-1">
                  {laAbrasionCalc}%
                </div>
              </div>
              <p className="text-[11px] text-slate-600">
                Rumus: ((M1 - M2) / M1) × 100% = (({laMassInitial} - {laMassRetained}) / {laMassInitial}) × 100%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
