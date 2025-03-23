import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawAPI } from "../types";

interface UseDrawingExportProps {
  excalidrawAPI: ExcalidrawAPI | null;
  drawingName: string;
}

export function useDrawingExport({ excalidrawAPI, drawingName }: UseDrawingExportProps) {
  const { theme } = useTheme();
  const { toast } = useToast();

  const exportImage = async () => {
    if (!excalidrawAPI) return;

    try {
      const blob = await exportToBlob({
        elements: excalidrawAPI.getSceneElements(),
        appState: {
          ...excalidrawAPI.getAppState(),
          exportWithDarkMode: theme === "dark",
        },
        files: excalidrawAPI.getFiles(),
        getDimensions: () => ({ width: 1920, height: 1080 }),
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${drawingName || "drawing"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Image exported successfully",
      });
    } catch (error) {
      console.error("Error exporting image:", error);
      toast({
        title: "Error",
        description: "Failed to export image",
        variant: "destructive",
      });
    }
  };

  return { exportImage };
}
