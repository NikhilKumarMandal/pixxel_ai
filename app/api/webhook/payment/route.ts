import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
        const hmac = crypto.createHmac("sha256", secret);
        const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "hex");
        const signature = Buffer.from(req.headers.get("x-signature") || "", "hex");

        if (!crypto.timingSafeEqual(digest, signature)) {
            return Response.json({ message: "Invalid signature" }, { status: 400 });
        }

        const body = JSON.parse(rawBody);
        const eventType = req.headers.get("x-event-name");

        console.log("Webhook event:", eventType, body);

        if (eventType === "order_created") {
            const userId = body.meta?.custom_data?.user_id;
            const isSuccessful = body.data?.attributes?.status === "paid";

            if (userId && isSuccessful) {
                const plan = body.data.attributes.first_order_item.variant_name;

                let credits = 0;
                if (plan === "Silver") credits = 30;
                if (plan === "Gold") credits = 180;
                if (plan === "Platinum") credits = 280;

                if (credits > 0) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            credits: { increment: credits },
                        },
                    });
                }
            }
        }

        return Response.json({ message: "Webhook received" });
    } catch (err) {
        console.error("Webhook error:", err);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}