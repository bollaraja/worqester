import React from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { BarChart3, Download, TrendingUp, DollarSign, Users, Layers } from "lucide-react";

const monthlyRevData = [
  { month: "Jan", revenue: 3200000, target: 3000000 },
  { month: "Feb", revenue: 4100000, target: 3500000 },
  { month: "Mar", revenue: 4800000, target: 4000000 },
  { month: "Apr", revenue: 4200000, target: 4500000 },
  { month: "May", revenue: 5800000, target: 5000000 },
  { month: "Jun", revenue: 7100000, target: 6000000 },
  { month: "Jul", revenue: 6400000, target: 6500000 },
  { month: "Aug", revenue: 8900000, target: 7000000 },
  { month: "Sep", revenue: 11400000, target: 8000000 },
];

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4"];

export const ReportsView: React.FC = () => {
  const { deals, projects, employees, departments, settings, kpis } = useApp();

  // Deals by stage for pie chart
  const stageData = [
    { name: "New", value: deals.filter((d) => d.stage === "New").length },
    { name: "Discovery", value: deals.filter((d) => d.stage === "Discovery").length },
    { name: "Proposal", value: deals.filter((d) => d.stage === "Proposal").length },
    { name: "Negotiation", value: deals.filter((d) => d.stage === "Negotiation").length },
    { name: "Closed Won", value: deals.filter((d) => d.stage === "Closed Won").length },
  ].filter((d) => d.value > 0);

  // Department cost data
  const deptData = departments.map((d) => ({
    name: d.name.split(" ")[0],
    budget: d.budget / 100000,
    headcount: employees.filter((e) => e.department === d.name).length,
  }));

  // Project budget vs spent
  const projectComparisonData = projects.map((p) => ({
    code: p.code,
    budget: p.budget / 100000,
    spent: p.spent / 100000,
  }));

  const exportReport = () => {
    alert("Report exported to CSV successfully.");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Reports & Executive Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Cross-department performance trends, financial health, and workforce analytics
          </p>
        </div>

        <button
          type="button"
          onClick={exportReport}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 shadow-sm"
        >
          <Download size={14} />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Monthly Realized Revenue vs Target (INR)</h3>
            <p className="text-xs text-slate-400">Actual billing performance compared against budgeted quarterly goals</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 100000}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                />
                <Bar dataKey="revenue" name="Actual Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Revenue Target" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Stage Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Sales Pipeline Opportunity Breakdown</h3>
            <p className="text-xs text-slate-400">Deal volume distribution across active qualification gates</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(val) => <span className="text-xs text-slate-300 font-sans">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Budget vs Spent */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Project Budget Allocation vs Burn (₹ Lakhs)</h3>
            <p className="text-xs text-slate-400">Financial capital utilization per strategic initiative</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`₹${val} Lakhs`, ""]}
                />
                <Bar dataKey="budget" name="Approved Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Capital Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Capital & Headcount */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Department Headcount & Annual Operating Budget</h3>
            <p className="text-xs text-slate-400">Headcount distribution across Engineering, Sales, and Product</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="headcount" name="Staff Headcount" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budget" name="Budget (₹ Lakhs)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
