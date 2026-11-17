import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await api.forgotPassword(email.trim());
      if (res.success) {
        setSuccessMsg(
          res.message || "If an account with this email exists, a password reset token has been dispatched."
        );
        if (res.data?.devResetToken) {
          setDevResetToken(res.data.devResetToken);
        }
      } else {
        setErrorMsg(res.error || "Unable to request password reset");
      }
    } catch {
      setErrorMsg("Connection failure during password reset dispatch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[36px] bg-[#0E0E10] border border-white/12 p-8 md:p-10 glass shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#F7FFB8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mx-auto mb-4 text-[#F7FFB8]">
            <KeyRound className="w-7 h-7" />
          </div>

          <h1 className="text-2xl md:text-3xl font-normal text-white tracking-tight">Recover Credentials</h1>
          <p className="text-xs text-[#8A8A90] mt-1.5 leading-relaxed">
            Enter your verified registered email to receive a secure recovery token
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-3 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Development Token Helper */}
        {devResetToken && (
          <div className="mb-5 p-4 rounded-2xl bg-[#F7FFB8]/10 border border-[#F7FFB8]/25 text-xs flex flex-col gap-2">
            <span className="text-[#F7FFB8] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Dev Password Reset Token Generated
            </span>
            <code className="p-2 rounded-lg bg-black/60 text-white font-mono text-[11px] break-all border border-white/10">
              {devResetToken}
            </code>
            <button
              type="button"
              onClick={() => navigate(`/reset-password?token=${encodeURIComponent(devResetToken)}`)}
              className="mt-1 py-2 px-3 rounded-xl bg-[#F7FFB8] text-black font-medium text-xs hover:bg-[#ebf49e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Proceed to Reset with Token</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="forgot-email" className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Account Email Address</label>
            <input
              id="forgot-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full h-11 px-4 rounded-xl bg-black/60 input-editorial text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-all shadow-lg hover:scale-[1.01] cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Transmitting..." : "Send Reset Token"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-white/10 text-xs text-[#8A8A90]">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-white hover:text-[#F7FFB8] font-medium transition-colors inline-flex items-center gap-1 underline underline-offset-4"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
