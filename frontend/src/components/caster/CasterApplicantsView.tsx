import React, { useState, useEffect, useCallback } from "react";
import type { Project, Role, Application } from "../../types";
import { api } from "../../services/api";
import {
  Users,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Video,
  User,
  Filter,
  Calendar,
  Award,
  Sparkles
} from "lucide-react";

interface CasterApplicantsViewProps {
  projects: Project[];
  initialProjectId?: string;
  initialRoleId?: string;
  onOpenMessage: (recipientId: string) => void;
}

export const CasterApplicantsView: React.FC<CasterApplicantsViewProps> = ({
  projects,
  initialProjectId,
  initialRoleId,
  onOpenMessage
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || (projects[0]?.id ?? "")
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId || "ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals
  const [viewingTapeUrl, setViewingTapeUrl] = useState<string | null>(null);
  const [viewingActor, setViewingActor] = useState<any | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectRoles: Role[] = (selectedProject?.roles || (selectedProject as any)?.castingRoles || []) as Role[];

  // Fetch applications for current selection
  const fetchApplications = useCallback(async () => {
    if (!selectedProjectId && projects.length === 0) return;
    setLoading(true);

    try {
      const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
      if (!activeProject) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const rolesToQuery: Role[] =
        selectedRoleId !== "ALL"
          ? projectRoles.filter((r) => r.id === selectedRoleId)
          : projectRoles;

      if (rolesToQuery.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Query role applications in parallel across target roles
      const results = await Promise.all(
        rolesToQuery.map(async (role) => {
          try {
            const res = await api.getCasterRoleApplications(
              role.id,
              statusFilter !== "ALL" ? { status: statusFilter } : undefined
            );
            if (res.success && Array.isArray(res.data)) {
              // Attach role metadata to application
              return res.data.map((app: any) => ({
                ...app,
                role: app.role || role
              }));
            }
          } catch (err) {
            console.error(`Failed to fetch applications for role ${role.id}:`, err);
          }
          return [];
        })
      );

      const merged = results.flat();
      setApplications(merged as Application[]);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, selectedRoleId, statusFilter, projects, projectRoles]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle triage action (ACCEPTED / REJECTED)
  const handleStatusChange = async (appId: string, newStatus: "ACCEPTED" | "REJECTED") => {
    setActionLoadingId(appId);
    try {
      const res = await api.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus as any } : a))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter local applications by status if needed
  const displayedApps = applications.filter((app) => {
    if (statusFilter === "ALL") return true;
    return app.status === statusFilter;
  });

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner / Project & Role Selector */}
      <div className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[#8A8A90] font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#F7FFB8]" />
            <span>Audition Triage Desk</span>
          </span>
          <h2 className="text-xl font-medium text-white tracking-tight">
            Review Candidate Submissions
          </h2>
        </div>

        {/* Project & Role Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="select-production" className="text-[10px] text-[#8A8A90] block mb-1 uppercase font-medium">Production</label>
            <select
              id="select-production"
              aria-label="Select production to triage"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedRoleId("ALL");
              }}
              className="h-9 px-3 rounded-xl bg-black/60 input-editorial text-xs"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="select-role" className="text-[10px] text-[#8A8A90] block mb-1 uppercase font-medium">Character Role</label>
            <select
              id="select-role"
              aria-label="Filter applicants by character role"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="h-9 px-3 rounded-xl bg-black/60 input-editorial text-xs"
            >
              <option value="ALL">All Roles ({projectRoles.length})</option>
              {projectRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || (r as any).title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Counters & Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: "ALL", label: `All (${applications.length})` },
            { id: "PENDING", label: `Pending Review (${pendingCount})` },
            { id: "ACCEPTED", label: `Shortlisted / Accepted (${acceptedCount})` },
            { id: "REJECTED", label: `Archived (${rejectedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#F7FFB8] text-black font-semibold shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-[#8A8A90] hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchApplications}
          className="text-xs text-[#8A8A90] hover:text-white flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <Filter className="w-3 h-3" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#8A8A90] text-xs">
          <div className="w-6 h-6 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin mr-3" />
          <span>Fetching audition portfolios...</span>
        </div>
      ) : displayedApps.length === 0 ? (
        <div className="text-center py-16 rounded-[28px] bg-[#0E0E0F] border border-white/10 p-8">
          <Users className="w-10 h-10 text-[#8A8A90] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-medium text-white mb-1">No applications found</h3>
          <p className="text-xs text-[#8A8A90] max-w-sm mx-auto">
            {statusFilter !== "ALL"
              ? `No candidates currently under the "${statusFilter}" status filter.`
              : "Performers will appear here once they submit auditions for this production."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedApps.map((app) => {
            const actor: any = app.actor || {};
            const role: any = app.role || {};
            const isPending = app.status === "PENDING";
            const isAccepted = app.status === "ACCEPTED";
            const isRejected = app.status === "REJECTED";

            const actorPhoto =
              actor.headshotUrl ||
              actor.media?.find((m: any) => m.type === "HEADSHOT" || m.type === "IMAGE")?.url ||
              actor.user?.avatarUrl;

            const actorTape =
              app.auditionTapeUrl ||
              actor.reelUrl ||
              actor.media?.find((m: any) => m.type === "VIDEO" || m.type === "REEL")?.url;

            const skills: string[] = actor.skills || [];

            return (
              <div
                key={app.id}
                className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-6 flex flex-col justify-between gap-5 hover:border-white/20 transition-all"
              >
                {/* Performer Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                    {actorPhoto ? (
                      <img
                        src={actorPhoto}
                        alt={actor.displayName || actor.stageName || "Performer"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-lg font-light text-[#F7FFB8]">
                        {(actor.displayName || actor.stageName || "A")[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-medium text-white truncate">
                        {actor.displayName || actor.stageName || actor.user?.name || "Anonymous Performer"}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isAccepted
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isRejected
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#F7FFB8] font-medium mt-0.5">
                      Applied for: <span className="text-white">{role.name || role.title || "Production Role"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#8A8A90] mt-1.5">
                      {actor.gender && <span>{actor.gender}</span>}
                      {actor.unionStatus && <span>• {actor.unionStatus}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(app.createdAt || (app as any).appliedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performer Notes or Skills */}
                {app.notes ? (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-[#D7D7DB] italic line-clamp-2">
                    "{app.notes}"
                  </div>
                ) : actor.bio ? (
                  <p className="text-xs text-[#8A8A90] line-clamp-2 leading-relaxed">
                    {actor.bio}
                  </p>
                ) : null}

                {/* Skills tags */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#D7D7DB] border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="text-[10px] text-[#8A8A90] py-0.5">
                        +{skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Media & Profile Inspect Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  {actorTape ? (
                    <button
                      onClick={() => setViewingTapeUrl(actorTape)}
                      className="px-3 py-1.5 rounded-full bg-[#F7FFB8]/10 border border-[#F7FFB8]/20 text-xs font-medium text-[#F7FFB8] hover:bg-[#F7FFB8]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Watch Self-Tape</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#8A8A90] italic">No tape attached</span>
                  )}

                  <button
                    onClick={() => setViewingActor(actor)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#D7D7DB] hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Performer Dossier</span>
                  </button>
                </div>

                {/* Triage Action Controls */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => onOpenMessage(actor.userId || actor.id)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#D7D7DB] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#F7FFB8]" />
                    <span>Direct Message</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, "REJECTED")}
                          disabled={actionLoadingId === app.id}
                          className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Pass</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "ACCEPTED")}
                          disabled={actionLoadingId === app.id}
                          className="px-3.5 py-1.5 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept / Shortlist</span>
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleStatusChange(app.id, "REJECTED")}
                        disabled={actionLoadingId === app.id}
                        className="text-xs text-[#8A8A90] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Move to Archived
                      </button>
                    )}

                    {isRejected && (
                      <button
                        onClick={() => handleStatusChange(app.id, "ACCEPTED")}
                        disabled={actionLoadingId === app.id}
                        className="text-xs text-[#8A8A90] hover:text-[#F7FFB8] transition-colors cursor-pointer"
                      >
                        Re-evaluate & Shortlist
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Modal Player */}
      {viewingTapeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0E0E0F] border border-white/20 p-6 flex flex-col gap-4 shadow-2xl glass">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#F7FFB8]" />
                <h3 className="text-sm font-semibold text-white">Audition Tape Screening</h3>
              </div>
              <button
                onClick={() => setViewingTapeUrl(null)}
                className="text-[#8A8A90] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-white/10">
              {viewingTapeUrl.includes("youtube.com") || viewingTapeUrl.includes("vimeo.com") ? (
                <iframe
                  src={viewingTapeUrl}
                  title="Audition Self-Tape"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={viewingTapeUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingTapeUrl(null)}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performer Dossier Modal */}
      {viewingActor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0E0E0F] border border-white/20 p-6 md:p-8 flex flex-col gap-6 shadow-2xl glass">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F7FFB8]" />
                <h3 className="text-lg font-medium text-white">Performer Monograph Dossier</h3>
              </div>
              <button
                onClick={() => setViewingActor(null)}
                className="text-[#8A8A90] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Performer Bio & Summary */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-black border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                {viewingActor.headshotUrl || viewingActor.user?.avatarUrl ? (
                  <img
                    src={viewingActor.headshotUrl || viewingActor.user?.avatarUrl}
                    alt={viewingActor.displayName || "Performer"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#8A8A90]" />
                )}
              </div>

              <div>
                <h4 className="text-xl font-medium text-white">
                  {viewingActor.displayName || viewingActor.stageName || viewingActor.user?.name}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8A90] mt-1">
                  {viewingActor.gender && <span>{viewingActor.gender}</span>}
                  {viewingActor.unionStatus && <span>• {viewingActor.unionStatus}</span>}
                  {viewingActor.location && <span>• {viewingActor.location}</span>}
                </div>
              </div>
            </div>

            {viewingActor.bio && (
              <div>
                <h5 className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider mb-1.5">
                  Artistic Biography
                </h5>
                <p className="text-xs text-[#D7D7DB] leading-relaxed whitespace-pre-line">
                  {viewingActor.bio}
                </p>
              </div>
            )}

            {/* Skills Cloud */}
            {viewingActor.skills && viewingActor.skills.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider mb-2">
                  Specialized Skills & Movement
                </h5>
                <div className="flex flex-wrap gap-2">
                  {viewingActor.skills.map((s: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experiences / Credits */}
            {viewingActor.experiences && viewingActor.experiences.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#F7FFB8]" />
                  <span>Filmography & Production Credits</span>
                </h5>
                <div className="flex flex-col gap-2">
                  {viewingActor.experiences.map((exp: any) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-white">{exp.roleTitle}</span>
                        {exp.organization && (
                          <span className="text-[#8A8A90]"> — {exp.organization}</span>
                        )}
                      </div>
                      {exp.startDate && (
                        <span className="text-[11px] text-[#8A8A90]">
                          {new Date(exp.startDate).getFullYear()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setViewingActor(null)}
                className="px-5 py-2.5 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
