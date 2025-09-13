"use client"
import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Loader2 } from "lucide-react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import useGeneratedStore from '@/store/useGeneratedStore'



function GeneratedImages() {

    const images = useGeneratedStore((state:any) => state.images);
    const loading = useGeneratedStore((state:any) => state.loading);


    if (loading) {
        return (
            <Card className="w-full max-w-2xl bg-muted">
                <CardContent className="flex aspect-square items-center justify-center p-6">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="ml-3 text-lg">Generating image...</span>
                </CardContent>
            </Card>
        )
    }

    if (images.length === 0) {
        return <Card className='w-full max-w-2xl bg-[#2a2a2a]'>
            <CardContent className='flex aspect-square items-center justify-center p-6'>
                <span className='text-2xl text-[#a0a0a0]'>No Image generated</span>
            </CardContent>
        </Card>
    }
    return (
        <Carousel
            className="w-full max-w-2xl"
        >
            <CarouselContent >
                {images.map((image: any, index: number) => (
                    <CarouselItem key={index} className="basis-full">
                        <div className="flex items-center relative rounded-lg overflow-hidden aspect-square">
                            <img src={image.url} alt={"generated Image using ai"} className='w-full h-full object-cover' />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious  className='text-black' />
            <CarouselNext className='text-black' />
        </Carousel>
    )
}

export default GeneratedImages