/* src/components/dashboard/billing/plans/plans.tsx */

import { syncPlans } from "@/app/action/actions"

import { Variant, Product } from "@prisma/client"
import { Plan } from "./plan"
import prisma from "@/lib/prisma"

// Extend Variant with Product so we can access product.name in Plan
export type NewPlan = Variant & { product: Product }

export async function Plans() {
    // Get all plans with product info
    let allPlans: NewPlan[] = await prisma.variant.findMany({
        include: { product: true },
    });

    console.log("all plans", allPlans);


    // If no plans in DB, sync from Lemon Squeezy
    if (!allPlans.length) {
        await syncPlans()
        allPlans = await prisma.variant.findMany({
            include: { product: true },
        })
        console.log(allPlans, "allPlans");

    }

    // Filter plans: include only those with "gold", "silver", or "platinum" in name
    const filteredPlans = allPlans.filter(plan =>
        /gold|silver|platinum/i.test(plan.name)
    );

    if (!filteredPlans.length) {
        return <p>No plans available.</p>
    }

    return (
        <div className="max-w-6xl mx-auto px-8 sm:px-16 py-10 h-[calc(100vh-33px)]">
            <div className="mb-5 mt-3 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                {filteredPlans.map((plan, index) => (
                    <Plan key={`plan-${index}`} serverPlan={plan} />
                ))}
            </div>
        </div>
    )
}