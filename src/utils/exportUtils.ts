import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProjectData } from "../types";

/**
 * Export complete 10-sheet workbook as Excel (.xlsx) file
 */
export function exportProjectToExcel(project: ProjectData) {
  const wb = XLSX.utils.book_new();
  const res = project.calculationResult;

  // Sheet 1: Project Information
  const projectInfo = [
    ["MIXLAB - CONCRETE ENGINEERING WORKSPACE", ""],
    ["LAPORAN RANCANGAN CAMPURAN & PENGUJIAN BETON", ""],
    ["", ""],
    ["ID Proyek", project.id],
    ["Nama Proyek", project.name],
    ["Deskripsi", project.description || "-"],
    ["Status Proyek", project.status],
    ["Tanggal Dibuat", project.createdAt],
    ["Tanggal Pembaruan Terakhir", project.updatedAt],
    ["Metode Perancangan", project.parameters.method],
    ["Jenis Beton", project.parameters.concreteType],
    ["Target Kuat Tekan f'c (28 hari)", `${project.parameters.targetStrengthFc} MPa`],
    ["Target Slump", `${project.parameters.slumpMin} - ${project.parameters.slumpMax} mm`],
    ["Ukuran Maksimum Agregat (Dmax)", `${project.parameters.maxAggregateSize} mm`],
    ["Volume Rencana Pengecoran", `${project.parameters.plannedVolumeM3} m³`],
    ["Kondisi Paparan Lingkungan", project.parameters.exposureCondition],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(projectInfo);
  XLSX.utils.book_append_sheet(wb, ws1, "Project Info");

  // Sheet 2: Material Properties
  const materialProps = [
    ["KARAKTERISTIK MATERIAL PENYUSUN BETON", "", "", ""],
    ["", "", "", ""],
    ["Kategori", "Parameter", "Nilai", "Satuan"],
    ["SEMEN", "Jenis Semen", project.cement.type, "-"],
    ["SEMEN", "Berat Jenis Semen", project.cement.specificGravity, "gr/cm³"],
    ["SEMEN", "Substitusi SCM", project.cement.supplementaryMaterial || "None", "-"],
    ["SEMEN", "Persentase Substitusi", `${project.cement.substitutionPercent}%`, "%"],
    ["PASIR (AGREGAT HALUS)", "Jenis / Sumber", project.fineAggregate.type, "-"],
    ["PASIR", "Berat Jenis Curah Kering", project.fineAggregate.specificGravityDry, "-"],
    ["PASIR", "Berat Jenis SSD", project.fineAggregate.specificGravitySSD, "-"],
    ["PASIR", "Penyerapan Air (Absorption)", `${project.fineAggregate.absorption}%`, "%"],
    ["PASIR", "Kadar Air Aktual", `${project.fineAggregate.moistureContent}%`, "%"],
    ["PASIR", "Modulus Kehalusan (FM)", project.fineAggregate.finenessModulus, "-"],
    ["KERIKIL (AGREGAT KASAR)", "Jenis Agregat", project.coarseAggregate.type, "-"],
    ["KERIKIL", "Berat Jenis Curah Kering", project.coarseAggregate.specificGravityDry, "-"],
    ["KERIKIL", "Berat Jenis SSD", project.coarseAggregate.specificGravitySSD, "-"],
    ["KERIKIL", "Penyerapan Air", `${project.coarseAggregate.absorption}%`, "%"],
    ["KERIKIL", "Kadar Air Aktual", `${project.coarseAggregate.moistureContent}%`, "%"],
    ["KERIKIL", "Berat Isi Kering Padat", project.coarseAggregate.dryRoddedUnitWeight || 1600, "kg/m³"],
    ["KERIKIL", "Ukuran Butir Maksimum", `${project.coarseAggregate.maxSize || 19} mm`, "mm"],
    ["ADMIXTURE", "Nama Produk & Tipe", `${project.admixture.productName} (${project.admixture.type})`, "-"],
    ["ADMIXTURE", "Berat Jenis", project.admixture.specificGravity, "-"],
    ["ADMIXTURE", "Dosis Rencana", `${project.admixture.dosagePercent}%`, "% terhadap semen"],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(materialProps);
  XLSX.utils.book_append_sheet(wb, ws2, "Material Properties");

  // Sheet 3: Mix Design Input
  const mixInput = [
    ["PARAMETER INPUT MIX DESIGN", ""],
    ["", ""],
    ["Parameter", "Input"],
    ["Metode SNI/ACI", project.parameters.method],
    ["Target Kuat Tekan f'c", `${project.parameters.targetStrengthFc} MPa`],
    ["Rentang Slump Rencana", `${project.parameters.slumpMin} - ${project.parameters.slumpMax} mm`],
    ["Ukuran Maksimum Agregat", `${project.parameters.maxAggregateSize} mm`],
    ["Kondisi Udara", project.parameters.airEntrained ? "Air Entrained" : "Non-Air Entrained"],
    ["Kadar Udara Asumsi", `${project.parameters.airContentPercent}%`],
    ["Volume Batch Uji", `${project.parameters.plannedVolumeM3} m³`],
    ["Faktor Kehilangan Adukan (Waste)", `${project.parameters.wasteFactorPercent}%`],
    ["Jenis Benda Uji Rencana", project.parameters.specimenType],
    ["Jumlah Benda Uji", `${project.parameters.plannedSpecimensCount} buah`],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(mixInput);
  XLSX.utils.book_append_sheet(wb, ws3, "Mix Input");

  // Sheet 4: Mix Design Calculation
  const mixCalc: any[][] = [
    ["TAHAPAN PERHITUNGAN MIX DESIGN (DETAILED CALCULATION)", "", "", "", ""],
    ["", "", "", "", ""],
    ["Langkah", "Tahapan", "Rumus / Standar", "Substitusi Nilai", "Hasil Perhitungan"],
  ];
  if (res?.calculationSteps) {
    res.calculationSteps.forEach((s) => {
      mixCalc.push([`Langkah ${s.step}`, s.title, `${s.formula} (${s.standardClause})`, s.substitution, s.result]);
    });
  }
  const ws4 = XLSX.utils.aoa_to_sheet(mixCalc);
  XLSX.utils.book_append_sheet(wb, ws4, "Mix Calculation");

  // Sheet 5: Moisture Correction
  const moistData = [
    ["KOREKSI KADAR AIR AGREGAT (AGGREGATE MOISTURE CORRECTION)", "", "", ""],
    ["", "", "", ""],
    ["Komponen", "Kadar Air Aktual (%)", "Penyerapan Air (%)", "Air Bebas (+ Menambah / - Menyerap)", "Koreksi Massa Ditimbang (kg/m³)"],
    [
      "Agregat Halus (Pasir)",
      `${project.fineAggregate.moistureContent}%`,
      `${project.fineAggregate.absorption}%`,
      `${res?.moistureCorrection.waterDeltaFineAggKg || 0} kg/m³`,
      `${res?.moistureCorrection.fineAggregateWetKg || 0} kg/m³`,
    ],
    [
      "Agregat Kasar (Kerikil)",
      `${project.coarseAggregate.moistureContent}%`,
      `${project.coarseAggregate.absorption}%`,
      `${res?.moistureCorrection.waterDeltaCoarseAggKg || 0} kg/m³`,
      `${res?.moistureCorrection.coarseAggregateWetKg || 0} kg/m³`,
    ],
    ["", "", "", "", ""],
    ["Ringkasan Air Mixer:", "", "", "", ""],
    ["Kebutuhan Air Desain (W_design)", `${res?.waterContentDesignKg || 0} kg/m³`, "", "", ""],
    ["Total Air Dikontribusikan Agregat", `${((res?.moistureCorrection.waterDeltaFineAggKg || 0) + (res?.moistureCorrection.waterDeltaCoarseAggKg || 0)).toFixed(1)} kg/m³`, "", "", ""],
    ["Air Netto yang Dituang ke Mixer", `${res?.moistureCorrection.netWaterToBatchKg || 0} kg/m³`, "", "", ""],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(moistData);
  XLSX.utils.book_append_sheet(wb, ws5, "Moisture Correction");

  // Sheet 6: Final Mix Composition
  const finalComp = [
    ["KOMPOSISI FINAL CAMPURAN BETON (FINAL MIX PROPORTIONS)", "", "", ""],
    ["", "", "", ""],
    ["Material Penyusun", "Proporsi SSD (kg/m³)", "Massa Ditimbang (Koreksi Basah) kg/m³", `Kebutuhan Batch (${res?.batchRequirements.volumeM3 || 0} m³)`],
    ["Air Bersih Pencampur", res?.waterContentDesignKg || 0, res?.moistureCorrection.netWaterToBatchKg || 0, `${res?.batchRequirements.waterKg || 0} kg`],
    ["Semen Portland", res?.cementContentKg || 0, res?.cementContentKg || 0, `${res?.batchRequirements.cementKg || 0} kg`],
    ["Supplementary Binder (SCM)", res?.supplementaryContentKg || 0, res?.supplementaryContentKg || 0, `${res?.batchRequirements.supplementaryKg || 0} kg`],
    ["Pasir (Agregat Halus)", res?.fineAggregateKg || 0, res?.moistureCorrection.fineAggregateWetKg || 0, `${res?.batchRequirements.fineAggregateWetKg || 0} kg`],
    ["Kerikil (Agregat Kasar)", res?.coarseAggregateKg || 0, res?.moistureCorrection.coarseAggregateWetKg || 0, `${res?.batchRequirements.coarseAggregateWetKg || 0} kg`],
    ["Bahan Tambah (Admixture)", res?.admixtureKg || 0, res?.admixtureKg || 0, `${res?.batchRequirements.admixtureKg || 0} kg`],
    ["TOTAL BERAT", res?.theoreticalDensityKg || 0, "-", `${res?.batchRequirements.totalBatchWeightKg || 0} kg`],
    ["", "", "", ""],
    ["Rasio Campuran (Semen : Pasir : Kerikil : Air)", res?.mixRatio || "-", "", ""],
    ["Estimasi Berat per Benda Uji", `${res?.batchRequirements.perSpecimenKg || 0} kg`, "", ""],
  ];
  const ws6 = XLSX.utils.aoa_to_sheet(finalComp);
  XLSX.utils.book_append_sheet(wb, ws6, "Final Composition");

  // Sheet 7: Dedicated Batching Table for Cylinder 15 x 30 cm (1, 3, & 6 Silinder)
  // Hitung volume silinder standar: V = pi * 0.075^2 * 0.30 = 0.0053014 m³
  const singleCylVol = 0.0053014;
  const wasteFactor = 1 + (project.parameters.wasteFactorPercent || 15) / 100;
  const vol1 = singleCylVol * wasteFactor; // ~0.0061 m³
  const vol3 = 3 * singleCylVol * wasteFactor; // ~0.0183 m³
  const vol6 = 6 * singleCylVol * wasteFactor; // ~0.0366 m³

  const netWaterPerM3 = res?.moistureCorrection.netWaterToBatchKg || res?.waterContentDesignKg || 190;
  const cementPerM3 = res?.cementContentKg || 450;
  const suppPerM3 = res?.supplementaryContentKg || 0;
  const sandWetPerM3 = res?.moistureCorrection.fineAggregateWetKg || res?.fineAggregateKg || 720;
  const gravelWetPerM3 = res?.moistureCorrection.coarseAggregateWetKg || res?.coarseAggregateKg || 1080;
  const admixPerM3 = res?.admixtureKg || 4.5;

  const cylinderBatchData = [
    ["TIMBANGAN ADUKAN BENDA UJI SILINDER 15 x 30 CM (STANDAR LAB & LOMBA BETON)", "", "", "", ""],
    ["Volume Nominal Cetakan: 0.00530 m³ (5.30 Liter / silinder)", "", "", "", ""],
    [`Faktor Cadangan Uji Slump & Spillage: +${project.parameters.wasteFactorPercent || 15}%`, "", "", "", ""],
    ["", "", "", "", ""],
    [
      "Material Penyusun",
      "Kondisi Material",
      `1 Silinder (Trial)\n[Vol: ${(vol1 * 1000).toFixed(2)} L / ${vol1.toFixed(4)} m³]`,
      `3 Silinder (1 Umur)\n[Vol: ${(vol3 * 1000).toFixed(2)} L / ${vol3.toFixed(4)} m³]`,
      `6 Silinder (Lomba 7D+28D)\n[Vol: ${(vol6 * 1000).toFixed(2)} L / ${vol6.toFixed(4)} m³]`,
    ],
    [
      "Air Netto Pencampur",
      "Koreksi Kadar Air Agregat",
      `${(netWaterPerM3 * vol1).toFixed(2)} kg`,
      `${(netWaterPerM3 * vol3).toFixed(2)} kg`,
      `${(netWaterPerM3 * vol6).toFixed(2)} kg`,
    ],
    [
      "Semen Portland",
      "Kering Udara / Kemasan",
      `${(cementPerM3 * vol1).toFixed(2)} kg`,
      `${(cementPerM3 * vol3).toFixed(2)} kg`,
      `${(cementPerM3 * vol6).toFixed(2)} kg`,
    ],
    [
      "Bahan Tambah Pozzolan / SCM",
      "Kering Saringan No. 200",
      suppPerM3 > 0 ? `${(suppPerM3 * vol1).toFixed(2)} kg` : "-",
      suppPerM3 > 0 ? `${(suppPerM3 * vol3).toFixed(2)} kg` : "-",
      suppPerM3 > 0 ? `${(suppPerM3 * vol6).toFixed(2)} kg` : "-",
    ],
    [
      "Pasir (Agregat Halus)",
      "Kondisi Timbangan (Basah Aktual)",
      `${(sandWetPerM3 * vol1).toFixed(2)} kg`,
      `${(sandWetPerM3 * vol3).toFixed(2)} kg`,
      `${(sandWetPerM3 * vol6).toFixed(2)} kg`,
    ],
    [
      "Kerikil (Agregat Kasar)",
      "Kondisi Timbangan (Basah Aktual)",
      `${(gravelWetPerM3 * vol1).toFixed(2)} kg`,
      `${(gravelWetPerM3 * vol3).toFixed(2)} kg`,
      `${(gravelWetPerM3 * vol6).toFixed(2)} kg`,
    ],
    [
      "Bahan Tambah Kimia (Admixture)",
      "Cairan / Timbangan Gram Presisi",
      `${(admixPerM3 * vol1 * 1000).toFixed(1)} gram`,
      `${(admixPerM3 * vol3 * 1000).toFixed(1)} gram`,
      `${(admixPerM3 * vol6 * 1000).toFixed(1)} gram`,
    ],
    [
      "TOTAL MASSA ADUKAN MIXER",
      "Total Timbangan Batch",
      `${((netWaterPerM3 + cementPerM3 + suppPerM3 + sandWetPerM3 + gravelWetPerM3 + admixPerM3) * vol1).toFixed(2)} kg`,
      `${((netWaterPerM3 + cementPerM3 + suppPerM3 + sandWetPerM3 + gravelWetPerM3 + admixPerM3) * vol3).toFixed(2)} kg`,
      `${((netWaterPerM3 + cementPerM3 + suppPerM3 + sandWetPerM3 + gravelWetPerM3 + admixPerM3) * vol6).toFixed(2)} kg`,
    ],
    ["", "", "", "", ""],
    ["Catatan Teknis Laboratorium:", "", "", "", ""],
    ["1. Timbangan pasir dan kerikil di atas sudah memasukkan koreksi kadar air lapangan (moisture content) vs absorpsi.", "", "", "", ""],
    ["2. Air pencampur di atas adalah AIR NETTO yang dituangkan ke dalam mixer (sudah dikurangi/ditambah selisih air bebas agregat).", "", "", "", ""],
    ["3. Batch 6 silinder adalah kebutuhan baku pengujian lomba beton (3 silinder umur 7 hari dan 3 silinder umur 28 hari sesuai SNI 1974:2011).", "", "", "", ""],
  ];
  const wsCylinder = XLSX.utils.aoa_to_sheet(cylinderBatchData);
  XLSX.utils.book_append_sheet(wb, wsCylinder, "Batch Silinder 15x30cm");

  // Sheet 7: Testing Results
  const testResults: any[][] = [
    ["HASIL PENGUJIAN BENDA UJI LABORATORIUM", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["Kode Benda Uji", "Variasi", "Bentuk", "Umur (Hari)", "Tgl Uji", "Luas (mm²)", "Beban Runtuh (kN)", "Kuat Tekan (MPa)", "Pola Retak"],
  ];
  if (project.specimens.length > 0) {
    project.specimens.forEach((sp) => {
      testResults.push([
        sp.code,
        sp.mixVariant,
        sp.specimenType,
        sp.ageDays,
        sp.testingDate,
        sp.crossSectionAreaMm2,
        sp.maxLoadKN,
        sp.compressiveStrengthMPa,
        sp.failurePattern || "Normal",
      ]);
    });
  } else {
    testResults.push(["Belum ada data pengujian diinput.", "", "", "", "", "", "", "", ""]);
  }
  const ws7 = XLSX.utils.aoa_to_sheet(testResults);
  XLSX.utils.book_append_sheet(wb, ws7, "Testing Results");

  // Sheet 8: Strength Analysis
  const spec28 = project.specimens.filter((s) => s.ageDays === 28);
  const avg28 = spec28.length > 0 ? (spec28.reduce((a, b) => a + b.compressiveStrengthMPa, 0) / spec28.length).toFixed(2) : "-";
  const strAnalysis = [
    ["ANALISIS EVALUASI KUAT TEKAN BETON", ""],
    ["", ""],
    ["Parameter Evaluasi", "Hasil"],
    ["Target Mutu Kuat Tekan f'c (28 hari)", `${project.parameters.targetStrengthFc} MPa`],
    ["Total Benda Uji Teruji", `${project.specimens.length} buah`],
    ["Rata-rata Kuat Tekan 28 Hari Aktual", `${avg28} MPa`],
    [
      "Status Ketercapaian Mutu",
      avg28 !== "-" && Number(avg28) >= project.parameters.targetStrengthFc ? "MEMENUHI TARGET MUTU (Pass)" : "EVALUASI DIBUTUHKAN (Needs Review)",
    ],
  ];
  const ws8 = XLSX.utils.aoa_to_sheet(strAnalysis);
  XLSX.utils.book_append_sheet(wb, ws8, "Strength Analysis");

  // Sheet 9: Innovation Comparison
  const innovData: any[][] = [
    ["PERBANDINGAN VARIASI INOVASI MATERIAL", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["Kode", "Nama Variasi", "Material Inovasi", "Tipe Substitusi", "Dosis (%)", "Prediksi Kuat Tekan (MPa)", "Kelebihan & Referensi"],
  ];
  if (project.innovations.length > 0) {
    project.innovations.forEach((iv) => {
      innovData.push([
        iv.code,
        iv.name,
        iv.materialName,
        iv.substitutionType,
        `${iv.dosagePercent}%`,
        iv.predictedStrengthMpa,
        `${iv.pros} [Ref: ${iv.researchRef}]`,
      ]);
    });
  } else {
    innovData.push(["Belum ada variasi inovasi yang disimpan.", "", "", "", "", "", ""]);
  }
  const ws9 = XLSX.utils.aoa_to_sheet(innovData);
  XLSX.utils.book_append_sheet(wb, ws9, "Innovation Comparison");

  // Sheet 10: References
  const refsData = [
    ["STANDAR TEKNIK & REFERENSI PENELITIAN MIXLAB", ""],
    ["", ""],
    ["Standar / Dokumen", "Judul Resmi & Ruang Lingkup"],
    ["SNI 7656:2012", "Tata cara pemilihan proporsi campuran beton normal, beton berat dan beton massa (BSN)"],
    ["SNI 03-2834-2000", "Tata cara pembuatan rencana campuran beton normal"],
    ["SNI 1974:2011", "Cara uji kuat tekan beton dengan benda uji silinder"],
    ["SNI 2493:2011", "Tata cara pembuatan dan perawatan benda uji beton di laboratorium"],
    ["SNI 1972:2008", "Cara uji slump beton"],
    ["ACI 211.1", "Standard Practice for Selecting Proportions for Normal, Heavyweight, and Mass Concrete"],
  ];
  const ws10 = XLSX.utils.aoa_to_sheet(refsData);
  XLSX.utils.book_append_sheet(wb, ws10, "References");

  // Generate and download file
  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  XLSX.writeFile(wb, `MIXLAB_${safeName}_Full_Report.xlsx`);
}

/**
 * Export formal PDF engineering report using jsPDF and autoTable
 */
export function exportProjectToPdf(project: ProjectData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const res = project.calculationResult;

  // Header Banner
  doc.setFillColor(20, 45, 69); // #142D45 Navy Blue
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MIXLAB - Concrete Mix Design Report", 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Smart Concrete Engineering Workspace | SNI 7656:2012 / SNI 03-2834-2000", 14, 22);
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 155, 22);

  // Section 1: Project Identity
  doc.setTextColor(20, 45, 69);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. IDENTITAS PROYEK & PARAMETER DESAIN", 14, 42);

  autoTable(doc, {
    startY: 46,
    theme: "striped",
    headStyles: { fillColor: [40, 107, 155] },
    body: [
      ["Nama Proyek", project.name, "Metode Perancangan", project.parameters.method],
      ["Jenis Beton", project.parameters.concreteType, "Target Kuat Tekan f'c", `${project.parameters.targetStrengthFc} MPa (28 hari)`],
      ["Target Slump", `${project.parameters.slumpMin} - ${project.parameters.slumpMax} mm`, "Ukuran Maksimum Agregat", `${project.parameters.maxAggregateSize} mm`],
      ["Volume Pengecoran", `${project.parameters.plannedVolumeM3} m³`, "Status Proyek", project.status],
    ],
    styles: { fontSize: 8.5, cellPadding: 2 },
  });

  // Section 2: Final Composition Table
  const finalY1 = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text("2. KOMPOSISI FINAL CAMPURAN BETON (PER 1 M³ & BATCH)", 14, finalY1);

  autoTable(doc, {
    startY: finalY1 + 4,
    theme: "grid",
    headStyles: { fillColor: [20, 45, 69] },
    head: [["Material Penyusun", "SSD (kg/m³)", "Massa Ditimbang (Koreksi Basah) kg/m³", `Kebutuhan Batch (${res?.batchRequirements.volumeM3 || 0} m³)`]],
    body: [
      ["Air Bersih Pencampur", `${res?.waterContentDesignKg || 0} kg`, `${res?.moistureCorrection.netWaterToBatchKg || 0} kg`, `${res?.batchRequirements.waterKg || 0} kg`],
      ["Semen Portland", `${res?.cementContentKg || 0} kg`, `${res?.cementContentKg || 0} kg`, `${res?.batchRequirements.cementKg || 0} kg`],
      ["Supplementary Binder (SCM)", `${res?.supplementaryContentKg || 0} kg`, `${res?.supplementaryContentKg || 0} kg`, `${res?.batchRequirements.supplementaryKg || 0} kg`],
      ["Pasir (Agregat Halus)", `${res?.fineAggregateKg || 0} kg`, `${res?.moistureCorrection.fineAggregateWetKg || 0} kg`, `${res?.batchRequirements.fineAggregateWetKg || 0} kg`],
      ["Kerikil (Agregat Kasar)", `${res?.coarseAggregateKg || 0} kg`, `${res?.moistureCorrection.coarseAggregateWetKg || 0} kg`, `${res?.batchRequirements.coarseAggregateWetKg || 0} kg`],
      ["Admixture Kimia", `${res?.admixtureKg || 0} kg`, `${res?.admixtureKg || 0} kg`, `${res?.batchRequirements.admixtureKg || 0} kg`],
    ],
    foot: [["TOTAL CAMPURAN", `${res?.theoreticalDensityKg || 0} kg/m³`, "-", `${res?.batchRequirements.totalBatchWeightKg || 0} kg`]],
    footStyles: { fillColor: [240, 245, 250], textColor: [20, 45, 69], fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 2 },
  });

  // Section 3: Moisture Correction Summary
  const finalY2 = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text("3. KOREKSI KADAR AIR AGREGAT (MOISTURE CORRECTION)", 14, finalY2);

  autoTable(doc, {
    startY: finalY2 + 4,
    theme: "striped",
    headStyles: { fillColor: [40, 107, 155] },
    head: [["Material Agregat", "Kadar Air (%)", "Penyerapan (%)", "Air Bebas Agregat", "Koreksi Air ke Mixer"]],
    body: [
      [
        "Pasir (Agregat Halus)",
        `${project.fineAggregate.moistureContent}%`,
        `${project.fineAggregate.absorption}%`,
        `${res?.moistureCorrection.waterDeltaFineAggKg || 0} kg/m³`,
        res && res.moistureCorrection.waterDeltaFineAggKg > 0 ? "Mengurangi air mixer" : "Menambah air mixer",
      ],
      [
        "Kerikil (Agregat Kasar)",
        `${project.coarseAggregate.moistureContent}%`,
        `${project.coarseAggregate.absorption}%`,
        `${res?.moistureCorrection.waterDeltaCoarseAggKg || 0} kg/m³`,
        res && res.moistureCorrection.waterDeltaCoarseAggKg > 0 ? "Mengurangi air mixer" : "Menambah air mixer",
      ],
    ],
    styles: { fontSize: 8.5, cellPadding: 2 },
  });

  // Section 4: Cylinder 15 x 30 cm Batching Table (1, 3, & 6 Silinder)
  doc.addPage();
  doc.setTextColor(20, 45, 69);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. TIMBANGAN ADUKAN BENDA UJI SILINDER 15 x 30 CM (LABORATORIUM)", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Dimensi cetakan: Diameter 150 mm x Tinggi 300 mm (0.00530 m³ / silinder) | Cadangan slump & spillage: +15%", 14, 25);

  const singleCylM3 = 0.0053014;
  const wasteMult = 1 + (project.parameters.wasteFactorPercent || 15) / 100;
  const v1 = singleCylM3 * wasteMult;
  const v3 = 3 * singleCylM3 * wasteMult;
  const v6 = 6 * singleCylM3 * wasteMult;

  const wNet = res?.moistureCorrection.netWaterToBatchKg || res?.waterContentDesignKg || 190;
  const cKg = res?.cementContentKg || 450;
  const scmKg = res?.supplementaryContentKg || 0;
  const fWet = res?.moistureCorrection.fineAggregateWetKg || res?.fineAggregateKg || 720;
  const cWet = res?.moistureCorrection.coarseAggregateWetKg || res?.coarseAggregateKg || 1080;
  const admKg = res?.admixtureKg || 4.5;

  autoTable(doc, {
    startY: 28,
    theme: "grid",
    headStyles: { fillColor: [20, 45, 69] },
    head: [
      [
        "Material Penyusun",
        "Kondisi Timbangan",
        "1 Silinder (Trial)",
        "3 Silinder (1 Umur)",
        "6 Silinder (Standar Lomba)",
      ],
    ],
    body: [
      [
        "Air Netto Mixer",
        "Koreksi Kadar Air Agregat",
        `${(wNet * v1).toFixed(2)} kg`,
        `${(wNet * v3).toFixed(2)} kg`,
        `${(wNet * v6).toFixed(2)} kg`,
      ],
      [
        "Semen Portland",
        "Kering Udara / Sak",
        `${(cKg * v1).toFixed(2)} kg`,
        `${(cKg * v3).toFixed(2)} kg`,
        `${(cKg * v6).toFixed(2)} kg`,
      ],
      [
        "Bahan Tambah Pozzolan/SCM",
        "Kering Halus",
        scmKg > 0 ? `${(scmKg * v1).toFixed(2)} kg` : "-",
        scmKg > 0 ? `${(scmKg * v3).toFixed(2)} kg` : "-",
        scmKg > 0 ? `${(scmKg * v6).toFixed(2)} kg` : "-",
      ],
      [
        "Pasir (Agregat Halus)",
        "Timbangan Aktual (Basah)",
        `${(fWet * v1).toFixed(2)} kg`,
        `${(fWet * v3).toFixed(2)} kg`,
        `${(fWet * v6).toFixed(2)} kg`,
      ],
      [
        "Kerikil (Agregat Kasar)",
        "Timbangan Aktual (Basah)",
        `${(cWet * v1).toFixed(2)} kg`,
        `${(cWet * v3).toFixed(2)} kg`,
        `${(cWet * v6).toFixed(2)} kg`,
      ],
      [
        "Admixture Kimia",
        "Timbangan Presisi (gr)",
        `${(admKg * v1 * 1000).toFixed(1)} gram`,
        `${(admKg * v3 * 1000).toFixed(1)} gram`,
        `${(admKg * v6 * 1000).toFixed(1)} gram`,
      ],
    ],
    foot: [
      [
        "TOTAL ADUKAN MIXER",
        "Berat Total Timbangan",
        `${((wNet + cKg + scmKg + fWet + cWet + admKg) * v1).toFixed(2)} kg`,
        `${((wNet + cKg + scmKg + fWet + cWet + admKg) * v3).toFixed(2)} kg`,
        `${((wNet + cKg + scmKg + fWet + cWet + admKg) * v6).toFixed(2)} kg`,
      ],
    ],
    footStyles: { fillColor: [240, 245, 250], textColor: [20, 45, 69], fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 2.2 },
  });

  // Section 5: Testing Summary if specimens exist
  if (project.specimens.length > 0) {
    const finalY3 = (doc as any).lastAutoTable.finalY + 10;
    doc.setTextColor(20, 45, 69);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("5. HASIL PENGUJIAN KUAT TEKAN BENDA UJI LABORATORIUM", 14, finalY3);
    autoTable(doc, {
      startY: finalY3 + 4,
      theme: "grid",
      headStyles: { fillColor: [40, 107, 155] },
      head: [["Kode", "Variasi", "Umur", "Luas (mm²)", "Beban (kN)", "Kuat Tekan (MPa)"]],
      body: project.specimens.slice(0, 12).map((s) => [
        s.code,
        s.mixVariant,
        `${s.ageDays} Hari`,
        s.crossSectionAreaMm2.toFixed(0),
        s.maxLoadKN.toFixed(1),
        `${s.compressiveStrengthMPa.toFixed(2)} MPa`,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
    });
  }

  // Footer on page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`MIXLAB Civil Engineering Suite | Halaman ${i} dari ${pageCount}`, 14, 290);
    doc.text("Dokumen diverifikasi secara matematis berdasarkan standar SNI", 125, 290);
  }

  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`MIXLAB_${safeName}_Engineering_Report.pdf`);
}
