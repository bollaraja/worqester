import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Settings,
  Shield,
  Layers,
  Database,
  History,
  Check,
  RotateCcw,
  Download,
  AlertTriangle,
  Building,
} from "lucide-react";
import { Role } from "../types";

export const SettingsView: React.FC = () => {
  const {
    currentSubView,
    navigateTo,
    settings,
    updateSettings,
    auditLogs,
    resetToDemoData,
    currentUser,
  } = useApp();

  const activeSubView = currentSubView || "general";

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      tagline,
      currency,
      currencySymbol,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleModule = (modKey: keyof typeof settings.modulesEnabled) => {
    updateSettings({
      modulesEnabled: {
        ...settings.modulesEnabled,
        [modKey]: !settings.modulesEnabled[modKey],
      },
    });
  };

  const exportSystemJson = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      app: "Worqester",
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worqester-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs border-b border-slate-800 pb-4">
        {[
          { id: "general", label: "Organization Profile", icon: Building },
          { id: "modules", label: "Active Modules", icon: Layers },
          { id: "rbac", label: "RBAC Security Matrix", icon: Shield },
          { id: "audit", label: "Audit Trail Logs", icon: History },
          { id: "data", label: "Data & Persistence", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo("settings", tab.id)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubView === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW: GENERAL SETTINGS */}
      {activeSubView === "general" && (
        <div className="max-w-2xl space-y-6">
          <form
            onSubmit={handleSaveGeneral}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-4 text-xs"
          >
            <div>
              <h3 className="text-sm font-bold text-white">Enterprise Organization Profile</h3>
              <p className="text-xs text-slate-400">
                Configure primary identity, reporting currency, and corporate metadata
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check size={16} />
                <span>Organization settings updated successfully!</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Company / Enterprise Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Corporate Tagline / Descriptor</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Reporting Currency Code</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    if (e.target.value === "INR") setCurrencySymbol("₹");
                    if (e.target.value === "USD") setCurrencySymbol("$");
                    if (e.target.value === "EUR") setCurrencySymbol("€");
                    if (e.target.value === "GBP") setCurrencySymbol("£");
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="INR">INR (Indian Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: MODULE TOGGLES */}
      {activeSubView === "modules" && (
        <div className="max-w-2xl space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Installed Platform Modules</h3>
              <p className="text-xs text-slate-400">
                Enable or disable operational modules based on organization maturity
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: "crm" as const, name: "Customer Relationship Management (CRM)", desc: "Deals, leads pipeline, company accounts, customer 360" },
                { key: "hrm" as const, name: "Human Resource Management (HRM)", desc: "Employee directory, attendance, leaves, recruitment ATS" },
                { key: "projects" as const, name: "Project Management & Roadmaps", desc: "Initiatives, milestone tracking, budget burn" },
                { key: "tasks" as const, name: "Task Execution & Kanban", desc: "Interactive sprint boards, SLA compliance, time tracking" },
                { key: "ai" as const, name: "Worqester AI & Automations", desc: "Autonomous briefings, smart priority, operations audits" },
              ].map((mod) => (
                <div
                  key={mod.key}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-white text-xs">{mod.name}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">{mod.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleModule(mod.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                      settings.modulesEnabled[mod.key]
                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {settings.modulesEnabled[mod.key] ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: RBAC SECURITY MATRIX */}
      {activeSubView === "rbac" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Matrix</h3>
              <p className="text-xs text-slate-400">
                Simulated permissions and security boundaries across enterprise user roles
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Permission Capability</th>
                    <th className="pb-3 text-center">Super Admin</th>
                    <th className="pb-3 text-center">Executive</th>
                    <th className="pb-3 text-center">Project Manager</th>
                    <th className="pb-3 text-center">Employee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { capability: "View Enterprise Dashboard & KPIs", roles: [true, true, true, true] },
                    { capability: "Create & Edit CRM Deals / Accounts", roles: [true, true, true, false] },
                    { capability: "Manage Employee Profiles & Salaries", roles: [true, false, false, false] },
                    { capability: "Approve / Reject Leave Requests", roles: [true, true, true, false] },
                    { capability: "Manage Project Budgets & Roadmaps", roles: [true, true, true, false] },
                    { capability: "Execute AI Operations Audit", roles: [true, true, true, false] },
                    { capability: "Mark Personal Daily Attendance", roles: [true, true, true, true] },
                    { capability: "Access Organization System Settings", roles: [true, false, false, false] },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 font-medium text-white">{row.capability}</td>
                      {row.roles.map((granted, rIdx) => (
                        <td key={rIdx} className="py-3 text-center">
                          {granted ? (
                            <span className="inline-block w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-center leading-4 font-bold text-[10px]">
                              ✓
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: AUDIT TRAIL LOGS */}
      {activeSubView === "audit" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">System Security & Audit Trail</h3>
                <p className="text-xs text-slate-400">
                  Immutable log of all user CRUD operations, stage changes, and administrative actions
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {auditLogs.length} Total Events
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{log.userName}</span>
                      <span className="text-slate-500 font-sans">({log.userRole})</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10">
                        {log.action}
                      </span>
                      <span className="text-slate-300">{log.entityType}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DATA & PERSISTENCE */}
      {activeSubView === "data" && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Data Management & Persistence</h3>
              <p className="text-xs text-slate-400">
                LocalStorage engine initialized with reactive state synchronization
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Full JSON Export</h4>
                <p className="text-slate-400 text-[11px]">Download all records, pipeline deals, and employees</p>
              </div>
              <button
                type="button"
                onClick={exportSystemJson}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-rose-400">Reset Demo Database</h4>
                <p className="text-slate-400 text-[11px]">
                  Clear customized changes and reload the rich default enterprise seed datasets
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset Worqester to default enterprise demo data?")) {
                    resetToDemoData();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
