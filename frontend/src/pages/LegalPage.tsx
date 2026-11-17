import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Lock,
  Printer,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Headline } from "../components/Headline";

interface LegalPageProps {
  type?: "privacy" | "terms" | "guidelines";
}

export const LegalPage: React.FC<LegalPageProps> = ({ type: propType }) => {
  const location = useLocation();

  // Resolve document type from prop or current pathname
  const activeDoc: "privacy" | "terms" | "guidelines" = (() => {
    if (propType) return propType;
    if (location.pathname.includes("terms")) return "terms";
    if (location.pathname.includes("guidelines")) return "guidelines";
    return "privacy";
  })();

  const [activeSection, setActiveSection] = useState<string>("section-1");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeDoc]);

  // Documents definition
  const docs = {
    privacy: {
      title: "Privacy & Data Protection",
      accent: "*Monograph Safeguards*",
      subtitle:
        "How ActorsGlobe protects performer likeness, biometric media, audition tapes, and contact records with zero-compromise encryption.",
      lastUpdated: "October 18, 2026",
      version: "v2.8 Editorial Standard",
      sections: [
        {
          id: "section-1",
          title: "1. Scope & Likeness Ownership",
          content: (
            <>
              <p>
                At ActorsGlobe, we hold a fundamental conviction: <strong>your face, voice, performance, and artistic monograph belong exclusively to you.</strong> We collect biographical information, headshots, showreels, audio vocal clips, and casting representation data solely for legitimate audition discovery.
              </p>
              <div className="my-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>AI Training Prohibition:</strong> ActorsGlobe explicitly bans the use of performer headshots, voice samples, or video self-tapes for generative AI model training or synthetic voice cloning without explicit, separate written authorization.
                </span>
              </div>
            </>
          )
        },
        {
          id: "section-2",
          title: "2. Information Collected & Ingest Security",
          content: (
            <>
              <p>
                When an actor or casting director creates an account, we collect authenticated credentials, professional credits, union affiliation (SAG-AFTRA, Equity, or non-union), agent/agency representation contacts, and audition media files.
              </p>
              <p className="mt-3">
                All media uploads are encrypted in transit via TLS 1.3 and stored in isolated, access-controlled buckets with DRM watermarks tied to authorized casting reviewers.
              </p>
            </>
          )
        },
        {
          id: "section-3",
          title: "3. Audition Self-Tape Confidentiality",
          content: (
            <>
              <p>
                Audition recordings submitted through the platform are confidential work-product. They are accessible strictly by the verified casting directors, producers, and directors associated with the specific production role to which you applied.
              </p>
              <p className="mt-3">
                Audition files are automatically archived or purged according to production retention rules and cannot be repurposed or displayed publicly without performer consent.
              </p>
            </>
          )
        },
        {
          id: "section-4",
          title: "4. Your Rights (GDPR & CCPA)",
          content: (
            <>
              <p>
                Regardless of your country of residence, you maintain full rights to inspect, download, update, or permanently delete your monograph and personal records at any time via your account settings or by transmitting a request to <code>privacy@actorsglobe.com</code>.
              </p>
            </>
          )
        }
      ]
    },
    terms: {
      title: "Terms of Service",
      accent: "*Platform Covenant*",
      subtitle:
        "The contractual conditions governing performer monographs, casting director verification, audition etiquette, and membership.",
      lastUpdated: "October 18, 2026",
      version: "v3.1 Production Agreement",
      sections: [
        {
          id: "section-1",
          title: "1. Acceptance & Ethical Casting Covenant",
          content: (
            <>
              <p>
                By accessing or registering with ActorsGlobe, you enter into a legally binding agreement to uphold integrity, professional courtesy, and ethical casting practices.
              </p>
              <div className="my-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Absolute Ban on Audition Fees:</strong> Casting directors, studios, and agents are strictly forbidden from charging performers application fees, reading fees, or audition deposits. Immediate account termination and legal reporting follow any violation.
                </span>
              </div>
            </>
          )
        },
        {
          id: "section-2",
          title: "2. Sides Intellectual Property & Non-Disclosure",
          content: (
            <>
              <p>
                All screenplay excerpts, character sides, and casting briefs provided through the platform constitute proprietary intellectual property of the respective production companies. Performers agree not to publish, reproduce, or share audition sides or tape readings on public social platforms.
              </p>
            </>
          )
        },
        {
          id: "section-3",
          title: "3. Membership & Payment Processing",
          content: (
            <>
              <p>
                Paid subscriptions for enhanced monograph presentation and casting studio workflows are billed in advance on a recurring monthly or annual cadence through accredited gateways (including Razorpay). Subscriptions may be terminated at any time without punitive cancellation fees.
              </p>
            </>
          )
        },
        {
          id: "section-4",
          title: "4. Account Integrity & Termination",
          content: (
            <>
              <p>
                ActorsGlobe reserves the right to suspend or expel accounts that submit fraudulent representation credentials, misrepresent performer identity, or engage in unverified casting solicitations.
              </p>
            </>
          )
        }
      ]
    },
    guidelines: {
      title: "Community & Audition Standards",
      accent: "*Safety Sanctuary*",
      subtitle:
        "Essential safeguards guaranteeing a respectful, harassment-free, and inspiring creative atmosphere for all performers and filmmakers.",
      lastUpdated: "October 18, 2026",
      version: "v1.9 Safety Charter",
      sections: [
        {
          id: "section-1",
          title: "1. Safe Audition Environments",
          content: (
            <>
              <p>
                Auditions conducted under the ActorsGlobe umbrella must occur in recognized professional settings or secure virtual rooms. Self-tapes must never require nudity or intimate physical contact without prior written clearance and SAG-AFTRA accredited Intimacy Coordinator oversight.
              </p>
            </>
          )
        },
        {
          id: "section-2",
          title: "2. Non-Discrimination & Auteur Respect",
          content: (
            <>
              <p>
                We celebrate transformative cinema from creators of all backgrounds, sexual orientations, gender expressions, and ethnicities. Any discriminatory communication or harassment will result in an immediate permanent ban.
              </p>
            </>
          )
        },
        {
          id: "section-3",
          title: "3. Prompt Feedback & Communication Etiquette",
          content: (
            <>
              <p>
                We encourage casting teams to provide clear audition timelines and respect performer labor. Self-tape submission windows should provide at least 48 hours for preparation whenever possible.
              </p>
            </>
          )
        },
        {
          id: "section-4",
          title: "4. Reporting Suspicious Activity",
          content: (
            <>
              <p>
                If you encounter any casting call or direct communication that violates safety standards, report it immediately using our in-app reporting button or write to <code>safety@actorsglobe.com</code>.
              </p>
            </>
          )
        }
      ]
    }
  };

  const currentDoc = docs[activeDoc];

  return (
    <div className="flex flex-col gap-12 w-full pb-24 pt-4">
      {/* =========================================================================
          TAB SWITCHER & DOCUMENT METADATA
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Document Selector Pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10">
          <Link
            to="/privacy"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeDoc === "privacy"
                ? "bg-[#F7FFB8] text-black shadow-md"
                : "text-[#8A8A90] hover:text-white"
            }`}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeDoc === "terms"
                ? "bg-[#F7FFB8] text-black shadow-md"
                : "text-[#8A8A90] hover:text-white"
            }`}
          >
            Terms of Service
          </Link>
          <Link
            to="/guidelines"
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeDoc === "guidelines"
                ? "bg-[#F7FFB8] text-black shadow-md"
                : "text-[#8A8A90] hover:text-white"
            }`}
          >
            Safety Guidelines
          </Link>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/14 bg-white/5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Document</span>
        </button>
      </div>

      {/* =========================================================================
          DOCUMENT HEADER
         ========================================================================= */}
      <section className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 mb-3">
          <Sparkles className="w-3 h-3 text-[#F7FFB8]" />
          <span>{currentDoc.version}</span>
        </div>

        <Headline
          text={`${currentDoc.title} ${currentDoc.accent}`}
          as="h1"
          accentColor="dune"
          className="text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight"
        />

        <p className="text-base text-[#B9B9BE] mt-3 leading-relaxed">
          {currentDoc.subtitle}
        </p>

        <div className="flex items-center gap-4 text-xs text-[#8A8A90] mt-4 font-mono">
          <span>Effective Date: {currentDoc.lastUpdated}</span>
          <span>• Jurisdiction: Global Entertainment Standards</span>
        </div>
      </section>

      {/* =========================================================================
          2-COLUMN SPLIT (STICKY TOC + EDITORIAL PROSE)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-6 border-t border-white/10">
        {/* Sticky Table of Contents (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 rounded-3xl bg-[#0E0E10] border border-white/10 p-6 flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-widest text-[#8A8A90] font-semibold flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#F7FFB8]" />
              Table of Contents
            </h3>

            <nav className="flex flex-col gap-2">
              {currentDoc.sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`text-xs py-1.5 px-3 rounded-lg transition-all text-left ${
                    activeSection === sec.id
                      ? "bg-white/10 text-[#F7FFB8] font-medium"
                      : "text-[#8A8A90] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {sec.title}
                </a>
              ))}
            </nav>

            <div className="pt-4 mt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-[#8A8A90]">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cryptographically Certified</span>
            </div>
          </div>
        </div>

        {/* Reading Measure Editorial Body (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {currentDoc.sections.map((sec) => (
            <article
              key={sec.id}
              id={sec.id}
              className="scroll-mt-32 p-8 rounded-3xl bg-[#0E0E10]/60 border border-white/10 flex flex-col gap-3"
            >
              <h2 className="text-xl font-normal text-white tracking-tight">
                {sec.title}
              </h2>
              <div className="text-sm text-[#D7D7DB] leading-relaxed max-w-[68ch] space-y-3">
                {sec.content}
              </div>
            </article>
          ))}

          {/* Compliance Contact Footer */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-white">Questions regarding this charter?</h4>
              <p className="text-xs text-[#8A8A90] mt-0.5">
                Our legal counsel and compliance board review all performer inquiries.
              </p>
            </div>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-full bg-[#F7FFB8] text-black text-xs font-medium hover:bg-[#ebf49e] transition-colors shrink-0"
            >
              Contact Legal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalPage;
