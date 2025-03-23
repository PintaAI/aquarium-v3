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

export interface FilesMap {
  [key: string]: FileData | File;
}

export interface StorageFilesMap {
  [key: string]: FileData;
}

// Re-export for easier imports from subdirectories
export * from './types';

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

export interface ExcalidrawAPI {
  updateScene: (scene: {
    elements: ExcalidrawElement[];
    appState?: ExcalidrawAppState;
    files?: FilesMap;
  }) => void;
  getSceneElements: () => ExcalidrawElement[];
  getAppState: () => ExcalidrawAppState;
  getFiles: () => FilesMap;
}

export interface ExcalidrawElement {
  id: string;
  type: 'rectangle' | 'diamond' | 'ellipse' | 'arrow' | 'draw' | 'text' | 'line';
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  opacity: number;
  x: number;
  y: number;
  [key: string]: unknown;
}

export interface ExcalidrawAppState {
  currentItemFontFamily: number;
  currentItemStrokeColor: string;
  viewBackgroundColor: string;
  currentItemBackgroundColor: string;
  currentItemFillStyle: string;
  currentItemStrokeWidth: number;
  currentItemStrokeStyle: string;
  currentItemRoughness: number;
  currentItemOpacity: number;
  currentItemFontSize: number;
  currentItemLinearStrokeSharpness: string;
  collaborators: unknown[];
  [key: string]: unknown;
}

export type ExcalidrawTheme = 'light' | 'dark';
