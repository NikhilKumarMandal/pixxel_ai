import { imagekit, replicate } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        // Parse FormData
        const formData = await req.formData();
        const file = formData.get("image") as File;
        const prompt = formData.get("prompt") as string;

        if (!file) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }
    
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: file.name,
                isPublished: true,
                useUniqueFileName: false,
            });
    

        const input = {
            prompt: prompt,
            input_image: uploadResponse.url,
        }

        const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input }) as unknown as string;

        console.log(output);

        await imagekit.deleteFile(uploadResponse.fileId);

        const response = await fetch(output);
        const arrayBuffers = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffers).toString("base64");

        const upscaleUpload = await imagekit.upload({
            file: base64,
            fileName: `headsort-image-${file.name}`,
            isPublished: true,
            useUniqueFileName: false,
        });


        return NextResponse.json({
            success: true,
            msg: "Image generated successfully!",
            finalImage: upscaleUpload.url,
        });
        
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
