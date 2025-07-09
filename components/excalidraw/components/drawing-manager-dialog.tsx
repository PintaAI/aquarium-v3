"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Grid, List, Plus, FileText } from "lucide-react";
import { DrawingCard } from "./drawing-card";
import { useToast } from "@/hooks/use-toast";
import { deleteDrawing, renameDrawing, duplicateDrawing } from "@/app/actions/drawing-actions";
import type { DrawingListItem } from "../types";

interface DrawingManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawings: DrawingListItem[];
  onDrawingSelect: (id: string) => void;
  onDrawingsChange: () => void;
  selectedDrawingId?: string;
}

export function DrawingManagerDialog({
  open,
  onOpenChange,
  drawings,
  onDrawingSelect,
  onDrawingsChange,
  selectedDrawingId,
}: DrawingManagerDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [_isLoading, setIsLoading] = useState(false);

  const filteredDrawings = useMemo(() => {
    if (!searchQuery.trim()) return drawings;
    
    return drawings.filter(drawing =>
      drawing.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [drawings, searchQuery]);

  const handleDrawingOpen = (id: string) => {
    onDrawingSelect(id);
    onOpenChange(false);
  };

  const handleDrawingDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteDrawing(id);
      toast({
        title: "Berhasil",
        description: "Gambar berhasil dihapus",
      });
      onDrawingsChange();
    } catch (error) {
      console.error("Error deleting drawing:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus gambar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawingRename = async (id: string, newName: string) => {
    setIsLoading(true);
    try {
      await renameDrawing(id, newName);
      toast({
        title: "Berhasil",
        description: "Gambar berhasil diubah namanya",
      });
      onDrawingsChange();
    } catch (error) {
      console.error("Error renaming drawing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengubah nama gambar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawingDuplicate = async (id: string, newName: string) => {
    setIsLoading(true);
    try {
      await duplicateDrawing(id, newName);
      toast({
        title: "Berhasil",
        description: "Gambar berhasil diduplikasi",
      });
      onDrawingsChange();
    } catch (error) {
      console.error("Error duplicating drawing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menduplikasi gambar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    onDrawingSelect("_new");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Kelola Gambar
            <Badge variant="secondary" className="ml-2">
              {filteredDrawings.length} gambar
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search and Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari gambar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleCreateNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Gambar Baru
            </Button>
          </div>

          <Separator />

          {/* Drawings Grid/List with ScrollArea */}
          <ScrollArea className="flex-1">
            {filteredDrawings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "Gambar tidak ditemukan" : "Belum ada gambar"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Coba sesuaikan kata kunci pencarian"
                    : "Buat gambar pertama Anda untuk memulai"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Gambar Baru
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1"
                    : "space-y-3 p-1"
                }
              >
                {filteredDrawings.map((drawing) => (
                  <DrawingCard
                    key={drawing.id}
                    drawing={drawing}
                    onOpen={handleDrawingOpen}
                    onDelete={handleDrawingDelete}
                    onRename={handleDrawingRename}
                    onDuplicate={handleDrawingDuplicate}
                    isSelected={selectedDrawingId === drawing.id}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
