import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building2,
  Calendar
} from "lucide-react";
import { StatusPill } from "../StatusPill";
import { api } from "../../services/api";
import type { CastingRequest } from "../../types";

interface ActorRequestsViewProps {
  castingRequests: CastingRequest[];
  onRefresh?: () => void;
  onOpenMessage?: (casterId: string) => void;
}

export const ActorRequestsView: React.FC<ActorRequestsViewProps> = ({
  castingRequests,
  onRefresh,
  onOpenMessage
}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleRespond = async (requestId: string, status: "ACCEPTED" | "DECLINED") => {
    setActionInProgress(requestId);
    try {
      const res = await api.respondToCastingRequest(requestId, status);
      if (res.success) {
        setToastMsg(
          status === "ACCEPTED"
            ? "Invitation accepted! The casting team has been notified."
            : "Invitation respectfully declined."
        );
        setTimeout(() => setToastMsg(null), 3500);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Failed to respond to casting request:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredRequests = castingRequests.filter((req) => {
    if (filter === "ALL") return true;
    return req.status.toUpperCase() === filter;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-normal text-white tracking-tight flex items-center gap-2">
            <span>Direct Casting Invitations</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F7FFB8]/15 text-[#F7FFB8] font-mono">
              {castingRequests.length}
            </span>
          </h2>
          <p className="text-xs text-[#8A8A90] mt-0.5">
            Direct audition offers and private role invitations received from verified casting directors
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "ACCEPTED", "DECLINED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filter === st
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "bg-white/5 border border-white/10 text-[#8A8A90] hover:text-white hover:bg-white/10"
              }`}
            >
              {st === "ALL" ? "All Invitations" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Toast */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-20 rounded-4xl bg-[#0E0E10] border border-white/10 p-8 flex flex-col items-center justify-center">
          <Send className="w-12 h-12 text-[#8A8A90] mb-3 opacity-50" />
          <h3 className="text-base font-medium text-white mb-1">
            {filter !== "ALL" ? `No ${filter.toLowerCase()} invitations` : "No direct invitations received yet"}
          </h3>
          <p className="text-xs text-[#8A8A90] max-w-sm mb-4 leading-relaxed">
            Ensure your monograph photos, showreels, and skills tags are up to date so casting directors can discover your profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const role = req.role;
            const project = role?.project;
            const isPending = req.status === "PENDING";
            const isAccepted = req.status === "ACCEPTED";
            const isLoading = actionInProgress === req.id;

            return (
              <div
                key={req.id}
                className="rounded-3xl bg-[#0E0E10] border border-white/10 p-6 flex flex-col justify-between gap-5 hover:border-white/20 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] text-[#8A8A90] flex items-center gap-1.5 mb-1 font-mono">
                        <Calendar className="w-3 h-3 text-[#F7FFB8]" />
                        Received {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-lg font-medium text-white group-hover:text-[#F7FFB8] transition-colors">
                        {role?.characterName || role?.name || "Direct Audition Offer"}
                      </h3>
                      {project && (
                        <p className="text-xs text-[#B9B9BE] flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-[#8A8A90]" />
                          <span>{project.title}</span>
                          <span className="text-[#8A8A90]">• {project.projectType?.replace(/_/g, " ")}</span>
                        </p>
                      )}
                    </div>

                    <StatusPill status={req.status} />
                  </div>

                  {/* Casting Message Body */}
                  <div className="mt-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#D7D7DB] leading-relaxed">
                    <span className="text-[10px] text-[#8A8A90] uppercase tracking-wider block mb-1 font-semibold">
                      Note from Casting Department
                    </span>
                    <p className="italic">"{req.message || "We reviewed your monograph and would be delighted to see you read for this role."}"</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(req.id, "ACCEPTED")}
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Invitation</span>
                      </button>

                      <button
                        onClick={() => handleRespond(req.id, "DECLINED")}
                        disabled={isLoading}
                        className="py-2.5 px-4 rounded-full border border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <div className="flex items-center justify-between text-xs text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Invitation Accepted • Audition Confirmed</span>
                      </span>

                      {project?.casterId && onOpenMessage && (
                        <button
                          onClick={() => onOpenMessage(project.casterId)}
                          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat with CD</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#8A8A90] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Invitation Declined</span>
                    </div>
                  )}

                  {role?.id && (
                    <Link
                      to={`/roles/${role.id}`}
                      className="text-center text-[11px] text-[#8A8A90] hover:text-white transition-colors"
                    >
                      Inspect Role Requirements & Audition Sides →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActorRequestsView;
