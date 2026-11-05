import React, { useState } from "react";
import {
  TrendingUp,
  Sliders,
  Cpu,
  BarChart3,
  ShieldCheck,
  RotateCw,
  Info,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import {
  predictConcreteStrength,
  MODEL_VALIDATION_METRICS,
  MLModelInput,
} from "../../utils/machineLearningPredictor";

export const StrengthPredictorView: React.FC = () => {
  const { activeProject } = useProjects();
  const res = activeProject.calculationResult;

  const [selectedModel, setSelectedModel] = useState<"xgboost" | "randomForest" | "linear">("xgboost");
  const [ageDays, setAgeDays] = useState<number>(28);
  const [curingCondition, setCuringCondition] = useState<
    "Water Curing (Standar)" | "Air Curing" | "Steam Curing"
  >("Water Curing (Standar)");
  const [customCement, setCustomCement] = useState<number>(res?.cementContentKg || 380);
  const [customWater, setCustomWater] = useState<number>(res?.waterContentDesignKg || 195);
  const [customFlyAsh, setCustomFlyAsh] = useState<number>(res?.supplementaryContentKg || 0);
  const [customSP, setCustomSP] = useState<number>(res?.admixtureKg || 2.5);
  const [customFineAgg, setCustomFineAgg] = useState<number>(res?.fineAggregateKg || 720);
  const [customCoarseAgg, setCustomCoarseAgg] = useState<number>(res?.coarseAggregateKg || 1050);
  const [innovationModifier, setInnovationModifier] = useState<number>(0); // % modifier

  const modelInput: MLModelInput = {
    cementKg: customCement,
    blastFurnaceSlagKg: 0,
    flyAshKg: customFlyAsh,
    waterKg: customWater,
    superplasticizerKg: customSP,
    coarseAggregateKg: customCoarseAgg,
    fineAggregateKg: customFineAgg,
    innovationModifierPercent: innovationModifier,
    ageDays,
    curingCondition,
  };

  const prediction = predictConcreteStrength(modelInput, selectedModel);
  const metric = MODEL_VALIDATION_METRICS[selectedModel];

  // Actual experimental 28-day result if exists
  const actual28List = activeProject.specimens.filter((s) => s.ageDays === 28);
  const actual28Avg =
    actual28List.length > 0
      ? Number((actual28List.reduce((a, b) => a + b.compressiveStrengthMPa, 0) / actual28List.length).toFixed(1))
      : null;

  const targetFc = activeProject.parameters.targetStrengthFc;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Machine Learning Compressive Strength Predictor</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">Prediksi Kuat Tekan Berbasis Data Eksperimental</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Model regresi tervalidasi dataset UCI (1.030 data uji) dikombinasikan dengan persamaan hidrasi semen ACI 209
          </p>
        </div>

        {/* Model Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setSelectedModel("xgboost")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedModel === "xgboost"
                ? "bg-[#142D45] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            XGBoost (R² 0.94)
          </button>
          <button
            onClick={() => setSelectedModel("randomForest")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedModel === "randomForest"
                ? "bg-[#142D45] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Random Forest (R² 0.93)
          </button>
          <button
            onClick={() => setSelectedModel("linear")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedModel === "linear"
                ? "bg-[#142D45] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Linear Regression
          </button>
        </div>
      </div>

      {/* TOR Benchmark Sync Banner */}
      {activeProject.torAnalysis && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Sinkronisasi Prediksi vs Target TOR:</span>
                <span className="font-mono text-emerald-800 font-bold">{activeProject.torAnalysis.targetStrengthFc} MPa</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Model ML memprediksi apakah formula campuran beton memenuhi target mutu f&apos;c kompetisi tanpa penalti under-strength.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCustomCement(res?.cementContentKg || 380);
              setCustomWater(res?.waterContentDesignKg || 195);
              setCustomFlyAsh(res?.supplementaryContentKg || 0);
              setCustomSP(res?.admixtureKg || 2.5);
              setCustomFineAgg(res?.fineAggregateKg || 720);
              setCustomCoarseAgg(res?.coarseAggregateKg || 1050);
            }}
            className="px-3 py-1.5 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Muat Proporsi TOR Aktif</span>
          </button>
        </div>
      )}

      {/* Main Grid: Parameters Control vs Prediction Results & Age Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#286B9B]" />
              <span>Parameter Input Prediksi</span>
            </h3>
            <button
              onClick={() => {
                setCustomCement(res?.cementContentKg || 380);
                setCustomWater(res?.waterContentDesignKg || 195);
                setCustomFlyAsh(res?.supplementaryContentKg || 0);
                setCustomSP(res?.admixtureKg || 2.5);
                setCustomFineAgg(res?.fineAggregateKg || 720);
                setCustomCoarseAgg(res?.coarseAggregateKg || 1050);
                setInnovationModifier(0);
                setAgeDays(28);
              }}
              className="text-[11px] text-[#286B9B] hover:underline flex items-center gap-1"
              title="Reset ke resep mix design proyek"
            >
              <RotateCw className="w-3 h-3" />
              <span>Sinkronkan Proyek</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Umur Beton (Hari)</label>
                <select
                  value={ageDays}
                  onChange={(e) => setAgeDays(parseInt(e.target.value) || 28)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900"
                >
                  <option value="3">3 Hari</option>
                  <option value="7">7 Hari</option>
                  <option value="14">14 Hari</option>
                  <option value="28">28 Hari (Standar)</option>
                  <option value="56">56 Hari</option>
                  <option value="90">90 Hari</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Kondisi Curing</label>
                <select
                  value={curingCondition}
                  onChange={(e) => setCuringCondition(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Water Curing (Standar)">Water Curing (Standar)</option>
                  <option value="Air Curing">Air Curing (-15% kuat)</option>
                  <option value="Steam Curing">Steam Curing (+Cepat)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Semen (kg/m³)</label>
                <input
                  type="number"
                  value={customCement}
                  onChange={(e) => setCustomCement(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Air Pencampur (kg/m³)</label>
                <input
                  type="number"
                  value={customWater}
                  onChange={(e) => setCustomWater(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-[#286B9B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Fly Ash / SCM (kg/m³)</label>
                <input
                  type="number"
                  value={customFlyAsh}
                  onChange={(e) => setCustomFlyAsh(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Superplasticizer (kg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customSP}
                  onChange={(e) => setCustomSP(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Pasir Halus (kg/m³)</label>
                <input
                  type="number"
                  value={customFineAgg}
                  onChange={(e) => setCustomFineAgg(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Kerikil Kasar (kg/m³)</label>
                <input
                  type="number"
                  value={customCoarseAgg}
                  onChange={(e) => setCustomCoarseAgg(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-600 font-semibold">Efek Material Inovasi (% Pengaruh)</label>
                <span className="font-mono font-bold text-[#286B9B]">{innovationModifier > 0 ? "+" : ""}{innovationModifier}%</span>
              </div>
              <input
                type="range"
                min="-20"
                max="25"
                step="1"
                value={innovationModifier}
                onChange={(e) => setInnovationModifier(parseInt(e.target.value) || 0)}
                className="w-full accent-[#286B9B]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>-20% (Substitusi plastik PET tinggi)</span>
                <span>+25% (Serat bambu + silica fume)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span>Rasio w/c Aktual Input:</span>
                <span className="font-mono font-bold">
                  {(customWater / Math.max(1, customCement + customFlyAsh)).toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Prediction Score Card */}
          <div className="bg-gradient-to-r from-[#142D45] to-[#286B9B] rounded-xl text-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-blue-200 text-xs font-semibold mb-2">
              <span>HASIL PREDIKSI KUAT TEKAN (UMUR {ageDays} HARI)</span>
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white">{metric.modelName}</span>
            </div>

            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-5xl font-bold font-mono tracking-tight text-white">
                {prediction.predictedStrengthMPa}
              </span>
              <span className="text-xl font-bold text-blue-200">MPa</span>
              <span className="text-xs text-blue-200 font-mono">
                (Ketidakpastian ± {prediction.uncertaintyMarginMPa} MPa)
              </span>
            </div>

            {/* Comparison Bar: Target vs Predicted vs Actual */}
            <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2 rounded bg-black/20">
                <span className="text-blue-200 block text-[10px] uppercase">Calculated SNI (Target)</span>
                <span className="font-mono font-bold text-base text-white">{targetFc} MPa</span>
              </div>
              <div className="p-2 rounded bg-white/20">
                <span className="text-blue-100 block text-[10px] uppercase">Predicted ML</span>
                <span className="font-mono font-bold text-base text-[#64B5F6]">{prediction.predictedStrengthMPa} MPa</span>
              </div>
              <div className="p-2 rounded bg-black/20">
                <span className="text-blue-200 block text-[10px] uppercase">Experimental Lab (28D)</span>
                <span className="font-mono font-bold text-base text-white">
                  {actual28Avg !== null ? `${actual28Avg} MPa` : "Belum Ada"}
                </span>
              </div>
            </div>
          </div>

          {/* Age Progression Prediction Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Kurva Prediksi Perkembangan Kuat Tekan Berdasarkan Umur
                </h4>
                <p className="text-[11px] text-slate-500">Persamaan kematangan hidrasi semen ACI 209 (3 s.d 90 Hari)</p>
              </div>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 px-2 pt-4 bg-slate-50 rounded-lg border border-slate-200">
              {prediction.ageCurve.map((pt) => {
                const maxBar = 70;
                const barHeight = Math.min(100, (pt.strengthMPa / maxBar) * 100);
                const isSelectedAge = pt.ageDays === ageDays;

                return (
                  <div key={pt.ageDays} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div
                      className={`w-10 rounded-t flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all ${
                        isSelectedAge ? "bg-[#286B9B] ring-2 ring-[#142D45]" : "bg-slate-400"
                      }`}
                      style={{ height: `${barHeight}%` }}
                    >
                      {pt.strengthMPa}
                    </div>
                    <span className="text-[11px] font-mono text-slate-700 mt-2 font-semibold">
                      {pt.ageDays}D
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Validation Transparency Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Validasi Model Machine Learning & Batas Penggunaan
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase">R² Score</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{metric.r2}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase">MAE (Error)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{metric.mae} MPa</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase">RMSE</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{metric.rmse} MPa</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block uppercase">K-Fold CV</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{metric.crossValidationScore}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 pt-1">
              <p><strong>Dataset Latihan:</strong> {metric.datasetName} ({metric.sampleCount} sampel)</p>
              <p><strong>Batas Validitas:</strong> {metric.boundsOfApplicability}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
