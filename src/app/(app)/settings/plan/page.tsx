"use client";

import { useProfile, useSubscription } from "@/lib/query/profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import {
  Check,
  Zap,
  CreditCard,
  Calendar,
  Package,
  Receipt,
  BarChart3,
  ImageUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

const FREE_FEATURES = [
  { text: "Maximum 25 inventory lots", icon: Package },
  { text: "Maximum 50 sales", icon: Receipt },
  { text: "No market value estimates", icon: Zap },
  { text: "No image uploads", icon: ImageUp },
  { text: "No CSV export", icon: FileSpreadsheet },
] as const;

const PRO_FEATURES = [
  { text: "Unlimited inventory", icon: Package },
  { text: "Unlimited sales", icon: Receipt },
  { text: "Market estimation enabled", icon: Zap },
  { text: "Image uploads enabled", icon: ImageUp },
  { text: "Reports enabled", icon: BarChart3 },
] as const;

const PRICE_MONTHLY = 29;
const PRICE_ANNUAL = 299;

export default function PlanPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: subscription, isLoading: subLoading } = useSubscription();

  const isPro = profile?.role === "pro" || profile?.role === "dealer";
  const renewalDate = subscription?.renewalDate ?? null;
  const isLoading = profileLoading || subLoading;

  async function handleCheckout(priceId: string) {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/settings/plan`,
          cancelUrl: `${window.location.origin}/settings/plan`,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleManageBilling() {
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ return_url: "/settings/plan" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not open billing");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const priceMonthlyId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
  const priceAnnualId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Plan & Billing</h1>
        <p className="text-sm text-muted-foreground">
          View your current plan and upgrade or manage billing.
        </p>
      </motion.div>

      {/* Current plan card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="p-6 border-border rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPro ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <p className="text-lg font-semibold">{isPro ? "Pro" : "Free"}</p>
              {isPro && renewalDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Renews {new Date(renewalDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isPro ? (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                className="gap-2"
              >
                Manage billing
              </Button>
            ) : (
              <Button
                onClick={() => priceMonthlyId && handleCheckout(priceMonthlyId)}
                disabled={!priceMonthlyId}
                className="gap-2"
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Upgrade message when free */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            Upgrade to Pro — Stop guessing. Start pricing with confidence.
          </p>
        </motion.div>
      )}

      {/* Plan comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-4">Choose a plan</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Free plan */}
          <Card
            className={`p-6 rounded-xl border-2 flex flex-col ${
              !isPro ? "border-primary/50 bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Free</h3>
              {!isPro && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Current plan
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold mb-1">$0</p>
            <p className="text-sm text-muted-foreground mb-4">Forever</p>
            <ul className="space-y-2 flex-1">
              {FREE_FEATURES.map(({ text, icon: Icon }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 shrink-0 opacity-60" />
                  {text}
                </li>
              ))}
            </ul>
            {!isPro && (
              <Button variant="outline" className="mt-4 w-full" disabled>
                Current plan
              </Button>
            )}
          </Card>

          {/* Pro plan */}
          <Card
            className={`p-6 rounded-xl border-2 flex flex-col ${
              isPro ? "border-primary/50 bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pro</h3>
              {isPro && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Current plan
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold mb-1">${PRICE_MONTHLY}/mo</p>
            <p className="text-sm text-muted-foreground mb-4">
              or ${PRICE_ANNUAL}/year (save ~14%)
            </p>
            <ul className="space-y-2 flex-1">
              {PRO_FEATURES.map(({ text, icon: Icon }) => (
                <li key={text} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 shrink-0 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              {isPro ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleManageBilling}
                >
                  Manage billing
                </Button>
              ) : (
                <>
                  {priceMonthlyId && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleCheckout(priceMonthlyId)}
                    >
                      Subscribe monthly — ${PRICE_MONTHLY}/mo
                    </Button>
                  )}
                  {priceAnnualId && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleCheckout(priceAnnualId)}
                    >
                      Subscribe annually — ${PRICE_ANNUAL}/yr
                    </Button>
                  )}
                  {!priceMonthlyId && !priceAnnualId && (
                    <p className="text-sm text-muted-foreground">
                      Stripe price IDs not configured. Set NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY (and optionally NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL) in .env.local.
                    </p>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Market values shown in the app are estimates or user-provided.
      </p>
    </div>
  );
}
