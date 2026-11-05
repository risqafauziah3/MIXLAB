import React, { useState } from "react";
import { ProjectProvider } from "./context/ProjectContext";
import { Sidebar, NavTab } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { DashboardView } from "./components/dashboard/DashboardView";
import { ProjectsView } from "./components/projects/ProjectsView";
import { TorAdvisorView } from "./components/tor/TorAdvisorView";
import { MixDesignView } from "./components/mixdesign/MixDesignView";
import { MaterialLabView } from "./components/laboratory/MaterialLabView";
import { StrengthPredictorView } from "./components/predictor/StrengthPredictorView";
import { TestingEvaluationView } from "./components/testing/TestingEvaluationView";
import { InnovationLabView } from "./components/innovation/InnovationLabView";
import { ResearchStandardsView } from "./components/knowledge/ResearchStandardsView";
import { AiAssistantView } from "./components/assistant/AiAssistantView";
import { ReportsExportView } from "./components/reports/ReportsExportView";
import { CreateProjectModal } from "./components/projects/CreateProjectModal";

function AppContent() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateTab={setCurrentTab}
          onOpenCreateProjectModal={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === "dashboard" && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onOpenCreateProjectModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentTab === "projects" && (
            <ProjectsView
              onNavigateTab={setCurrentTab}
              onOpenCreateProjectModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentTab === "tor" && <TorAdvisorView onNavigateTab={setCurrentTab} />}

          {currentTab === "mixdesign" && <MixDesignView />}

          {currentTab === "laboratory" && <MaterialLabView />}

          {currentTab === "predictor" && <StrengthPredictorView />}

          {currentTab === "testing" && <TestingEvaluationView />}

          {currentTab === "innovation" && <InnovationLabView />}

          {currentTab === "research" && <ResearchStandardsView />}

          {currentTab === "assistant" && <AiAssistantView />}

          {currentTab === "reports" && <ReportsExportView />}
        </main>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccessNavigate={() => setCurrentTab("mixdesign")}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
