import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import { Badge } from '../ui/badge'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import DeleteImage from './DeleteImage'



export interface Image {
    id: string;
    url: string;
    output_format: string;
    prompt: string;
    image_name: string;
    model: string;
    aspect_ratio: string;
    width: number;
    height: number;
    guidance: number;
    num_inference_steps: number;
    created_at: Date;
}


interface ImageDialogProps {
    image: Image;
    onClose: () => void;
}

function ImageDialog({ image, onClose }: ImageDialogProps) {


    const handelDownload = () => {
        fetch(image.url || "").then(response => response.blob()).then(blob => {
            const url = window.URL.createObjectURL(new Blob([blob]))

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute("download", `generated-image-${Date.now()}.${image?.output_format}`);

            document.body.appendChild(link);

            link.click();

            // cleanup

            link.parentNode?.removeChild(link)
        }).catch(error => console.log(error));
    };


    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent className='max-w-full sm:max-w-xl w-full'>
                <SheetHeader>
                    <SheetTitle className='text-2xl w-full'>Image Details</SheetTitle>

                    <ScrollArea className="flex flex-col h-[100vh]">



                        <div className='relative w-fit h-fit'>
                            <img
                                src={image.url!}
                                alt={image.prompt!}
                                className='w-full h-auto rounded flex mb-3'
                            />
                        </div>

                        <div className='flex gap-4 bottom-4 right-4'>
                            <Button className='w-fit' onClick={handelDownload}>
                                <Download className='w-4 h-4 mr-2' />
                                Download
                            </Button>

                            <DeleteImage imageId={image.id.toString()} onDelete={onClose} className='w-fit' imageName={image?.image_name!} />
                        </div>
                        <ScrollBar orientation='vertical' />
                    </ScrollArea>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export default ImageDialog