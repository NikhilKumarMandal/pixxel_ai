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
        // Parse FormData
        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const prompt = formData.get("prompt") as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

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

        // extract only URLs from ImageKit uploads
        const imageUrls = uploadResults.map((u:any) => u.url);

        // Build content array for OpenAI
        const content: any[] = [
            { type: "text", text: prompt },
            ...imageUrls.map((url: string) => ({
                type: "image_url",
                image_url: { url },
            })),
        ];


        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
                {
                    role: "system",
                    content: `You are a model that generates a headshot from the image provided by the user. Begin with a concise checklist (3-7 bullets) outlining steps to generate the headshot from the given image. After processing the image, validate in 1-2 lines that a clear, centered headshot was produced; if not, self-correct or flag issues. Output only the processed headshot image as the result.
                    Don't add any text in the image
                    `
            },
                {
                    role: "user",
                    content,
                },
            ],
        });

        console.log(completion);
        

        const message = completion.choices[0].message as ImageMessage;
        let uploadResult;
        if (message?.images?.[0]?.image_url?.url) {
            const rawUrl = message.images[0].image_url.url;

            if (rawUrl.startsWith("data:image")) {
                // It's a base64 data URI
                const base64Data = rawUrl.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");

                // Upload to ImageKit (or save locally)
                uploadResult = await imagekit.upload({
                    file: buffer.toString("base64"),
                    fileName: `thumbnail_${Date.now()}.png`,
                    isPublished: true,
                    useUniqueFileName: false,
                });
                console.log(uploadResult);
                
                console.log("✅ Uploaded to ImageKit:", uploadResult.url);
                return NextResponse.json({ generatedThumbnail: uploadResult.url });
            } else {
                return NextResponse.json({ generatedThumbnail: rawUrl });
            }
        }



        return NextResponse.json({
            success: true,
            prompt,
            images: uploadResults,
            completion,
            msg: "Image generated successfully!",
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
