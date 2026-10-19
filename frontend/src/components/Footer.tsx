import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Check } from "lucide-react";
import { Headline } from "./Headline";
import { TwitterIcon, InstagramIcon, LinkedInIcon } from "./SocialIcons";

export const ContactBlock: React.FC = () => {
  return (
    <section className="w-full pt-16 pb-12 border-t border-white/10 mt-20 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        {/* Left: Eyebrow + Rotating Circular Text Badge */}
        <div className="flex flex-col gap-6">
          <div className="text-sm font-medium tracking-wider text-[#8A8A90] uppercase">
            (ag) Contact Us
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Rotating circular SVG text badge */}
            <svg
              viewBox="0 0 140 140"
              className="w-full h-full rotating-badge select-none pointer-events-none"
            >
              <defs>
                <path
                  id="circlePath"
                  d="M 70, 70 m -52, 0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
                />
              </defs>
              <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <text fill="#D7D7DB" fontSize="8.5" letterSpacing="0.22em" fontWeight="500">
                <textPath href="#circlePath" startOffset="0%">
                  FROM ALL SIDES • OPEN YOURSELF COMPLETELY •
                </textPath>
              </text>
            </svg>

            {/* Inner Brand Monogram */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-serif-accent italic text-2xl font-medium text-white/90">
                ag
              </span>
            </div>
          </div>
        </div>

        {/* Right: Stacked Editorial CTA */}
        <div className="flex flex-col items-start md:items-end text-left md:text-right">
          <span className="text-xl md:text-2xl text-[#8A8A90] font-normal">
            Let's start
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-normal text-white tracking-tight my-1">
            Join the
          </h2>
          <Headline
            text="*Community*"
            as="h2"
            accentColor="muted"
            className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight -mt-2 mb-6"
          />

          <Link
            to="/signup"
            className="group flex items-center gap-3 text-lg md:text-xl font-medium text-white hover:text-[#F7FFB8] transition-colors"
          >
            <span className="underline underline-offset-4 decoration-white/30 group-hover:decoration-[#F7FFB8]">
              Get in touch
            </span>
            <span className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 group-hover:bg-[#F7FFB8] transition-all shadow-md">
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Sub-labels Row */}
      <div className="flex items-center justify-between text-xs text-[#8A8A90] pt-12 pb-4 border-b border-white/10">
        <span>• Impactful Creative</span>
        <span>• Global Casting Support</span>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const navChips = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Featured Talent", path: "/talent" },
    { label: "Reviews", path: "/reviews" },
    { label: "Our Blog", path: "/blog" },
    { label: "Casting Discovery", path: "/discovery" }
  ];

  return (
    <footer className="w-full max-w-[1380px] mx-auto px-4 md:px-7 pb-12">
      <ContactBlock />

      {/* 2-Card Asymmetric Footer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8">
        {/* Left Card (~62% width on desktop) */}
        <div className="lg:col-span-8 rounded-[28px] bg-[#141415] border border-white/10 p-7 md:p-9 relative overflow-hidden flex flex-col justify-between min-h-[290px]">
          {/* Top: Wordmark & Statement */}
          <div className="z-10 max-w-md">
            <Link to="/" className="inline-block mb-3">
              <span className="text-2xl font-medium tracking-tight text-white flex items-baseline">
                <span className="font-serif-accent font-normal italic text-white">actors</span>
                <span className="font-sans font-semibold text-[#F7FFB8]">globe</span>
              </span>
            </Link>
            <p className="text-sm text-[#B9B9BE] leading-relaxed">
              We empower actors and casting directors to share their visions, discover transformative roles, and connect with the global entertainment stage.
            </p>
          </div>

          {/* Giant Faded Background Monogram Watermark */}
          <div className="absolute right-3 bottom-0 select-none pointer-events-none opacity-[0.04]">
            <span className="font-serif-accent italic text-[240px] md:text-[320px] font-bold text-white leading-none">
              ag
            </span>
          </div>

          {/* Bottom: Nav Chips & Copyright */}
          <div className="z-10 pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex flex-wrap gap-2 max-w-md">
              {navChips.map((chip) => (
                <Link
                  key={chip.path}
                  to={chip.path}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/10 bg-white/[0.04] text-[#D7D7DB] hover:text-white hover:border-white/25 transition-colors"
                >
                  {chip.label}
                </Link>
              ))}
            </div>

            <div className="text-xs text-[#8A8A90] whitespace-nowrap">
              ActorsGlobe © 2026. All Rights Reserved
            </div>
          </div>
        </div>

        {/* Right Card (~38% width on desktop) */}
        <div className="lg:col-span-4 rounded-[28px] bg-[#141415] border border-white/10 p-7 md:p-9 flex flex-col justify-between min-h-[290px]">
          {/* Top: Socials */}
          <div>
            <h3 className="text-base font-medium text-white mb-4">
              Explore the Socials of ActorsGlobe
            </h3>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bottom: Newsletter Pill Form */}
          <div className="pt-6">
            <div className="flex items-center gap-2 text-xs text-[#8A8A90] mb-2 font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span>Newsletter</span>
            </div>

            <form onSubmit={handleSubscribe} className="relative w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={subscribed ? "Thank you for subscribing!" : "Your email"}
                disabled={subscribed}
                className="w-full h-12 pl-4 pr-14 rounded-full bg-[#0A0A0A] border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#DBAAF4] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#F7FFB8] transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                {subscribed ? <Check className="w-4 h-4 text-emerald-600" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-[11px] text-[#8A8A90] mt-2">
              By subscribing, you accept our{" "}
              <Link to="/about" className="underline hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
