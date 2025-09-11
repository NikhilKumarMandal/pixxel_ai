'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Loading } from '@lemonsqueezy/wedges'
import { toast } from 'sonner'
import { getCheckoutURL } from '@/app/action/actions'

export type NewPlan = {
    id: string
    name: string
    description: string | null
    price: string
    interval: string | null
    intervalCount: number | null
    isUsageBased: boolean
    productId: number
    productName: string
    variantId: number
    trialInterval: string | null
    trialIntervalCount: number | null
    sort: number
}

export function SignupButton(props: { plan: NewPlan; currentPlan?: NewPlan }) {
    const { plan, currentPlan } = props
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isCurrent = plan.id === currentPlan?.id
    const label = isCurrent ? 'Your plan' : 'Sign up'

    const handleSignup = async () => {
        if (isCurrent) return

        setLoading(true)
        try {
            const checkoutUrl = await getCheckoutURL(plan.variantId, false) // embed=false

            if (!checkoutUrl) {
                toast('Error creating a checkout.', { description: 'Checkout failed.' })
                return
            }

            router.push(checkoutUrl)
        } catch (err) {
            console.error(err)
            toast('Error creating a checkout.', { description: 'Check console for details.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button before={loading ? <Loading /> : undefined} disabled={loading || isCurrent} onClick={handleSignup}>
            {label}
        </Button>
    )
}
