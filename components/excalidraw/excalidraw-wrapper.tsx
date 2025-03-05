"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
// Import our fixed CSS instead of the package CSS
import "@/public/css/index.css";

interface ExcalidrawWrapperProps {
  height?: string | number;
  width?: string | number;
}

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({ 
  height = "500px", 
  width = "100%" 
}) => {
  const { theme } = useTheme();

  return (
    <div className="custom-styles">
      <div style={{ height, width }}>
        <Excalidraw theme={theme === "dark" ? "dark" : "light"} />
      </div>
    </div>
  );
};

export default ExcalidrawWrapper;
