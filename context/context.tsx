import { createContext, useContext } from "react";

type CanvasEditorType = any;

type CanvasContextType = {
    canvasEditor: CanvasEditorType | null;
    setCanvasEditor: React.Dispatch<React.SetStateAction<CanvasEditorType | null>>;
    activeTool: string;
    onToolChange: (tool: string) => void;
    processingMessage: string | null;
    setProcessingMessage: React.Dispatch<React.SetStateAction<string | null>>;
};

export const CanvasContext = createContext<CanvasContextType | null>(null);

export const useCanvas = () => {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error("useCanvas must be used within a CanvasProvider");
    }
    return context;
};