import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        // Check authentication
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!projectId) {
            return NextResponse.json(
                { error: "Missing projectId" },
                { status: 400 }
            );
        }

        // Example: Fetch project from DB
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: user.id
            }, 
        });

        if (!project) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
            success: true,
            project: {
                id: project.id,
                url: project.url,  
                fileId: project.fileId,
                width: project.width,
                height: project.height,
                createdAt: project.createdAt,
            },
        });;
    } catch (error) {
        console.error("GET /api/project error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
