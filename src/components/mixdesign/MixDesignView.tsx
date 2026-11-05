import React, { useState } from "react";
import {
  Layers,
  Droplets,
  Calculator,
  RotateCw,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale,
  FileSearch,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { ConcreteStandardMethod, SpecimenShape, InnovationVariant } from "../../types";
import { exportProjectToExcel, exportProjectToPdf } from "../../utils/exportUtils";
import { calculateCylinderBatches } from "../../utils/mixDesignCalculations";

export const MixDesignView: React.FC = () => {
  const {
    activeProject,
    updateProject,
    recalculateActiveProject,
    setActiveInnovationForMix,
  } = useProjects();
  const [activeTab, setActiveTab] = useState<"input" | "steps" | "justification">("input");
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [cylinderBatchMode, setCylinderBatchMode] = useState<1 | 3 | 6>(6);

  const res = activeProject.calculationResult;
  const cylinderBatches = res ? calculateCylinderBatches(res, 15) : null;

  // Form states initialized with activeProject
  const params = activeProject.parameters;
  const cement = activeProject.cement;
  const fineAgg = activeProject.fineAggregate;
  const coarseAgg = activeProject.coarseAggregate;
  const admix = activeProject.admixture;

  const handleParamChange = (field: string, value: any) => {
    updateProject(activeProject.id, {
      parameters: {
        ...params,
        [field]: value,
      },
    });
  };

  const handleCementChange = (field: string, value: any) => {
    updateProject(activeProject.id, {
      cement: {
        ...cement,
        [field]: value,
      },
    });
  };

  const handleFineAggChange = (field: string, value: any) => {
    updateProject(activeProject.id, {
      fineAggregate: {
        ...fineAgg,
        [field]: value,
      },
    });
  };

  const handleCoarseAggChange = (field: string, value: any) => {
    updateProject(activeProject.id, {
      coarseAggregate: {
        ...coarseAgg,
        [field]: value,
      },
    });
  };

  const handleAdmixChange = (field: string, value: any) => {
    updateProject(activeProject.id, {
      admixture: {
        ...admix,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Perancangan Campuran Beton Terintegrasi</span>
            <span>·</span>
            <span className="font-mono text-slate-600">{params.method.replace(/_/g, " ")}</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">{activeProject.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Mutu f'c {params.targetStrengthFc} MPa · Slump {params.slumpMin}-{params.slumpMax} mm · Dmax {params.maxAggregateSize} mm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => recalculateActiveProject()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Hitung ulang otomatis seluruh komposisi"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Hitung Ulang</span>
          </button>

          <button
            onClick={() => exportProjectToExcel(activeProject)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => exportProjectToPdf(activeProject)}
            className="px-3.5 py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* TOR Connected Badge & Info Banner */}
      {activeProject.torAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#286B9B] flex items-center justify-center text-white shrink-0">
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-[#142D45]">
                <span>Terhubung dengan Dokumen TOR:</span>
                <span className="text-[#286B9B]">{activeProject.torAnalysis.competitionTheme}</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                <span>Target f&apos;c: {activeProject.torAnalysis.targetStrengthFc} MPa</span>
                <span>·</span>
                <span>Slump: {activeProject.torAnalysis.targetSlump}</span>
                <span>·</span>
                <span>Dmax: {activeProject.torAnalysis.maxAggregateSize} mm</span>
                <span>·</span>
                <span className="text-emerald-700 font-bold">6x Silinder 15x30 cm Synced</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>TOR Parameters Synced</span>
            </span>
          </div>
        </div>
      )}

      {/* Tabs Switcher: Input Material & Param vs Detailed Steps vs Justification */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("input")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "input"
              ? "border-[#286B9B] text-[#286B9B]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Parameter Desain & Karakteristik Material</span>
        </button>

        <button
          onClick={() => setActiveTab("steps")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "steps"
              ? "border-[#286B9B] text-[#286B9B]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Perhitungan Langkah Demi Langkah ({res?.calculationSteps.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("justification")}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "justification"
              ? "border-[#286B9B] text-[#286B9B]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Justifikasi Teknis & SNI ({res?.justification.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: INPUT PARAMETERS & MATERIAL CHARACTERISTICS */}
      {activeTab === "input" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section A: Project Parameters */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#286B9B]" />
                  <span>A. Parameter Desain & Spesifikasi Teknis</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Metode Mix Design</label>
                    <select
                      value={params.method}
                      onChange={(e) => handleParamChange("method", e.target.value as ConcreteStandardMethod)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                    >
                      <option value="SNI_7656_2012">SNI 7656:2012 (Volume Absolut)</option>
                      <option value="SNI_03_2834_2000">SNI 03-2834-2000 (Metode DoE)</option>
                      <option value="ACI_211_1">ACI 211.1 (Standard Practice)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Kuat Tekan f'c (MPa)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="10"
                      max="80"
                      value={params.targetStrengthFc}
                      onChange={(e) => handleParamChange("targetStrengthFc", parseFloat(e.target.value) || 28)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Slump Target (mm)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="25"
                        max="200"
                        value={params.slumpMin}
                        onChange={(e) => handleParamChange("slumpMin", parseInt(e.target.value) || 75)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono text-center"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        min="25"
                        max="200"
                        value={params.slumpMax}
                        onChange={(e) => handleParamChange("slumpMax", parseInt(e.target.value) || 100)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dmax Agregat Kasar (mm)</label>
                    <select
                      value={params.maxAggregateSize}
                      onChange={(e) => handleParamChange("maxAggregateSize", parseInt(e.target.value) || 19)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono bg-white"
                    >
                      <option value="10">10 mm</option>
                      <option value="12.5">12.5 mm</option>
                      <option value="19">19 mm</option>
                      <option value="25">25 mm</option>
                      <option value="37.5">37.5 mm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Volume Rencana Batch (m³)</label>
                    <input
                      type="number"
                      step="0.005"
                      min="0.005"
                      max="10"
                      value={params.plannedVolumeM3}
                      onChange={(e) => handleParamChange("plannedVolumeM3", parseFloat(e.target.value) || 0.05)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Faktor Kehilangan (Waste %)</label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={params.wasteFactorPercent}
                      onChange={(e) => handleParamChange("wasteFactorPercent", parseInt(e.target.value) || 10)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Cement Properties */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#286B9B]" />
                  <span>B. Karakteristik Semen & Bahan Pengikat (Binder)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Semen</label>
                    <input
                      type="text"
                      value={cement.type}
                      onChange={(e) => handleCementChange("type", e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Berat Jenis Semen</label>
                    <input
                      type="number"
                      step="0.01"
                      min="2.8"
                      max="3.3"
                      value={cement.specificGravity}
                      onChange={(e) => handleCementChange("specificGravity", parseFloat(e.target.value) || 3.15)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Material Substitusi (SCM)</label>
                    <input
                      type="text"
                      placeholder="e.g. Fly Ash, Silica Fume"
                      value={cement.supplementaryMaterial || ""}
                      onChange={(e) => handleCementChange("supplementaryMaterial", e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Substitusi Semen (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={cement.substitutionPercent}
                      onChange={(e) => handleCementChange("substitutionPercent", parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section C & D: Aggregates Properties & Laboratory Moisture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Fine Aggregate Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    C. Agregat Halus (Pasir)
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-0.5">Jenis / Sumber Pasir</label>
                      <input
                        type="text"
                        value={fineAgg.type}
                        onChange={(e) => handleFineAggChange("type", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-0.5">Berat Jenis SSD</label>
                        <input
                          type="number"
                          step="0.01"
                          value={fineAgg.specificGravitySSD}
                          onChange={(e) => handleFineAggChange("specificGravitySSD", parseFloat(e.target.value) || 2.62)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">Modulus Kehalusan (FM)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={fineAgg.finenessModulus}
                          onChange={(e) => handleFineAggChange("finenessModulus", parseFloat(e.target.value) || 2.65)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-0.5">Penyerapan Air (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={fineAgg.absorption}
                          onChange={(e) => handleFineAggChange("absorption", parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#286B9B] mb-0.5">Kadar Air Aktual (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={fineAgg.moistureContent}
                          onChange={(e) => handleFineAggChange("moistureContent", parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-[#286B9B] rounded-lg font-mono font-bold bg-blue-50/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coarse Aggregate Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    D. Agregat Kasar (Kerikil / Batu Pecah)
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-0.5">Jenis Agregat Kasar</label>
                      <input
                        type="text"
                        value={coarseAgg.type}
                        onChange={(e) => handleCoarseAggChange("type", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-0.5">Berat Jenis SSD</label>
                        <input
                          type="number"
                          step="0.01"
                          value={coarseAgg.specificGravitySSD}
                          onChange={(e) => handleCoarseAggChange("specificGravitySSD", parseFloat(e.target.value) || 2.66)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">Berat Isi Padat (kg/m³)</label>
                        <input
                          type="number"
                          value={coarseAgg.dryRoddedUnitWeight || 1600}
                          onChange={(e) => handleCoarseAggChange("dryRoddedUnitWeight", parseFloat(e.target.value) || 1600)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-0.5">Penyerapan Air (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={coarseAgg.absorption}
                          onChange={(e) => handleCoarseAggChange("absorption", parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#286B9B] mb-0.5">Kadar Air Aktual (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={coarseAgg.moistureContent}
                          onChange={(e) => handleCoarseAggChange("moistureContent", parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-[#286B9B] rounded-lg font-mono font-bold bg-blue-50/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section E: Admixture Properties */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#286B9B]" />
                  <span>E. Bahan Tambah Kimia (Chemical Admixture)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipe Admixture</label>
                    <input
                      type="text"
                      value={admix.type}
                      onChange={(e) => handleAdmixChange("type", e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Produk</label>
                    <input
                      type="text"
                      value={admix.productName}
                      onChange={(e) => handleAdmixChange("productName", e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dosis (% Berat Semen)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={admix.dosagePercent}
                      onChange={(e) => handleAdmixChange("dosagePercent", parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fungsi Utama</label>
                    <input
                      type="text"
                      value={admix.function}
                      onChange={(e) => handleAdmixChange("function", e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Calculated Results & Moisture Correction Panel */}
            <div className="space-y-6">
              {/* Live Composition Summary */}
              <div className="bg-[#142D45] text-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-bold text-sm text-white">Komposisi Campuran Final</h3>
                  <span className="text-[11px] font-mono text-[#64B5F6] bg-white/10 px-2 py-0.5 rounded">
                    fas: {res?.waterCementRatio}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-300">Air Desain (W_design):</span>
                    <span className="font-mono font-bold">{res?.waterContentDesignKg} kg/m³</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-300">Semen Portland:</span>
                    <span className="font-mono font-bold">{res?.cementContentKg} kg/m³</span>
                  </div>
                  {res?.supplementaryContentKg ? (
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-slate-300">Supplementary (SCM):</span>
                      <span className="font-mono font-bold">{res.supplementaryContentKg} kg/m³</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-300">Pasir SSD:</span>
                    <span className="font-mono font-bold">{res?.fineAggregateKg} kg/m³</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-300">Kerikil SSD:</span>
                    <span className="font-mono font-bold">{res?.coarseAggregateKg} kg/m³</span>
                  </div>
                  {res?.admixtureKg ? (
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-slate-300">Admixture Kimia:</span>
                      <span className="font-mono font-bold">{res.admixtureKg} kg/m³</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-blue-200 font-semibold">Total Berat Densitas:</span>
                    <span className="font-mono font-bold text-base text-white">
                      {res?.theoreticalDensityKg} kg/m³
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                    Rasio Campuran (Semen : Pasir : Kerikil : Air)
                  </span>
                  <div className="font-mono font-bold text-sm text-[#64B5F6] tracking-wide">
                    {res?.mixRatio}
                  </div>
                </div>
              </div>

              {/* Moisture Correction Breakdown Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="w-4 h-4 text-[#286B9B]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Koreksi Kadar Air Agregat
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500 mb-3">
                  Agregat basah (kadar air &gt; penyerapan) menyumbang air ke adukan. Air mixer harus dikurangi agar rasio fas tidak melonjak!
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Pasir Ditimbang Basah:</span>
                      <span className="font-mono text-[#286B9B]">{res?.moistureCorrection.fineAggregateWetKg} kg/m³</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>Sumbangan air bebas pasir:</span>
                      <span className="font-mono">
                        {res && res.moistureCorrection.waterDeltaFineAggKg > 0 ? "+" : ""}
                        {res?.moistureCorrection.waterDeltaFineAggKg} kg
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Kerikil Ditimbang Basah:</span>
                      <span className="font-mono text-[#286B9B]">{res?.moistureCorrection.coarseAggregateWetKg} kg/m³</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>Sumbangan air bebas kerikil:</span>
                      <span className="font-mono">
                        {res && res.moistureCorrection.waterDeltaCoarseAggKg > 0 ? "+" : ""}
                        {res?.moistureCorrection.waterDeltaCoarseAggKg} kg
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex justify-between items-center text-xs font-bold text-[#142D45]">
                      <span>Air Netto ke Mixer:</span>
                      <span className="font-mono text-base text-[#286B9B]">
                        {res?.moistureCorrection.netWaterToBatchKg} kg/m³
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {res && res.waterContentDesignKg - (res.moistureCorrection.netWaterToBatchKg || 0) > 0
                        ? `(Air desain ${res.waterContentDesignKg} kg dikurangi ${(res.waterContentDesignKg - res.moistureCorrection.netWaterToBatchKg).toFixed(1)} kg air bebas agregat)`
                        : "Tidak ada pengurangan air."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Batch Scale Requirements Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Kebutuhan Batch ({res?.batchRequirements.volumeM3} m³)
                  </h3>
                  <span className="text-[10px] text-slate-500">Waste: {params.wasteFactorPercent}%</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Air Mixer:</span>
                    <span className="font-mono font-bold text-slate-900">{res?.batchRequirements.waterKg} kg</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Semen:</span>
                    <span className="font-mono font-bold text-slate-900">{res?.batchRequirements.cementKg} kg</span>
                  </div>
                  {res?.batchRequirements.supplementaryKg ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">SCM Binder:</span>
                      <span className="font-mono font-bold text-slate-900">{res.batchRequirements.supplementaryKg} kg</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Pasir Basah:</span>
                    <span className="font-mono font-bold text-slate-900">{res?.batchRequirements.fineAggregateWetKg} kg</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Kerikil Basah:</span>
                    <span className="font-mono font-bold text-slate-900">{res?.batchRequirements.coarseAggregateWetKg} kg</span>
                  </div>
                  {res?.batchRequirements.admixtureKg ? (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Admixture:</span>
                      <span className="font-mono font-bold text-slate-900">{res.batchRequirements.admixtureKg} kg</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between pt-2 text-slate-900 font-bold">
                    <span>Total Batch:</span>
                    <span className="font-mono text-emerald-700">{res?.batchRequirements.totalBatchWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Estimasi per Benda Uji:</span>
                    <span className="font-mono">{res?.batchRequirements.perSpecimenKg} kg/buah</span>
                  </div>
                </div>
              </div>

              {/* Dedicated Card: Kebutuhan Material Silinder 15x30 cm (1, 3, 6 Silinder) */}
              {cylinderBatches && (
                <div className="bg-white rounded-xl border-2 border-[#286B9B]/30 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#286B9B]" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#142D45]">
                        Kebutuhan Silinder 15x30 cm
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +15% Slump Waste
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Benda uji standar silinder dia. 150 × 300 mm (V = 0.0053 m³ / silinder). Timbangan riil laboratorium:
                  </p>

                  {/* Switcher 6, 3, 1 silinder */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-center">
                    <button
                      type="button"
                      onClick={() => setCylinderBatchMode(6)}
                      className={`py-1 rounded transition-colors ${
                        cylinderBatchMode === 6
                          ? "bg-[#142D45] text-white shadow-2xs"
                          : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      6 Silinder
                    </button>
                    <button
                      type="button"
                      onClick={() => setCylinderBatchMode(3)}
                      className={`py-1 rounded transition-colors ${
                        cylinderBatchMode === 3
                          ? "bg-[#142D45] text-white shadow-2xs"
                          : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      3 Silinder
                    </button>
                    <button
                      type="button"
                      onClick={() => setCylinderBatchMode(1)}
                      className={`py-1 rounded transition-colors ${
                        cylinderBatchMode === 1
                          ? "bg-[#142D45] text-white shadow-2xs"
                          : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      1 Silinder
                    </button>
                  </div>

                  {/* Active Cylinder Batch Data */}
                  {(() => {
                    const b =
                      cylinderBatchMode === 1
                        ? cylinderBatches.oneCylinder
                        : cylinderBatchMode === 3
                        ? cylinderBatches.threeCylinders
                        : cylinderBatches.sixCylinders;
                    return (
                      <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-mono">
                        <div className="flex justify-between pb-1 border-b border-slate-200 font-sans text-slate-500 text-[10px] uppercase font-bold">
                          <span>Material Ditimbang</span>
                          <span>Massa Timbangan Lab</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-sans text-slate-700">Air Netto Mixer:</span>
                          <span className="font-bold text-[#286B9B]">{b.waterNetKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-sans text-slate-700">Semen Portland:</span>
                          <span className="font-bold text-slate-900">{b.cementKg} kg</span>
                        </div>
                        {b.supplementaryKg > 0 && (
                          <div className="flex justify-between">
                            <span className="font-sans text-slate-700">SCM / Fly Ash:</span>
                            <span className="font-bold text-slate-900">{b.supplementaryKg} kg</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-sans text-slate-700">Pasir Basah:</span>
                          <span className="font-bold text-slate-900">{b.fineAggregateWetKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-sans text-slate-700">Kerikil Basah:</span>
                          <span className="font-bold text-slate-900">{b.coarseAggregateWetKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-sans text-slate-700">Admixture Kimia:</span>
                          <span className="font-bold text-purple-700">{b.admixtureGrams} gram</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 font-sans font-bold text-slate-900">
                          <span>Total Batch ({b.silinderCount} Silinder):</span>
                          <span className="font-mono text-emerald-700">{b.totalBatchWeightKg} kg</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED CALCULATION STEPS */}
      {activeTab === "steps" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-[#142D45]">
              Langkah Demi Langkah Perhitungan Mix Design ({params.method.replace(/_/g, " ")})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Semua rumus, substitusi nilai, klausul rujukan SNI, dan hasil perhitungan ditampilkan secara transparan dan terverifikasi.
            </p>
          </div>

          <div className="space-y-4">
            {res?.calculationSteps.map((step) => (
              <div key={step.step} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#142D45] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {step.step}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                  </div>
                  <span className="text-[11px] font-mono text-[#286B9B] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {step.standardClause}
                  </span>
                </div>

                <p className="text-xs text-slate-600 pl-8">{step.description}</p>

                <div className="pl-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rumus</span>
                    <code className="text-[11px] text-slate-800 font-mono block mt-0.5">{step.formula}</code>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Substitusi Angka</span>
                    <div className="text-[11px] text-slate-800 font-mono mt-0.5">{step.substitution}</div>
                  </div>

                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200">
                    <span className="text-[10px] text-[#286B9B] font-semibold block uppercase">Hasil Perhitungan</span>
                    <div className="text-[11px] text-slate-900 font-mono font-bold mt-0.5">{step.result}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ENGINEERING JUSTIFICATION & REFERENCES */}
      {activeTab === "justification" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#142D45]">
                Engineering Justification & Standard References
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dasar pemilihan setiap parameter teknik, status verifikasi SNI, serta batasan teknis perancangan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Semua Referensi SNI Terverifikasi (Verified)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Parameter Perancangan</th>
                  <th className="py-2.5 px-3">Nilai Terpilih</th>
                  <th className="py-2.5 px-3">Rasionalisasi & Alasan Teknik</th>
                  <th className="py-2.5 px-3">Rujukan Standar SNI</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {res?.justification.map((j, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{j.parameter}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#286B9B]">{j.chosenValue}</td>
                    <td className="py-3 px-3 text-slate-700 max-w-sm">{j.rationale}</td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{j.standardReference}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{j.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
