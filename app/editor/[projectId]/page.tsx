"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from "next/navigation";
import { CanvasContext } from "@/context/context";
import { Monitor } from "lucide-react";
import { Button } from '@/components/ui/button';
import { EditorTopBar } from './_components/editorTopbar';
import { EditorSidebar } from './_components/editorSidebar';
import CanvasEditor from './_components/canvas';

interface Project {
  id: string;
  url: string
}


function Editor() {
  const params = useParams();
  const projectId = params.projectId;

  const [project, setProject] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [canvasEditor, setCanvasEditor] = useState(null);
  const [activeTool, setActiveTool] = useState("resize");
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  // Mobile screen detection
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowMobileWarning(true);
    }
  }, []);



  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/get-project?projectId=${projectId}`);
        console.log(res);
        
        if (!res.ok) {
          throw new Error("Failed to fetch project");
        }
        const data = await res.json();
        console.log(data,"Data");
        
        if (data.error) {
          throw new Error(data.error);
        }
        setProject(data.project);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);




  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-solid"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Project Not Found
          </h1>
          <p className="text-white/70">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
  <CanvasContext.Provider
    value={{
      canvasEditor,
      setCanvasEditor,
      activeTool,
      onToolChange: setActiveTool,
      processingMessage,
      setProcessingMessage,
    }}
  >
    {/* Mobile Warning Modal */}
    {showMobileWarning && (
      <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-black/50 p-6 rounded-xl max-w-sm text-center shadow-lg border border-slate-700">
          <div className="flex flex-row items-center justify-center gap-6 mb-4">
            <Monitor className="h-12 w-12 text-cyan-400" />
            or
            {/* <img src={RotationIcon.src} alt="rorate screen" className="w-12 h-12 rotate-180" /> */}
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Desktop Recommended</h1>
          <p className="text-white/70 mb-4">
            This editor works best on a desktop or larger screen. For optimal experience, please use a desktop device.
          </p>
          <p className="text-white/50 text-sm mb-4">
            If you're on a phone or tablet, try rotating your device to landscape mode for a better view.
          </p>
          <Button
            onClick={() => {
              localStorage.setItem("dismissedMobileWarning", "true");
              setShowMobileWarning(false);
            }}
            variant="default"
          >
            Continue anyways
          </Button>
        </div>
      </div>
    )}


    <div className="flex flex-col h-screen">
      {/* Processing Message Overlay */}
      {processingMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-400 border-solid"></div>
            <div className="text-center">
              <p className="text-white font-medium">{processingMessage}</p>
              <p className="text-white/70 text-sm mt-1">
                Please wait, do not switch tabs or navigate away
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <EditorTopBar project={project} />

      {/* Main Editor Layout */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <EditorSidebar project={project} />

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-800">
          <CanvasEditor project={project} activeTool={activeTool} />
        </div>
      </div>
    </div>
    </CanvasContext.Provider>
  )
};

export default Editor;