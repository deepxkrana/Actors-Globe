import React, { useState } from "react";
import { Headline } from "../components/Headline";
import { PARTNERS, AMBASSADORS } from "../data/mockContent";
import { Sparkles, Compass, Heart } from "lucide-react";

export const AboutUs: React.FC = () => {
  const [hoveredPartner, setHoveredPartner] = useState<string | null>("Leica");
  const [hoveredAmbassador, setHoveredAmbassador] = useState<string | null>(null);

  const corePillars = [
    {
      id: "pillar-1",
      icon: Compass,
      title: "Freedom of Expression",
      description: "A space where your performance craft is free from generic trends, algorithm limits, and superficial metrics."
    },
    {
      id: "pillar-2",
      icon: Sparkles,
      title: "Creative Equality",
      description: "Authentic presence matters more than follower counts. Every dedicated performer gets a direct, unbiased casting evaluation."
    },
    {
      id: "pillar-3",
      icon: Heart,
      title: "Connected by Vision",
      description: "We connect performers and casting directors through shared storytelling integrity, not transactional casting calls."
    }
  ];

  return (
    <div className="flex flex-col gap-24 md:gap-32 w-full pb-16 px-4 md:px-7 pt-4">
      {/* =========================================================================
          SECTION 1: HERO & TAG
         ========================================================================= */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pt-4">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="self-start px-4 py-1.5 rounded-full glass border border-white/20 text-xs font-medium text-white/90">
            About Us
          </div>
          <Headline
            text="More than *just a feed.* A sanctuary for those *who create.*"
            as="h1"
            accentColor="dune"
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-[1.12]"
          />
        </div>

        <p className="text-sm md:text-base text-white/80 max-w-sm leading-relaxed lg:pb-2">
          ActorsGlobe was born from a simple idea: every creator deserves a worthy stage. We are building a home for actors, directors, and dreamers where craft is art, and community is everything.
        </p>
      </section>

      {/* =========================================================================
          SECTION 2: GOLDEN 3D WAVE CENTERPIECE
         ========================================================================= */}
      <section className="w-full">
        <div className="relative w-full h-80 md:h-110 rounded-4xl md:rounded-[36px] overflow-hidden border border-white/10 flex items-center justify-center p-6 bg-linear-to-r from-amber-950/60 via-amber-900/40 to-black">
          {/* Background Golden Waves Render Imagery */}
          <img
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2000&auto=format&fit=crop"
            alt="3D Golden Wave Architecture"
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Centered Liquid Chrome Brand Typography */}
          <div className="relative z-10 flex items-baseline select-none">
            <span className="font-serif-accent italic text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal text-white drop-shadow-[0_10px_30px_rgba(255,255,255,0.4)]">
              actors
            </span>
            <span className="font-sans font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#F7FFB8] ml-2">
              globe
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: EDITORIAL MANIFESTO PROSE
         ========================================================================= */}
      <section className="max-w-2xl mx-auto text-center flex flex-col gap-6 py-4">
        <Headline
          text="In a world of endless scrolling, the *spark of talent* often gets lost in the noise. At ActorsGlobe, we've traded click-driven algorithms for *quality and self-expression.*"
          as="p"
          accentColor="dune"
          className="text-xl sm:text-2xl md:text-3xl font-normal text-white leading-relaxed"
        />

        <Headline
          text="We believe that *creativity knows no boundaries.* Whether it's dramatic monologue, indie cinema, or high-fashion performance — here, *your voice is heard.* Our mission is to provide you with tools not just to audition, but to *grow, inspire, and monetize your craft.*"
          as="p"
          accentColor="dune"
          className="text-base sm:text-lg md:text-xl font-normal text-[#D7D7DB] leading-relaxed pt-4 border-t border-white/10"
        />
      </section>

      {/* =========================================================================
          SECTION 4: (02) ECOSYSTEM & PARTNERS
         ========================================================================= */}
      <section className="w-full">
        <div className="mb-8">
          <span className="text-xs md:text-sm font-medium tracking-wider text-[#8A8A90] uppercase">
            (02) Our Partners
          </span>
          <Headline
            text="Our *Ecosystem & Partners*"
            as="h2"
            accentColor="muted"
            className="text-2xl sm:text-3xl font-normal text-white mt-1"
          />
        </div>

        {/* Row of 6 Partner Circles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {PARTNERS.map((partner) => {
            const isHovered = hoveredPartner === partner.name;
            return (
              <div
                key={partner.name}
                onMouseEnter={() => setHoveredPartner(partner.name)}
                className={`relative h-28 rounded-full border flex items-center justify-center p-4 transition-all duration-300 cursor-pointer ${
                  isHovered
                    ? "glass border-white/40 shadow-xl shadow-white/5 scale-105"
                    : "bg-[#0D0D0E] border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <span className={`text-white text-center select-none ${partner.style}`}>
                  {partner.name}
                </span>

                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -bottom-8 px-2.5 py-1 rounded-full bg-[#111] border border-white/20 text-[11px] text-white whitespace-nowrap shadow-md z-20">
                    {partner.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: (03) VALUES & CORE PILLARS
         ========================================================================= */}
      <section className="w-full">
        <div className="relative rounded-[36px] overflow-hidden p-8 md:p-14 border border-white/15 bg-[#0A160E]">
          {/* Motion-Streak Nature Blur Background */}
          <div className="absolute inset-0 bg-linear-to-tr from-[#1A3824] via-[#0E4B70]/30 to-[#B7C95A]/20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <span className="text-xs font-medium tracking-wider text-[#F7FFB8] uppercase">
                (03) Values
              </span>
              <Headline
                text="Our *Core Pillars*"
                as="h2"
                accentColor="muted"
                className="text-3xl md:text-4xl font-normal text-white mt-1"
              />
            </div>
            <span className="text-xs md:text-sm text-white/80">
              We support creators and performers from all over the world
            </span>
          </div>

          {/* 3 Frosted Glass Cards */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {corePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="rounded-[28px] p-7 glass border border-white/20 flex flex-col justify-between min-h-65 hover:border-white/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6">
                    <Icon className="w-6 h-6 text-[#F7FFB8]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">{pillar.title}</h3>
                    <p className="text-xs md:text-sm text-[#D7D7DB] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: (04) AMBASSADORS CLOUD
         ========================================================================= */}
      <section className="w-full">
        <div className="mb-8">
          <span className="text-xs md:text-sm font-medium tracking-wider text-[#8A8A90] uppercase">
            (04) Our Inspirations
          </span>
          <Headline
            text="Company *Ambassadors*"
            as="h2"
            accentColor="muted"
            className="text-2xl sm:text-3xl font-normal text-white mt-1"
          />
        </div>

        {/* Organic Staggered Cluster of Ambassador Circles */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center max-w-4xl mx-auto">
          {AMBASSADORS.map((ambassador) => {
            const isHovered = hoveredAmbassador === ambassador.name;
            return (
              <div
                key={ambassador.name}
                onMouseEnter={() => setHoveredAmbassador(ambassador.name)}
                onMouseLeave={() => setHoveredAmbassador(null)}
                className="relative cursor-pointer group"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20 p-1 glass transition-transform duration-300 group-hover:scale-105 group-hover:border-[#F7FFB8]">
                  <img
                    src={ambassador.avatar}
                    alt={ambassador.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Name Tooltip */}
                {isHovered && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#111] border border-white/20 text-xs text-white whitespace-nowrap z-20 shadow-lg">
                    {ambassador.name}
                  </div>
                )}
              </div>
            );
          })}

          {/* Olive "12+ Members" Circle */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-linear-to-br from-[#4A5A1E] to-[#2A3310] border border-white/20 flex flex-col items-center justify-center text-white shadow-xl">
            <span className="text-2xl md:text-3xl font-bold">12+</span>
            <span className="text-xs text-[#F7FFB8]">Members</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
