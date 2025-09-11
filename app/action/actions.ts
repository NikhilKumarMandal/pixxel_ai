/* src/app/actions.ts */
'use server'

import { configureLemonSqueezy } from '@/config/lemonsqueezy'
import prisma from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { createCheckout, getPrice, getProduct, listPrices, listProducts } from '@lemonsqueezy/lemonsqueezy.js'

export type NewWebhookEvent = {
    id: string
    eventName: string
    processed: boolean
    body: any
    processingError: string
    createdAt: Date
}

export type Subscription = {
    id: string
    lemonSqueezyId: string
    orderId: number
    name: string
    email: string
    status: string
    statusFormatted: string
    renewsAt?: string | null
    endsAt?: string | null
    trialEndsAt?: string | null
    price: string
    isUsageBased: boolean
    isPaused: boolean
    subscriptionItemId: number
    userId: string
    planId: string
};

// Input type for creating a new subscription
export type NewSubscription = Omit<Subscription, "id"> 

// Define the type for a new plan
export type NewPlan = {
    id?: string // Prisma UUID
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

// Local Variant type (simplified)
type Variant = {
    id: string
    attributes: {
        name: string
        description: string | null
        product_id: number
        status: string
        sort: number
    }
}

export async function syncPlans() {
    configureLemonSqueezy()

    // Fetch all plans from the DB
    const productVariants: NewPlan[] = await prisma.plan.findMany()

    async function _addVariant(variant: NewPlan) {
        console.log(`Syncing variant ${variant.name} with the database...`)

        // upsert returns the record including Prisma's id
        const record = await prisma.plan.upsert({
            where: { variantId: variant.variantId },
            update: { ...variant },
            create: { ...variant },
        })

        console.log(`${variant.name} synced with the database...`)
        productVariants.push(record) // ✅ record includes id
    }


    // Fetch products from Lemon Squeezy
    const products = await listProducts({
        filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
        include: ['variants'],
    })

    // ✅ Correct cast
    const allVariants = products.data?.included as Variant[] | undefined

    if (allVariants) {
        for (const v of allVariants) {
            const variant = v.attributes

            if (
                variant.status === 'draft' ||
                (allVariants.length !== 1 && variant.status === 'pending')
            ) {
                continue
            }

            // Product name
            const productName =
                (await getProduct(variant.product_id)).data?.data.attributes.name ?? ''

            // Price object
            const variantPriceObject = await listPrices({
                filter: { variantId: v.id },
            })

            const currentPriceObj = variantPriceObject.data?.data.at(0)
            const isUsageBased =
                currentPriceObj?.attributes.usage_aggregation !== null

            // ✅ force null instead of undefined
            const interval = currentPriceObj?.attributes.renewal_interval_unit ?? null
            const intervalCount =
                currentPriceObj?.attributes.renewal_interval_quantity ?? null
            const trialInterval =
                currentPriceObj?.attributes.trial_interval_unit ?? null
            const trialIntervalCount =
                currentPriceObj?.attributes.trial_interval_quantity ?? null

            const price = isUsageBased
                ? currentPriceObj?.attributes.unit_price_decimal
                : currentPriceObj?.attributes.unit_price

            const priceString = price !== null && price !== undefined ? price.toString() : ''

            const isSubscription =
                currentPriceObj?.attributes.category === 'subscription'

            if (!isSubscription) continue

            await _addVariant({
                name: variant.name,
                description: variant.description,
                price: priceString,
                interval: (interval as string | null),          // ✅ cast to match NewPlan
                intervalCount,
                isUsageBased,
                productId: variant.product_id,
                productName,
                variantId: parseInt(v.id),
                trialInterval: (trialInterval as string | null), // ✅ cast here too
                trialIntervalCount,
                sort: variant.sort,
            })

        }
    }

    return productVariants
};

export async function getCheckoutURL(variantId: number, embed = false) {
    configureLemonSqueezy()

    const user = await currentUser();

    if (!user) {
        throw new Error('User is not authenticated.')
    }

    const userData = await prisma.user.findUnique({
        where: {
            email: user?.primaryEmailAddress?.emailAddress
        }
    })

    const checkout = await createCheckout(
        process.env.LEMONSQUEEZY_STORE_ID!,
        variantId,
        {
            checkoutOptions: {
                embed,
                media: false,
                logo: !embed,
            },
            checkoutData: {
                email: user?.primaryEmailAddress?.emailAddress! ?? undefined,
                custom: {
                    user_id: userData?.id,
                },
            },
            productOptions: {
                enabledVariants: [variantId],
                redirectUrl: `https://www.creatorsai.live/dashboard`,
                receiptButtonText: 'Go to Dashboard',
                receiptThankYouNote: 'Thank you for signing up to Lemon Stand!',
            },
        }
    );

    console.log(checkout);
    return checkout.data?.data?.attributes?.url
};

export async function storeWebhookEvent(
    eventName: string,
    body: NewWebhookEvent["body"]
) {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set")
    }

    try {
        const event = await prisma.webhookEvent.create({
            data: {
                eventName,
                processed: false,
                body,
                processingError: "",
            },
        })
        return event
    } catch (err: any) {
        if (err.code === "P2002") {
            return null
        }
        throw err
    }
};

export async function processWebhookEvent(webhookEvent: NewWebhookEvent) {
    if (!process.env.WEBHOOK_URL) {
        throw new Error("Missing required WEBHOOK_URL env variable. Please, set it in your .env file.")
    }

    const eventBody = webhookEvent.body
    let processingError = ""

    try {
        // ✅ subscription-related events
        if (webhookEvent.eventName.startsWith("subscription_")) {
            const attributes = eventBody.data.attributes
            const variantId = attributes.variant_id as string

            // Find plan by variantId
            const plan = await prisma.plan.findUnique({
                where: { variantId: parseInt(variantId, 10) },
            })

            if (!plan) {
                throw new Error(`Plan with variantId ${variantId} not found.`)
            }

            // Get LemonSqueezy price info
            const priceId = attributes.first_subscription_item.price_id
            const priceData = await getPrice(priceId)
            if (priceData.error) {
                throw new Error(`Failed to get the price data for subscription ${eventBody.data.id}.`)
            }

            const isUsageBased = attributes.first_subscription_item.is_usage_based
            const price = isUsageBased
                ? priceData.data?.data.attributes.unit_price_decimal
                : priceData.data?.data.attributes.unit_price

            // Prepare subscription data
            const updateData = {
                lemonSqueezyId: eventBody.data.id,
                orderId: attributes.order_id as number,
                name: attributes.user_name as string,
                email: attributes.user_email as string,
                status: attributes.status as string,
                statusFormatted: attributes.status_formatted as string,
                renewsAt: attributes.renews_at as string | null,
                endsAt: attributes.ends_at as string | null,
                trialEndsAt: attributes.trial_ends_at as string | null,
                price: price?.toString() ?? "",
                isPaused: false,
                subscriptionItemId: parseInt(attributes.first_subscription_item.id, 10),
                isUsageBased: attributes.first_subscription_item.is_usage_based,
                userId: eventBody.meta.custom_data.user_id,
                planId: plan.id,
            }

            // ✅ Upsert subscription in Prisma
            const subscription = await prisma.subscription.upsert({
                where: { lemonSqueezyId: eventBody.data.id },
                update: updateData,
                create: updateData,
            })

            // ✅ Manage credits based on subscription status
            if (subscription.status === "active") {
                await prisma.user.update({
                    where: { id: subscription.userId },
                    data: { credits: { increment: 100 } }, // add 100 credits
                })
            }

            if (subscription.status === "expired" || subscription.status === "cancelled") {
                await prisma.user.update({
                    where: { id: subscription.userId },
                    data: { credits: { set: 0 } }, // reset credits to 0
                })
            }
        }

        // ✅ Mark webhook as processed
        await prisma.webhookEvent.update({
            where: { id: webhookEvent.id },
            data: {
                processed: true,
                processingError,
            },
        })
    } catch (err: any) {
        processingError = err.message

        // Update webhook with error
        await prisma.webhookEvent.update({
            where: { id: webhookEvent.id },
            data: {
                processed: false,
                processingError,
            },
        })

        console.error("Webhook processing failed:", err)
    }
};
