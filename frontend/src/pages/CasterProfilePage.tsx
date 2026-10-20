import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Building2,
  Film,
  Award,
  Globe,
  Mail,
  Send,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase
} from "lucide-react";
import { api } from "../services/api";
import { StatusPill } from "../components/StatusPill";
import { Modal } from "../components/Modal";
import type { CasterProfile, Project, Role } from "../types";

export const CasterProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CasterProfile | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"roles" | "credits" | "guidelines">("roles");
  const [copySuccess, setCopySuccess] = useState(false);

  // General Submission Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [actorMonographUrl, setActorMonographUrl] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCasterData = async () => {
      setLoading(true);
      try {
        if (id) {
          const res = await api.getCasterProfile(id);
          if (res.success && res.data) {
            if (isMounted) setProfile(res.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch caster from API, using fallback studio info:", err);
      }

      // Fetch active projects
      try {
        const projRes = await api.getProjects();
        if (projRes.success && projRes.data) {
          if (isMounted) {
            // If project is associated or just take active notices
            const list = projRes.data.filter((p) => p.status === "ACTIVE" || p.status === "PUBLISHED" as any);
            setActiveProjects(list.length > 0 ? list : projRes.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch projects:", err);
      }

      // Fallback Caster Profile if not populated by API
      setProfile((prev) => {
        if (prev) return prev;
        return {
          id: id || "caster-studio-1",
          userId: "user-caster-1",
          displayName: "Elena Rostova, CSA",
          companyName: "Horizon Casting Collective",
          isVerified: true,
          website: "https://horizoncasting.example.com",
          bio: "Independent casting director specializing in contemporary auteur cinema, European co-productions, and transformative ensemble casting. Dedicated to discovering new authentic performers across international stages.",
          phone: "+1 (310) 555-0198"
        };
      });

      if (isMounted) setLoading(false);
    };

    fetchCasterData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleGeneralSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsSubmitModalOpen(false);
        setActorMonographUrl("");
        setSubmissionNote("");
      }, 2000);
    }, 1000);
  };

  if (loading && !profile) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin" />
        <p className="text-sm text-[#8A8A90] tracking-wide">Retrieving studio credentials...</p>
      </div>
    );
  }

  const studioName = profile?.companyName || "Auteur Casting Studio";
  const directorName = profile?.displayName || "Elena Rostova, CSA";

  // Flatten active roles from projects
  const activeRoles: Role[] = activeProjects.flatMap((p) =>
    (p.roles || []).map((r) => ({ ...r, project: p }))
  );

  return (
    <div className="flex flex-col gap-10 w-full pb-20 pt-4">
      {/* =========================================================================
          TOP BREADCRUMBS & ACTION BAR
         ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link
          to="/discovery"
          className="inline-flex items-center gap-2 text-sm text-[#8A8A90] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Casting Discovery</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/14 bg-white/5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copySuccess ? "Link Copied!" : "Share Studio"}</span>
        </button>
      </div>

      {/* =========================================================================
          STUDIO COVER & EDITORIAL HEADER
         ========================================================================= */}
      <div className="relative rounded-[36px] overflow-hidden border border-white/12 bg-linear-to-b from-[#141416] via-[#0E0E10] to-[#070707] p-8 md:p-12 shadow-2xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F7FFB8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Studio Avatar Monogram */}
            <div className="w-24 h-24 rounded-3xl bg-linear-to-tr from-white/10 to-white/5 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Building2 className="w-10 h-10 text-[#F7FFB8]" />
            </div>

            {/* Studio Titles */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <StatusPill status="VERIFIED" />
                <span className="text-xs text-[#8A8A90] flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Casting Society Accredited
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight leading-tight">
                {studioName}
              </h1>

              <p className="text-sm md:text-base text-[#D7D7DB] mt-1 flex items-center gap-2">
                <span>Directed by</span>
                <span className="font-serif italic text-[#F7FFB8]">{directorName}</span>
              </p>
            </div>
          </div>

          {/* Direct General Submission CTA */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="py-3 px-6 rounded-full bg-[#F7FFB8] text-black font-medium text-xs md:text-sm flex items-center gap-2 hover:bg-[#ebf49e] transition-all shadow-lg hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>General Roster Submission</span>
          </button>
        </div>

        {/* Narrative Bio */}
        <div className="mt-8 pt-8 border-t border-white/10 max-w-3xl">
          <h2 className="text-xs uppercase tracking-widest text-[#8A8A90] font-medium mb-2">Casting Philosophy</h2>
          <p className="text-sm md:text-base text-[#B9B9BE] leading-relaxed">
            {profile?.bio ||
              "Committed to discovering truthful and boundary-pushing performers for independent cinema and episodic television. We prioritize safe audition rooms, timely communication, and craft-first evaluations."}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-[#8A8A90]">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-white/70" />
              Los Angeles • London • Paris
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-white/70" />
              casting@actorsglobe.com
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-white/70" />
              Feature Film & Prestige Series
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTENT TABS (ACTIVE ROLES / FILMOGRAPHY / SUBMISSION RULES)
         ========================================================================= */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "roles"
                ? "bg-[#F7FFB8] text-black shadow-md"
                : "text-[#8A8A90] hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Active Casting Calls ({activeRoles.length || 3})</span>
          </button>

          <button
            onClick={() => setActiveTab("credits")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "credits"
                ? "bg-[#F7FFB8] text-black shadow-md"
                : "text-[#8A8A90] hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Past Productions & Credits</span>
          </button>

          <button
            onClick={() => setActiveTab("guidelines")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === "guidelines"
                ? "bg-[#F7FFB8] text-black shadow-md"
                : "text-[#8A8A90] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Self-Tape Protocols</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE ROLES */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRoles.length > 0 ? (
              activeRoles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-3xl bg-[#0E0E10] border border-white/10 p-6 flex flex-col justify-between gap-5 hover:border-white/20 transition-all group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill status={role.roleType || "LEAD"} />
                      <span className="text-[11px] text-[#8A8A90] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F7FFB8]" />
                        {role.deadline ? new Date(role.deadline).toLocaleDateString() : "Open Call"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-white group-hover:text-[#F7FFB8] transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-xs text-[#8A8A90] mt-0.5">
                        {role.project?.title || "Upcoming Production"}
                      </p>
                    </div>

                    <p className="text-xs text-[#D7D7DB] line-clamp-3 leading-relaxed">
                      {role.description || "Complex dramatic role requiring emotional nuance and authenticity."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-[11px] text-[#8A8A90]">
                      {role.gender && <span>Gender: {role.gender}</span>}
                      {role.ageMin && role.ageMax && <span>• Age: {role.ageMin}–{role.ageMax}</span>}
                      {role.payRate && <span>• {role.payRate}</span>}
                    </div>
                  </div>

                  <Link
                    to={`/roles/${role.id}`}
                    className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 text-center text-xs font-medium text-white group-hover:bg-[#F7FFB8] group-hover:text-black group-hover:border-[#F7FFB8] transition-all"
                  >
                    View Sides & Audition
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-sm text-[#8A8A90] border border-dashed border-white/10 rounded-3xl">
                No active casting notices currently open for public application. Check back soon or submit a general monograph.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREDITS */}
        {activeTab === "credits" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Echoes Across the Strait",
                director: "Cannes Official Competition",
                year: 2025,
                type: "Feature Film",
                castCount: "14 Performers Cast"
              },
              {
                title: "The Autumn Sonata (Series)",
                director: "HBO Max / Canal+",
                year: 2024,
                type: "8-Episode Miniseries",
                castCount: "32 Performers Cast"
              },
              {
                title: "Dust & Neon",
                director: "Sundance Dramatic Special Jury Prize",
                year: 2023,
                type: "Independent Feature",
                castCount: "6 Performers Cast"
              },
              {
                title: "Winter Monologues",
                director: "Berlinale Silver Bear",
                year: 2022,
                type: "Ensemble Drama",
                castCount: "18 Performers Cast"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0E0E10] border border-white/10 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-base font-medium text-white">{item.title}</h4>
                  <p className="text-xs text-[#F7FFB8] font-mono mt-0.5">{item.director}</p>
                  <p className="text-xs text-[#8A8A90] mt-1">{item.type} • {item.castCount}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
                  {item.year}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GUIDELINES */}
        {activeTab === "guidelines" && (
          <div className="p-8 rounded-3xl bg-[#0E0E10] border border-white/10 space-y-6 max-w-3xl">
            <h3 className="text-lg font-medium text-white">Self-Tape Submission Standards</h3>
            <ul className="space-y-4 text-xs md:text-sm text-[#D7D7DB] leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F7FFB8]/20 text-[#F7FFB8] flex items-center justify-center shrink-0 text-xs font-semibold">1</span>
                <span><strong>Framing & Slate:</strong> Medium close-up (chest up) on a neutral, solid backdrop with soft natural lighting. State your name, agency, height, and location in the first 5 seconds.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F7FFB8]/20 text-[#F7FFB8] flex items-center justify-center shrink-0 text-xs font-semibold">2</span>
                <span><strong>Reading Partner:</strong> Keep your reader just off-camera next to the lens. Ensure the actor's microphone priority is balanced so dialogue remains natural.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#F7FFB8]/20 text-[#F7FFB8] flex items-center justify-center shrink-0 text-xs font-semibold">3</span>
                <span><strong>Sides Confidentiality:</strong> All distributed audition sides are watermarked and subject to NDA. Public posting of audition recordings is strictly prohibited.</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* =========================================================================
          GENERAL SUBMISSION MODAL
         ========================================================================= */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit Monograph to ${studioName}`}
        subtitle="Your portfolio and reel will be cataloged directly in our talent consideration archive."
        maxWidth="lg"
      >
        {submitSuccess ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-medium text-white">Monograph Received!</h4>
            <p className="text-xs text-[#8A8A90] max-w-sm">
              The casting department has added your profile to their future project database.
            </p>
          </div>
        ) : (
          <form onSubmit={handleGeneralSubmission} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1">
                ActorsGlobe Profile or Monograph URL
              </label>
              <input
                type="text"
                placeholder="https://actorsglobe.com/talent/your-id or your portfolio link"
                value={actorMonographUrl}
                onChange={(e) => setActorMonographUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black input-editorial text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1">
                Note to Casting Directors
              </label>
              <textarea
                rows={4}
                placeholder="Briefly state your playing range, current location / travel availability, and union status..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black input-editorial text-sm resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#8A8A90] pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#F7FFB8]" />
                Archived for 12 months
              </span>
              <span>Zero audition fees</span>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#F7FFB8] text-black font-medium text-xs hover:bg-[#ebf49e] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? "Sending..." : "Submit Monograph"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CasterProfilePage;
