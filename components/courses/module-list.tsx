'use client'

import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useOptimistic, useTransition } from "react";

import { deleteModule, reorderModules } from "@/app/actions/module-actions";
import { useRouter } from "next/navigation";
import { CheckCircle, Lock, PlayCircle, Plus, Pencil, Trash, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  isCompleted?: boolean;
  isLocked?: boolean;
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
  const {
    id,
    courseId,
    title,
    description,
    duration,
    isCompleted = false,
    isLocked = false,
  } = module;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this module?')) {
      const result = await deleteModule(parseInt(id), parseInt(courseId));
      if (result.success) {
        toast({
          title: "Success",
          description: "Module deleted successfully",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete module",
          variant: "destructive",
        });
      }
    }
  };

  const handleModuleClick = () => {
    if (!isLocked) {
      router.push(`/courses/${courseId}/modules/${id}`);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/courses/${courseId}/modules/${id}/edit-module`);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={provided.draggableProps.style}
      className={`${snapshot.isDragging ? "opacity-50" : ""}`}
    >
      <div 
        onClick={handleModuleClick}
        className={`overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300 rounded-lg border bg-card text-card-foreground group ${!isLocked ? 'cursor-pointer' : ''}`}
      >
        <div className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center space-x-3">
              {isAuthor && (
                <div
                  {...provided.dragHandleProps}
                  className="cursor-move p-1 hover:bg-primary/10 rounded"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                {index + 1}
              </span>
              <div className="flex items-center gap-2">
  {isCompleted ? (
    <CheckCircle className="w-5 h-5 text-green-500" />
  ) : isLocked ? (
    <Lock className="w-5 h-5 text-muted-foreground" />
  ) : (
    <PlayCircle className="w-5 h-5 text-primary" />
  )}
                <h3 className="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
                  {title}
                </h3>
              </div>
            </div>
            {isAuthor && (
              <div 
                className="flex items-center gap-2 mt-2 sm:mt-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Button variant="ghost" size="sm" onClick={handleEditClick}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
          <div className="px-4 pb-4 pt-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
            <div className="text-sm text-muted-foreground mt-2">{duration}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModuleListProps {
  modules: Module[];
  courseId: string;
  courseAuthorId: string;
}

export function ModuleList({ modules: initialModules, courseId, courseAuthorId }: ModuleListProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === courseAuthorId;
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  // Sort modules by order initially
  const sortedModules = [...initialModules].sort((a, b) => a.order - b.order);
  const [modules, setModules] = useOptimistic(sortedModules);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !isAuthor) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    startTransition(() => {
      setModules(items);
    });

    try {
      const result = await reorderModules(
        parseInt(courseId),
        items.map((module) => parseInt(module.id))
      );

      if (!result.success) throw new Error();

      toast({
        title: "Success",
        description: "Module order updated",
      });
    } catch {
      startTransition(() => {
        setModules(sortedModules);
      });
      toast({
        title: "Error",
        description: "Failed to update module order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Course Modules</h2>
        {isAuthor && (
          <Link href={`/courses/${courseId}/create-module`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </Link>
        )}
      </div>

      {!modules?.length ? (
        <div className="text-center p-4 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No modules yet</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="modules">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {modules.map((module, index) => (
                  <Draggable
                    key={module.id}
                    draggableId={module.id.toString()}
                    index={index}
                    isDragDisabled={!isAuthor}
                  >
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <ModuleCard
                        module={module}
                        index={index}
                        isAuthor={isAuthor}
                        provided={provided}
                        snapshot={snapshot}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
