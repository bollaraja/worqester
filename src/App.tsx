import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { DashboardView } from "./views/DashboardView";
import { CrmView } from "./views/CrmView";
import { ProjectsView } from "./views/ProjectsView";
import { TasksView } from "./views/TasksView";
import { HrmView } from "./views/HrmView";
import { TeamWorkloadView } from "./views/TeamWorkloadView";
import { DocumentsView } from "./views/DocumentsView";
import { NotesView } from "./views/NotesView";
import { ReportsView } from "./views/ReportsView";
import { AiIntelligenceView } from "./views/AiIntelligenceView";
import { SettingsView } from "./views/SettingsView";
import { AuthView } from "./views/AuthView";
import { GlobalCreateModal } from "./components/modals/GlobalCreateModal";
import { CommandPalette } from "./components/modals/CommandPalette";
import { AiAssistantDrawer } from "./components/ai/AiAssistantDrawer";
import { AiOperationsAuditModal } from "./components/ai/AiOperationsAuditModal";

const AppContent: React.FC = () => {
  const { currentView, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === "dashboard" && <DashboardView />}
            {currentView === "crm" && <CrmView />}
            {currentView === "projects" && <ProjectsView />}
            {currentView === "tasks" && <TasksView />}
            {currentView === "hrm" && <HrmView />}
            {currentView === "workload" && <TeamWorkloadView />}
            {currentView === "documents" && <DocumentsView />}
            {currentView === "notes" && <NotesView />}
            {currentView === "reports" && <ReportsView />}
            {currentView === "ai" && <AiIntelligenceView />}
            {currentView === "settings" && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <GlobalCreateModal />
      <CommandPalette />
      <AiAssistantDrawer />
      <AiOperationsAuditModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
