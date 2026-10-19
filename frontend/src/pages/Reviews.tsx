import React, { useState } from "react";
import { Headline } from "../components/Headline";
import { TESTIMONIALS, PRESS_MENTIONS } from "../data/mockContent";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export const Reviews: React.FC = () => {
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(1); // Nikeran is active
  const [pressRowIndex, setPressRowIndex] = useState(0);

  return (
    <div className="flex flex-col gap-24 md:gap-32 w-full pb-16 px-4 md:px-7 pt-4">
      {/* =========================================================================
          SECTION 1: HERO WITH CLOUDSCAPE ART
         ========================================================================= */}
      <section className="w-full">
        <div className="relative rounded-[36px] overflow-hidden p-8 md:p-14 border border-white/10 min-h-[360px] md:min-h-[420px] flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
          {/* Pastel Cloudscape Background Image */}
          <img
            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop"
            alt="Dreamy Cloudscape Atmosphere"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="self-start inline-block px-4 py-1.5 rounded-full glass border border-white/20 text-xs font-medium text-white/90 mb-3">
              Reviews
            </div>
            <Headline
              text="Voices of the *global* community"
              as="h1"
              accentColor="white"
              className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-tight"
            />
            <p className="text-sm md:text-base text-white/85 mt-3 leading-relaxed">
              We create this platform together with you. Find out why visionary actors and casting directors worldwide choose ActorsGlobe to present their auditions and discover premier talent.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 3 COLOR-TINTED TESTIMONIAL CARDS
         ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-medium tracking-wider text-[#8A8A90] uppercase">
            Curated Member Experiences
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setActiveTestimonialIdx((prev) => (prev > 0 ? prev - 1 : TESTIMONIALS.length - 1))
              }
              className="w-10 h-10 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Previous Review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setActiveTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length)
              }
              className="w-10 h-10 rounded-full carousel-btn-next-active flex items-center justify-center text-white transition-all cursor-pointer"
              aria-label="Next Review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TESTIMONIALS.map((item, idx) => {
            const isActive = idx === activeTestimonialIdx;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTestimonialIdx(idx)}
                className={`rounded-[32px] md:rounded-[36px] p-7 md:p-8 border flex flex-col justify-between transition-all duration-500 cursor-pointer relative overflow-hidden bg-gradient-to-b ${
                  item.gradient
                } ${
                  isActive
                    ? "border-white/40 shadow-2xl shadow-black/80 scale-105 z-10"
                    : "border-white/10 opacity-70 hover:opacity-90"
                }`}
              >
                {/* Header: Photo or Quote Symbol */}
                <div className="mb-6 flex items-center justify-between">
                  {item.avatar && (
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/30"
                    />
                  )}
                  <Quote className="w-8 h-8 text-white/30 ml-auto" />
                </div>

                {/* Quote Text */}
                <p className="text-sm md:text-base text-white/95 leading-relaxed italic mb-8">
                  "{item.quote}"
                </p>

                {/* Author Monogram */}
                <div className="pt-4 border-t border-white/15 flex flex-col">
                  <span className="font-serif-accent italic text-lg md:text-xl text-white">
                    {item.author}
                  </span>
                  <span className="text-xs text-[#D7D7DB] opacity-75">{item.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: (REVIEWS) WHO MENTIONED US - 2-ROW PRESS CAROUSEL
         ========================================================================= */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-medium tracking-wider text-[#8A8A90] uppercase">
              (Reviews) Who mentioned us
            </span>
            <Headline
              text="Global *critical reception*"
              as="h2"
              accentColor="muted"
              className="text-2xl sm:text-3xl font-normal text-white mt-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPressRowIndex((prev) => (prev > 0 ? prev - 1 : 1))
              }
              className="w-10 h-10 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Previous Press"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setPressRowIndex((prev) => (prev + 1) % 2)
              }
              className="w-10 h-10 rounded-full carousel-btn-next-active flex items-center justify-center text-white transition-all cursor-pointer"
              aria-label="Next Press"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2 Staggered Rows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRESS_MENTIONS.slice(pressRowIndex * 3).concat(PRESS_MENTIONS.slice(0, pressRowIndex * 3)).map((press) => (
            <div
              key={press.id}
              className="rounded-[28px] bg-[#0E0E0F] border border-white/10 p-3 hover:border-white/30 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Image Frame with Centered Publication Masthead Logo */}
              <div className="relative w-full h-48 rounded-[20px] overflow-hidden border border-white/10 mb-4 flex items-center justify-center">
                <img
                  src={press.imageUrl}
                  alt={press.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />

                <span className="relative z-10 text-white font-serif tracking-widest text-xl font-bold uppercase drop-shadow-md">
                  {press.outlet}
                </span>
              </div>

              {/* Title & Excerpt */}
              <div className="p-3">
                <span className="font-serif-accent italic text-lg text-white block mb-2 group-hover:text-[#F7FFB8] transition-colors">
                  {press.title}
                </span>
                <p className="text-xs text-[#8A8A90] line-clamp-3 leading-relaxed">
                  {press.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Reviews;
