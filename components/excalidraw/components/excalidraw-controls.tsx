import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilRuler, Save, } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DrawingListItem } from "../types";
import { useSession } from "next-auth/react";

interface ExcalidrawControlsProps {
  drawingName: string;
  setDrawingName: (name: string) => void;
  isSaving: boolean;
  drawings: DrawingListItem[];
  onSave: () => void;
  onDrawingSelect: (id: string) => void;
  selectedDrawingId?: string;
}

export function ExcalidrawControls({
  drawingName,
  setDrawingName,
  isSaving,
  drawings,
  onSave,
  onDrawingSelect,
  selectedDrawingId
}: ExcalidrawControlsProps) {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-2 ml-2">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-48">
          <PencilRuler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Drawing name"
            value={drawingName}
            onChange={(e) => setDrawingName(e.target.value)}
            className="w-full h-10 pl-9"
          />
        </div>
        <Button 
          onClick={onSave}
          disabled={isSaving || !session?.user}
          className="h-10"
          variant="secondary"
          size="sm"
        >
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4 " />
              Save
            </>
          )}
        </Button>
      </div>
      {session?.user && drawings.length > 0 && (
        <Select
          value={selectedDrawingId}
          onValueChange={onDrawingSelect}
        >
          <SelectTrigger className="w-[250px] h-10">
            <SelectValue placeholder="Canvas" />
          </SelectTrigger>
          <SelectContent>
            {drawings.map((drawing) => (
              <SelectItem key={drawing.id} value={drawing.id}>
                {drawing.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
