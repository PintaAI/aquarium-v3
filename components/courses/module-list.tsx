'use client'

import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useOptimistic, useTransition } from "react";
import { reorderModules } from "@/app/actions/module-actions";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModuleCard } from "@/components/card/module-card";

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

interface ModuleListProps {
  modules: Module[];
  courseId: number;
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
        courseId,
        items.map((module) => module.id)
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
                    draggableId={String(module.id)}
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
