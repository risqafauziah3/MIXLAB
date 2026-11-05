import React, { useState } from "react";
import {
  FolderKanban,
  Search,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Layers,
  FlaskConical,
  ClipboardCheck,
  FileDown,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { NavTab } from "../layout/Sidebar";
import { ProjectStatus } from "../../types";

interface ProjectsViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenCreateProjectModal: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onNavigateTab,
  onOpenCreateProjectModal,
}) => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    deleteProject,
    duplicateProject,
    updateProject,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartEdit = (p: typeof projects[0]) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateProject(id, { name: editName.trim(), description: editDesc.trim() });
    setEditingId(null);
  };

  const handleDeleteWithConfirm = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus proyek "${name}"? Data pengujian dan mix design akan dihapus secara permanen.`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters, and New Project */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama proyek, agregat, atau inovasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#286B9B]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="Design in Progress">Design in Progress</option>
            <option value="Waiting for Testing">Waiting for Testing</option>
            <option value="Testing Completed">Testing Completed</option>
            <option value="Needs Evaluation">Needs Evaluation</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          onClick={onOpenCreateProjectModal}
          className="px-4 py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Proyek Baru</span>
        </button>
      </div>

      {/* Projects Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const isActive = p.id === activeProjectId;
          const isEditing = editingId === p.id;
          const specimens28 = p.specimens.filter((s) => s.ageDays === 28);
          const avg28 =
            specimens28.length > 0
              ? (specimens28.reduce((a, b) => a + b.compressiveStrengthMPa, 0) / specimens28.length).toFixed(1)
              : null;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between shadow-2xs ${
                isActive ? "border-[#286B9B] ring-2 ring-[#286B9B]/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="p-5">
                {/* Header status & active indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      p.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : p.status === "Testing Completed"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : p.status === "Needs Evaluation"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {p.status}
                  </span>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#286B9B]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sedang Aktif</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveProjectId(p.id)}
                      className="text-[11px] font-medium text-slate-500 hover:text-[#286B9B]"
                    >
                      Jadikan Aktif
                    </button>
                  )}
                </div>

                {/* Project Title / Inline Editing */}
                {isEditing ? (
                  <div className="space-y-2 mb-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 border border-[#286B9B] rounded text-xs font-bold text-slate-900"
                    />
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-600"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSaveEdit(p.id)}
                        className="px-2.5 py-1 text-[11px] bg-[#286B9B] text-white rounded font-medium"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <h3
                      onClick={() => {
                        setActiveProjectId(p.id);
                        onNavigateTab("mixdesign");
                      }}
                      className="text-sm font-bold text-[#142D45] hover:text-[#286B9B] cursor-pointer line-clamp-1"
                      title={p.name}
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                      {p.description || "Tidak ada deskripsi proyek."}
                    </p>
                  </div>
                )}

                {/* Engineering specs badges */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target f'c</span>
                    <span className="font-bold text-slate-900 font-mono">{p.parameters.targetStrengthFc} MPa</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Metode</span>
                    <span className="font-semibold text-slate-800 text-[11px] truncate block">
                      {p.parameters.method.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Slump Target</span>
                    <span className="font-mono text-slate-700">{p.parameters.slumpMin}-{p.parameters.slumpMax} mm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Benda Uji Teruji</span>
                    <span className="font-mono text-slate-700">
                      {p.specimens.length} buah {avg28 ? `(28D: ${avg28} MPa)` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Diperbarui: {p.updatedAt}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    title="Edit Nama/Deskripsi"
                  >
                    Edit
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => duplicateProject(p.id)}
                    className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                    title="Salin Proyek"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => handleDeleteWithConfirm(p.id, p.name)}
                    className="text-rose-600 hover:text-rose-800 font-medium"
                    title="Hapus Proyek"
                  >
                    Hapus
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveProjectId(p.id);
                    onNavigateTab("mixdesign");
                  }}
                  className="px-3 py-1 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Buka</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
