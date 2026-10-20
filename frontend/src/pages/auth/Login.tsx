import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath);
      } else {
        setErrorMsg(res.error || "Invalid email or password");
      }
    } catch {
      setErrorMsg("Unable to connect to authentication server");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoRole: "ACTOR" | "CASTER" | "ADMIN") => {
    if (demoRole === "ACTOR") {
      setEmail("actor@actorsglobe.com");
      setPassword("Password123!");
    } else if (demoRole === "CASTER") {
      setEmail("caster@actorsglobe.com");
      setPassword("Password123!");
    } else {
      setEmail("admin@actorsglobe.com");
      setPassword("AdminPass123!");
    }
    setErrorMsg("");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[36px] bg-[#0E0E10] border border-white/12 p-8 md:p-10 glass shadow-2xl relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#F7FFB8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-medium tracking-tight text-white flex items-baseline justify-center">
              <span className="font-serif italic font-normal text-white">actors</span>
              <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-normal text-white tracking-tight">Sign In to Workspace</h1>
          <p className="text-xs text-[#8A8A90] mt-1.5">
            Enter your credentials to access auditions, monographs, and notices
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Fast-Fill Chips for Testing */}
        <div className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#8A8A90] uppercase tracking-wider flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-[#F7FFB8]" />
              Quick Test Credentials
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("ACTOR")}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-[11px] font-medium border border-white/10 transition-colors cursor-pointer text-left"
            >
              Demo <strong className="text-[#F7FFB8]">Actor</strong>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("CASTER")}
              className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-[11px] font-medium border border-white/10 transition-colors cursor-pointer text-left"
            >
              Demo <strong className="text-[#DBAAF4]">Caster</strong>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full h-11 px-4 rounded-xl bg-black/60 input-editorial text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-xs text-[#D7D7DB] font-medium">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#8A8A90] hover:text-[#F7FFB8] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-black/60 input-editorial text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A90] hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 text-[#F7FFB8] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs text-[#8A8A90] cursor-pointer">
              Remember this device for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-all shadow-lg hover:scale-[1.01] cursor-pointer mt-3 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-white/10 text-xs text-[#8A8A90]">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-white hover:text-[#F7FFB8] font-medium transition-colors underline underline-offset-4">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;