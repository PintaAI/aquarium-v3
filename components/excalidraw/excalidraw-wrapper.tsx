"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback,} from "react";
import Link from "next/link";
import type {
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types/types";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

interface ExcalidrawWrapperProps {
  initialData?: ExcalidrawInitialDataState;
  onSave?: (elements: any[], appState: any) => void;
  readOnly?: boolean;
  zenModeEnabled?: boolean;
  gridModeEnabled?: boolean;
  viewModeEnabled?: boolean;
}

const defaultUIOptions: ExcalidrawProps["UIOptions"] = {
  canvasActions: {
    loadScene: true,
    saveAsImage: true,
    saveToActiveFile: false,
    changeViewBackgroundColor: true,
    toggleTheme: true,
    clearCanvas: true,
  },
};

const ExcalidrawWrapper = ({
  initialData,
  onSave,
  readOnly = false,
  zenModeEnabled = false,
  gridModeEnabled = false,
  viewModeEnabled = false,
}: ExcalidrawWrapperProps) => {
  const { theme } = useTheme();
  const handleChange = useCallback(
    (elements: readonly any[], appState: any) => {
      if (onSave) {
        const serializedElements = JSON.parse(JSON.stringify(elements));
        onSave(serializedElements, appState);
      }
    },
    [onSave]
  );

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <Excalidraw
          theme={theme === "dark" ? "dark" : "light"}
          initialData={initialData}
          onChange={handleChange}
          UIOptions={defaultUIOptions}
          renderTopRightUI={() => (
            <Link href="/">
              <img
                src="/images/circle-logo.png"
                alt="Pejuangkorea Academy"
                className="w-9 h-9 opacity-80 hover:opacity-100 transition-opacity m-0.5"
              />
            </Link>
          )}
          viewModeEnabled={viewModeEnabled}
          zenModeEnabled={zenModeEnabled}
          gridModeEnabled={gridModeEnabled}
        />
      </div>
    </div>
  );
};

export default ExcalidrawWrapper;
