"use client";

import { useState } from "react";
import ExcalidrawWrapper from "./excalidraw-wrapper";
import { Button } from "@/components/ui/button";
import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types/types";

const ExampleApp = () => {
  const [viewMode, setViewMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [gridMode, setGridMode] = useState(true);
  const [readOnly, setReadOnly] = useState(false);

  // Example initial data with a simple rectangle
  const initialData: ExcalidrawInitialDataState = {
    elements: [
      {
        type: "rectangle",
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        angle: 0,
        strokeColor: "#000000",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 1,
        version: 1,
        versionNonce: 1,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        id: "1",
      }
    ],
    appState: {
      viewBackgroundColor: "#ffffff",
    },
    scrollToContent: true
  };

  const handleSave = (elements: any[], appState: any) => {
    console.log("Saving drawing...", { elements, appState });
    // Here you can implement saving to localStorage, server, etc.
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-2 p-2 bg-background border-b">
        <Button
          variant={viewMode ? "default" : "outline"}
          onClick={() => setViewMode(!viewMode)}
        >
          View Mode
        </Button>
        <Button
          variant={zenMode ? "default" : "outline"}
          onClick={() => setZenMode(!zenMode)}
        >
          Zen Mode
        </Button>
        <Button
          variant={gridMode ? "default" : "outline"}
          onClick={() => setGridMode(!gridMode)}
        >
          Grid Mode
        </Button>
        <Button
          variant={readOnly ? "default" : "outline"}
          onClick={() => setReadOnly(!readOnly)}
        >
          Read Only
        </Button>
      </div>
      <div className="flex-1">
        <ExcalidrawWrapper
          initialData={initialData}
          onSave={handleSave}
          viewModeEnabled={viewMode}
          zenModeEnabled={zenMode}
          gridModeEnabled={gridMode}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default ExampleApp;
