import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import DeleteImage from './DeleteImage'



export interface Image {
    id: string;
    url: string;
    fileId: string;
    userId: string;
    createdAt: Date
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
            link.setAttribute("download", `generated-image-${Date.now()}.jpg`);

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
                                alt={"images"}
                                className='w-full h-auto rounded flex mb-3'
                            />
                        </div>

                        <div className='flex gap-4 bottom-4 right-4'>
                            <Button className='w-fit' onClick={handelDownload}>
                                <Download className='w-4 h-4 mr-2' />
                                Download
                            </Button>

                            <DeleteImage imageId={image.id.toString()} onDelete={onClose} className='w-fit' fileId={image.fileId}  />
                        </div>
                        <ScrollBar orientation='vertical' />
                    </ScrollArea>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}

export default ImageDialog