"use server"

import { syncPlans } from "@/app/action/actions"
import prisma from "@/lib/prisma"
import { SignupButton } from "./signup-button"
import { NewPlan } from "@/types/plan"


export async function Plans() {
    let allPlans: NewPlan[] = await prisma.plan.findMany()

    if (!allPlans.length) {
        allPlans = await syncPlans() as import('@/types/plan').NewPlan[]
    }
    if (!allPlans.length) {
        return <p>No plans available.</p>
    }

    return (
        <div>
            <h2>Plans</h2>
            <div className="mb-5 mt-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                {allPlans.map((plan, index) => (
                    <div key={`plan-${index}`} className="border rounded p-4">
                        <h3>{plan.name}</h3>
                        <p>{plan.description}</p>
                        <p>{plan.price}</p>
                        <SignupButton plan={plan} />
                    </div>
                ))}
            </div>
        </div>
    )
}
