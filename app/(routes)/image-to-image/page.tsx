"use client"
import React, { useId, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, ImageIcon, MessageSquare, Download } from "lucide-react"
import { toast } from "sonner"

function ImageToImage() {
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [finalImage, setFinalImage] = useState<string | null>(null) // ✅ separate state for backend image
    const [prompt, setPrompt] = useState<string>("")
    const toastId = useId()
    const [loading, setLoading] = useState<boolean>(false)

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
        if (e.dataTransfer.files.length > 0) {
            handleImageUpload(e.dataTransfer.files)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleImageUpload(e.target.files)
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
            return
        }

        const formData = new FormData()
        images.forEach((img) => formData.append("images", img))
        formData.append("prompt", prompt)

        try {
            const res = await fetch("/api/image-to-image", {
                method: "POST",
                body: formData,
            })

            const data = await res.json();
            console.log(data);
            
            if (data.success) {
                toast.success(data.msg, { id: toastId })
                setFinalImage(data.finalImage) // ✅ only backend final image
                setImages([])
                setPreviews([])
            } else {

                toast.error(data.error || "Upload failed", { id: toastId })
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to generate Image", { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Image To Image</h1>
                    <p className="text-muted-foreground">Upload multiple images and add a description or prompt</p>
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

                        {/* ✅ Small previews before submit */}
                        {previews.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={src}
                                            alt={`preview-${index}`}
                                            className="w-20 h-20 object-cover rounded-md border"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full p-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Prompt or Description
                            </label>
                            <Textarea
                                placeholder="Describe what you want to do with these images..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-24 resize-none"
                            />
                            <p className="text-sm text-muted-foreground">{prompt.length} characters</p>
                        </div>
                    </CardContent>
                </Card>

                {/* ✅ Final Generated Image after backend response */}
                {finalImage && !loading && (
                    <Card className="w-full bg-[#2a2a2a] text-[#a0a0a0]">
                        <CardHeader>
                            <CardTitle>Generated Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center space-y-4">
                                <img
                                    src={finalImage}
                                    alt="Generated result"
                                    className="max-w-full rounded-lg shadow-md"
                                />
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => {
                                        const a = document.createElement("a")
                                        a.href = finalImage
                                        a.download = "generated-image.png"
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Image
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-center">
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        disabled={images.length === 0 || loading}
                        className="min-w-32"
                    >
                        {loading ? "Processing..." : "Upload Images"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ImageToImage
