import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Film,
  Search,
  Video,
  ExternalLink,
  Building2,
  Calendar
} from "lucide-react";
import { StatusPill } from "../StatusPill";
import { Modal } from "../Modal";
import type { Application } from "../../types";

interface ActorApplicationsViewProps {
  applications: Application[];
  onRefresh?: () => void;
  onOpenMessage?: (casterId: string) => void;
}

export const ActorApplicationsView: React.FC<ActorApplicationsViewProps> = ({
  applications,
  onOpenMessage
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTapeUrl, setPreviewTapeUrl] = useState<string | null>(null);

  const statuses = [
    { id: "ALL", label: "All Submissions" },
    { id: "PENDING", label: "Pending Review" },
    { id: "UNDER_REVIEW", label: "In Review" },
    { id: "SHORTLISTED", label: "Shortlisted" },
    { id: "AUDITION_REQUESTED", label: "Audition Requested" },
    { id: "ACCEPTED", label: "Accepted / Booked" },
    { id: "REJECTED", label: "Closed" }
  ];

  const filteredApps = applications.filter((app) => {
    const matchesStatus =
      statusFilter === "ALL" || app.status.toUpperCase() === statusFilter;
    const q = searchQuery.toLowerCase();
    const roleName = (app.role?.characterName || app.role?.name || "").toLowerCase();
    const projTitle = (app.role?.project?.title || "").toLowerCase();
    const matchesQuery = !searchQuery || roleName.includes(q) || projTitle.includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-normal text-white tracking-tight flex items-center gap-2">
            <span>Audition & Application Tracker</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
              {applications.length}
            </span>
          </h2>
          <p className="text-xs text-[#8A8A90] mt-0.5">
            Monitor the status of your submitted self-tapes, sides, and casting reviews
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A90]" />
          <input
            type="text"
            placeholder="Search role or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-full bg-[#0E0E10] input-editorial text-xs"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statuses.map((st) => (
          <button
            key={st.id}
            onClick={() => setStatusFilter(st.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === st.id
                ? "bg-[#F7FFB8] text-black shadow-md"
                : "bg-white/5 border border-white/10 text-[#8A8A90] hover:text-white hover:bg-white/10"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-20 rounded-4xl bg-[#0E0E10] border border-white/10 p-8 flex flex-col items-center justify-center">
          <Film className="w-12 h-12 text-[#8A8A90] mb-3 opacity-50" />
          <h3 className="text-base font-medium text-white mb-1">
            {searchQuery || statusFilter !== "ALL"
              ? "No matching applications found"
              : "No audition submissions yet"}
          </h3>
          <p className="text-xs text-[#8A8A90] max-w-sm mb-5 leading-relaxed">
            Discover active casting calls in the global catalog and submit your monograph.
          </p>
          <Link
            to="/discovery"
            className="py-2.5 px-6 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-[#ebf49e] transition-all shadow-md"
          >
            Explore Open Casting Notices
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const role = app.role;
            const project = role?.project;
            return (
              <div
                key={app.id}
                className="rounded-3xl bg-[#0E0E10] border border-white/10 p-6 flex flex-col justify-between gap-5 hover:border-white/20 transition-all group relative overflow-hidden"
              >
                {/* Top: Header & Status */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] text-[#8A8A90] flex items-center gap-1.5 mb-1 font-mono">
                        <Calendar className="w-3 h-3 text-[#F7FFB8]" />
                        Submitted {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-lg font-medium text-white group-hover:text-[#F7FFB8] transition-colors">
                        {role?.characterName || role?.name || "Dramatic Lead"}
                      </h3>
                      {project && (
                        <p className="text-xs text-[#B9B9BE] flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#8A8A90]" />
                          <span>{project.title}</span>
                          <span className="text-[#8A8A90]">• {project.projectType?.replace(/_/g, " ")}</span>
                        </p>
                      )}
                    </div>

                    <StatusPill status={app.status} />
                  </div>

                  {/* Submission Notes */}
                  {app.notes && (
                    <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#D7D7DB] italic leading-relaxed">
                      "{app.notes}"
                    </div>
                  )}

                  {/* Self-Tape Attachment */}
                  {app.auditionTapeUrl && (
                    <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setPreviewTapeUrl(app.auditionTapeUrl!)}
                        className="text-xs text-[#F7FFB8] hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Preview Submitted Self-Tape</span>
                      </button>

                      <a
                        href={app.auditionTapeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#8A8A90] hover:text-white flex items-center gap-1"
                      >
                        <span>External link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs">
                  {role ? (
                    <Link
                      to={`/roles/${role.id}`}
                      className="text-[#8A8A90] hover:text-white transition-colors"
                    >
                      View Role Breakdown
                    </Link>
                  ) : (
                    <span className="text-[#8A8A90]">Casting call archived</span>
                  )}

                  {project?.casterId && onOpenMessage && (
                    <button
                      onClick={() => onOpenMessage(project.casterId)}
                      className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Message Casting Team
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Self-Tape Video Player Lightbox Modal */}
      {previewTapeUrl && (
        <Modal
          isOpen={!!previewTapeUrl}
          onClose={() => setPreviewTapeUrl(null)}
          title="Submitted Audition Self-Tape"
          subtitle="Encrypted audition tape playback stream."
          maxWidth="2xl"
        >
          <div className="rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center">
            <video
              controls
              autoPlay
              src={previewTapeUrl}
              className="w-full h-full object-contain"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ActorApplicationsView;
