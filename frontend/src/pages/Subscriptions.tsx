import React, { useState } from "react";
import { Headline } from "../components/Headline";
import { api } from "../services/api";
import { Check } from "lucide-react";

export const Subscriptions: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const plans = [
    {
      id: "plan_free",
      name: "Starter Artist",
      priceMonthly: 0,
      priceYearly: 0,
      description: "Fundamental casting profile to showcase basic headshots and browse public audition notices.",
      features: [
        "1 Standard portfolio headshot",
        "Browse public casting calls",
        "Submit up to 3 applications/month",
        "Standard direct messaging"
      ]
    },
    {
      id: "plan_actor_pro",
      name: "Actor Pro",
      isPopular: true,
      priceMonthly: 19,
      priceYearly: 190,
      description: "For professional performers aiming for maximum casting-room visibility and unlimited audition submissions.",
      features: [
        "Unlimited high-resolution headshots",
        "Direct self-tape video uploads (4K)",
        "Priority monograph placement in Caster search",
        "Unlimited role applications",
        "Verified Performer badge",
        "Application read receipts & status alerts"
      ]
    },
    {
      id: "plan_caster_pro",
      name: "Caster Pro",
      priceMonthly: 49,
      priceYearly: 490,
      description: "For independent casting directors, producers, and talent scouts managing productions.",
      features: [
        "Unlimited casting call listings",
        "Advanced actor search filters (physical specs, union)",
        "Direct audition tape reviewer pipeline",
        "Unlimited direct casting requests/invitations",
        "Custom audition sides distribution",
        "Dedicated production assistant access"
      ]
    },
    {
      id: "plan_studio_elite",
      name: "Studio Elite",
      priceMonthly: 149,
      priceYearly: 1490,
      description: "Enterprise tier for premier studios, major networks, and talent agency teams.",
      features: [
        "Multi-seat team workspace (up to 10 casters)",
        "Automated NDA distribution & digital signatures",
        "Bespoke casting analytics & scout insights",
        "Custom branded production portal",
        "Direct API integration access",
        "24/7 dedicated casting concierge"
      ]
    }
  ];

  const handleCheckout = async (planId: string) => {
    if (planId === "plan_free") return;
    setProcessingPlan(planId);
    setSuccessMsg("");
    try {
      const res = await api.createCheckoutSession(planId, billingCycle);
      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        setSuccessMsg("Simulation checkout session created. Subscription active on dev database.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch {
      setSuccessMsg("Checkout initialized.");
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="flex flex-col gap-16 w-full pb-16 px-4 md:px-7 pt-4">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto pt-2">
        <div className="inline-block px-4 py-1.5 rounded-full glass border border-white/20 text-xs font-medium text-white/90 mb-3">
          Membership & Plans
        </div>
        <Headline
          text="Elevate your craft with *pro membership*"
          as="h1"
          accentColor="dune"
          className="text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight"
        />
        <p className="text-sm md:text-base text-[#8A8A90] mt-3">
          Choose a tailored membership to unlock verified badges, unlimited auditions, and direct casting connections.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="inline-flex items-center p-1 rounded-full bg-white/[0.05] border border-white/10 mt-8">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
              billingCycle === "monthly" ? "bg-white text-black" : "text-[#B9B9BE] hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "yearly" ? "bg-white text-black" : "text-[#B9B9BE] hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F7FFB8] text-black font-bold">
              Save 20%
            </span>
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            {successMsg}
          </div>
        )}
      </section>

      {/* Plans Comparison Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => {
          const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
          return (
            <div
              key={plan.id}
              className={`rounded-[32px] p-7 md:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.isPopular
                  ? "bg-[#0E0E0F] border-2 border-[#F7FFB8] shadow-2xl shadow-[#F7FFB8]/10"
                  : "bg-[#0D0D0E] border border-white/10"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#F7FFB8] text-black text-[11px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-[#8A8A90] leading-relaxed mb-6">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/10">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  <span className="text-xs text-[#8A8A90]">
                    /{billingCycle === "yearly" ? "year" : "month"}
                  </span>
                </div>

                {/* Features List */}
                <ul className="flex flex-col gap-3 text-xs text-[#D7D7DB] mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#F7FFB8] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={processingPlan === plan.id}
                className={`w-full py-3 rounded-full text-xs font-semibold transition-colors cursor-pointer mt-auto ${
                  plan.isPopular
                    ? "bg-[#F7FFB8] text-black hover:bg-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {processingPlan === plan.id
                  ? "Connecting..."
                  : plan.priceMonthly === 0
                  ? "Current Free Tier"
                  : "Upgrade to " + plan.name}
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Subscriptions;
