import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DataTable, Column } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { PriorityBadge } from "../components/common/PriorityBadge";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  Building2,
  Users,
  Briefcase,
  DollarSign,
  Plus,
  ArrowRight,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Lead, Deal, Company, Contact } from "../types";

export const CrmView: React.FC = () => {
  const {
    currentSubView,
    navigateTo,
    openCreateModal,
    leads,
    deals,
    companies,
    contacts,
    activities,
    projects,
    updateDeal,
    updateLead,
    deleteItem,
    settings,
    selectedEntityId,
  } = useApp();

  // Active tab within CRM
  const activeSubView = currentSubView || "pipeline";

  // Deals Kanban columns
  const dealStages = [
    "New",
    "Qualification",
    "Discovery",
    "Proposal",
    "Negotiation",
    "Closed Won",
  ];

  const handleAdvanceDeal = (deal: Deal, nextStage: any) => {
    updateDeal(deal.id, {
      stage: nextStage,
      probability: nextStage === "Closed Won" ? 100 : deal.probability + 15,
    });
  };

  const handleConvertLead = (lead: Lead) => {
    updateLead(lead.id, { status: "Qualified" });
    openCreateModal("deal");
  };

  // Customer 360 target account
  const customer360Company =
    companies.find((c) => c.id === selectedEntityId) || companies[0];

  // Lead Columns
  const leadColumns: Column<Lead>[] = [
    {
      key: "name",
      header: "Lead Contact",
      sortable: true,
      render: (lead) => (
        <div>
          <div className="font-semibold text-white">{lead.name}</div>
          <div className="text-[11px] text-slate-400">{lead.company}</div>
        </div>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      sortable: true,
      render: (l) => <span className="text-slate-300">{l.industry}</span>,
    },
    {
      key: "score",
      header: "Lead Score",
      sortable: true,
      render: (l) => (
        <span
          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full border ${
            l.score >= 80
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : l.score >= 60
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }`}
        >
          {l.score}/100
        </span>
      ),
    },
    {
      key: "expectedValue",
      header: "Est. Value",
      sortable: true,
      render: (l) => (
        <span className="font-mono font-semibold text-slate-200">
          {formatCurrency(l.expectedValue, settings.currency, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (l) => <StatusBadge status={l.status} size="sm" />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (l) => <PriorityBadge priority={l.priority} size="sm" />,
    },
    {
      key: "ownerName",
      header: "Assigned To",
      sortable: true,
      render: (l) => <span className="text-slate-400 text-xs">{l.ownerName}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (l) => (
        <div className="flex items-center gap-1.5">
          {l.status !== "Qualified" && (
            <button
              type="button"
              onClick={() => handleConvertLead(l)}
              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[10px] font-semibold transition-colors"
            >
              Convert to Deal
            </button>
          )}
          <button
            type="button"
            onClick={() => deleteItem("lead", l.id)}
            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  // Company Columns
  const companyColumns: Column<Company>[] = [
    {
      key: "name",
      header: "Account / Company",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-white">{c.name}</div>
          <div className="text-[11px] text-slate-400">{c.website}</div>
        </div>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      sortable: true,
    },
    {
      key: "tier",
      header: "Client Tier",
      sortable: true,
      render: (c) => (
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {c.tier || "Enterprise"}
        </span>
      ),
    },
    {
      key: "annualRevenue",
      header: "Account Revenue",
      sortable: true,
      render: (c) => (
        <span className="font-mono font-semibold text-slate-200">
          {formatCurrency(c.annualRevenue, settings.currency, settings.currencySymbol)}
        </span>
      ),
    },
    {
      key: "location",
      header: "Headquarters",
      sortable: true,
      render: (c) => <span className="text-slate-300">{c.location || c.address || "Bengaluru, India"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status || c.health} size="sm" />,
    },
    {
      key: "actions",
      header: "360 View",
      render: (c) => (
        <button
          type="button"
          onClick={() => navigateTo("crm", "customer360", c.id)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
        >
          <span>Customer 360</span>
          <ChevronRight size={14} />
        </button>
      ),
    },
  ];

  // Contact Columns
  const contactColumns: Column<Contact>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (cont) => (
        <div>
          <div className="font-semibold text-white">{cont.name}</div>
          <div className="text-[11px] text-slate-400">{cont.title || cont.designation}</div>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (cont) => <span className="text-slate-300">{cont.companyName}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (cont) => (
        <a
          href={`mailto:${cont.email}`}
          className="flex items-center gap-1.5 text-blue-400 hover:underline"
        >
          <Mail size={12} />
          <span>{cont.email}</span>
        </a>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (cont) => (
        <span className="flex items-center gap-1.5 text-slate-400 font-mono">
          <Phone size={12} />
          <span>{cont.phone}</span>
        </span>
      ),
    },
    {
      key: "decisionMaker",
      header: "Decision Maker",
      render: (cont) =>
        cont.decisionMaker ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            Key Stakeholder
          </span>
        ) : (
          <span className="text-[10px] text-slate-500">Influencer</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "pipeline", label: "Sales Pipeline", count: deals.length },
            { id: "leads", label: "Leads & Inbound", count: leads.length },
            { id: "companies", label: "Accounts (Companies)", count: companies.length },
            { id: "contacts", label: "Contacts", count: contacts.length },
            { id: "customer360", label: "Customer 360", count: null },
            { id: "activities", label: "Sales Activities", count: activities.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo("crm", tab.id)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubView === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeSubView === tab.id
                      ? "bg-blue-700 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {activeSubView === "pipeline" || activeSubView === "deals" ? (
            <button
              type="button"
              onClick={() => openCreateModal("deal")}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Add Deal</span>
            </button>
          ) : activeSubView === "leads" ? (
            <button
              type="button"
              onClick={() => openCreateModal("lead")}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Add Lead</span>
            </button>
          ) : activeSubView === "companies" ? (
            <button
              type="button"
              onClick={() => openCreateModal("company")}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Add Company</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* VIEW: SALES PIPELINE (KANBAN) */}
      {activeSubView === "pipeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Total Pipeline Value:{" "}
              <strong className="text-white font-mono text-sm">
                {formatCurrency(
                  deals
                    .filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost")
                    .reduce((s, d) => s + d.amount, 0),
                  settings.currency,
                  settings.currencySymbol
                )}
              </strong>
            </span>
            <span>Weighted Forecast: <strong className="text-blue-400 font-mono">
              {formatCurrency(
                deals
                  .filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost")
                  .reduce((s, d) => s + (d.amount * d.probability) / 100, 0),
                settings.currency,
                settings.currencySymbol
              )}
            </strong></span>
          </div>

          {/* Kanban Board Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
            {dealStages.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.amount, 0);

              return (
                <div
                  key={stage}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-3 flex flex-col min-h-[480px]"
                >
                  {/* Column Header */}
                  <div className="pb-2.5 mb-2.5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">
                        {stage}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatCurrency(stageValue, settings.currency, settings.currencySymbol)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Deals in Stage */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs group shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                            {deal.name}
                          </span>
                          <PriorityBadge priority={deal.priority} size="sm" />
                        </div>

                        <div className="text-[11px] text-slate-400 mb-2 truncate">
                          {deal.companyName}
                        </div>

                        <div className="flex items-baseline justify-between text-xs pt-2 border-t border-slate-800/60">
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(deal.amount, settings.currency, settings.currencySymbol)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {deal.probability}% Prob.
                          </span>
                        </div>

                        {/* Stage transition controls */}
                        <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {deal.expectedCloseDate}
                          </span>
                          {stage !== "Closed Won" && (
                            <button
                              type="button"
                              onClick={() => {
                                const currentIndex = dealStages.indexOf(stage);
                                if (currentIndex < dealStages.length - 1) {
                                  handleAdvanceDeal(deal, dealStages[currentIndex + 1]);
                                }
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white transition-colors font-semibold flex items-center gap-1"
                            >
                              <span>Next</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: LEADS */}
      {activeSubView === "leads" && (
        <DataTable
          data={leads}
          columns={leadColumns}
          searchPlaceholder="Search leads by contact name, company, industry..."
          searchField={(l) => `${l.name} ${l.company} ${l.industry}`}
        />
      )}

      {/* VIEW: COMPANIES */}
      {activeSubView === "companies" && (
        <DataTable
          data={companies}
          columns={companyColumns}
          searchPlaceholder="Search company accounts..."
          searchField={(c) => `${c.name} ${c.industry} ${c.address || c.location || ""}`}
        />
      )}

      {/* VIEW: CONTACTS */}
      {activeSubView === "contacts" && (
        <DataTable
          data={contacts}
          columns={contactColumns}
          searchPlaceholder="Search contacts by name, email, company..."
          searchField={(cont) => `${cont.name} ${cont.email} ${cont.companyName}`}
        />
      )}

      {/* VIEW: CUSTOMER 360 */}
      {activeSubView === "customer360" && (
        <div className="space-y-6">
          {/* Account Profile Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-2xl shadow-inner">
                {customer360Company.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {customer360Company.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    Tier: {customer360Company.tier || "Tier 1 Enterprise"}
                  </span>
                  <StatusBadge status={customer360Company.status || customer360Company.health} size="sm" />
                </div>
                <p className="text-xs text-slate-400">
                  {customer360Company.industry} • Headquarters in {customer360Company.address || customer360Company.location || "Bengaluru, India"} •{" "}
                  {customer360Company.website}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs font-mono text-slate-300">
                  <span>
                    Annual Revenue:{" "}
                    <strong className="text-emerald-400">
                      {formatCurrency(customer360Company.annualRevenue)}
                    </strong>
                  </span>
                  <span>Employees: 1,200+</span>
                  <span>Client Since: 2024</span>
                </div>
              </div>
            </div>

            {/* Quick Switch Accounts */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Switch Account:</span>
              <select
                value={customer360Company.id}
                onChange={(e) => navigateTo("crm", "customer360", e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 360 Grid: Deals, Active Projects, Key Contacts, and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deals with this Account */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-400" />
                  <span>Pipeline & Active Deals</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {deals.filter((d) => d.companyId === customer360Company.id).length} Active
                </span>
              </div>

              <div className="space-y-2.5">
                {deals
                  .filter((d) => d.companyId === customer360Company.id)
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{deal.name}</span>
                        <StatusBadge status={deal.stage} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-mono font-bold text-emerald-400">
                          {formatCurrency(deal.amount)}
                        </span>
                        <span>{deal.probability}% Probability</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Projects with this Account */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-purple-400" />
                  <span>Delivering Projects</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {projects.filter((p) => p.companyId === customer360Company.id).length} Projects
                </span>
              </div>

              <div className="space-y-2.5">
                {projects
                  .filter((p) => p.companyId === customer360Company.id)
                  .map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{proj.name}</span>
                        <StatusBadge status={proj.health} size="sm" />
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{proj.progress}% Done</span>
                        <span>Budget: {formatCurrency(proj.budget)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Key Contacts */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <span>Key Stakeholders</span>
                </h3>
                <button
                  type="button"
                  onClick={() => openCreateModal("contact")}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-2.5">
                {contacts
                  .filter((c) => c.companyId === customer360Company.id)
                  .map((cont) => (
                    <div
                      key={cont.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{cont.name}</span>
                        {cont.decisionMaker && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            Decision Maker
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{cont.title}</div>
                      <div className="text-[11px] text-blue-400 font-mono">{cont.email}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ACTIVITIES */}
      {activeSubView === "activities" && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Sales & Customer Engagements</h3>
              <p className="text-xs text-slate-400">All customer calls, meetings, notes, and touchpoints</p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal("note")}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Log Touchpoint
            </button>
          </div>

          <div className="space-y-3 divide-y divide-slate-800/60">
            {activities.map((act) => (
              <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3.5 text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-blue-400 font-bold">
                  {act.type === "Call" ? "📞" : act.type === "Meeting" ? "🗓️" : "📝"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{act.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{act.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Logged by {act.userName}</span>
                    <span>•</span>
                    <span className="text-slate-400">{act.entityType}: {act.entityName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
