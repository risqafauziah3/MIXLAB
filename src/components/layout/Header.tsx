import React, { useState } from "react";
import {
  Menu,
  Plus,
  FolderOpen,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { NavTab } from "./Sidebar";
import { exportProjectToExcel, exportProjectToPdf } from "../../utils/exportUtils";

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenCreateProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onNavigateTab,
  onOpenCreateProjectModal,
}) => {
  const { projects, activeProjectId, activeProject, setActiveProjectId } = useProjects();
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: "Engineering Dashboard", subtitle: "Ringkasan performa campuran, status benda uji & analitik" },
    projects: { title: "Kelola Proyek Beton", subtitle: "Manajemen portofolio mix design & arsip pengujian laboratorium" },
    tor: { title: "TOR Competition Advisor", subtitle: "Analisis cerdas Term of Reference lomba beton nasional & strategi campuran" },
    mixdesign: { title: "Concrete Mix Design Workstation", subtitle: "Perancangan campuran berdasarkan SNI 7656:2012, SNI 03-2834-2000 & ACI 211.1" },
    laboratory: { title: "Material Laboratory Testing", subtitle: "Analisis saringan gradasi agregat, berat jenis, penyerapan & abrasi Los Angeles" },
    predictor: { title: "Compressive Strength Predictor", subtitle: "Prediksi kuat tekan machine learning tervalidasi dataset & kurva kematangan ACI 209" },
    testing: { title: "Concrete Testing & Evaluation", subtitle: "Pencatatan beban runtuh mesin desak, evaluasi deviasi standar & grafik umur" },
    innovation: { title: "Concrete Innovation Lab", subtitle: "Eksplorasi substitusi material pozzolan, daur ulang limbah PET & serat alami" },
    research: { title: "Research Center & Standards Library", subtitle: "Koleksi standar BSN SNI resmi & metadata jurnal ilmiah terverifikasi" },
    assistant: { title: "MIXLAB AI Engineering Assistant", subtitle: "Konsultasi teknis, pemecahan masalah w/c & interpretasi standar" },
    reports: { title: "Reports & Export Center", subtitle: "Cetak dokumen teknik resmi format PDF dan lembar kerja multi-sheet Excel (.xlsx)" },
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
      case "Testing Completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "Waiting for Testing":
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case "Needs Evaluation":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Tab Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold text-[#142D45] truncate">
              {tabTitles[currentTab]?.title || "MIXLAB"}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {tabTitles[currentTab]?.subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: Project Switcher & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProjectPicker(!showProjectPicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#286B9B]" />
              <span className="hidden lg:inline text-slate-500">Proyek:</span>
              <span className="max-w-[130px] truncate text-slate-900 font-semibold">
                {activeProject.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showProjectPicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProjectPicker(false)}
                />
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 font-semibold text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Pilih Proyek Aktif ({projects.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveProjectId(p.id);
                          setShowProjectPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          p.id === activeProjectId ? "bg-blue-50/70 text-[#286B9B] font-semibold" : "text-slate-700"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            f'c {p.parameters.targetStrengthFc} MPa · {p.parameters.concreteType}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {getStatusIcon(p.status)}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-2 pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProjectPicker(false);
                        onNavigateTab("projects");
                      }}
                      className="w-full text-center py-1.5 text-xs text-[#286B9B] hover:underline font-medium"
                    >
                      Buka Manajer Proyek
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              title="Unduh Laporan"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      exportProjectToExcel(activeProject);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Download Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportProjectToPdf(activeProject);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Download PDF Resmi</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* New Project CTA */}
          <button
            onClick={onOpenCreateProjectModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#142D45] hover:bg-[#1D3E5E] rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Proyek Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
