import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { saveDrawing, loadDrawing, getUserDrawings } from "@/app/actions/drawing-actions";
import { convertFilesToStorage, convertStorageToFiles } from "../utils/file-handlers";
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
  const [currentDrawingId, setCurrentDrawingId] = useState<string | undefined>();

  useEffect(() => {
    const loadDrawings = async () => {
      if (session?.user) {
        try {
          const userDrawings = await getUserDrawings();
          setDrawings(userDrawings.map(d => ({ 
            id: d.id, 
            name: d.name, 
            createdAt: d.createdAt, 
            updatedAt: d.updatedAt 
          })));
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
      setDrawings(userDrawings.map(d => ({ 
        id: d.id, 
        name: d.name, 
        createdAt: d.createdAt, 
        updatedAt: d.updatedAt 
      })));
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
    if (!excalidrawAPI) return;

    if (id === "_new") {
      // Create new drawing
      excalidrawAPI.updateScene({
        elements: [],
        appState: {
          ...excalidrawAPI.getAppState(),
          collaborators: new Map()
        }
      });
      setDrawingName("");
      setCurrentDrawingId(undefined);
      return;
    }

    try {
      const drawing = await loadDrawing(id);
      if (drawing) {
        const elements = JSON.parse(drawing.elements);
        const savedAppState = drawing.appState ? JSON.parse(drawing.appState) : {};
        
        // Prepare the update object
        const updateData: any = {
          elements,
          appState: {
            ...excalidrawAPI.getAppState(),
            ...savedAppState,
            collaborators: new Map()
          }
        };

        // Handle files if they exist
        if (drawing.files) {
          try {
            const storedFiles = JSON.parse(drawing.files);
            const files = await convertStorageToFiles(storedFiles);
            excalidrawAPI.addFiles(Object.values(files));
            updateData.files = files;
          } catch (e) {
            console.error("Error parsing or converting files:", e);
            // Continue without files if there's an error
          }
        }
        
        // Update the scene with elements, appState, and files (if available)
        excalidrawAPI.updateScene(updateData);
        
        setDrawingName(drawing.name);
        setCurrentDrawingId(id);
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

  const refreshDrawings = useCallback(async () => {
    if (session?.user) {
      try {
        const userDrawings = await getUserDrawings();
        setDrawings(userDrawings.map(d => ({ 
          id: d.id, 
          name: d.name, 
          createdAt: d.createdAt, 
          updatedAt: d.updatedAt 
        })));
      } catch (error) {
        console.error("Error loading drawings:", error);
      }
    }
  }, [session?.user]);

  return {
    drawingName,
    setDrawingName,
    isSaving,
    drawings,
    currentDrawingId,
    handleSave,
    loadDrawingById,
    refreshDrawings
  };
}
