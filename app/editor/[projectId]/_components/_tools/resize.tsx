"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCanvas } from '@/context/context';
import { Expand, Link2, Link2Off, RectangleHorizontal, RectangleVertical, Square } from 'lucide-react';
import React, { useEffect, useState } from 'react'



const ASPECT_RATIOS = [
    { name: "Instagram Story", ratio: [9, 16], label: "9:16" },
    { name: "Instagram Post", ratio: [1, 1], label: "1:1" },
    { name: "Youtube Thumbnail", ratio: [16, 9], label: "16:9" },
    { name: "Portrait", ratio: [2, 3], label: "2:3" },
    { name: "Facebook Cover", ratio: [851, 315], label: "2.7:1" },
    { name: "Twitter Header", ratio: [3, 1], label: "3:1" },
];

function ResizeImage({ project }: any) {
    const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();
    const [newWidth, setNewWidth] = useState(project?.width || 800);
    const [newHeight, setNewHeight] = useState(project?.height || 600);
    const [lockAspectRatio, setLockAspectRatio] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState(null);





    // Calculate dimensions for aspect ratio based on original canvas size
    const calculateAspectRatioDimensions = (ratio: any) => {
        if (!project) return { width: project.width, height: project.height };

        const [ratioW, ratioH] = ratio;
        const originalArea = project.width * project.height;

        // Calculate new dimensions maintaining the same area approximately
        const aspectRatio = ratioW / ratioH;
        const newHeight = Math.sqrt(originalArea / aspectRatio);
        const newWidth = newHeight * aspectRatio;

        return {
            width: Math.round(newWidth),
            height: Math.round(newHeight),
        };
    };

    // Handle width change with aspect ratio lock
    const handleWidthChange = (value: any) => {
        const width = parseInt(value) || 0;
        setNewWidth(width);

        if (lockAspectRatio && project) {
            const ratio = project.height / project.width;
            setNewHeight(Math.round(width * ratio));
        }
        setSelectedPreset(null);
    };

    // Handle height change with aspect ratio lock
    const handleHeightChange = (value: any) => {
        const height = parseInt(value) || 0;
        setNewHeight(height);

        if (lockAspectRatio && project) {
            const ratio = project.width / project.height;
            setNewWidth(Math.round(height * ratio));
        }
        setSelectedPreset(null);
    };

    // Apply aspect ratio preset
    const applyAspectRatio = (aspectRatio: any) => {
        const dimensions = calculateAspectRatioDimensions(aspectRatio.ratio);
        setNewWidth(dimensions.width);
        setNewHeight(dimensions.height);
        setSelectedPreset(aspectRatio.name);
    };

    // Calculate viewport scale to fit canvas in container
    const calculateViewportScale = () => {
        const container = canvasEditor.getElement().parentNode;
        if (!container) return 1;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        const scaleX = containerWidth / newWidth;
        const scaleY = containerHeight / newHeight;
        return Math.min(scaleX, scaleY, 1);
    };

    // Apply canvas resize
    const handleApplyResize = async () => {
        if (
            !canvasEditor ||
            !project ||
            (newWidth === project.width && newHeight === project.height)
        ) {
            return;
        }

        setProcessingMessage("Resizing canvas...");

        try {
            // Resize the canvas
            canvasEditor.setWidth(newWidth);
            canvasEditor.setHeight(newHeight);

            // Calculate and apply viewport scale
            const viewportScale = calculateViewportScale();

            canvasEditor.setDimensions(
                {
                    width: newWidth * viewportScale,
                    height: newHeight * viewportScale,
                },
                { backstoreOnly: false }
            );

            canvasEditor.setZoom(viewportScale);
            canvasEditor.calcOffset();
            canvasEditor.requestRenderAll();
        } catch (error) {
            console.error("Error resizing canvas:", error);
            alert("Failed to resize canvas. Please try again.");
        } finally {
            setProcessingMessage(null);
        }
    };

    if (!canvasEditor || !project) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">Canvas not ready</p>
            </div>
        );
    }

    const hasChanges = newWidth !== project.width || newHeight !== project.height;

    return (
        <div className="space-y-6">
            {/* Current Size Display */}
            <div className="bg-slate-700/30 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Current Size</h4>
                <div className="text-xs text-white/70">
                    {project.width} × {project.height} pixels
                </div>
            </div>

            {/* Manual Size Input */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-white">Custom Size</h3>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    {/* Width Input */}
                    <div>
                        <label className="text-xs text-white/70 mb-1 block">Width</label>
                        <Input
                            type="number"
                            value={newWidth}
                            onChange={(e: any) => handleWidthChange(e.target.value)}
                            min="100"
                            max="5000"
                            className="bg-slate-700 border-white/20 text-white"
                        />
                    </div>

                    {/* Aspect Ratio Toggle Icon */}
                    <button
                        type="button"
                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                        className="h-full flex items-end pb-2 justify-center text-white/70 hover:text-white transition"
                        title={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                        aria-label={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                    >
                        {lockAspectRatio ? (
                            <Link2 className="h-5 w-5" />
                        ) : (
                            <Link2Off className="h-5 w-5" />
                        )}
                    </button>

                    {/* Height Input */}
                    <div>
                        <label className="text-xs text-white/70 mb-1 block">Height</label>
                        <Input
                            type="number"
                            value={newHeight}
                            onChange={(e) => handleHeightChange(e.target.value)}
                            min="100"
                            max="5000"
                            className="bg-slate-700 border-white/20 text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">
                        {lockAspectRatio ? "Aspect ratio locked" : "Free resize"}
                    </span>
                </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Aspect Ratios</h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {ASPECT_RATIOS.map((aspectRatio) => {
                        const dimensions = calculateAspectRatioDimensions(
                            aspectRatio.ratio
                        );
                        return (
                            <Button
                                key={aspectRatio.name}
                                variant={
                                    selectedPreset === aspectRatio.name ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => applyAspectRatio(aspectRatio)}
                                className={`justify-between h-auto py-2 ${selectedPreset === aspectRatio.name
                                    ? "bg-cyan-500 hover:bg-cyan-600"
                                    : "text-left"
                                    }`}
                            >
                                <div>
                                    <div className="font-medium">{aspectRatio.name}</div>
                                    <div className="text-xs opacity-70">
                                        {dimensions.width} × {dimensions.height} (
                                        {aspectRatio.label})
                                    </div>
                                </div>
                                {
                                    dimensions.height > dimensions.width ? (
                                        <RectangleVertical className="h-4 w-4" />
                                    ) : dimensions.width > dimensions.height ? (
                                        <RectangleHorizontal className="h-4 w-4" />
                                    ) : (
                                        <Square className="h-4 w-4" />
                                    )
                                }
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* New Size Preview */}
            {hasChanges && (
                <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-white mb-2">
                        New Size Preview
                    </h4>
                    <div className="text-xs text-white/70">
                        <div>
                            New Canvas: {newWidth} × {newHeight} pixels
                        </div>
                        <div className="text-cyan-400">
                            {newWidth > project.width || newHeight > project.height
                                ? "Canvas will be expanded"
                                : "Canvas will be cropped"}
                        </div>
                        <div className="text-white/50 mt-1">
                            Objects will maintain their current size and position
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Button */}
            <Button
                onClick={handleApplyResize}
                disabled={!Boolean(hasChanges) || Boolean(processingMessage)}
                className="w-full"
                variant="secondary"
            >
                <Expand className="h-4 w-4 mr-2" />
                Apply Resize
            </Button>

            {/* Instructions */}
            <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-white/70">
                    <strong>Resize Canvas:</strong> Changes canvas dimensions.
                    <br />
                    <strong>Aspect Ratios:</strong> Smart sizing based on your current
                    canvas.
                    <br />
                    Objects maintain their size and position.
                </p>
            </div>
        </div>
    );
}

export default ResizeImage