import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Trash2, Edit, Copy, MoreHorizontal, Calendar, Clock } from "lucide-react";
import { getRelativeTime } from "@/lib/date-utils";
import type { DrawingListItem } from "../types";

interface DrawingCardProps {
  drawing: DrawingListItem;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate: (id: string, newName: string) => void;
  isSelected?: boolean;
}

export function DrawingCard({
  drawing,
  onOpen,
  onDelete,
  onRename,
  onDuplicate,
  isSelected = false,
}: DrawingCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(drawing.name);
  const [duplicateName, setDuplicateName] = useState(`${drawing.name} (Copy)`);

  const handleRename = () => {
    if (newName.trim() && newName !== drawing.name) {
      onRename(drawing.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleDuplicate = () => {
    if (duplicateName.trim()) {
      onDuplicate(drawing.id, duplicateName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewName(drawing.name);
      setIsRenaming(false);
    }
  };

  return (
    <Card className={`group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-primary/50 hover:-translate-y-1 ${isSelected ? "ring-2 ring-primary" : ""}`}>
      {/* Gradient Header with Icon */}
      <div className="relative h-24 w-full overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20">
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/20 rounded-full blur-2xl" />
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Edit className="h-8 w-8 text-primary/40 group-hover:text-primary/60 transition-colors -translate-y-1" />
            </div>
          </div>
        </div>
        
        {/* Actions Menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(drawing.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Buka
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Ubah Nama
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById(`duplicate-${drawing.id}`)?.click()}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplikasi
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => document.getElementById(`delete-${drawing.id}`)?.click()}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm font-medium mb-3"
            autoFocus
          />
        ) : (
          <h3 className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
            {drawing.name}
          </h3>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3" />
          <span>Dibuat {getRelativeTime(drawing.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Clock className="h-3 w-3" />
          <span>Diubah {getRelativeTime(drawing.updatedAt)}</span>
        </div>
        
        {isSelected && (
          <Badge variant="secondary" className="mb-3">
            Sedang Dibuka
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpen(drawing.id)}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          Buka Gambar
        </Button>
      </CardContent>

      {/* Hidden triggers for dropdown actions */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button id={`delete-${drawing.id}`} className="hidden" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Gambar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{drawing.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(drawing.id)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button id={`duplicate-${drawing.id}`} className="hidden" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplikasi Gambar</AlertDialogTitle>
            <AlertDialogDescription>
              Masukkan nama untuk gambar duplikat:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            placeholder="Masukkan nama gambar"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate}>
              Duplikasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
