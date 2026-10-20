import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { adminToken, setAdminToken } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    setAdminToken(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] relative selection:bg-[#F7FFB8] selection:text-black antialiased py-3 md:py-6 px-2 md:px-4 flex flex-col justify-between">
      {/* Background Ambient Radial Glow (Red/Amber tint for Security Ops) */}
      <div className="fixed inset-0 pointer-events-none z-0 ambient-swirl-mesh opacity-60" />

      {/* The Master Container Frame */}
      <div className="relative z-10 max-w-345 mx-auto w-full min-h-[95vh] rounded-4xl md:rounded-[44px] bg-[#070707] border border-white/10 shadow-2xl shadow-black overflow-hidden flex flex-col justify-between p-4 sm:p-8">
        {/* Security Command Header */}
        <header className="flex items-center justify-between w-full pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 group select-none">
              <span className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-baseline">
                <span className="font-serif-accent font-normal italic tracking-normal text-white">actors</span>
                <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
              </span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Trust & Safety</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/4 hover:bg-white/8 border border-white/10 text-xs text-[#B9B9BE] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Public</span>
            </Link>

            {adminToken && (
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 transition-colors cursor-pointer"
                title="End Security Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Admin Content Outlet */}
        <main className="w-full flex-1 py-6">
          <Outlet />
        </main>

        {/* Security Audit Footer */}
        <footer className="pt-4 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8A8A90] gap-2">
          <span>Security & Moderation Command Center — Privileged Access Isolated Node</span>
          <span>Compliance Session Encrypted (TLS 1.3 / AES-256)</span>
        </footer>
      </div>
    </div>
  );
};
