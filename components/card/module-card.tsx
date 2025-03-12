'use client'

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lock, Pencil, Trash, GripVertical } from "lucide-react";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { deleteModule } from "@/app/actions/module-actions";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  duration: string;
  order: number;
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface ModuleAuthorActionsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  dragHandleProps: DraggableProvided['dragHandleProps'];
}

function ModuleAuthorActions({ onEdit, onDelete, dragHandleProps }: ModuleAuthorActionsProps) {
  return (
    <div 
      className="flex items-center gap-1 mt-2 sm:mt-0"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onEdit}
        className="hover:text-primary hover:bg-primary/10 transition-colors"
      >
        <Pencil className="h-4 w-4 transition-transform hover:scale-110" />
        <span className="sr-only">Edit module</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onDelete}
        className="hover:text-red-500 hover:bg-red-500/10 transition-colors"
      >
        <Trash className="h-4 w-4 text-red-500/80 transition-transform hover:scale-110" />
        <span className="sr-only">Delete module</span>
      </Button>
      <div
        {...dragHandleProps}
        className="cursor-move p-2 hover:bg-primary/10 rounded-md transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/70 transition-colors group-hover:text-muted-foreground" />
        <span className="sr-only">Drag to reorder</span>
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: Module;
  index: number;
  isAuthor: boolean;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export function ModuleCard({ module, index, isAuthor, provided, snapshot }: ModuleCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const {
    id,
    courseId,
    title,
    description,
    duration,
    isCompleted = false,
    isLocked = false,
  } = module;

  const handleDelete = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    const result = await deleteModule(id, courseId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Module deleted successfully",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete module",
        variant: "destructive",
      });
    }
    setIsDeleteDialogOpen(false);
  }, [id, courseId, toast, router]);

  const handleModuleClick = React.useCallback(() => {
    if (!isLocked) {
      router.push(`/courses/${courseId}/modules/${id}`);
    }
  }, [isLocked, router, courseId, id]);

  const handleEditClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/courses/${courseId}/modules/${id}/edit-module`);
  }, [router, courseId, id]);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={provided.draggableProps.style}
      className={`${snapshot.isDragging ? "opacity-50" : ""}`}
    >
      <div 
        onClick={handleModuleClick}
        className={cn(
          "relative overflow-hidden border-l-4 border-l-primary shadow hover:shadow-lg transition-all duration-300 rounded-lg border bg-card text-card-foreground group",
          !isLocked && "cursor-pointer hover:scale-[1.01] transform",
          isLocked && "opacity-80 bg-muted/50 hover:opacity-90"
        )}
        role="button"
        aria-disabled={isLocked}
        tabIndex={isLocked ? -1 : 0}
      >
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] bg-background/60 z-10">
            <Lock className="w-8 h-8 text-muted-foreground/80 animate-pulse" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <CheckCircle className="w-4 h-4 text-green-500 animate-in fade-in zoom-in duration-300" />
          </div>
        )}
        <div className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center gap-2 pl-8">
                <span 
                  className="absolute -left-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold shadow-sm group-hover:scale-110 group-hover:bg-primary/30 transition-all"
                  aria-label={`Module ${index + 1}`}
                >
                  {index + 1}
                </span>
                <h3 className="text-base font-medium line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                  {title}
                </h3>
              </div>
            </div>
            {isAuthor && (
              <ModuleAuthorActions
                onEdit={handleEditClick}
                onDelete={handleDelete}
                dragHandleProps={provided.dragHandleProps}
              />
            )}
          </div>
          <div className="px-4 pb-3 pt-2">
            <p className="text-xs text-muted-foreground/90 line-clamp-2 group-hover:text-muted-foreground transition-colors">
              {description}
            </p>
            <div className="text-xs text-muted-foreground/80 mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                {duration}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
