import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "../components/NotificationBell";
import { LogOut, Compass } from "lucide-react";

export const WorkspaceLayout: React.FC = () => {
  const { user, logout, isActor, isCaster } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] relative selection:bg-[#F7FFB8] selection:text-black antialiased py-3 md:py-6 px-2 md:px-4">
      {/* Background Ambient Radial Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 ambient-swirl-mesh opacity-80" />

      {/* Skip to Main Content Link for Keyboard Navigation */}
      <a
        href="#workspace-main-content"
        className="sr-only focus:not-sr-only top-4 left-4 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs shadow-xl cursor-pointer"
      >
        Skip to main content
      </a>

      {/* The Master Site Container Frame */}
      <div className="relative z-10 max-w-345 mx-auto rounded-4xl md:rounded-[44px] bg-[#070707] border border-white/10 shadow-2xl shadow-black overflow-hidden flex flex-col justify-between min-h-[92vh]">
        {/* Workspace Top Navigation Bar */}
        <header className="w-full pt-4 pb-3 px-4 md:px-8 border-b border-white/10">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Wordmark + Workspace Badge */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-1.5 group select-none">
                <span className="text-2xl md:text-3xl font-medium tracking-tight text-white flex items-baseline">
                  <span className="font-serif-accent font-normal italic tracking-normal text-white">actors</span>
                  <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F7FFB8] opacity-80 group-hover:scale-125 transition-transform" />
              </Link>

              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/6 border border-white/10 text-[#D7D7DB]">
                {isActor ? "Actor Studio" : isCaster ? "Caster Suite" : "Workspace"}
              </span>
            </div>

            {/* Right: Actions, Notifications, User Profile & Logout */}
            <div className="flex items-center gap-3">
              <Link
                to="/discovery"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/4 hover:bg-white/8 border border-white/10 text-xs font-medium text-[#B9B9BE] hover:text-white transition-colors"
                title="Browse Public Opportunities"
              >
                <Compass className="w-3.5 h-3.5 text-[#F7FFB8]" />
                <span>Discovery</span>
              </Link>

              <NotificationBell />

              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-9 h-9 rounded-full bg-[#F7FFB8]/20 border border-[#F7FFB8]/30 flex items-center justify-center font-bold text-[#F7FFB8] text-xs">
                  {user?.name?.[0] || user?.email?.[0] || "U"}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-medium text-white truncate max-w-32">{user?.name || user?.email}</span>
                  <span className="text-[10px] text-[#8A8A90] font-normal uppercase">{user?.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/4 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-white/70 hover:text-red-400 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main id="workspace-main-content" className="w-full flex-1 p-4 md:p-8">
          <Outlet />
        </main>

        {/* Workspace Footer */}
        <footer className="w-full py-4 px-6 md:px-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8A90] gap-2">
          <span>ActorsGlobe Pro Workspace — Auteur Creative Platform</span>
          <div className="flex items-center gap-4">
            <Link to="/subscriptions" className="hover:text-white transition-colors">Membership</Link>
            <Link to="/help" className="hover:text-white transition-colors">Support & Help</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
