"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
// Import our fixed CSS instead of the package CSS
import "@/public/css/index.css";

interface ExcalidrawWrapperProps {
  height?: string | number;
  width?: string | number;
  className?: string;
}

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({ 
  height,
  width,
  className
}) => {
  const { theme } = useTheme();

  return (
    <div className={`custom-styles h-full w-full ${className || ''}`}>
      <div className="h-full w-full" style={{ height, width }}>
        <Excalidraw theme={theme === "dark" ? "dark" : "light"} />
      </div>
    </div>
  );
};

export default ExcalidrawWrapper;
