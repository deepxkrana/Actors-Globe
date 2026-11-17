import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from "lucide-react";

export const ResetPassword: React.FC = () => {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token || token.trim().length < 8) {
      setErrorMsg("A valid password reset token is required");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token.trim(), newPassword);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "Reset token is invalid or has expired");
      }
    } catch {
      setErrorMsg("Connection failure during password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[36px] bg-[#0E0E10] border border-white/12 p-8 md:p-10 glass shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#F7FFB8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mx-auto mb-4 text-[#F7FFB8]">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-2xl md:text-3xl font-normal text-white tracking-tight">Create New Password</h1>
          <p className="text-xs text-[#8A8A90] mt-1.5 leading-relaxed">
            Configure a secure password for your ActorsGlobe workspace
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white">Password Updated</h3>
            <p className="text-xs text-[#D7D7DB] max-w-xs leading-relaxed">
              Your credentials have been securely updated. You can now access your workspace with your new password.
            </p>
            <Link
              to="/login"
              className="mt-3 w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reset-token" className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Reset Token *</label>
              <input
                id="reset-token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token here"
                className="w-full h-11 px-4 rounded-xl bg-black/60 input-editorial font-mono text-xs"
              />
            </div>

            <div>
              <label htmlFor="reset-new-password" className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">New Password *</label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-11 pl-4 pr-10 rounded-xl bg-black/60 input-editorial text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A90] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Confirm New Password *</label>
              <input
                id="reset-confirm-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full h-11 px-4 rounded-xl bg-black/60 input-editorial text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-all shadow-lg hover:scale-[1.01] cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Updating Credentials..." : "Reset Password & Secure Account"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="text-center mt-6 pt-6 border-t border-white/10 text-xs text-[#8A8A90]">
          Remember your credentials?{" "}
          <Link to="/login" className="text-white hover:text-[#F7FFB8] font-medium transition-colors underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
