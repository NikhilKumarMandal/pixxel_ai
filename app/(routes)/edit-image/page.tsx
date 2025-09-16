"use client"

import React, { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload, Download, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreditStore } from "@/store/store"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
 

const formSchema = z.object({
    prompt: z.string().min(5, { message: "Prompt must be at least 5 characters." }),
    size: z.enum(["default", "square", "portrait", "landscape", "custom"]),
    width: z.number().optional(),
    height: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function ImageGeneratorUI() {
    const [images, setImages] = useState<File[]>([])
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const toastId = useId();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
            size: "default",
            width: 512,
            height: 512,
        },
    })

    const router = useRouter()
    const { credit } = useCreditStore();
    

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const selectedFiles = Array.from(e.target.files)
        const newFiles = [...images, ...selectedFiles].slice(0, 8) // keep max 8
        setImages(newFiles)
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }



    const handleGenerate = async (values: FormValues) => {
        if (credit! < 2) {
            router.push("/billing");
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append("prompt", values.prompt);
            formData.append("size", values.size);
            if (values.width) formData.append("width", values.width.toString());
            if (values.height) formData.append("height", values.height.toString());

            images.forEach((file, idx) => {
                formData.append("images", file, file.name || `image-${idx}.png`);
            });

            toast.loading("generating...", { id: toastId });

            const res = await fetch("/api/edit-image", {
                method: "POST",
                body: formData, // no JSON.stringify, no Content-Type header
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Image generation failed");

            toast.success("Image generated successfully!", { id: toastId });
            setGeneratedImage(data.generatedUrl);
        } catch (err: any) {
            console.error("Generate error:", err.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleDownload = async () => {
        if (!generatedImage) return
        try {
            const response = await fetch(generatedImage, { mode: "cors" });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = "upscaleImage.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center">Edit Your Image</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
                {/* Left Panel */}
                <Card className="p-4 space-y-4">
                    <CardHeader>
                        <CardTitle>Prompt & Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
                            <Textarea
                                placeholder="Enter your prompt here..."
                                {...form.register("prompt")}
                            />
                            {form.formState.errors.prompt && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.prompt.message}
                                </p>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Upload up to 8 images</label>
                                <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                                <div className="flex gap-2 flex-wrap">
                                    {images.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="relative w-20 h-20 rounded overflow-hidden border"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`upload-${idx}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-sm font-medium">Image Size</label>
                                <Select
                                    value={form.watch("size")}
                                    onValueChange={(val) => form.setValue("size", val as FormValues["size"])}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="square">Square</SelectItem>
                                        <SelectItem value="portrait">Portrait 3:4</SelectItem>
                                        <SelectItem value="landscape">Landscape 16:9</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>

                                {form.watch("size") === "custom" && (
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            {...form.register("width", { valueAsNumber: true })}
                                        />
                                        <Input
                                            type="number"
                                            {...form.register("height", { valueAsNumber: true })}
                                        />
                                    </div>
                                )}
                            </div> 

                            <Button
                                disabled={isLoading || credit! < 2}
                                type="submit"
                                className="w-full"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {isLoading ? "Generating..." : "Generate Image"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Right Panel */}
                <Card className="flex items-center justify-center p-4">
                    {generatedImage ? (
                        <div className="space-y-4 text-center">
                            <img src={generatedImage} alt="Generated" className="rounded-lg shadow" />
                            <Button onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                        </div>
                    ) : (
                        <p className="text-gray-500">Generated image will appear here.</p>
                    )}
                </Card>
            </div>
        </div>
    )
}
