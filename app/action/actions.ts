/* src/app/actions.ts */
'use server'

import { configureLemonSqueezy } from '@/config/lemonsqueezy'
import { currentUser } from '@clerk/nextjs/server'
import {
    createCheckout,
    getProduct,
    listPrices,
    listProducts,
    Variant,
} from '@lemonsqueezy/lemonsqueezy.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function syncPlans() {
    configureLemonSqueezy()

    const products = await listProducts({
        filter: { storeId: process.env.LEMON_SQUEEZY_STORE_ID },
        include: ['variants'],
    })



    const allVariants = products.data?.included as Variant['data'][] | undefined
    if (!allVariants) return []

    console.log("✨ All Variants:", allVariants.map(v => ({
        id: v.id,
        name: v.attributes.name,
        status: v.attributes.status,
        is_subscription: v.attributes.is_subscription,
    })))

    for (const v of allVariants) {
        const variant = v.attributes

        // ✅ Skip only draft variants (ignore "pending" unless you want them too)
        if (variant.status === 'draft') continue

        // Get Product info
        const productRes = await getProduct(variant.product_id)
        const productName = productRes.data?.data.attributes.name ?? ''
        const productDescription = productRes.data?.data.attributes.description ?? ''

        // Ensure Product exists
        const product = await prisma.product.upsert({
            where: { productId: variant.product_id },
            update: { name: productName, description: productDescription },
            create: {
                productId: variant.product_id,
                name: productName,
                description: productDescription,
            },
        })

        // ✅ Price info
        const variantPriceObject = await listPrices({ filter: { variantId: v.id } })
        const currentPriceObj = variantPriceObject.data?.data.at(0)

        const isUsageBased = currentPriceObj?.attributes.usage_aggregation !== null
        const interval = currentPriceObj?.attributes.renewal_interval_unit ?? null
        const intervalCount = currentPriceObj?.attributes.renewal_interval_quantity ?? null
        const trialInterval = currentPriceObj?.attributes.trial_interval_unit ?? null
        const trialIntervalCount = currentPriceObj?.attributes.trial_interval_quantity ?? null

        const price = isUsageBased
            ? currentPriceObj?.attributes.unit_price_decimal
            : currentPriceObj?.attributes.unit_price

        const priceString = price ? price.toString() : '0'

        // ✅ Store all variants (subscription or one-time)
        await prisma.variant.upsert({
            where: { variantId: parseInt(v.id) },
            update: {
                name: variant.name || productName,
                description: variant.description || productDescription,
                price: priceString,
                interval,
                intervalCount,
                isUsageBased,
                trialInterval,
                trialIntervalCount,
                sort: variant.sort,
                productId: product.id,
            },
            create: {
                variantId: parseInt(v.id),
                name: variant.name || productName,
                description: variant.description || productDescription,
                price: priceString,
                interval,
                intervalCount,
                isUsageBased,
                trialInterval,
                trialIntervalCount,
                sort: variant.sort,
                productId: product.id,
            },
        })
    }

    // ✅ Return enriched variants with product info
    const variantsWithProduct = await prisma.variant.findMany({
        include: { product: true },
    })

    console.log(variantsWithProduct);


    return variantsWithProduct.map((variant) => ({
        ...variant,
        productName: variant.product.name,
    }))
}




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
        process.env.LEMON_SQUEEZY_STORE_ID!,
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
                redirectUrl: `https://www.pixxelai.live/generator`,
                receiptButtonText: 'Go to Dashboard',
                receiptThankYouNote: 'Thank you for signing up to Lemon Stand!',
            },
        }
    );

    console.log(checkout);
    return checkout.data?.data?.attributes?.url
}