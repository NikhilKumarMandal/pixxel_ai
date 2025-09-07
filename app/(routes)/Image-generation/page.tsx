import Configuration from '@/components/ImageGeneration/Configuration';
import GeneratedImages from '@/components/ImageGeneration/GeneratedImages';
import React from 'react'

const ImageGeneration = async () => {
  return (
    <section className='container mx-auto flex-1 grid gap-4 grid-cols-3 overflow-hidden'>
      <Configuration />
      <div className='col-span-2 p-4 rounded-xl flex items-center justify-center h-fit'>
        <GeneratedImages />
      </div>
    </section>
  )
}

export default ImageGeneration;