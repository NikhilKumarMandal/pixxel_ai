"use client"
import React, { useId, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, ImageIcon, MessageSquare, Download } from "lucide-react"
import { toast } from "sonner"

function ChangeBackground() {
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [finalImage, setFinalImage] = useState<string | null>(null)
    const [prompt, setPrompt] = useState<string>("")
    const toastId = useId()
    const [loading, setLoading] = useState<boolean>(false)

    const handleImageUpload = (file: File) => {
        if (!file.type.startsWith("image/")) return
        setImage(file)

        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0])
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (e.dataTransfer.files.length > 0) {
            handleImageUpload(e.dataTransfer.files[0])
        }
    }

    const removeImage = () => {
        setImage(null)
        setPreview(null)
    }

    const handleSubmit = async () => {
        setLoading(true)

        if (!image) {
            toast.error("Please upload an image before submitting.", { id: toastId })
            return
        }

        const formData = new FormData()
        formData.append("image", image) 
        formData.append("prompt", prompt)

        toast.loading("Changing Background...", { id: toastId })
        try {
            const res = await fetch("/api/change-bg", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            console.log(data)

            if (data.success) {
                toast.success(data.msg, { id: toastId })
                console.log(data.finalImage);
                setFinalImage(data.finalImage)
                setImage(null)
                setPreview(null)
            } else {
                toast.error(data.error || "Upload failed", { id: toastId })
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to generate Image", { id: toastId })
        } finally {
            setLoading(false)
        }
    }


    const handleDownload = async () => {
        if (!finalImage) return;
        try {
            const response = await fetch(finalImage, { mode: "cors" });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = "changeBackground.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
        }
    }


    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Change Background</h1>
                    <p className="text-muted-foreground">Upload a single image and add a description or prompt</p>
                </div>

                <Card className="w-full bg-[#2a2a2a] text-[#a0a0a0]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Upload Image & Add Prompt
                        </CardTitle>
                        <CardDescription>Upload one image and add your description or prompt</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div
                            className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="space-y-4">
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                <div>
                                    <p className="text-lg font-medium">Drop your image here</p>
                                    <p className="text-sm text-muted-foreground">or click to browse (only one file allowed)</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {preview && (
                            <div className="relative inline-block">
                                <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-md border" />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full p-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Prompt or Description
                            </label>
                            <Textarea
                                placeholder="Describe what you want to do with this image..."
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
                                    onClick={handleDownload}
                                    className="cursor-pointer"
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
                        disabled={!image || loading}
                        className="min-w-32 cursor-pointer"
                    >
                        {loading ? "Processing..." : "Upload Image"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ChangeBackground;

