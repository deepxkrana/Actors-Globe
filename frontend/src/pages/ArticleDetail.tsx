import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Headline } from "../components/Headline";
import { Mail, ChevronRight, Check } from "lucide-react";
import { TwitterIcon, FacebookIcon, LinkedInIcon } from "../components/SocialIcons";

export const ArticleDetail: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("section-1");

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex flex-col gap-12 w-full pb-16 px-4 md:px-7 pt-4">
      {/* =========================================================================
          SECTION 1: 2-COLUMN HEADER
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/10 pb-12">
        {/* Left Column: Breadcrumbs + Headline + Author */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-[#8A8A90]">
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/blog" className="hover:text-white transition-colors">News</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Fashion</span>
          </nav>

          <Headline
            text="Constructed Identity: Where Fashion Becomes *Architecture*"
            as="h1"
            accentColor="white"
            className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight leading-[1.2]"
          />

          <div className="flex items-center gap-4 pt-2">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop"
              alt="Lewis Daller"
              className="w-11 h-11 rounded-full object-cover border border-white/20"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Lewis Daller</span>
              <span className="text-xs text-[#8A8A90]">June 1, 2026 • 6 min read</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Cinematic Image Frame */}
        <div className="lg:col-span-5 h-[340px] md:h-[420px] rounded-[32px] md:rounded-[36px] overflow-hidden border border-white/15 relative shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
            alt="Constructed Identity Hero"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 2-COLUMN BODY (STICKY SIDEBAR + EDITORIAL PROSE)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sticky Sidebar: Share Buttons + In this Article Card */}
        <aside className="lg:col-span-4 flex flex-col gap-8 self-start lg:sticky lg:top-24">
          {/* Share Block */}
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#8A8A90] block mb-3">
              Share this Article
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <TwitterIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* "In this Article" Glass TOC Card */}
          <div className="rounded-[28px] bg-[#0E0E0F] border border-white/10 p-6 md:p-7 glass">
            <h4 className="text-base font-medium text-white mb-4">In this Article</h4>
            <ol className="flex flex-col gap-3 text-sm text-[#B9B9BE]">
              {[
                { id: "section-1", title: "1. From Garment to Structure" },
                { id: "section-2", title: "2. Red as a Visual Statement" },
                { id: "section-3", title: "3. Designing the Self" }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`text-left transition-colors cursor-pointer ${
                      activeSection === item.id
                        ? "text-[#F7FFB8] font-medium"
                        : "hover:text-white text-[#B9B9BE]"
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Right Main Editorial Prose Column */}
        <article className="lg:col-span-8 editorial-measure flex flex-col gap-6 text-[#D7D7DB] text-base md:text-lg leading-[1.75]">
          <h2 className="text-xl md:text-2xl font-medium text-white mb-2">
            Constructed Identity: Where Fashion Becomes Architecture
          </h2>

          <p>
            In a world where identity is fluid and self-expression evolves by the second, fashion no longer follows the body — it reshapes it. This visual story explores sculptural silhouettes, bold contrasts, and the tension between structure and emotion in modern design.
          </p>

          <p>
            The language of fashion is changing. It no longer whispers trends — it builds statements. In today's digital era, clothing is not merely fabric stitched into form. It is structure. It is framing. It is an extension of identity constructed in layers.
          </p>

          <p>
            Against a striking red backdrop, the silhouette becomes almost architectural. Clean lines replace softness. Geometry replaces ornament. The human figure transforms into a sculptural presence — composed, deliberate, controlled.
          </p>

          <h3 className="text-lg md:text-xl font-medium text-white mt-6 mb-2">
            The Rise of Structural Fashion
          </h3>

          <p>
            Contemporary fashion is increasingly influenced by architecture and industrial design. Designers experiment with volume, rigidity, and engineered shapes that challenge traditional ideas of wearability. The body becomes a foundation, not a limitation.
          </p>

          <p>
            This shift reflects something deeper than aesthetics. It mirrors how we construct ourselves — created, layered, intentional. In cinema and casting, costume is rarely passive attire; it is the physical architecture of the soul, anchoring performance in time and purpose.
          </p>
        </article>
      </section>
    </div>
  );
};

export default ArticleDetail;
