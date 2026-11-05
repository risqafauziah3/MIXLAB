import React from "react";
import {
  FolderKanban,
  Layers,
  FlaskConical,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  FileSearch,
  Sparkles,
  BotMessageSquare,
  FileDown,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { NavTab } from "../layout/Sidebar";

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenCreateProjectModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenCreateProjectModal,
}) => {
  const { projects, activeProject, setActiveProjectId } = useProjects();

  // Aggregate metrics
  const totalProjects = projects.length;
  const totalMixDesigns = projects.filter((p) => p.calculationResult).length;
  const totalMaterials = projects.reduce(
    (acc, p) => acc + (p.cement ? 1 : 0) + (p.fineAggregate ? 1 : 0) + (p.coarseAggregate ? 1 : 0),
    0
  );
  const totalSpecimens = projects.reduce((acc, p) => acc + p.specimens.length, 0);

  // Strength results of active project
  const specimens28 = activeProject.specimens.filter((s) => s.ageDays === 28);
  const avg28Actual =
    specimens28.length > 0
      ? (specimens28.reduce((a, b) => a + b.compressiveStrengthMPa, 0) / specimens28.length).toFixed(1)
      : null;
  const targetFc = activeProject.parameters.targetStrengthFc;
  const isTargetAchieved = avg28Actual !== null && Number(avg28Actual) >= targetFc;

  // Age progression data points for active project
  const agePoints = [3, 7, 14, 28];
  const ageProgressionData = agePoints.map((age) => {
    const list = activeProject.specimens.filter((s) => s.ageDays === age);
    const avg =
      list.length > 0
        ? Number((list.reduce((a, b) => a + b.compressiveStrengthMPa, 0) / list.length).toFixed(1))
        : null;
    return { age, actualMPa: avg };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Completed</span>;
      case "Testing Completed":
        return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Testing Completed</span>;
      case "Waiting for Testing":
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Waiting for Testing</span>;
      case "Needs Evaluation":
        return <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Needs Evaluation</span>;
      default:
        return <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Design in Progress</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Overview */}
      <div className="bg-gradient-to-r from-[#142D45] to-[#286B9B] rounded-xl text-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-blue-200 text-xs font-semibold tracking-wider uppercase">
              <span>MIXLAB Engineering Decision Support</span>
              <span>·</span>
              <span>SNI 7656:2012 / SNI 03-2834</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              Proyek Aktif: {activeProject.name}
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Target Mutu <span className="font-semibold text-white font-mono">f'c {targetFc} MPa</span> · Metode{" "}
              <span className="font-semibold text-white">{activeProject.parameters.method.replace(/_/g, " ")}</span> · Slump{" "}
              <span className="font-semibold text-white font-mono">{activeProject.parameters.slumpMin}-{activeProject.parameters.slumpMax} mm</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab("mixdesign")}
              className="px-4 py-2 bg-white text-[#142D45] hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Buka Mix Design</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenCreateProjectModal}
              className="px-4 py-2 bg-[#102437]/80 hover:bg-[#102437] text-white border border-white/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Proyek Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Proyek</span>
            <FolderKanban className="w-4 h-4 text-[#286B9B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalProjects}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tersimpan dalam database</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mix Design Terhitung</span>
            <Layers className="w-4 h-4 text-[#286B9B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalMixDesigns}</div>
          <p className="text-[11px] text-slate-500 mt-1">Koreksi kadar air otomatis</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Data Material Lab</span>
            <FlaskConical className="w-4 h-4 text-[#286B9B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalMaterials}</div>
          <p className="text-[11px] text-slate-500 mt-1">Semen, pasir & kerikil</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Benda Uji</span>
            <ClipboardCheck className="w-4 h-4 text-[#286B9B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalSpecimens}</div>
          <p className="text-[11px] text-slate-500 mt-1">Silinder & kubus teruji</p>
        </div>
      </div>

      {/* Main Grid: Charts & Analytical Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Strength Development Graph */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Perkembangan Kuat Tekan Beton Aktual (Umur 3 - 28 Hari)</h3>
              <p className="text-xs text-slate-500">
                Data benda uji aktual laboratorium untuk {activeProject.name}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("testing")}
              className="text-xs text-[#286B9B] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Detail Uji</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Graphical Visualization */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <div className="h-56 w-full flex items-end justify-between gap-6 px-4 pt-6 pb-2">
              {ageProgressionData.map((d) => {
                const maxChart = Math.max(45, targetFc * 1.3);
                const actualHeight = d.actualMPa ? (d.actualMPa / maxChart) * 100 : 0;
                const targetHeight = (targetFc / maxChart) * 100;

                return (
                  <div key={d.age} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-2 h-44 relative">
                      {/* Target marker line reference */}
                      <div
                        className="absolute w-full border-t border-dashed border-rose-400 z-10 pointer-events-none"
                        style={{ bottom: `${targetHeight}%` }}
                        title={`Target f'c = ${targetFc} MPa`}
                      />

                      {/* Actual Strength Bar */}
                      <div className="w-12 bg-gradient-to-t from-[#142D45] to-[#286B9B] rounded-t flex flex-col justify-between items-center py-1 transition-all duration-300"
                        style={{ height: `${actualHeight}%` }}
                      >
                        <span className="text-[10px] text-white font-bold font-mono">
                          {d.actualMPa ? `${d.actualMPa}` : "-"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 mt-2 font-mono">
                      {d.age} Hari
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {d.actualMPa ? `${((d.actualMPa / targetFc) * 100).toFixed(0)}% f'c` : "Belum diuji"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Target status note */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#142D45] rounded-xs" />
                  <span className="text-slate-600">Kuat Tekan Aktual (MPa)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-rose-400 border-t border-dashed border-rose-500" />
                  <span className="text-slate-600">Garis Target f'c ({targetFc} MPa)</span>
                </div>
              </div>
              <div>
                {avg28Actual !== null ? (
                  <span className={`font-semibold ${isTargetAchieved ? "text-emerald-700" : "text-amber-700"}`}>
                    {isTargetAchieved ? "✓ Target 28 Hari Tercapai" : "⚠ Belum Memenuhi Target Mutu"}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Menunggu pengujian 28 hari</span>
                )}
              </div>
            </div>
          </div>

          {/* Mix Variations Comparison Strip */}
          <div className="mt-5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Variasi Campuran & Inovasi Terdaftar ({activeProject.innovations.length})
            </h4>
            {activeProject.innovations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeProject.innovations.map((iv) => (
                  <div key={iv.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#142D45]">{iv.code}: {iv.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{iv.dosagePercent}%</span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">{iv.materialName} ({iv.substitutionType})</div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Prediksi Kuat:</span>
                      <span className="font-semibold text-slate-900 font-mono">{iv.predictedStrengthMpa} MPa</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Belum ada variasi inovasi. Buka menu Innovation Lab untuk menambahkan variasi.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Access Tools & Project Status summary */}
        <div className="space-y-6">
          {/* Quick Access Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Pintasan Fitur Utama</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab("mixdesign")}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#286B9B] hover:bg-blue-50/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-[#286B9B] rounded-lg group-hover:bg-[#286B9B] group-hover:text-white transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hitung Mix Design</div>
                    <div className="text-[11px] text-slate-500">Koreksi air agregat & proporsi SNI</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#286B9B]" />
              </button>

              <button
                onClick={() => onNavigateTab("tor")}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#286B9B] hover:bg-blue-50/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileSearch className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Analisis TOR Kompetisi</div>
                    <div className="text-[11px] text-slate-500">Ekstraksi PDF dan strategi campuran</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#286B9B]" />
              </button>

              <button
                onClick={() => onNavigateTab("predictor")}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#286B9B] hover:bg-blue-50/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Strength Predictor (ML)</div>
                    <div className="text-[11px] text-slate-500">Model estimasi kuat tekan beton</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#286B9B]" />
              </button>

              <button
                onClick={() => onNavigateTab("innovation")}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#286B9B] hover:bg-blue-50/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Innovation Lab</div>
                    <div className="text-[11px] text-slate-500">PET, serat pisang & FABA pozzolan</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#286B9B]" />
              </button>

              <button
                onClick={() => onNavigateTab("assistant")}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#286B9B] hover:bg-blue-50/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <BotMessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tanya AI Assistant</div>
                    <div className="text-[11px] text-slate-500">Troubleshooting f'c & justifikasi SNI</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#286B9B]" />
              </button>
            </div>
          </div>

          {/* Active Mix Recipe Summary Box */}
          <div className="bg-[#142D45] text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Resep Campuran 1 m³
              </span>
              <span className="text-xs font-mono text-white">
                fas {activeProject.calculationResult?.waterCementRatio || "-"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-300">Air Netto Mixer:</span>
                <span className="font-mono font-semibold text-white">
                  {activeProject.calculationResult?.moistureCorrection.netWaterToBatchKg} kg
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-300">Semen Portland:</span>
                <span className="font-mono font-semibold text-white">
                  {activeProject.calculationResult?.cementContentKg} kg
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-300">Pasir (Koreksi Basah):</span>
                <span className="font-mono font-semibold text-white">
                  {activeProject.calculationResult?.moistureCorrection.fineAggregateWetKg} kg
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-300">Kerikil (Koreksi Basah):</span>
                <span className="font-mono font-semibold text-white">
                  {activeProject.calculationResult?.moistureCorrection.coarseAggregateWetKg} kg
                </span>
              </div>
              {activeProject.calculationResult?.admixtureKg ? (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-300">Admixture Kimia:</span>
                  <span className="font-mono font-semibold text-white">
                    {activeProject.calculationResult?.admixtureKg} kg
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">Rasio Campuran:</span>
              <span className="font-mono font-semibold text-[#64B5F6]">
                {activeProject.calculationResult?.mixRatio || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daftar Portofolio Proyek Terakhir</h3>
            <p className="text-xs text-slate-500">Klik baris proyek untuk beralih dan melihat perhitungan detail</p>
          </div>
          <button
            onClick={() => onNavigateTab("projects")}
            className="text-xs text-[#286B9B] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Semua Proyek</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Nama Proyek</th>
                <th className="py-2.5 px-3">Metode Standar</th>
                <th className="py-2.5 px-3 text-right">Target f'c</th>
                <th className="py-2.5 px-3 text-right">Slump</th>
                <th className="py-2.5 px-3 text-center">Benda Uji</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => {
                const isActive = p.id === activeProject.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setActiveProjectId(p.id)}
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                      isActive ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#286B9B]" />}
                        <span className="truncate max-w-xs">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {p.parameters.method.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      {p.parameters.targetStrengthFc} MPa
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {p.parameters.slumpMin}-{p.parameters.slumpMax} mm
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700">
                      {p.specimens.length} buah
                    </td>
                    <td className="py-3 px-3 text-center">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProjectId(p.id);
                          onNavigateTab("mixdesign");
                        }}
                        className="text-xs text-[#286B9B] hover:text-[#142D45] font-semibold"
                      >
                        Buka
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
