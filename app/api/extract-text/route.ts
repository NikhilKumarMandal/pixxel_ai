import { imagekit, replicate } from "@/lib/config"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const image = formData.get("image") as File

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 })
        }

        // Convert image to base64
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            isPublished: true,
            useUniqueFileName: false,
        });

        const output = await replicate.run(
            "abiruyt/text-extract-ocr:a524caeaa23495bc9edc805ab08ab5fe943afd3febed884a4f3747aa32e9cd61",
            {
                input: {
                    image: uploadResponse.url
                }
            }
        );

        console.log(output);


        await imagekit.deleteFile(uploadResponse.fileId);

        return NextResponse.json({
            text: output,
            success: true,
        })
    } catch (error) {
        console.error("Error extracting text:", error)
        return NextResponse.json({ error: "Failed to extract text from image" }, { status: 500 })
    }
}
