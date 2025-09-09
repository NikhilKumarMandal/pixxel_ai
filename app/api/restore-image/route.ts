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


        const output = await replicate.run(
            "tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
            {
                input: {
                    img: uploadResult.url,
                    scale: 2,
                    version: "v1.4"
                }
            }
        ) as unknown as string;

        console.log(output);
        
        await imagekit.deleteFile(uploadResult.fileId);

        const response = await fetch(output);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const upscaleUpload = await imagekit.upload({
            file: base64,
            fileName: `restore-image-${file.name}`,
            isPublished: true,
            useUniqueFileName: false,
        });
        

        return NextResponse.json({
            success: true,
            upscaleUrl: upscaleUpload.url,
            msg: "Image restored and stored successfully",
        });
    } catch (error: any) {
        console.log(error.message,"Message");
        return NextResponse.json(
            { error: error.message || "Failed to upscale image" },
            { status: 500 }
        );
    }
}