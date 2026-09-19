import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { KpiCard } from "../components/common/KpiCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { PriorityBadge } from "../components/common/PriorityBadge";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  DollarSign,
  Briefcase,
  FolderKanban,
  CheckSquare,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  Activity,
  CheckCircle2,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const pipelineTrendData = [
  { month: "Apr", revenue: 4200000, pipeline: 12000000 },
  { month: "May", revenue: 5800000, pipeline: 14500000 },
  { month: "Jun", revenue: 7100000, pipeline: 18000000 },
  { month: "Jul", revenue: 6400000, pipeline: 19500000 },
  { month: "Aug", revenue: 8900000, pipeline: 22000000 },
  { month: "Sep", revenue: 11400000, pipeline: 26500000 },
];

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e"];

type RangePreset = "today" | "7d" | "30d" | "quarter" | "ytd" | "all";

export const DashboardView: React.FC = () => {
  const {
    kpis,
    projects,
    tasks,
    deals,
    leads,
    employees,
    activities,
    settings,
    navigateTo,
    openCreateModal,
    setIsAiAssistantOpen,
    setIsAiAuditOpen,
    checkInCurrentUser,
    currentUser,
    attendance,
  } = useApp();

  const [rangePreset, setRangePreset] = useState<RangePreset>("30d");
  const [startDate, setStartDate] = useState("2026-08-20");
  const [endDate, setEndDate] = useState("2026-09-19");

  const handlePresetChange = (preset: RangePreset) => {
    setRangePreset(preset);
    const today = "2026-09-19";
    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "7d") {
      setStartDate("2026-09-12");
      setEndDate(today);
    } else if (preset === "30d") {
      setStartDate("2026-08-20");
      setEndDate(today);
    } else if (preset === "quarter") {
      setStartDate("2026-07-01");
      setEndDate(today);
    } else if (preset === "ytd") {
      setStartDate("2026-01-01");
      setEndDate(today);
    } else if (preset === "all") {
      setStartDate("2025-01-01");
      setEndDate("2026-12-31");
    }
  };

  const periodDeals = useMemo(() => {
    return deals.filter((d) => {
      const dt = d.expectedCloseDate || "";
      if (startDate && dt && dt < startDate) return false;
      if (endDate && dt && dt > endDate) return false;
      return true;
    });
  }, [deals, startDate, endDate]);

  const periodTasks = useMemo(() => {
    return tasks.filter((t) => {
      const dt = t.dueDate || "";
      if (startDate && dt && dt < startDate) return false;
      if (endDate && dt && dt > endDate) return false;
      return true;
    });
  }, [tasks, startDate, endDate]);

  const periodWonRevenue = useMemo(() => {
    const val = periodDeals
      .filter((d) => d.stage === "Closed Won")
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return val > 0 ? val : kpis.wonRevenue;
  }, [periodDeals, kpis.wonRevenue]);

  const periodPipelineValue = useMemo(() => {
    const val = periodDeals
      .filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost")
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return val > 0 ? val : kpis.pipelineValue;
  }, [periodDeals, kpis.pipelineValue]);

  const periodOverdueTasks = useMemo(() => {
    const count = periodTasks.filter(
      (t) => t.status !== "Done" && (t.slaBreached || (t.dueDate && t.dueDate < "2026-09-19"))
    ).length;
    return count > 0 ? count : kpis.overdueTasks;
  }, [periodTasks, kpis.overdueTasks]);

  const userAttendedToday = attendance.some(
    (a) => a.employeeName === currentUser.name && a.status === "Present"
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <span>Executive Business Command Center</span>
            <span>•</span>
            <span className="font-mono text-slate-400">Worqester Cloud Core</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry for {settings.companyName}: {kpis.activeProjects} active projects,{" "}
            {periodDeals.length} sales opportunities, and {kpis.totalEmployees} team members.
          </p>
        </div>

        {/* Right Section: Time Filter Presets on Top + Quick Action Buttons */}
        <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
          {/* Time Filter Presets Bar */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1 text-slate-500 px-2 py-0.5 text-[11px] font-medium border-r border-slate-200">
              <Calendar size={13} className="text-blue-600" />
              <span>Timeframe:</span>
            </div>
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "quarter", label: "QTD" },
              { id: "ytd", label: "YTD" },
              { id: "all", label: "All Time" },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                  rangePreset === preset.id
                    ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            {!userAttendedToday ? (
              <button
                type="button"
                onClick={checkInCurrentUser}
                className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock size={14} className="text-emerald-600" />
                <span>Mark Today's Check-In</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Checked In (Active)</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => openCreateModal("task")}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAiAssistantOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span>AI Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        <KpiCard
          title="Open Pipeline Value"
          value={formatCurrency(periodPipelineValue, settings.currency, settings.currencySymbol)}
          change="+18.4%"
          trend="up"
          comparisonPeriod={rangePreset === "all" ? "cumulative total" : `for ${rangePreset.toUpperCase()} window`}
          icon={<DollarSign size={18} />}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          onClick={() => navigateTo("crm", "pipeline")}
        />

        <KpiCard
          title="Won Revenue"
          value={formatCurrency(periodWonRevenue, settings.currency, settings.currencySymbol)}
          change="+24.2%"
          trend="up"
          comparisonPeriod={rangePreset === "all" ? "all-time booked" : `${rangePreset.toUpperCase()} booked`}
          icon={<Briefcase size={18} />}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          onClick={() => navigateTo("crm", "deals")}
        />

        <KpiCard
          title="Active Projects"
          value={kpis.activeProjects}
          subValue={`(${kpis.projectsAtRisk} At Risk)`}
          change={kpis.projectsAtRisk > 0 ? `${kpis.projectsAtRisk} Need Attention` : "100% on track"}
          trend={kpis.projectsAtRisk > 0 ? "down" : "up"}
          comparisonPeriod=""
          icon={<FolderKanban size={18} />}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
          onClick={() => navigateTo("projects", "all")}
        />

        <KpiCard
          title="Overdue Tasks"
          value={periodOverdueTasks}
          subValue={periodTasks.length > 0 ? `of ${periodTasks.length} in period` : `of ${tasks.length} total`}
          change={periodOverdueTasks > 0 ? "SLA Breached" : "All SLA Clear"}
          trend={periodOverdueTasks > 0 ? "down" : "up"}
          comparisonPeriod=""
          icon={<CheckSquare size={18} />}
          iconBg="bg-rose-50 text-rose-600 border-rose-100"
          onClick={() => navigateTo("tasks", "all")}
        />

        <KpiCard
          title="Total Headcount"
          value={kpis.totalEmployees}
          subValue={`${kpis.attendanceToday} In Office`}
          change="+3 Hired"
          trend="up"
          comparisonPeriod="this quarter"
          icon={<Users size={18} />}
          iconBg="bg-indigo-50 text-indigo-600 border-indigo-100"
          onClick={() => navigateTo("hrm", "employees")}
        />

        <KpiCard
          title="Health Score"
          value={`${kpis.businessHealthScore}/100`}
          change={kpis.businessHealthStatus}
          trend={kpis.businessHealthScore >= 80 ? "up" : "down"}
          comparisonPeriod="Stability Index"
          icon={<ShieldCheck size={18} />}
          iconBg={
            kpis.businessHealthScore >= 80
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-amber-50 text-amber-600 border-amber-100"
          }
          onClick={() => setIsAiAuditOpen(true)}
        />
      </div>

      {/* Main Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity & Sales Trend */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Enterprise Revenue Velocity & Pipeline Growth
              </h3>
              <p className="text-xs text-slate-500">
                Monthly closed revenue compared with expanding deal pipeline (in INR)
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo("reports")}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 100000}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    color: "#0f172a",
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                />
                <Area
                  type="monotone"
                  dataKey="pipeline"
                  name="Pipeline"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#pipelineGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Closed Revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="font-medium">Total Pipeline (₹2.65 Cr)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="font-medium">Closed Realized (₹1.14 Cr)</span>
            </div>
          </div>
        </div>

        {/* Project Health & Milestone Burn */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Project Portfolio Health
              </h3>
              <p className="text-xs text-slate-500">Real-time status & budget utilization</p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo("projects", "all")}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5 flex-1">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => navigateTo("projects", "all")}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[11px] text-blue-600 font-bold">
                      {p.code}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                  </div>
                  <StatusBadge status={p.health} size="sm" />
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.health === "Critical"
                        ? "bg-rose-500"
                        : p.health === "At Risk"
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{p.progress}% Completed</span>
                  <span>
                    Spent: ₹{(p.spent / 100000).toFixed(1)}L / ₹{(p.budget / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Portfolio Value</span>
            <span className="font-bold text-slate-900 font-mono">
              ₹{(projects.reduce((s, p) => s + p.budget, 0) / 10000000).toFixed(2)} Cr
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Critical Action Items & Enterprise Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Tasks & SLA Watchlist */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  High-Priority Deliverables & SLA Watchlist
                </h3>
                <p className="text-xs text-slate-500">
                  Critical operational tasks requiring attention today
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo("tasks", "kanban")}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider cursor-pointer"
            >
              Task Board
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks
              .filter((t) => t.priority === "Critical" || t.priority === "High")
              .slice(0, 4)
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigateTo("tasks", "kanban")}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} size="sm" />
                      <span className="font-semibold text-slate-900 truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{task.projectName}</span>
                      <span>•</span>
                      <span>Assigned to {task.assigneeName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={task.status} size="sm" />
                    <span
                      className={`text-[10px] font-mono font-medium ${
                        task.slaBreached ? "text-rose-600 font-bold" : "text-slate-500"
                      }`}
                    >
                      Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Live Enterprise Activity Stream */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Audit Log & Operations Stream
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time events across CRM, HR, Projects, and Security
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono font-semibold border border-emerald-200">
              Live
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5 font-bold text-[10px]">
                  {act.userName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{act.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{act.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>by {act.userName}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{act.entityType}: {act.entityName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
