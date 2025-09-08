"use client"
import React, { useId } from 'react'
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, ImageIcon, MessageSquare } from "lucide-react"
import { toast } from 'sonner'

function ImageToImage() {
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [prompt, setPrompt] = useState<string>("")
    const toastId = useId();
    const [loading,setLoading] = useState<boolean>(false)

    const handleImageUpload = (files: FileList) => {
        const newFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))

        newFiles.forEach((file) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setImages((prev) => [...prev, file])
                setPreviews((prev) => [...prev, result])
            }
            reader.readAsDataURL(file)
        })
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleImageUpload(files)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleImageUpload(files)
        }
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
        setPreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        setLoading(true)
        if (images.length === 0) {
            toast.error("Please upload at least one image before submitting.", { id: toastId })
            return;
        }
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img));
        formData.append("prompt", prompt);

        try {
            const res = await fetch("/api/image-to-image", {
                method: "POST",
                body: formData,
            });

            toast.info("Image upload successfully", { id: toastId });

            const data = await res.json();
            console.log("Data", data);

            if (data.success) {
                toast.success(data.msg, { id: toastId })
                console.log("Response:", data);
            } else {
                toast.error("Upload failed: ", { id: toastId })
            }
        } catch (error: any) {
            toast.error(error || "Failed to generate Image", { id: toastId })
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Image To Image</h1>
                    <p className="text-muted-foreground">Upload one or two images and give prompt what you want.</p>
                </div>

                <Card className="w-full bg-[#2a2a2a] text-[#a0a0a0]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Upload Images & Add Prompt
                        </CardTitle>
                        <CardDescription>Upload multiple images and add your description or prompt</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div
                            className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={(e) => e.preventDefault()}
                        >
                            <div className="space-y-4">
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                <div>
                                    <p className="text-lg font-medium">Drop your images here</p>
                                    <p className="text-sm text-muted-foreground">or click to browse (multiple files supported)</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileInput}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Prompt or Description
                            </label>
                            <Textarea
                                placeholder="Describe what you want to do with these images, add instructions, or write a prompt..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-24 resize-none"
                            />
                            <p className="text-sm text-muted-foreground">{prompt.length} characters</p>
                        </div>
                    </CardContent>
                </Card>

                {images.length > 0 && (
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Uploaded Images ({images.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview || "/placeholder.svg"}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-16 object-cover rounded-md"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1 truncate">{images[index]?.name}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-center">
                    <Button onClick={handleSubmit} size="lg" disabled={images.length === 0} className="min-w-32">
                        Generate Images
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ImageToImage