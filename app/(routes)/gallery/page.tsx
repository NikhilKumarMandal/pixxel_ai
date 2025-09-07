
import { getImage } from '@/app/action/image-actions';
import GalleryComponent from '@/components/gallery/GalleryComponent';
import React from 'react'

const Gallery = async () => {

    const { data: images } = await getImage();

    return (
        <section className='container mx-auto'>
            <h1 className='text-3xl font-semibold mb-2'>My Image</h1>
            <p className='text-muted-foreground mb-6'>Here  you can see all the image you have generated.click on an image to view details.</p>
            <GalleryComponent images={images || []} />
        </section>
    )
}

export default Gallery