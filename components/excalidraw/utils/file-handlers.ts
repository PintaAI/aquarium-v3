import type { FilesMap, StorageFilesMap, BinaryFiles } from "../types";

/**
 * Converts a Blob to a base64 dataURL string
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to convert blob to data URL"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts a base64 dataURL string back to a Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  if (typeof dataURL !== "string") {
    throw new Error("Invalid dataURL: expected string");
  }

  const [header, data] = dataURL.split(",");
  if (!header || !data) {
    throw new Error("Invalid dataURL format");
  }

  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  
  try {
    const bstr = atob(data);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    
    return new Blob([u8arr], { type: mime });
  } catch {
    throw new Error("Failed to decode base64 data");
  }
}

/**
 * Converts Excalidraw's files to a format suitable for storage
 */
export async function convertFilesToStorage(files: FilesMap | BinaryFiles): Promise<StorageFilesMap> {
  const filesForStorage: StorageFilesMap = {};
  
  for (const [fileId, file] of Object.entries(files)) {
    // Type guard to ensure file is a File object
    if (file instanceof File) {
      try {
        const dataURL = await blobToDataURL(file);
        filesForStorage[fileId] = {
          dataURL,
          name: file.name,
          mimeType: file.type || "application/octet-stream"
        };
      } catch (error) {
        console.error(`Failed to convert file ${fileId}:`, error);
      }
    } 
    // Handle BinaryFileData
    else if ('dataURL' in file && 'mimeType' in file) {
      try {
        filesForStorage[fileId] = {
          dataURL: file.dataURL,
          // Use fileId as name if not available
          name: 'name' in file ? file.name : fileId,
          mimeType: file.mimeType
        };
      } catch (error) {
        console.error(`Failed to convert binary file ${fileId}:`, error);
      }
    }
  }
  
  return filesForStorage;
}

/**
 * Converts stored file data back to File objects for Excalidraw
 */
export function convertStorageToFiles(storedFiles: StorageFilesMap): FilesMap {
  const files: FilesMap = {};
  
  for (const [fileId, fileData] of Object.entries(storedFiles)) {
    try {
      // Type guard and validation for fileData
      if (
        !fileData ||
        typeof fileData !== "object" ||
        !("dataURL" in fileData) ||
        !("name" in fileData) ||
        !("mimeType" in fileData) ||
        typeof fileData.dataURL !== "string" ||
        typeof fileData.name !== "string" ||
        typeof fileData.mimeType !== "string"
      ) {
        console.error(`Invalid file data for ${fileId}`);
        continue;
      }

      const blob = dataURLtoBlob(fileData.dataURL);
      files[fileId] = new File([blob], fileData.name, {
        type: fileData.mimeType
      });
    } catch (error) {
      console.error(`Failed to convert stored file ${fileId}:`, error);
    }
  }
  
  return files;
}
