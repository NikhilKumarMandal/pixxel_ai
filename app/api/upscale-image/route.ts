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

        // Upload input image to ImageKit (optional, for storage)
        const uploadResult = await imagekit.upload({
            file: buffer.toString("base64"),
            fileName: file.name,
            isPublished: true,
            useUniqueFileName: false,
        });

        const input = {
            image: uploadResult.url,
            scale: 2
        };

        const output = await replicate.run(
            "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
            { input }
        ) as unknown as string;



        await imagekit.deleteFile(uploadResult.fileId);

        const response = await fetch(output);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const upscaleUpload = await imagekit.upload({
            file: base64,
            fileName: `upscaled-${file.name}`,
            isPublished: true,
            useUniqueFileName: false,
        });
        

        return NextResponse.json({
            success: true,
            upscaleUrl: upscaleUpload.url,
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