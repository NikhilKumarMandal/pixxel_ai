import { imagekit, replicate } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) { 

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

        return NextResponse.json({
            success: true,
            id:uploadResult.fileId,
            upscaleUrl: uploadResult.url,
            msg: "Image upscaled and stored successfully",
        });
    } catch (error: any) {
        console.log(error.message,"Message");
        return NextResponse.json(
            { error: error.message || "Failed to upscale image" },
            { status: 500 }
        );
    }
}