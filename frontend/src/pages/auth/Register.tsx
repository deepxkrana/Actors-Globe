import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, User, Film, Eye, EyeOff, ArrowRight } from "lucide-react";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"ACTOR" | "CASTER">("ACTOR");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    // Sanitize phone to digits only
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMsg("Phone number must be exactly 10 digits (e.g. 9876543210)");
      return;
    }

    if (!termsAccepted) {
      setErrorMsg("You must accept the Community Guidelines and Terms of Service");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        phone: cleanPhone,
        password,
        role
      });
      if (res.success) {
        // Navigate to email verification challenge
        navigate("/verify-email");
      } else {
        setErrorMsg(res.error || "Registration could not be completed");
      }
    } catch {
      setErrorMsg("Unable to connect to registration service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[36px] bg-[#0E0E10] border border-white/12 p-8 md:p-10 glass shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF97CA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-medium tracking-tight text-white flex items-baseline justify-center">
              <span className="font-serif italic font-normal text-white">actors</span>
              <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-normal text-white tracking-tight">Join the Casting Sanctuary</h1>
          <p className="text-xs text-[#8A8A90] mt-1.5">
            Configure your digital monograph and connect with auteur productions
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setRole("ACTOR")}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === "ACTOR"
                ? "bg-[#F7FFB8] text-black shadow-md scale-[1.01]"
                : "text-[#B9B9BE] hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Actor / Talent</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("CASTER")}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === "CASTER"
                ? "bg-[#F7FFB8] text-black shadow-md scale-[1.01]"
                : "text-[#B9B9BE] hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Casting Director</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="reg-name" className="text-xs text-[#D7D7DB] block mb-1 font-medium">
              {role === "ACTOR" ? "Full Name / Stage Name" : "Director / Company Name"} *
            </label>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === "ACTOR" ? "e.g. Julian Hayes" : "e.g. Horizon Casting Studio"}
              className="w-full h-10 px-4 rounded-xl bg-black/60 input-editorial text-xs"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="text-xs text-[#D7D7DB] block mb-1 font-medium">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full h-10 px-4 rounded-xl bg-black/60 input-editorial text-xs"
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="text-xs text-[#D7D7DB] block mb-1 font-medium">
              Phone Number (10 digits) *
            </label>
            <input
              id="reg-phone"
              type="tel"
              required
              autoComplete="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full h-10 px-4 rounded-xl bg-black/60 input-editorial text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-password" className="text-xs text-[#D7D7DB] block mb-1 font-medium">Password *</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full h-10 pl-3 pr-8 rounded-xl bg-black/60 input-editorial text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A90] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="text-xs text-[#D7D7DB] block mb-1 font-medium">Confirm Password *</label>
              <input
                id="reg-confirm-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-10 px-3 rounded-xl bg-black/60 input-editorial text-xs"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 text-[#F7FFB8] focus:ring-0 cursor-pointer mt-0.5"
            />
            <label htmlFor="terms" className="text-[11px] text-[#8A8A90] leading-relaxed cursor-pointer">
              I agree to the{" "}
              <Link to="/terms" className="text-white hover:underline">Terms of Service</Link>,{" "}
              <Link to="/privacy" className="text-white hover:underline">Privacy Policy</Link>, and{" "}
              <Link to="/guidelines" className="text-white hover:underline">Safety Guidelines</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-all shadow-lg hover:scale-[1.01] cursor-pointer mt-3 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Creating Monograph..." : "Create Account & Verify"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-5 pt-5 border-t border-white/10 text-xs text-[#8A8A90]">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:text-[#F7FFB8] font-medium transition-colors underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;