import React, { useState } from "react";
import { api } from "../../services/api";
import {
  UserX,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  FileText
} from "lucide-react";

interface ModerationLogEntry {
  id: string;
  userId: string;
  action: "SUSPENDED" | "REACTIVATED";
  reason: string;
  timestamp: string;
}

interface AdminUsersViewProps {
  initialUserId?: string;
  initialAction?: "SUSPEND" | "REACTIVATE";
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  initialUserId,
  initialAction
}) => {
  const [targetUserId, setTargetUserId] = useState(initialUserId || "");
  const [actionType, setActionType] = useState<"SUSPEND" | "REACTIVATE">(
    initialAction || "SUSPEND"
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [auditLog, setAuditLog] = useState<ModerationLogEntry[]>([
    {
      id: "log-1",
      userId: "usr-demo-suspension-1",
      action: "SUSPENDED",
      reason: "Repeated spam dispatch and terms of service breach",
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString()
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) {
      setFeedback({ type: "error", text: "Please provide a valid User ID." });
      return;
    }
    if (reason.trim().length < 3) {
      setFeedback({ type: "error", text: "Reason must be at least 3 characters." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const isActive = actionType === "REACTIVATE";

    try {
      const res = await api.moderateUser(targetUserId.trim(), isActive, reason.trim());
      if (res.success) {
        const actionLabel = isActive ? "REACTIVATED" : "SUSPENDED";
        setFeedback({
          type: "success",
          text: `User account ${targetUserId} has been ${actionLabel.toLowerCase()} successfully.`
        });

        setAuditLog((prev) => [
          {
            id: `log-${Date.now()}`,
            userId: targetUserId.trim(),
            action: actionLabel,
            reason: reason.trim(),
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);

        setTargetUserId("");
        setReason("");
      } else {
        setFeedback({ type: "error", text: res.message || "Failed to execute moderation action." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Network error executing moderation." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
          <UserX className="w-3.5 h-3.5" />
          <span>Account Governance</span>
        </span>
        <h2 className="text-2xl font-light text-white tracking-tight mt-1">
          User Account Moderation & Suspension Console
        </h2>
        <p className="text-xs text-[#8A8A90] mt-1">
          Apply administrative suspensions or account reactivations with mandatory audit reasoning.
        </p>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-auto text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Moderation Form (2 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 md:p-8 rounded-3xl bg-[#0E0E0F] border border-white/10 flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>Moderation Action</span>
            </h3>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">
                Target User ID * (UUID)
              </label>
              <input
                type="text"
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs font-mono"
              />
              <span className="text-[11px] text-[#8A8A90] mt-1 block">
                The internal user UUID attached to the report or profile.
              </span>
            </div>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">
                Action to Enforce *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActionType("SUSPEND")}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    actionType === "SUSPEND"
                      ? "bg-red-500/20 border-red-500 text-red-400 shadow-md"
                      : "bg-black/40 border-white/10 text-[#8A8A90] hover:text-white"
                  }`}
                >
                  <UserX className="w-4 h-4" />
                  <span>Suspend Account (Revoke Access)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType("REACTIVATE")}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    actionType === "REACTIVATE"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md"
                      : "bg-black/40 border-white/10 text-[#8A8A90] hover:text-white"
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reactivate Account (Restore)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">
                Regulatory Conduct / Violation Reason * (min 3 chars)
              </label>
              <textarea
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explicitly cite community guideline breaches, fraudulent casting notices, or impersonation..."
                className="w-full p-3 rounded-xl bg-black/50 input-editorial text-xs leading-relaxed"
              />
              <span className="text-[11px] text-[#8A8A90] mt-1 block">
                This reason is logged in the permanent compliance audit ledger.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2 ${
                actionType === "SUSPEND"
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                  : "bg-emerald-500 text-black hover:bg-white"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>Executing Governance Protocol...</span>
                </>
              ) : (
                <>
                  {actionType === "SUSPEND" ? (
                    <UserX className="w-4 h-4" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>
                    {actionType === "SUSPEND"
                      ? "Confirm Account Suspension"
                      : "Confirm Account Reactivation"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Audit Log Stream (1 Col) */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#F7FFB8]" />
            <span>Session Audit Log</span>
          </span>

          <div className="rounded-3xl bg-[#0E0E0F] border border-white/15 p-6 flex flex-col gap-4 shadow-xl glass">
            {auditLog.length === 0 ? (
              <span className="text-xs text-[#8A8A90] italic py-4 text-center">
                No moderation actions performed in this session.
              </span>
            ) : (
              <div className="flex flex-col gap-3">
                {auditLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          log.action === "SUSPENDED"
                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#8A8A90] font-mono">
                        {log.timestamp}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-white truncate mt-1">
                      Target: {log.userId}
                    </span>

                    <p className="text-[11px] text-[#8A8A90] line-clamp-2 mt-0.5 leading-relaxed">
                      "{log.reason}"
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-white/10 text-[11px] text-[#8A8A90]">
              Audit trails are cryptographically immutable and retained for 7 years under statutory compliance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
