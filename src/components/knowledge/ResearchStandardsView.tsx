import React, { useState } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
  Bookmark,
  Layers,
} from "lucide-react";
import { STANDARDS_DATABASE } from "../../data/standardsData";
import { RESEARCH_JOURNALS_DATABASE } from "../../data/researchJournals";

export const ResearchStandardsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"standards" | "journals">("standards");
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("ALL");
  const [materialFilter, setMaterialFilter] = useState("ALL");

  const filteredStandards = STANDARDS_DATABASE.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scope.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = orgFilter === "ALL" || s.organization === orgFilter;
    return matchesSearch && matchesOrg;
  });

  const filteredJournals = RESEARCH_JOURNALS_DATABASE.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.materialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.doi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial = materialFilter === "ALL" || j.materialType.includes(materialFilter);
    return matchesSearch && matchesMaterial;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Pusat Standar Teknis & Basis Data Literatur Ilmiah</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">Research Center & Standards Library</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Katalog resmi SNI Badan Standardisasi Nasional (BSN), ASTM, ACI serta jurnal peer-reviewed terverifikasi
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor SNI, judul, atau DOI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#286B9B]"
          />
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("standards")}
            className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === "standards"
                ? "border-[#286B9B] text-[#286B9B]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Standar Resmi BSN & Internasional ({STANDARDS_DATABASE.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("journals")}
            className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === "journals"
                ? "border-[#286B9B] text-[#286B9B]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Jurnal Ilmiah Peer-Reviewed ({RESEARCH_JOURNALS_DATABASE.length})</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="hidden sm:flex items-center gap-2 pb-1">
          {activeTab === "standards" ? (
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
            >
              <option value="ALL">Semua Organisasi</option>
              <option value="BSN (SNI)">BSN (SNI)</option>
              <option value="ASTM">ASTM</option>
              <option value="ACI">ACI</option>
            </select>
          ) : (
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
            >
              <option value="ALL">Semua Material Inovasi</option>
              <option value="FABA">FABA / Fly Ash</option>
              <option value="PET">Plastik PET</option>
              <option value="Banana">Serat Pisang</option>
              <option value="Bamboo">Serat Bambu</option>
              <option value="Recycled">Recycled Aggregate</option>
            </select>
          )}
        </div>
      </div>

      {/* STANDARDS LIST */}
      {activeTab === "standards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStandards.map((std) => (
            <div
              key={std.code}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#142D45]">{std.code}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {std.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{std.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-3">{std.scope}</p>
                <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-700 border border-slate-100">
                  <strong className="text-slate-800">Aplikasi di MIXLAB:</strong> {std.application}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{std.organization} · {std.year}</span>
                {std.officialUrl && (
                  <a
                    href={std.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#286B9B] hover:text-[#142D45] font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>Sumber BSN</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOURNALS LIST */}
      {activeTab === "journals" && (
        <div className="space-y-4">
          {filteredJournals.map((j) => (
            <div
              key={j.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono text-[#286B9B] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {j.materialType}
                    </span>
                    {j.isOpenAccess && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Open Access
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#142D45] leading-snug">{j.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {j.authors} ({j.year}) · <em className="text-slate-700">{j.journal}</em>
                  </p>
                </div>

                <a
                  href={j.link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>DOI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Dosis Yang Diteliti</span>
                  <p className="text-slate-800 font-medium mt-0.5">{j.dosageTested}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hasil Kuat Tekan (f'c)</span>
                  <p className="text-slate-800 font-bold font-mono text-[#286B9B] mt-0.5">{j.compressiveStrengthResult}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
                <strong className="text-slate-900 block mb-0.5">Temuan Kunci (Key Findings):</strong>
                <p className="text-slate-700 leading-relaxed">{j.keyFindings}</p>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span><strong>Relevansi:</strong> {j.relevanceToConcrete}</span>
                <span className="font-mono text-slate-400">{j.doi}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
