import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Film,
  ShieldCheck,
  CreditCard,
  Camera,
  ArrowRight
} from "lucide-react";
import { Headline } from "../components/Headline";

interface FAQItem {
  id: string;
  category: "auditions" | "casters" | "monographs" | "billing" | "safety";
  question: string;
  answer: string;
}

export const HelpFaq: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "faq-1": true // First item opened by default
  });

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      category: "auditions",
      question: "What are the recommended specifications for audition self-tapes?",
      answer:
        "We recommend recording in 1080p DCI (16:9 landscape format) with a clean, solid neutral background (slate grey or muted navy). Frame yourself from the mid-chest up. Prioritize clean audio with a dedicated lavalier or shotgun mic, ensuring your reading partner sits directly beside the camera lens so your eye-line remains authentic without looking directly down the barrel."
    },
    {
      id: "faq-2",
      category: "safety",
      question: "Are audition fees permitted on ActorsGlobe?",
      answer:
        "Never. ActorsGlobe enforces an absolute zero-tolerance policy against charging performers audition fees, reading fees, or mandatory workshop fees to be seen. Any casting notice requesting money violates our Terms of Service and will result in immediate permanent expulsion and reporting to SAG-AFTRA and Equity."
    },
    {
      id: "faq-3",
      category: "casters",
      question: "How are casting directors and studios verified?",
      answer:
        "Every casting director undergoes multi-tier identity verification. We require proof of accredited industry standing (such as Casting Society of America [CSA], Casting Directors Guild [CDG], or production entity verification with registered EIN/VAT credentials). Only verified casters can post notices and access performer reels."
    },
    {
      id: "faq-4",
      category: "monographs",
      question: "What media formats are supported for performer monographs?",
      answer:
        "ActorsGlobe supports high-resolution photographic monographs (JPEG, PNG, WebP up to 25MB each) and video reels in MP4/MOV formats up to 4K resolution. Our automated ingest pipeline generates color-accurate web streaming masters while preserving your original camera dynamic range."
    },
    {
      id: "faq-5",
      category: "auditions",
      question: "Are audition sides protected under confidentiality agreements?",
      answer:
        "Yes. All sides distributed through ActorsGlobe are digitally watermarked with the applicant's unique identifier and timestamp. Audition sides are strictly confidential and governed by non-disclosure agreements. Sharing sides on social media or public forums violates copyright and platform policy."
    },
    {
      id: "faq-6",
      category: "billing",
      question: "How does membership billing work, and can I cancel anytime?",
      answer:
        "Both Actor Pro and Studio Enterprise memberships are billed monthly or annually via encrypted payment gateways (including Razorpay, Stripe, and major international cards). You can pause or cancel your subscription at any time from your account settings with zero cancellation penalties."
    },
    {
      id: "faq-7",
      category: "safety",
      question: "How does ActorsGlobe protect my voice and visual likeness from AI exploitation?",
      answer:
        "Your monograph, voice samples, and video auditions are protected with active anti-scraping watermarks and explicit contractual prohibitions. We strictly prohibit web crawlers and AI models from harvesting performer data for generative AI training without explicit, compensation-backed consent."
    },
    {
      id: "faq-8",
      category: "monographs",
      question: "Can I manage multiple representations or agency contacts on my profile?",
      answer:
        "Yes. Performers can list theatrical agents, commercial agents, and managers with dedicated contact routes. When a casting director sends an audition invitation, notifications are routed to both the performer and their registered agency representatives simultaneously."
    }
  ];

  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "auditions", label: "Auditions & Tapes", icon: Film },
    { id: "safety", label: "Safety & Integrity", icon: ShieldCheck },
    { id: "casters", label: "Caster Verification", icon: Camera },
    { id: "monographs", label: "Monographs & Media", icon: Sparkles },
    { id: "billing", label: "Subscriptions & Billing", icon: CreditCard }
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesQuery =
        !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col gap-12 md:gap-16 w-full pb-24 pt-4">
      {/* =========================================================================
          HERO & SEARCH SECTION
         ========================================================================= */}
      <section className="text-center max-w-3xl mx-auto px-4 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 mb-4">
          <Sparkles className="w-3 h-3 text-[#F7FFB8]" />
          <span>Knowledge & Casting Sanctuary</span>
        </div>

        <Headline
          text="How can we assist your *creative journey*?"
          as="h1"
          accentColor="dune"
          className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-tight"
        />

        <p className="text-base text-[#B9B9BE] mt-4 max-w-xl">
          Everything you need to know about self-tape protocols, caster accreditation, digital monographs, and safety standards.
        </p>

        {/* Live Search Input */}
        <div className="relative w-full max-w-xl mt-8">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A90]" />
          <input
            type="text"
            placeholder="Search questions (e.g. self-tapes, union sides, billing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-[#0E0E10] input-editorial text-sm shadow-2xl transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8A8A90] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* =========================================================================
          CATEGORY FILTER CHIPS
         ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto px-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#F7FFB8] text-black shadow-lg"
                  : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          ACCORDIONS GRID
         ========================================================================= */}
      <section className="max-w-3xl mx-auto w-full px-4 flex flex-col gap-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = !!openItems[faq.id];
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-[#0E0E10] border-[#F7FFB8]/40 shadow-xl"
                    : "bg-[#0E0E10]/60 border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-medium text-white tracking-tight">
                    {faq.question}
                  </span>
                  <span
                    className={`p-2 rounded-full bg-white/5 text-white/80 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180 bg-[#F7FFB8] text-black" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#D7D7DB] leading-relaxed border-t border-white/10 pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center rounded-3xl border border-dashed border-white/10 p-8">
            <p className="text-sm text-[#8A8A90]">No questions matched your search query.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs text-[#F7FFB8] underline underline-offset-4 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          STILL HAVE QUESTIONS CARD
         ========================================================================= */}
      <section className="max-w-3xl mx-auto w-full px-4">
        <div className="rounded-3xl border border-white/12 bg-linear-to-r from-emerald-950/30 via-[#0E0E10] to-[#070707] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F7FFB8]">24/7 Casting Concierge</span>
            <h3 className="text-xl font-normal text-white mt-1">Still seeking clarity on your audition?</h3>
            <p className="text-xs sm:text-sm text-[#8A8A90] mt-1 max-w-md">
              Our regional casting support staff and community managers are available around the clock.
            </p>
          </div>

          <Link
            to="/contact"
            className="py-3 px-6 rounded-full bg-white text-black font-medium text-xs sm:text-sm flex items-center gap-2 hover:bg-[#F7FFB8] transition-all shadow-md shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpFaq;
