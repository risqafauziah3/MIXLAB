import React, { useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Trash2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Zap,
  FileSearch,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { ConcreteSpecimenTest, SpecimenShape } from "../../types";

export const TestingEvaluationView: React.FC = () => {
  const { activeProject, addSpecimen, deleteSpecimen, generateSpecimensFromTor } = useProjects();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding specimen
  const [code, setCode] = useState(`BN-${new Date().getMonth() + 1}-0${activeProject.specimens.length + 1}`);
  const [mixVariant, setMixVariant] = useState(activeProject.innovations[0]?.code || "Mix 0 (Kontrol)");
  const [specimenType, setSpecimenType] = useState<SpecimenShape>(activeProject.parameters.specimenType || "cylinder_150x300");
  const [dimWidth, setDimWidth] = useState(150.0);
  const [dimHeight, setDimHeight] = useState(300.0);
  const [weightGrams, setWeightGrams] = useState(12500);
  const [ageDays, setAgeDays] = useState(28);
  const [maxLoadKN, setMaxLoadKN] = useState(510.0);
  const [slumpMm, setSlumpMm] = useState(85);
  const [failurePattern, setFailurePattern] = useState<"Cone" | "Cone & Split" | "Shear">("Cone");
  const [notes, setNotes] = useState("");

  const specimens = activeProject.specimens;
  const targetFc = activeProject.parameters.targetStrengthFc;

  // Filter 28-day specimens for evaluation
  const specimens28 = specimens.filter((s) => s.ageDays === 28);
  const avg28 =
    specimens28.length > 0
      ? specimens28.reduce((a, b) => a + b.compressiveStrengthMPa, 0) / specimens28.length
      : 0;

  // Standard deviation of 28 day specimens
  const stdDev28 =
    specimens28.length > 1
      ? Math.sqrt(
          specimens28.reduce((acc, s) => acc + Math.pow(s.compressiveStrengthMPa - avg28, 2), 0) /
            (specimens28.length - 1)
        )
      : 0;

  const min28 = specimens28.length > 0 ? Math.min(...specimens28.map((s) => s.compressiveStrengthMPa)) : 0;
  const max28 = specimens28.length > 0 ? Math.max(...specimens28.map((s) => s.compressiveStrengthMPa)) : 0;
  const characteristicFc = Number((avg28 - 1.64 * stdDev28).toFixed(2));

  // SNI 2847:2019 Acceptance criteria:
  // 1. Rata-rata 28 hari >= targetFc
  // 2. Tidak ada nilai individu < targetFc - 3.5 MPa
  const isAvgPass = avg28 >= targetFc;
  const isIndividualPass = min28 >= targetFc - 3.5;
  const isCompliant = specimens28.length > 0 && isAvgPass && isIndividualPass;

  const handleCreateSpecimen = (e: React.FormEvent) => {
    e.preventDefault();
    // Area calculation
    let areaMm2 = 17671.5;
    if (specimenType.startsWith("cylinder")) {
      areaMm2 = Math.PI * Math.pow(dimWidth / 2, 2);
    } else if (specimenType.startsWith("cube")) {
      areaMm2 = dimWidth * dimWidth;
    }

    // Compressive strength MPa = (Load kN * 1000) / Area mm2
    let mpa = (maxLoadKN * 1000) / areaMm2;
    // If cube, apply standard conversion 0.83 to cylinder equivalent
    if (specimenType.startsWith("cube")) {
      mpa = mpa * 0.83;
    }

    addSpecimen({
      code: code.trim(),
      mixVariant,
      specimenType,
      castingDate: new Date(Date.now() - ageDays * 86400000).toISOString().split("T")[0],
      testingDate: new Date().toISOString().split("T")[0],
      ageDays: Number(ageDays),
      actualDimensionMm: { diameterOrWidth: dimWidth, heightOrLength: dimHeight },
      crossSectionAreaMm2: Number(areaMm2.toFixed(1)),
      weightGrams: Number(weightGrams),
      maxLoadKN: Number(maxLoadKN),
      compressiveStrengthMPa: Number(mpa.toFixed(2)),
      slumpMm: Number(slumpMm),
      failurePattern,
      notes: notes.trim(),
    });

    setShowAddModal(false);
    setCode(`BN-${new Date().getMonth() + 1}-0${specimens.length + 2}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-4 h-4" />
            <span>Pengujian Laboratorium & Evaluasi Mutu Beton</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">Concrete Testing & Evaluation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan data beban desak (kN), konversi MPa aksial, deviasi standar & evaluasi penerimaan SNI 2847
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Input Benda Uji Baru</span>
        </button>
      </div>

      {/* TOR 6-Silinder Sync Banner */}
      {activeProject.torAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#142D45] flex items-center justify-center text-white shrink-0">
              <ClipboardCheck className="w-5 h-5 text-[#64B5F6]" />
            </div>
            <div>
              <div className="font-bold text-[#142D45] flex items-center gap-2">
                <span>Spesifikasi Uji TOR: 6 Silinder 15x30 cm</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#286B9B] font-semibold">
                  Target f&apos;c: {activeProject.torAnalysis.targetStrengthFc} MPa
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Standar kompetisi: 3 silinder diuji pada umur 7 hari dan 3 silinder diuji pada umur 28 hari sesuai SNI 1974:2011.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeProject.torAnalysis) {
                generateSpecimensFromTor(activeProject.torAnalysis);
              }
            }}
            className="px-3.5 py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate 6 Silinder Jadwal TOR</span>
          </button>
        </div>
      )}

      {/* Statistical Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Rencana (f'c)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{targetFc} MPa</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Umur rencana 28 hari</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rata-Rata Aktual 28 Hari</span>
          <div className="text-2xl font-bold font-mono text-[#286B9B] mt-1">
            {specimens28.length > 0 ? `${avg28.toFixed(2)} MPa` : "-"}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Dari {specimens28.length} sampel silinder</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deviasi Standar (s)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stdDev28 > 0 ? `${stdDev28.toFixed(2)} MPa` : "-"}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Keseragaman produksi</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status Penerimaan SNI</span>
          <div className="mt-1 flex items-center gap-1.5">
            {specimens28.length === 0 ? (
              <span className="text-xs font-semibold text-slate-400">Menunggu uji 28D</span>
            ) : isCompliant ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MEMENUHI SYARAT</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>EVALUASI DIBUTUHKAN</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Klausul SNI 2847:2019</span>
        </div>
      </div>

      {/* Main Specimens Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Benda Uji Tekan Laboratorium ({specimens.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Perhitungan kuat tekan f'c = Beban Runtuh (P) / Luas Penampang Aktual (A)
            </p>
          </div>
        </div>

        {specimens.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Kode Sampel</th>
                  <th className="py-2.5 px-3">Variasi Campuran</th>
                  <th className="py-2.5 px-3">Bentuk & Ukuran</th>
                  <th className="py-2.5 px-3 text-center">Umur Uji</th>
                  <th className="py-2.5 px-3 text-right">Luas (mm²)</th>
                  <th className="py-2.5 px-3 text-right">Beban Maks (kN)</th>
                  <th className="py-2.5 px-3 text-right">Kuat Tekan (MPa)</th>
                  <th className="py-2.5 px-3 text-center">Pola Retak</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {specimens.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{sp.code}</td>
                    <td className="py-3 px-3 text-slate-700">{sp.mixVariant}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {sp.specimenType.replace(/_/g, " ")} ({sp.actualDimensionMm.diameterOrWidth}x{sp.actualDimensionMm.heightOrLength} mm)
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#142D45]">
                      {sp.ageDays} Hari
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {sp.crossSectionAreaMm2.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                      {sp.maxLoadKN.toFixed(1)} kN
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#286B9B]">
                      {sp.compressiveStrengthMPa.toFixed(2)} MPa
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 text-[11px]">
                      {sp.failurePattern || "Cone"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteSpecimen(sp.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Hapus data benda uji"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Belum ada data benda uji diinput.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-[#286B9B] hover:underline font-semibold"
            >
              + Input Sampel Benda Uji Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal: Input Specimen Test */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#142D45] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Input Hasil Uji Kuat Tekan Laboratorium</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpecimen} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Benda Uji</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Variasi Campuran</label>
                  <select
                    value={mixVariant}
                    onChange={(e) => setMixVariant(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="Mix 0 (Kontrol)">Mix 0 (Kontrol)</option>
                    <option value="Mix 1 (Inovasi Rendah)">Mix 1 (Inovasi Rendah)</option>
                    <option value="Mix 2 (Inovasi Optimum)">Mix 2 (Inovasi Optimum)</option>
                    <option value="Mix 3 (Inovasi Tinggi)">Mix 3 (Inovasi Tinggi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bentuk Sampel</label>
                  <select
                    value={specimenType}
                    onChange={(e) => {
                      const t = e.target.value as SpecimenShape;
                      setSpecimenType(t);
                      if (t === "cylinder_100x200") {
                        setDimWidth(100);
                        setDimHeight(200);
                        setWeightGrams(3650);
                      } else if (t === "cube_150") {
                        setDimWidth(150);
                        setDimHeight(150);
                        setWeightGrams(8100);
                      } else {
                        setDimWidth(150);
                        setDimHeight(300);
                        setWeightGrams(12500);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="cylinder_150x300">Silinder 150x300 mm</option>
                    <option value="cylinder_100x200">Silinder 100x200 mm</option>
                    <option value="cube_150">Kubus 150x150 mm</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Umur Uji (Hari)</label>
                  <select
                    value={ageDays}
                    onChange={(e) => setAgeDays(parseInt(e.target.value) || 28)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold"
                  >
                    <option value="3">3 Hari</option>
                    <option value="7">7 Hari</option>
                    <option value="14">14 Hari</option>
                    <option value="28">28 Hari</option>
                    <option value="56">56 Hari</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beban Maksimal (kN)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={maxLoadKN}
                    onChange={(e) => setMaxLoadKN(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-[#286B9B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Pola Keruntuhan (Failure Pattern)</label>
                  <select
                    value={failurePattern}
                    onChange={(e) => setFailurePattern(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="Cone">Tipe 1: Kerucut (Cone) - Ideal</option>
                    <option value="Cone & Split">Tipe 2: Cone & Split</option>
                    <option value="Shear">Tipe 3: Geser (Shear)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Catatan Pengujian</label>
                  <input
                    type="text"
                    placeholder="Kondisi capping belerang / rubber pad"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#142D45] text-white rounded font-semibold hover:bg-[#1D3E5E]"
                >
                  Simpan Hasil Uji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
