import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Check status
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: AI Assistant Chat
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history = [], projectContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY belum dikonfigurasi di server. Silakan setel API Key di Settings > Secrets.",
      });
    }

    const systemInstruction = `Anda adalah MIXLAB AI Assistant, asisten teknik sipil spesialis teknologi beton, perancangan campuran (mix design), material laboratorium, evaluasi hasil uji kuat tekan, dan inovasi beton ramah lingkungan.
Prinsip utama Anda:
1. Akurasi teknis tinggi sesuai standar SNI (khususnya SNI 7656:2012 'Tata cara pemilihan proporsi campuran beton normal, berat dan massa', SNI 03-2834-2000, SNI 1974:2011 'Cara uji kuat tekan beton dengan benda uji silinder', SNI 2493:2011, SNI 1972:2008 untuk slump).
2. Jawaban harus terstruktur, berbasis fisika dan kimia material semen/agregat/air/admixture, dan matematis (berikan satuan: MPa, kg/m³, mm, %).
3. Jika menganalisis masalah kuat tekan di bawah target f'c: periksa rasio fas (w/c), mutu agregat, gradasi, koreksi kadar air agregat (apakah kelebihan air bebas), pemadatan, dan perawatan (curing).
4. Selalu transparan: jika data tidak lengkap atau belum diverifikasi oleh trial mix, nyatakan asumsinya.
5. Gunakan bahasa Indonesia profesional dan istilah baku teknik sipil.

Konteks Proyek yang sedang aktif:
${projectContext ? JSON.stringify(projectContext, null, 2) : "Belum ada project aktif terpilih."}`;

    // Format contents with history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        if (h.role && h.content) {
          contents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply: response.text || "Tidak ada jawaban yang dihasilkan.",
    });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    return res.status(500).json({
      error: error.message || "Gagal memproses pesan AI.",
    });
  }
});

// API: Analyze TOR Competition Document
app.post("/api/gemini/analyze-tor", async (req, res) => {
  try {
    const { torText, pdfBase64, fileName } = req.body;
    if ((!torText || torText.trim().length === 0) && !pdfBase64) {
      return res.status(400).json({ error: "Harap unggah file TOR (PDF/TXT) atau tempelkan teks TOR." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY belum dikonfigurasi di server.",
      });
    }

    const promptText = `Analisis Dokumen Term of Reference (TOR) Kompetisi Beton berikut ini secara teliti dan profesional untuk platform MIXLAB:
Nama File: ${fileName || "TOR_Kompetisi.pdf"}
Catatan Penting:
1. Benda uji standar yang paling umum dan wajib dihitung secara presisi adalah SILINDER 15 x 30 cm (diameter 150 mm x tinggi 300 mm, volume 0.0053014 m³ per silinder).
2. Hitung kebutuhan timbangan material riil untuk:
   - 1 Silinder 15x30 cm (+ waste 15% untuk uji slump)
   - 3 Silinder 15x30 cm (+ waste 15%)
   - 6 Silinder 15x30 cm (+ waste 15% - standar lomba: 3 diuji umur 7 hari, 3 diuji umur 28 hari).
3. Berikan rekomendasi inovasi material yang ramah lingkungan dan relevan dengan tema TOR.
4. Berikan justifikasi teknis kuat dari TIGA PILAR:
   - Standar SNI (SNI 7656:2012, SNI 03-2834-2000, SNI 1974:2011, SNI 2493:2011)
   - Standar ASTM (ASTM C33, ASTM C39, ASTM C494, dll)
   - Jurnal Ilmiah bereputasi dengan DOI asli dan temuan dosis optimum.

Format output WAJIB JSON murni dengan struktur:
{
  "competitionTheme": "string",
  "targetStrengthFc": number,
  "concreteType": "string",
  "targetSlump": "string (misal: 100 ± 25 mm)",
  "maxAggregateSize": number,
  "specimenType": "Silinder 15x30 cm",
  "specimenQuantity": number,
  "testingAgeDays": [number],
  "allowedMaterials": ["string"],
  "admixtureRules": "string",
  "innovationRules": "string",
  "scoringCriteria": [{"category": "string", "weight": "string"}],
  "explicitRequirements": ["string (persyaratan tegas tertulis)"],
  "inferredRequirements": ["string (hal yang disimpulkan dari konteks teknis)"],
  "missingInformation": ["string (hal penting yang belum dicantumkan di TOR)"],
  "clarificationQuestions": ["string (pertanyaan yang disarankan diajukan ke panitia)"],
  "recommendedMixDesignMethod": "string (SNI 7656:2012 atau SNI 03-2834-2000)",
  "recommendedStrategy": "string",
  "cylinderBatches": {
    "oneCylinder": {
      "silinderCount": 1,
      "label": "1 Silinder (Trial Mix & Uji Slump)",
      "batchVolumeM3": 0.0061,
      "waterNetKg": number,
      "cementKg": number,
      "supplementaryKg": number,
      "fineAggregateSSD_Kg": number,
      "fineAggregateWetKg": number,
      "coarseAggregateSSD_Kg": number,
      "coarseAggregateWetKg": number,
      "admixtureGrams": number,
      "innovationGrams": number,
      "totalBatchWeightKg": number
    },
    "threeCylinders": {
      "silinderCount": 3,
      "label": "3 Silinder (Pengujian 1 Umur Rencana)",
      "batchVolumeM3": 0.0183,
      "waterNetKg": number,
      "cementKg": number,
      "supplementaryKg": number,
      "fineAggregateSSD_Kg": number,
      "fineAggregateWetKg": number,
      "coarseAggregateSSD_Kg": number,
      "coarseAggregateWetKg": number,
      "admixtureGrams": number,
      "innovationGrams": number,
      "totalBatchWeightKg": number
    },
    "sixCylinders": {
      "silinderCount": 6,
      "label": "6 Silinder (Standar Lomba: 3 di 7 Hari + 3 di 28 Hari)",
      "batchVolumeM3": 0.0366,
      "waterNetKg": number,
      "cementKg": number,
      "supplementaryKg": number,
      "fineAggregateSSD_Kg": number,
      "fineAggregateWetKg": number,
      "coarseAggregateSSD_Kg": number,
      "coarseAggregateWetKg": number,
      "admixtureGrams": number,
      "innovationGrams": number,
      "totalBatchWeightKg": number
    }
  },
  "variations": [
    {
      "code": "Mix 0",
      "name": "Beton Kontrol",
      "innovation": "Standar tanpa substitusi",
      "dosage": "0%",
      "workabilityImpact": "Normal Slump 100 mm",
      "strengthImpact": "Target baseline",
      "pros": "Stabilitas matriks terjamin",
      "cons": "Tanpa nilai tambah inovasi"
    },
    {
      "code": "Mix 1",
      "name": "Inovasi Dosis Rendah",
      "innovation": "string",
      "dosage": "string",
      "workabilityImpact": "string",
      "strengthImpact": "string",
      "pros": "string",
      "cons": "string"
    },
    {
      "code": "Mix 2",
      "name": "Inovasi Dosis Optimum (Rekomendasi Utama)",
      "innovation": "string",
      "dosage": "string",
      "workabilityImpact": "string",
      "strengthImpact": "string",
      "pros": "string",
      "cons": "string"
    },
    {
      "code": "Mix 3",
      "name": "Inovasi Dosis Tinggi / Kombinasi",
      "innovation": "string",
      "dosage": "string",
      "workabilityImpact": "string",
      "strengthImpact": "string",
      "pros": "string",
      "cons": "string"
    }
  ],
  "relevantSNI": [
    {"code": "SNI 7656:2012", "title": "string", "reason": "string"},
    {"code": "SNI 1974:2011", "title": "string", "reason": "string"},
    {"code": "SNI 2493:2011", "title": "string", "reason": "string"}
  ],
  "relevantASTM": [
    {"code": "ASTM C33 / C33M", "title": "Spesifikasi Agregat Beton", "reason": "string"},
    {"code": "ASTM C39 / C39M", "title": "Uji Kuat Tekan Benda Uji Silinder", "reason": "string"},
    {"code": "ASTM C494 / C494M", "title": "Spesifikasi Bahan Tambah Kimia (Admixture)", "reason": "string"}
  ],
  "recommendedJournals": [
    {
      "title": "string",
      "authors": "string",
      "year": number,
      "journal": "string",
      "doi": "string",
      "relevance": "string"
    }
  ]
}`;

    let contents: any;
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      contents = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: cleanBase64,
          },
        },
        { text: promptText },
      ];
    } else {
      contents = `${promptText}\n\nTeks Dokumen:\n"""\n${(torText || "").slice(0, 45000)}\n"""`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ analysis: parsed });
  } catch (error: any) {
    console.error("TOR Analysis error:", error);
    return res.status(500).json({
      error: error.message || "Gagal menganalisis dokumen TOR.",
    });
  }
});

// API: Innovation Lab Research Synthesis
app.post("/api/gemini/innovation-analysis", async (req, res) => {
  try {
    const { materialName, materialType, intendedUse, notes } = req.body;
    if (!materialName) {
      return res.status(400).json({ error: "Nama material tidak boleh kosong." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY belum dikonfigurasi di server.",
      });
    }

    const prompt = `Analisis material inovasi beton berikut untuk platform teknik MIXLAB:
Nama Material: ${materialName}
Kategori Material: ${materialType || "Limbah / Tambahan"}
Fungsi/Peruntukan: ${intendedUse || "Substitusi semen / agregat / serat"}
Catatan: ${notes || "-"}

Berikan data komprehensif berbasis literatur ilmiah dalam format JSON murni:
{
  "materialName": "${materialName}",
  "scientificSummary": "string",
  "physicalChemicalProperties": "string",
  "typicalDosageRange": "string (misal: 5% - 15% berat semen atau 0.5% - 1.5% volume)",
  "optimumDosage": "string",
  "pretreatmentRecommendation": "string (misal: pencucian, perlakuan alkali NaOH 5%, pengayakan)",
  "workabilityImpact": "string",
  "compressiveStrengthImpact": "string",
  "tensileFlexuralImpact": "string",
  "durabilityImpact": "string",
  "pros": ["string"],
  "cons": ["string"],
  "trialMixRecommendations": [
    {"variant": "Mix A (Dosis Rendah)", "percentage": "string", "expectedOutcome": "string"},
    {"variant": "Mix B (Dosis Optimum)", "percentage": "string", "expectedOutcome": "string"},
    {"variant": "Mix C (Dosis Tinggi)", "percentage": "string", "expectedOutcome": "string"}
  ],
  "applicableStandards": [
    {"standardCode": "string", "standardTitle": "string", "relevance": "string"}
  ],
  "verifiedJournals": [
    {
      "title": "string",
      "authors": "string",
      "year": number,
      "journal": "string",
      "doi": "string",
      "keyFindings": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ result: parsed });
  } catch (error: any) {
    console.error("Innovation analysis error:", error);
    return res.status(500).json({
      error: error.message || "Gagal menganalisis inovasi material.",
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIXLAB Concrete Engineering Platform running on port ${PORT}`);
  });
}

startServer();
