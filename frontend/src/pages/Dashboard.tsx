import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Application, CastingRequest, Project, Conversation, ActorProfile, CasterProfile } from "../types";
import { Sparkles, Film, Send, User, Award, MessageSquare, Users, Building2, Plus } from "lucide-react";
import { ActorApplicationsView } from "../components/actor/ActorApplicationsView";
import { ActorRequestsView } from "../components/actor/ActorRequestsView";
import { ActorMonographView } from "../components/actor/ActorMonographView";
import { ActorExperiencesView } from "../components/actor/ActorExperiencesView";
import { CasterProjectsView } from "../components/caster/CasterProjectsView";
import { CasterCreateProjectView } from "../components/caster/CasterCreateProjectView";
import { CasterApplicantsView } from "../components/caster/CasterApplicantsView";
import { CasterProfileEditor } from "../components/caster/CasterProfileEditor";
import { MessagesView } from "../components/MessagesView";

export const Dashboard: React.FC = () => {
  const { user, isActor, isCaster } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(isActor ? "applications" : "projects");
  const [applications, setApplications] = useState<Application[]>([]);
  const [castingRequests, setCastingRequests] = useState<CastingRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [actorProfile, setActorProfile] = useState<ActorProfile | null>(null);
  const [casterProfile, setCasterProfile] = useState<CasterProfile | null>(null);

  // Deep linking between tabs
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | undefined>(undefined);
  const [selectedApplicantProjectId, setSelectedApplicantProjectId] = useState<string | undefined>(undefined);
  const [selectedApplicantRoleId, setSelectedApplicantRoleId] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isActor) {
        const [appRes, reqRes, profRes] = await Promise.all([
          api.getMyApplications(),
          api.getMyCastingRequests(),
          api.getMyProfile()
        ]);
        if (appRes.success && appRes.data) {
          setApplications(Array.isArray(appRes.data) ? appRes.data : []);
        }
        if (reqRes.success && reqRes.data) {
          setCastingRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
        }
        if (profRes.success && profRes.data?.profile) {
          setActorProfile(profRes.data.profile as ActorProfile);
        }
      } else if (isCaster) {
        const [projRes, casterProfRes] = await Promise.all([
          api.getMyProjects(),
          api.getMyProfile()
        ]);
        if (projRes.success && projRes.data) {
          let projs = Array.isArray(projRes.data) ? projRes.data : [];
          if (projs.length === 0) {
            const pubRes = await api.getProjects();
            if (pubRes.success && Array.isArray(pubRes.data)) {
              projs = pubRes.data;
            }
          }
          setProjects(projs);
        }
        if (casterProfRes.success && casterProfRes.data?.profile) {
          setCasterProfile(casterProfRes.data.profile as CasterProfile);
        }
      }

      const convRes = await api.getConversations();
      if (convRes.success && convRes.data) {
        setConversations(Array.isArray(convRes.data) ? convRes.data : []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, [isActor, isCaster]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
  }, [user, navigate, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin mr-3" />
        <span className="text-sm text-[#8A8A90]">Loading workspace command center...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-16 px-4 md:px-7 pt-4">
      {/* =========================================================================
          WORKSPACE HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A8A90] font-medium flex items-center gap-1.5">
            <span>Workspace Command Center</span>
            <span>•</span>
            <span className="text-[#F7FFB8] font-semibold">{user?.role}</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mt-1">
            Welcome, {user?.name || user?.email}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/subscriptions"
            className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-semibold text-[#F7FFB8] hover:bg-white/10 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Plan</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          WORKSPACE NAVIGATION TABS
         ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
        {/* Actor Workspace Tabs */}
        {isActor && (
          <>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "applications"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Audition Tracker ({Array.isArray(applications) ? applications.length : 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "requests"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Casting Invitations ({Array.isArray(castingRequests) ? castingRequests.length : 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "profile"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Monograph & Identity</span>
            </button>

            <button
              onClick={() => setActiveTab("experiences")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "experiences"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Filmography & Credits</span>
            </button>
          </>
        )}

        {/* Caster Workspace Tabs */}
        {isCaster && (
          <>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "projects"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Productions & Notices ({Array.isArray(projects) ? projects.length : 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("applicants")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "applicants"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Audition Submissions & Triage</span>
            </button>

            <button
              onClick={() => setActiveTab("new-project")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "new-project"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Post Casting Call</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "profile"
                  ? "bg-[#F7FFB8] text-black shadow-md"
                  : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Studio Profile & Accreditation</span>
            </button>
          </>
        )}

        {/* Shared Messages Tab */}
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "messages"
              ? "bg-[#F7FFB8] text-black shadow-md"
              : "text-[#B9B9BE] hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Direct Messages ({Array.isArray(conversations) ? conversations.length : 0})</span>
        </button>
      </div>

      {/* =========================================================================
          ACTOR WORKSPACE TABS CONTENT
         ========================================================================= */}
      {isActor && activeTab === "applications" && (
        <ActorApplicationsView
          applications={applications}
          onRefresh={loadData}
          onOpenMessage={(casterId) => {
            setSelectedRecipientId(casterId);
            setActiveTab("messages");
          }}
        />
      )}

      {isActor && activeTab === "requests" && (
        <ActorRequestsView
          castingRequests={castingRequests}
          onRefresh={loadData}
          onOpenMessage={(casterId) => {
            setSelectedRecipientId(casterId);
            setActiveTab("messages");
          }}
        />
      )}

      {isActor && activeTab === "profile" && (
        <ActorMonographView
          initialProfile={actorProfile}
          onProfileUpdated={(updated) => setActorProfile(updated)}
        />
      )}

      {isActor && activeTab === "experiences" && (
        <ActorExperiencesView />
      )}

      {/* =========================================================================
          CASTER WORKSPACE TABS CONTENT
         ========================================================================= */}
      {isCaster && activeTab === "projects" && (
        <CasterProjectsView
          projects={projects}
          onRefresh={loadData}
          onNavigateToNewProject={() => setActiveTab("new-project")}
          onSelectProjectForApplicants={(project, roleId) => {
            setSelectedApplicantProjectId(project.id);
            setSelectedApplicantRoleId(roleId);
            setActiveTab("applicants");
          }}
        />
      )}

      {isCaster && activeTab === "applicants" && (
        <CasterApplicantsView
          projects={projects}
          initialProjectId={selectedApplicantProjectId}
          initialRoleId={selectedApplicantRoleId}
          onOpenMessage={(recipientId) => {
            setSelectedRecipientId(recipientId);
            setActiveTab("messages");
          }}
        />
      )}

      {isCaster && activeTab === "new-project" && (
        <CasterCreateProjectView
          onSuccess={() => {
            loadData();
            setActiveTab("projects");
          }}
          onCancel={() => setActiveTab("projects")}
        />
      )}

      {isCaster && activeTab === "profile" && (
        <CasterProfileEditor
          initialProfile={casterProfile}
          onProfileUpdated={(updated) => setCasterProfile(updated)}
        />
      )}

      {/* =========================================================================
          MESSAGES TAB CONTENT (BOTH ACTOR & CASTER)
         ========================================================================= */}
      {activeTab === "messages" && (
        <MessagesView initialRecipientId={selectedRecipientId} />
      )}
    </div>
  );
};

export default Dashboard;
