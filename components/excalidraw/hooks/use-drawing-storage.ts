import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { saveDrawing, loadDrawing, getUserDrawings } from "@/app/actions/drawing-actions";
import { convertFilesToStorage } from "../utils/file-handlers";
import type { DrawingListItem, ExcalidrawAPI } from "../types";

interface UseDrawingStorageProps {
  excalidrawAPI: ExcalidrawAPI | null;
}

export function useDrawingStorage({ excalidrawAPI }: UseDrawingStorageProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [drawingName, setDrawingName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [drawings, setDrawings] = useState<DrawingListItem[]>([]);

  useEffect(() => {
    const loadDrawings = async () => {
      if (session?.user) {
        try {
          const userDrawings = await getUserDrawings();
          setDrawings(userDrawings.map(d => ({ id: d.id, name: d.name })));
        } catch (error) {
          console.error("Error loading drawings:", error);
        }
      }
    };

    loadDrawings();
  }, [session?.user]);

  const handleSave = async () => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to save drawings",
        variant: "destructive",
      });
      return;
    }

    if (!drawingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your drawing",
        variant: "destructive",
      });
      return;
    }

    if (!excalidrawAPI) return;

    setIsSaving(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();
      const filesForStorage = await convertFilesToStorage(files);

      await saveDrawing(
        drawingName,
        JSON.stringify(elements),
        JSON.stringify(appState),
        JSON.stringify(filesForStorage)
      );

      toast({
        title: "Success",
        description: "Drawing saved successfully",
      });

      // Refresh drawings list after save
      const userDrawings = await getUserDrawings();
      setDrawings(userDrawings.map(d => ({ id: d.id, name: d.name })));
    } catch (error) {
      console.error("Error saving drawing:", error);
      toast({
        title: "Error",
        description: "Failed to save drawing",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadDrawingById = useCallback(async (id: string) => {
    if (!excalidrawAPI || !id) return;

    try {
      const drawing = await loadDrawing(id);
      if (drawing) {
        const elements = JSON.parse(drawing.elements);
        const savedAppState = drawing.appState ? JSON.parse(drawing.appState) : {};
        
        if (drawing.files) {
          try {
            // Parse files but don't use them for now
            // const storedFiles = JSON.parse(drawing.files);
            // const files = convertStorageToFiles(storedFiles);
            
            // Update scene with elements and appState only
            excalidrawAPI.updateScene({
              elements,
              appState: {
                ...excalidrawAPI.getAppState(),
                ...savedAppState,
                collaborators: []
              }
            });
          } catch (e) {
            console.error("Error parsing files:", e);
          }
        } else {
          excalidrawAPI.updateScene({
            elements,
            appState: {
              ...excalidrawAPI.getAppState(),
              ...savedAppState,
              collaborators: []
            }
          });
        }
        
        setDrawingName(drawing.name);
      }
    } catch (error) {
      console.error("Error loading drawing:", error);
      toast({
        title: "Error",
        description: "Failed to load drawing",
        variant: "destructive",
      });
    }
  }, [excalidrawAPI, toast]);

  return {
    drawingName,
    setDrawingName,
    isSaving,
    drawings,
    handleSave,
    loadDrawingById
  };
}
