import { imagekit } from "@/lib/config";
import prisma from "@/lib/prisma";
import { mapGender, mapReplicateStatus } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";


const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: NextRequest) {
    try {
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error("The replicate api token is not set!");
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const input = {
            fileKey: formData.get("fileKey") as string,
            modelName: formData.get("modelName") as string,
            gender: formData.get("gender") as string,
        };

        if (!input.fileKey || !input.modelName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const fileUrl = imagekit.url({
            path: input.fileKey, 
            transformation: [],
            signed: true, 
            expireSeconds: 3600, 
        });

        if (!fileUrl) {
            throw new Error("Failed to get the file URL from ImageKit");
        }

        const fileName = input.fileKey.replace("training_data/", "");
        const modelId = `${user.id}_${Date.now()}_${input.modelName.toLowerCase().replaceAll(" ", "_")}`;

        // Create model
        await replicate.models.create("nikhilkumarmandal", modelId, {
            visibility: "private",
            hardware: "gpu-a100-large",
        });

        // Start training
        const training = await replicate.trainings.create(
            "ostris",
            "flux-dev-lora-trainer",
            "26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2",
            {
                destination: `nikhilkumarmandal/${modelId}`,
                input: {
                    steps: 1200,
                    resolution: "1024",
                    input_images: fileUrl, 
                    trigger_word: "ohwx",
                },
                webhook: `/api/webhooks/training?userId=${user.id}&modelName=${encodeURIComponent(
                    input.modelName
                )}&fileName=${encodeURIComponent(fileName)}`,
                webhook_events_filter: ["completed"],
            }
        );

        await prisma.model.create({
            data: {
                modelId: modelId,
                userId: user.id,
                modelName: input.modelName,
                trainingSatus: mapReplicateStatus(training.status),
                gender: mapGender(input.gender),
                triggerWord: "ohwx",
                trainingSteps: 1200,
                trainingId: training.id,
                filePath: input.fileKey
            }
        })

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "failed to start the model training";

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
