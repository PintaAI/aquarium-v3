import React from 'react';
import { GridCell } from '../types';
import { Card } from "@/components/ui/card";

interface GameBoardProps {
  grid: GridCell[][];
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
}

export function GameBoard({ grid, onMouseDown, onMouseEnter, onMouseUp }: GameBoardProps) {
  const gridSize = grid.length;
  
  return (
    <Card className="p-1 sm:p-2 w-full max-w-[600px] mx-auto overflow-hidden shadow-md">
      <div 
        className="select-none bg-card w-full overflow-hidden rounded-sm"
        style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1/1',
          gap: 1
        }}
        onMouseLeave={onMouseUp}
      >
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                flex items-center justify-center font-bold rounded-sm transition-colors
                ${cell.selected 
                  ? 'bg-primary text-primary-foreground' 
                  : cell.used 
                    ? 'bg-secondary/20 text-secondary-foreground opacity-50' 
                    : cell.hint 
                      ? 'bg-accent text-accent-foreground animate-pulse' 
                      : 'bg-muted hover:bg-muted/80'}
              `}
              style={{
                fontSize: `calc(16px - ${Math.min(gridSize - 8, 6)}px)`,
                touchAction: 'none' // Prevents scrolling on touch devices
              }}
              onMouseDown={() => onMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
              onMouseUp={onMouseUp}
              onTouchStart={() => onMouseDown(rowIndex, colIndex)}
              onTouchMove={(e) => {
                // Get touch position
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                
                // Find the cell coordinates from the element's key
                const key = element?.getAttribute('data-key');
                if (key) {
                  const [r, c] = key.split('-').map(Number);
                  if (r !== rowIndex || c !== colIndex) {
                    onMouseEnter(r, c);
                  }
                }
              }}
              onTouchEnd={onMouseUp}
              data-key={`${rowIndex}-${colIndex}`}
            >
              {cell.char}
            </div>
          ))
        ))}
      </div>
    </Card>
  );
}
