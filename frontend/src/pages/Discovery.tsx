import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Role } from "../types";
import { Headline } from "../components/Headline";
import { Search, Filter, Film } from "lucide-react";

export const Discovery: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState<string>("");
  const [selectedRoleType, setSelectedRoleType] = useState<string>("");
  const [selectedUnion, setSelectedUnion] = useState<string>("");

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.searchRoles({
        keyword: searchQuery || undefined,
        projectType: selectedProjectType || undefined,
        roleType: selectedRoleType || undefined,
        unionStatus: selectedUnion || undefined
      });
      if (res && res.success && res.data) {
        const rawData = res.data as any;
        const roleItems = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData.items)
          ? rawData.items
          : [];
        setRoles(roleItems);
      } else {
        setRoles([]);
      }
    } catch {
      // Fallback if backend returns error or has no active projects
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [selectedProjectType, selectedRoleType, selectedUnion]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRoles();
  };

  return (
    <div className="flex flex-col gap-12 w-full pb-16 px-4 md:px-7 pt-4">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
        <div className="max-w-xl">
          <div className="self-start inline-block px-4 py-1.5 rounded-full glass border border-white/20 text-xs font-medium text-white/90 mb-3">
            Casting Discovery
          </div>
          <Headline
            text="Discover transformative *roles and auditions*"
            as="h1"
            accentColor="dune"
            className="text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight"
          />
          <p className="text-sm md:text-base text-[#8A8A90] mt-3">
            Explore verified casting notices from visionary directors and production houses worldwide.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="w-full">
        <div className="rounded-[28px] bg-[#0E0E0F] border border-white/10 p-5 md:p-6 glass flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-5 h-5 text-[#8A8A90] absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by character name, project title, or keywords..."
              className="w-full h-12 pl-12 pr-28 rounded-full bg-black/40 input-editorial text-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-5 h-9 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-[#8A8A90] flex items-center gap-1.5 font-medium">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Project Type Filter */}
            <select
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#111]">All Project Types</option>
              <option value="FEATURE_FILM" className="bg-[#111]">Feature Film</option>
              <option value="SHORT_FILM" className="bg-[#111]">Short Film</option>
              <option value="COMMERCIAL" className="bg-[#111]">Commercial</option>
              <option value="THEATRE" className="bg-[#111]">Theatre</option>
              <option value="SERIES" className="bg-[#111]">Series</option>
            </select>

            {/* Role Type Filter */}
            <select
              value={selectedRoleType}
              onChange={(e) => setSelectedRoleType(e.target.value)}
              className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#111]">All Role Types</option>
              <option value="LEAD" className="bg-[#111]">Lead</option>
              <option value="SUPPORTING" className="bg-[#111]">Supporting</option>
              <option value="FEATURED" className="bg-[#111]">Featured</option>
              <option value="EXTRA" className="bg-[#111]">Extra</option>
            </select>

            {/* Union Status Filter */}
            <select
              value={selectedUnion}
              onChange={(e) => setSelectedUnion(e.target.value)}
              className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#111]">Any Union Status</option>
              <option value="SAG_AFTRA" className="bg-[#111]">SAG-AFTRA</option>
              <option value="NON_UNION" className="bg-[#111]">Non-Union</option>
            </select>

            {(selectedProjectType || selectedRoleType || selectedUnion || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedProjectType("");
                  setSelectedRoleType("");
                  setSelectedUnion("");
                  setSearchQuery("");
                }}
                className="px-3 py-1.5 rounded-full text-xs text-[#FF97CA] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Role Cards Grid */}
      <section className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#8A8A90]">
            <div className="w-8 h-8 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin mr-3" />
            <span>Scanning casting notices...</span>
          </div>
        ) : !Array.isArray(roles) || roles.length === 0 ? (
          <div className="text-center py-20 rounded-4xl bg-[#0E0E0F] border border-white/10 p-8">
            <Film className="w-12 h-12 text-[#8A8A90] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">No active casting notices found</h3>
            <p className="text-sm text-[#8A8A90] max-w-md mx-auto">
              Try adjusting your filter criteria or check back soon as new productions list audition calls daily.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(roles) ? roles : []).map((role: any) => (
              <div
                key={role.id}
                className="rounded-[28px] bg-[#0D0D0E] border border-white/10 p-6 flex flex-col justify-between hover:border-white/30 transition-all duration-300 group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#F7FFB8]">
                      {role.roleType || role.genderRequirement || "OPEN"}
                    </span>
                    <span className="text-xs text-[#8A8A90]">
                      {role.isUnion ? "SAG-AFTRA" : role.project?.location || "Open Call"}
                    </span>
                  </div>

                  <h3 className="text-xl font-medium text-white group-hover:text-[#F7FFB8] transition-colors leading-snug mb-1">
                    {role.characterName || role.name || role.title || "Audition Role"}
                  </h3>

                  {role.project && (
                    <span className="text-xs font-medium text-[#D7D7DB] block mb-3">
                      Project: {role.project.title}
                    </span>
                  )}

                  <p className="text-xs text-[#8A8A90] line-clamp-3 leading-relaxed mb-4">
                    {role.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  <div className="flex flex-col text-xs text-[#8A8A90]">
                    <span>Age: {role.minAge || role.ageMin || 18}–{role.maxAge || role.ageMax || 65}</span>
                    <span className="text-white font-medium">{role.payRate || "Competitive Day Rate"}</span>
                  </div>

                  <Link
                    to={`/roles/${role.id}`}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-semibold transition-colors"
                  >
                    View Role →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Discovery;
