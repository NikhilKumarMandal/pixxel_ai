"use server"

import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { imagekit } from "@/lib/config";
import prisma from "@/lib/prisma";



//nikhilkumardev007-blip
interface ImageResponse {
    error: string | null;
    success: boolean;
    data: any | null;
}







export async function imgUrlToBuffer(url: string) {
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}


export async function storeImage(urls: string[]) {
    const user = await currentUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null,
        };
    }

    const savedImages = [];

    console.log(urls,"URLS");
    

    for (const imgUrl of urls) {
 
        const buffer = await imgUrlToBuffer(imgUrl);

        const upload = await imagekit.upload({
            file: buffer, 
            fileName: `image_${randomUUID()}.jpg`,
            isPublished: true,
            useUniqueFileName: false,
        });

        console.log("uploadUrl",upload.url);
        

        const image = await prisma.image.create({
            data: {
                url: upload.url,
                userId: user.id,
                fileId: upload.fileId,
            },
        });

        savedImages.push(image);
    }

    return {
        error: null,
        success: true,
        data: savedImages,
    };
}

export async function getImage(limit?: number) {

    const user= await currentUser();
    if (!user?.id) {
        return {
            error: "Unauthorized",
            success: false,
            data: null,
        };
    }

    try {
        let images = await prisma.image.findMany({
            where: { userId:user?.id },
            orderBy: { createdAt: "desc" },
            take: limit, 
        });

        const imageWithUrls = images.map((image) => ({
            ...image,
            url: image.url, 
        }));

        return {
            error: null,
            success: true,
            data: imageWithUrls,
        };
    } catch (err: any) {
        return {
            error: err.message || "Failed to fetch images!",
            success: false,
            data: null,
        };
    }
}
 

export async function deleteImage(id: string, fileId: string ) {
    const user = await currentUser();

    if (!user) {
        return {
            error: "Unauthorized",
            success: false,
            data: null
        }
    };

    await imagekit.deleteFile(fileId);

    const image = await prisma.image.delete({
        where: {
            id: id
        }
    })

    if (!image) {
        return {
            error: "image not found!",
            success: false,
            data: null
        };
    }

    return {
        error: null,
        success: true,
        data: image
    }
}