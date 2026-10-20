import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, Sparkles } from "lucide-react";

import { NotificationBell } from "./NotificationBell";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Featured Talent", path: "/talent" },
    { label: "Reviews", path: "/reviews" },
    { label: "Our Blog", path: "/blog" },
    { label: "Casting Discovery", path: "/discovery" }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="w-full pt-4 pb-2 px-4 md:px-7 max-w-345 mx-auto z-50 relative">
      <div className="flex items-center justify-between h-16 md:h-20">
        {/* Brand Wordmark */}
        <Link to="/" className="flex items-center gap-1.5 group select-none">
          <span className="text-2xl md:text-3xl font-medium tracking-tight text-white flex items-baseline">
            <span className="font-serif-accent font-normal italic tracking-normal text-white">actors</span>
            <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7FFB8] opacity-80 group-hover:scale-125 transition-transform" />
        </Link>

        {/* Center Capsule Navigation Pill (Desktop) */}
        <nav
          className="hidden lg:flex items-center p-1 rounded-full bg-white/4 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/40"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white border border-white/15 shadow-sm"
                    : "text-[#B9B9BE] hover:text-white hover:bg-white/4"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />

              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/6 border border-white/15 hover:bg-white/10 text-sm font-medium text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#F7FFB8]" />
                <span>Dashboard</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-[#D7D7DB] font-normal">
                  {user.role}
                </span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/4 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-white/70 hover:text-red-400 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full border border-white/20 text-sm font-medium text-white hover:bg-white/8 transition-all duration-200"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-full bg-[#F7FFB8] text-black text-sm font-semibold hover:bg-white transition-all duration-200 shadow-md shadow-[#F7FFB8]/10 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Right Controls */}
        <div className="flex lg:hidden items-center gap-2">
          {user && <NotificationBell />}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/6 border border-white/15 text-white cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-label="Mobile Navigation"
          className="lg:hidden fixed inset-0 top-18 bg-[#050505]/95 backdrop-blur-2xl z-40 p-6 flex flex-col justify-between border-t border-white/10 animate-in fade-in duration-200"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-lg font-medium rounded-2xl transition-colors ${
                  isActive(link.path)
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-[#B9B9BE] hover:text-white hover:bg-white/4"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-full bg-white/10 border border-white/20 font-medium text-white"
                >
                  Go to Dashboard ({user.role})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full py-3 text-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-full border border-white/20 font-medium text-white hover:bg-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center rounded-full bg-[#F7FFB8] text-black font-semibold shadow-lg shadow-[#F7FFB8]/20"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
