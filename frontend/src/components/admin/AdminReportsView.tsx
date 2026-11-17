import React, { useState } from "react";
import type { ModerationReport } from "../../types";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from "lucide-react";

interface AdminReportsViewProps {
  reports: ModerationReport[];
  loading: boolean;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  onRefresh: () => void;
  onInspectReport: (report: ModerationReport) => void;
  onStatusUpdate: (
    reportId: string,
    status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED",
    note?: string
  ) => Promise<void>;
  onOpenModerateUser: (userId: string, defaultAction: "SUSPEND" | "REACTIVATE") => void;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({
  reports,
  loading,
  filterStatus,
  onFilterStatusChange,
  onRefresh,
  onInspectReport,
  onStatusUpdate,
  onOpenModerateUser
}) => {
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredReports = reports.filter((r) => {
    const matchesTargetType =
      targetTypeFilter === "ALL" || r.targetType === targetTypeFilter;

    const matchesSearch =
      (r.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.details || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.targetId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reporter?.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTargetType && matchesSearch;
  });

  const handleQuickStatus = async (
    reportId: string,
    status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED"
  ) => {
    setActionLoadingId(reportId);
    try {
      await onStatusUpdate(reportId, status);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"].map((status) => (
            <button
              key={status}
              onClick={() => onFilterStatusChange(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filterStatus === status
                  ? "bg-[#F7FFB8] text-black font-semibold shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-[#8A8A90] hover:text-white border border-white/5"
              }`}
            >
              {status === "ALL" ? "All Statuses" : status.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Search & Target Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#8A8A90] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search reports or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or ID..."
              className="w-full h-9 pl-9 pr-3 rounded-full bg-[#0E0E0F] input-editorial text-xs"
            />
          </div>

          <select
            aria-label="Filter by incident target category"
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-full bg-[#0E0E0F] input-editorial text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="USER">User Accounts</option>
            <option value="PROJECT">Productions</option>
            <option value="CASTING_ROLE">Casting Roles</option>
            <option value="PROFILE">Actor Monographs</option>
            <option value="MEDIA">Uploaded Media</option>
            <option value="MESSAGE">Direct Messages</option>
          </select>

          <button
            onClick={onRefresh}
            className="h-9 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#8A8A90] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Refresh queue"
          >
            <Filter className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-xs text-[#8A8A90]">
          <div className="w-6 h-6 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin mr-3" />
          <span>Retrieving moderation queue...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 rounded-[28px] bg-[#0E0E0F] border border-white/10 p-8">
          <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-medium text-white mb-1">Queue is clear</h3>
          <p className="text-xs text-[#8A8A90] max-w-sm mx-auto">
            {searchQuery || targetTypeFilter !== "ALL" || filterStatus !== "ALL"
              ? "No incident reports match your selected criteria."
              : "All security reports have been triaged. No outstanding violations."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredReports.map((report) => {
            const isPending = report.status === "PENDING";
            const isUnderReview = report.status === "UNDER_REVIEW";
            const isResolved = report.status === "RESOLVED";
            const isDismissed = report.status === "DISMISSED";

            const reportedUserId =
              report.reportedUserId || (report.targetType === "USER" ? report.targetId : undefined);

            return (
              <div
                key={report.id}
                className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-5 md:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:border-white/20 transition-all"
              >
                {/* Left Section: Details */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        report.targetType === "USER"
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : report.targetType === "PROJECT"
                          ? "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                          : report.targetType === "CASTING_ROLE"
                          ? "bg-purple-500/15 text-[#DBAAF4] border border-purple-500/20"
                          : report.targetType === "MEDIA"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          : "bg-[#F7FFB8]/15 text-[#F7FFB8] border border-[#F7FFB8]/20"
                      }`}
                    >
                      {report.targetType}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isResolved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : isUnderReview
                          ? "bg-purple-500/10 text-[#DBAAF4] border border-purple-500/20"
                          : isDismissed
                          ? "bg-white/5 text-[#8A8A90] border border-white/10"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {report.status}
                    </span>

                    <span className="text-[11px] text-[#8A8A90] font-mono">
                      Ref: {report.targetId.slice(0, 12)}...
                    </span>

                    <span className="text-[11px] text-[#8A8A90] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-medium text-white">{report.reason}</h4>
                    {report.details && (
                      <p className="text-xs text-[#8A8A90] line-clamp-2 mt-1 leading-relaxed">
                        {report.details}
                      </p>
                    )}
                  </div>

                  {/* Reporter & Reported Info */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8A8A90] pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#F7FFB8]" />
                      <span>Reporter: {report.reporter?.name || report.reporter?.email || "Anonymous"}</span>
                    </span>

                    {report.reportedUser && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-red-400" />
                        <span>Subject: {report.reportedUser.name}</span>
                        {report.reportedUser.isActive === false && (
                          <span className="text-[10px] text-red-400 font-semibold">(Suspended)</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section: Triage Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => onInspectReport(report)}
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 text-[#F7FFB8]" />
                  </button>

                  {(isPending || isUnderReview) && (
                    <>
                      <button
                        onClick={() => handleQuickStatus(report.id, "DISMISSED")}
                        disabled={actionLoadingId === report.id}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-[#8A8A90] hover:text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleQuickStatus(report.id, "UNDER_REVIEW")}
                          disabled={actionLoadingId === report.id}
                          className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#DBAAF4] text-xs font-medium hover:bg-purple-500/20 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Investigate</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleQuickStatus(report.id, "RESOLVED")}
                        disabled={actionLoadingId === report.id}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    </>
                  )}

                  {reportedUserId && (
                    <button
                      onClick={() => onOpenModerateUser(reportedUserId, "SUSPEND")}
                      className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      Suspend User
                    </button>
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
