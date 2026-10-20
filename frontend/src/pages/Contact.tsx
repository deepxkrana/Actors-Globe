import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Headline } from "../components/Headline";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "ACTOR",
    subject: "",
    message: "",
    urgent: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const offices = [
    {
      city: "Los Angeles",
      region: "North America Hub",
      address: "8560 Sunset Blvd, West Hollywood, CA 90069",
      email: "la@actorsglobe.com",
      timezone: "PST (UTC-8)"
    },
    {
      city: "London",
      region: "European Stage",
      address: "14 Soho Square, Westminster, London W1D 3QG",
      email: "uk@actorsglobe.com",
      timezone: "GMT (UTC+0)"
    },
    {
      city: "Mumbai",
      region: "South Asia Hub",
      address: "Bandra West, Film City Hub, Mumbai 400050",
      email: "in@actorsglobe.com",
      timezone: "IST (UTC+5:30)"
    }
  ];

  return (
    <div className="flex flex-col gap-16 md:gap-24 w-full pb-24 pt-4">
      {/* =========================================================================
          SECTION 1: EDITORIAL HEADER & ROTATING BADGE
         ========================================================================= */}
      <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-white/10 pb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 mb-4">
            <Sparkles className="w-3 h-3 text-[#F7FFB8]" />
            <span>Direct Inquiries & Studio Dispatch</span>
          </div>

          <Headline
            text="Let's build the future of cinema *together*"
            as="h1"
            accentColor="dune"
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-tight"
          />

          <p className="text-base md:text-lg text-[#B9B9BE] mt-4 leading-relaxed">
            Whether you are an auteur director casting an upcoming ensemble, a performer seeking digital monograph representation, or an international partner, our team responds swiftly.
          </p>
        </div>

        {/* Rotating Circular Text Badge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0 self-center md:self-auto">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full rotating-badge select-none pointer-events-none"
          >
            <defs>
              <path
                id="contactCirclePath"
                d="M 70, 70 m -52, 0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
              />
            </defs>
            <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text fill="#D7D7DB" fontSize="8.5" letterSpacing="0.22em" fontWeight="500">
              <textPath href="#contactCirclePath" startOffset="0%">
                • ACTORSGLOBE CASTING • DIGITAL MONOGRAPHS • AUTEUR STAGE •
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-serif italic text-2xl font-medium text-white/90">ag</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 2-COLUMN SPLIT (FORM + GLOBAL HUBS)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Direct Message Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-4xl bg-[#0E0E10] border border-white/12 p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-normal text-white tracking-tight mb-2">Send a Transmission</h2>
            <p className="text-xs md:text-sm text-[#8A8A90] mb-8">
              Verified casting notices and urgent talent submissions are routed directly to our regional casting directors.
            </p>

            {submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-white">Inquiry Received with Honors</h3>
                <p className="text-sm text-[#D7D7DB] max-w-md leading-relaxed">
                  Thank you, <strong className="text-white">{formData.name || "Creator"}</strong>. Our team has received your transmission and will respond to <strong className="text-white">{formData.email}</strong> within 1 business day.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      role: "ACTOR",
                      subject: "",
                      message: "",
                      urgent: false
                    });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full border border-white/20 bg-white/5 text-xs text-white hover:bg-white/10 transition-colors"
                >
                  Send Another Transmission
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1.5 font-medium">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Julian Hayes"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 input-editorial text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1.5 font-medium">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="julian@agency.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 input-editorial text-sm"
                    />
                  </div>
                </div>

                {/* Inquiring As & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1.5 font-medium">
                      Inquiring As
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 input-editorial text-sm"
                    >
                      <option value="ACTOR">Performer / Actor</option>
                      <option value="CASTER">Casting Director / Producer</option>
                      <option value="AGENT">Talent Agency / Manager</option>
                      <option value="PRESS">Press / Editorial Inquiries</option>
                      <option value="SUPPORT">Account & Billing Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#8A8A90] uppercase tracking-wider block mb-1.5 font-medium">
                      Subject / Project Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Casting Inquiry: Neon Horizon"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 input-editorial text-sm"
                    />
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#8A8A90] uppercase tracking-wider font-medium">
                      Message Content *
                    </label>
                    <span className="text-[11px] text-[#8A8A90]">{formData.message.length} / 1200 chars</span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    maxLength={1200}
                    placeholder="Provide details about your project, audition sides, or representation inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-black/60 input-editorial text-sm resize-none"
                  />
                </div>

                {/* Urgent Checkbox */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <input
                    type="checkbox"
                    id="urgentNotice"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-[#F7FFB8] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="urgentNotice" className="text-xs text-[#D7D7DB] cursor-pointer">
                    <strong>Time-Sensitive Audition:</strong> Mark as high-priority casting notice (auditions within 48h)
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-8 rounded-full bg-[#F7FFB8] text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#ebf49e] transition-all shadow-xl hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Dispatching Transmission..." : "Send Transmission"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Global Hubs & Trust Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Trust Guarantee Callout */}
          <div className="rounded-3xl border border-emerald-500/25 bg-linear-to-b from-emerald-500/10 to-transparent p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe Casting Guarantee</span>
            </div>
            <p className="text-xs text-[#D7D7DB] leading-relaxed">
              ActorsGlobe adheres strictly to CSA, SAG-AFTRA, and Equity guidelines. Casting directors on this platform will never charge submission fees or require non-disclosed audition locations.
            </p>
          </div>

          {/* Regional Hub Cards */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-widest text-[#8A8A90] font-medium">Regional Production Hubs</h3>
            {offices.map((office, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0E0E10] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium text-white group-hover:text-[#F7FFB8] transition-colors">
                    {office.city}
                  </h4>
                  <span className="text-[11px] text-[#8A8A90] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-[#F7FFB8]" />
                    {office.timezone}
                  </span>
                </div>

                <div className="text-xs text-[#8A8A90] flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/60" />
                  <span>{office.address}</span>
                </div>

                <div className="text-xs text-[#D7D7DB] flex items-center gap-1.5 pt-1">
                  <Mail className="w-3.5 h-3.5 text-[#F7FFB8]" />
                  <a href={`mailto:${office.email}`} className="hover:underline">
                    {office.email}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Gateway Card */}
          <div className="p-6 rounded-3xl bg-linear-to-r from-purple-900/20 to-black border border-white/10 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-white">Have questions about self-tapes?</h4>
              <p className="text-xs text-[#8A8A90] mt-0.5">Explore our comprehensive support center.</p>
            </div>
            <Link
              to="/help"
              className="p-3 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
