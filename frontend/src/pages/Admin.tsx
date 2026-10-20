import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { ModerationReport } from "../types";
import { ShieldAlert, Lock } from "lucide-react";

export const Admin: React.FC = () => {
  const { adminToken, setAdminToken } = useAuth();

  const [secretKey, setSecretKey] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");

  const fetchAdminData = async () => {
    if (!adminToken) return;
    setLoadingReports(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports(filterStatus || undefined)
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (reportsRes.success && reportsRes.data) setReports(reportsRes.data);
    } catch {
      console.error("Failed to load admin moderation data");
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken, filterStatus]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await api.adminLogin(secretKey, adminEmail);
      if (res.success && res.data?.token) {
        setAdminToken(res.data.token);
      } else {
        setLoginError(res.error || "Invalid administrator credentials or secret key");
      }
    } catch {
      setLoginError("Admin authentication service unreachable");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleResolve = async (id: string, resolution: "RESOLVED" | "DISMISSED") => {
    const res = await api.resolveReport(id, resolution, "Resolved via Admin Moderation Dashboard");
    if (res.success) {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: resolution } : r))
      );
    }
  };

  const handleSuspend = async (userId: string, isSuspended: boolean) => {
    const res = await api.toggleUserSuspension(userId, isSuspended, "Violation of platform conduct");
    if (res.success) {
      alert(`User suspension status updated to: ${isSuspended ? "Suspended" : "Active"}`);
      fetchAdminData();
    }
  };

  // If not authenticated as Admin, show login view
  if (!adminToken) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-md rounded-4xl bg-[#0E0E0F] border border-white/10 p-8 glass flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">Admin Command Center</h2>
              <span className="text-xs text-[#8A8A90]">Isolated Moderation Gateway</span>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {loginError}
            </div>
          )}

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Admin Email</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@actorsglobe.com"
              className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Administrator Secret Key</label>
            <input
              type="password"
              required
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-white transition-colors cursor-pointer mt-2"
          >
            {loggingIn ? "Verifying Credentials..." : "Access Moderation Portal"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full pb-16 px-4 md:px-7 pt-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Security & Trust Ops
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mt-1">
            Moderation & Platform Administration
          </h1>
        </div>

        <button
          onClick={() => setAdminToken(null)}
          className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
        >
          Exit Admin Mode
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-5">
          <span className="text-xs text-[#8A8A90] block mb-1">Total Reports</span>
          <span className="text-3xl font-bold text-white">{stats?.totalReports || reports.length}</span>
        </div>
        <div className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-5">
          <span className="text-xs text-[#8A8A90] block mb-1">Pending Triage</span>
          <span className="text-3xl font-bold text-[#F7FFB8]">{stats?.pendingReports || 0}</span>
        </div>
        <div className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-5">
          <span className="text-xs text-[#8A8A90] block mb-1">Resolved Reports</span>
          <span className="text-3xl font-bold text-emerald-400">{stats?.resolvedReports || 0}</span>
        </div>
        <div className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-5">
          <span className="text-xs text-[#8A8A90] block mb-1">Suspended Accounts</span>
          <span className="text-3xl font-bold text-red-400">{stats?.suspendedUsers || 0}</span>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Reported Entity Triage Queue</h2>
          <div className="flex items-center gap-2">
            {["PENDING", "RESOLVED", "DISMISSED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === s ? "bg-white text-black" : "text-[#8A8A90] hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loadingReports ? (
          <div className="text-center py-16 text-[#8A8A90]">Loading reports queue...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 rounded-[28px] bg-[#0E0E0F] border border-white/10 text-xs text-[#8A8A90]">
            No reports in this category. System healthy.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-3xl bg-[#0E0E0F] border border-white/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-semibold">
                      {report.targetType}
                    </span>
                    <span className="text-xs text-[#8A8A90]">Target ID: {report.targetId}</span>
                    <span className="text-xs text-[#8A8A90]">• {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white mt-1">{report.reason}</h4>
                  {report.details && <p className="text-xs text-[#8A8A90]">{report.details}</p>}
                </div>

                {report.status === "PENDING" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolve(report.id, "RESOLVED")}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, "DISMISSED")}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 transition-colors"
                    >
                      Dismiss
                    </button>
                    {report.targetType === "USER" && (
                      <button
                        onClick={() => handleSuspend(report.targetId, true)}
                        className="px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                      >
                        Suspend User
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
