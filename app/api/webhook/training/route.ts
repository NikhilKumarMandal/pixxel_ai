import { NextResponse } from "next/server";
import Replicate from "replicate";
import crypto from "crypto";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { EmailTemplate } from "@/components/email-template";
import { imagekit } from "@/lib/config";


const resend = new Resend(process.env.RESEND_API_KEY);

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const url = new URL(req.url);
        const userId = url.searchParams.get("userId") ?? "";
        const modelName = url.searchParams.get("modelName") ?? "";
        const fileName = url.searchParams.get("fileName") ?? "";
        const filePath = url.searchParams.get("filePath") ?? "";

        // Replicate webhook signature validation
        const id = req.headers.get("webhook-id") ?? "";
        const timestamp = req.headers.get("webhook-timestamp") ?? "";
        const webhookSignature = req.headers.get("webhook-signature") ?? "";

        const signedContent = `${id}.${timestamp}.${JSON.stringify(body)}`;
        const secret = await replicate.webhooks.default.secret.get();
        const secretBytes = Buffer.from(secret.key.split("_")[1], "base64");
        const signature = crypto
            .createHmac("sha256", secretBytes)
            .update(signedContent)
            .digest("base64");

        const expectedSignatures = (webhookSignature ?? "")
            .split(" ")
            .map(sig => sig.split(",")[1])
            .filter(Boolean);

        const isValid = expectedSignatures.includes(signature);

        if (!isValid) return new NextResponse("Invalid signature", { status: 401 });

        // Fetch user from Prisma
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) return new NextResponse("User not found!", { status: 404 });

        const userEmail = user.email;
        const userName = user.name ?? "";

        // Update model training status in Prisma
        if (body.status === "succeeded") {
            await prisma.$transaction(async (prisma) => {
                await prisma.model.updateMany({
                    where: {
                        userId,
                        modelName,
                    },
                    data: {
                        trainingSatus: body.status,
                        trainingTime: body.metrics?.total_time ?? null,
                        version: body.output?.version?.split(":")[1] ?? null,
                    },
                });

                await resend.emails.send({
                    from: "Pixxel AI <onboarding@resend.dev>",
                    to: [userEmail],
                    subject: "Model Training Completed",
                    react: EmailTemplate({
                        userName,
                        message: "Your model training has been completed!",
                    }),
                });
            });
           
        } else {
            await prisma.model.updateMany({
                where: { userId, modelName },
                data: { trainingSatus: body.status },
            });

            await resend.emails.send({
                from: "Pixxel AI <onboarding@resend.dev>",
                to: [userEmail],
                subject: `Model Training ${body.status}`,
                react: EmailTemplate({
                    userName,
                    message: `Your model training has been ${body.status}!`,
                }),
            });
        }

        // Delete file from ImageKit
        try {
            await imagekit.deleteFile(filePath);
        } catch (err) {
            console.warn("Failed to delete file from ImageKit:", err);
        }

        return new NextResponse("OK", { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
