import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Headline } from "../components/Headline";
import { LensButton } from "../components/LensButton";
import { HERO_SLIDES, EDITORS_PICKS, AMBASSADORS } from "../data/mockContent";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Award,
  Users,
  Layers,
  Zap,
  Smartphone,
  Globe
} from "lucide-react";
import { TwitterIcon, InstagramIcon, FacebookIcon } from "../components/SocialIcons";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Hero slideshow state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlideIndex];

  // (02) Our Experience carousel state
  const [experienceCategory, setExperienceCategory] = useState("Feature Film");
  const [experienceIndex, setExperienceIndex] = useState(0);

  const experienceSlides = [
    {
      title: "Beneath the Endless Summer Clouds",
      author: "Kai Bergström",
      imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Neon Echoes: Midnight in Berlin",
      author: "Nikeran Tarone",
      imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Solitude on the Dune Horizon",
      author: "Joan Grover",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  // (03) Editor's picks active expand state
  const [expandedPickId, setExpandedPickId] = useState<string>("pick-1");

  // (04) Facts accordion state
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number>(0);

  const factsList = [
    {
      id: "fact-1",
      icon: Users,
      title: "Members part of people",
      body: "No more empty 'hey' messages. On ActorsGlobe, chats start with shared interests - cinematic influences, character motivations, or the little artistic nuances that define you."
    },
    {
      id: "fact-2",
      icon: Award,
      title: "A lot of awards",
      body: "Over 85 festival-recognized independent films and commercial productions cast their lead talent through ActorsGlobe verified monographs."
    },
    {
      id: "fact-3",
      icon: Layers,
      title: "5M+ Creative Works Published",
      body: "Actors, voice performers, and directors have shared over five million media assets, audition reels, and monologues across 140 countries."
    },
    {
      id: "fact-4",
      icon: Zap,
      title: "Featured by Industry Leaders",
      body: "Praised by Variety, The Hollywood Reporter, and top European casting guilds as the premier digital sanctuary for authentic performance craft."
    }
  ];

  return (
    <div className="flex flex-col gap-24 md:gap-32 w-full pb-16">
      {/* =========================================================================
          SECTION A: HERO SLIDESHOW
         ========================================================================= */}
      <section className="px-4 md:px-7 pt-2">
        <div className="relative w-full rounded-[28px] md:rounded-[36px] min-h-160 md:min-h-190 overflow-hidden border border-white/10 flex flex-col justify-between p-6 md:p-14 bg-black">
          {/* Slideshow Background Images with Cross-Fade */}
          {HERO_SLIDES.map((s, index) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlideIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
              style={{
                backgroundImage: `url(${s.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          ))}

          {/* Scrim Gradient Overlays for pristine typographic contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Top Bar inside Hero: Tag Badge + Top-Right Author Card */}
          <div className="relative z-10 flex items-start justify-between w-full">
            <div className="px-4 py-1.5 rounded-full glass text-xs md:text-sm font-medium tracking-wide text-white/90 border border-white/20">
              {slide.tag}
            </div>

            {/* Author Card (Top-Right on Desktop) */}
            <div className="hidden sm:flex items-center gap-3.5 p-2 pr-4 rounded-3xl glass border border-white/15 max-w-xs animate-in fade-in duration-500">
              <img
                src={slide.authorAvatar}
                alt={slide.authorName}
                className="w-12 h-12 rounded-2xl object-cover border border-white/20"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">
                  {slide.authorName}
                </span>
                <span className="text-xs text-[#D7D7DB] opacity-75">
                  {slide.authorRole}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white ml-2">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Bottom Hero Layout: Left Editorial Copy & Right 3D Refractive Glass Orb CTA */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mt-24 md:mt-36">
            <div className="lg:col-span-8 flex flex-col gap-4 max-w-2xl">
              <Headline
                text={slide.headline}
                as="h1"
                accentColor="white"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08]"
              />
              <p className="text-base sm:text-lg text-white/85 font-normal max-w-lg leading-relaxed">
                {slide.subtitle}
              </p>

              {/* Mobile Author Card Row */}
              <div className="sm:hidden flex items-center gap-3 p-2.5 rounded-2xl glass mt-2 border border-white/15">
                <img
                  src={slide.authorAvatar}
                  alt={slide.authorName}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold text-white">{slide.authorName}</span>
                  <span className="text-xs text-[#D7D7DB]">{slide.authorRole}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Right: Liquid Glass Lens Button + Slide Indicator Capsules */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between h-full gap-8">
              <LensButton
                label="Get Started"
                onClick={() => navigate("/discovery")}
                className="shadow-2xl"
              />

              {/* 5 Slide Indicators with Active Fill */}
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentSlideIndex
                        ? "w-8 bg-white border border-white"
                        : "w-2.5 bg-white/30 hover:bg-white/50 border border-white/20"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: (01) ABOUT US & WIREFRAME GLOBE
         ========================================================================= */}
      <section className="px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Section Marker + Ambient Halftone Globe Visual */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-80 relative">
            <div>
              <span className="text-sm md:text-base font-medium tracking-wider text-[#8A8A90]">
                (01) About Us
              </span>
            </div>

            {/* Halftone / Line-Stripe Wireframe Globe Representation */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto lg:mx-0 my-6 flex items-center justify-center opacity-25">
              <div className="w-full h-full rounded-full border border-dashed border-white/30 flex items-center justify-center animate-spin [animation-duration:60s]">
                <Globe className="w-48 h-48 text-white/50 stroke-[0.8]" />
              </div>
            </div>

            {/* Mini Label */}
            <div className="flex items-center gap-2 text-xs text-[#8A8A90]">
              <span className="font-serif-accent italic text-white font-medium">ag</span>
              <span className="w-px h-3 bg-white/20" />
              <span>ActorsGlobe supports creators from all over the world</span>
            </div>
          </div>

          {/* Right: Indented Statement & Social Action Row */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <Headline
              text="We connect actors, filmmakers and visual artists *worldwide to share their vision*, grow their craft, and collaborate on projects."
              as="p"
              accentColor="dune"
              className="text-2xl sm:text-3xl md:text-4xl font-normal leading-[1.3] text-white lg:indent-24"
            />

            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white mr-2">Explore our social</span>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              </div>

              <Link
                to="/about"
                className="px-6 py-3 rounded-full border border-white/20 text-sm font-medium text-white hover:bg-white/10 flex items-center gap-2 group transition-all"
              >
                <span>About Us</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: (02) OUR EXPERIENCE CAROUSEL
         ========================================================================= */}
      <section className="px-4 md:px-7">
        <div className="rounded-4xl bg-[#0D0D0E] border border-white/10 p-6 md:p-10 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <span className="text-xs md:text-sm font-medium tracking-wider text-[#8A8A90] uppercase">
                (02) Our Experience
              </span>
              <Headline
                text="When *moments* become stories, and *stories* shape reality"
                as="h2"
                accentColor="muted"
                className="text-2xl sm:text-3xl md:text-4xl font-normal text-white max-w-xl mt-2 tracking-tight"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3 text-sm">
              {["Feature Film", "Dramatic Series", "Commercial", "Auteur Shorts"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setExperienceCategory(cat)}
                  className={`text-left transition-colors cursor-pointer ${
                    experienceCategory === cat
                      ? "text-white font-medium underline underline-offset-4 decoration-[#F7FFB8]"
                      : "text-[#8A8A90] hover:text-[#D7D7DB]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel Layout: Left Metadata + Right Main Image with Side Peek */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-4">
            <div className="lg:col-span-4 flex flex-col justify-between gap-6">
              <div>
                <h3 className="text-xl md:text-2xl font-medium text-white leading-snug">
                  {experienceSlides[experienceIndex].title}
                </h3>
                <p className="text-sm text-[#8A8A90] mt-1">
                  Director & Artist: {experienceSlides[experienceIndex].author}
                </p>
              </div>

              {/* Navigation Arrows with Pink Glow Active Next Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setExperienceIndex((prev) => (prev > 0 ? prev - 1 : experienceSlides.length - 1))
                  }
                  className="w-12 h-12 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setExperienceIndex((prev) => (prev + 1) % experienceSlides.length)
                  }
                  className="w-12 h-12 rounded-full carousel-btn-next-active flex items-center justify-center text-white transition-all cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Side: Active Main Slide + Side Peeking Card */}
            <div className="lg:col-span-8 relative flex gap-4 overflow-hidden rounded-[28px]">
              <div className="w-full md:w-[85%] shrink-0 h-95 md:h-120 rounded-[28px] overflow-hidden border border-white/10 relative">
                <img
                  src={experienceSlides[experienceIndex].imageUrl}
                  alt={experienceSlides[experienceIndex].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Peeking Next Slide */}
              <div className="hidden md:block w-[20%] shrink-0 h-120 rounded-[28px] overflow-hidden opacity-40 border border-white/10">
                <img
                  src={experienceSlides[(experienceIndex + 1) % experienceSlides.length].imageUrl}
                  alt="Next Peek"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: (03) EDITOR'S PICKS EXPANDABLE BENTO
         ========================================================================= */}
      <section className="px-4 md:px-7">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <span className="text-xs md:text-sm font-medium tracking-wider text-[#8A8A90] uppercase">
              (03) Editor's Picks
            </span>
            <Headline
              text="Curated *collections* from the ActorsGlobe *community*"
              as="h2"
              accentColor="mauve"
              className="text-2xl sm:text-3xl md:text-4xl font-normal text-white max-w-xl mt-2 tracking-tight"
            />
          </div>
          <p className="text-sm md:text-base text-[#8A8A90] max-w-md leading-relaxed">
            A carefully selected collection of modern performance, visual narratives, and artistic expression — curated to inspire new perspectives through culture and contemporary storytelling.
          </p>
        </div>

        {/* 3 Bento Cards with Flex-Grow Expand Interaction */}
        <div className="flex flex-col lg:flex-row gap-5 min-h-140">
          {EDITORS_PICKS.map((pick) => {
            const isExpanded = expandedPickId === pick.id;
            return (
              <div
                key={pick.id}
                onMouseEnter={() => setExpandedPickId(pick.id)}
                className={`relative rounded-4xl md:rounded-[36px] overflow-hidden border border-white/10 transition-all duration-500 ease-out cursor-pointer flex flex-col justify-between p-6 md:p-8 ${
                  isExpanded ? "lg:flex-[2.2]" : "lg:flex-1"
                } h-130 lg:h-145`}
              >
                {/* Background Image */}
                <img
                  src={pick.imageUrl}
                  alt={pick.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top-Left User Chip */}
                <div className="relative z-10 self-start flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/15">
                  <img
                    src={pick.avatar}
                    alt={pick.user}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-white">{pick.user}</span>
                  <span className="text-[11px] text-[#8A8A90]">{pick.handle}</span>
                </div>

                {/* Bottom Metadata & Expand Details */}
                <div className="relative z-10 flex flex-col gap-3">
                  <h3 className="text-2xl font-medium text-white tracking-tight">
                    {pick.title}
                  </h3>

                  {isExpanded ? (
                    <p className="text-xs sm:text-sm text-[#D7D7DB] leading-relaxed max-w-md animate-in fade-in duration-300">
                      {pick.description}
                    </p>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2 rounded-xl glass border border-white/15 text-xs font-medium text-white">
                      <span>More Details</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION E: (04) FACTS & EMERALD STATS SQUIRCLE
         ========================================================================= */}
      <section className="px-4 md:px-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Accordion Metrics List */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <span className="text-xs md:text-sm font-medium tracking-wider text-[#8A8A90] uppercase">
                (04) Facts
              </span>
              <Headline
                text="Facts *about us*"
                as="h2"
                accentColor="muted"
                className="text-3xl md:text-4xl font-normal text-white mt-1 mb-3"
              />
              <p className="text-lg text-white/90">
                ActorsGlobe was born from a simple idea: every creator deserves a worthy stage.
              </p>
            </div>

            <div className="border-y border-white/10 mt-2">
              <div className="flex flex-col divide-y divide-white/10">
              {factsList.map((fact, index) => {
                const isOpen = openAccordionIndex === index;
                const Icon = fact.icon;
                return (
                  <div
                    key={fact.id}
                    onClick={() => setOpenAccordionIndex(isOpen ? -1 : index)}
                    className="py-5 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            isOpen ? "text-[#F7FFB8]" : "text-[#8A8A90] group-hover:text-white"
                          }`}
                        />
                        <h4
                          className={`text-lg md:text-xl font-medium transition-colors ${
                            isOpen ? "text-white" : "text-[#8A8A90] group-hover:text-white"
                          }`}
                        >
                          {fact.title}
                        </h4>
                      </div>
                      <span className="text-white/40 text-lg">{isOpen ? "−" : "+"}</span>
                    </div>

                    {isOpen && (
                      <p className="text-sm text-[#B9B9BE] leading-relaxed mt-3 pl-8 animate-in fade-in duration-200">
                        {fact.body}
                      </p>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Right: 3D Glowing Emerald Squircle Card with 50K+ Members */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-135 aspect-square rounded-[60px] md:rounded-[90px] emerald-stats-mesh p-8 md:p-12 relative flex items-center justify-center overflow-hidden">
              {/* Center Frosted Glass Circle */}
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full glass border border-white/30 backdrop-blur-3xl flex flex-col items-center justify-center text-center shadow-2xl relative z-10">
                <span className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                  50K+
                </span>
                <span className="text-lg md:text-xl text-[#F7FFB8] font-medium mt-1">
                  Members
                </span>
              </div>

              {/* Floating Orbiting Member User Chips */}
              <div className="absolute top-8 right-8 z-20 px-3.5 py-1.5 rounded-full glass border border-white/20 text-xs text-white flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>@jeny_renken</span>
              </div>

              <div className="absolute bottom-16 left-6 z-20 px-3.5 py-1.5 rounded-full glass border border-white/20 text-xs text-white flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#F7FFB8]" />
                <span>@wally_foertsch</span>
              </div>

              <div className="absolute bottom-10 right-12 z-20 px-3.5 py-1.5 rounded-full glass border border-white/20 text-xs text-white flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>@mary_sander</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F: APP DOWNLOAD CARD & 5-DEVICE SWEEPING ARC
         ========================================================================= */}
      <section className="px-4 md:px-7">
        <div className="rounded-[40px] bg-linear-to-b from-[#151915] via-[#3E4A36] to-[#A9C185] p-8 md:p-16 border border-white/15 flex flex-col items-center text-center relative overflow-hidden">
          <Headline
            text="Get the *full range of features* by downloading our *mobile app.*"
            as="h2"
            accentColor="dune"
            className="text-3xl sm:text-4xl md:text-5xl font-normal text-white max-w-2xl leading-tight"
          />
          <p className="text-sm md:text-base text-white/85 max-w-md mt-3 mb-8">
            We empower visual creators and performers to share their stories and connect with the world.
          </p>

          {/* Store Glass Pill Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 z-20 mb-12">
            <button className="px-6 py-3 rounded-full glass border border-white/20 hover:border-white/40 flex items-center gap-3 text-white transition-all">
              <Smartphone className="w-5 h-5 text-[#F7FFB8]" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[10px] text-[#D7D7DB] uppercase tracking-wider">Download on the</span>
                <span className="text-sm font-semibold text-white">App Store</span>
              </div>
            </button>
            <button className="px-6 py-3 rounded-full glass border border-white/20 hover:border-white/40 flex items-center gap-3 text-white transition-all">
              <Smartphone className="w-5 h-5 text-[#F7FFB8]" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[10px] text-[#D7D7DB] uppercase tracking-wider">Get it on</span>
                <span className="text-sm font-semibold text-white">Google Play</span>
              </div>
            </button>
          </div>

          {/* 5-Device Arc Mockups Preview Display */}
          <div className="relative w-full max-w-4xl h-64 md:h-80 flex items-end justify-center gap-3 md:gap-5 overflow-hidden">
            {[
              { title: "Audition Reel", img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=400" },
              { title: "Portfolio Feed", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400" },
              { title: "Discovery Space", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400", isCenter: true },
              { title: "Stats Monograph", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" },
              { title: "Direct Chat", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400" }
            ].map((device, i) => (
              <div
                key={i}
                className={`rounded-t-4xl border-t-2 border-x-2 border-white/30 bg-[#0A0A0A] overflow-hidden shadow-2xl transition-all duration-300 ${
                  device.isCenter
                    ? "w-44 md:w-56 h-60 md:h-76 z-20 scale-105"
                    : "w-32 md:w-40 h-48 md:h-60 opacity-80"
                }`}
              >
                <img
                  src={device.img}
                  alt={device.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G: (05) WHY CHOOSE US? 2x2 BENTO GRID
         ========================================================================= */}
      <section className="px-4 md:px-7">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs md:text-sm font-medium tracking-wider text-[#8A8A90] uppercase">
            (05) Why Choose Us?
          </span>
          <Headline
            text="More than a *platform* a creative *movement*"
            as="h2"
            accentColor="muted"
            className="text-3xl md:text-5xl font-normal text-white mt-2 tracking-tight"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-5xl mx-auto">
          {/* Card 1: Wide - No loss of quality */}
          <div className="md:col-span-7 rounded-[28px] bg-[#0D0D0E] border border-white/10 p-7 flex flex-col justify-between min-h-80">
            <div className="h-40 rounded-2xl iridescent-border p-4 flex items-center justify-center relative overflow-hidden">
              <div className="w-32 h-24 rounded-lg bg-white/10 border border-white/20 shadow-xl -rotate-6 transform" />
              <div className="w-32 h-24 rounded-lg bg-white/20 border border-white/30 shadow-2xl rotate-6 transform absolute" />
            </div>
            <div>
              <h4 className="text-xl font-medium text-white mb-1">No loss of quality</h4>
              <p className="text-xs md:text-sm text-[#8A8A90] leading-relaxed">
                Show your audition tapes and production portfolios the way you intended. No compression, no distortion - just pure cinematic clarity.
              </p>
            </div>
          </div>

          {/* Card 2: Narrow - Collaborations That Inspire */}
          <div className="md:col-span-5 rounded-[28px] bg-[#0D0D0E] border border-white/10 p-7 flex flex-col justify-between min-h-80">
            <div className="h-40 flex items-center justify-center">
              <div className="flex -space-x-3">
                {AMBASSADORS.slice(0, 4).map((a, i) => (
                  <img
                    key={i}
                    src={a.avatar}
                    alt={a.name}
                    className="w-12 h-12 rounded-full border-2 border-black object-cover"
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xl font-medium text-white mb-1">Collaborations That Inspire</h4>
              <p className="text-xs md:text-sm text-[#8A8A90] leading-relaxed">
                Find co-stars and visionaries based on aesthetics, tone, and performance chemistry.
              </p>
            </div>
          </div>

          {/* Card 3: Narrow - Showcase That Sells */}
          <div className="md:col-span-5 rounded-[28px] bg-[#0D0D0E] border border-white/10 p-7 flex flex-col justify-between min-h-80">
            <div className="h-40 grid grid-cols-3 gap-2 p-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xl border ${
                    i === 1
                      ? "border-[#F7FFB8] bg-[#F7FFB8]/10"
                      : "border-white/10 bg-white/2"
                  }`}
                />
              ))}
            </div>
            <div>
              <h4 className="text-xl font-medium text-white mb-1">Showcase That Sells</h4>
              <p className="text-xs md:text-sm text-[#8A8A90] leading-relaxed">
                Your profile is an auteur monograph. Clean, stylish, and casting-room ready.
              </p>
            </div>
          </div>

          {/* Card 4: Wide - Smart Networking */}
          <div className="md:col-span-7 rounded-[28px] bg-[#0D0D0E] border border-white/10 p-7 flex flex-col justify-between min-h-80">
            <div className="h-40 flex items-center justify-center relative">
              <div className="w-32 h-32 rounded-full border border-dashed border-white/20 animate-spin [animation-duration:30s] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-white/30 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#F7FFB8] text-black text-xs font-bold flex items-center justify-center">
                    ag
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-medium text-white mb-1">Smart Networking</h4>
              <p className="text-xs md:text-sm text-[#8A8A90] leading-relaxed">
                Our algorithm matches performers to roles that fit their exact physical specs and artistic range.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION H: "WE CREATE FUTURE" TICKER PILLS
         ========================================================================= */}
      <section className="px-4 md:px-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          <div className="h-32 md:h-40 rounded-full bg-[#0D0D0E] border border-white/10 flex items-center justify-center text-3xl md:text-5xl font-medium text-white">
            We
          </div>
          <div className="h-32 md:h-40 rounded-full bg-[#0D0D0E] border border-white/10 flex items-center justify-center text-3xl md:text-5xl font-medium text-white">
            Create
          </div>
          {/* Orange Swirl Highlight Pill with Hand-Drawn Looping Arrow */}
          <div className="h-32 md:h-40 rounded-full manifesto-pill-orange flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-xl relative overflow-hidden group">
            <span className="relative z-10 text-3xl md:text-4xl font-bold">➿ ➔</span>
          </div>
          <div className="h-32 md:h-40 rounded-full bg-[#0D0D0E] border border-white/10 flex items-center justify-center text-3xl md:text-5xl font-medium text-white">
            Future
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
