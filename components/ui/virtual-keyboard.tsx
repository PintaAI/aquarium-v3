import { FC, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface VirtualKeyboardProps {
  onInputChange: (value: string) => void;
  userInput: string;
  gameStarted: boolean;
  gameOver: boolean;
  keyLayout?: string[][];
}

export const VirtualKeyboard: FC<VirtualKeyboardProps> = ({
  onInputChange,
  userInput,
  gameStarted,
  gameOver,
  keyLayout,
}) => {
  const defaultKeyLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '-', '⌫'],
    ['space'],
  ];

  const rows = keyLayout || defaultKeyLayout;

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!gameStarted || gameOver) return;

      if (key === '⌫') {
        onInputChange(userInput.slice(0, -1));
      } else if (key === 'space') {
        onInputChange(userInput + ' ');
      } else {
        onInputChange(userInput + key);
      }
    },
    [gameStarted, gameOver, onInputChange, userInput]
  );

  const renderKey = (key: string) => {
    const isSpecialKey = ['⌫', 'space'].includes(key);
    
    let keyWidth = 'w-8'; // Reduced from w-10
    let keyLabel = key;
    
    if (key === 'space') {
      keyWidth = 'w-32'; // Reduced from w-48
      keyLabel = '␣ Space';
    } else if (key === '⌫') {
      keyWidth = 'w-12'; // Reduced from w-16
      keyLabel = '⌫ Del';
    }

    return (
      <Button
        key={key}
        variant="outline"
        className={`
          ${keyWidth}
          h-9
          px-1
          rounded-lg
          font-medium
          text-xs
          transition-all
          duration-200
          ${isSpecialKey ? 'text-muted-foreground font-semibold' : ''}
          ${!gameStarted || gameOver ? 'opacity-50 cursor-not-allowed' : ''}
          hover:bg-secondary/80
          active:scale-95
          select-none
        `}
        onClick={() => handleKeyPress(key)}
        disabled={!gameStarted || gameOver}
        role="key"
      >
        {keyLabel}
      </Button>
    );
  };

  return (
    <div className="bg-background/95 backdrop-blur-lg border rounded-xl shadow-lg p-2">
      <div className="flex flex-col gap-1 max-w-xl mx-auto">
        {rows.map((row, i) => (
          <div 
            key={i} 
            className={`
              flex justify-center gap-1
              ${i === 1 ? 'ml-3' : ''} 
              ${i === 2 ? 'ml-1.5' : ''}
            `}
          >
            {row.map(renderKey)}
          </div>
        ))}
      </div>
    </div>
  );
};
