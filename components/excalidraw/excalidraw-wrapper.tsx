"use client";

import { Excalidraw, Footer } from "@excalidraw/excalidraw";
import { useEffect } from "react";
import { ExcalidrawControls } from "./components/excalidraw-controls";
import { useExcalidraw } from "./hooks/use-excalidraw";
import { useDrawingStorage } from "./hooks/use-drawing-storage";
import type { ExcalidrawWrapperProps, Theme } from "./types";
import "@/public/css/index.css";

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({
  height,
  width,
  className,
  defaultDrawingId
}) => {
  const { excalidrawAPI, setExcalidrawAPI, theme } = useExcalidraw();

  const {
    drawingName,
    setDrawingName,
    isSaving,
    drawings,
    handleSave,
    loadDrawingById
  } = useDrawingStorage({ excalidrawAPI });

  // Load drawing if ID is provided
  useEffect(() => {
    if (defaultDrawingId && defaultDrawingId !== "_new") {
      loadDrawingById(defaultDrawingId);
    }
  }, [defaultDrawingId, loadDrawingById]);

  return (
    <div 
      className={`custom-styles h-full w-full ${className || ''}`}
      style={{ height: height || '100%', width: width || '100%' }}
    >
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        theme={theme as Theme}
      >
        <Footer>
          <ExcalidrawControls
            drawingName={drawingName}
            setDrawingName={setDrawingName}
            isSaving={isSaving}
            drawings={drawings}
            onSave={handleSave}
            onDrawingSelect={loadDrawingById}
            selectedDrawingId={defaultDrawingId}
          />
        </Footer>
      </Excalidraw>
    </div>
  );
};

export default ExcalidrawWrapper;
