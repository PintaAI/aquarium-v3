import React from "react";
import { Word } from "../types";

interface FallingWordProps {
  word: Word;
  currentInput: string;
}

export const FallingWord = ({ word, currentInput }: FallingWordProps) => (
  <div
    key={word.id}
    className={`absolute px-4 py-2 rounded-lg text-center transition-colors ${
      word.highlighted ? 'bg-yellow-300 text-gray-900' : 'bg-secondary text-white dark:text-card-foreground'
    } border-2 ${word.highlighted ? 'border-yellow-300' : 'border-border'} ${word.shake ? 'shake' : ''}`}
    style={{
      left: `${word.x}px`,
      top: `${word.y}px`,
      minWidth: '20px',
      transitionDuration: '200ms'
    }}
  >
    <div className="text-base font-bold">{word.korean}</div>
    {word.highlighted && (
      <div className="text-sm mt-1">
        {word.english.slice(0, currentInput.length)}
        <span className="font-bold underline">
          {word.english.slice(currentInput.length, word.english.length)}
        </span>
      </div>
    )}
  </div>
);
