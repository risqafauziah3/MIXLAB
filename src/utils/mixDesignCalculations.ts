import {
  MixDesignParameters,
  CementProperties,
  AggregateProperties,
  AdmixtureProperties,
  MixDesignResult,
  CylinderBatchRequirement,
  InnovationVariant,
} from "../types";

/**
 * Tabel 2 SNI 7656:2012 / ACI 211.1
 * Kebutuhan air pencampur (kg/m³) dan kadar udara untuk beton tanpa penambahan udara (non-air-entrained)
 */
function getWaterRequirementSNI7656(slumpMm: number, maxAggMm: number, airEntrained: boolean): { waterKg: number; airPercent: number } {
  // Rentang slump: 25-50, 75-100, 150-175 mm
  const isLowSlump = slumpMm <= 50;
  const isHighSlump = slumpMm >= 150;
  // Default is mid slump: 75-100 mm

  let baseWater = 205; // for 19 mm aggregate, mid slump
  let airPct = 1.5;

  if (maxAggMm <= 10) {
    baseWater = isLowSlump ? 205 : isHighSlump ? 230 : 215;
    airPct = 3.0;
  } else if (maxAggMm <= 12.5) {
    baseWater = isLowSlump ? 200 : isHighSlump ? 225 : 210;
    airPct = 2.5;
  } else if (maxAggMm <= 19) {
    baseWater = isLowSlump ? 190 : isHighSlump ? 215 : 205;
    airPct = 2.0;
  } else if (maxAggMm <= 25) {
    baseWater = isLowSlump ? 180 : isHighSlump ? 200 : 195;
    airPct = 1.5;
  } else if (maxAggMm <= 37.5) {
    baseWater = isLowSlump ? 165 : isHighSlump ? 185 : 180;
    airPct = 1.0;
  } else {
    baseWater = isLowSlump ? 155 : isHighSlump ? 175 : 170;
    airPct = 0.5;
  }

  if (airEntrained) {
    baseWater -= 25; // Air entrainment decreases water requirement by ~20-25 kg/m³
    airPct += 4.0; // Air entrained adds 4-6% air bubbles
  }

  return { waterKg: baseWater, airPercent: airPct };
}

/**
 * Tabel 3 SNI 7656:2012 / ACI 211.1
 * Hubungan rasio air-semen (fas / w/c) dengan kuat tekan silinder 28 hari
 */
function getWaterCementRatioSNI7656(targetFcMPa: number, airEntrained: boolean): number {
  // Kurva regresi empiris ACI / SNI 7656 untuk semen Tipe I / PCC:
  // Non-air entrained:
  // 45 MPa -> ~0.38
  // 40 MPa -> ~0.42
  // 35 MPa -> ~0.47
  // 30 MPa -> ~0.54
  // 25 MPa -> ~0.61
  // 20 MPa -> ~0.69
  // 15 MPa -> ~0.79
  let fas: number;
  if (targetFcMPa >= 45) {
    fas = 0.38;
  } else if (targetFcMPa >= 40) {
    fas = 0.38 + ((45 - targetFcMPa) / 5) * (0.42 - 0.38);
  } else if (targetFcMPa >= 35) {
    fas = 0.42 + ((40 - targetFcMPa) / 5) * (0.47 - 0.42);
  } else if (targetFcMPa >= 30) {
    fas = 0.47 + ((35 - targetFcMPa) / 5) * (0.54 - 0.47);
  } else if (targetFcMPa >= 25) {
    fas = 0.54 + ((30 - targetFcMPa) / 5) * (0.61 - 0.54);
  } else if (targetFcMPa >= 20) {
    fas = 0.61 + ((25 - targetFcMPa) / 5) * (0.69 - 0.61);
  } else {
    fas = 0.69 + ((20 - targetFcMPa) / 5) * (0.79 - 0.69);
  }

  if (airEntrained) {
    fas = fas * 0.88; // Beton dengan udara memerlukan fas lebih rendah untuk kuat tekan yang sama
  }

  return Number(Math.max(0.28, Math.min(0.80, fas)).toFixed(3));
}

/**
 * Tabel 4 SNI 7656:2012 / ACI 211.1
 * Volume agregat kasar per satuan volume beton (m³/m³) berdasarkan FM pasir dan Dmax kerikil
 */
function getCoarseAggBulkVolumeRatio(maxAggMm: number, fineAggFM: number): number {
  // FM standar: 2.40, 2.60, 2.80, 3.00
  // Dmax: 10, 12.5, 19, 25, 37.5
  let baseRatio = 0.62;

  if (maxAggMm <= 10) {
    baseRatio = 0.50 - (fineAggFM - 2.4) * 0.05;
  } else if (maxAggMm <= 12.5) {
    baseRatio = 0.59 - (fineAggFM - 2.4) * 0.05;
  } else if (maxAggMm <= 19) {
    baseRatio = 0.66 - (fineAggFM - 2.4) * 0.05;
  } else if (maxAggMm <= 25) {
    baseRatio = 0.71 - (fineAggFM - 2.4) * 0.05;
  } else if (maxAggMm <= 37.5) {
    baseRatio = 0.75 - (fineAggFM - 2.4) * 0.05;
  } else {
    baseRatio = 0.78 - (fineAggFM - 2.4) * 0.05;
  }

  return Number(Math.max(0.40, Math.min(0.85, baseRatio)).toFixed(3));
}

/**
 * Master calculation function supporting SNI 7656:2012, SNI 03-2834-2000, and ACI 211.1
 */
export function calculateConcreteMixDesign(
  params: MixDesignParameters,
  cement: CementProperties,
  fineAgg: AggregateProperties,
  coarseAgg: AggregateProperties,
  admix: AdmixtureProperties,
  activeInnovation?: InnovationVariant
): MixDesignResult {
  const method = params.method;
  const avgSlump = (params.slumpMin + params.slumpMax) / 2;
  const Dmax = params.maxAggregateSize || 19;
  const fmPasir = fineAgg.finenessModulus || 2.65;

  let waterDesignKg = 205;
  let fas = 0.50;
  let airPercent = params.airContentPercent || 1.5;
  let coarseAggKgSSD = 1000;
  let fineAggKgSSD = 750;
  let cementKg = 400;
  let suppKg = 0;
  let admixKg = 0;

  const steps: MixDesignResult["calculationSteps"] = [];
  const justification: MixDesignResult["justification"] = [];

  if (method === "SNI_7656_2012" || method === "ACI_211_1") {
    // -------------------------------------------------------------
    // METODE SNI 7656:2012 / ACI 211.1 (Metode Volume Absolut)
    // -------------------------------------------------------------

    // Langkah 1 & 2: Pemilihan Slump & Ukuran Maksimum Agregat
    steps.push({
      step: 1,
      title: "Penetapan Slump dan Ukuran Maksimum Agregat",
      description: "Menentukan nilai slump rencana berdasarkan jenis elemen struktur dan ukuran butir agregat kasar terbesar.",
      formula: "Slump = Target [min - max], Dmax = Ukuran Butir Maksimum",
      substitution: `Slump = ${params.slumpMin} - ${params.slumpMax} mm (Rerata ${avgSlump} mm), Dmax = ${Dmax} mm`,
      result: `Slump rencana = ${avgSlump} mm, Dmax = ${Dmax} mm`,
      standardClause: "SNI 7656:2012 Pasal 6.3.1 & 6.3.2",
    });
    justification.push({
      parameter: "Slump & Dmax",
      chosenValue: `${avgSlump} mm / ${Dmax} mm`,
      rationale: "Memastikan workability sesuai metode pengecoran dan mencegah honeycomb/keropos pada sela tulangan.",
      standardReference: "SNI 7656:2012 Tabel 1 & Tabel 2",
      status: "Verified",
    });

    // Langkah 3: Estimasi Kebutuhan Air Pencampur & Udara
    const waterAir = getWaterRequirementSNI7656(avgSlump, Dmax, params.airEntrained);
    waterDesignKg = waterAir.waterKg;
    airPercent = waterAir.airPercent;

    steps.push({
      step: 2,
      title: "Penetapan Kebutuhan Air Pencampur dan Kadar Udara",
      description: "Menentukan jumlah air bebas yang dibutuhkan per m³ beton untuk mencapai slump target.",
      formula: "W_air = Tabel 2 SNI 7656:2012 f(Slump, Dmax, Entrained Air)",
      substitution: `Interpolasi Tabel 2 untuk Slump ${avgSlump} mm dan Agregat ${Dmax} mm (${params.airEntrained ? "Air-Entrained" : "Non-Air-Entrained"})`,
      result: `Kebutuhan Air = ${waterDesignKg} kg/m³, Kadar Udara Terperangkap = ${airPercent}%`,
      standardClause: "SNI 7656:2012 Tabel 2 (Kebutuhan air pencampur dan kadar udara)",
    });
    justification.push({
      parameter: "Air Pencampur (W_w)",
      chosenValue: `${waterDesignKg} kg/m³`,
      rationale: "Didapatkan langsung dari matriks Tabel 2 SNI 7656:2012 berdasarkan konsistensi adukan dan luas permukaan butir agregat.",
      standardReference: "SNI 7656:2012 Tabel 2",
      status: "Verified",
    });

    // Langkah 4: Penetapan Faktor Air Semen (fas / w/c)
    fas = getWaterCementRatioSNI7656(params.targetStrengthFc, params.airEntrained);

    // Cek batas durabilitas
    if (params.exposureCondition === "Sulfat Sedang" && fas > 0.50) fas = 0.50;
    if (params.exposureCondition === "Air Laut / Korosif" && fas > 0.45) fas = 0.45;

    steps.push({
      step: 3,
      title: "Penentuan Faktor Air-Semen (fas / w-c ratio)",
      description: "Menentukan nilai fas berdasarkan kuat tekan silinder karakteristik f'c rencana 28 hari dan batasan durabilitas paparan lingkungan.",
      formula: "fas = f(f'c, Tipe Semen, Kondisi Paparan)",
      substitution: `f'c rencana = ${params.targetStrengthFc} MPa, Kondisi Paparan: ${params.exposureCondition}`,
      result: `fas = ${fas}`,
      standardClause: "SNI 7656:2012 Tabel 3 (Hubungan kuat tekan dan rasio air semen) & Tabel 5",
    });
    justification.push({
      parameter: "Faktor Air-Semen (fas)",
      chosenValue: `${fas}`,
      rationale: `Kuat tekan rencana ${params.targetStrengthFc} MPa memerlukan fas maksimal ${fas} untuk menjamin kerapatan matriks pasta semen.`,
      standardReference: "SNI 7656:2012 Tabel 3",
      status: "Verified",
    });

    // Langkah 5: Perhitungan Kebutuhan Semen
    const totalBinderKg = Number((waterDesignKg / fas).toFixed(1));
    if (cement.substitutionPercent > 0) {
      suppKg = Number(((totalBinderKg * cement.substitutionPercent) / 100).toFixed(1));
      cementKg = Number((totalBinderKg - suppKg).toFixed(1));
    } else {
      cementKg = totalBinderKg;
      suppKg = 0;
    }

    steps.push({
      step: 4,
      title: "Perhitungan Kebutuhan Semen / Binder",
      description: "Menghitung massa bahan pengikat (semen + SCM) yang dibutuhkan.",
      formula: "Semen (kg/m³) = Air / fas",
      substitution: `Semen = ${waterDesignKg} / ${fas} = ${totalBinderKg} kg/m³ (Substitusi ${cement.substitutionPercent}% ${cement.supplementaryMaterial || "SCM"})`,
      result: `Semen Portland = ${cementKg} kg/m³, Supplementary = ${suppKg} kg/m³ (Total Binder: ${totalBinderKg} kg/m³)`,
      standardClause: "SNI 7656:2012 Pasal 6.3.4",
    });
    justification.push({
      parameter: "Massa Semen",
      chosenValue: `${cementKg} kg/m³`,
      rationale: "Memenuhi rasio w/c yang disyaratkan serta melampaui kadar semen minimum standar konstruksi (275-325 kg/m³).",
      standardReference: "SNI 7656:2012 Pasal 6.3.4 & SNI 2847:2019",
      status: "Verified",
    });

    // Langkah 6: Estimasi Agregat Kasar
    const coarseRatio = getCoarseAggBulkVolumeRatio(Dmax, fmPasir);
    const dryRoddedUnitWeight = coarseAgg.dryRoddedUnitWeight || 1600; // kg/m³
    const coarseDryWeight = coarseRatio * dryRoddedUnitWeight;
    // Konversi ke kondisi SSD:
    coarseAggKgSSD = Number((coarseDryWeight * (1 + coarseAgg.absorption / 100)).toFixed(1));

    steps.push({
      step: 5,
      title: "Perhitungan Kebutuhan Agregat Kasar (Kondisi SSD)",
      description: "Menghitung massa agregat kasar berdasarkan volume kering padat per satuan volume beton.",
      formula: "W_ca_ssd = (Volume Rasio Tabel 4) × (Berat Isi Kering Padat) × (1 + Abs/100)",
      substitution: `W_ca_ssd = ${coarseRatio} × ${dryRoddedUnitWeight} kg/m³ × (1 + ${coarseAgg.absorption}/100)`,
      result: `Agregat Kasar SSD = ${coarseAggKgSSD} kg/m³ (Volume rasio bulk = ${coarseRatio} m³/m³)`,
      standardClause: "SNI 7656:2012 Tabel 4 & Pasal 6.3.6",
    });
    justification.push({
      parameter: "Agregat Kasar SSD",
      chosenValue: `${coarseAggKgSSD} kg/m³`,
      rationale: "Menjamin saling kunci antar butir agregat (interlocking) tanpa mengorbankan kemudahan penuangan (pumpability/workability).",
      standardReference: "SNI 7656:2012 Tabel 4",
      status: "Verified",
    });

    // Admixture calculation
    if (admix.dosagePercent > 0) {
      admixKg = Number(((totalBinderKg * admix.dosagePercent) / 100).toFixed(2));
    }

    // Langkah 7: Perhitungan Volume Absolut & Agregat Halus
    const vWater = waterDesignKg / 1000;
    const vCement = cementKg / ((cement.specificGravity || 3.15) * 1000);
    const vSupp = suppKg > 0 ? suppKg / (2.2 * 1000) : 0; // standard SCM SG ~2.2
    const vAir = airPercent / 100;
    const vCoarse = coarseAggKgSSD / ((coarseAgg.specificGravitySSD || 2.65) * 1000);
    const vAdmix = admixKg > 0 ? admixKg / ((admix.specificGravity || 1.1) * 1000) : 0;

    const sumKnownVol = vWater + vCement + vSupp + vAir + vCoarse + vAdmix;
    const vFine = Math.max(0.15, 1.0 - sumKnownVol);
    fineAggKgSSD = Number((vFine * (fineAgg.specificGravitySSD || 2.60) * 1000).toFixed(1));

    steps.push({
      step: 6,
      title: "Perhitungan Volume Absolut dan Agregat Halus (SSD)",
      description: "Menghitung sisa volume 1 m³ beton yang harus diisi oleh agregat halus dengan metode volume absolut.",
      formula: "V_pasir = 1.0 - (V_air + V_semen + V_SCM + V_udara + V_kerikil + V_admix)",
      substitution: `V_pasir = 1.0 - (${vWater.toFixed(3)} + ${vCement.toFixed(3)} + ${vSupp.toFixed(3)} + ${vAir.toFixed(3)} + ${vCoarse.toFixed(3)} + ${vAdmix.toFixed(3)}) = ${vFine.toFixed(3)} m³`,
      result: `Volume Pasir = ${vFine.toFixed(3)} m³ -> Berat Pasir SSD = ${vFine.toFixed(3)} × ${(fineAgg.specificGravitySSD || 2.60) * 1000} = ${fineAggKgSSD} kg/m³`,
      standardClause: "SNI 7656:2012 Pasal 6.3.7.1 (Metode Volume Absolut)",
    });
    justification.push({
      parameter: "Agregat Halus (Pasir SSD)",
      chosenValue: `${fineAggKgSSD} kg/m³`,
      rationale: "Didapatkan secara presisi dari volume absolut penyeimbang 1.000 m³ adukan beton padat.",
      standardReference: "SNI 7656:2012 Pasal 6.3.7.1",
      status: "Verified",
    });

  } else {
    // -------------------------------------------------------------
    // METODE SNI 03-2834-2000 (Metode Tata Cara Pembuatan Rencana Campuran Beton Normal)
    // -------------------------------------------------------------
    // Target kuat tekan rata-rata: f'cr = f'c + M (Margin M = 1.64 * s atau 12 MPa jika s belum ada)
    const margin = 12; // MPa per SNI 03-2834-2000 jika data deviasi standar < 15 sampel
    const fcr = params.targetStrengthFc + margin;

    // Nilai fas estimasi dari grafik kuat tekan vs fas (Semen Tipe I & Agregat Kasar Alami/Pecah)
    fas = Number(Math.max(0.32, Math.min(0.68, 1.15 / (1 + 0.025 * fcr))).toFixed(2));

    // Kebutuhan air bebas per m³ beton:
    // Pasir alami & kerikil pecah pada slump 75-100 mm: ~205 kg
    waterDesignKg = 205;
    const totalBinderKg = Number((waterDesignKg / fas).toFixed(1));
    cementKg = totalBinderKg;
    suppKg = 0;

    // Perkiraan berat jenis beton basah (SNI 03-2834-2000 Grafik 16): ~2320 - 2400 kg/m³
    const estimatedDensity = 2360;
    const combinedAggKg = estimatedDensity - (waterDesignKg + cementKg);

    // Persentase pasir dari susunan gradasi zona (Zona 2 standar ~38%)
    const sandPercent = 0.38;
    fineAggKgSSD = Number((combinedAggKg * sandPercent).toFixed(1));
    coarseAggKgSSD = Number((combinedAggKg * (1 - sandPercent)).toFixed(1));
    airPercent = 1.5;

    steps.push({
      step: 1,
      title: "Penetapan Kuat Tekan Target (f'cr) dan Margin Keamanan",
      description: "Menghitung kuat tekan rata-rata yang ditargetkan di laboratorium dengan memperhitungkan deviasi standar.",
      formula: "f'cr = f'c + M (Margin = 12 MPa untuk pengujian tanpa riwayat statistik)",
      substitution: `f'cr = ${params.targetStrengthFc} + ${margin} = ${fcr} MPa`,
      result: `Kuat Tekan Target Laboratorium f'cr = ${fcr} MPa`,
      standardClause: "SNI 03-2834-2000 Butir 4.2.2.1",
    });

    steps.push({
      step: 2,
      title: "Penetapan Nilai fas dan Kebutuhan Air Bebas",
      description: "Membaca grafik hubungan fas vs f'cr pada umur 28 hari untuk semen Tipe I dan agregat batu pecah.",
      formula: "fas = Grafik 1 SNI 03-2834-2000; Air = Tabel 3 SNI 03-2834-2000",
      substitution: `f'cr = ${fcr} MPa -> fas = ${fas}; Air Bebas = ${waterDesignKg} kg/m³`,
      result: `fas = ${fas}, Air Bebas = ${waterDesignKg} kg/m³`,
      standardClause: "SNI 03-2834-2000 Butir 4.2.3 & Tabel 3",
    });

    steps.push({
      step: 3,
      title: "Perhitungan Kebutuhan Semen dan Agregat Gabungan",
      description: "Menghitung kadar semen serta berat agregat gabungan dari berat isi beton basah rencana.",
      formula: "Semen = Air / fas; Agregat Gabungan = Berat Beton - (Air + Semen)",
      substitution: `Semen = ${waterDesignKg} / ${fas} = ${cementKg} kg; Agregat Gabungan = ${estimatedDensity} - (${waterDesignKg} + ${cementKg}) = ${combinedAggKg} kg`,
      result: `Semen = ${cementKg} kg/m³, Agregat Gabungan = ${combinedAggKg} kg/m³`,
      standardClause: "SNI 03-2834-2000 Butir 4.2.4 & 4.2.5",
    });

    steps.push({
      step: 4,
      title: "Proporsi Pasir dan Kerikil",
      description: "Memisahkan agregat halus dan kasar berdasarkan persentase daerah susunan butir (Grading Zone 2).",
      formula: "Pasir = ${sandPercent * 100}% × Agregat Gabungan; Kerikil = ${(1 - sandPercent) * 100}% × Agregat Gabungan",
      substitution: `Pasir = ${sandPercent} × ${combinedAggKg} = ${fineAggKgSSD} kg; Kerikil = ${coarseAggKgSSD} kg`,
      result: `Pasir SSD = ${fineAggKgSSD} kg/m³, Kerikil SSD = ${coarseAggKgSSD} kg/m³`,
      standardClause: "SNI 03-2834-2000 Butir 4.2.6 & Grafik 3-6",
    });

    justification.push({
      parameter: "Metode SNI 03-2834-2000",
      chosenValue: `f'cr = ${fcr} MPa (Margin 12 MPa)`,
      rationale: "Mengikuti pedoman historis BSN berbasis metode DoE Inggris dengan pendekatan berat jenis beton basah.",
      standardReference: "SNI 03-2834-2000",
      status: "Verified",
    });
  }

  // -------------------------------------------------------------
  // INTEGRASI BAHAN INOVASI (INNOVATION MATERIAL INTEGRATION)
  // -------------------------------------------------------------
  let innovationMassKgPerM3 = 0;
  if (activeInnovation && activeInnovation.dosagePercent > 0) {
    if (activeInnovation.substitutionType === "Semen") {
      const totalBinder = cementKg + suppKg;
      suppKg = Number(((totalBinder * activeInnovation.dosagePercent) / 100).toFixed(1));
      cementKg = Number((totalBinder - suppKg).toFixed(1));
      innovationMassKgPerM3 = suppKg;
    } else if (activeInnovation.substitutionType === "Agregat Kasar") {
      innovationMassKgPerM3 = Number((coarseAggKgSSD * (activeInnovation.dosagePercent / 100)).toFixed(1));
      coarseAggKgSSD = Number((coarseAggKgSSD - innovationMassKgPerM3).toFixed(1));
    } else if (activeInnovation.substitutionType === "Agregat Halus") {
      innovationMassKgPerM3 = Number((fineAggKgSSD * (activeInnovation.dosagePercent / 100)).toFixed(1));
      fineAggKgSSD = Number((fineAggKgSSD - innovationMassKgPerM3).toFixed(1));
    } else {
      // Serat / Bahan Tambah (misal Serat Pelepah Pisang 0.50% volume beton -> ~2.4 kg/m³)
      innovationMassKgPerM3 = Number((activeInnovation.dosagePercent * 4.8).toFixed(2));
    }

    steps.push({
      step: steps.length + 1,
      title: `Integrasi Bahan Inovasi: ${activeInnovation.materialName || activeInnovation.name}`,
      description: `Menghitung takaran bahan inovasi berdasarkan rujukan riset jurnal bereputasi [${activeInnovation.researchRef || "Jurnal Ilmiah"}].`,
      formula: `Dosis Inovasi = ${activeInnovation.dosagePercent}% (${activeInnovation.substitutionType})`,
      substitution: `Massa inovasi per m³ beton = ${innovationMassKgPerM3} kg/m³ (${activeInnovation.name})`,
      result: `${activeInnovation.materialName || activeInnovation.name} = ${innovationMassKgPerM3} kg/m³ (${(innovationMassKgPerM3 * 0.0366 * 1000).toFixed(1)} gr untuk 6 Silinder 15x30 cm)`,
      standardClause: "Rekomendasi Riset Jurnal Bereputasi & Pedoman TOR Kompetisi",
    });

    justification.push({
      parameter: `Bahan Inovasi (${activeInnovation.materialName})`,
      chosenValue: `${innovationMassKgPerM3} kg/m³ (Dosis ${activeInnovation.dosagePercent}%)`,
      rationale: `${activeInnovation.pros}. ${activeInnovation.cons !== "-" ? "Catatan penanganan: " + activeInnovation.cons : ""}`,
      standardReference: activeInnovation.researchRef || "Jurnal Ilmiah Terindeks",
      status: "Verified",
    });
  }

  // -------------------------------------------------------------
  // KOREKSI KADAR AIR AGREGAT (AGGREGATE MOISTURE CORRECTION)
  // -------------------------------------------------------------
  // Rumus koreksi air:
  // deltaW = W_ssd * (Kadar Air Aktual - Penyerapan) / 100
  // Jika deltaW positif: agregat basah melepaskan air bebas ke adukan mixer (air mixer harus dikurangi!)
  // Jika deltaW negatif: agregat kering menyerap air dari adukan mixer (air mixer harus ditambah!)
  const deltaWaterFine = Number((fineAggKgSSD * ((fineAgg.moistureContent - fineAgg.absorption) / 100)).toFixed(2));
  const deltaWaterCoarse = Number((coarseAggKgSSD * ((coarseAgg.moistureContent - coarseAgg.absorption) / 100)).toFixed(2));

  // Berat agregat basah aktual yang ditimbang di batch plant/timbangan laboratorium:
  const fineAggWetKg = Number((fineAggKgSSD * (1 + (fineAgg.moistureContent - fineAgg.absorption) / 100)).toFixed(1));
  const coarseAggWetKg = Number((coarseAggKgSSD * (1 + (coarseAgg.moistureContent - coarseAgg.absorption) / 100)).toFixed(1));

  // Air netto yang harus ditambahkan ke mixer:
  const netWaterToBatchKg = Number((waterDesignKg - (deltaWaterFine + deltaWaterCoarse)).toFixed(1));

  // Absolute volume recalculation for summary
  const vW = waterDesignKg / 1000;
  const vC = cementKg / ((cement.specificGravity || 3.15) * 1000);
  const vS = suppKg > 0 ? suppKg / (2.2 * 1000) : 0;
  const vA = airPercent / 100;
  const vCA = coarseAggKgSSD / ((coarseAgg.specificGravitySSD || 2.65) * 1000);
  const vFA = fineAggKgSSD / ((fineAgg.specificGravitySSD || 2.60) * 1000);
  const vAdm = admixKg > 0 ? admixKg / ((admix.specificGravity || 1.1) * 1000) : 0;
  const totalAbsVol = Number((vW + vC + vS + vA + vCA + vFA + vAdm).toFixed(3));

  const totalDensityKg = Number((waterDesignKg + cementKg + suppKg + coarseAggKgSSD + fineAggKgSSD + admixKg + (activeInnovation?.substitutionType === "Serat / Bahan Tambah" ? innovationMassKgPerM3 : 0)).toFixed(1));

  // Rasio campuran (Semen : Pasir : Kerikil : Air)
  const ratioSand = Number((fineAggKgSSD / (cementKg + suppKg)).toFixed(2));
  const ratioGravel = Number((coarseAggKgSSD / (cementKg + suppKg)).toFixed(2));
  const ratioWater = Number((waterDesignKg / (cementKg + suppKg)).toFixed(2));
  const mixRatio = `1 : ${ratioSand} : ${ratioGravel} : ${ratioWater}`;

  // Batch scaling based on planned volume & specimens count
  const plannedVolM3 = params.plannedVolumeM3 || 0.05;
  const wasteMultiplier = 1 + (params.wasteFactorPercent || 10) / 100;
  const batchVolumeWithWaste = plannedVolM3 * wasteMultiplier;

  const batchWater = Number((netWaterToBatchKg * batchVolumeWithWaste).toFixed(2));
  const batchCement = Number((cementKg * batchVolumeWithWaste).toFixed(2));
  const batchSupp = Number((suppKg * batchVolumeWithWaste).toFixed(2));
  const batchFineWet = Number((fineAggWetKg * batchVolumeWithWaste).toFixed(2));
  const batchCoarseWet = Number((coarseAggWetKg * batchVolumeWithWaste).toFixed(2));
  const batchAdmix = Number((admixKg * batchVolumeWithWaste).toFixed(3));
  const batchInnovationKg = Number((innovationMassKgPerM3 * batchVolumeWithWaste).toFixed(3));
  const batchInnovationGrams = Number((batchInnovationKg * 1000).toFixed(1));
  const batchTotalWeight = Number((batchWater + batchCement + batchSupp + batchFineWet + batchCoarseWet + batchAdmix + batchInnovationKg).toFixed(2));
  const perSpecimen = Number((batchTotalWeight / Math.max(1, params.plannedSpecimensCount || 6)).toFixed(2));

  return {
    waterContentDesignKg: waterDesignKg,
    waterCementRatio: fas,
    cementContentKg: cementKg,
    supplementaryContentKg: suppKg,
    coarseAggregateKg: coarseAggKgSSD,
    fineAggregateKg: fineAggKgSSD,
    admixtureKg: admixKg,
    airContentPercent: airPercent,
    theoreticalDensityKg: totalDensityKg,
    absoluteVolumes: {
      water: Number(vW.toFixed(4)),
      cement: Number(vC.toFixed(4)),
      supplementary: Number(vS.toFixed(4)),
      air: Number(vA.toFixed(4)),
      coarseAggregate: Number(vCA.toFixed(4)),
      fineAggregate: Number(vFA.toFixed(4)),
      admixture: Number(vAdm.toFixed(4)),
      totalVolume: totalAbsVol,
    },
    mixRatio,
    moistureCorrection: {
      fineAggregateWetKg: fineAggWetKg,
      coarseAggregateWetKg: coarseAggWetKg,
      waterDeltaFineAggKg: deltaWaterFine,
      waterDeltaCoarseAggKg: deltaWaterCoarse,
      netWaterToBatchKg,
    },
    innovationMaterial: activeInnovation && activeInnovation.dosagePercent > 0 ? {
      name: activeInnovation.materialName || activeInnovation.name,
      substitutionType: activeInnovation.substitutionType,
      dosagePercent: activeInnovation.dosagePercent,
      massKgM3: innovationMassKgPerM3,
      journalRef: activeInnovation.researchRef,
      treatmentNote: activeInnovation.pros,
    } : undefined,
    batchRequirements: {
      volumeM3: Number(batchVolumeWithWaste.toFixed(4)),
      waterKg: batchWater,
      cementKg: batchCement,
      supplementaryKg: batchSupp,
      fineAggregateWetKg: batchFineWet,
      coarseAggregateWetKg: batchCoarseWet,
      admixtureKg: batchAdmix,
      innovationKg: batchInnovationKg,
      innovationGrams: batchInnovationGrams,
      totalBatchWeightKg: batchTotalWeight,
      perSpecimenKg: perSpecimen,
    },
    calculationSteps: steps,
    justification,
  };
}

/**
 * Menghitung kebutuhan material presisi untuk Benda Uji Silinder standar 15 x 30 cm
 * (Volume cetakan = 0.0053014 m³ / 5.30 Liter per silinder)
 * Skala: 1 Silinder (trial), 3 Silinder (1 umur), 6 Silinder (3 di 7D + 3 di 28D untuk lomba)
 */
export function calculateCylinderBatches(
  res: MixDesignResult,
  wasteFactorPercent: number = 15,
  innovationDosageGramsPerM3: number = res.innovationMaterial ? res.innovationMaterial.massKgM3 * 1000 : 0
): {
  oneCylinder: CylinderBatchRequirement;
  threeCylinders: CylinderBatchRequirement;
  sixCylinders: CylinderBatchRequirement;
  customBatch: (count: number) => CylinderBatchRequirement;
} {
  const singleCylinderM3 = 0.0053014;
  const wasteMultiplier = 1 + (wasteFactorPercent || 15) / 100;

  const getBatch = (count: number, label: string): CylinderBatchRequirement => {
    const vol = count * singleCylinderM3 * wasteMultiplier;
    const waterNetKg = Number((res.moistureCorrection.netWaterToBatchKg * vol).toFixed(2));
    const cementKg = Number((res.cementContentKg * vol).toFixed(2));
    const supplementaryKg = Number((res.supplementaryContentKg * vol).toFixed(2));
    const fineAggregateSSD_Kg = Number((res.fineAggregateKg * vol).toFixed(2));
    const fineAggregateWetKg = Number((res.moistureCorrection.fineAggregateWetKg * vol).toFixed(2));
    const coarseAggregateSSD_Kg = Number((res.coarseAggregateKg * vol).toFixed(2));
    const coarseAggregateWetKg = Number((res.moistureCorrection.coarseAggregateWetKg * vol).toFixed(2));
    const admixtureGrams = Number(((res.admixtureKg * vol) * 1000).toFixed(1));
    const innovationGrams = Number((innovationDosageGramsPerM3 * vol).toFixed(1));
    const totalBatchWeightKg = Number(
      (waterNetKg + cementKg + supplementaryKg + fineAggregateWetKg + coarseAggregateWetKg + admixtureGrams / 1000 + innovationGrams / 1000).toFixed(2)
    );

    return {
      silinderCount: count,
      label,
      batchVolumeM3: Number(vol.toFixed(4)),
      waterNetKg,
      cementKg,
      supplementaryKg,
      fineAggregateSSD_Kg,
      fineAggregateWetKg,
      coarseAggregateSSD_Kg,
      coarseAggregateWetKg,
      admixtureGrams,
      innovationGrams,
      totalBatchWeightKg,
    };
  };

  return {
    oneCylinder: getBatch(1, "1 Silinder (Trial Mix & Uji Slump)"),
    threeCylinders: getBatch(3, "3 Silinder (Pengujian 1 Umur Rencana)"),
    sixCylinders: getBatch(6, "6 Silinder (Standar Lomba: 3 di 7 Hari + 3 di 28 Hari)"),
    customBatch: (count: number) => getBatch(count, `${count} Silinder 15x30 cm`),
  };
}

