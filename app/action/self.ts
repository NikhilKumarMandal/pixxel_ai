"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"



export async function getCredits() {
    try {
 
        const { userId } = await auth();


        if (!userId) {
            throw new Error("Unauthorized");
        }

        const credits = await prisma.user.findUnique({
            where: {
                id: userId!
            },
            select: {
                credits: true
            }
        });

        return {
            error: null,
            success: true,
            data: credits?.credits,    
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