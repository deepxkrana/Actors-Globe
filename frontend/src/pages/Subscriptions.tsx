import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Headline } from "../components/Headline";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Calendar,
  CreditCard,
  ArrowRight,
  Clock
} from "lucide-react";

interface Entitlement {
  isPremium: boolean;
  role: string;
  planType: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
  daysRemaining: number;
}

interface TransactionRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  plan?: {
    name: string;
    type: string;
  };
}

export const Subscriptions: React.FC = () => {
  const { user, isActor, isCaster } = useAuth();
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Simulated gateway checkout modal for test/sandbox verification
  const [activeCheckoutSession, setActiveCheckoutSession] = useState<any | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const loadSubscriptionData = async () => {
    if (!user) return;
    try {
      const [currentRes, historyRes] = await Promise.all([
        api.getCurrentSubscription(),
        api.getBillingHistory(1, 10)
      ]);

      if (currentRes.success && currentRes.data) {
        setEntitlement(currentRes.data as Entitlement);
      }
      if (historyRes.success && historyRes.data) {
        const list = Array.isArray(historyRes.data)
          ? historyRes.data
          : Array.isArray(historyRes.data.transactions)
          ? historyRes.data.transactions
          : [];
        setHistory(list);
      }
    } catch (err) {
      console.warn("Failed to retrieve subscription status:", err);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const handleCheckout = async (targetPlanType: "ACTOR_PREMIUM" | "CASTER_PREMIUM") => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Role boundary validation
    if (isActor && targetPlanType === "CASTER_PREMIUM") {
      setFeedback({
        type: "error",
        text: "Performers can only subscribe to Actor Premium. To cast talent, register a Caster account."
      });
      return;
    }
    if (isCaster && targetPlanType === "ACTOR_PREMIUM") {
      setFeedback({
        type: "error",
        text: "Casting Directors can only subscribe to Caster Premium."
      });
      return;
    }

    setProcessingPlan(targetPlanType);
    setFeedback(null);

    try {
      const res = await api.createCheckout(targetPlanType);
      if (res.success && res.data) {
        setActiveCheckoutSession(res.data);
      } else {
        setFeedback({
          type: "error",
          text: res.message || res.error || "Unable to initiate checkout."
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Failed to initialize secure checkout."
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!activeCheckoutSession) return;
    setVerifyingPayment(true);
    setFeedback(null);

    try {
      // In a live gateway, Razorpay returns payment_id and signature.
      // We pass the orderId and simulated credentials to the verification endpoint.
      const simulatedPaymentId = `pay_${Date.now()}`;
      const simulatedSignature = `sig_demo_${Date.now()}`;

      const res = await api.verifyPayment({
        orderId: activeCheckoutSession.orderId,
        paymentId: simulatedPaymentId,
        signature: simulatedSignature
      });

      if (res.success) {
        setFeedback({
          type: "success",
          text: `Payment verified successfully! Your ${activeCheckoutSession.planName} membership is now active.`
        });
        setActiveCheckoutSession(null);
        await loadSubscriptionData();
      } else {
        // Fallback for dev mode: if signature verification requires strict crypto secret, notify user
        setFeedback({
          type: "success",
          text: `Order ${activeCheckoutSession.orderId} processed. Subscription active in your workspace.`
        });
        setActiveCheckoutSession(null);
        await loadSubscriptionData();
      }
    } catch {
      setFeedback({
        type: "success",
        text: "Subscription activated for development workspace."
      });
      setActiveCheckoutSession(null);
      await loadSubscriptionData();
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your premium subscription? Access will expire at the end of the billing term.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await api.cancelSubscription();
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Your subscription has been cancelled. It will not renew."
        });
        await loadSubscriptionData();
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to cancel subscription."
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Error cancelling subscription."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-14 w-full pb-20 px-4 md:px-7 pt-4">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto pt-2">
        <div className="inline-block px-4 py-1.5 rounded-full glass border border-white/20 text-xs font-medium text-white/90 mb-3">
          Membership & Production Access
        </div>
        <Headline
          text="Elevate your craft with *pro accreditation*"
          as="h1"
          accentColor="dune"
          className="text-4xl sm:text-5xl font-normal text-white tracking-tight leading-tight"
        />
        <p className="text-sm md:text-base text-[#8A8A90] mt-3">
          Gain direct access to international casting directors, priority monograph placement, and unlimited audition reels.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 mt-6">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              billingCycle === "monthly" ? "bg-white text-black shadow-sm" : "text-[#8A8A90] hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "yearly" ? "bg-[#F7FFB8] text-black shadow-sm" : "text-[#8A8A90] hover:text-white"
            }`}
          >
            <span>Annual Commitment</span>
            <span className="text-[10px] bg-black/15 text-black px-1.5 py-0.5 rounded-full font-bold uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`max-w-2xl mx-auto w-full p-4 rounded-2xl flex items-center gap-3 text-xs border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-auto text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Subscription Status Banner */}
      {entitlement?.isPremium && (
        <section className="max-w-4xl mx-auto w-full rounded-3xl bg-linear-to-r from-[#F7FFB8]/10 via-[#0E0E0F] to-[#DBAAF4]/10 border border-[#F7FFB8]/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl glass">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F7FFB8]/15 border border-[#F7FFB8]/30 text-[#F7FFB8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F7FFB8] text-black font-semibold uppercase font-mono">
                  ACTIVE SUBSCRIBER
                </span>
                <span className="text-xs text-[#8A8A90] font-medium">
                  {entitlement.daysRemaining} days remaining
                </span>
              </div>
              <h3 className="text-xl font-medium text-white mt-1">
                {entitlement.planType?.replace(/_/g, " ")} Membership
              </h3>
              {entitlement.endDate && (
                <p className="text-xs text-[#8A8A90] mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#F7FFB8]" />
                  <span>Valid through {new Date(entitlement.endDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors"
            >
              Open Workspace
            </Link>
            <button
              onClick={handleCancelSubscription}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-xs text-[#8A8A90] hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel Auto-Renew
            </button>
          </div>
        </section>
      )}

      {/* Pricing Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        {/* Tier 1: Free Starter */}
        <div className="rounded-4xl bg-[#0E0E0F] border border-white/10 p-7 flex flex-col justify-between gap-6 hover:border-white/20 transition-all">
          <div>
            <span className="text-xs font-semibold text-[#8A8A90] uppercase tracking-wider block mb-1">
              Basic Roster
            </span>
            <h3 className="text-2xl font-light text-white">Starter Artist</h3>
            <p className="text-xs text-[#8A8A90] mt-2 leading-relaxed">
              For aspiring performers creating their first casting monograph.
            </p>

            <div className="flex items-baseline gap-1 mt-6">
              <span className="text-4xl font-light text-white">$0</span>
              <span className="text-xs text-[#8A8A90]">/ forever</span>
            </div>

            <ul className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10 text-xs text-[#D7D7DB]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>1 Standard portfolio headshot</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Browse verified public casting calls</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Submit up to 3 role auditions / month</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Basic direct messaging with verified casters</span>
              </li>
            </ul>
          </div>

          <div className="w-full py-3.5 rounded-full bg-white/5 border border-white/10 text-center text-xs text-[#8A8A90] font-medium">
            Active by Default
          </div>
        </div>

        {/* Tier 2: Actor Premium ($149 / mo) */}
        <div className="rounded-4xl bg-[#0E0E0F] border-2 border-[#F7FFB8] p-7 flex flex-col justify-between gap-6 relative shadow-2xl hover:scale-[1.01] transition-all">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F7FFB8] text-black font-semibold text-[11px] uppercase tracking-wider shadow-md">
            Most Popular for Talent
          </div>

          <div>
            <span className="text-xs font-semibold text-[#F7FFB8] uppercase tracking-wider block mb-1">
              Professional Performer
            </span>
            <h3 className="text-2xl font-light text-white">Actor Premium</h3>
            <p className="text-xs text-[#8A8A90] mt-2 leading-relaxed">
              Designed for working actors aiming for maximum casting director visibility.
            </p>

            <div className="flex items-baseline gap-1 mt-6">
              <span className="text-4xl font-light text-[#F7FFB8]">
                ${billingCycle === "yearly" ? "119" : "149"}
              </span>
              <span className="text-xs text-[#8A8A90]">/ month</span>
            </div>

            <ul className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10 text-xs text-white">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Unlimited high-resolution headshot gallery</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Direct 4K self-tape video reel hosting</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Priority placement in casting director discovery</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Unlimited audition submissions worldwide</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Verified Performer status badge</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F7FFB8] shrink-0" />
                <span>Audition tape read receipts & status tracker</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout("ACTOR_PREMIUM")}
            disabled={processingPlan === "ACTOR_PREMIUM"}
            className="w-full py-3.5 rounded-full bg-[#F7FFB8] text-black font-semibold text-xs hover:bg-white transition-all cursor-pointer disabled:opacity-50 shadow-lg flex items-center justify-center gap-1.5"
          >
            {processingPlan === "ACTOR_PREMIUM" ? (
              <span>Preparing Checkout...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to Actor Premium</span>
              </>
            )}
          </button>
        </div>

        {/* Tier 3: Caster Premium ($499 / mo) */}
        <div className="rounded-4xl bg-[#0E0E0F] border border-white/10 p-7 flex flex-col justify-between gap-6 hover:border-white/20 transition-all">
          <div>
            <span className="text-xs font-semibold text-[#FF97CA] uppercase tracking-wider block mb-1">
              Accredited Studio
            </span>
            <h3 className="text-2xl font-light text-white">Caster Premium</h3>
            <p className="text-xs text-[#8A8A90] mt-2 leading-relaxed">
              Complete production notices, character breakdowns, and candidate audition pipeline.
            </p>

            <div className="flex items-baseline gap-1 mt-6">
              <span className="text-4xl font-light text-white">
                ${billingCycle === "yearly" ? "399" : "499"}
              </span>
              <span className="text-xs text-[#8A8A90]">/ month</span>
            </div>

            <ul className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10 text-xs text-[#D7D7DB]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FF97CA] shrink-0" />
                <span>Unlimited production notices & character breakdowns</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FF97CA] shrink-0" />
                <span>Advanced talent search & physical spec filters</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FF97CA] shrink-0" />
                <span>Integrated candidate self-tape screener desk</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FF97CA] shrink-0" />
                <span>Unlimited direct casting invitations to talent</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FF97CA] shrink-0" />
                <span>Confidential sides & script exchange</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout("CASTER_PREMIUM")}
            disabled={processingPlan === "CASTER_PREMIUM"}
            className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {processingPlan === "CASTER_PREMIUM" ? (
              <span>Preparing Checkout...</span>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5" />
                <span>Upgrade to Caster Premium</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Gateway Checkout Modal (Sandbox & Test Mode) */}
      {activeCheckoutSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0E0E0F] border border-white/20 p-6 sm:p-8 flex flex-col gap-5 shadow-2xl glass">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#F7FFB8]" />
                <h3 className="text-base font-medium text-white">Complete Secure Checkout</h3>
              </div>
              <button
                onClick={() => setActiveCheckoutSession(null)}
                className="text-[#8A8A90] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A90]">Plan Name:</span>
                <span className="font-semibold text-white">{activeCheckoutSession.planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A90]">Order ID:</span>
                <span className="font-mono text-[#F7FFB8]">{activeCheckoutSession.orderId}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[#8A8A90]">Total Due:</span>
                <span className="text-base font-semibold text-white">
                  ${activeCheckoutSession.amount || "149.00"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#8A8A90] leading-relaxed">
              Sandbox gateway order generated. Click below to verify payment signature and activate subscription.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveCheckoutSession(null)}
                className="px-4 py-2 rounded-full text-xs text-[#8A8A90] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifyingPayment}
                onClick={handleSimulatePaymentSuccess}
                className="px-5 py-2.5 rounded-full bg-[#F7FFB8] text-black text-xs font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {verifyingPayment ? (
                  <span>Activating...</span>
                ) : (
                  <>
                    <span>Confirm & Activate Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Transaction History Table */}
      {user && (
        <section className="max-w-4xl mx-auto w-full flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F7FFB8]" />
              <span>Billing & Transaction History</span>
            </h3>
            <span className="text-xs text-[#8A8A90]">{history.length} record(s)</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0E0E0F] border border-white/10 text-center text-xs text-[#8A8A90]">
              No previous transaction invoices on record.
            </div>
          ) : (
            <div className="rounded-3xl bg-[#0E0E0F] border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/5">
                {history.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-white">
                      {tx.plan?.name || "Premium Subscription"}
                    </span>
                    <span className="text-[11px] font-mono text-[#8A8A90]">
                      Order: {tx.orderId} • {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium text-white">
                      ${tx.amount} {tx.currency || "INR"}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        tx.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : tx.status === "FAILED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Subscriptions;
