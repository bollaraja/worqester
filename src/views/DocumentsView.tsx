import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { FileText, Download, Plus, Search, Tag, Trash2, Folder, ExternalLink } from "lucide-react";
import { DocumentItem } from "../types";

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, deleteItem, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === "all" || doc.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(documents.flatMap((d) => d.tags)));

  const handleUploadSim = () => {
    const title = prompt("Enter Document Title:", "Q4 Technical Roadmap & Delivery Plan");
    if (!title) return;
    addDocument({
      title,
      fileName: `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      fileSize: "1.8 MB",
      fileType: "pdf",
      uploadedBy: currentUser.name,
      tags: ["Internal", "Strategic"],
      version: "v1.0",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Enterprise Knowledge & Documents
          </h2>
          <p className="text-xs text-slate-400">
            Centralized repository for contracts, architecture briefs, and policies
          </p>
        </div>

        <button
          type="button"
          onClick={handleUploadSim}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={14} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Tags Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by title or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedTag("all")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedTag === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm space-y-3 text-xs group hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-mono font-bold text-xs uppercase">
                  {doc.fileType}
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {doc.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {doc.fileName} • {doc.fileSize}
                  </span>
                </div>
              </div>

              <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold">
                {doc.version}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Uploaded {doc.uploadedAt} by {doc.uploadedBy}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => alert(`Downloading ${doc.fileName}...`)}
                  className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                  title="Download File"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem("document", doc.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
