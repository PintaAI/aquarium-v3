"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";


const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      Loading Excalidraw...
    </div>
  ),
});

interface ExcalidrawWrapperProps {
  className?: string;
}

const ExcalidrawWrapper = ({ 
  className = "w-full h-[600px] border border-border rounded-lg" 
}: ExcalidrawWrapperProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className={className}>
      <Excalidraw theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  );
};

export default ExcalidrawWrapper;
