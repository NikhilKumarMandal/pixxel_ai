import { Plans } from "@/components/billing/plans/plans";
import { Subscriptions } from "@/components/billing/subscription/subscriptions";
import { DashboardContent } from "@/components/content";
import { CardSkeleton } from "@/components/skeletons/card";
import { PlansSkeleton } from "@/components/skeletons/plans";
import { Suspense } from "react";


export const dynamic = "force-dynamic";

export default function BillingPage() {
  return (
    <DashboardContent
      title="Billing"
      subtitle="View and manage your billing information." 
    >
      <div>
        <Suspense fallback={<CardSkeleton className="h-[106px]" />}>
          <Subscriptions />
        </Suspense>

        <Suspense fallback={<PlansSkeleton />}>
          <Plans />
        </Suspense>
      </div>
    </DashboardContent>
  );
}