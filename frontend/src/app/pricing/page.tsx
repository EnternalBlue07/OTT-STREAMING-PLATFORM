"use client";

import { Check, Crown, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";

const PLANS = [
  {
    id: "free",
    name: "Free",
    priceMonthly: "₹0",
    priceYearly: "₹0",
    accent: "#8a8a8a",
    features: [
      { label: "500+ titles", included: true },
      { label: "480p max quality", included: true },
      { label: "1 screen at a time", included: true },
      { label: "Ads supported", included: true },
      { label: "2 downloads/month", included: true },
      { label: "Join Watch Parties", included: true },
      { label: "4K HDR", included: false },
      { label: "No ads", included: false },
      { label: "AI Assistant", included: false },
      { label: "Multiple profiles", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: "₹299",
    priceYearly: "₹2,499",
    accent: "#E50914",
    popular: true,
    features: [
      { label: "10,000+ titles", included: true },
      { label: "4K HDR + Dolby Vision", included: true },
      { label: "4 screens at a time", included: true },
      { label: "No ads ever", included: true },
      { label: "25 downloads/month", included: true },
      { label: "AI Cinema Assistant", included: true },
      { label: "VoiceDub (5/month)", included: true },
      { label: "Create Watch Parties", included: true },
      { label: "Smart Skip (Intro/Recap)", included: true },
      { label: "Multiple profiles", included: false },
    ],
  },
  {
    id: "family",
    name: "Family",
    priceMonthly: "₹499",
    priceYearly: "₹3,999",
    accent: "#564DFF",
    features: [
      { label: "Everything in Premium", included: true },
      { label: "6 screens at a time", included: true },
      { label: "6 individual profiles", included: true },
      { label: "Kids mode + parental controls", included: true },
      { label: "50 downloads/month", included: true },
      { label: "Unlimited VoiceDub", included: true },
      { label: "Priority customer support", included: true },
      { label: "Early access to originals", included: true },
      { label: "Offline Mode (full catalog)", included: true },
      { label: "Family sharing dashboard", included: true },
    ],
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="font-display text-display-lg font-bold">Your Entertainment, Your Price</h1>
        <p className="mt-3 text-foreground/60">No hidden fees. Cancel anytime. HD/4K included in paid plans.</p>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border glass p-1.5">
          <button
            onClick={() => setYearly(false)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${!yearly ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${yearly ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
          >
            Yearly <span className="ml-1 rounded bg-success/20 px-1.5 py-0.5 text-[10px] font-bold text-success">Save 30%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-3xl border p-6 transition-shadow ${
              plan.popular ? "border-primary shadow-glow-primary" : "border-border glass"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                <Crown className="h-3 w-3" /> Most Popular
              </span>
            )}
            <div className="mb-4">
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <div className="mt-2">
                <span className="font-display text-4xl font-bold" style={{ color: plan.accent }}>
                  {yearly ? plan.priceYearly : plan.priceMonthly}
                </span>
                <span className="text-sm text-foreground/50">/{yearly ? "year" : "month"}</span>
              </div>
            </div>

            <ul className="flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f.label} className="flex items-start gap-2 text-sm">
                  {f.included ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-foreground/30" />
                  )}
                  <span className={f.included ? "text-foreground/85" : "text-foreground/40"}>{f.label}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-6 w-full gap-2"
              variant={plan.popular ? "primary" : "glass"}
              style={plan.popular ? {} : { borderColor: plan.accent }}
            >
              {plan.id === "free" ? (
                "Start Free"
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Get {plan.name}
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-foreground/50">
        <span>✓ Cancel anytime</span>
        <span>✓ No credit card for free tier</span>
        <span>✓ 7-day money-back guarantee</span>
        <span>✓ Secure payment via Razorpay + Stripe</span>
      </div>
    </div>
  );
}
