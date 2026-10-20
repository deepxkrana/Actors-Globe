import React, { useState } from "react";
import type { CasterProfile } from "../../types";
import { api } from "../../services/api";
import {
  Building2,
  Sparkles,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface CasterProfileEditorProps {
  initialProfile: CasterProfile | null;
  onProfileUpdated: (updated: CasterProfile) => void;
}

export const CasterProfileEditor: React.FC<CasterProfileEditorProps> = ({
  initialProfile,
  onProfileUpdated
}) => {
  const [displayName, setDisplayName] = useState(
    initialProfile?.displayName || initialProfile?.user?.name || ""
  );
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    if (displayName.trim().length < 2) {
      setFeedback({ type: "error", message: "Studio name must be at least 2 characters." });
      setSaving(false);
      return;
    }

    try {
      const res = await api.updateCasterProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined
      });

      if (res.success && res.data) {
        setFeedback({ type: "success", message: "Studio accreditation and profile saved successfully!" });
        onProfileUpdated(res.data);
      } else {
        setFeedback({ type: "error", message: res.message || "Failed to update profile." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Error updating profile." });
    } finally {
      setSaving(false);
    }
  };

  const user = initialProfile?.user;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-wider text-[#8A8A90] font-medium flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#F7FFB8]" />
          <span>Accredited Casting Studio</span>
        </span>
        <h2 className="text-2xl font-light text-white tracking-tight mt-1">
          Studio Profile & Accreditation
        </h2>
        <p className="text-xs text-[#8A8A90] mt-1">
          Manage your public casting identity, production philosophy, and contact credentials.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-auto text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form (2 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 md:p-8 rounded-3xl bg-[#0E0E0F] border border-white/10 flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F7FFB8]" />
              <span>Studio Identity</span>
            </h3>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">
                Casting Studio / Director Display Name *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Apex Casting Collective / Sarah Sterling"
                className="w-full h-11 px-4 rounded-xl bg-black/50 input-editorial text-xs"
              />
              <span className="text-[11px] text-[#8A8A90] mt-1 block">
                This name appears on your casting calls and public profile.
              </span>
            </div>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">
                Studio Philosophy & Casting Background
              </label>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your casting history, notable production credits, stylistic preferences, and what you look for in talent..."
                className="w-full p-4 rounded-xl bg-black/50 input-editorial text-xs leading-relaxed"
              />
              <span className="text-[11px] text-[#8A8A90] mt-1 block">
                Maximum 2,000 characters. Express your agency's ethos.
              </span>
            </div>
          </div>

          {/* Account Security & Verified Credentials */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0E0E0F] border border-white/10 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Account Credentials & Security</span>
            </h3>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-[#D7D7DB]">
                  <Mail className="w-4 h-4 text-[#8A8A90]" />
                  <span>{user?.email || "No email on record"}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Verified Contact
                </span>
              </div>

              {(initialProfile?.phone || (user as any)?.phone) && (
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-[#D7D7DB]">
                    <Phone className="w-4 h-4 text-[#8A8A90]" />
                    <span>{initialProfile?.phone || (user as any)?.phone}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Verified SMS
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-all cursor-pointer disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Saving Studio Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Studio Accreditation</span>
              </>
            )}
          </button>
        </form>

        {/* Live Studio Card Preview (1 Col) */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider">
            Public Studio Card Preview
          </span>

          <div className="rounded-3xl bg-[#0E0E0F] border border-white/15 p-6 flex flex-col gap-5 shadow-2xl glass sticky top-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#1A1A1E] to-[#0A0A0B] border border-white/15 flex items-center justify-center text-xl font-light text-[#F7FFB8] shadow-inner">
                {(displayName || "C")[0].toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-lg font-medium text-white">
                    {displayName || "Casting Studio"}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-[#F7FFB8]" />
                </div>
                <span className="text-[11px] text-[#8A8A90] block mt-0.5">
                  Accredited Casting Director
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2">
              <span className="text-[10px] text-[#8A8A90] uppercase tracking-wider font-medium">
                Casting Philosophy
              </span>
              <p className="text-xs text-[#D7D7DB] italic leading-relaxed">
                {bio
                  ? `"${bio}"`
                  : '"Casting with empathy, authenticity, and discovery across international stages and screens."'}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8A8A90] border-t border-white/10 pt-3">
              <span>Verified Studio Member</span>
              <span className="text-[#F7FFB8]">Active Notices Listed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
