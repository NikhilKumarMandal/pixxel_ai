import React, { useId } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { deleteImage } from '@/app/action/image-actions';


interface DeleteImageProps {
    imageId: string;
    onDelete?: () => void;
    className?: string;
    imageName: string
}

function DeleteImage({ imageId, onDelete, className, imageName }: DeleteImageProps) {

    const toastId = useId();

    const handleDelete = async () => {

        toast.loading("Deleting the image...", { id: toastId });

        const { error, success } = await deleteImage(imageId);


        if (error) {
            toast.error(error, { id: toastId });
        } else if (success) {
            toast.success("Image deleted successfully", { id: toastId });
            onDelete?.()
        } else {
            toast.dismiss(toastId);
        }
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={'destructive'} className={cn("w-fit", className)}>
                    <Trash2 className='w-4 h-4' />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will paramanently delete the image
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className='bg-destructive hover:bg-destructive/90' onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteImage