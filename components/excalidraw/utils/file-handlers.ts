import type { FilesMap, StorageFilesMap, BinaryFiles } from "../types";
import { uploadImage } from "@/app/actions/upload-image";

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
 * Uploads file to Cloudinary and returns URL
 */
export async function uploadFileToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const cloudinaryUrl = await uploadImage(formData);
    return cloudinaryUrl;
  } catch (error) {
    console.error('Failed to upload file to Cloudinary:', error);
    throw error;
  }
}

/**
 * Converts Excalidraw's files to a format suitable for storage
 * Now uploads images to Cloudinary instead of storing as base64
 */
export async function convertFilesToStorage(files: FilesMap | BinaryFiles): Promise<StorageFilesMap> {
  const filesForStorage: StorageFilesMap = {};
  
  for (const [fileId, file] of Object.entries(files)) {
    // Type guard to ensure file is a File object
    if (file instanceof File) {
      try {
        // Upload to Cloudinary and get URL
        const cloudinaryUrl = await uploadFileToCloudinary(file);
        filesForStorage[fileId] = {
          dataURL: cloudinaryUrl, // Store Cloudinary URL instead of base64
          name: file.name,
          mimeType: file.type || "application/octet-stream"
        };
      } catch (error) {
        console.error(`Failed to upload file ${fileId} to Cloudinary:`, error);
        // Fallback to base64 if Cloudinary upload fails
        try {
          const dataURL = await blobToDataURL(file);
          filesForStorage[fileId] = {
            dataURL,
            name: file.name,
            mimeType: file.type || "application/octet-stream"
          };
        } catch (fallbackError) {
          console.error(`Failed to convert file ${fileId} to base64:`, fallbackError);
        }
      }
    } 
    // Handle BinaryFileData
    else if ('dataURL' in file && 'mimeType' in file) {
      try {
        // If it's already a URL (starts with http), keep it as is
        if (file.dataURL.startsWith('http')) {
          filesForStorage[fileId] = {
            dataURL: file.dataURL,
            name: 'name' in file ? file.name : fileId,
            mimeType: file.mimeType
          };
        } else {
          // If it's base64, try to upload to Cloudinary
          try {
            const blob = dataURLtoBlob(file.dataURL);
            const uploadFile = new File([blob], 'name' in file ? file.name : fileId, {
              type: file.mimeType
            });
            const cloudinaryUrl = await uploadFileToCloudinary(uploadFile);
            filesForStorage[fileId] = {
              dataURL: cloudinaryUrl,
              name: 'name' in file ? file.name : fileId,
              mimeType: file.mimeType
            };
          } catch (uploadError) {
            console.error(`Failed to upload binary file ${fileId} to Cloudinary:`, uploadError);
            // Fallback to original base64
            filesForStorage[fileId] = {
              dataURL: file.dataURL,
              name: 'name' in file ? file.name : fileId,
              mimeType: file.mimeType
            };
          }
        }
      } catch (error) {
        console.error(`Failed to convert binary file ${fileId}:`, error);
      }
    }
  }
  
  return filesForStorage;
}

/**
 * Converts stored file data back to File objects for Excalidraw
 * Now handles both Cloudinary URLs and base64 data
 */
export async function convertStorageToFiles(storedFiles: StorageFilesMap): Promise<FilesMap> {
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

      let blob: Blob;
      
      // Check if it's a Cloudinary URL or base64
      if (fileData.dataURL.startsWith('http')) {
        // It's a Cloudinary URL, fetch the image
        try {
          const response = await fetch(fileData.dataURL);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          blob = await response.blob();
        } catch (fetchError) {
          console.error(`Failed to fetch image from URL ${fileData.dataURL}:`, fetchError);
          continue;
        }
      } else {
        // It's base64 data
        blob = dataURLtoBlob(fileData.dataURL);
      }
      
      files[fileId] = new File([blob], fileData.name, {
        type: fileData.mimeType
      });
    } catch (error) {
      console.error(`Failed to convert stored file ${fileId}:`, error);
    }
  }
  
  return files;
}
