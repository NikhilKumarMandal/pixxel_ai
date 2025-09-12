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


export type NewSubscription = {
    id: number;
    lemonSqueezyId: string;
    orderId: number;
    name: string;
    email: string;
    status: string;
    statusFormatted: string;
    renewsAt: string | null;
    endsAt: string | null;
    trialEndsAt: string | null;
    isPaused?: boolean;
    price: number;
    planId: string;
};
