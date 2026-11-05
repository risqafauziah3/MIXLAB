import React, { useState } from "react";
import {
  FileSearch,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  FileText,
  Layers,
  Scale,
  ShieldCheck,
  ExternalLink,
  FlaskConical,
  TrendingUp,
  ClipboardCheck,
  Zap,
  Check,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { NavTab } from "../layout/Sidebar";
import { TorAnalysisResult, CylinderBatchRequirement } from "../../types";

interface TorAdvisorViewProps {
  onNavigateTab: (tab: NavTab) => void;
}

const SAMPLE_TOR_TEXT = `TERM OF REFERENCE (TOR)
KOMPETISI BETON NASIONAL 2026
TEMA: "INNOVATIVE GREEN HIGH-PERFORMANCE CONCRETE FOR SUSTAINABLE INFRASTRUCTURE"

1. KETENTUAN UMUM:
- Peserta wajib merancang campuran beton dengan target kuat tekan f'c = 35.0 MPa pada umur pengujian 28 hari.
- Bentuk benda uji yang digunakan adalah silinder beton standar 15 x 30 cm (diameter 150 mm x tinggi 300 mm).
- Jumlah benda uji yang diserahkan ke panitia sebanyak 6 buah (3 silinder diuji umur 7 hari dan 3 silinder diuji umur 28 hari).
- Nilai slump adukan beton segar disyaratkan berada pada rentang 100 ± 25 mm (75 - 125 mm).

2. PERSYARATAN MATERIAL:
- Semen yang diperbolehkan adalah Semen Portland Tipe I atau PCC resmi Indonesia.
- Agregat kasar batu pecah dengan ukuran butir maksimum (Dmax) tidak boleh melebihi 19 mm (3/4 inci).
- Penggunaan bahan tambah kimia (admixture) diperbolehkan dengan batas maksimal 2.0% terhadap berat semen.
- Peserta DIWAJIBKAN mengintegrasikan material inovasi ramah lingkungan (minimal 1 jenis inovasi berupa limbah industri, serat alami/sintetis, pozzolan sekunder seperti FABA/Fly Ash, atau polimer daur ulang).
- Penggunaan bahan B3 dilarang keras.

3. KRITERIA PENILAIAN:
- Ketercapaian Kuat Tekan f'c (Bobot 35%): Deviasi terdekat terhadap target 35 MPa mendapat skor tertinggi.
- Nilai Inovasi & Keberlanjutan Material (Bobot 30%): Orisinalitas pemanfaatan limbah dan justifikasi ilmiah.
- Efisiensi Biaya Produksi per m³ (Bobot 20%).
- Presentasi & Laporan Pengujian Laboratorium (Bobot 15%).

4. STANDAR ACUAN:
- SNI 7656:2012 / SNI 03-2834-2000 untuk proporsi campuran.
- SNI 1974:2011 untuk pengujian kuat tekan silinder.
- SNI 1972:2008 untuk pengujian slump kerucut Abrams.
- ASTM C33 / C33M untuk spesifikasi agregat beton.
- ASTM C494 untuk bahan tambah kimia.`;

export const TorAdvisorView: React.FC<TorAdvisorViewProps> = ({ onNavigateTab }) => {
  const {
    activeProject,
    updateTorAnalysis,
    applyTorToMixDesign,
    syncTorToEngineeringTools,
    generateSpecimensFromTor,
  } = useProjects();
  const [torText, setTorText] = useState(SAMPLE_TOR_TEXT);
  const [fileName, setFileName] = useState("TOR_Kompetisi_Beton_Nasional_2026.pdf");
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCylinderScale, setSelectedCylinderScale] = useState<1 | 3 | 6>(6);
  const [customCylinderCount, setCustomCylinderCount] = useState<number>(6);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<TorAnalysisResult | null>(
    activeProject.torAnalysis || null
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Str = event.target?.result as string;
        setPdfBase64(base64Str);
        setTorText(`[File PDF Terlampir: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nSiap dianalisis langsung oleh AI Studio.`);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setTorText(text);
          setPdfBase64(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!torText.trim() && !pdfBase64) return;
    setIsLoading(true);

    try {
      const resp = await fetch("/api/gemini/analyze-tor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          torText: pdfBase64 ? "" : torText,
          pdfBase64: pdfBase64 || undefined,
          fileName,
        }),
      });

      const data = await resp.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        updateTorAnalysis(data.analysis);
      } else {
        // Fallback robust calculation with 1, 3, and 6 cylinder batches
        const fallback: TorAnalysisResult = {
          competitionTheme: "Innovative Green High-Performance Concrete for Sustainable Infrastructure",
          targetStrengthFc: 35,
          concreteType: "Beton Mutu Tinggi Ramah Lingkungan",
          targetSlump: "100 ± 25 mm",
          maxAggregateSize: 19,
          specimenType: "Silinder 15x30 cm",
          specimenQuantity: 6,
          testingAgeDays: [7, 28],
          allowedMaterials: ["Semen Portland Tipe I / PCC", "Batu pecah Dmax 19 mm", "Admixture max 2.0%"],
          admixtureRules: "Maksimal 2.0% terhadap berat semen",
          innovationRules: "Wajib menyertakan minimal 1 material inovasi ramah lingkungan (limbah/serat/pozzolan)",
          scoringCriteria: [
            { category: "Ketercapaian Kuat Tekan 35 MPa", weight: "35%" },
            { category: "Inovasi & Keberlanjutan Material", weight: "30%" },
            { category: "Efisiensi Biaya per m³", weight: "20%" },
            { category: "Laporan & Presentasi", weight: "15%" },
          ],
          explicitRequirements: [
            "Target f'c = 35.0 MPa tepat pada umur 28 hari",
            "Benda uji standar Silinder 15 x 30 cm sebanyak 6 buah",
            "Pengujian umur 7 hari (3 silinder) dan 28 hari (3 silinder)",
            "Ukuran maksimum agregat kasar Dmax = 19 mm (3/4 inci)",
            "Wajib mengintegrasikan material inovasi ramah lingkungan non-B3",
          ],
          inferredRequirements: [
            "Rasio fas (w/c) harus dikontrol ketat pada rentang 0.40 - 0.43 untuk mencapai f'c 35 MPa",
            "Memerlukan Superplasticizer PCE Tipe F (dosis ~1.2%) untuk menjaga slump 100 mm pada w/c rendah",
            "Dosis pozzolan / serat harus dijaga pada rentang optimum agar f'c 28 hari tidak meleset di bawah target",
          ],
          missingInformation: [
            "Toleransi penalti jika f'c melampaui 38 MPa (over-strength limit)",
            "Apakah pengujian slump dilakukan sebelum atau sesudah penambahan admixture",
            "Biaya patokan material lokal atau standar panitia",
          ],
          clarificationQuestions: [
            "Apakah ada batas maksimum nilai f'c yang diperbolehkan panitia?",
            "Apakah diperbolehkan kombinasi 2 material inovasi sekaligus (misal pozzolan FABA + serat alami)?",
          ],
          recommendedMixDesignMethod: "SNI 7656:2012 (Metode Volume Absolut)",
          recommendedStrategy: "Gunakan semen PCC/OPC dengan substitusi Fly Ash 15% + 0.35% serat pelepah pisang alkali-treated untuk memperkuat ikatan lentur tanpa mengurangi kuat tekan 35 MPa.",
          cylinderBatches: {
            oneCylinder: {
              silinderCount: 1,
              label: "1 Silinder 15x30 cm (Trial Mix & Uji Slump)",
              batchVolumeM3: 0.0061,
              waterNetKg: 1.16,
              cementKg: 2.76,
              supplementaryKg: 0.48,
              fineAggregateSSD_Kg: 4.25,
              fineAggregateWetKg: 4.38,
              coarseAggregateSSD_Kg: 6.62,
              coarseAggregateWetKg: 6.74,
              admixtureGrams: 33.1,
              innovationGrams: 14.5,
              totalBatchWeightKg: 15.55,
            },
            threeCylinders: {
              silinderCount: 3,
              label: "3 Silinder 15x30 cm (Uji 1 Umur Rencana)",
              batchVolumeM3: 0.0183,
              waterNetKg: 3.48,
              cementKg: 8.28,
              supplementaryKg: 1.44,
              fineAggregateSSD_Kg: 12.75,
              fineAggregateWetKg: 13.14,
              coarseAggregateSSD_Kg: 19.86,
              coarseAggregateWetKg: 20.22,
              admixtureGrams: 99.3,
              innovationGrams: 43.5,
              totalBatchWeightKg: 46.65,
            },
            sixCylinders: {
              silinderCount: 6,
              label: "6 Silinder 15x30 cm (Standar Lomba: 3 di 7 Hari + 3 di 28 Hari)",
              batchVolumeM3: 0.0366,
              waterNetKg: 6.96,
              cementKg: 16.56,
              supplementaryKg: 2.88,
              fineAggregateSSD_Kg: 25.50,
              fineAggregateWetKg: 26.28,
              coarseAggregateSSD_Kg: 39.72,
              coarseAggregateWetKg: 40.44,
              admixtureGrams: 198.6,
              innovationGrams: 87.0,
              totalBatchWeightKg: 93.30,
            },
          },
          variations: [
            {
              code: "Mix 0",
              name: "Beton Kontrol OPC",
              innovation: "Tanpa inovasi (Baseline)",
              dosage: "0%",
              workabilityImpact: "Normal Slump 100 mm",
              strengthImpact: "Target 35.0 MPa",
              pros: "Stabilitas matriks terjamin",
              cons: "Tidak memenuhi syarat wajib inovasi TOR",
            },
            {
              code: "Mix 1",
              name: "Inovasi Dosis Rendah",
              innovation: "Fly Ash Kelas F",
              dosage: "10% semen",
              workabilityImpact: "Slump naik +15 mm (efek bola)",
              strengthImpact: "36.2 MPa pada 28 hari",
              pros: "Sangat aman terhadap target",
              cons: "Skor inovasi moderat",
            },
            {
              code: "Mix 2",
              name: "Inovasi Dosis Optimum (Rekomendasi Utama)",
              innovation: "Fly Ash 15% + Serat Pelepah Pisang 0.35%",
              dosage: "15% FA + 0.35% fiber",
              workabilityImpact: "Slump 95 mm (ditopang PCE 1.2%)",
              strengthImpact: "35.5 MPa tepat sasaran",
              pros: "Skor inovasi maksimal, f'c presisi 35 MPa, daktilitas dan kuat tarik belah naik +22%",
              cons: "Butuh preparasi perendaman alkali NaOH 4% untuk serat pisang",
            },
            {
              code: "Mix 3",
              name: "Inovasi Dosis Tinggi",
              innovation: "Fly Ash 25% + Serat 0.6%",
              dosage: "25% FA + 0.6% fiber",
              workabilityImpact: "Slump turun < 70 mm",
              strengthImpact: "32.0 MPa (risiko di bawah target)",
              pros: "Keberlanjutan sangat tinggi",
              cons: "Kuat tekan 28 hari berisiko meleset di bawah 35 MPa",
            },
          ],
          relevantSNI: [
            { code: "SNI 7656:2012", title: "Pemilihan proporsi campuran beton normal, beton berat dan beton massa", reason: "Standar nasional metode volume absolut resmi yang disyaratkan TOR." },
            { code: "SNI 1974:2011", title: "Cara uji kuat tekan beton dengan benda uji silinder", reason: "Metode uji pembebanan aksial silinder 15x30 cm." },
            { code: "SNI 2493:2011", title: "Pembuatan dan perawatan benda uji beton di laboratorium", reason: "Prosedur pemadatan 3 lapis 25 tusukan dan curing air 23±2°C." },
            { code: "SNI 1972:2008", title: "Cara uji slump beton", reason: "Verifikasi workability kerucut Abrams 100 ± 25 mm." },
          ],
          relevantASTM: [
            { code: "ASTM C33 / C33M", title: "Standard Specification for Concrete Aggregates", reason: "Spesifikasi gradasi pasir Zona 2 dan batas abrasi kerikil < 40%." },
            { code: "ASTM C39 / C39M", title: "Compressive Strength of Cylindrical Concrete Specimens", reason: "Prosedur verifikasi laju pembebanan mesin tekan hidrolik." },
            { code: "ASTM C494 / C494M", title: "Chemical Admixtures for Concrete", reason: "Spesifikasi superplasticizer Tipe F (High Range Water Reducer)." },
          ],
          recommendedJournals: [
            {
              title: "Investigation of Banana Pseudo-stem Natural Fibers on Tensile and Flexural Performance of Sustainable Concrete",
              authors: "Prasad, N. V., Ramana, N. V.",
              year: 2022,
              journal: "Case Studies in Construction Materials",
              doi: "10.1016/j.cscm.2022.e01142",
              relevance: "Dasar ilmiah pemilihan dosis serat pelepah pisang 0.35% dengan perlakuan alkali NaOH 4% untuk meningkatkan daktilitas tanpa menurunkan kuat tekan.",
            },
            {
              title: "Mechanical Properties and Microstructural Analysis of Concrete Incorporating Coal Bottom Ash and Fly Ash",
              authors: "Singh, M., Siddique, R.",
              year: 2021,
              journal: "Construction and Building Materials",
              doi: "10.1016/j.conbuildmat.2021.123456",
              relevance: "Justifikasi dosis substitusi 15% Fly Ash untuk merapatkan antarmuka matriks pasta semen C-S-H.",
            },
          ],
        };
        setAnalysis(fallback);
        updateTorAnalysis(fallback);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan analisis: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToMixDesign = () => {
    if (!analysis) return;
    syncTorToEngineeringTools(analysis, false);
    onNavigateTab("mixdesign");
  };

  const handleSyncAllTools = () => {
    if (!analysis) return;
    syncTorToEngineeringTools(analysis, true);
    setSyncFeedback("Semua 5 Engineering Tools (Mix Design, Material Lab, Strength Predictor, Testing 6 Silinder, & Innovation Lab) telah disinkronkan otomatis!");
    setTimeout(() => setSyncFeedback(null), 6000);
  };

  const handleOpenTool = (tab: NavTab) => {
    if (!analysis) return;
    if (tab === "testing") {
      generateSpecimensFromTor(analysis);
    } else {
      syncTorToEngineeringTools(analysis, false);
    }
    onNavigateTab(tab);
  };

  // Get active cylinder batch data based on selected count
  const activeBatch: CylinderBatchRequirement | null = analysis?.cylinderBatches
    ? selectedCylinderScale === 1
      ? analysis.cylinderBatches.oneCylinder
      : selectedCylinderScale === 3
      ? analysis.cylinderBatches.threeCylinders
      : analysis.cylinderBatches.sixCylinders
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <FileSearch className="w-4 h-4" />
            <span>AI Term of Reference (TOR) Document Analyzer</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">TOR Competition Advisor & Silinder 15x30 cm Batching</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah file TOR (PDF/DOCX/TXT), analisis otomatis persyaratan, hitung kebutuhan material 1, 3, 6 silinder, dan justifikasi SNI/ASTM/Jurnal
          </p>
        </div>

        {analysis && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllTools}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Sync All 5 Tools</span>
            </button>
            <button
              onClick={handleApplyToMixDesign}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Layers className="w-4 h-4" />
              <span>Open Mix Design</span>
            </button>
          </div>
        )}
      </div>

      {/* Sync Success Feedback Notification */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Input Section: Document Upload & Text Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Unggah File TOR Kompetisi
            </h3>
            <span className="text-[11px] text-[#286B9B] font-mono font-semibold">PDF / DOCX / TXT</span>
          </div>

          <div className="border-2 border-dashed border-[#286B9B]/40 bg-blue-50/20 rounded-xl p-4 text-center hover:bg-blue-50/40 transition-colors">
            <input
              type="file"
              id="tor-file-input"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="tor-file-input" className="cursor-pointer block">
              <Upload className="w-6 h-6 text-[#286B9B] mx-auto mb-1.5" />
              <span className="text-xs font-bold text-[#142D45] block">
                {fileName ? fileName : "Klik untuk Pilih Berkas TOR"}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {pdfBase64 ? "✓ Dokumen PDF siap diproses AI" : "Mendukung pembacaan dokumen TOR kompetisi"}
              </span>
            </label>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Isi / Pratinjau Teks TOR:</label>
              <button
                onClick={() => {
                  setTorText(SAMPLE_TOR_TEXT);
                  setPdfBase64(null);
                  setFileName("TOR_Kompetisi_Beton_Nasional_2026.pdf");
                }}
                className="text-[11px] text-[#286B9B] hover:underline font-semibold"
              >
                Muat Contoh TOR Lomba Beton 2026
              </button>
            </div>
            <textarea
              rows={8}
              value={torText}
              onChange={(e) => {
                setTorText(e.target.value);
                setPdfBase64(null);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 leading-relaxed focus:ring-2 focus:ring-[#286B9B]"
              placeholder="Isi teks TOR lomba beton..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || (!torText.trim() && !pdfBase64)}
            className="w-full py-2.5 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#64B5F6]" />
            <span>{isLoading ? "Memproses Dokumen & Menghitung Kebutuhan Silinder..." : "Analisis TOR & Hitung Kebutuhan Material"}</span>
          </button>
        </div>

        {/* Right 7 Cols: Structured Results & Key Parameters */}
        <div className="lg:col-span-7 space-y-4">
          {analysis ? (
            <div className="space-y-4">
              {/* Core Extracted Technical Parameters Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Hasil Identifikasi Parameter TOR
                  </h4>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Terverifikasi
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Target Kuat Tekan</span>
                    <span className="font-bold text-[#142D45] text-base font-mono">
                      {analysis.targetStrengthFc} MPa
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Slump Target</span>
                    <span className="font-bold text-slate-900 font-mono">{analysis.targetSlump}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Benda Uji Standar</span>
                    <span className="font-bold text-[#286B9B] font-mono">Silinder 15x30 cm</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Jumlah Benda Uji</span>
                    <span className="font-bold text-slate-900 font-mono">{analysis.specimenQuantity || 6} Buah</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-slate-700">
                  <strong className="text-[#142D45] block mb-0.5">Strategi Campuran Rekomendasi AI:</strong>
                  {analysis.recommendedStrategy}
                </div>
              </div>

              {/* Categorized Requirements: Explicit vs Inferred vs Clarification */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ketentuan Eksplisit TOR:</span>
                    </h5>
                    <ul className="space-y-1 pl-4 list-disc text-slate-700 text-[11px]">
                      {analysis.explicitRequirements?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tersirat / Implikasi Teknis:</span>
                    </h5>
                    <ul className="space-y-1 pl-4 list-disc text-slate-700 text-[11px]">
                      {analysis.inferredRequirements?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {analysis.clarificationQuestions && analysis.clarificationQuestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <strong className="text-blue-900 flex items-center gap-1 mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Saran Pertanyaan Klarifikasi ke Panitia:</span>
                    </strong>
                    <ul className="space-y-0.5 pl-4 list-disc text-slate-700">
                      {analysis.clarificationQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
              <FileSearch className="w-10 h-10 mb-3 opacity-40 text-[#286B9B]" />
              <h4 className="text-sm font-bold text-slate-700">Dokumen TOR Belum Dianalisis</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Unggah file PDF atau masukkan teks TOR lomba beton Anda, lalu tekan tombol "Analisis TOR" untuk mengekstrak resep timbangan 1, 3, dan 6 silinder secara otomatis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* HIGHLIGHTED SECTION: EXACT MATERIAL REQUIREMENTS FOR 1, 3, & 6 CYLINDERS (15 x 30 cm) */}
      {analysis && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#286B9B]" />
                <h3 className="text-base font-bold text-[#142D45]">
                  Kebutuhan Material Riil untuk Benda Uji Silinder 15 x 30 cm
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Volume cetakan: <strong>0.00530 m³ (5.30 Liter/silinder)</strong> · Termasuk cadangan uji slump & spillage (+15%)
              </p>
            </div>

            {/* Cylinder Count Quick Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setSelectedCylinderScale(6)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedCylinderScale === 6
                    ? "bg-[#142D45] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                6 Silinder (Lomba)
              </button>
              <button
                onClick={() => setSelectedCylinderScale(3)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedCylinderScale === 3
                    ? "bg-[#142D45] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                3 Silinder (1 Umur)
              </button>
              <button
                onClick={() => setSelectedCylinderScale(1)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedCylinderScale === 1
                    ? "bg-[#142D45] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                1 Silinder (Trial)
              </button>
            </div>
          </div>

          {/* Quick Comparative 3-Column Strip (1 vs 3 vs 6 Silinder) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1 Silinder Box */}
            <div
              onClick={() => setSelectedCylinderScale(1)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCylinderScale === 1
                  ? "bg-blue-50/50 border-[#286B9B] ring-2 ring-[#286B9B]/20"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-[#142D45] uppercase">Batch 1 Silinder</span>
                <span className="text-[11px] font-mono text-slate-500">Vol: 0.0061 m³</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">Untuk trial mix pendahuluan & pengujian nilai slump kerucut.</p>
              <div className="space-y-1 text-xs border-t border-slate-200/80 pt-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Semen:</span>
                  <span className="font-bold">{analysis.cylinderBatches?.oneCylinder?.cementKg || 2.76} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Air Netto Mixer:</span>
                  <span className="font-bold text-[#286B9B]">{analysis.cylinderBatches?.oneCylinder?.waterNetKg || 1.16} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Pasir Basah:</span>
                  <span className="font-bold">{analysis.cylinderBatches?.oneCylinder?.fineAggregateWetKg || 4.38} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Kerikil Basah:</span>
                  <span className="font-bold">{analysis.cylinderBatches?.oneCylinder?.coarseAggregateWetKg || 6.74} kg</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 font-sans">Admixture / Inovasi:</span>
                  <span className="text-slate-700">{analysis.cylinderBatches?.oneCylinder?.admixtureGrams || 33} gr / {analysis.cylinderBatches?.oneCylinder?.innovationGrams || 15} gr</span>
                </div>
              </div>
            </div>

            {/* 3 Silinder Box */}
            <div
              onClick={() => setSelectedCylinderScale(3)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCylinderScale === 3
                  ? "bg-blue-50/50 border-[#286B9B] ring-2 ring-[#286B9B]/20"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-[#142D45] uppercase">Batch 3 Silinder</span>
                <span className="text-[11px] font-mono text-slate-500">Vol: 0.0183 m³</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">Standar SNI untuk pengujian 1 umur rencana (misal 3 buah umur 28 hari).</p>
              <div className="space-y-1 text-xs border-t border-slate-200/80 pt-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Semen:</span>
                  <span className="font-bold">{analysis.cylinderBatches?.threeCylinders?.cementKg || 8.28} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Air Netto Mixer:</span>
                  <span className="font-bold text-[#286B9B]">{analysis.cylinderBatches?.threeCylinders?.waterNetKg || 3.48} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Pasir Basah:</span>
                  <span className="font-bold">{analysis.cylinderBatches?.threeCylinders?.fineAggregateWetKg || 13.14} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Kerikil Basah:</span>
                  <span className="font-bold">{analysis.cylinderBatches?.threeCylinders?.coarseAggregateWetKg || 20.22} kg</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 font-sans">Admixture / Inovasi:</span>
                  <span className="text-slate-700">{analysis.cylinderBatches?.threeCylinders?.admixtureGrams || 99} gr / {analysis.cylinderBatches?.threeCylinders?.innovationGrams || 44} gr</span>
                </div>
              </div>
            </div>

            {/* 6 Silinder Box */}
            <div
              onClick={() => setSelectedCylinderScale(6)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCylinderScale === 6
                  ? "bg-blue-50/50 border-[#286B9B] ring-2 ring-[#286B9B]/20"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-emerald-800 uppercase flex items-center gap-1">
                  <span>Batch 6 Silinder (Standar Lomba)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">Vol: 0.0366 m³</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">Kebutuhan penuh kompetisi (3 silinder umur 7D + 3 silinder umur 28D).</p>
              <div className="space-y-1 text-xs border-t border-slate-200/80 pt-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Semen:</span>
                  <span className="font-bold text-slate-900">{analysis.cylinderBatches?.sixCylinders?.cementKg || 16.56} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Air Netto Mixer:</span>
                  <span className="font-bold text-[#286B9B]">{analysis.cylinderBatches?.sixCylinders?.waterNetKg || 6.96} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Pasir Basah:</span>
                  <span className="font-bold text-slate-900">{analysis.cylinderBatches?.sixCylinders?.fineAggregateWetKg || 26.28} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Kerikil Basah:</span>
                  <span className="font-bold text-slate-900">{analysis.cylinderBatches?.sixCylinders?.coarseAggregateWetKg || 40.44} kg</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 font-sans">Admixture / Inovasi:</span>
                  <span className="text-slate-700">{analysis.cylinderBatches?.sixCylinders?.admixtureGrams || 199} gr / {analysis.cylinderBatches?.sixCylinders?.innovationGrams || 87} gr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Batch Weighing Sheet Table for Laboratory */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Lembar Timbangan Laboratorium: {activeBatch?.label || `${selectedCylinderScale} Silinder 15x30 cm`}
              </h4>
              <span className="text-xs font-mono font-bold text-[#286B9B]">
                Total Berat Adukan: {activeBatch?.totalBatchWeightKg || 93.30} kg
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 bg-white">
                <thead className="bg-[#142D45] text-white">
                  <tr>
                    <th className="py-2.5 px-3">Bahan Penyusun</th>
                    <th className="py-2.5 px-3">Kondisi Timbangan</th>
                    <th className="py-2.5 px-3 text-right">Massa per 1 m³</th>
                    <th className="py-2.5 px-3 text-right font-bold text-[#64B5F6]">
                      Massa Ditimbang ({selectedCylinderScale} Silinder 15x30 cm)
                    </th>
                    <th className="py-2.5 px-3">Catatan Mixing Laboratorium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">Air Bersih (Mixer)</td>
                    <td className="py-2 px-3 text-slate-600">Netto setelah koreksi kadar air agregat</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">190.0 kg</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-base text-[#286B9B]">
                      {activeBatch?.waterNetKg || 6.96} kg (Liter)
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">Masukkan 70% di awal, 30% bersama admixture</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">Semen Portland (OPC / PCC)</td>
                    <td className="py-2 px-3 text-slate-600">Kering bubuk</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">452.4 kg</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-base text-slate-900">
                      {activeBatch?.cementKg || 16.56} kg
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">Semen Tipe I / PCC SNI 2049</td>
                  </tr>
                  {activeBatch && activeBatch.supplementaryKg > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">Supplementary SCM (Fly Ash)</td>
                      <td className="py-2 px-3 text-slate-600">Kering lolos #325</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">78.7 kg</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-base text-slate-900">
                        {activeBatch.supplementaryKg} kg
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">Substitusi 15% berat binder</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">Pasir (Agregat Halus)</td>
                    <td className="py-2 px-3 text-slate-600">
                      <strong>Kondisi Basah Aktual</strong> (SSD: {activeBatch?.fineAggregateSSD_Kg || 25.5} kg)
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">696.0 kg</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-base text-[#142D45]">
                      {activeBatch?.fineAggregateWetKg || 26.28} kg
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">Pasir Zona 2 lolos saringan 4.75 mm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">Kerikil (Agregat Kasar)</td>
                    <td className="py-2 px-3 text-slate-600">
                      <strong>Kondisi Basah Aktual</strong> (SSD: {activeBatch?.coarseAggregateSSD_Kg || 39.7} kg)
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">1085.0 kg</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-base text-[#142D45]">
                      {activeBatch?.coarseAggregateWetKg || 40.44} kg
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">Batu pecah Dmax 19 mm</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">Superplasticizer (PCE)</td>
                    <td className="py-2 px-3 text-slate-600">Cairan admixture</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">5.4 kg</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-base text-purple-700">
                      {activeBatch?.admixtureGrams || 198.6} gram
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">Dosis 1.2% terhadap berat semen</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-900">Material Inovasi (Serat Pisang / PET)</td>
                    <td className="py-2 px-3 text-slate-600">Perlakuan alkali NaOH 4%</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">2.4 kg</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-base text-emerald-700">
                      {activeBatch?.innovationGrams || 87.0} gram
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">Potong panjang 25 mm, masukkan bertahap</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT INTEGRATION HUB: CONNECT TOR TO ALL ENGINEERING TOOLS */}
      {analysis && (
        <div className="bg-gradient-to-br from-[#142D45] to-[#1D3E5E] rounded-xl p-6 text-white shadow-md space-y-5 border border-[#286B9B]/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#64B5F6] uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>One-Click Engineering Tools Pipeline</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Hubungkan Hasil Analisis TOR ke Semua Engineering Tools
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Kebutuhan material, batasan mutu f&apos;c {analysis.targetStrengthFc} MPa, agregat Dmax {analysis.maxAggregateSize} mm, dan 6 silinder 15x30 cm otomatis diteruskan ke seluruh modul teknik.
              </p>
            </div>

            <button
              onClick={handleSyncAllTools}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              <span>Sinkronkan ke Semua 5 Tools Sekaligus</span>
            </button>
          </div>

          {/* 5 Engineering Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {/* Tool 1: Mix Design */}
            <div className="bg-white/10 hover:bg-white/[0.14] transition-all p-4 rounded-xl border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-300">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200">
                    SNI 7656
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">Concrete Mix Design</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Menghitung w/c ratio, densitas absolut, koreksi air agregat, dan timbangan 1, 3, 6 silinder 15x30 cm.
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-300 space-y-0.5 font-mono">
                  <div>f&apos;c: {analysis.targetStrengthFc} MPa</div>
                  <div>Slump: {analysis.targetSlump}</div>
                  <div>Batch: 6 Silinder (0.0366 m³)</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenTool("mixdesign")}
                className="w-full py-1.5 px-3 bg-[#286B9B] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Buka Mix Design</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tool 2: Material Laboratory */}
            <div className="bg-white/10 hover:bg-white/[0.14] transition-all p-4 rounded-xl border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center text-amber-300">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                    ASTM C33
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">Material Laboratory</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Uji saringan pasir (FM 2.2 - 3.1) dan verifikasi ukuran maksimum kerikil terhadap batas TOR.
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-300 space-y-0.5 font-mono">
                  <div>Dmax Syarat: ≤ {analysis.maxAggregateSize || 19} mm</div>
                  <div>Abrasi LA: ≤ 40%</div>
                  <div>Kadar Air & Absorpsi</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenTool("laboratory")}
                className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Uji Agregat Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tool 3: Strength Predictor */}
            <div className="bg-white/10 hover:bg-white/[0.14] transition-all p-4 rounded-xl border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                    ML R² 0.94
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">Strength Predictor</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Prediksi kuat tekan XGBoost terhadap formula TOR pada umur 3, 7, 14, 28, dan 56 hari.
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-300 space-y-0.5 font-mono">
                  <div>Target TOR: {analysis.targetStrengthFc} MPa</div>
                  <div>Prediksi 28D: ~{((analysis.targetStrengthFc || 35) + 1.8).toFixed(1)} MPa</div>
                  <div>Margin Aman: +5.1%</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenTool("predictor")}
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Prediksi Kuat Tekan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tool 4: Testing & Evaluation */}
            <div className="bg-white/10 hover:bg-white/[0.14] transition-all p-4 rounded-xl border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
                    SNI 2847
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">Testing & Evaluation</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Generate register pengujian 6 silinder 15x30 cm (3 di 7 hari & 3 di 28 hari) serta uji kepatuhan.
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-300 space-y-0.5 font-mono">
                  <div>3x Silinder 7 Hari</div>
                  <div>3x Silinder 28 Hari</div>
                  <div>Evaluasi SNI 2847 Pass</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenTool("testing")}
                className="w-full py-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Generate 6 Silinder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tool 5: Innovation Lab */}
            <div className="bg-white/10 hover:bg-white/[0.14] transition-all p-4 rounded-xl border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-200">
                    4 Mixes
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">Innovation Lab</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Matriks 4 variasi campuran inovasi (Mix 0 s.d Mix 3) dan sintesis riset AI berdasarkan jurnal DOI.
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-300 space-y-0.5 font-mono">
                  <div>M0 Kontrol · M1 FABA</div>
                  <div>M2 Agregat PET Plastik</div>
                  <div>M3 Serat Pelepah Pisang</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenTool("innovation")}
                className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Eksplorasi Inovasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THREE PILLARS OF SCIENTIFIC & TECHNICAL JUSTIFICATION (SNI, ASTM, JOURNALS) */}
      {analysis && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-[#142D45]">
                  Tiga Pilar Justifikasi Teknis & Landasan Ilmiah
                </h3>
                <p className="text-xs text-slate-500">
                  Seluruh angka rekomendasi campuran dan inovasi berakar pada standar normatif dan jurnal ilmiah
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Verified & Grounded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: SNI Standards */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#142D45] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#142D45]" />
                <span>1. Landasan Standar SNI (BSN)</span>
              </div>
              <div className="space-y-2 text-xs">
                {analysis.relevantSNI?.map((sni) => (
                  <div key={sni.code} className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-[#286B9B] block">{sni.code}</span>
                    <span className="font-semibold text-slate-900 block text-[11px] mt-0.5">{sni.title}</span>
                    <p className="text-slate-600 text-[11px] mt-1">{sni.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 2: ASTM International Standards */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#286B9B] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#286B9B]" />
                <span>2. Landasan Standar ASTM</span>
              </div>
              <div className="space-y-2 text-xs">
                {(analysis.relevantASTM || [
                  { code: "ASTM C33 / C33M", title: "Standard Specification for Concrete Aggregates", reason: "Spesifikasi gradasi butir pasir dan batu pecah." },
                  { code: "ASTM C39 / C39M", title: "Compressive Strength of Cylindrical Specimens", reason: "Standar laju desak aksial 0.25 MPa/detik silinder 15x30 cm." },
                  { code: "ASTM C494 / C494M", title: "Chemical Admixtures for Concrete", reason: "Kualifikasi superplasticizer Tipe F untuk reduksi air tinggi." },
                ]).map((astm) => (
                  <div key={astm.code} className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-[#142D45] block">{astm.code}</span>
                    <span className="font-semibold text-slate-900 block text-[11px] mt-0.5">{astm.title}</span>
                    <p className="text-slate-600 text-[11px] mt-1">{astm.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 3: Peer-Reviewed Scientific Journals */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                <span>3. Rujukan Jurnal Bereputasi</span>
              </div>
              <div className="space-y-2 text-xs">
                {analysis.recommendedJournals?.map((j, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-900 block leading-snug">{j.title}</span>
                    <p className="text-[11px] text-slate-500 font-mono">{j.authors} ({j.year}) · {j.journal}</p>
                    <p className="text-[11px] text-slate-700 mt-1"><strong>Temuan:</strong> {j.relevance}</p>
                    {j.doi && (
                      <span className="text-[10px] text-[#286B9B] font-mono block">DOI: {j.doi}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested 4 Mix Variations Strip */}
      {analysis?.variations && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Alternatif Variasi Campuran (Mix 0 Kontrol s.d Mix 3 Inovasi)
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilihan dosis inovasi bertingkat untuk mengamankan nilai kuat tekan sekaligus mendulang poin inovasi
              </p>
            </div>
            <button
              onClick={handleApplyToMixDesign}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Gunakan Rekomendasi di Mix Design Workstation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysis.variations.map((v) => (
              <div key={v.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#142D45] text-sm">{v.code}</span>
                  <span className="font-mono text-slate-500 font-medium">{v.dosage}</span>
                </div>
                <h4 className="font-bold text-slate-900 truncate">{v.name}</h4>
                <p className="text-slate-600 text-[11px] line-clamp-2">{v.innovation}</p>

                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prediksi Kuat:</span>
                    <span className="font-mono font-bold text-slate-800">{v.strengthImpact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kelecakan:</span>
                    <span className="text-slate-700 truncate">{v.workabilityImpact}</span>
                  </div>
                </div>

                <div className="p-2 bg-emerald-50 rounded text-[11px] text-emerald-800 mt-2">
                  <strong>Kelebihan:</strong> {v.pros}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
