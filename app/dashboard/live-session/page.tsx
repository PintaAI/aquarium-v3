"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function LiveSessionPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodo,
        completed: false,
      },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Live Session To-Do List</h1>
      
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <Button onClick={addTodo}>Add</Button>
      </div>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleTodo(todo.id)}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-4 h-4"
              />
              <span className={todo.completed ? "line-through text-gray-500" : ""}>
                {todo.text}
              </span>
            </div>
            <Badge variant={todo.completed ? "secondary" : "default"}>
              {todo.completed ? "Completed" : "Pending"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
