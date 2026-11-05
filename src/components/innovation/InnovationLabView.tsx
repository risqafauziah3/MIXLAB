import React, { useState } from "react";
import {
  Sparkles,
  Search,
  Plus,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  FlaskConical,
  Trash2,
  CheckCircle2,
  FileSearch,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { InnovationVariant } from "../../types";

export const InnovationLabView: React.FC = () => {
  const { activeProject, addInnovation, deleteInnovation, syncTorToEngineeringTools } = useProjects();

  const [searchMaterial, setSearchMaterial] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("banana");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  // Custom innovation input state
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<
    "Semen" | "Agregat Halus" | "Agregat Kasar" | "Serat / Bahan Tambah"
  >("Serat / Bahan Tambah");
  const [customDosage, setCustomDosage] = useState<number>(0.5);
  const [customPretreatment, setCustomPretreatment] = useState("Perendaman alkali NaOH 4% selama 2 jam");

  const PRESET_INNOVATIONS: Record<string, any> = {
    banana: {
      name: "Serat Pelepah Pisang (Banana Pseudo-stem Fiber)",
      category: "Serat Alami Ramah Lingkungan",
      role: "Serat / Bahan Tambah",
      optimumDosage: "0.50% volume adukan (panjang serat 25 mm)",
      pretreatment: "Alkali treatment NaOH 4% (2 jam) untuk hilangkan hemiselulosa",
      workability: "Menurunkan slump ~15-20 mm, butuh superplasticizer",
      strengthFc: "Meningkat +7.5% pada 0.5% vol; menurun jika > 0.75%",
      tensileFlexural: "Kuat lentur naik +24%, menahan retak susut dini",
      pros: "Peningkatan kuat tarik signifikan, keuletan tinggi, memanfaatkan limbah panen pisang.",
      cons: "Daya serap air tinggi jika tidak dilapisi superplasticizer.",
      reference: "Prasad & Ramana (2022) CSCM",
    },
    pet: {
      name: "Cacahan Plastik PET Daur Ulang",
      category: "Limbah Polimer / Daur Ulang",
      role: "Substitusi Agregat Kasar / Halus",
      optimumDosage: "5% - 7.5% volume agregat kasar",
      pretreatment: "Pencucian dengan deterjen non-ionik dan pengayakan ukuran 5-15 mm",
      workability: "Kelecakan menurun akibat sudut butir pipih tajam",
      strengthFc: "Menurun 5-10% pada dosis 5%; turun >25% jika >15%",
      tensileFlexural: "Ketahanan impak dan redaman getaran meningkat",
      pros: "Densitas beton berkurang (beton ringan), mengurangi limbah botol plastik.",
      cons: "Ikatan antarmuka (ITZ) hidrofobik licin.",
      reference: "Saikia & de Brito (2020) J. Cleaner Production",
    },
    faba: {
      name: "Fly Ash Kelas F (FABA PLTU)",
      category: "Pozzolanik Sekunder (SCM)",
      role: "Substitusi Semen Portland",
      optimumDosage: "15% - 25% berat semen",
      pretreatment: "Pengeringan dan pengayakan lolos saringan No. 325 (45 µm)",
      workability: "Meningkatkan slump (efek bola/ball-bearing effect)",
      strengthFc: "Kuat awal lambat; umur 56-90 hari melampaui beton konvensional",
      tensileFlexural: "Kerapatan matriks C-S-H mikroskopis sangat tinggi",
      pros: "Menurunkan panas hidrasi beton massa, ketahanan klorida dan sulfat tinggi.",
      cons: "Kuat tekan 1-3 hari lebih rendah.",
      reference: "Singh & Siddique (2021) CBM",
    },
    bamboo: {
      name: "Serat Bambu + Silica Fume (Hibrida)",
      category: "Serat Mikro Bio-Komposit",
      role: "Kombinasi Pengikat & Penguat",
      optimumDosage: "Serat bambu 0.5% vol + Silica Fume 8% berat semen",
      pretreatment: "Delignifikasi serat dan homogenisasi mekanik",
      workability: "Sangat kental, memerlukan superplasticizer PCE dosis 1.5%",
      strengthFc: "Kuat tekan naik +14.5% (mencapai > 45 MPa)",
      tensileFlexural: "Kuat tarik belah melonjak +32%",
      pros: "Kombinasi pozzolanik ultra-halus dan serat ulet menghasilkan beton performa tinggi.",
      cons: "Biaya admixture dan silica fume lebih tinggi.",
      reference: "Chen, Guo & Ding (2021) CCC",
    },
  };

  const currentPreset = PRESET_INNOVATIONS[selectedPreset] || PRESET_INNOVATIONS.banana;

  const handleSynthesizeAi = async () => {
    setIsAiLoading(true);
    try {
      const resp = await fetch("/api/gemini/innovation-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialName: customName || currentPreset.name,
          materialType: customType,
          intendedUse: customPretreatment,
        }),
      });
      const data = await resp.json();
      if (data.result) {
        setAiAnalysisResult(data.result);
      } else {
        alert("Gagal melakukan sintesis AI: " + (data.error || "Server tidak merespons."));
      }
    } catch (err: any) {
      alert("Error menghubungi server: " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddVariationToProject = (name: string, type: any, dosage: number, pros: string, ref: string) => {
    const nextCode = `Mix ${activeProject.innovations.length + 1}`;
    addInnovation({
      code: nextCode,
      name,
      materialName: name,
      substitutionType: type,
      dosagePercent: dosage,
      predictedWorkability: "Sedang",
      predictedStrengthMpa: activeProject.parameters.targetStrengthFc + 2.5,
      pros,
      cons: "Perlu uji trial mix laboratorium",
      researchRef: ref,
    });
    alert(`Variasi ${nextCode} berhasil ditambahkan ke portofolio proyek!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Concrete Innovation & Sustainable Materials Lab</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">Eksplorasi Inovasi Material Beton</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekomendasi berbasis jurnal ilmiah untuk serat pisang, bambu, sabut kelapa, plastik PET, FABA & SCM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSynthesizeAi()}
            disabled={isAiLoading}
            className="px-4 py-2 bg-[#286B9B] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiLoading ? "Menganalisis Literatur..." : "Sintesis AI Riset Jurnal"}</span>
          </button>
        </div>
      </div>

      {/* TOR Innovation Requirements Banner */}
      {activeProject.torAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Aturan Inovasi TOR:</span>
                <span className="text-purple-800 font-semibold">{activeProject.torAnalysis.innovationRules}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Rekomendasi campuran: 4 variasi (M0 Kontrol, M1 FABA, M2 PET Plastik, M3 Serat Pisang) tervalidasi jurnal bereputasi.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeProject.torAnalysis) {
                syncTorToEngineeringTools(activeProject.torAnalysis, false);
                alert("Variasi inovasi dari TOR berhasil dimuat ke matriks perbandingan proyek!");
              }
            }}
            className="px-3 py-1.5 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Muat Variasi TOR ke Matriks</span>
          </button>
        </div>
      )}

      {/* Preset Material Selector Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedPreset("banana")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            selectedPreset === "banana"
              ? "bg-[#142D45] text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Serat Pelepah Pisang
        </button>
        <button
          onClick={() => setSelectedPreset("pet")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            selectedPreset === "pet"
              ? "bg-[#142D45] text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Daur Ulang Plastik PET
        </button>
        <button
          onClick={() => setSelectedPreset("faba")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            selectedPreset === "faba"
              ? "bg-[#142D45] text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Fly Ash / FABA PLTU
        </button>
        <button
          onClick={() => setSelectedPreset("bamboo")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            selectedPreset === "bamboo"
              ? "bg-[#142D45] text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Serat Bambu + Silica Fume
        </button>
      </div>

      {/* Innovation Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Material Deep Dive */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#286B9B] uppercase tracking-wider block">
                {currentPreset.category}
              </span>
              <h3 className="text-base font-bold text-[#142D45] mt-0.5">{currentPreset.name}</h3>
            </div>
            <button
              onClick={() =>
                handleAddVariationToProject(
                  currentPreset.name,
                  currentPreset.role,
                  0.5,
                  currentPreset.pros,
                  currentPreset.reference
                )
              }
              className="px-3 py-1.5 bg-[#142D45] hover:bg-[#1D3E5E] text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gunakan dalam Variasi Proyek</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Dosis Rekomendasi</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{currentPreset.optimumDosage}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Perlakuan Awal (Pretreatment)</span>
              <span className="font-medium text-slate-800 mt-0.5 block">{currentPreset.pretreatment}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Pengaruh Workability</span>
              <span className="text-slate-700 mt-0.5 block">{currentPreset.workability}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Pengaruh Kuat Tekan (f'c)</span>
              <span className="font-semibold text-emerald-700 mt-0.5 block">{currentPreset.strengthFc}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <span className="font-bold text-emerald-800 block text-[11px] uppercase">Potensi Keunggulan</span>
              <p className="text-emerald-900 mt-0.5">{currentPreset.pros}</p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
              <span className="font-bold text-amber-800 block text-[11px] uppercase">Tantangan & Batasan</span>
              <p className="text-amber-900 mt-0.5">{currentPreset.cons}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Referensi Literatur:</span>
            <span className="font-mono text-[#286B9B] font-semibold">{currentPreset.reference}</span>
          </div>
        </div>

        {/* Right 5 Cols: Custom Material Explorer & AI synthesis result */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#286B9B]" />
                <span>Input Material Inovasi Kustom</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Masukkan material inovasi apa pun untuk diuji rekomendasinya oleh sistem
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Material</label>
                <input
                  type="text"
                  placeholder="Contoh: Abu Sekam Padi, Serat Daun Nanas, Kaca Daur Ulang"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Fungsi / Peruntukan</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="Serat / Bahan Tambah">Serat / Aditif</option>
                    <option value="Semen">Substitusi Semen</option>
                    <option value="Agregat Halus">Substitusi Pasir</option>
                    <option value="Agregat Kasar">Substitusi Kerikil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Dosis Uji (% Dosis)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customDosage}
                    onChange={(e) => setCustomDosage(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Perlakuan Awal / Catatan Preparasi</label>
                <input
                  type="text"
                  value={customPretreatment}
                  onChange={(e) => setCustomPretreatment(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-700"
                />
              </div>

              <button
                onClick={handleSynthesizeAi}
                disabled={isAiLoading || !customName.trim()}
                className="w-full py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisis AI Berbasis Jurnal</span>
              </button>
            </div>
          </div>

          {/* AI Result Box if loaded */}
          {aiAnalysisResult && (
            <div className="bg-blue-50/70 rounded-xl border border-blue-200 p-5 space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-[#142D45] font-bold">
                <Sparkles className="w-4 h-4 text-[#286B9B]" />
                <span>Hasil Sintesis Literatur Ilmiah</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{aiAnalysisResult.scientificSummary}</p>
              <div className="p-2.5 bg-white rounded border border-blue-100 text-[11px] space-y-1">
                <div><strong>Rentang Dosis Literatur:</strong> {aiAnalysisResult.typicalDosageRange}</div>
                <div><strong>Kuat Tekan:</strong> {aiAnalysisResult.compressiveStrengthImpact}</div>
                <div><strong>Workability:</strong> {aiAnalysisResult.workabilityImpact}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4-Variant Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tabel Perbandingan Variasi Campuran (Mix Variations Matrix)
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluasi teknis antara beton kontrol (Mix 0) dengan variasi inovasi dosis rendah, optimum dan tinggi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Kode Variasi</th>
                <th className="py-2.5 px-3">Nama Inovasi</th>
                <th className="py-2.5 px-3">Fungsi / Substitusi</th>
                <th className="py-2.5 px-3 text-right">Dosis</th>
                <th className="py-2.5 px-3 text-right">Prediksi f'c</th>
                <th className="py-2.5 px-3">Kelebihan & Referensi</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeProject.innovations.map((iv) => (
                <tr key={iv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-[#142D45]">{iv.code}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{iv.name}</td>
                  <td className="py-3 px-3 text-slate-600">{iv.substitutionType}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#286B9B]">{iv.dosagePercent}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{iv.predictedStrengthMpa} MPa</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                    {iv.pros} <span className="text-[10px] text-slate-400 font-mono">[{iv.researchRef}]</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => deleteInnovation(iv.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Hapus variasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
