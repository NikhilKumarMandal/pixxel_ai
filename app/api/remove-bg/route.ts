import { imagekit } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
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

        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        };

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await imagekit.upload({
            file: buffer,
            fileName: file.name,
            isPublished: true,
            useUniqueFileName: false,
        });

        const result = await fal.subscribe("fal-ai/imageutils/rembg", {
            input: {
                image_url: uploadResult.url
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

        await imagekit.deleteFile(uploadResult.fileId);

        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const upscaleUpload = await imagekit.upload({
            file: base64,
            fileName: `remove-bg-${file.name}`,
            isPublished: true,
            useUniqueFileName: false,
        });

        await prisma.image.create({
            data: {
                url: upscaleUpload.url,
                fileId: upscaleUpload.fileId,
                userId: userId!
            }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 2 } },
        });

        return NextResponse.json({
            success: true,
            upscaleUrl: upscaleUpload.url,
            msg: "Image upscaled and stored successfully",
        });
    } catch (error: any) {
        console.log(error.message, "Message");
        return NextResponse.json(
            { error: error.message || "Failed to upscale image" },
            { status: 500 }
        );
    }
}