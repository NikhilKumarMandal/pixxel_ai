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