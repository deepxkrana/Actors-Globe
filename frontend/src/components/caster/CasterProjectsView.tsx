import React, { useState } from "react";
import type { Project, Role } from "../../types";
import { api } from "../../services/api";
import {
  Film,
  Plus,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  AlertCircle
} from "lucide-react";

interface CasterProjectsViewProps {
  projects: Project[];
  onRefresh: () => void;
  onNavigateToNewProject: () => void;
  onSelectProjectForApplicants: (project: Project, roleId?: string) => void;
}

export const CasterProjectsView: React.FC<CasterProjectsViewProps> = ({
  projects,
  onRefresh,
  onNavigateToNewProject,
  onSelectProjectForApplicants
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add role modal state
  const [addingRoleProjectId, setAddingRoleProjectId] = useState<string | null>(null);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleGender, setRoleGender] = useState("ANY");
  const [roleMinAge, setRoleMinAge] = useState("");
  const [roleMaxAge, setRoleMaxAge] = useState("");
  const [submittingRole, setSubmittingRole] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.synopsis || (p as any).description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && (p.status === "ACTIVE" || p.status === ("PUBLISHED" as any))) ||
      (statusFilter === "DRAFT" && p.status === "DRAFT") ||
      (statusFilter === "CLOSED" && (p.status === "CASTING_CLOSED" || p.status === ("CLOSED" as any)));

    return matchesSearch && matchesStatus;
  });

  const totalRoles = projects.reduce((acc, p) => acc + (p.roles?.length || 0), 0);
  const activeCount = projects.filter(
    (p) => p.status === "ACTIVE" || p.status === ("PUBLISHED" as any)
  ).length;
  const draftCount = projects.filter((p) => p.status === "DRAFT").length;

  const handlePublish = async (projectId: string) => {
    setActionLoadingId(projectId);
    setFeedbackMsg(null);
    try {
      const res = await api.publishProject(projectId);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "Production notice published to Discovery board!" });
        onRefresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.message || "Failed to publish notice." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Error publishing casting call." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClose = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to close this casting notice? No further submissions will be accepted.")) {
      return;
    }
    setActionLoadingId(projectId);
    setFeedbackMsg(null);
    try {
      const res = await api.closeProject(projectId);
      if (res.success) {
        setFeedbackMsg({ type: "success", text: "Casting call closed successfully." });
        onRefresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.message || "Failed to close notice." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Error closing notice." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingRoleProjectId) return;
    setSubmittingRole(true);
    try {
      const res = await api.addCastingRole(addingRoleProjectId, {
        title: roleTitle.trim(),
        description: roleDesc.trim(),
        genderRequirement: roleGender,
        minAge: roleMinAge ? parseInt(roleMinAge, 10) : undefined,
        maxAge: roleMaxAge ? parseInt(roleMaxAge, 10) : undefined
      });

      if (res.success) {
        setFeedbackMsg({ type: "success", text: `Role "${roleTitle}" added to production.` });
        setAddingRoleProjectId(null);
        setRoleTitle("");
        setRoleDesc("");
        setRoleGender("ANY");
        setRoleMinAge("");
        setRoleMaxAge("");
        onRefresh();
      } else {
        setFeedbackMsg({ type: "error", text: res.message || "Failed to add role." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Error adding role." });
    } finally {
      setSubmittingRole(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="ml-auto text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#0E0E0F] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] text-[#8A8A90] uppercase tracking-wider font-medium">Total Productions</span>
          <span className="text-2xl font-light text-white tracking-tight mt-1">{projects.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0E0E0F] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] text-[#8A8A90] uppercase tracking-wider font-medium">Active Calls</span>
          <span className="text-2xl font-light text-[#F7FFB8] tracking-tight mt-1">{activeCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0E0E0F] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] text-[#8A8A90] uppercase tracking-wider font-medium">Draft Notices</span>
          <span className="text-2xl font-light text-[#FF97CA] tracking-tight mt-1">{draftCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0E0E0F] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] text-[#8A8A90] uppercase tracking-wider font-medium">Total Roles Listed</span>
          <span className="text-2xl font-light text-white tracking-tight mt-1">{totalRoles}</span>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "ACTIVE", "DRAFT", "CLOSED"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === filter
                  ? "bg-[#F7FFB8] text-black font-semibold"
                  : "bg-white/5 hover:bg-white/10 text-[#8A8A90] hover:text-white border border-white/5"
              }`}
            >
              {filter === "ALL" ? "All Notices" : filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A8A90] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location..."
              className="w-full h-9 pl-9 pr-3 rounded-full bg-[#0E0E0F] input-editorial text-xs"
            />
          </div>
          <button
            onClick={onNavigateToNewProject}
            className="px-4 py-2 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      {/* Production Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 rounded-[28px] bg-[#0E0E0F] border border-white/10 p-8">
          <Film className="w-10 h-10 text-[#8A8A90] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-medium text-white mb-1">No casting calls found</h3>
          <p className="text-xs text-[#8A8A90] mb-4 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your search criteria or filter tags."
              : "Create your first production notice to start reviewing actor auditions."}
          </p>
          <button
            onClick={onNavigateToNewProject}
            className="px-4 py-2 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors"
          >
            + Create New Casting Call
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((p) => {
            const isDraft = p.status === "DRAFT";
            const isPublished = p.status === "ACTIVE" || p.status === ("PUBLISHED" as any);
            const isClosed = p.status === "CASTING_CLOSED" || p.status === ("CLOSED" as any);
            const rolesList: Role[] = (p.roles || (p as any).castingRoles || []) as Role[];

            return (
              <div
                key={p.id}
                className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-6 flex flex-col justify-between gap-5 hover:border-white/20 transition-all group"
              >
                {/* Header Row */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F7FFB8] font-mono uppercase tracking-wider">
                      {p.projectType?.replace(/_/g, " ") || "PRODUCTION"}
                    </span>

                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${
                        isPublished
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : isDraft
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-white/5 text-[#8A8A90] border border-white/10"
                      }`}
                    >
                      {isPublished && <CheckCircle2 className="w-3 h-3" />}
                      {isDraft && <Clock className="w-3 h-3" />}
                      {isClosed && <XCircle className="w-3 h-3" />}
                      <span>{p.status}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-white group-hover:text-[#F7FFB8] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#8A8A90] line-clamp-2 mt-1 leading-relaxed">
                      {p.synopsis || (p as any).description || "No synopsis provided."}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8A90] pt-1">
                    {p.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D7D7DB]" />
                        <span>{p.location}</span>
                      </span>
                    )}
                    {((p as any).applicationDeadline || p.productionDates) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D7D7DB]" />
                        <span>
                          {(p as any).applicationDeadline
                            ? `Deadline: ${new Date((p as any).applicationDeadline).toLocaleDateString()}`
                            : p.productionDates}
                        </span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[#D7D7DB]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{rolesList.length} Role(s) Listed</span>
                    </span>
                  </div>
                </div>

                {/* Roles breakdown snippet */}
                <div className="rounded-2xl bg-black/40 border border-white/5 p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-[#8A8A90] font-medium border-b border-white/5 pb-1.5">
                    <span>Breakdown Characters</span>
                    <button
                      onClick={() => setAddingRoleProjectId(p.id)}
                      className="text-[#F7FFB8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Role</span>
                    </button>
                  </div>

                  {rolesList.length === 0 ? (
                    <span className="text-xs text-[#8A8A90] italic py-1">No roles added yet. Add a role to publish this notice.</span>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {rolesList.map((role) => {
                        const appCount = (role as any)._count?.applications ?? 0;
                        return (
                          <div
                            key={role.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F7FFB8]" />
                              <span className="font-medium text-white">{role.name || (role as any).title}</span>
                              <span className="text-[10px] text-[#8A8A90]">
                                {(role as any).genderRequirement || role.gender || "Any"} •{" "}
                                {role.ageMin && role.ageMax ? `${role.ageMin}-${role.ageMax} yrs` : "All Ages"}
                              </span>
                            </div>

                            <button
                              onClick={() => onSelectProjectForApplicants(p, role.id)}
                              className="text-[11px] text-[#D7D7DB] hover:text-[#F7FFB8] flex items-center gap-1 cursor-pointer font-medium"
                            >
                              <span>{appCount} Applicant(s)</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => onSelectProjectForApplicants(p)}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium hover:border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-[#F7FFB8]" />
                    <span>Review Applicants</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isDraft && (
                      <button
                        onClick={() => handlePublish(p.id)}
                        disabled={actionLoadingId === p.id}
                        className="px-4 py-2 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {actionLoadingId === p.id ? "Publishing..." : "Publish Call"}
                      </button>
                    )}

                    {isPublished && (
                      <button
                        onClick={() => handleClose(p.id)}
                        disabled={actionLoadingId === p.id}
                        className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === p.id ? "Closing..." : "Close Notice"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Role Modal */}
      {addingRoleProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0E0E0F] border border-white/15 p-6 md:p-8 flex flex-col gap-4 shadow-2xl glass">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-medium text-white">Add Character Breakdown</h3>
                <p className="text-xs text-[#8A8A90] mt-0.5">Define character attributes for audition submissions</p>
              </div>
              <button
                onClick={() => setAddingRoleProjectId(null)}
                className="text-[#8A8A90] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRoleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Role / Character Title *</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Detective Vance (Lead)"
                  className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Gender</label>
                  <select
                    value={roleGender}
                    onChange={(e) => setRoleGender(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-black/50 input-editorial text-xs"
                  >
                    <option value="ANY">Any Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="NON_BINARY">Non-Binary</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Min Age</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={roleMinAge}
                    onChange={(e) => setRoleMinAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full h-11 px-3 rounded-xl bg-black/50 input-editorial text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Max Age</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={roleMaxAge}
                    onChange={(e) => setRoleMaxAge(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full h-11 px-3 rounded-xl bg-black/50 input-editorial text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Character Description & Traits *</label>
                <textarea
                  rows={3}
                  required
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Detail emotional archetype, dramatic conflicts, and performance traits..."
                  className="w-full p-3 rounded-xl bg-black/50 input-editorial text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddingRoleProjectId(null)}
                  className="px-4 py-2 rounded-full text-xs text-[#8A8A90] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRole}
                  className="px-5 py-2.5 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingRole ? "Adding Role..." : "Add Character"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
