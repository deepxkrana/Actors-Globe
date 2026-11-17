import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] relative selection:bg-[#F7FFB8] selection:text-black antialiased py-3 md:py-6 px-2 md:px-4">
      {/* Background Ambient Radial Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 ambient-swirl-mesh opacity-80" />

      {/* Skip to Main Content Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only top-4 left-4 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs shadow-xl cursor-pointer"
      >
        Skip to main content
      </a>

      {/* The Master Site Container Frame (1380px max-width, 44px radius, 1px border) */}
      <div className="relative z-10 max-w-345 mx-auto rounded-4xl md:rounded-[44px] bg-[#070707] border border-white/10 shadow-2xl shadow-black overflow-hidden">
        <Navbar />

        <main id="main-content" className="w-full">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export const PublicLayout = Layout;
export default Layout;
