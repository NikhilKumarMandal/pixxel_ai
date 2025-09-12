"use client"

import React, { useId } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from 'sonner'
import ImageKit from "imagekit-javascript";

const ACCEPTED_ZIP_FILES = ["application/x-zip-compressed", "application/zip"]
const MAX_FILE_SIZE = 45 * 1024 * 1024


const formSchema = z.object({
    modelName: z.string({
        message: "Model name is required!"
    }),
    gender: z.enum(["man", "women"]),
    zipFile: z.any().refine((files) => files?.[0] instanceof File, "Please select a valid file").refine((files) => files?.[0]?.types && ACCEPTED_ZIP_FILES.includes(files?.[0]?.type), "Only Zip files are accepted").refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max file size allowed is 45 mb.")
})

function ModelTrainingForm() {
    const toastId = useId();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            modelName: "",
            gender: "man",
            zipFile: undefined
        },
    })

    const fileRef = form.register("zipFile");


    async function onSubmit(values: z.infer<typeof formSchema>) {
        toast.loading("Uploading file...", { id: toastId })

        try {
            const imagekit = new ImageKit({
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
                urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
                authenticationEndpoint: "/api/imagekit-auth", 
            }as any);

            const uploadResponse = await imagekit.upload({
                file: values.zipFile[0], 
                fileName: `training_data/${Date.now()}_${values.zipFile[0].name}`,
                folder: "training_data",
            }as any);

            const response = await fetch("/api/train", {
                method: "POST",
                body: JSON.stringify({
                    fileKey: uploadResponse.filePath,
                    modelName: values.modelName,
                    gender: values.gender,
                }),
                headers: { "Content-Type": "application/json" },
            });

            const results = await response.json();

            if (!response.ok || results?.error) {
                throw new Error(results?.error || "Failed to train the model");
            }

            toast.success("Training started successfully!", { id: toastId });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to start training";
            toast.error(errorMessage, { id: toastId, duration: 5000 });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <fieldset className='grid max-w-5xl p-8 rounded-lg gap-6 border bg-[#2a2a2a] text-[#e0e0e0]'>
                    <FormField
                        control={form.control}
                        name="modelName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="shadcn" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This will be the name of your trained model.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Please select the gender of the image</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="man" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Male
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="women" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Female
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="zipFile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Trainig Data (Zip file) | <span className='text-destructive'>Read the requirement below</span></FormLabel>
                                <div className='mb-4 rounded-lg shadow-sm pb-4  text-white'>
                                    <ul className='space-y-2 text-sm  text-gray-500'>
                                        <li>
                                            • Provide 10, 12 or 15 images in total
                                        </li>
                                        <li>• Ideal breakdown for 12 images:</li>
                                        <ul className='ml-4 mt-1 space-y-1'>
                                            <li>- 6 face closeups</li>
                                            <li>- 3/4 half body closeups (till stomach)</li>
                                            <li>- 2/3 full body shots</li>
                                        </ul>
                                        <li>• No accessories on face/head ideally</li>
                                        <li>• No other people in images</li>
                                        <li>• Different expressions, clothing, backgrounds with good lighting</li>
                                        <li>• Images to be in 1:1 resolution (1048x1048 or higher)</li>
                                        <li>• Use images of similar age group (ideally within past few months)</li>
                                        <li>• Provide only zip file (under 45MB size)</li>
                                    </ul>
                                </div>
                                <FormControl>
                                    <Input type='file' accept=".zip" {...fileRef} />
                                </FormControl>
                                <FormDescription>
                                    Upload a zip file containing your training image (max 45MB).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className='w-fit cursor-pointer'>Submit</Button>
                </fieldset>

            </form>
        </Form>
    )
}

export default ModelTrainingForm