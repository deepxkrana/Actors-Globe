import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import {
  Film,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Users
} from "lucide-react";

interface RoleDraft {
  id: string;
  title: string;
  description: string;
  genderRequirement: string;
  minAge: string;
  maxAge: string;
}

interface CasterCreateProjectViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CasterCreateProjectView: React.FC<CasterCreateProjectViewProps> = ({
  onSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("FEATURE_FILM");
  const [unionStatus, setUnionStatus] = useState("NON_UNION");
  const [location, setLocation] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);

  // Dynamic roles builder
  const [roles, setRoles] = useState<RoleDraft[]>([
    {
      id: "role-1",
      title: "Lead Character",
      description: "Core dramatic lead for the production with key dialogue arcs.",
      genderRequirement: "ANY",
      minAge: "25",
      maxAge: "45"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAddRole = () => {
    setRoles((prev) => [
      ...prev,
      {
        id: `role-${Date.now()}`,
        title: "",
        description: "",
        genderRequirement: "ANY",
        minAge: "",
        maxAge: ""
      }
    ]);
  };

  const handleRemoveRole = (id: string) => {
    if (roles.length <= 1) return;
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRoleChange = (id: string, field: keyof RoleDraft, value: string) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Validate minimum requirements
    if (synopsis.trim().length < 10) {
      setErrorMsg("Synopsis must be at least 10 characters.");
      setLoading(false);
      return;
    }

    const formattedRoles = roles.map((r) => ({
      title: r.title.trim() || "Featured Character",
      description: r.description.trim() || "Character performance role.",
      genderRequirement: r.genderRequirement,
      minAge: r.minAge ? parseInt(r.minAge, 10) : undefined,
      maxAge: r.maxAge ? parseInt(r.maxAge, 10) : undefined
    }));

    try {
      const res = await api.createProject({
        title: title.trim(),
        description: synopsis.trim(),
        projectType,
        location: location.trim() || "Remote / Worldwide",
        applicationDeadline: applicationDeadline || undefined,
        startDate: startDate || undefined,
        roles: formattedRoles
      });

      if (!res.success) {
        if (res.message?.includes("Upgrade required") || res.message?.includes("subscription")) {
          setShowUpgradeModal(true);
        } else {
          setErrorMsg(res.message || "Failed to create casting call.");
        }
        setLoading(false);
        return;
      }

      // If user opted to publish immediately, call publish endpoint
      const createdId = (res.data as any)?.id || (res as any)?.project?.id;
      if (publishImmediately && createdId) {
        try {
          await api.publishProject(createdId);
        } catch {
          // Keep project created even if publish needs review
        }
      }

      onSuccess();
    } catch (err: any) {
      if (err.message?.includes("Upgrade required") || err.message?.includes("subscription")) {
        setShowUpgradeModal(true);
      } else {
        setErrorMsg(err.message || "An unexpected error occurred while publishing.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A8A90] font-medium flex items-center gap-1.5">
            <span>Casting Production Hub</span>
            <span>•</span>
            <span className="text-[#F7FFB8]">New Casting Notice</span>
          </span>
          <h2 className="text-2xl font-light text-white tracking-tight mt-1">
            Create Production Casting Notice
          </h2>
          <p className="text-xs text-[#8A8A90] mt-1">
            Publish character breakdowns, sides, and audition criteria to performers worldwide.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-[#D7D7DB] hover:text-white hover:bg-white/10 transition-colors"
        >
          Cancel & Return
        </button>
      </div>

      {/* Upgrade Required Alert */}
      {showUpgradeModal && (
        <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-purple-500/10 to-[#F7FFB8]/10 border border-[#F7FFB8]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#F7FFB8] shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Caster Studio Subscription Required</h4>
              <p className="text-xs text-[#D7D7DB] mt-0.5 max-w-xl">
                Unlimited production notices, role breakdowns, and candidate self-tape reviewing require an active Caster Premium accreditation.
              </p>
            </div>
          </div>
          <Link
            to="/subscriptions"
            className="px-5 py-2.5 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors shrink-0 flex items-center gap-1.5 shadow-md"
          >
            <span>Upgrade to Caster Pro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column (2 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          {/* Section 1: Production Overview */}
          <div className="p-6 rounded-3xl bg-[#0E0E0F] border border-white/10 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-[#F7FFB8]" />
              <span>1. Production Overview</span>
            </h3>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Production Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Echoes of the Valley"
                className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Project Medium *</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-black/50 input-editorial text-xs"
                >
                  <option value="FEATURE_FILM">Feature Film</option>
                  <option value="SHORT_FILM">Short Film</option>
                  <option value="SERIES">Television / Streaming Series</option>
                  <option value="THEATRE">Stage & Theatre</option>
                  <option value="COMMERCIAL">Commercial / Brand</option>
                  <option value="VOICEOVER">Voiceover / Animation</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Union Clearance</label>
                <select
                  value={unionStatus}
                  onChange={(e) => setUnionStatus(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-black/50 input-editorial text-xs"
                >
                  <option value="NON_UNION">Non-Union</option>
                  <option value="SAG_AFTRA">SAG-AFTRA</option>
                  <option value="EQUITY">Actor's Equity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Filming / Casting Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London / Remote Self-Tape"
                  className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Application Deadline</label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Estimated Production Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Production Synopsis * (min 10 characters)</label>
              <textarea
                rows={4}
                required
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Describe narrative setting, directorial vision, tone, and character dynamics..."
                className="w-full p-3 rounded-xl bg-black/50 input-editorial text-xs"
              />
            </div>
          </div>

          {/* Section 2: Character Breakdowns */}
          <div className="p-6 rounded-3xl bg-[#0E0E0F] border border-white/10 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF97CA]" />
                  <span>2. Character Breakdowns ({roles.length})</span>
                </h3>
                <p className="text-[11px] text-[#8A8A90] mt-0.5">
                  Actors apply specifically to individual roles listed below
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRole}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#F7FFB8] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {roles.map((r, idx) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F7FFB8]">
                      Role #{idx + 1}
                    </span>
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(r.id)}
                        className="text-[#8A8A90] hover:text-rose-400 transition-colors p-1"
                        title="Remove Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#8A8A90] block mb-1">Character Name *</label>
                      <input
                        type="text"
                        required
                        value={r.title}
                        onChange={(e) => handleRoleChange(r.id, "title", e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full h-10 px-3 rounded-lg bg-black/60 input-editorial text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#8A8A90] block mb-1">Gender Requirement</label>
                      <select
                        value={r.genderRequirement}
                        onChange={(e) => handleRoleChange(r.id, "genderRequirement", e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 input-editorial text-xs"
                      >
                        <option value="ANY">Any Gender</option>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="NON_BINARY">Non-Binary</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#8A8A90] block mb-1">Min Age</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={r.minAge}
                        onChange={(e) => handleRoleChange(r.id, "minAge", e.target.value)}
                        placeholder="Min"
                        className="w-full h-10 px-3 rounded-lg bg-black/60 input-editorial text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8A8A90] block mb-1">Max Age</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={r.maxAge}
                        onChange={(e) => handleRoleChange(r.id, "maxAge", e.target.value)}
                        placeholder="Max"
                        className="w-full h-10 px-3 rounded-lg bg-black/60 input-editorial text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8A8A90] block mb-1">Character Performance Description *</label>
                    <textarea
                      rows={2}
                      required
                      value={r.description}
                      onChange={(e) => handleRoleChange(r.id, "description", e.target.value)}
                      placeholder="Emotional arc, dialogue accents, sides references..."
                      className="w-full p-2.5 rounded-lg bg-black/60 input-editorial text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Publication Options & Submit */}
          <div className="p-6 rounded-3xl bg-[#0E0E0F] border border-white/10 flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-[#F7FFB8] focus:ring-0 accent-[#F7FFB8]"
              />
              <span className="text-xs text-white font-medium">
                Publish immediately to Public Discovery board
              </span>
            </label>
            <p className="text-[11px] text-[#8A8A90] -mt-2 ml-7">
              If unchecked, this notice will be saved as a Draft for your review before going live.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-all cursor-pointer disabled:opacity-50 shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Publishing Casting Notice...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>{publishImmediately ? "Publish Casting Call" : "Save as Draft"}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview Column (1 Col) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A8A90] uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-[#F7FFB8]" />
            <span>Actor Discovery Preview</span>
          </div>

          <div className="rounded-3xl bg-[#0E0E0F] border border-white/15 p-6 flex flex-col gap-4 shadow-2xl glass sticky top-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F7FFB8] font-mono uppercase">
                {projectType.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7FFB8]/10 text-[#F7FFB8] border border-[#F7FFB8]/20 font-medium">
                {publishImmediately ? "LIVE NOTICE" : "DRAFT"}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white">
                {title || "Untitled Production Notice"}
              </h4>
              <p className="text-xs text-[#8A8A90] line-clamp-3 mt-1.5 leading-relaxed">
                {synopsis || "Production synopsis will preview here..."}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-[#8A8A90] border-y border-white/10 py-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D7D7DB]" />
                <span>{location || "Location pending"}</span>
              </div>
              {applicationDeadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D7D7DB]" />
                  <span>Deadline: {new Date(applicationDeadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-[#D7D7DB] uppercase tracking-wider">
                Open Roles ({roles.length})
              </span>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {roles.map((r, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{r.title || `Role #${i + 1}`}</span>
                      <span className="text-[10px] text-[#8A8A90]">
                        {r.genderRequirement} {r.minAge && r.maxAge ? `(${r.minAge}-${r.maxAge})` : ""}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A8A90] line-clamp-1">
                      {r.description || "Character traits..."}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full py-2.5 rounded-full bg-white/5 border border-white/10 text-center text-[11px] text-[#8A8A90]">
              Auditions accepted via ActorsGlobe Monograph
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
