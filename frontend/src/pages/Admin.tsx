import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { ModerationReport } from "../types";
import {
  ShieldAlert,
  Lock,
  Activity,
  FileText,
  UserX,
  KeyRound
} from "lucide-react";

import { AdminOverviewView } from "../components/admin/AdminOverviewView";
import { AdminReportsView } from "../components/admin/AdminReportsView";
import { AdminUsersView } from "../components/admin/AdminUsersView";
import { AdminReportDetailModal } from "../components/admin/AdminReportDetailModal";

export const Admin: React.FC = () => {
  const { adminToken, setAdminToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tab state
  const getInitialTab = () => {
    if (location.pathname.includes("/reports")) return "reports";
    if (location.pathname.includes("/users")) return "users";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  // Login form state
  const [adminEmail, setAdminEmail] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Admin operational data
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Inspection modal & user moderation prefill
  const [inspectingReport, setInspectingReport] = useState<ModerationReport | null>(null);
  const [moderateUserId, setModerateUserId] = useState<string | undefined>(undefined);
  const [moderateAction, setModerateAction] = useState<"SUSPEND" | "REACTIVATE">("SUSPEND");

  const fetchAdminData = useCallback(async () => {
    if (!adminToken) return;
    setLoadingReports(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports(filterStatus !== "ALL" ? { status: filterStatus } : undefined)
      ]);
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (reportsRes.success && reportsRes.data) {
        setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingReports(false);
    }
  }, [adminToken, filterStatus]);

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken, fetchAdminData]);

  // Sync tab with URL if user deep links
  useEffect(() => {
    if (location.pathname.includes("/reports")) setActiveTab("reports");
    else if (location.pathname.includes("/users")) setActiveTab("users");
    else if (location.pathname.includes("/dashboard") || location.pathname === "/admin") setActiveTab("overview");
  }, [location.pathname]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await api.adminLogin(secretKey, adminEmail);
      if (res.success && res.data?.token) {
        setAdminToken(res.data.token);
      } else {
        setLoginError(res.error || res.message || "Invalid administrator credentials or secret key");
      }
    } catch {
      setLoginError("Admin authentication service unreachable");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleStatusUpdate = async (
    reportId: string,
    status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED",
    note?: string
  ) => {
    const res = await api.updateReportStatus(reportId, status, note);
    if (res.success) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status, resolutionNote: note || r.resolutionNote } : r
        )
      );
      // Refresh metrics in background
      api.getAdminStats().then((s) => s.success && s.data && setStats(s.data));
    }
  };

  const handleOpenModerateUser = (userId: string, defaultAction: "SUSPEND" | "REACTIVATE") => {
    setModerateUserId(userId);
    setModerateAction(defaultAction);
    setActiveTab("users");
    setInspectingReport(null);
  };

  // -------------------------------------------------------------
  // Unauthenticated Admin Portal Screen
  // -------------------------------------------------------------
  if (!adminToken) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-md rounded-4xl bg-[#0E0E0F] border border-white/10 p-8 glass flex flex-col gap-5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest block">
                Privileged Access Node
              </span>
              <h2 className="text-xl font-medium text-white tracking-tight">Admin Command Center</h2>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {loginError}
            </div>
          )}

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Administrator Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@actorsglobe.com"
              className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial-danger text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">
              Administrator Master Password / Secret Key
            </label>
            <input
              type="password"
              required
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial-danger text-xs font-mono"
            />
          </div>

          {/* Seeded Admin Credentials Chip */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
            <span className="text-[11px] text-[#8A8A90] font-medium flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-[#F7FFB8]" />
              <span>Seeded Dev Credentials</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setAdminEmail("admin@actorsglobe.com");
                setSecretKey("AdminPass123!");
              }}
              className="text-left text-xs text-[#F7FFB8] hover:underline font-mono cursor-pointer"
            >
              admin@actorsglobe.com / AdminPass123!
            </button>
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3.5 rounded-full bg-red-500 text-white font-semibold text-xs hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-red-500/20 mt-1 flex items-center justify-center gap-2"
          >
            {loggingIn ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Verifying Security Keys...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Authenticate Security Session</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Admin Command Center
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 w-full pb-16 px-4 md:px-7 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-red-400 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Security & Trust Operations</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mt-1">
            Moderation & Compliance Command Desk
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Node Encrypted</span>
          </span>

          <button
            onClick={() => {
              setAdminToken(null);
              navigate("/");
            }}
            className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors cursor-pointer"
          >
            Exit Admin Mode
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-[#F7FFB8] text-black shadow-md"
              : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Dashboard & Threat Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "reports"
              ? "bg-[#F7FFB8] text-black shadow-md"
              : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Reports Triage Queue ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-[#F7FFB8] text-black shadow-md"
              : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Account Moderation & Governance</span>
        </button>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === "overview" && (
        <AdminOverviewView
          stats={stats}
          onNavigateToReports={(status) => {
            if (status) setFilterStatus(status);
            setActiveTab("reports");
          }}
          onNavigateToUsers={() => setActiveTab("users")}
        />
      )}

      {/* Tab 2: Reports Queue */}
      {activeTab === "reports" && (
        <AdminReportsView
          reports={reports}
          loading={loadingReports}
          filterStatus={filterStatus}
          onFilterStatusChange={(status) => setFilterStatus(status)}
          onRefresh={fetchAdminData}
          onInspectReport={(report) => setInspectingReport(report)}
          onStatusUpdate={handleStatusUpdate}
          onOpenModerateUser={handleOpenModerateUser}
        />
      )}

      {/* Tab 3: User Moderation Console */}
      {activeTab === "users" && (
        <AdminUsersView
          initialUserId={moderateUserId}
          initialAction={moderateAction}
        />
      )}

      {/* Report Details Modal */}
      {inspectingReport && (
        <AdminReportDetailModal
          report={inspectingReport}
          onClose={() => setInspectingReport(null)}
          onStatusUpdate={handleStatusUpdate}
          onOpenModerateUser={handleOpenModerateUser}
        />
      )}
    </div>
  );
};

export default Admin;
