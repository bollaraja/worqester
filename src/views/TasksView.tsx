import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DataTable, Column } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { PriorityBadge } from "../components/common/PriorityBadge";
import { formatDate } from "../utils/formatters";
import {
  CheckSquare,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  User,
  Trash2,
  CheckCircle2,
  Circle,
  CalendarDays,
  Filter,
  Check,
} from "lucide-react";
import { Task } from "../types";

export const TasksView: React.FC = () => {
  const {
    tasks,
    updateTask,
    createTask,
    deleteItem,
    currentSubView,
    navigateTo,
    openCreateModal,
    projects,
    employees,
    toggleTaskCompletion,
    setTaskDueDate,
  } = useApp();

  const activeSubView = currentSubView || "kanban";
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Task Creator Bar
  const [quickTitle, setQuickTitle] = useState("");
  const [quickProjectId, setQuickProjectId] = useState<string>(projects[0]?.id || "");
  const [quickDueDate, setQuickDueDate] = useState<string>(
    new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]
  );
  const [quickPriority, setQuickPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");

  const taskColumns = ["Backlog", "To Do", "In Progress", "In Review", "Done"];

  const filteredTasks = tasks.filter((t) => {
    if (filterProject !== "all" && t.projectId !== filterProject) return false;
    if (filterPriority !== "all" && t.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q) ||
        t.assigneeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const proj = projects.find((p) => p.id === quickProjectId) || projects[0];
    createTask({
      title: quickTitle.trim(),
      description: `Task created for ${proj?.name || "Project"}`,
      projectId: proj ? proj.id : "proj-101",
      projectName: proj ? proj.name : "Cloud Portal Migration",
      assigneeId: "usr-01",
      assigneeName: "Alex Vance",
      reporterId: "usr-01",
      reporterName: "Alex Vance",
      priority: quickPriority,
      status: "To Do",
      labels: ["Sprint"],
      dueDate: quickDueDate,
      estimatedHours: 8,
      actualHours: 0,
    });

    setQuickTitle("");
  };

  const handleAdvanceTask = (task: Task, nextStatus: any) => {
    if (nextStatus === "Done") {
      toggleTaskCompletion(task.id);
    } else {
      updateTask(task.id, {
        status: nextStatus,
      });
    }
  };

  const completedCount = tasks.filter((t) => t.status === "Done").length;
  const pendingCount = tasks.filter((t) => t.status !== "Done").length;
  const overdueCount = tasks.filter((t) => t.slaBreached && t.status !== "Done").length;

  const tableColumns: Column<Task>[] = [
    {
      key: "title",
      header: "Task & Project",
      sortable: true,
      render: (t) => {
        const isDone = t.status === "Done";
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleTaskCompletion(t.id)}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                isDone
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-slate-300 hover:border-blue-500 bg-white"
              }`}
              title={isDone ? "Mark incomplete" : "Mark as complete"}
            >
              {isDone && <Check size={12} strokeWidth={3} />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${
                    isDone ? "line-through text-slate-400 font-normal" : "text-slate-900"
                  }`}
                >
                  {t.title}
                </span>
                {t.slaBreached && !isDone && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-600 font-mono font-bold border border-rose-200">
                    SLA Alert
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.projectName}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (t) => <StatusBadge status={t.status} size="sm" />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (t) => <PriorityBadge priority={t.priority} size="sm" />,
    },
    {
      key: "assigneeName",
      header: "Assignee",
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-2">
          {t.assigneeAvatar ? (
            <img src={t.assigneeAvatar} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
              {t.assigneeName.charAt(0)}
            </div>
          )}
          <span className="text-slate-700 text-xs">{t.assigneeName}</span>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={t.dueDate}
            onChange={(e) => setTaskDueDate(t.id, e.target.value)}
            className={`font-mono text-xs bg-transparent border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 ${
              t.slaBreached && t.status !== "Done" ? "text-rose-600 font-bold" : "text-slate-700"
            }`}
            title="Click to change due date"
          />
        </div>
      ),
    },
    {
      key: "estimatedHours",
      header: "Hours (Act/Est)",
      render: (t) => (
        <span className="font-mono text-xs text-slate-600">
          {t.actualHours}h / {t.estimatedHours}h
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (t) => {
        const isDone = t.status === "Done";
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleTaskCompletion(t.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                isDone
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isDone ? "Reopen" : "Complete"}
            </button>
            <button
              type="button"
              onClick={() => deleteItem("task", t.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Quick Status Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Tasks</span>
            <CheckSquare size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{tasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {projects.length} active enterprise projects
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Completed</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}% completion rate
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Pending & In-Flight</span>
            <Clock size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Assigned across engineering & ops teams
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>SLA Attention</span>
            <AlertCircle size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{overdueCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tasks requiring immediate triage</div>
        </div>
      </div>

      {/* Quick Add Task Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleQuickCreate} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              required
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="What task needs to be done? (e.g. Implement user authentication test suite)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Project Selector */}
            <select
              value={quickProjectId}
              onChange={(e) => setQuickProjectId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 max-w-[200px]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>

            {/* Priority Selector */}
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Due Date Picker */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white">
              <Calendar size={13} className="text-slate-400" />
              <input
                type="date"
                value={quickDueDate}
                onChange={(e) => setQuickDueDate(e.target.value)}
                className="text-xs font-mono text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                title="Set task due date"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sub Navigation & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          {[
            { id: "kanban", label: "Interactive Kanban", count: tasks.length },
            { id: "all", label: "All Tasks Table", count: tasks.length },
            { id: "calendar", label: "Deadlines Calendar", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo("tasks", tab.id)}
              className={`px-3.5 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubView === tab.id
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            type="button"
            onClick={() => openCreateModal("task")}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {activeSubView === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {taskColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col);

            return (
              <div
                key={col}
                className="rounded-2xl bg-slate-100/70 border border-slate-200 p-3.5 flex flex-col min-h-[550px]"
              >
                {/* Column Header */}
                <div className="pb-2.5 mb-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight">{col}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreateModal("task")}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title={`Add task to ${col}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                      No tasks in {col}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isDone = task.status === "Done";

                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all text-xs group space-y-2.5"
                        >
                          {/* Top Row: Checkbox + Title + Priority */}
                          <div className="flex items-start gap-2">
                            {/* 1-Click Task Complete Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleTaskCompletion(task.id)}
                              className={`w-4.5 h-4.5 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 border ${
                                isDone
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-slate-300 hover:border-blue-500 bg-white"
                              }`}
                              title={isDone ? "Mark as Incomplete" : "Mark as Complete"}
                            >
                              {isDone && <Check size={11} strokeWidth={3} />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <span
                                className={`font-semibold block line-clamp-2 transition-colors ${
                                  isDone ? "line-through text-slate-400 font-normal" : "text-slate-900 group-hover:text-blue-600"
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            <PriorityBadge priority={task.priority} size="sm" />
                          </div>

                          {/* Project Tag */}
                          <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">{task.projectName}</span>
                          </div>

                          {/* Due Date (Interactive) & Assignee */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-slate-400 shrink-0" />
                              <input
                                type="date"
                                value={task.dueDate}
                                onChange={(e) => setTaskDueDate(task.id, e.target.value)}
                                className={`bg-transparent border-none text-[11px] font-mono cursor-pointer focus:outline-none ${
                                  task.slaBreached && !isDone
                                    ? "text-rose-600 font-bold"
                                    : "text-slate-600"
                                }`}
                                title="Click to update task due date"
                              />
                            </div>

                            {task.assigneeName && (
                              <div className="flex items-center gap-1.5 max-w-[100px] truncate" title={task.assigneeName}>
                                {task.assigneeAvatar ? (
                                  <img
                                    src={task.assigneeAvatar}
                                    className="w-4 h-4 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold">
                                    {task.assigneeName.charAt(0)}
                                  </div>
                                )}
                                <span className="truncate text-[10px] text-slate-600">
                                  {task.assigneeName.split(" ")[0]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Workflow Move Controls */}
                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            {/* Previous Status Button */}
                            {col !== "Backlog" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = taskColumns.indexOf(col);
                                  if (idx > 0) handleAdvanceTask(task, taskColumns[idx - 1]);
                                }}
                                className="text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
                              >
                                ← Back
                              </button>
                            ) : (
                              <span />
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => deleteItem("task", task.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 size={12} />
                            </button>

                            {/* Next Status Button */}
                            {col !== "Done" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = taskColumns.indexOf(col);
                                  if (idx < taskColumns.length - 1)
                                    handleAdvanceTask(task, taskColumns[idx + 1]);
                                }}
                                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer flex items-center gap-0.5"
                              >
                                <span>Advance</span>
                                <ArrowRight size={10} />
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-medium">Finished</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: ALL TASKS TABLE */}
      {activeSubView === "all" && (
        <DataTable
          data={filteredTasks}
          columns={tableColumns}
          searchPlaceholder="Search task by title, project, assignee..."
          searchField={(t) => `${t.title} ${t.projectName} ${t.assigneeName}`}
        />
      )}

      {/* VIEW: DEADLINES CALENDAR */}
      {activeSubView === "calendar" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Deadlines & Schedule Calendar</h3>
              <p className="text-xs text-slate-500">Upcoming deliverables grouped by targeted completion date</p>
            </div>
            <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {filteredTasks.length} Active Tasks
            </span>
          </div>

          <div className="space-y-3">
            {filteredTasks
              .slice()
              .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
              .map((t) => {
                const isDone = t.status === "Done";
                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isDone
                        ? "bg-slate-50/70 border-slate-200 text-slate-400"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTaskCompletion(t.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                          isDone
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 hover:border-blue-500 bg-white"
                        }`}
                      >
                        {isDone && <Check size={12} strokeWidth={3} />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
                            {t.title}
                          </span>
                          <PriorityBadge priority={t.priority} size="sm" />
                          <StatusBadge status={t.status} size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{t.projectName}</span>
                          <span>•</span>
                          <span>Assignee: {t.assigneeName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
                        <Calendar size={12} className="text-slate-400" />
                        <input
                          type="date"
                          value={t.dueDate}
                          onChange={(e) => setTaskDueDate(t.id, e.target.value)}
                          className="text-xs font-mono text-slate-700 bg-transparent border-none cursor-pointer focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
