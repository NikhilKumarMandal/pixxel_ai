/* src/app/dashboard/billing/page.tsx */

import { Suspense } from 'react'
import { Plans } from './plans/plans'
import { SignupButton } from './plans/signup-button'



export const dynamic = 'force-dynamic'

export default function BillingPage() {
    return (
        <div>
            <Suspense fallback={<p>Loading plans...</p>}>
                <Plans />
            </Suspense>
        </div>
    )
}
