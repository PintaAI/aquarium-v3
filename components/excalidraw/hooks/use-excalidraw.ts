import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import type { ExcalidrawAPI } from "../types";

export function useExcalidraw() {
  const { theme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);

  useEffect(() => {
    const initializeScene = async () => {
      if (!excalidrawAPI) return;

      // Start with a fresh scene
      excalidrawAPI.updateScene({
        elements: [],
        appState: {
          currentItemFontFamily: 1,
          currentItemStrokeColor: "#000000",
          viewBackgroundColor: "#ffffff",
          currentItemBackgroundColor: "transparent",
          currentItemFillStyle: "hatch",
          currentItemStrokeWidth: 1,
          currentItemStrokeStyle: "solid",
          currentItemRoughness: 1,
          currentItemOpacity: 100,
          currentItemFontSize: 20,
          currentItemLinearStrokeSharpness: "round",
          collaborators: [],
        }
      });
    };

    initializeScene();
  }, [excalidrawAPI]);

  return {
    excalidrawAPI,
    setExcalidrawAPI,
    theme: theme === "dark" ? "dark" : "light" as const
  };
}
