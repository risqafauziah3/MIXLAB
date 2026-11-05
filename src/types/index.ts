export type ConcreteStandardMethod = "SNI_7656_2012" | "SNI_03_2834_2000" | "ACI_211_1";

export type ProjectStatus = 
  | "Design in Progress" 
  | "Waiting for Testing" 
  | "Testing Completed" 
  | "Needs Evaluation" 
  | "Completed";

export type SpecimenShape = "cylinder_100x200" | "cylinder_150x300" | "cube_150" | "cube_100" | "beam_100x100x400";

export interface SieveData {
  sieveSize: number; // in mm, e.g. 9.5, 4.75
  sieveName: string; // e.g. "3/8 inch", "No. 4"
  massRetained: number; // grams
  percentRetained?: number;
  cumulativeRetained?: number;
  percentPassing?: number;
  lowerLimit?: number;
  upperLimit?: number;
}

export interface AggregateProperties {
  type: string; // e.g. "Pasir Sungai Alami", "Batu Pecah Andesit"
  specificGravityDry: number; // Berat Jenis Curah Kering
  specificGravitySSD: number; // Berat Jenis SSD
  apparentSpecificGravity?: number; // Berat Jenis Semu
  absorption: number; // Penyerapan air (%)
  moistureContent: number; // Kadar air aktual (%)
  finenessModulus: number; // Modulus Kehalusan (FM)
  dryRoddedUnitWeight?: number; // Berat isi kering padat (kg/m³)
  looseUnitWeight?: number; // Berat isi lepas (kg/m³)
  maxSize?: number; // mm
  laAbrasionPercent?: number; // Keausan Los Angeles (%)
  sieveAnalysis: SieveData[];
}

export interface CementProperties {
  type: string; // e.g. "Semen Portland Tipe I", "PCC"
  specificGravity: number; // usually 3.15
  brand?: string;
  supplementaryMaterial?: string; // e.g. "Fly Ash Kelas F", "Silica Fume"
  substitutionPercent: number; // 0 - 50%
}

export interface AdmixtureProperties {
  type: string; // e.g. "Superplasticizer Tipe F", "Retarder Tipe D"
  productName: string;
  specificGravity: number; // e.g. 1.08
  dosagePercent: number; // % terhadap berat semen (0 - 3%)
  function: string;
}

export interface MixDesignParameters {
  method: ConcreteStandardMethod;
  concreteType: "Beton Normal" | "Beton Mutu Tinggi" | "Beton Serat" | "Beton Ramah Lingkungan";
  targetStrengthFc: number; // MPa at 28 days
  slumpMin: number; // mm
  slumpMax: number; // mm
  maxAggregateSize: number; // mm (e.g. 19, 25)
  designAgeDays: number; // default 28
  plannedVolumeM3: number; // Volume beton m³ (e.g. 0.05 m³ for test batch or 1.0 m³)
  airEntrained: boolean;
  airContentPercent: number; // e.g. 1.5% for non-air-entrained
  exposureCondition: "Normal" | "Lembab" | "Sulfat Sedang" | "Air Laut / Korosif";
  plannedSpecimensCount: number;
  specimenType: SpecimenShape;
  wasteFactorPercent: number; // e.g. 10%
}

export interface MixDesignResult {
  waterContentDesignKg: number; // kg/m³
  waterCementRatio: number; // fas (w/c)
  cementContentKg: number; // kg/m³
  supplementaryContentKg: number; // kg/m³
  coarseAggregateKg: number; // kg/m³ SSD
  fineAggregateKg: number; // kg/m³ SSD
  admixtureKg: number; // kg/m³
  airContentPercent: number;
  theoreticalDensityKg: number; // kg/m³
  absoluteVolumes: {
    water: number; // m³
    cement: number; // m³
    supplementary: number; // m³
    air: number; // m³
    coarseAggregate: number; // m³
    fineAggregate: number; // m³
    admixture: number; // m³
    totalVolume: number; // should be ~1.000 m³
  };
  mixRatio: string; // e.g. "1 : 1.72 : 2.45 : 0.45"
  
  // Aggregate Moisture Correction
  moistureCorrection: {
    fineAggregateWetKg: number; // berat basah yang harus ditimbang kg/m³
    coarseAggregateWetKg: number; // berat basah yang harus ditimbang kg/m³
    waterDeltaFineAggKg: number; // + memberi air ke campuran, - menyerap air
    waterDeltaCoarseAggKg: number;
    netWaterToBatchKg: number; // air yang dimasukkan ke mixer (kg/m³)
  };

  // Active Innovation Material (if selected)
  innovationMaterial?: {
    name: string;
    substitutionType: "Semen" | "Agregat Halus" | "Agregat Kasar" | "Serat / Bahan Tambah";
    dosagePercent: number;
    massKgM3: number; // kg/m³
    journalRef?: string;
    treatmentNote?: string;
  };

  // Batch scale results
  batchRequirements: {
    volumeM3: number;
    waterKg: number;
    cementKg: number;
    supplementaryKg: number;
    fineAggregateWetKg: number;
    coarseAggregateWetKg: number;
    admixtureKg: number;
    innovationKg?: number;
    innovationGrams?: number;
    totalBatchWeightKg: number;
    perSpecimenKg: number;
  };

  calculationSteps: {
    step: number;
    title: string;
    description: string;
    formula: string;
    substitution: string;
    result: string;
    standardClause: string;
  }[];

  justification: {
    parameter: string;
    chosenValue: string;
    rationale: string;
    standardReference: string;
    status: "Verified" | "Needs Review" | "Not Available";
    notes?: string;
  }[];
}

export interface ConcreteSpecimenTest {
  id: string;
  code: string; // e.g. "BN-28-01"
  mixVariant: string; // e.g. "Mix 0 (Kontrol)"
  specimenType: SpecimenShape;
  castingDate: string; // YYYY-MM-DD
  testingDate: string; // YYYY-MM-DD
  ageDays: number;
  actualDimensionMm: {
    diameterOrWidth: number;
    heightOrLength: number;
  };
  crossSectionAreaMm2: number;
  weightGrams: number;
  maxLoadKN: number; // Beban runtuh mesin tekan kN
  compressiveStrengthMPa: number; // MPa
  slumpMm?: number;
  densityKgM3?: number;
  failurePattern?: "Cone" | "Cone & Split" | "Cone & Shear" | "Shear" | "Columnar";
  notes?: string;
}

export interface InnovationVariant {
  id: string;
  code: string; // "Mix 0", "Mix 1", etc.
  name: string;
  materialName: string;
  substitutionType: "Semen" | "Agregat Halus" | "Agregat Kasar" | "Serat / Bahan Tambah";
  dosagePercent: number; // %
  predictedWorkability: string;
  predictedStrengthMpa: number;
  actualAvgStrength28Days?: number;
  pros: string;
  cons: string;
  researchRef: string;
}

export interface CylinderBatchRequirement {
  silinderCount: number; // 1, 3, or 6
  label: string; // e.g. "1 Silinder (Trial Mix)", "3 Silinder (1 Umur)", "6 Silinder (Lomba 7D & 28D)"
  batchVolumeM3: number;
  waterNetKg: number;
  cementKg: number;
  supplementaryKg: number;
  fineAggregateSSD_Kg: number;
  fineAggregateWetKg: number;
  coarseAggregateSSD_Kg: number;
  coarseAggregateWetKg: number;
  admixtureGrams: number;
  innovationGrams: number;
  totalBatchWeightKg: number;
}

export interface TorAnalysisResult {
  competitionTheme: string;
  targetStrengthFc: number | null;
  concreteType: string;
  targetSlump: string;
  maxAggregateSize: number | null;
  specimenType: string;
  specimenQuantity: number | null;
  testingAgeDays: number[];
  allowedMaterials: string[];
  admixtureRules: string;
  innovationRules: string;
  scoringCriteria: { category: string; weight: string }[];
  explicitRequirements: string[];
  inferredRequirements: string[];
  missingInformation: string[];
  clarificationQuestions: string[];
  recommendedMixDesignMethod: string;
  recommendedStrategy: string;
  variations: {
    code: string;
    name: string;
    innovation: string;
    dosage: string;
    workabilityImpact: string;
    strengthImpact: string;
    pros: string;
    cons: string;
  }[];
  relevantSNI: {
    code: string;
    title: string;
    reason: string;
  }[];
  relevantASTM?: {
    code: string;
    title: string;
    reason: string;
  }[];
  recommendedJournals: {
    title: string;
    authors: string;
    year: number;
    journal: string;
    doi: string;
    relevance: string;
  }[];
  cylinderBatches?: {
    oneCylinder: CylinderBatchRequirement;
    threeCylinders: CylinderBatchRequirement;
    sixCylinders: CylinderBatchRequirement;
  };
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  parameters: MixDesignParameters;
  cement: CementProperties;
  fineAggregate: AggregateProperties;
  coarseAggregate: AggregateProperties;
  admixture: AdmixtureProperties;
  calculationResult?: MixDesignResult;
  specimens: ConcreteSpecimenTest[];
  innovations: InnovationVariant[];
  activeInnovation?: InnovationVariant;
  torAnalysis?: TorAnalysisResult;
}

export interface StandardReference {
  code: string;
  title: string;
  year: number;
  organization: "BSN (SNI)" | "ASTM" | "ACI";
  status: "Berlaku" | "Direvisi / Terkait";
  scope: string;
  application: string;
  officialUrl?: string;
}

export interface ResearchJournal {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  materialType: string;
  dosageTested: string;
  methodology: string;
  compressiveStrengthResult: string;
  keyFindings: string;
  relevanceToConcrete: string;
  isOpenAccess: boolean;
  link?: string;
}
