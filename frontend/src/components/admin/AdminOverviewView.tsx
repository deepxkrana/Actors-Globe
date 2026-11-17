import React from "react";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  UserX,
  Layers,
  ArrowRight,
  Activity,
  FileText
} from "lucide-react";

interface AdminOverviewViewProps {
  stats: any;
  onNavigateToReports: (filterStatus?: string) => void;
  onNavigateToUsers: () => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  stats,
  onNavigateToReports,
  onNavigateToUsers
}) => {
  const total = stats?.totalReports ?? 0;
  const pending = stats?.pendingReports ?? 0;
  const underReview = stats?.underReviewReports ?? 0;
  const resolved = stats?.resolvedReports ?? 0;
  const dismissed = stats?.dismissedReports ?? 0;
  const suspended = stats?.suspendedUsers ?? 0;

  const targetTypes = stats?.byTargetType || {
    USER: 0,
    PROJECT: 0,
    CASTING_ROLE: 0,
    PROFILE: 0,
    MEDIA: 0,
    MESSAGE: 0
  };

  const recentReports = stats?.recentReports || [];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-5 rounded-3xl bg-[#0E0E0F] border border-white/10 flex flex-col justify-between">
          <span className="text-[11px] text-[#8A8A90] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-white/60" />
            <span>Total Reports</span>
          </span>
          <span className="text-3xl font-light text-white tracking-tight mt-2">{total}</span>
        </div>

        <button
          onClick={() => onNavigateToReports("PENDING")}
          className="p-5 rounded-3xl bg-[#0E0E0F] border border-amber-500/20 hover:border-amber-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
        >
          <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Triage</span>
          </span>
          <span className="text-3xl font-light text-[#F7FFB8] tracking-tight mt-2 group-hover:scale-105 transition-transform">
            {pending}
          </span>
        </button>

        <button
          onClick={() => onNavigateToReports("UNDER_REVIEW")}
          className="p-5 rounded-3xl bg-[#0E0E0F] border border-purple-500/20 hover:border-purple-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
        >
          <span className="text-[11px] text-[#DBAAF4] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
          <span className="text-3xl font-light text-[#DBAAF4] tracking-tight mt-2 group-hover:scale-105 transition-transform">
            {underReview}
          </span>
        </button>

        <button
          onClick={() => onNavigateToReports("RESOLVED")}
          className="p-5 rounded-3xl bg-[#0E0E0F] border border-emerald-500/20 hover:border-emerald-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
        >
          <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
          <span className="text-3xl font-light text-emerald-400 tracking-tight mt-2 group-hover:scale-105 transition-transform">
            {resolved}
          </span>
        </button>

        <button
          onClick={() => onNavigateToReports("DISMISSED")}
          className="p-5 rounded-3xl bg-[#0E0E0F] border border-white/10 hover:border-white/20 text-left transition-all cursor-pointer group flex flex-col justify-between"
        >
          <span className="text-[11px] text-[#8A8A90] uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>Dismissed</span>
          </span>
          <span className="text-3xl font-light text-[#8A8A90] tracking-tight mt-2 group-hover:scale-105 transition-transform">
            {dismissed}
          </span>
        </button>

        <button
          onClick={onNavigateToUsers}
          className="p-5 rounded-3xl bg-[#0E0E0F] border border-red-500/20 hover:border-red-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
        >
          <span className="text-[11px] text-red-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5" />
            <span>Suspended</span>
          </span>
          <span className="text-3xl font-light text-red-400 tracking-tight mt-2 group-hover:scale-105 transition-transform">
            {suspended}
          </span>
        </button>
      </div>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Distribution by Target Type (1 Col) */}
        <div className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F7FFB8]" />
              <span>Target Categories</span>
            </h3>
            <span className="text-[11px] text-[#8A8A90]">Distribution</span>
          </div>

          <div className="flex flex-col gap-4">
            {Object.entries(targetTypes).map(([type, count]: [string, any]) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={type} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{type}</span>
                    <span className="text-[#8A8A90] font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        type === "USER"
                          ? "bg-red-400"
                          : type === "PROJECT"
                          ? "bg-sky-400"
                          : type === "CASTING_ROLE"
                          ? "bg-[#DBAAF4]"
                          : type === "MEDIA"
                          ? "bg-amber-400"
                          : "bg-[#F7FFB8]"
                      }`}
                      style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => onNavigateToReports()}
              className="text-xs text-[#F7FFB8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Explore full triage queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Incident Feed (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0E0E0F] border border-white/10 p-6 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Recent Incident Feed</span>
            </h3>
            <button
              onClick={() => onNavigateToReports()}
              className="text-xs text-[#8A8A90] hover:text-white transition-colors"
            >
              View All Reports
            </button>
          </div>

          {recentReports.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A8A90]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              <span>No pending security incidents recorded. System healthy.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentReports.map((report: any) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/15 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold uppercase">
                        {report.targetType}
                      </span>
                      <span className="text-xs font-medium text-white truncate max-w-xs">
                        {report.reason}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8A8A90]">
                      Reported by {report.reporter?.name || report.reporter?.email || "Anonymous"} •{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase shrink-0 ${
                      report.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : report.status === "UNDER_REVIEW"
                        ? "bg-purple-500/10 text-[#DBAAF4] border border-purple-500/20"
                        : report.status === "DISMISSED"
                        ? "bg-white/5 text-[#8A8A90] border border-white/10"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Compliance & Policy Status Footer */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8A8A90]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F7FFB8]" />
              <span>Standard Moderation SLA: Review within 12 hours of dispatch</span>
            </div>
            <span className="text-[#F7FFB8] font-medium">Platform Conduct v2.4 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
