"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon } from "lucide-react"

export default function ImageUploadPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFileSelect(files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileSelect(files[0])
        }
    }

    const clearSelection = () => {
        setSelectedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
    }

    const handleUpload = () => {
        if (selectedFile) {
            console.log("Uploading file:", selectedFile.name)
            alert(`File "${selectedFile.name}" ready to upload!`)
        }
    }

    return (
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#2a2a2a] text-[#a0a0a0]">
                <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-foreground mb-2">Upload Image</h1>
                        <p className="text-muted-foreground text-sm">Select an image file to upload</p>
                    </div>

                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {previewUrl ? (
                            <div className="space-y-4">
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
                                        onClick={clearSelection}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                            </div>
                        ) : (
                            <label className="cursor-pointer block space-y-4">
                                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                                <div>
                                    <p className="text-foreground font-medium">Drop your image here</p>
                                    <p className="text-sm text-muted-foreground">or click to browse</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <Button onClick={handleUpload} disabled={!selectedFile} className="w-full" size="lg">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
