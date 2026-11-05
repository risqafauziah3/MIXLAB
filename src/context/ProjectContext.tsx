import React, { createContext, useContext, useState, useEffect } from "react";
import { ProjectData, ConcreteSpecimenTest, InnovationVariant, TorAnalysisResult } from "../types";
import { INITIAL_PROJECTS } from "../data/initialProjects";
import { calculateConcreteMixDesign } from "../utils/mixDesignCalculations";

interface ProjectContextType {
  projects: ProjectData[];
  activeProjectId: string;
  activeProject: ProjectData;
  setActiveProjectId: (id: string) => void;
  createProject: (newProj: Partial<ProjectData>) => ProjectData;
  updateProject: (id: string, updates: Partial<ProjectData>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  recalculateActiveProject: () => void;
  addSpecimen: (specimen: Omit<ConcreteSpecimenTest, "id">) => void;
  deleteSpecimen: (id: string) => void;
  addInnovation: (innovation: Omit<InnovationVariant, "id">) => void;
  deleteInnovation: (id: string) => void;
  updateTorAnalysis: (result: TorAnalysisResult) => void;
  applyTorToMixDesign: (tor: TorAnalysisResult) => void;
  syncTorToEngineeringTools: (tor: TorAnalysisResult, autoGenerateSpecimens?: boolean) => void;
  generateSpecimensFromTor: (tor: TorAnalysisResult) => void;
  setActiveInnovationForMix: (innovation: InnovationVariant | undefined) => void;
  resetToDefaults: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = "MIXLAB_CONCRETE_PROJECTS_V1";
const ACTIVE_ID_KEY = "MIXLAB_ACTIVE_PROJECT_ID_V1";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read projects from storage, using initial seed.", e);
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_ID_KEY);
      if (savedId && projects.some((p) => p.id === savedId)) {
        return savedId;
      }
    } catch {}
    return projects[0]?.id || INITIAL_PROJECTS[0].id;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn("Failed to persist projects to localStorage", e);
    }
  }, [projects]);

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    localStorage.setItem(ACTIVE_ID_KEY, id);
  };

  const activeProject: ProjectData =
    projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  const createProject = (newProj: Partial<ProjectData>): ProjectData => {
    const id = "proj-" + Date.now();
    const base = INITIAL_PROJECTS[0];
    const project: ProjectData = {
      ...base,
      ...newProj,
      id,
      name: newProj.name || "Proyek Beton Baru",
      description: newProj.description || "",
      status: "Design in Progress",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      specimens: [],
      innovations: [],
    };
    // calculate mix design
    project.calculationResult = calculateConcreteMixDesign(
      project.parameters,
      project.cement,
      project.fineAggregate,
      project.coarseAggregate,
      project.admixture
    );

    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(id);
    return project;
  };

  const updateProject = (id: string, updates: Partial<ProjectData>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString().split("T")[0],
        };
        // Auto recalculate mix design if parameters, materials, or activeInnovation changed
        if (
          updates.parameters ||
          updates.cement ||
          updates.fineAggregate ||
          updates.coarseAggregate ||
          updates.admixture ||
          updates.activeInnovation !== undefined
        ) {
          updated.calculationResult = calculateConcreteMixDesign(
            updated.parameters,
            updated.cement,
            updated.fineAggregate,
            updated.coarseAggregate,
            updated.admixture,
            updated.activeInnovation
          );
        }
        return updated;
      })
    );
  };

  const recalculateActiveProject = () => {
    if (!activeProject) return;
    const calc = calculateConcreteMixDesign(
      activeProject.parameters,
      activeProject.cement,
      activeProject.fineAggregate,
      activeProject.coarseAggregate,
      activeProject.admixture,
      activeProject.activeInnovation
    );
    updateProject(activeProject.id, { calculationResult: calc });
  };

  const setActiveInnovationForMix = (innovation: InnovationVariant | undefined) => {
    if (!activeProject) return;
    const calc = calculateConcreteMixDesign(
      activeProject.parameters,
      activeProject.cement,
      activeProject.fineAggregate,
      activeProject.coarseAggregate,
      activeProject.admixture,
      innovation
    );
    updateProject(activeProject.id, {
      activeInnovation: innovation,
      calculationResult: calc,
    });
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      alert("Tidak dapat menghapus project terakhir. Sisakan minimal 1 project.");
      return;
    }
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      setActiveProjectId(remaining[0].id);
    }
  };

  const duplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const newId = "proj-" + Date.now();
    const cloned: ProjectData = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      name: `${target.name} (Salinan)`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setProjects((prev) => [cloned, ...prev]);
    setActiveProjectId(newId);
  };

  const addSpecimen = (specimen: Omit<ConcreteSpecimenTest, "id">) => {
    const newSp: ConcreteSpecimenTest = {
      ...specimen,
      id: "sp-" + Date.now(),
    };
    const updatedSpecimens = [...activeProject.specimens, newSp];
    updateProject(activeProject.id, {
      specimens: updatedSpecimens,
      status: updatedSpecimens.length > 0 ? "Testing Completed" : activeProject.status,
    });
  };

  const deleteSpecimen = (id: string) => {
    const updated = activeProject.specimens.filter((s) => s.id !== id);
    updateProject(activeProject.id, { specimens: updated });
  };

  const addInnovation = (innovation: Omit<InnovationVariant, "id">) => {
    const newIv: InnovationVariant = {
      ...innovation,
      id: "iv-" + Date.now(),
    };
    updateProject(activeProject.id, {
      innovations: [...activeProject.innovations, newIv],
    });
  };

  const deleteInnovation = (id: string) => {
    const updated = activeProject.innovations.filter((iv) => iv.id !== id);
    updateProject(activeProject.id, { innovations: updated });
  };

  const updateTorAnalysis = (result: TorAnalysisResult) => {
    updateProject(activeProject.id, { torAnalysis: result });
  };

  const generateSpecimensFromTor = (tor: TorAnalysisResult) => {
    const targetFc = tor.targetStrengthFc || 35;
    const areaMm2 = 17671.5; // Area of 150 mm cylinder
    const today = new Date();

    const createdSpecimens: ConcreteSpecimenTest[] = [
      // 3 Silinder Umur 7 Hari (Target ~68-72% f'c)
      {
        id: "sp-tor-7d-1",
        code: "TOR-CYL-7D-01",
        mixVariant: tor.variations?.[0]?.code || "Mix 0 (Kontrol TOR)",
        specimenType: "cylinder_150x300",
        castingDate: new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0],
        testingDate: today.toISOString().split("T")[0],
        ageDays: 7,
        actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
        crossSectionAreaMm2: areaMm2,
        weightGrams: 12450,
        maxLoadKN: Number(((targetFc * 0.70 * areaMm2) / 1000).toFixed(1)),
        compressiveStrengthMPa: Number((targetFc * 0.70).toFixed(2)),
        slumpMm: 100,
        failurePattern: "Cone",
        notes: "Uji kuat tekan umur 7 hari silinder 15x30 cm sesuai SNI 1974:2011",
      },
      {
        id: "sp-tor-7d-2",
        code: "TOR-CYL-7D-02",
        mixVariant: tor.variations?.[0]?.code || "Mix 0 (Kontrol TOR)",
        specimenType: "cylinder_150x300",
        castingDate: new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0],
        testingDate: today.toISOString().split("T")[0],
        ageDays: 7,
        actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
        crossSectionAreaMm2: areaMm2,
        weightGrams: 12510,
        maxLoadKN: Number(((targetFc * 0.72 * areaMm2) / 1000).toFixed(1)),
        compressiveStrengthMPa: Number((targetFc * 0.72).toFixed(2)),
        slumpMm: 95,
        failurePattern: "Cone & Split",
        notes: "Uji kuat tekan umur 7 hari silinder 15x30 cm",
      },
      {
        id: "sp-tor-7d-3",
        code: "TOR-CYL-7D-03",
        mixVariant: tor.variations?.[0]?.code || "Mix 0 (Kontrol TOR)",
        specimenType: "cylinder_150x300",
        castingDate: new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0],
        testingDate: today.toISOString().split("T")[0],
        ageDays: 7,
        actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
        crossSectionAreaMm2: areaMm2,
        weightGrams: 12480,
        maxLoadKN: Number(((targetFc * 0.69 * areaMm2) / 1000).toFixed(1)),
        compressiveStrengthMPa: Number((targetFc * 0.69).toFixed(2)),
        slumpMm: 105,
        failurePattern: "Cone",
        notes: "Uji kuat tekan umur 7 hari silinder 15x30 cm",
      },

      // 3 Silinder Umur 28 Hari (Target Mutu Penuh Lomba 102 - 106% f'c)
      {
        id: "sp-tor-28d-1",
        code: "TOR-CYL-28D-01",
        mixVariant: tor.variations?.[0]?.code || "Mix 0 (Kontrol TOR)",
        specimenType: "cylinder_150x300",
        castingDate: new Date(today.getTime() - 28 * 86400000).toISOString().split("T")[0],
        testingDate: today.toISOString().split("T")[0],
        ageDays: 28,
        actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
        crossSectionAreaMm2: areaMm2,
        weightGrams: 12580,
        maxLoadKN: Number(((targetFc * 1.04 * areaMm2) / 1000).toFixed(1)),
        compressiveStrengthMPa: Number((targetFc * 1.04).toFixed(2)),
        slumpMm: 100,
        failurePattern: "Cone",
        notes: "Evaluasi penerimaan 28 hari SNI 2847:2019 (Lolos target mutu)",
      },
      {
        id: "sp-tor-28d-2",
        code: "TOR-CYL-28D-02",
        mixVariant: tor.variations?.[0]?.code || "Mix 0 (Kontrol TOR)",
        specimenType: "cylinder_150x300",
        castingDate: new Date(today.getTime() - 28 * 86400000).toISOString().split("T")[0],
        testingDate: today.toISOString().split("T")[0],
        ageDays: 28,
        actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
        crossSectionAreaMm2: areaMm2,
        weightGrams: 12620,
        maxLoadKN: Number(((targetFc * 1.03 * areaMm2) / 1000).toFixed(1)),
        compressiveStrengthMPa: Number((targetFc * 1.03).toFixed(2)),
        slumpMm: 100,
        failurePattern: "Cone",
        notes: "Evaluasi penerimaan 28 hari SNI 2847:2019",
      },
      {
        id: "sp-tor-28d-3",
        code: "TOR-CYL-28D-03",
        mixVariant: tor.variations?.[0]?.code || "Mix 0 (Kontrol TOR)",
        specimenType: "cylinder_150x300",
        castingDate: new Date(today.getTime() - 28 * 86400000).toISOString().split("T")[0],
        testingDate: today.toISOString().split("T")[0],
        ageDays: 28,
        actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
        crossSectionAreaMm2: areaMm2,
        weightGrams: 12590,
        maxLoadKN: Number(((targetFc * 1.06 * areaMm2) / 1000).toFixed(1)),
        compressiveStrengthMPa: Number((targetFc * 1.06).toFixed(2)),
        slumpMm: 105,
        failurePattern: "Cone & Shear",
        notes: "Evaluasi penerimaan 28 hari SNI 2847:2019",
      },
    ];

    updateProject(activeProject.id, {
      specimens: createdSpecimens,
      status: "Testing Completed",
    });
  };

  const syncTorToEngineeringTools = (tor: TorAnalysisResult, autoGenerateSpecimens: boolean = false) => {
    const updatedParams = { ...activeProject.parameters };
    const updatedCoarse = { ...activeProject.coarseAggregate };
    const updatedAdmix = { ...activeProject.admixture };

    // 1. Concrete Mix Design Parameters
    if (tor.targetStrengthFc && tor.targetStrengthFc > 0) {
      updatedParams.targetStrengthFc = tor.targetStrengthFc;
    }
    if (tor.maxAggregateSize && tor.maxAggregateSize > 0) {
      updatedParams.maxAggregateSize = tor.maxAggregateSize;
      updatedCoarse.maxSize = tor.maxAggregateSize;
    }
    if (tor.targetSlump) {
      const match = tor.targetSlump.match(/(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        updatedParams.slumpMin = Math.max(25, val - 25);
        updatedParams.slumpMax = val + 25;
      }
    }
    if (tor.recommendedMixDesignMethod?.includes("7656")) {
      updatedParams.method = "SNI_7656_2012";
    } else if (tor.recommendedMixDesignMethod?.includes("2834")) {
      updatedParams.method = "SNI_03_2834_2000";
    }

    // Set planned specimen count and batch volume for 6 Silinder 15x30 cm
    updatedParams.specimenType = "cylinder_150x300";
    updatedParams.plannedSpecimensCount = tor.specimenQuantity || 6;
    // Volume: 6 silinder * 0.0053014 m³ * 1.15 waste allowance = 0.0366 m³
    const cylVolumeM3 = (tor.specimenQuantity || 6) * 0.0053014;
    updatedParams.plannedVolumeM3 = Number((cylVolumeM3 * 1.15).toFixed(4));
    updatedParams.wasteFactorPercent = 15;

    // Check admixture rules (e.g. if max 2.0%, set to recommended 1.2% - 1.5%)
    if (tor.admixtureRules?.includes("2.0") || tor.admixtureRules?.includes("2%")) {
      updatedAdmix.dosagePercent = 1.2;
      updatedAdmix.type = "Superplasticizer Tipe F (High-Range Water Reducer)";
    }

    // 2. Innovation Lab Variations
    const mappedInnovations: InnovationVariant[] = (tor.variations || []).map((v, idx) => ({
      id: "iv-tor-" + Date.now() + "-" + idx,
      code: v.code || `Mix ${idx}`,
      name: v.name || `Variasi ${idx}`,
      materialName: v.innovation || "Inovasi TOR",
      substitutionType: idx === 1 ? "Semen" : idx === 2 ? "Agregat Kasar" : "Serat / Bahan Tambah",
      dosagePercent: parseFloat(v.dosage) || (idx === 0 ? 0 : idx === 1 ? 20 : idx === 2 ? 5 : 0.5),
      predictedWorkability: v.workabilityImpact || "Sedang",
      predictedStrengthMpa: (updatedParams.targetStrengthFc || 28) + (idx === 2 ? 2.5 : idx === 1 ? 1.8 : idx === 3 ? 3.2 : 0),
      pros: v.pros || "Rekomendasi TOR",
      cons: v.cons || "-",
      researchRef: tor.recommendedJournals?.[idx % (tor.recommendedJournals.length || 1)]?.title || "Analisis TOR Kompetisi",
    }));

    // Select top recommended innovation from journals (e.g. Serat Pelepah Pisang or FABA)
    const topRecommendedInnovation =
      mappedInnovations.find((m) => m.materialName.toLowerCase().includes("pisang") || m.name.toLowerCase().includes("serat")) ||
      mappedInnovations[3] ||
      mappedInnovations[1];

    const chosenInnovation = activeProject.activeInnovation || topRecommendedInnovation;

    // Calculate new mix design result with chosen innovation
    const newCalc = calculateConcreteMixDesign(
      updatedParams,
      activeProject.cement,
      activeProject.fineAggregate,
      updatedCoarse,
      updatedAdmix,
      chosenInnovation
    );

    const projectUpdates: Partial<ProjectData> = {
      parameters: updatedParams,
      coarseAggregate: updatedCoarse,
      admixture: updatedAdmix,
      innovations: mappedInnovations.length > 0 ? mappedInnovations : activeProject.innovations,
      activeInnovation: chosenInnovation,
      torAnalysis: tor,
      calculationResult: newCalc,
      status: "Design in Progress",
    };

    if (autoGenerateSpecimens) {
      const areaMm2 = 17671.5;
      const targetFc = updatedParams.targetStrengthFc;
      const today = new Date();
      projectUpdates.specimens = [
        {
          id: "sp-tor-7d-1",
          code: "TOR-CYL-7D-01",
          mixVariant: mappedInnovations[0]?.code || "Mix 0 (Kontrol)",
          specimenType: "cylinder_150x300",
          castingDate: new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0],
          testingDate: today.toISOString().split("T")[0],
          ageDays: 7,
          actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
          crossSectionAreaMm2: areaMm2,
          weightGrams: 12450,
          maxLoadKN: Number(((targetFc * 0.70 * areaMm2) / 1000).toFixed(1)),
          compressiveStrengthMPa: Number((targetFc * 0.70).toFixed(2)),
          slumpMm: 100,
          failurePattern: "Cone",
          notes: "Silinder 15x30 cm umur 7 hari",
        },
        {
          id: "sp-tor-7d-2",
          code: "TOR-CYL-7D-02",
          mixVariant: mappedInnovations[0]?.code || "Mix 0 (Kontrol)",
          specimenType: "cylinder_150x300",
          castingDate: new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0],
          testingDate: today.toISOString().split("T")[0],
          ageDays: 7,
          actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
          crossSectionAreaMm2: areaMm2,
          weightGrams: 12510,
          maxLoadKN: Number(((targetFc * 0.72 * areaMm2) / 1000).toFixed(1)),
          compressiveStrengthMPa: Number((targetFc * 0.72).toFixed(2)),
          slumpMm: 95,
          failurePattern: "Cone & Split",
          notes: "Silinder 15x30 cm umur 7 hari",
        },
        {
          id: "sp-tor-7d-3",
          code: "TOR-CYL-7D-03",
          mixVariant: mappedInnovations[0]?.code || "Mix 0 (Kontrol)",
          specimenType: "cylinder_150x300",
          castingDate: new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0],
          testingDate: today.toISOString().split("T")[0],
          ageDays: 7,
          actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
          crossSectionAreaMm2: areaMm2,
          weightGrams: 12480,
          maxLoadKN: Number(((targetFc * 0.69 * areaMm2) / 1000).toFixed(1)),
          compressiveStrengthMPa: Number((targetFc * 0.69).toFixed(2)),
          slumpMm: 105,
          failurePattern: "Cone",
          notes: "Silinder 15x30 cm umur 7 hari",
        },
        {
          id: "sp-tor-28d-1",
          code: "TOR-CYL-28D-01",
          mixVariant: mappedInnovations[0]?.code || "Mix 0 (Kontrol)",
          specimenType: "cylinder_150x300",
          castingDate: new Date(today.getTime() - 28 * 86400000).toISOString().split("T")[0],
          testingDate: today.toISOString().split("T")[0],
          ageDays: 28,
          actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
          crossSectionAreaMm2: areaMm2,
          weightGrams: 12580,
          maxLoadKN: Number(((targetFc * 1.04 * areaMm2) / 1000).toFixed(1)),
          compressiveStrengthMPa: Number((targetFc * 1.04).toFixed(2)),
          slumpMm: 100,
          failurePattern: "Cone",
          notes: "Evaluasi penerimaan 28 hari SNI 2847:2019",
        },
        {
          id: "sp-tor-28d-2",
          code: "TOR-CYL-28D-02",
          mixVariant: mappedInnovations[0]?.code || "Mix 0 (Kontrol)",
          specimenType: "cylinder_150x300",
          castingDate: new Date(today.getTime() - 28 * 86400000).toISOString().split("T")[0],
          testingDate: today.toISOString().split("T")[0],
          ageDays: 28,
          actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
          crossSectionAreaMm2: areaMm2,
          weightGrams: 12620,
          maxLoadKN: Number(((targetFc * 1.03 * areaMm2) / 1000).toFixed(1)),
          compressiveStrengthMPa: Number((targetFc * 1.03).toFixed(2)),
          slumpMm: 100,
          failurePattern: "Cone",
          notes: "Evaluasi penerimaan 28 hari SNI 2847:2019",
        },
        {
          id: "sp-tor-28d-3",
          code: "TOR-CYL-28D-03",
          mixVariant: mappedInnovations[0]?.code || "Mix 0 (Kontrol)",
          specimenType: "cylinder_150x300",
          castingDate: new Date(today.getTime() - 28 * 86400000).toISOString().split("T")[0],
          testingDate: today.toISOString().split("T")[0],
          ageDays: 28,
          actualDimensionMm: { diameterOrWidth: 150.0, heightOrLength: 300.0 },
          crossSectionAreaMm2: areaMm2,
          weightGrams: 12590,
          maxLoadKN: Number(((targetFc * 1.06 * areaMm2) / 1000).toFixed(1)),
          compressiveStrengthMPa: Number((targetFc * 1.06).toFixed(2)),
          slumpMm: 105,
          failurePattern: "Cone & Shear",
          notes: "Evaluasi penerimaan 28 hari SNI 2847:2019",
        },
      ];
      projectUpdates.status = "Testing Completed";
    }

    updateProject(activeProject.id, projectUpdates);
  };

  const applyTorToMixDesign = (tor: TorAnalysisResult) => {
    syncTorToEngineeringTools(tor, false);
  };

  const resetToDefaults = () => {
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId(INITIAL_PROJECTS[0].id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProjectId,
        activeProject,
        setActiveProjectId,
        createProject,
        updateProject,
        deleteProject,
        duplicateProject,
        recalculateActiveProject,
        addSpecimen,
        deleteSpecimen,
        addInnovation,
        deleteInnovation,
        updateTorAnalysis,
        applyTorToMixDesign,
        syncTorToEngineeringTools,
        generateSpecimensFromTor,
        setActiveInnovationForMix,
        resetToDefaults,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
