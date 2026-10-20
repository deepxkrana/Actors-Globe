import React, { useState } from "react";
import { Headline } from "../components/Headline";
import { FEATURED_ARTISTS, MARQUEE_TILES } from "../data/mockContent";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { TwitterIcon, InstagramIcon } from "../components/SocialIcons";

export const FeaturedTalent: React.FC = () => {
  const [activeArtistIndex, setActiveArtistIndex] = useState(1); // Nikeran Tarone is active

  return (
    <div className="flex flex-col gap-24 md:gap-32 w-full pb-16 pt-4">
      {/* =========================================================================
          SECTION 1: HERO & TWINKLE STARS
         ========================================================================= */}
      <section className="px-4 md:px-7 text-center max-w-3xl mx-auto relative">
        {/* Scattered 4-point sparkle decorative stars */}
        <div className="absolute top-2 left-6 text-[#F7FFB8] opacity-20 animate-pulse">✦</div>
        <div className="absolute bottom-4 right-10 text-purple-300 opacity-25 animate-pulse [animation-delay:1s]">✦</div>
        <div className="absolute top-1/2 right-4 text-emerald-300 opacity-20 animate-pulse [animation-delay:2s]">✦</div>

        <div className="inline-block px-4 py-1.5 rounded-full glass border border-white/20 text-xs font-medium text-white/90 mb-4">
          Featured Talent
        </div>

        <Headline
          text="We have *the best artists* in this world"
          as="h1"
          accentColor="muted"
          className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-tight"
        />

        <p className="text-base md:text-lg text-[#B9B9BE] mt-4 max-w-xl mx-auto">
          ActorsGlobe was born from a simple idea: every creator deserves a worthy stage.
        </p>
      </section>

      {/* =========================================================================
          SECTION 2: 3-CARD ARTIST MONOGRAPH CAROUSEL
         ========================================================================= */}
      <section className="px-4 md:px-7 relative">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-4 relative">
          {/* Navigation Arrow Left */}
          <button
            onClick={() =>
              setActiveArtistIndex((prev) => (prev > 0 ? prev - 1 : FEATURED_ARTISTS.length - 1))
            }
            className="w-12 h-12 rounded-full border border-white/20 bg-black/60 flex items-center justify-center text-white hover:bg-white/10 z-20 cursor-pointer"
            aria-label="Previous Artist"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {FEATURED_ARTISTS.map((artist, idx) => {
              const isActive = idx === activeArtistIndex;
              return (
                <div
                  key={artist.id}
                  onClick={() => setActiveArtistIndex(idx)}
                  className={`rounded-[28px] bg-[#0E0E0F] border p-6 flex flex-col justify-between transition-all duration-500 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "border-emerald-500/40 shadow-2xl shadow-emerald-500/10 scale-105 z-10"
                      : "border-white/10 opacity-70 hover:opacity-90"
                  }`}
                >
                  {/* Active Card Bottom Green Glow */}
                  {isActive && (
                    <div className="absolute -bottom-16 left-0 right-0 h-36 bg-linear-to-t from-emerald-500/25 to-transparent pointer-events-none" />
                  )}

                  {/* Top: Social Circle Buttons */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <TwitterIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <Globe className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Center: Headshot & Monograph Details */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 mb-3">
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-white">{artist.name}</h3>
                    <span className="text-xs text-[#8A8A90] mb-3">{artist.handle}</span>
                    <p className="text-xs md:text-sm text-[#D7D7DB] line-clamp-2 leading-relaxed">
                      {artist.bio}
                    </p>
                  </div>

                  {/* Bottom: 3 Stat Chips */}
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-white/10">
                    <div className="px-2.5 py-1 rounded-full border border-white/10 text-[11px] text-white">
                      <span className="font-semibold">{artist.posts}</span>{" "}
                      <span className="text-[#8A8A90]">Posts</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full border border-white/10 text-[11px] text-white">
                      <span className="font-semibold">{artist.followers}</span>{" "}
                      <span className="text-[#8A8A90]">Followers</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full border border-white/10 text-[11px] text-white">
                      <span className="font-semibold">{artist.following}</span>{" "}
                      <span className="text-[#8A8A90]">Following</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrow Right */}
          <button
            onClick={() =>
              setActiveArtistIndex((prev) => (prev + 1) % FEATURED_ARTISTS.length)
            }
            className="w-12 h-12 rounded-full border border-white/20 bg-black/60 flex items-center justify-center text-white hover:bg-white/10 z-20 cursor-pointer"
            aria-label="Next Artist"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INFINITE 3-ROW PHOTO MARQUEE
         ========================================================================= */}
      <section className="w-full overflow-hidden relative py-6">
        {/* Edge Gradient Mask Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-44 bg-linear-to-r from-[#070707] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-44 bg-linear-to-l from-[#070707] to-transparent z-10 pointer-events-none" />

        <div className="flex flex-col gap-4">
          {/* Row 1 (Translates Left) */}
          <div className="flex gap-4 animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {[...MARQUEE_TILES, ...MARQUEE_TILES].map((img, i) => (
              <div
                key={`r1-${i}`}
                className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border border-white/10 shrink-0"
              >
                <img
                  src={img}
                  alt={`Marquee tile ${i}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* Row 2 (Shifted & Translates Right) */}
          <div className="flex gap-4 animate-[marquee_55s_linear_infinite_reverse] hover:[animation-play-state:paused] w-max -ml-24">
            {[...MARQUEE_TILES.slice(4), ...MARQUEE_TILES].map((img, i) => (
              <div
                key={`r2-${i}`}
                className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border border-white/10 shrink-0"
              >
                <img
                  src={img}
                  alt={`Marquee tile r2-${i}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* Row 3 (Translates Left) */}
          <div className="flex gap-4 animate-[marquee_50s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {[...MARQUEE_TILES.slice(2), ...MARQUEE_TILES].map((img, i) => (
              <div
                key={`r3-${i}`}
                className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border border-white/10 shrink-0"
              >
                <img
                  src={img}
                  alt={`Marquee tile r3-${i}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturedTalent;
