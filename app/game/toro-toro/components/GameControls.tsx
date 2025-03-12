import { Button } from "@/components/ui/button";

interface GameControlsProps {
  paused: boolean;
  onTogglePause: () => void;
}

export const GameControls = ({ paused, onTogglePause }: GameControlsProps) => (
  <Button onClick={onTogglePause} variant="secondary" className="bg-primary/10 ">
    {paused ? '▶' : '⏸'}
  </Button>
);
