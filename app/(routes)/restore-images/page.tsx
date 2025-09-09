"use client"

import type React from "react"
import { useState, useRef, useId } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, X, Download } from "lucide-react"
import { toast } from "sonner"

export default function RemoveBackground() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const toastId = useId();
    const [loading, setLoading] = useState<boolean>(false);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    const removeImage = () => {
        setSelectedImage(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
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

            toast.loading("removing background...", { id: toastId });

            const res = await fetch("/api/restore-image", {
                method: "POST",
                body: formData,
            });

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to upscale image")
            }

            toast.success("Image upscaled successfully!", { id: toastId })

            if (data.upscaleUrl) {
                setProcessedImageUrl(data.upscaleUrl)
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong",{ id: toastId })
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!processedImageUrl) return
        try {
            const response = await fetch(processedImageUrl, { mode: "cors" });
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

    const resetProcess = () => {
        setProcessedImageUrl(null)
        removeImage()
    }

    return (
        <div className="p-6 flex items-center justify-center">
            <Card className="w-full max-w-md bg-[#2a2a2a] text-[#a0a0a0]">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold text-white">Restore Image</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {processedImageUrl ? "Image processed successfully" : "Select an image to process"}
                            </p>
                        </div>

                        {processedImageUrl ? (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 bg-muted/20">
                                    <img
                                        src={processedImageUrl || "/placeholder.svg"}
                                        alt="Processed image"
                                        className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleDownload} className="flex-1">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button onClick={resetProcess} variant="outline" className="flex-1 bg-transparent">
                                        Process Another
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrl || "/placeholder.svg"}
                                                alt="Preview"
                                                className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeImage()
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Drop your image here, or click to browse</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </>
                        )}
                    </div>
                </CardContent>

                {!processedImageUrl && (
                    <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                        <Badge variant="secondary" className="w-full justify-center py-2">
                            <span className="text-sm font-medium">This service will cost 2 credits</span>
                        </Badge>

                        <Button onClick={handleProcess} disabled={!previewUrl || loading} className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            {isProcessing ? "Processing..." : "Process Image"}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
