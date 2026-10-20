import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, User, Film } from "lucide-react";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ACTOR" | "CASTER">("ACTOR");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await register({
        name,
        email,
        password,
        role
      });
      if (res.success) {
        navigate("/dashboard");
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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-4xl bg-[#0E0E0F] border border-white/10 p-8 md:p-10 glass shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF97CA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-medium tracking-tight text-white flex items-baseline justify-center">
              <span className="font-serif-accent font-normal italic text-white">actors</span>
              <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
            </span>
          </Link>
          <h1 className="text-2xl font-normal text-white tracking-tight">Join the Casting Sanctuary</h1>
          <p className="text-xs text-[#8A8A90] mt-1">Select your role to configure your digital monograph</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-black/40 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setRole("ACTOR")}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              role === "ACTOR"
                ? "bg-white text-black shadow-md"
                : "text-[#B9B9BE] hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Actor / Talent</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("CASTER")}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              role === "CASTER"
                ? "bg-white text-black shadow-md"
                : "text-[#B9B9BE] hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Casting Director</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Full Name / Stage Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lewis Daller"
              className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
            />
          </div>

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
              minLength={6}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-white/10 text-xs text-[#8A8A90]">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:text-[#F7FFB8] font-medium transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;