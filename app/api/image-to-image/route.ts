import { imagekit, openai } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";


export interface ImageMessage {
    role: string;
    content: string;
    images?: {
        type: string;
        image_url: {
            url: string;
        };
        index: number;
    }[];
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const prompt = formData.get("prompt") as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        // Upload to ImageKit
        const uploadResults: any[] = [];
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: file.name,
                isPublished: true,
                useUniqueFileName: false,
            });
            uploadResults.push(uploadResponse);
        }
        const imageUrls = uploadResults.map((u: any) => u.url);

        // Send to Gemini
        const content: any[] = [
            { type: "text", text: prompt },
            ...imageUrls.map((url: string) => ({
                type: "image_url",
                image_url: { url },
            })),
        ];

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [{ role: "user", content }],
        });

        console.log(completion);

        const message = completion.choices[0].message as ImageMessage;

        if (message?.images?.[0]?.image_url?.url) {
            const rawUrl = message.images[0].image_url.url;

            if (rawUrl.startsWith("data:image")) {
                const base64Data = rawUrl.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");
                const uploadResult = await imagekit.upload({
                    file: buffer.toString("base64"),
                    fileName: `thumbnail_${Date.now()}.png`,
                    isPublished: true,
                    useUniqueFileName: false,
                });
                return NextResponse.json({
                    success: true,
                    msg: "Image generated successfully!",
                    finalImage: uploadResult.url,
                });
            } else {
                return NextResponse.json({
                    success: true,
                    msg: "Image generated successfully!",
                    finalImage: rawUrl,
                });
            }
        }

        // ✅ Always return fallback
        return NextResponse.json({
            success: false,
            msg: "No image returned by model",
            completion,
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
