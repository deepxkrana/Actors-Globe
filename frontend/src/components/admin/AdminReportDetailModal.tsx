import React, { useState } from "react";
import type { ModerationReport } from "../../types";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  AlertTriangle,
  FileText
} from "lucide-react";

interface AdminReportDetailModalProps {
  report: ModerationReport | null;
  onClose: () => void;
  onStatusUpdate: (
    reportId: string,
    status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED",
    note?: string
  ) => Promise<void>;
  onOpenModerateUser: (userId: string, defaultAction: "SUSPEND" | "REACTIVATE") => void;
}

export const AdminReportDetailModal: React.FC<AdminReportDetailModalProps> = ({
  report,
  onClose,
  onStatusUpdate,
  onOpenModerateUser
}) => {
  const [resolutionNote, setResolutionNote] = useState(
    report?.resolutionNote || report?.resolutionNotes || ""
  );
  const [updating, setUpdating] = useState(false);

  if (!report) return null;

  const handleAction = async (status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED") => {
    setUpdating(true);
    try {
      await onStatusUpdate(report.id, status, resolutionNote.trim() || undefined);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  const reportedUserId = report.reportedUserId || (report.targetType === "USER" ? report.targetId : undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0E0E0F] border border-white/20 p-6 md:p-8 flex flex-col gap-6 shadow-2xl glass"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold uppercase tracking-wider">
                  {report.targetType} Incident
                </span>
                <span className="text-xs text-[#8A8A90] font-mono">
                  #{report.id.slice(0, 8)}
                </span>
              </div>
              <h3 id="report-modal-title" className="text-lg font-medium text-white mt-1">
                Security Incident Investigation
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8A8A90] hover:text-white text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Status & Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 text-xs">
          <div>
            <span className="text-[#8A8A90] block mb-0.5 font-medium">Status</span>
            <span className="font-semibold text-white">{report.status}</span>
          </div>
          <div>
            <span className="text-[#8A8A90] block mb-0.5 font-medium">Target Reference</span>
            <span className="font-mono text-[#F7FFB8] text-[11px] truncate block">
              {report.targetId}
            </span>
          </div>
          <div>
            <span className="text-[#8A8A90] block mb-0.5 font-medium">Reported Date</span>
            <span className="text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#8A8A90]" />
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Reason & Narrative Body */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Reason & Violation Category</span>
          </span>
          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 text-sm text-red-200 font-medium">
            {report.reason}
          </div>

          {report.details && (
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-[#D7D7DB] leading-relaxed whitespace-pre-line">
              <div className="text-[11px] text-[#8A8A90] uppercase font-semibold mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Reporter's Statement</span>
              </div>
              {report.details}
            </div>
          )}
        </div>

        {/* Parties Involved */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reporter */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
            <span className="text-[11px] text-[#8A8A90] uppercase font-semibold">Reporting Party</span>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#F7FFB8]" />
              <span className="text-xs text-white font-medium">
                {report.reporter?.name || "Verified User"}
              </span>
            </div>
            <span className="text-[11px] text-[#8A8A90] font-mono">
              {report.reporter?.email || "Anonymous / Secure Dispatch"}
            </span>
            {report.reporter?.role && (
              <span className="text-[10px] text-[#F7FFB8] uppercase">
                {report.reporter.role}
              </span>
            )}
          </div>

          {/* Reported User */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
            <span className="text-[11px] text-[#8A8A90] uppercase font-semibold">Reported Entity / User</span>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white font-medium">
                {report.reportedUser?.name || "Subject of Report"}
              </span>
            </div>
            <span className="text-[11px] text-[#8A8A90] font-mono">
              {report.reportedUser?.email || `ID: ${report.targetId.slice(0, 16)}...`}
            </span>
            {reportedUserId && (
              <button
                onClick={() => onOpenModerateUser(reportedUserId, "SUSPEND")}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline mt-1 text-left cursor-pointer"
              >
                Inspect / Suspend User Account →
              </button>
            )}
          </div>
        </div>

        {/* Resolution Note Entry */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider">
            Administrative Resolution Log & Notes
          </label>
          <textarea
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Record investigation findings, actions taken, or reason for dismissal..."
            className="w-full p-3 rounded-xl bg-black/50 input-editorial text-xs leading-relaxed"
          />
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs text-[#8A8A90] hover:text-white"
          >
            Close Window
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={updating}
              onClick={() => handleAction("UNDER_REVIEW")}
              className="px-3.5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mark Under Review</span>
            </button>

            <button
              type="button"
              disabled={updating}
              onClick={() => handleAction("DISMISSED")}
              className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Dismiss Incident</span>
            </button>

            <button
              type="button"
              disabled={updating}
              onClick={() => handleAction("RESOLVED")}
              className="px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve Incident</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
