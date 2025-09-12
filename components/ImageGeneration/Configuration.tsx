"use client"

import React, { useEffect } from 'react'
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react';
import useGeneratedStore from '@/store/useGeneratedStore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from '../ui/textarea';


export const ImageGenerationFormSchema = z.object({
    model: z.string({
        message: "Model is required!"
    }),
    prompt: z.string({
        message: "Prompt is required!"
    }),
    guidance: z.number({
        message: "Guidance scale is required!"
    }),
    num_output: z.number().min(1, { message: "number of outputs should be atleast 1." }).max(4, { message: "Number of outputs must be less then 4." }),
    aspect_ration: z.string({
        message: "Aspect ratio is required!"
    }),
    output_format: z.string({
        message: "Output format is required!"
    }),
    output_quality: z.number().min(1, { message: "Output aquality should be atleast 1." }).max(100, { message: "Output quality mest be less then or equal to 100." }),
    num_inference_steps: z.number().min(1, { message: "Number of inference steps should be atleast 1." }).max(50, { message: "Number of inference steps must be less then or equal to 50" })
});




function Configuration() {
    const generateImage = useGeneratedStore((state:any) => state.generateImage);
    const form = useForm<z.infer<typeof ImageGenerationFormSchema>>({
        resolver: zodResolver(ImageGenerationFormSchema),
        defaultValues: {
            model: "black-forest-labs/flux-dev",
            prompt: "",
            guidance: 3.5,
            num_output: 1,
            output_format: "jpg",
            aspect_ration: "1:1",
            output_quality: 80,
            num_inference_steps: 28
        },
    })

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "model") {
                let newSteps;

                if (value.model === "black-forest-labs/flux-schnell") {
                    newSteps = 4
                } else {
                    newSteps = 28
                }

                if (newSteps !== undefined) {
                    form.setValue("num_inference_steps", newSteps)
                }
            }
        })

        return () => subscription.unsubscribe();
    }, [form])

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof ImageGenerationFormSchema>) {
        const newValues = {
            ...values,
            prompt:  values.prompt
        }
        await generateImage(newValues);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <fieldset className='grid gap-6 p-4 bg-[#2a2a2a] rounded-lg border text-[#e0e0e0]'>
                    <legend className='text-sm -ml-1 px-1 font-medium'>
                        Settings
                    </legend>
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        Modal
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className='w-h h-4' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>You can select any model from dropdown menu.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="black-forest-labs/flux-dev">Flux dev</SelectItem>
                                        <SelectItem value="black-forest-labs/flux-schnell">Flux Schnell</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='grid grid-cols-2 gap-4'>

                        <FormField
                            control={form.control}
                            name="aspect_ration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Aspect Ratio
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className='w-h h-4' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Aspect Ration for the generated image.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1:1">1:1</SelectItem>
                                            <SelectItem value="16:9">16:9</SelectItem>
                                            <SelectItem value="21:9">21:9</SelectItem>
                                            <SelectItem value="3:2">3:2</SelectItem>
                                            <SelectItem value="2:3">2:3</SelectItem>
                                            <SelectItem value="4:5">4:5</SelectItem>
                                            <SelectItem value="5:4">5:4</SelectItem>
                                            <SelectItem value="3:4">3:4</SelectItem>
                                            <SelectItem value="4:3">4:3</SelectItem>
                                            <SelectItem value="9:16">9:16</SelectItem>
                                            <SelectItem value="9:21">9:21</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />



                        <FormField
                            control={form.control}
                            name="num_output"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className='w-h h-4' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Total number of output imnage to generate.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        Number of Output
                                    </FormLabel>
                                    <FormControl>
                                        <Input type='number' min={1} max={4} {...field} onChange={(event) => field.onChange(+event.target.value)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                    </div>


                    <FormField
                        control={form.control}
                        name="guidance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        Guidance
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className='w-h h-4' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Prompt guidance for generate image.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <span>{field.value}</span>
                                </FormLabel>
                                <FormControl>
                                    <Slider defaultValue={[field.value]} min={0} max={10} step={0.5}
                                        onValueChange={value => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="num_inference_steps"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        Number of inference step
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className='w-h h-4' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Number of denoising steps. Recommeded range is 28-50 for dev model and 1-4 for schnell model</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <span>{field.value}</span>
                                </FormLabel>
                                <FormControl>
                                    <Slider defaultValue={[field.value]}
                                        max={
                                            form.getValues("model") === "" ? 4 : 50
                                        } min={1} step={1}
                                        onValueChange={value => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="output_quality"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        Output Quality
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className='w-h h-4' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Quality when sabing the output image,from 0 to 100.100 is best quality,0 is lowest qualuty</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <span>{field.value}</span>
                                </FormLabel>
                                <FormControl>
                                    <Slider defaultValue={[field.value]}
                                        max={100} min={50} step={1}
                                        onValueChange={value => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="output_format"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        Output Format
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className='w-h h-4' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Select output format for your image</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a output format" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="webp">webp</SelectItem>
                                        <SelectItem value="png">png</SelectItem>
                                        <SelectItem value="jpg">jpg</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className='w-h h-4' />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Write your prompt here</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    Prompt
                                </FormLabel>
                                <FormControl>
                                    <Textarea rows={6} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>
                <Button type="submit" className='font-medium cursor-pointer'>Generate</Button>
            </form>
        </Form>
    )
}

export default Configuration