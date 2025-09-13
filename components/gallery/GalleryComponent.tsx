"use client"
import React, { useState } from 'react'
import ImageDialog, { Image } from './ImageDialog'


interface GalleryProps {
    images: Image[]
}

function GalleryComponent({ images }: GalleryProps) {

    const [selectedImage, setSelectImage] = useState<Image | null>(null);


    console.log(images);

    if (images.length === 0) {

        return <div className='flex items-center justify-center h-[50vh] text-muted-foreground'>
            No Images found!
        </div>
    }


    return (
        <section className='container mx-auto py-8'>
            <div className='columns-4 gap-4 space-y-4'>
                {

                    images.map((image, index) => {


                        return <div key={index}>
                            <div className='relative
              overflow-hidden cursor-pointer transition-transform'
                                onClick={() => setSelectImage(image)}
                            >

                                <div className='absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-70 rounded'>
                                    <div className='flex items-center justify-center h-full'>
                                        <p className='text-primary-foreground text-lg font-semibold'>View Details</p>
                                    </div>
                                </div>
                                <img
                                    src={image.url!}
                                    alt={image.url}
                                    className='object-cover rounded'
                                />
                            </div>
                        </div>


                    })



                }
            </div>

            {
                selectedImage && <ImageDialog image={selectedImage} onClose={() => setSelectImage(null)} />
            }



        </section>
    )
}

export default GalleryComponent