import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Headline } from "../components/Headline";
import { BLOG_ARTICLES } from "../data/mockContent";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export const Blog: React.FC = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredArticle = BLOG_ARTICLES[featuredIndex] || BLOG_ARTICLES[0];
  const moreArticles = BLOG_ARTICLES;

  return (
    <div className="flex flex-col gap-24 md:gap-32 w-full pb-16 px-4 md:px-7 pt-4">
      {/* =========================================================================
          SECTION 1: HERO & TAG
         ========================================================================= */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="self-start px-4 py-1.5 rounded-full glass border border-white/20 text-xs font-medium text-white/90">
            Our Blog
          </div>
          <Headline
            text="The epicenter of *digital* evolution"
            as="h1"
            accentColor="white"
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-tight"
          />
        </div>

        <p className="text-sm md:text-base text-white/80 max-w-sm pb-2">
          The world doesn't stand still and we are moving faster than anyone else.
        </p>
      </section>

      {/* =========================================================================
          SECTION 2: CENTER FEATURED SLIDER WITH SIDE PEEKS
         ========================================================================= */}
      <section className="w-full relative">
        <div className="flex items-center justify-center gap-4 overflow-hidden py-4">
          {/* Previous Arrow Button */}
          <button
            onClick={() => setFeaturedIndex((prev) => (prev > 0 ? prev - 1 : 0))}
            className="hidden md:flex w-12 h-12 rounded-full border border-white/20 bg-black/60 items-center justify-center text-white hover:bg-white/10 z-20 cursor-pointer"
            aria-label="Previous Featured"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Left Side Peek Card */}
          <div className="hidden lg:block w-[18%] h-90 rounded-[28px] overflow-hidden opacity-35 border border-white/10 shrink-0">
            <img
              src={BLOG_ARTICLES[1].imageUrl}
              alt="Peek Left"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Center Main Featured Card */}
          <div className="w-full lg:w-[64%] h-115 md:h-130 rounded-4xl md:rounded-[36px] overflow-hidden border border-white/15 relative shrink-0 shadow-2xl flex flex-col justify-end p-6 md:p-10 group">
            <img
              src={featuredArticle.imageUrl}
              alt={featuredArticle.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="max-w-xl">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-white mb-3 inline-block">
                  {featuredArticle.category} • {featuredArticle.date}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-white tracking-tight leading-snug">
                  {featuredArticle.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#D7D7DB] line-clamp-2 mt-2 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <Link
                to={`/blog/${featuredArticle.slug}`}
                className="px-5 py-2.5 rounded-full glass border border-white/25 hover:border-white/50 text-sm font-medium text-white flex items-center gap-2 group/btn transition-colors shrink-0"
              >
                <span>View</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Side Peek Card */}
          <div className="hidden lg:block w-[18%] h-90 rounded-[28px] overflow-hidden opacity-35 border border-white/10 shrink-0">
            <img
              src={BLOG_ARTICLES[2].imageUrl}
              alt="Peek Right"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={() => setFeaturedIndex((prev) => (prev < 2 ? prev + 1 : 2))}
            className="hidden md:flex w-12 h-12 rounded-full border border-white/20 bg-black/60 items-center justify-center text-white hover:bg-white/10 z-20 cursor-pointer"
            aria-label="Next Featured"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: (BLOG) MORE ARTICLES GRID
         ========================================================================= */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-medium tracking-wider text-[#8A8A90] uppercase">
              (Blog) More articles
            </span>
            <Headline
              text="Fresh *insights & perspectives*"
              as="h2"
              accentColor="muted"
              className="text-2xl sm:text-3xl font-normal text-white mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {moreArticles.map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="rounded-[28px] bg-[#0D0D0E] border border-white/10 p-3 hover:border-white/30 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative w-full h-52 rounded-[20px] overflow-hidden border border-white/10 mb-4">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white group-hover:text-[#F7FFB8] transition-colors leading-snug line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#8A8A90] line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs text-[#8A8A90]">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white font-medium">
                    {article.category}
                  </span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
