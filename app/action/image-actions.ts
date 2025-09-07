"use server"

import { z } from "zod";
import Replicate from "replicate";
import { ImageGenerationFormSchema } from "@/components/ImageGeneration/Configuration"
import { currentUser } from "@clerk/nextjs/server";

interface ImageResponse {
    error: string | null;
    success: boolean;
    data: any | null;
}

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    useFileOutput: false
});



export async function generateImageAction(input: (z.infer<typeof ImageGenerationFormSchema>)): Promise<ImageResponse> {

    if (!process.env.REPLICATE_API_TOKEN) {
        return {
            error: "The replicate api token is not set!",
            success: false,
            data: null
        }
    };

    const modalInput = {
        prompt: input.prompt,
        go_fast: true,
        guidance: input.guidance,
        megapixels: "1",
        num_outputs: input.num_output,
        aspect_ratio: input.aspect_ration,
        output_format: input.output_format,
        output_quality: input.output_quality,
        prompt_strength: 0.8,
        num_inference_steps: input.num_inference_steps
    };

    try {
        const output = await replicate.run(input.model as `${string}/${string}`, { input: modalInput });

        console.log("Output",output);
        

        return {
            error: null,
            success: true,
            data: output
        }
    } catch (error: any) {

        return {
            error: error.message ?? "Failed to generate Image 😭!",
            success: false,
            data: null
        }
    }
}


export async function getImage(limit?: number) {

    const user = await currentUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    };

    const imageWithUrls = null;

    return {
        error: null,
        success: true,
        data: imageWithUrls || null
    }

}
 

export async function deleteImage(id: string, ) {
    const user = await currentUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    };



    const data = "";
    return {
        error: null,
        success: true,
        data: data
    }
}