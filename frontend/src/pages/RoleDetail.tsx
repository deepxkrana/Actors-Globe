import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import { ArrowLeft, Check, AlertCircle, Flag } from "lucide-react";

export const RoleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [notes, setNotes] = useState("");
  const [auditionTapeUrl, setAuditionTapeUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.getRoleById(id);
        if (res.success && res.data) {
          setRole(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!id) return;

    setApplying(true);
    setErrorMsg("");
    try {
      const res = await api.applyToRole(id, notes, auditionTapeUrl);
      if (res.success) {
        setApplied(true);
      } else {
        setErrorMsg(res.error || "Submission could not be completed. You may have already applied.");
      }
    } catch {
      setErrorMsg("Network error during application submission.");
    } finally {
      setApplying(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reportReason) return;
    const res = await api.submitReport({
      targetType: "PROJECT",
      targetId: id,
      reason: reportReason,
      details: "Reported directly from Role Details page"
    });
    if (res.success) {
      setReportSent(true);
      setTimeout(() => {
        setReporting(false);
        setReportSent(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin mr-3" />
        <span>Loading casting breakdown...</span>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-32 px-4">
        <h2 className="text-2xl font-medium text-white mb-2">Role Not Found</h2>
        <p className="text-sm text-[#8A8A90] mb-6">This casting call may have closed or been archived.</p>
        <Link to="/discovery" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm">
          Return to Discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 w-full pb-16 px-4 md:px-7 pt-4">
      {/* Back Button */}
      <Link
        to="/discovery"
        className="flex items-center gap-2 text-xs md:text-sm text-[#8A8A90] hover:text-white transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Casting Discovery</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Role Overview & Production Synopsis */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3.5 py-1 rounded-full bg-[#F7FFB8]/10 text-[#F7FFB8] border border-[#F7FFB8]/30 text-xs font-semibold">
                {role.roleType}
              </span>
              <span className="text-xs text-[#8A8A90] px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {role.isUnion ? "SAG-AFTRA" : "Non-Union"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight">
              {role.characterName || role.name}
            </h1>

            {role.project && (
              <div className="text-lg text-[#B9B9BE] mt-2 font-medium flex flex-wrap items-center gap-2">
                <span>Production: <strong className="text-white">{role.project.title}</strong> ({role.project.projectType})</span>
                <Link
                  to={`/casters/${role.project.casterId || "caster-studio-1"}`}
                  className="text-xs text-[#F7FFB8] hover:underline ml-1"
                >
                  • View Casting Studio
                </Link>
              </div>
            )}
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#0E0E0F] border border-white/10">
            <div>
              <span className="text-xs text-[#8A8A90] block">Age Range</span>
              <span className="text-sm font-medium text-white">{role.ageMin || 18} – {role.ageMax || 65}</span>
            </div>
            <div>
              <span className="text-xs text-[#8A8A90] block">Compensation</span>
              <span className="text-sm font-medium text-[#F7FFB8]">{role.payRate || "Day Rate"}</span>
            </div>
            <div>
              <span className="text-xs text-[#8A8A90] block">Location</span>
              <span className="text-sm font-medium text-white">{role.project?.location || "Los Angeles / Remote"}</span>
            </div>
            <div>
              <span className="text-xs text-[#8A8A90] block">Production Dates</span>
              <span className="text-sm font-medium text-white">{role.project?.productionDates || "Summer 2026"}</span>
            </div>
          </div>

          {/* Character Breakdown & Requirements */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-medium text-white">Character Breakdown</h3>
            <p className="text-sm md:text-base text-[#D7D7DB] leading-relaxed whitespace-pre-line">
              {role.description}
            </p>
          </div>

          {/* Production Synopsis */}
          {role.project?.synopsis && (
            <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
              <h3 className="text-lg font-medium text-white">Project Synopsis</h3>
              <p className="text-sm md:text-base text-[#8A8A90] leading-relaxed">
                {role.project.synopsis}
              </p>
            </div>
          )}

          {/* Report Button */}
          <div className="pt-4 border-t border-white/10">
            {reporting ? (
              <form onSubmit={handleReport} className="flex flex-col gap-3 p-4 rounded-xl bg-white/3 border border-white/10">
                <span className="text-xs text-white font-medium">Report this Casting Notice</span>
                <input
                  type="text"
                  required
                  placeholder="Reason for report (e.g. misleading rate, policy violation)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-xs text-white"
                />
                <div className="flex items-center gap-2">
                  <button type="submit" className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                    {reportSent ? "Report Sent" : "Submit Report"}
                  </button>
                  <button type="button" onClick={() => setReporting(false)} className="text-xs text-[#8A8A90]">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setReporting(true)}
                className="text-xs text-[#8A8A90] hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report casting notice</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Submission Form Card */}
        <div className="lg:col-span-5 self-start">
          <div className="rounded-4xl bg-[#0E0E0F] border border-white/10 p-7 md:p-8 glass sticky top-24">
            <h3 className="text-xl font-medium text-white mb-2">Submit Audition Application</h3>
            <p className="text-xs text-[#8A8A90] mb-6">
              Your verified portfolio headshots and resume will be securely transmitted to the casting room.
            </p>

            {applied ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-medium text-white">Application Submitted!</h4>
                <p className="text-xs text-emerald-200">
                  The casting team has received your submission. Track your status in your dashboard.
                </p>
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-full bg-emerald-400 text-black text-xs font-semibold mt-2"
                >
                  View My Applications
                </Link>
              </div>
            ) : (
              <form onSubmit={handleApply} className="flex flex-col gap-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">
                    Self-Tape or Showreel URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://vimeo.com/..., YouTube, or cloud reel link"
                    value={auditionTapeUrl}
                    onChange={(e) => setAuditionTapeUrl(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">
                    Cover Note to Casting Director
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share any special skills, dialects, or your artistic connection to this role..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-4 rounded-xl bg-black/50 input-editorial text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-sm hover:bg-white transition-colors cursor-pointer mt-2 disabled:opacity-50"
                >
                  {applying ? "Transmitting Submission..." : "Submit Audition"}
                </button>

                <p className="text-[11px] text-[#8A8A90] text-center mt-1">
                  By submitting, you confirm you meet the stated age range and union specifications.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;
