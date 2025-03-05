"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
// Import our fixed CSS instead of the package CSS
// import "@excalidraw/excalidraw/index.css";

interface ExcalidrawWrapperProps {
  height?: string | number;
  width?: string | number;
}

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({ 
  height = "500px", 
  width = "100%" 
}) => {
  return (
    <div style={{ height, width }}>
      <Excalidraw />
    </div>
  );
};

export default ExcalidrawWrapper;
