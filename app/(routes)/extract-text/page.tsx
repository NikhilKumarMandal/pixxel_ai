"use client"

import type React from "react"
import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileImage, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"


export default function ImageTextExtractor() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [extractedText, setExtractedText] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)
    const toastId = useId();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            setExtractedText("") // Clear previous results
        } else {
            toast.error("Please select a valid image file.",{id:toastId})
        }
    }

    const processImage = async () => {
        if (!selectedImage) return

        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append("image", selectedImage)

            const response = await fetch("/api/extract-text", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Failed to extract text")
            }

            const data = await response.json()
            setExtractedText(data.text || "No text found in the image.")
            setSelectedImage(null)
            toast.success("Text extracted successfully!",{id: toastId})
        } catch (error) {
            console.error("Error processing image:", error)
            toast.error("Failed to extract text from the image. Please try again.",{id:toastId})
        } finally {
            setIsProcessing(false)
        }
    }

    const copyToClipboard = async () => {
        if (!extractedText) return

        try {
            await navigator.clipboard.writeText(extractedText)
            toast.success("Copied to clipboard!", { id: toastId });
        } catch (error) {
            console.error("Failed to copy text:", error)
            toast.error("Copy failed", { id: toastId });
        }
    }

    return (
        <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-balance">Image Text Extractor</h1>
                    <p className="text-muted-foreground text-pretty">
                        Upload an image and extract all text content using OCR technology
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upload Section */}
                    <Card className="bg-[#2a2a2a] text-[#a0a0a0]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Image
                            </CardTitle>
                            <CardDescription>Select an image file to extract text from</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Preview"
                                            className="max-h-full max-w-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileImage className="w-10 h-10 mb-3 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, GIF, WebP</p>
                                        </div>
                                    )}
                                    <input
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>

                            <Button onClick={processImage} disabled={!selectedImage || isProcessing} className="w-full">
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Process Image"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    <Card className="bg-[#2a2a2a] text-[#a0a0a0]">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Extracted Text</span>
                                {extractedText && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 bg-transparent"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription>Text content extracted from your image</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {extractedText ? (
                                <div className="space-y-4">
                                    <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap text-sm font-mono text-black">{extractedText}</pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    <p>Upload and process an image to see extracted text here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
