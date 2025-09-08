"use client"

import type React from "react"
import { useState, useRef, useId } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, X, Download } from "lucide-react"
import { toast } from "sonner"

export default function UpscaleImage() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const toastId = useId()

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setUpscaledUrl(null) // reset old result
        }
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setUpscaledUrl(null)
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    const removeImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        setUpscaledUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleProcess = async () => {
        if (!selectedImage) return
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("image", selectedImage)

            toast.loading("Upscaling image...", { id: toastId })

            const res = await fetch("/api/upscale-image", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to upscale image")
            }

            toast.success("Image upscaled successfully!", { id: toastId })

            if (data.upscaleUrl) {
                setUpscaledUrl(data.upscaleUrl)
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong", { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!upscaledUrl) return
        try {
            const response = await fetch(upscaledUrl, { mode: "cors" });
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
        <div className="p-6 flex items-center justify-center">
            <Card className="w-full max-w-2xl bg-[#2a2a2a] text-[#a0a0a0]">
                <CardContent className="p-6 space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-white">Upload Image</h1>
                        <p className="text-sm text-muted-foreground mt-1">Select an image to process</p>
                    </div>

                    {/* Upload area */}
                    {!previewUrl && !upscaledUrl && (
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="space-y-3">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Drop your image here, or click to browse</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />

                    {/* Before & After */}
                    {(previewUrl || upscaledUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {previewUrl && (
                                <div className="relative">
                                    <img
                                        src={previewUrl}
                                        alt="Original"
                                        className="w-full rounded-lg object-contain max-h-64 mx-auto"
                                    />
                                    <p className="text-center mt-2 text-sm text-white">Original</p>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {upscaledUrl && (
                                <div className="relative">
                                    <img
                                        src={upscaledUrl}
                                        alt="Upscaled"
                                        className="w-full rounded-lg object-contain max-h-64 mx-auto"
                                    />
                                    <p className="text-center mt-2 text-sm text-white">Upscaled</p>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={handleDownload}
                                    >
                                        <Download className="h-4 w-4 mr-1" /> Download
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                {/* Footer */}
                {previewUrl && (
                    <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-full justify-center py-2">
                            <span className="text-sm font-medium">This service will cost 2 credits</span>
                        </Badge>

                        <Button
                            onClick={handleProcess}
                            disabled={!previewUrl || loading}
                            className="w-full"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {loading ? "Processing..." : "Upscale Image"}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
