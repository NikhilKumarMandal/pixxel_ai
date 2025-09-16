import { NextRequest, NextResponse } from "next/server";
import { imagekit } from "@/lib/config";
import { fal } from "@fal-ai/client";
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

        // 🔹 Parse FormData instead of JSON
        const formData = await req.formData();
        const prompt = formData.get("prompt") as string;
        const size = formData.get("size") as string;
        const width = formData.get("width")
            ? Number(formData.get("width"))
            : undefined;
        const height = formData.get("height")
            ? Number(formData.get("height"))
            : undefined;

        const files = formData.getAll("images") as File[];

        // 1. Determine final width/height
        let finalWidth = 512;
        let finalHeight = 512;

        switch (size) {
            case "square":
                finalWidth = 512;
                finalHeight = 512;
                break;
            case "portrait":
                finalWidth = 512;
                finalHeight = 768; // 3:4
                break;
            case "landscape":
                finalWidth = 1024;
                finalHeight = 576; // 16:9
                break;
            case "custom":
                finalWidth = width || 512;
                finalHeight = height || 512;
                break;
            default: // "default"
                finalWidth = 512;
                finalHeight = 512;
        }

        // 2. Upload input images to ImageKit
        const uploadedUrls: string[] = [];
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const upload = await imagekit.upload({
                file: buffer, // file as buffer
                fileName: `edit-${Date.now()}.png`,
            });

            uploadedUrls.push(upload.url);
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
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        const generatedImageUrl = result.data?.images?.[0]?.url;
        if (!generatedImageUrl) {
            return NextResponse.json(
                { error: "No image generated" },
                { status: 500 }
            );
        }

        // 4. Download generated image & upload to ImageKit
        const response = await fetch(generatedImageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const upload = await imagekit.upload({
            file: buffer,
            fileName: `fal-image-${Date.now()}.png`,
        });

        // Save record in DB
        await prisma.image.create({
            data: {
                url: upload.url,
                fileId: upload.fileId,
                userId,
            },
        });

        // Deduct credits
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 2 } },
        });

        return NextResponse.json({
            success: true,
            generatedUrl: upload.url, // use ImageKit-hosted URL
            requestId: result.requestId,
        });
    } catch (error: any) {
        console.error("API Error:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
