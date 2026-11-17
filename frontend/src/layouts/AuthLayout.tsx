import React from "react";
import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] relative selection:bg-[#F7FFB8] selection:text-black antialiased py-3 md:py-6 px-2 md:px-4 flex flex-col justify-between">
      {/* Background Ambient Radial Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 ambient-swirl-mesh opacity-80" />

      {/* The Master Site Container Frame */}
      <div className="relative z-10 max-w-345 mx-auto w-full min-h-[95vh] rounded-4xl md:rounded-[44px] bg-[#070707] border border-white/10 shadow-2xl shadow-black overflow-hidden flex flex-col justify-between p-6 sm:p-10">
        {/* Top Header */}
        <header className="flex items-center justify-between w-full pb-6 border-b border-white/8">
          <Link to="/" className="flex items-center gap-1.5 group select-none">
            <span className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-baseline">
              <span className="font-serif-accent font-normal italic tracking-normal text-white">actors</span>
              <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7FFB8] opacity-80 group-hover:scale-125 transition-transform" />
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/4 hover:bg-white/8 border border-white/10 text-xs font-medium text-[#B9B9BE] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </Link>
        </header>

        {/* Center Content / Auth Gateway */}
        <main className="w-full my-auto py-10 flex items-center justify-center">
          <Outlet />
        </main>

        {/* Subdued Footer */}
        <footer className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8A90] gap-3">
          <span>© 2026 ActorsGlobe Inc. Auteur Editorial Casting Ecosystem.</span>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/help" className="hover:text-white transition-colors">Support</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
