import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'

function RecentImages({ images }: any) {
    if (images.length === 0) {
        return (
            <Card className='col-span-3'>
                <CardHeader>
                    <CardTitle>Recent Generations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-muted-foreground mt-16'>No images generated yet!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className='col-span-3'>
            <CardHeader>
                <CardTitle>Recent Generations</CardTitle>
            </CardHeader>
            <CardContent>
                <Carousel className='w-full'>
                    <CarouselContent>
                        {images?.map((image: any) => (
                            <CarouselItem key={image.id} className='md:basis-1/2 lg:basis-1/3'>
                                <div className='space-y-2'>
                                    <div
                                        className={cn(
                                            "relative overflow-hidden rounded-lg",
                                            image.height && image.width
                                                ? `aspect-[${image.width}/${image.height}]`
                                                : "aspect-square"
                                        )}
                                    >
                                        <img src={image.url || ""} alt='recent-image' />
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className='left-2' />
                    <CarouselNext className='right-2' />
                </Carousel>

                <div className='flex justify-end'>
                    <Link href={"/gallery"}>
                        <Button variant={"ghost"} size={"sm"}>
                            View gallery <ArrowRight className='ml-2 w-4 h-4' />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentImages
