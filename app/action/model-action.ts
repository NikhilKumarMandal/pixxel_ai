"use server"

import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export async function fetchModels() {
    try {
        const user = await currentUser()
        if (!user) {
            return {
                error: "Unauthorized",
                success: false,
                data: null,
                count: 0,
            }
        }

        const models = await prisma.model.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return {
            error: null,
            success: true,
            data: models,
            count: models.length,
        }
    } catch (err) {
        return {
            error: err instanceof Error ? err.message : "Failed to fetch models",
            success: false,
            data: null,
            count: 0,
        }
    }
};




export async function deleteModel(id: string, modelId: string, modelVersion: string) {
    // Delete model version from Replicate
    if (modelVersion) {
        try {
            const res = await fetch(
                `https://api.replicate.com/v1/models/nikhilkumarmandal/${modelId}/versions/${modelVersion}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                    },
                }
            )

            if (!res.ok) {
                throw new Error("Failed to delete model version from Replicate")
            }
        } catch (error) {
            return {
                error: "Failed to delete model version from Replicate",
                success: false,
            }
        }
    }

    // Delete model from Replicate
    if (modelId) {
        try {
            const res = await fetch(
                `https://api.replicate.com/v1/models/nikhilkumarmandal/${modelId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
                    },
                }
            )

            if (!res.ok) {
                throw new Error("Failed to delete model from Replicate")
            }
        } catch (error) {
            return {
                error: "Failed to delete model from Replicate",
                success: false,
            }
        }
    }

    // Delete model from Prisma
    try {
        await prisma.model.delete({
            where: { id },
        })

        return {
            error: null,
            success: true,
        }
    } catch (err) {
        return {
            error:
                err instanceof Error
                    ? err.message
                    : "Failed to delete model from database",
            success: false,
        }
    }
}

