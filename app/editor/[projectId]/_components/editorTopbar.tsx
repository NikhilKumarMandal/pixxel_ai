"use client";

import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    RotateCcw,
    RotateCw,
    Crop,
    Expand,
    Sliders,
    Palette,
    ChevronDown,
    RefreshCcw,
    Loader2,
    Download,
    FileImage,
    TypeOutline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";
import { toast } from "sonner";

const TOOLS = [
    {
        id: "resize",
        label: "Resize",
        icon: Expand,
        isActive: true,
        proOnly: false,
    },
    {
        id: "crop",
        label: "Crop",
        icon: Crop,
        proOnly: false,
    },
    {
        id: "adjust",
        label: "Adjust",
        icon: Sliders,
        proOnly: false,
    },
    {
        id: "text",
        label: "Text",
        icon: TypeOutline,
        proOnly: false,
    },
    {
        id: "background",
        label: "AI Background",
        icon: Palette,
        proOnly: true,
    }
] as const;

type ToolId = (typeof TOOLS[number]["id"]);

const EXPORT_FORMATS = [
    { format: "PNG", quality: 1.0, label: "PNG (High Quality)", extension: "png" },
    { format: "JPEG", quality: 0.9, label: "JPEG (90% Quality)", extension: "jpg" },
    { format: "JPEG", quality: 0.8, label: "JPEG (80% Quality)", extension: "jpg" },
    { format: "WEBP", quality: 0.9, label: "WebP (90% Quality)", extension: "webp" },
];

export function EditorTopBar({ project }: any) {
    const router = useRouter();
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState(null);

    // Undo/Redo state
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);
    const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

    const { activeTool, onToolChange, canvasEditor } = useCanvas();;

    // Save canvas state to undo stack
    const saveToUndoStack = () => {
        if (!canvasEditor || isUndoRedoOperation) return;

        const canvasState = JSON.stringify(canvasEditor.toJSON());

        setUndoStack((prev) => {
            const newStack = [...prev, canvasState];
            // Limit undo stack to 20 items to prevent memory issues
            if (newStack.length > 20) {
                newStack.shift();
            }
            return newStack;
        });

        // Clear redo stack when new action is performed
        setRedoStack([]);
    };

    // Setup undo/redo listeners
    useEffect(() => {
        if (!canvasEditor) return;

        // Save initial state
        setTimeout(() => {
            if (canvasEditor && !isUndoRedoOperation) {
                const initialState = JSON.stringify(canvasEditor.toJSON());
                setUndoStack([initialState]);
            }
        }, 1000);

        const handleCanvasModified = () => {
            if (!isUndoRedoOperation) {
                // Debounce state saving to avoid too many saves
                setTimeout(() => {
                    if (!isUndoRedoOperation) {
                        saveToUndoStack();
                    }
                }, 500);
            }
        };

        // Listen to canvas events that should trigger state save
        canvasEditor.on("object:modified", handleCanvasModified);
        canvasEditor.on("object:added", handleCanvasModified);
        canvasEditor.on("object:removed", handleCanvasModified);
        canvasEditor.on("path:created", handleCanvasModified);

        return () => {
            canvasEditor.off("object:modified", handleCanvasModified);
            canvasEditor.off("object:added", handleCanvasModified);
            canvasEditor.off("object:removed", handleCanvasModified);
            canvasEditor.off("path:created", handleCanvasModified);
        };
    }, [canvasEditor, isUndoRedoOperation]);

    // Undo function
    const handleUndo = async () => {
        if (!canvasEditor || undoStack.length <= 1) return;

        setIsUndoRedoOperation(true);

        try {
            // Move current state to redo stack
            const currentState = JSON.stringify(canvasEditor.toJSON());
            setRedoStack((prev) => [...prev, currentState]);

            // Remove last state from undo stack and apply the previous one
            const newUndoStack = [...undoStack];
            newUndoStack.pop(); // Remove current state
            const previousState = newUndoStack[newUndoStack.length - 1];

            if (previousState) {
                await canvasEditor.loadFromJSON(JSON.parse(previousState));
                canvasEditor.requestRenderAll();
                setUndoStack(newUndoStack);
                toast.success("Undid last action");
            }
        } catch (error) {
            console.error("Error during undo:", error);
            toast.error("Failed to undo action");
        } finally {
            setTimeout(() => setIsUndoRedoOperation(false), 100);
        }
    };

    // Redo function
    const handleRedo = async () => {
        if (!canvasEditor || redoStack.length === 0) return;

        setIsUndoRedoOperation(true);

        try {
            // Get the latest state from redo stack
            const newRedoStack = [...redoStack];
            const nextState = newRedoStack.pop();

            if (nextState) {
                // Save current state to undo stack
                const currentState = JSON.stringify(canvasEditor.toJSON());
                setUndoStack((prev) => [...prev, currentState]);

                // Apply the redo state
                await canvasEditor.loadFromJSON(JSON.parse(nextState));
                canvasEditor.requestRenderAll();
                setRedoStack(newRedoStack);
                toast.success("Redid last action");
            }
        } catch (error) {
            console.error("Error during redo:", error);
            toast.error("Failed to redo action");
        } finally {
            setTimeout(() => setIsUndoRedoOperation(false), 100);
        }
    };

    const handleBackToDashboard = () => {
        router.push("/upload-image");
    };


    // Export canvas as image
    const handleExport = async (exportConfig: any) => {
        if (!canvasEditor || !project) {
            toast.error("Canvas not ready for export");
            return;
        }

        setIsExporting(true);
        setExportFormat(exportConfig.format);

        try {
            // Store current canvas state for restoration
            const currentZoom = canvasEditor.getZoom();
            const currentViewportTransform = [...canvasEditor.viewportTransform];

            // Reset zoom and viewport for accurate export
            canvasEditor.setZoom(1);
            canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvasEditor.setDimensions({
                width: project.width,
                height: project.height,
            });
            canvasEditor.requestRenderAll();

            // Export the canvas
            const dataURL = canvasEditor.toDataURL({
                format: exportConfig.format.toLowerCase(),
                quality: exportConfig.quality,
                multiplier: 1,
            });

            // Restore original canvas state
            canvasEditor.setZoom(currentZoom);
            canvasEditor.setViewportTransform(currentViewportTransform);
            canvasEditor.setDimensions({
                width: project.width * currentZoom,
                height: project.height * currentZoom,
            });
            canvasEditor.requestRenderAll();

            // Download the image
            const link = document.createElement("a");
            link.download = `${project.title}.${exportConfig.extension}`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Image exported as ${exportConfig.format}!`);
        } catch (error) {
            console.error("Error exporting image:", error);
            toast.error("Failed to export image. Please try again.");
        } finally {
            setIsExporting(false);
            setExportFormat(null);
        }
    };

    // Check if undo/redo is available
    const canUndo = undoStack.length > 1;
    const canRedo = redoStack.length > 0;


    const handleToolChange = (toolId: any) => {
        onToolChange(toolId);
    };


    return (
        <>
            <div className="border-b px-4 py-3 bg-[#1a1a1a] text-[#e0e0e0]">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                    {/* Left: Back button and project name */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToDashboard}
                            className="text-white hover:text-gray-300"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline text-primary">Back</span>
                        </Button>
                    </div>

                    <h1 className="font-extrabold capitalize text-white text-lg text-center">{project.title}</h1>

                    <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">



                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isExporting || !canvasEditor}
                                    className="gap-2 text-sm"
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="hidden sm:inline">Exporting {exportFormat}...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            <span className="hidden sm:inline">Export</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-64 bg-black/70 border-slate-700 backdrop-blur-xs"
                            >
                                <div className="px-3 py-2 text-sm text-white/70">
                                    Export Resolution: {project.width} × {project.height}px
                                </div>
                                <DropdownMenuSeparator className="bg-slate-700" />

                                {EXPORT_FORMATS.map((config, index) => (
                                    <DropdownMenuItem
                                        key={index}
                                        onClick={() => handleExport(config)}
                                        className="text-white hover:bg-slate-700 cursor-pointer flex items-center gap-2 pt-4"
                                    >
                                        <FileImage className="h-4 w-4 text-foreground" />
                                        <div className="flex-1">
                                            <div className="font-medium">{config.label}</div>
                                            <div className="text-xs text-white/50">
                                                {config.format} • {Math.round(config.quality * 100)}% quality
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Tools Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Tools: Scrollable row with spaced buttons */}
                    <div
                        className="flex w-full items-center justify-around sm:justify-start gap-2 overflow-x-auto pb-2 sm:overflow-visible"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        {TOOLS.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = activeTool === tool.id;

                            return (
                                <Button
                                    key={tool.id}
                                    variant={ "default"}
                                    size="sm"
                                    onClick={() => handleToolChange(tool.id)}
                                    className={`gap-2 whitespace-nowrap text-sm px-3 py-2 ${isActive
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "text-white hover:text-gray-300 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{tool.label}</span>
                                
                                </Button>
                            );
                        })}
                    </div>

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`text-white ${!canUndo ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-700"}`}
                            onClick={handleUndo}
                            disabled={!canUndo || isUndoRedoOperation}
                            title={`Undo (${undoStack.length - 1} actions available)`}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`text-white ${!canRedo ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-700"}`}
                            onClick={handleRedo}
                            disabled={!canRedo || isUndoRedoOperation}
                            title={`Redo (${redoStack.length} actions available)`}
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}