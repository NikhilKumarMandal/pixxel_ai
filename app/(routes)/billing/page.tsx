/* src/app/dashboard/billing/page.tsx */

import { Suspense } from 'react'
import { Plans } from './plans/plans'

export const dynamic = 'force-dynamic'

export default function BillingPage() {
  return (
    <div>
      <Suspense fallback={
        <div className="flex h-[calc(100vh-34px)] w-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-400 border-solid"></div>
        </div>
      }>
        <Plans />
      </Suspense>
    </div>
  )
}