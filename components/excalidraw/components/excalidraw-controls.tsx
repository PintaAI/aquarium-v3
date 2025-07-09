import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PencilRuler, Save, FolderOpen, FileText } from "lucide-react";
import { DrawingManagerDialog } from "./drawing-manager-dialog";
import type { DrawingListItem } from "../types";
import { useSession } from "next-auth/react";

interface ExcalidrawControlsProps {
  drawingName: string;
  setDrawingName: (name: string) => void;
  isSaving: boolean;
  drawings: DrawingListItem[];
  onSave: () => void;
  onDrawingSelect: (id: string) => void;
  onDrawingsChange: () => void;
  selectedDrawingId?: string;
}

export function ExcalidrawControls({
  drawingName,
  setDrawingName,
  isSaving,
  drawings,
  onSave,
  onDrawingSelect,
  onDrawingsChange,
  selectedDrawingId
}: ExcalidrawControlsProps) {
  const { data: session } = useSession();
  const [showManager, setShowManager] = useState(false);

  const currentDrawing = drawings.find(d => d.id === selectedDrawingId);

  return (
    <>
      <div className="flex items-center gap-2 ml-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-48">
            <PencilRuler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nama gambar"
            value={drawingName}
            onChange={(e) => setDrawingName(e.target.value)}
            className="w-full h-10 pl-9 bg-background"
          />
          </div>
          <Button 
            onClick={onSave}
            disabled={isSaving || !session?.user}
            className="h-9 p-0 m-0"
            variant="outline"
            size="sm"
          >
          {isSaving ? (
              "Menyimpan..."
            ) : (
              <>
                <Save className="h-6 w-4" />
              </>
            )}
          </Button>
        </div>

        {session?.user && (
          <div className="flex items-center gap-2">
            {currentDrawing && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">{currentDrawing.name}</Badge>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManager(true)}
              className="h-9"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Kelola Gambar
              {drawings.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {drawings.length}
                </Badge>
              )}
            </Button>
          </div>
        )}
      </div>

      <DrawingManagerDialog
        open={showManager}
        onOpenChange={setShowManager}
        drawings={drawings}
        onDrawingSelect={onDrawingSelect}
        onDrawingsChange={onDrawingsChange}
        selectedDrawingId={selectedDrawingId}
      />
    </>
  );
}
