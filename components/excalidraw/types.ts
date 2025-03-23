// Main component props
export interface ExcalidrawWrapperProps {
  height?: string | number;
  width?: string | number;
  className?: string;
  defaultDrawingId?: string;
}

// File handling types
export interface FileData {
  dataURL: string;
  name: string;
  mimeType: string;
}

// BinaryFileData from Excalidraw library
export interface BinaryFileData {
  dataURL: string;
  mimeType: string;
  id?: string;
  created?: number;
}

export interface FilesMap {
  [key: string]: FileData | File;
}

// BinaryFiles from Excalidraw library
export interface BinaryFiles {
  [key: string]: BinaryFileData;
}

export interface StorageFilesMap {
  [key: string]: FileData;
}

import type { ExcalidrawImperativeAPI as ExcalidrawAPI } from "@excalidraw/excalidraw/types";
export type { ExcalidrawAPI };

// Use literal type instead of importing Theme
export type Theme = "light" | "dark";

export interface Drawing {
  id: string;
  name: string;
  elements: string;
  appState?: string;
  files?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingListItem {
  id: string;
  name: string;
}
