import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"



export async function getCredits() {
    try {
        const user = await currentUser();

        if (!user) {
            return {
                error: "Unauthorized",
                success: false,
                data: null,
                count: 0,
            }
        }

        const credits = await prisma.user.findUnique({
            where: {
                id: user?.id
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