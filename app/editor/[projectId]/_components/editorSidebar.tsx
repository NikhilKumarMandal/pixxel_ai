"use client";

import {
    Crop,
    Expand,
    Sliders,
    Palette,
    Text,
    X,
} from "lucide-react";
import { useCanvas } from "@/context/context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import CropImage from "./_tools/crop";
import ResizeImage from "./_tools/resize";
import AdjustImage from "./_tools/adjust";
import TextControls from "./_tools/text";
import BackgroundControls from "./_tools/backgroundControls";

const TOOL_CONFIGS = {
    resize: {
        title: "Resize",
        icon: Expand,
        description: "Change project dimensions",
    },
    crop: {
        title: "Crop",
        icon: Crop,
        description: "Crop and trim your image",
    },
    adjust: {
        title: "Adjust",
        icon: Sliders,
        description: "Brightness, contrast, and more (Manual saving required)",
    },
    background: {
        title: "Background",
        icon: Palette,
        description: "Remove or change background",
    },
    text: {
        title: "Add Text",
        icon: Text,
        description: "Customize in Various Fonts",
    },
};

type ToolId = keyof typeof TOOL_CONFIGS;

export function EditorSidebar({ project }: any) {
    const { activeTool, onToolChange } = useCanvas() as {
        activeTool: ToolId | null;
        onToolChange: (tool: ToolId | null) => void;
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const isMobileDevice = window.innerWidth < 768;
        setIsMobile(isMobileDevice);

        if (isMobileDevice && activeTool !== null) {
            onToolChange(null);
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);



    const toolConfig = activeTool ? TOOL_CONFIGS[activeTool] : null;

    if (!toolConfig) {
        return null;
    }

    const Icon = toolConfig.icon;

    return (
        <>
            {/* Optional backdrop overlay for mobile */}
            {isMobile && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => onToolChange(null)} />
            )}

            {/* Sidebar container */}
            <div
                className={`
          z-50 bg-[#0f0f0f] border-t border-slate-800
          md:border-r md:border-t-0 md:min-w-96 md:w-[25vw] md:static md:flex md:flex-col
          fixed bottom-0 left-0 right-0 rounded-t-lg md:rounded-none
          overflow-hidden flex flex-col scrollbar-minimal
        `}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-white" />
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {toolConfig.title}
                            </h2>
                            <p className="text-sm text-white/70 mt-1">
                                {toolConfig.description}
                            </p>
                        </div>
                    </div>

                    {/* Close button on mobile */}
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToolChange(null)}
                            className="text-white hover:text-gray-300"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Tool content */}
                <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? "max-h-[55vh]" : ""}`}>
                    {activeTool && renderToolContent(activeTool, project)}
                </div>
            </div>
        </>
    );
}

function renderToolContent(activeTool: ToolId, project: any) {
    switch (activeTool) {
        case "crop":
            return <CropImage />;
        case "resize":
            return <ResizeImage project={project} />;
        case "adjust":
            return <AdjustImage />;
        case "text":
            return <TextControls />;
        case "background":
            return <BackgroundControls project={project} />;
        default:
            return <div className="text-white">Select a tool to get started</div>;
    }
}