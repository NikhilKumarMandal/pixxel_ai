import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { imagekit } from "@/lib/config";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

fal.config({
    credentials: process.env.FAL_KEY!,
})

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

        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Image file is required" },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffers = await file.arrayBuffer();
        const buffers = Buffer.from(arrayBuffers);

        // Upload to ImageKit
        const uploaded = await imagekit.upload({
            file: buffers, // required
            fileName: file.name || "upload.png",
        });

        console.log("ImageKit Uploaded URL:", uploaded.url);

        // Call fal-ai super-resolution with ImageKit URL
        const result = await fal.subscribe("fal-ai/drct-super-resolution", {
            input: {
                image_url: uploaded.url,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });



        const imageUrl = result.data.image.url
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
            data: { credits: { decrement: 2 } },
        });
        
        return NextResponse.json({
            success: true,
            upscaleUrl: upload.url,
            msg: "Image upscaled and stored successfully",
        });
    } catch (error: any) {
        console.error("Upscale API Error:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to upscale image" },
            { status: 500 }
        );
    }
}
