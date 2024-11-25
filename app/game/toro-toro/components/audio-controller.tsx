'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioControllerProps {
  audioPath: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export function AudioController({ audioPath, autoPlay = true, loop = true }: AudioControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.12; // Set default volume to 12%
    }
  }, []);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio
        ref={audioRef}
        src={audioPath}
        autoPlay={autoPlay}
        loop={loop}
      />
      <button
        onClick={togglePlayback}
        className="bg-primary/20 hover:bg-primary/30 text-primary-foreground rounded-full p-2 backdrop-blur-sm transition-all"
        aria-label={isPlaying ? 'Mute music' : 'Play music'}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        )}
      </button>
    </div>
  );
}
