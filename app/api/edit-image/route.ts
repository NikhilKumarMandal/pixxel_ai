import { NextRequest, NextResponse } from "next/server"
import { imagekit } from "@/lib/config" 
import { fal } from "@fal-ai/client"
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


fal.config({
    credentials: process.env.FAL_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

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

        const body = await req.json()
        const { prompt, size, width, height, images } = body

        // 1. Determine final width/height based on size
        let finalWidth = 512
        let finalHeight = 512

        switch (size) {
            case "square":
                finalWidth = 512
                finalHeight = 512
                break
            case "portrait":
                finalWidth = 512
                finalHeight = 768 // 3:4
                break
            case "landscape":
                finalWidth = 1024
                finalHeight = 576 // 16:9
                break
            case "custom":
                finalWidth = width || 512
                finalHeight = height || 512
                break
            default: // "default"
                finalWidth = 512
                finalHeight = 512
        }

        // 2. Upload images to ImageKit
        const uploadedUrls: string[] = []
        for (const img of images) {

            const upload = await imagekit.upload({
                file: img, // base64 string
                fileName: `edit-${Date.now()}.png`,
            })

            console.log("upload",upload);
            
            uploadedUrls.push(upload.url)
        }

        // 3. Call fal.ai
        const result = await fal.subscribe("fal-ai/bytedance/seedream/v4/edit", {
            input: {
                prompt,
                image_urls: uploadedUrls,
                width: finalWidth,
                height: finalHeight,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log)
                }
            },
        })

        console.log("res",result);
        

        const generatedImageUrl = result.data?.images?.[0]?.url;
        if (!generatedImageUrl) {
            return NextResponse.json(
                { error: "No image generated" },
                { status: 500 }
            )
        }

        const response = await fetch(generatedImageUrl)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 3. Upload to ImageKit
        const upload = await imagekit.upload({
            file: buffer, // file as buffer
            fileName: `fal-image-${Date.now()}.png`,
        })

        console.log("generatedImageUrl", generatedImageUrl);

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
        

        return NextResponse.json({
            success: true,
            generatedUrl: generatedImageUrl,
            requestId: result.requestId,
            width: finalWidth,
            height: finalHeight,
        })
    } catch (error: any) {
        console.error("API Error:", error.message)
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        )
    }
}

