import { imagekit } from "@/lib/config";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) { 

    const user = await currentUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null,
        };
    }
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        };

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await imagekit.upload({
            file: buffer.toString("base64"),
            fileName: file.name,
            isPublished: true,
            useUniqueFileName: false,
        });

        const data = await prisma.project.create({
            data: {
                url: uploadResult.url,
                fileId: uploadResult.fileId,
                userId: user.id,
                width: uploadResult.width,
                height: uploadResult.height
            }
        })

        return NextResponse.json({
            success: true,
            projectId:data.id,
            msg: "Image stored successfully",
        });
    } catch (error: any) {
        console.log(error.message,"Message");
        return NextResponse.json(
            { error: error.message || "Failed to upscale image" },
            { status: 500 }
        );
    }
}