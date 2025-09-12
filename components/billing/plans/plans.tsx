/* eslint-disable @typescript-eslint/prefer-optional-chain -- allow */
import { type Subscription } from "@lemonsqueezy/lemonsqueezy.js"
// adjust path to prisma client
import { InfoMessage, NoPlans, Plan } from "./plan"
import prisma from "@/lib/prisma"
import { getUserSubscriptions, syncPlans } from "@/app/action/actions"

export async function Plans({
    isChangingPlans = false,
}: {
    isChangingPlans?: boolean
}) {
    // Fetch all plans from DB
    let allPlans = await prisma.plan.findMany()

    const userSubscriptions = await getUserSubscriptions()

    // Do not show plans if the user already has a valid subscription.
    if (userSubscriptions?.length > 0) {
        const hasValidSubscription = userSubscriptions.some((subscription) => {
            const status =
                subscription.status as Subscription["data"]["attributes"]["status"]

            return (
                status !== "cancelled" &&
                status !== "expired" &&
                status !== "unpaid"
            )
        })

        if (hasValidSubscription && !isChangingPlans) {
            return null
        }
    }

    // If there are no plans in the database, sync them from Lemon Squeezy.
    if (!allPlans.length) {
        allPlans = await syncPlans()
    }

    if (!allPlans.length) {
        return <NoPlans />
    }

    const sortedPlans = allPlans.sort((a, b) => {
        if (
            a.sort === undefined ||
            a.sort === null ||
            b.sort === undefined ||
            b.sort === null
        ) {
            return 0
        }

        return a.sort - b.sort
    })

    return (
        <div>
            <h2 className='flex items-center after:ml-5 after:h-px after:grow after:bg-surface-100 after:content-[""]'>
                Plans
            </h2>

            <div className="mb-5 mt-3 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                {sortedPlans.map((plan, index) => (
                    <Plan key={`plan-${index}`} plan={plan} />
                ))}
            </div>

            <InfoMessage />
        </div>
    )
}
