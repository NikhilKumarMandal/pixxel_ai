"use client"

import React, { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreditStore } from "@/store/store"
import { toast } from "sonner"

const formSchema = z.object({
    prompt: z.string().min(10, "Prompt must be at least 10 characters"),
    // aspectRatio: z.string(),
})

type FormValues = z.infer<typeof formSchema>



export default function ImageGenerator() {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
     const toastId = useId();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
            // aspectRatio: "1:1",
        },
    })


     const router = useRouter()
    const { credit } = useCreditStore();
    
    async function onSubmit(values: FormValues) {
        if (credit! < 2) {
            router.push("/billing")
            return
        }


        setLoading(true)
        setGeneratedImage(null)

        try {
            toast.loading("generating...", { id: toastId });

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to generate")
            }

            toast.success("Image generated successfully!", { id: toastId });

            const data = await res.json()
            setGeneratedImage(data.uploadedImage)
        } catch (error: any) {
            console.error("Frontend Error:", error.message)
        } finally {
            setLoading(false)
        }
    }

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
        <div className="flex items-center justify-center p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
                {/* Left Panel - Form */}
                <Card className="shadow-lg rounded-2xl">
                    <CardHeader>
                        <CardTitle>Image Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Prompt */}
                            <div>
                                <label className="text-sm font-medium">Prompt</label>
                                <Textarea
                                    placeholder="Describe the image you want..."
                                    {...form.register("prompt")}
                                    className="mt-1"
                                    rows={10}
                                />
                                {form.formState.errors.prompt && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.prompt.message}
                                    </p>
                                )}
                            </div>

                            {/* Aspect Ratio */}
                            {/* <div>
                                <label className="text-sm font-medium">Aspect Ratio</label>
                                <Select
                                    defaultValue="1:1"
                                    onValueChange={(value) => form.setValue("aspectRatio", value)}
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1:1">1:1</SelectItem>
                                        <SelectItem value="16:9">16:9</SelectItem>
                                        <SelectItem value="4:3">4:3</SelectItem>
                                        <SelectItem value="9:16">9:16</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}

                            {/* Submit Button */}
                            <Button type="submit" disabled={loading || credit! < 2} className="w-full">
                                {loading ? "Generating..." : "Generate Image"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Right Panel - Result */}
                <Card className="shadow-lg rounded-2xl flex items-center justify-center p-6">
                    {generatedImage ? (
                        <div className="flex flex-col items-center space-y-4">
                            <img
                                src={generatedImage}
                                alt="Generated"
                                className="rounded-xl shadow-md max-w-full h-auto"
                            />
                            <Button
                                variant="outline"
                                onClick={handleDownload}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 flex flex-col items-center">
                            <ImageIcon className="h-12 w-12 mb-2" />
                            <p>No image generated yet.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
