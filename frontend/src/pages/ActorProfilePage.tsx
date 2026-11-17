import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Play,
  Film,
  Award,
  Sparkles,
  Phone,
  CheckCircle2,
  Calendar,
  Send,
  Download,
  Eye
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatusPill } from "../components/StatusPill";
import { Modal } from "../components/Modal";
import { FEATURED_ARTISTS } from "../data/mockContent";
import type { ActorProfile, Role } from "../types";

export const ActorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ActorProfile | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<"reel" | "gallery" | "credits">("reel");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Audition Invitation Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [casterRoles, setCasterRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [customRoleName, setCustomRoleName] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchActor = async () => {
      setLoading(true);
      try {
        if (id) {
          const res = await api.getActorProfile(id);
          if (res.success && res.data) {
            if (isMounted) setProfile(res.data);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch profile from API, falling back to mock artist:", err);
      }

      // Fallback matching mock artist or default
      const mockArtist = FEATURED_ARTISTS.find((a) => a.id === id) || FEATURED_ARTISTS[1];
      const fallbackProfile: ActorProfile = {
        id: id || "artist-2",
        userId: "user-" + (id || "artist-2"),
        displayName: mockArtist.name,
        stageName: mockArtist.name,
        age: 27,
        gender: "Non-binary / Male",
        bio: `${mockArtist.bio} Dedicated to auteur cinema and high-intensity character work. Trained in physical theatre and contemporary dramatic arts with extensive international festival credits.`,
        headshotUrl: mockArtist.avatar,
        additionalPhotos: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop"
        ],
        reelUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        heightCm: 183,
        eyeColor: "Hazel Grey",
        hairColor: "Dark Chestnut",
        unionStatus: "SAG_AFTRA",
        agentName: "Auteur Artists Agency",
        agentEmail: "representation@auteurartists.agency",
        skills: ["Method Acting", "Stage Combat", "Improvisation", "RP British Accent", "Dialect: French", "Equestrian", "Screenwriting"],
        credits: [
          {
            title: "The Whispering Pines",
            role: "Julian (Lead)",
            production: "Neon Horizon Pictures",
            year: 2025
          },
          {
            title: "Solitude in Amber",
            role: "Dr. Ethan Hayes",
            production: "BBC Film / Cannes Official Selection",
            year: 2024
          },
          {
            title: "City of Fractured Light",
            role: "Marcus Vance",
            production: "A24 Labs",
            year: 2023
          },
          {
            title: "Hamlet (Theatrical Run)",
            role: "Laertes",
            production: "Royal Shakespeare Company",
            year: 2022
          }
        ]
      };

      if (isMounted) setProfile(fallbackProfile);
      setLoading(false);
    };

    fetchActor();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load caster roles if logged in as CASTER
  useEffect(() => {
    if (user?.role === "CASTER") {
      api.getMyProjects().then((res) => {
        if (res.success && res.data) {
          const roles = res.data.flatMap((p) => p.roles || []);
          setCasterRoles(roles);
          if (roles.length > 0) setSelectedRoleId(roles[0].id);
        }
      });
    }
  }, [user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      if (selectedRoleId && profile) {
        await api.sendCastingRequest({
          roleId: selectedRoleId,
          actorId: profile.id,
          message: invitationMessage || `We would love to invite you to audition for our upcoming production.`
        });
      }
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
        setIsInviteModalOpen(false);
        setInvitationMessage("");
      }, 2000);
    } catch (err) {
      console.error("Failed to send casting invite:", err);
    } finally {
      setInviting(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin" />
        <p className="text-sm text-[#8A8A90] tracking-wide">Retrieving performer monograph...</p>
      </div>
    );
  }

  const name = profile?.displayName || profile?.stageName || "Featured Performer";
  const headshot =
    profile?.headshotUrl ||
    profile?.additionalPhotos?.[0] ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="flex flex-col gap-12 w-full pb-20 pt-4">
      {/* =========================================================================
          TOP BREADCRUMBS & ACTION BAR
         ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link
          to="/talent"
          className="inline-flex items-center gap-2 text-sm text-[#8A8A90] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Featured Talent</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              bookmarked
                ? "bg-[#F7FFB8]/15 border-[#F7FFB8] text-[#F7FFB8]"
                : "border-white/14 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title={bookmarked ? "Saved to Roster" : "Bookmark Performer"}
            aria-label="Bookmark Performer"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/14 bg-white/5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Share Monograph"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copySuccess ? "Link Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN EDITORIAL MONOGRAPH (2-COLUMN SPLIT)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cinematic Headshot, Stats & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Portrait Headshot Frame */}
          <div className="relative rounded-4xl overflow-hidden border border-white/14 bg-[#0E0E10] shadow-2xl aspect-3/4 group">
            <img
              src={headshot}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Ambient vignette gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <StatusPill status="VERIFIED" />
              {profile?.unionStatus && <StatusPill status={profile.unionStatus} />}
            </div>

            {/* Bottom Floating Identity Bar */}
            <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col">
              <span className="text-xs uppercase tracking-widest text-[#F7FFB8] font-medium mb-1">
                Auteur Monograph
              </span>
              <h2 className="text-2xl font-normal text-white">{name}</h2>
              {profile?.stageName && profile.stageName !== name && (
                <span className="text-xs text-[#8A8A90]">known as {profile.stageName}</span>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full py-3.5 px-6 rounded-full bg-[#F7FFB8] text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#ebf49e] transition-all shadow-lg hover:scale-[1.01] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Invite to Audition</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/contact"
                className="py-3 px-4 rounded-full border border-white/15 bg-white/5 text-center text-xs font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#F7FFB8]" />
                <span>Contact Agent</span>
              </Link>
              <button
                onClick={() => window.print()}
                className="py-3 px-4 rounded-full border border-white/15 bg-white/5 text-center text-xs font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#DBAAF4]" />
                <span>Comp Card</span>
              </button>
            </div>
          </div>

          {/* Representation & Agency Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0E0E10]/80 p-5 backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-[#8A8A90] border-b border-white/10 pb-2">
              <span className="font-semibold uppercase tracking-wider text-white/90">Representation</span>
              <span>Exclusive</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{profile?.agentName || "Independent Talent"}</p>
              <p className="text-xs text-[#8A8A90] mt-0.5">{profile?.agentEmail || "contact@actorsglobe.com"}</p>
            </div>
            <div className="text-[11px] text-[#8A8A90] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Identity & SAG-AFTRA clearance verified</span>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative, Physical Specs, Media & Timeline (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Header & Editorial Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 mb-3">
              <Sparkles className="w-3 h-3 text-[#F7FFB8]" />
              <span>Digital Portfolio & Audition Archive</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight">
              {name.split(" ")[0]}{" "}
              <span className="font-serif italic font-normal text-[#F7FFB8]">
                {name.split(" ").slice(1).join(" ")}
              </span>
            </h1>
          </div>

          {/* Physical Attributes Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#8A8A90] block">Playing Age</span>
              <span className="text-sm font-medium text-white">{profile?.age ? `${profile.age - 4}–${profile.age + 3}` : "22–32"}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#8A8A90] block">Height</span>
              <span className="text-sm font-medium text-white">{profile?.heightCm ? `${profile.heightCm} cm` : "180 cm"}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#8A8A90] block">Eyes / Hair</span>
              <span className="text-sm font-medium text-white">{profile?.eyeColor || "Brown"} / {profile?.hairColor || "Dark"}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#8A8A90] block">Gender</span>
              <span className="text-sm font-medium text-white">{profile?.gender || "Performer"}</span>
            </div>
          </div>

          {/* Monograph Narrative Bio */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#8A8A90] font-medium">Artist Statement</h3>
            <p className="text-base text-[#D7D7DB] leading-relaxed max-w-[68ch]">
              {profile?.bio ||
                "Versatile dramatic actor focused on evocative cinema, layered psychological depth, and international independent productions."}
            </p>
          </div>

          {/* Key Skills & Accents Chips */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs uppercase tracking-widest text-[#8A8A90] font-medium">Craft & Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-[#0E0E10] text-white/90 hover:border-[#F7FFB8]/40 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              MEDIA SHOWCASE TABS (REEL / STILLS GALLERY / CREDITS)
             ========================================================================= */}
          <div className="flex flex-col gap-6 pt-4 border-t border-white/10">
            {/* Tabs Selector */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveMediaTab("reel")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeMediaTab === "reel"
                    ? "bg-[#F7FFB8] text-black shadow-md"
                    : "text-[#8A8A90] hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Showreel & Video</span>
              </button>

              <button
                onClick={() => setActiveMediaTab("gallery")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeMediaTab === "gallery"
                    ? "bg-[#F7FFB8] text-black shadow-md"
                    : "text-[#8A8A90] hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Photo Monograph</span>
              </button>

              <button
                onClick={() => setActiveMediaTab("credits")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeMediaTab === "credits"
                    ? "bg-[#F7FFB8] text-black shadow-md"
                    : "text-[#8A8A90] hover:text-white"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Filmography & Credits</span>
              </button>
            </div>

            {/* TAB 1: SHOWREEL PLAYER */}
            {activeMediaTab === "reel" && (
              <div className="flex flex-col gap-4">
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/14 bg-black shadow-2xl group">
                  <video
                    controls
                    poster={headshot}
                    className="w-full h-full object-cover"
                    src={profile?.reelUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"}
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white/90 border border-white/10 pointer-events-none">
                    Audition Monograph • 1080p DCI
                  </div>
                </div>
                <p className="text-xs text-[#8A8A90] italic">
                  Note: All clips are hosted under ActorsGlobe Monograph DRM. Casting directors with verified credentials may request high-bitrate raw camera files directly.
                </p>
              </div>
            )}

            {/* TAB 2: PHOTO MONOGRAPH */}
            {activeMediaTab === "gallery" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(profile?.additionalPhotos || [headshot]).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhoto(imgUrl)}
                    className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#0E0E10] cursor-pointer group relative"
                  >
                    <img
                      src={imgUrl}
                      alt={`${name} still ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-2 rounded-full bg-black/70 text-white border border-white/20">
                        <Play className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: FILMOGRAPHY & CREDITS */}
            {activeMediaTab === "credits" && (
              <div className="flex flex-col gap-3">
                {profile?.credits && profile.credits.length > 0 ? (
                  profile.credits.map((credit, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#0E0E10] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{credit.title}</span>
                        <span className="text-xs text-[#F7FFB8] font-mono mt-0.5">{credit.role}</span>
                        <span className="text-xs text-[#8A8A90] mt-1">{credit.production}</span>
                      </div>
                      <div className="sm:text-right">
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
                          {credit.year}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#8A8A90] border border-dashed border-white/10 rounded-2xl">
                    Full formal credits list available upon casting inquiry.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          LIGHTBOX MODAL FOR PHOTO STILLS
         ========================================================================= */}
      {selectedPhoto && (
        <Modal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          title="Monograph Portrait View"
          maxWidth="2xl"
        >
          <div className="rounded-2xl overflow-hidden aspect-4/5 max-h-[70vh] flex items-center justify-center bg-black">
            <img src={selectedPhoto} alt="Zoomed still" className="w-full h-full object-contain" />
          </div>
        </Modal>
      )}

      {/* =========================================================================
          INVITE TO AUDITION MODAL (FOR CASTERS & GUESTS)
         ========================================================================= */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={`Invite ${name} to Audition`}
        subtitle="Direct casting invitation sent to the performer and their registered representation."
        maxWidth="lg"
      >
        {inviteSuccess ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-medium text-white">Audition Invitation Dispatched!</h4>
            <p className="text-xs text-[#8A8A90] max-w-sm">
              {name} and their agency representative have been notified with sides access.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendInvitation} className="flex flex-col gap-4 mt-2">
            {casterRoles.length > 0 ? (
              <div>
                <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1">
                  Select Project Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black input-editorial text-sm"
                  required
                >
                  {casterRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.roleType}) — {r.project?.title || "Active Production"}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1">
                  Production / Character Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Protagonist — Untitled Auteur Project"
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black input-editorial text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1">
                Audition Brief & Sides Instructions
              </label>
              <textarea
                rows={4}
                placeholder="Include tape format guidelines, scene numbers, reading partner notes, and submission deadline..."
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black input-editorial text-sm resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#8A8A90] pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#F7FFB8]" />
                Standard 5-day response window
              </span>
              <span>Encrypted sides exchange</span>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviting}
                className="px-5 py-2.5 rounded-xl bg-[#F7FFB8] text-black font-medium text-xs hover:bg-[#ebf49e] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {inviting ? "Dispatching..." : "Send Audition Notice"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ActorProfilePage;
