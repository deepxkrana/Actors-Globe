import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setErrorMsg(res.error || "Invalid email or password");
      }
    } catch {
      setErrorMsg("Unable to connect to authentication server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-4xl bg-[#0E0E0F] border border-white/10 p-8 md:p-10 glass shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7FFB8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-medium tracking-tight text-white flex items-baseline justify-center">
              <span className="font-serif-accent font-normal italic text-white">actors</span>
              <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
            </span>
          </Link>
          <h1 className="text-2xl font-normal text-white tracking-tight">Sign In to Your Workspace</h1>
          <p className="text-xs text-[#8A8A90] mt-1">Access your monographs, auditions, and casting calls</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-white transition-colors cursor-pointer mt-3 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-white/10 text-xs text-[#8A8A90]">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-white hover:text-[#F7FFB8] font-medium transition-colors">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;