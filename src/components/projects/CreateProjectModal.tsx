import React, { useState } from "react";
import { X, Layers, Plus } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { ConcreteStandardMethod } from "../../types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate,
}) => {
  const { createProject } = useProjects();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<ConcreteStandardMethod>("SNI_7656_2012");
  const [concreteType, setConcreteType] = useState<
    "Beton Normal" | "Beton Mutu Tinggi" | "Beton Serat" | "Beton Ramah Lingkungan"
  >("Beton Normal");
  const [targetStrengthFc, setTargetStrengthFc] = useState(28);
  const [slumpMin, setSlumpMin] = useState(75);
  const [slumpMax, setSlumpMax] = useState(100);
  const [maxAggregateSize, setMaxAggregateSize] = useState(19);
  const [plannedVolumeM3, setPlannedVolumeM3] = useState(0.05);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject({
      name: name.trim(),
      description: description.trim(),
      parameters: {
        method,
        concreteType,
        targetStrengthFc: Number(targetStrengthFc),
        slumpMin: Number(slumpMin),
        slumpMax: Number(slumpMax),
        maxAggregateSize: Number(maxAggregateSize),
        designAgeDays: 28,
        plannedVolumeM3: Number(plannedVolumeM3),
        airEntrained: false,
        airContentPercent: 1.5,
        exposureCondition: "Normal",
        plannedSpecimensCount: 6,
        specimenType: "cylinder_150x300",
        wasteFactorPercent: 10,
      },
    });

    onClose();
    if (onSuccessNavigate) onSuccessNavigate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#142D45] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#64B5F6]" />
            <h3 className="font-bold text-base">Buat Proyek Beton Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Nama Proyek <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Beton Mutu Tinggi f'c 35 MPa Fly Ash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#286B9B] focus:border-transparent text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Deskripsi & Tujuan</label>
            <textarea
              rows={2}
              placeholder="Jelaskan tujuan perancangan, aplikasi elemen struktur, atau variasi material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#286B9B] focus:border-transparent text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Metode Mix Design</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as ConcreteStandardMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#286B9B] text-xs"
              >
                <option value="SNI_7656_2012">SNI 7656:2012 (Volume Absolut)</option>
                <option value="SNI_03_2834_2000">SNI 03-2834-2000 (Metode DoE)</option>
                <option value="ACI_211_1">ACI 211.1 (Standard Practice)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Jenis Beton</label>
              <select
                value={concreteType}
                onChange={(e) => setConcreteType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#286B9B] text-xs"
              >
                <option value="Beton Normal">Beton Normal</option>
                <option value="Beton Mutu Tinggi">Beton Mutu Tinggi (&gt; 35 MPa)</option>
                <option value="Beton Serat">Beton Berserat (FRC)</option>
                <option value="Beton Ramah Lingkungan">Beton Ramah Lingkungan / SCM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Target f'c (MPa)</label>
              <input
                type="number"
                min="10"
                max="80"
                step="0.5"
                value={targetStrengthFc}
                onChange={(e) => setTargetStrengthFc(parseFloat(e.target.value) || 28)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Slump Target (mm)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="25"
                  max="200"
                  value={slumpMin}
                  onChange={(e) => setSlumpMin(parseInt(e.target.value) || 75)}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 text-center text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  min="25"
                  max="200"
                  value={slumpMax}
                  onChange={(e) => setSlumpMax(parseInt(e.target.value) || 100)}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 text-center text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Dmax Kerikil (mm)</label>
              <select
                value={maxAggregateSize}
                onChange={(e) => setMaxAggregateSize(parseInt(e.target.value) || 19)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono text-xs"
              >
                <option value="10">10 mm (3/8")</option>
                <option value="12.5">12.5 mm (1/2")</option>
                <option value="19">19 mm (3/4")</option>
                <option value="25">25 mm (1")</option>
                <option value="37.5">37.5 mm (1.5")</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Rencana Volume Batch Laboratorium (m³)
            </label>
            <input
              type="number"
              step="0.005"
              min="0.01"
              max="5.0"
              value={plannedVolumeM3}
              onChange={(e) => setPlannedVolumeM3(parseFloat(e.target.value) || 0.05)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Contoh: 0.05 m³ = 50 Liter (cukup untuk ~6 silinder 150x300 mm + uji slump)
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Buat Proyek</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
