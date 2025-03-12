import React from "react";

interface GameStatsProps {
  score: number;
  lives: number;
  level: number;
}

export const GameStats = ({ score, lives, level }: GameStatsProps) => (
  <div className="flex justify-between text-primary">
    <div className="text-xl">Score: {score}</div>
    <div className="text-xl">Lives: {Array(lives).fill('❤️').join('')}</div>
    <div className="text-xl">Level: {level}</div>
  </div>
);
