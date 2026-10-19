import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Application, CastingRequest, Project, Conversation } from "../types";
import {
  Film,
  Send,
  MessageSquare,
  Sparkles,
  Check,
  Video
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user, isActor, isCaster } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(isActor ? "applications" : "projects");
  const [applications, setApplications] = useState<Application[]>([]);
  const [castingRequests, setCastingRequests] = useState<CastingRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Caster new project form state
  const [newTitle, setNewTitle] = useState("");
  const [newSynopsis, setNewSynopsis] = useState("");
  const [newProjectType, setNewProjectType] = useState("FEATURE_FILM");
  const [newUnionStatus, setNewUnionStatus] = useState("NON_UNION");
  const [newLocation, setNewLocation] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePay, setNewRolePay] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectSuccessMsg, setProjectSuccessMsg] = useState("");

  // Actor profile edit state
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [headshotUrl, setHeadshotUrl] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [unionStatus, setUnionStatus] = useState("NON_UNION");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        if (isActor) {
          const [appRes, reqRes, profRes] = await Promise.all([
            api.getMyApplications(),
            api.getMyCastingRequests(),
            api.getMyProfile()
          ]);
          if (appRes.success && appRes.data) setApplications(appRes.data);
          if (reqRes.success && reqRes.data) setCastingRequests(reqRes.data);
          if (profRes.success && profRes.data?.profile) {
            const p: any = profRes.data.profile;
            setStageName(p.stageName || "");
            setBio(p.bio || "");
            setHeadshotUrl(p.headshotUrl || "");
            setReelUrl(p.reelUrl || "");
            setUnionStatus(p.unionStatus || "NON_UNION");
          }
        } else if (isCaster) {
          const [projRes] = await Promise.all([
            api.getProjects(),
            api.getMyProfile()
          ]);
          if (projRes.success && projRes.data) setProjects(projRes.data);
        }

        const convRes = await api.getConversations();
        if (convRes.success && convRes.data) setConversations(convRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isActor, isCaster]);

  // Caster creates project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProject(true);
    setProjectSuccessMsg("");
    try {
      const res = await api.createProject({
        title: newTitle,
        synopsis: newSynopsis,
        projectType: newProjectType as any,
        unionStatus: newUnionStatus,
        location: newLocation,
        roles: [
          {
            name: newRoleName || "Lead Character",
            characterName: newRoleName || "Lead Character",
            roleType: "LEAD",
            description: newRoleDesc || "Core dramatic lead for production.",
            payRate: newRolePay || "$1,200/Day",
            isUnion: newUnionStatus === "SAG_AFTRA"
          }
        ]
      });

      if (res.success && res.data) {
        setProjects((prev) => [res.data!, ...prev]);
        setProjectSuccessMsg("Casting call published successfully!");
        setNewTitle("");
        setNewSynopsis("");
        setNewRoleName("");
        setNewRoleDesc("");
        setNewRolePay("");
        setTimeout(() => setActiveTab("projects"), 1500);
      }
    } catch {
      console.error("Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  // Actor updates profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateActorProfile({
        stageName,
        bio,
        headshotUrl,
        reelUrl,
        unionStatus
      });
      if (res.success) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch {
      console.error("Failed to update profile");
    }
  };

  // Actor responds to casting request
  const handleRespondRequest = async (requestId: string, status: "ACCEPTED" | "DECLINED") => {
    const res = await api.respondToCastingRequest(requestId, status);
    if (res.success) {
      setCastingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin mr-3" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-16 px-4 md:px-7 pt-4">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A8A90] font-medium">
            Workspace Hub • {user?.role}
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mt-1">
            Welcome, {user?.name || user?.email}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/subscriptions"
            className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/15 text-xs font-semibold text-[#F7FFB8] hover:bg-white/10 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Plan</span>
          </Link>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {isActor && (
          <>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "applications"
                  ? "bg-white text-black"
                  : "text-[#B9B9BE] hover:text-white bg-white/[0.03]"
              }`}
            >
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "requests"
                  ? "bg-white text-black"
                  : "text-[#B9B9BE] hover:text-white bg-white/[0.03]"
              }`}
            >
              Direct Casting Invitations ({castingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-black"
                  : "text-[#B9B9BE] hover:text-white bg-white/[0.03]"
              }`}
            >
              Portfolio & Profile
            </button>
          </>
        )}

        {isCaster && (
          <>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "projects"
                  ? "bg-white text-black"
                  : "text-[#B9B9BE] hover:text-white bg-white/[0.03]"
              }`}
            >
              Active Casting Calls ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab("new-project")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "new-project"
                  ? "bg-[#F7FFB8] text-black"
                  : "text-[#B9B9BE] hover:text-white bg-white/[0.03]"
              }`}
            >
              + Post New Casting Call
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("messages")}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "messages"
              ? "bg-white text-black"
              : "text-[#B9B9BE] hover:text-white bg-white/[0.03]"
          }`}
        >
          Direct Messages ({conversations.length})
        </button>
      </div>

      {/* Tab 1: ACTOR APPLICATIONS */}
      {isActor && activeTab === "applications" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-white mb-2">Audition Submissions</h2>
          {applications.length === 0 ? (
            <div className="text-center py-16 rounded-[28px] bg-[#0E0E0F] border border-white/10 p-8">
              <Film className="w-10 h-10 text-[#8A8A90] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-medium text-white mb-1">No applications submitted yet</h3>
              <p className="text-xs text-[#8A8A90] mb-4">
                Explore open casting notices in Discovery and submit your verified monograph.
              </p>
              <Link to="/discovery" className="px-4 py-2 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold">
                Explore Casting Calls
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-[24px] bg-[#0E0E0F] border border-white/10 p-5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs text-[#8A8A90] block">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-base font-medium text-white">
                        {app.role?.characterName || app.role?.name || "Audition Role"}
                      </h3>
                      {app.role?.project && (
                        <span className="text-xs text-[#B9B9BE]">
                          {app.role.project.title}
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                        app.status === "ACCEPTED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : app.status === "SHORTLISTED"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : app.status === "AUDITION_REQUESTED"
                          ? "bg-[#F7FFB8]/20 text-[#F7FFB8] border border-[#F7FFB8]/30"
                          : "bg-white/10 text-white border border-white/15"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {app.notes && (
                    <p className="text-xs text-[#8A8A90] italic line-clamp-2 mb-3">
                      "{app.notes}"
                    </p>
                  )}

                  {app.auditionTapeUrl && (
                    <div className="text-xs text-[#D7D7DB] flex items-center gap-1.5 pt-3 border-t border-white/10">
                      <Video className="w-3.5 h-3.5 text-[#F7FFB8]" />
                      <a
                        href={app.auditionTapeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-white truncate"
                      >
                        Self-Tape Preview Link
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: ACTOR CASTING REQUESTS */}
      {isActor && activeTab === "requests" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-white mb-2">Direct Invitations from Casting Directors</h2>
          {castingRequests.length === 0 ? (
            <div className="text-center py-16 rounded-[28px] bg-[#0E0E0F] border border-white/10 p-8">
              <Send className="w-10 h-10 text-[#8A8A90] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-medium text-white mb-1">No pending invitations</h3>
              <p className="text-xs text-[#8A8A90]">
                Casting directors who review your monograph will send direct audition requests here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {castingRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-[24px] bg-[#0E0E0F] border border-white/10 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#F7FFB8] font-semibold">
                        Role: {req.role?.characterName || req.role?.name}
                      </span>
                      <span className="text-xs text-[#8A8A90]">{req.status}</span>
                    </div>

                    <p className="text-xs text-white/90 mb-4">{req.message || "Invited to audition for this role."}</p>
                  </div>

                  {req.status === "PENDING" && (
                    <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleRespondRequest(req.id, "ACCEPTED")}
                        className="flex-1 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
                      >
                        Accept Invitation
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.id, "DECLINED")}
                        className="flex-1 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: ACTOR PROFILE & PORTFOLIO */}
      {isActor && activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl rounded-[28px] bg-[#0E0E0F] border border-white/10 p-6 md:p-8 flex flex-col gap-5 glass">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Monograph & Portfolio Settings</h2>
            {profileSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Stage Name</label>
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="e.g. Lewis Daller"
              className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#F7FFB8]"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Headshot Image URL</label>
            <input
              type="url"
              value={headshotUrl}
              onChange={(e) => setHeadshotUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or uploaded asset URL"
              className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#F7FFB8]"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Showreel Video URL</label>
            <input
              type="url"
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              placeholder="https://vimeo.com/... or YouTube link"
              className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#F7FFB8]"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Union Affiliation</label>
            <select
              value={unionStatus}
              onChange={(e) => setUnionStatus(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#F7FFB8]"
            >
              <option value="NON_UNION">Non-Union</option>
              <option value="SAG_AFTRA">SAG-AFTRA</option>
              <option value="EQUITY">Actors' Equity</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1.5 font-medium">Artistic Biography</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your vocal range, training background, and performance focus..."
              className="w-full p-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#F7FFB8]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-white transition-colors cursor-pointer mt-2"
          >
            Save Portfolio Changes
          </button>
        </form>
      )}

      {/* Tab: CASTER PROJECTS */}
      {isCaster && activeTab === "projects" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Active Productions & Casting Notices</h2>
            <button
              onClick={() => setActiveTab("new-project")}
              className="px-4 py-2 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors"
            >
              + Create Casting Notice
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 rounded-[28px] bg-[#0E0E0F] border border-white/10 p-8">
              <Film className="w-10 h-10 text-[#8A8A90] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-medium text-white mb-1">No casting calls posted yet</h3>
              <p className="text-xs text-[#8A8A90]">Publish a production notice to begin receiving actor audition tapes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="rounded-[24px] bg-[#0E0E0F] border border-white/10 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#F7FFB8] font-semibold">{p.projectType}</span>
                      <span className="text-xs text-[#8A8A90]">{p.status}</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">{p.title}</h3>
                    <p className="text-xs text-[#8A8A90] line-clamp-2 mb-3">{p.synopsis}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#D7D7DB]">
                    <span>Roles: {p.roles?.length || 1}</span>
                    <span className="text-white font-medium">{p.location || "Remote"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: CASTER NEW PROJECT BUILDER */}
      {isCaster && activeTab === "new-project" && (
        <form onSubmit={handleCreateProject} className="max-w-2xl rounded-[28px] bg-[#0E0E0F] border border-white/10 p-6 md:p-8 flex flex-col gap-4 glass">
          <h2 className="text-lg font-medium text-white mb-1">Publish New Casting Call</h2>

          {projectSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              {projectSuccessMsg}
            </div>
          )}

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Production Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Nocturne in Minor Key"
              className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#F7FFB8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Project Format</label>
              <select
                value={newProjectType}
                onChange={(e) => setNewProjectType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none"
              >
                <option value="FEATURE_FILM">Feature Film</option>
                <option value="SHORT_FILM">Short Film</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="THEATRE">Theatre</option>
                <option value="SERIES">Series</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Union Status</label>
              <select
                value={newUnionStatus}
                onChange={(e) => setNewUnionStatus(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none"
              >
                <option value="NON_UNION">Non-Union</option>
                <option value="SAG_AFTRA">SAG-AFTRA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Location</label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. London / Pinewood Studios"
              className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Project Synopsis</label>
            <textarea
              rows={3}
              required
              value={newSynopsis}
              onChange={(e) => setNewSynopsis(e.target.value)}
              placeholder="Narrative summary for actors and agents..."
              className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <span className="text-xs text-[#F7FFB8] font-semibold uppercase tracking-wider">
              Primary Role Breakdown
            </span>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Character Name (e.g. Elena)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Pay Rate (e.g. $1,400/Day)"
                value={newRolePay}
                onChange={(e) => setNewRolePay(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none"
              />
            </div>

            <textarea
              rows={2}
              placeholder="Role description and performance traits..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={creatingProject}
            className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-white transition-colors cursor-pointer mt-2"
          >
            {creatingProject ? "Publishing Casting Call..." : "Publish Casting Call"}
          </button>
        </form>
      )}

      {/* Tab: CONVERSATIONS & DIRECT MESSAGES */}
      {activeTab === "messages" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-white mb-2">Direct Messages & Casting Inquiries</h2>
          {conversations.length === 0 ? (
            <div className="text-center py-16 rounded-[28px] bg-[#0E0E0F] border border-white/10 p-8">
              <MessageSquare className="w-10 h-10 text-[#8A8A90] mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-medium text-white mb-1">No active conversation threads</h3>
              <p className="text-xs text-[#8A8A90]">
                Direct messages initiated between performers and casting teams appear in real-time here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversations.map((conv) => (
                <div key={conv.id} className="rounded-[24px] bg-[#0E0E0F] border border-white/10 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm">
                      {conv.otherUser?.name?.[0] || "U"}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{conv.otherUser?.name || "Participant"}</h4>
                      <p className="text-xs text-[#8A8A90] line-clamp-1">{conv.lastMessage?.content || "Conversation thread active"}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#F7FFB8] px-3 py-1 rounded-full bg-[#F7FFB8]/10 border border-[#F7FFB8]/20">
                    Open Chat
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
