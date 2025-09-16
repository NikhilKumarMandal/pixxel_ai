import { NextRequest, NextResponse } from "next/server"
import { fal } from "@fal-ai/client"
import { imagekit } from "@/lib/config"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

fal.config({
    credentials: process.env.FAL_KEY!,
})

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        const body = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        });

        if (!user || user.credits <= 0) {
            return NextResponse.json(
                { error: "Insufficient credits" },
                { status: 403 }
            );
        }
        const { prompt, aspectRatio } = body

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            )
        }

        // 1. Generate image using fal.ai
        const result = await fal.subscribe("fal-ai/imagen4/preview", {
            input: {
                prompt,
                // aspect_ratio: aspectRatio || "9:16",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.forEach((log) => console.log(log.message))
                }
            },
        })

        const imageUrl = result.data?.images?.[0]?.url
        if (!imageUrl) {
            return NextResponse.json(
                { error: "No image generated" },
                { status: 500 }
            )
        }

        // 2. Fetch the generated image as a buffer
        const response = await fetch(imageUrl)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 3. Upload to ImageKit
        const upload = await imagekit.upload({
            file: buffer, // file as buffer
            fileName: `fal-image-${Date.now()}.png`,
        })

        await prisma.image.create({
            data: {
                url: upload.url,
                fileId: upload.fileId,
                userId: userId!
            }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 1 } },
        });

        return NextResponse.json(
            {
                originalImage: imageUrl,
                uploadedImage: upload.url,
                requestId: result.requestId,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("API Error:", error.message)
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        )
    }
}
