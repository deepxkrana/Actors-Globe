import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Smartphone, AlertCircle, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";

export const VerifyPhone: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // Countdown timer for resend throttling
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length < 4) {
      setErrorMsg("Please enter the SMS verification code");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.verifyPhone(code.trim());
      if (res.success) {
        setSuccessMsg("Phone number verified successfully!");
        await refreshUser();
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setErrorMsg(res.error || "Invalid or expired verification code");
      }
    } catch {
      setErrorMsg("Unable to process phone verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg("");
    try {
      const res = await api.resendVerification("PHONE");
      if (res.success) {
        setCooldown(60);
        if (res.data?.devVerificationCode) {
          setDevCodeHint(res.data.devVerificationCode);
          setCode(res.data.devVerificationCode);
        }
        setSuccessMsg("A new SMS verification code has been dispatched!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(res.error || "Failed to resend SMS code");
      }
    } catch {
      setErrorMsg("Failed to request resend. Please try again shortly.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[36px] bg-[#0E0E10] border border-white/12 p-8 md:p-10 glass shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#DBAAF4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mx-auto mb-4 text-[#DBAAF4]">
            <Smartphone className="w-7 h-7" />
          </div>

          <h1 className="text-2xl md:text-3xl font-normal text-white tracking-tight">Verify Phone Number</h1>
          <p className="text-xs text-[#8A8A90] mt-1.5 leading-relaxed">
            We sent an SMS security code to{" "}
            <strong className="text-white">{user?.phone || "your registered mobile number"}</strong>.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Development Mode Quick Code Helper */}
        {devCodeHint && (
          <div className="mb-5 p-3 rounded-2xl bg-[#DBAAF4]/10 border border-[#DBAAF4]/25 text-xs text-[#DBAAF4] flex items-center justify-between">
            <span className="font-mono">Dev SMS Code: <strong>{devCodeHint}</strong></span>
            <button
              type="button"
              onClick={() => setCode(devCodeHint)}
              className="text-[11px] underline underline-offset-2 hover:text-white"
            >
              Fill Code
            </button>
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <label htmlFor="verify-phone-code" className="text-xs text-[#D7D7DB] block mb-2 font-medium text-center">
              Enter 6-Digit SMS Security Code
            </label>
            <input
              id="verify-phone-code"
              type="text"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full h-14 px-4 rounded-2xl bg-black/60 input-editorial-mauve text-center text-2xl font-mono tracking-[0.35em]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#DBAAF4] text-black font-semibold text-xs hover:bg-[#c995e8] transition-all shadow-lg hover:scale-[1.01] cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Verifying..." : "Verify Mobile Number"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Resend actions */}
        <div className="flex flex-col items-center justify-center gap-2 mt-6 pt-6 border-t border-white/10 text-xs text-[#8A8A90]">
          <div className="flex items-center gap-2">
            <span>Didn't receive SMS?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className={`font-medium transition-colors flex items-center gap-1 ${
                cooldown > 0
                  ? "text-[#8A8A90] cursor-not-allowed"
                  : "text-[#DBAAF4] hover:underline cursor-pointer"
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend SMS"}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mt-2 text-[11px]">
            <Link to="/verify-email" className="text-[#8A8A90] hover:text-white transition-colors">
              Verify Email Instead
            </Link>
            <span>•</span>
            <Link to="/dashboard" className="text-[#8A8A90] hover:text-white transition-colors">
              Skip to Workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
