import React, { useState, useEffect } from "react";
import {
  Award,
  Plus,
  Trash2,
  Calendar,
  Building2,
  AlertCircle
} from "lucide-react";
import { api } from "../../services/api";
import { Modal } from "../Modal";

interface ExperienceItem {
  id: string;
  roleTitle: string;
  organization?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export const ActorExperiencesView: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New credit form state
  const [roleTitle, setRoleTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2024-01-15");
  const [endDate, setEndDate] = useState("2025-06-30");
  const [isCurrent, setIsCurrent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const res = await api.getMyExperiences();
      if (res.success && res.data) {
        setExperiences(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.warn("Failed to fetch experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await api.addExperience({
        roleTitle: roleTitle.trim(),
        organization: organization.trim() || undefined,
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: isCurrent ? undefined : endDate || undefined,
        isCurrent
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setRoleTitle("");
        setOrganization("");
        setDescription("");
        setIsCurrent(false);
        await loadExperiences();
      } else {
        setErrorMsg(res.error || "Failed to add production credit");
      }
    } catch {
      setErrorMsg("Connection failure while adding experience");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await api.deleteExperience(id);
      if (res.success) {
        setExperiences((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete experience:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-normal text-white tracking-tight flex items-center gap-2">
            <span>Filmography & Performance Credits</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
              {experiences.length}
            </span>
          </h2>
          <p className="text-xs text-[#8A8A90] mt-0.5">
            Your verified theatrical, film, and commercial credits visible to casting directors
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="py-2.5 px-5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Production Credit</span>
        </button>
      </div>

      {/* Credits List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#8A8A90]">
          Loading verified credits...
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-20 rounded-4xl bg-[#0E0E10] border border-white/10 p-8 flex flex-col items-center justify-center">
          <Award className="w-12 h-12 text-[#8A8A90] mb-3 opacity-50" />
          <h3 className="text-base font-medium text-white mb-1">No production credits listed yet</h3>
          <p className="text-xs text-[#8A8A90] max-w-sm mb-5 leading-relaxed">
            Highlight your feature films, television episodes, and theatre roles for casting rooms.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-6 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-[#ebf49e] transition-all shadow-md cursor-pointer"
          >
            Add Your First Credit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-3xl bg-[#0E0E10] border border-white/10 p-6 flex flex-col justify-between gap-4 hover:border-white/20 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-medium text-white group-hover:text-[#F7FFB8] transition-colors">
                      {exp.roleTitle}
                    </h3>
                    {exp.organization && (
                      <p className="text-xs text-[#D7D7DB] flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#8A8A90]" />
                        <span>{exp.organization}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deletingId === exp.id}
                    className="p-2 rounded-full text-[#8A8A90] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove credit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {exp.description && (
                  <p className="text-xs text-[#8A8A90] line-clamp-3 leading-relaxed mt-2">
                    {exp.description}
                  </p>
                )}
              </div>

              {/* Date footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-[#8A8A90]">
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3 h-3 text-[#F7FFB8]" />
                  {exp.startDate ? new Date(exp.startDate).getFullYear() : "Past"} –{" "}
                  {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : "Completed"}
                </span>

                {exp.isCurrent && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                    In Production
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Experience Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Production Credit"
        subtitle="Record a theatrical performance, feature film, or series role in your monograph."
        maxWidth="lg"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddExperience} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Role / Character Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Julian Hayes (Lead Protagonist)"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black input-editorial text-xs"
            />
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Production Company / Studio / Theatre</label>
            <input
              type="text"
              placeholder="e.g. Neon Horizon Pictures / Royal Shakespeare Co."
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black input-editorial text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black input-editorial text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">End Date</label>
              <input
                type="date"
                disabled={isCurrent}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black input-editorial text-xs disabled:opacity-30"
              />
            </div>
          </div>

          {/* Ongoing toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 text-[#F7FFB8] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isCurrent" className="text-xs text-[#8A8A90] cursor-pointer">
              Currently in production / ongoing run
            </label>
          </div>

          <div>
            <label className="text-xs text-[#D7D7DB] block mb-1 font-medium">Notes & Accolades</label>
            <textarea
              rows={3}
              placeholder="e.g. Official Selection at Cannes 2025. Directed by Kai Bergström."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-black input-editorial text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-[#ebf49e] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Adding Credit..." : "Save to Filmography"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ActorExperiencesView;
