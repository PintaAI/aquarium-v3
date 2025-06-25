import type { FilesMap, StorageFilesMap, BinaryFiles } from "../types";
import { uploadImage } from "@/app/actions/upload-image";
import type { DataURL } from "@excalidraw/excalidraw/types";


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
 * Uploads images to Cloudinary.
 */
export async function convertFilesToStorage(files: FilesMap | BinaryFiles): Promise<StorageFilesMap> {
  const filesForStorage: StorageFilesMap = {};
  
  for (const [fileId, file] of Object.entries(files)) {
    if (file instanceof File) {
      const cloudinaryUrl = await uploadFileToCloudinary(file);
      filesForStorage[fileId] = {
        dataURL: cloudinaryUrl,
        name: file.name,
        mimeType: file.type || "application/octet-stream"
      };
    } else if ('dataURL' in file && 'mimeType' in file) {
      // If it's already a URL, keep it as is.
      if (file.dataURL.startsWith('http')) {
        filesForStorage[fileId] = {
          dataURL: file.dataURL,
          name: 'name' in file ? file.name : fileId,
          mimeType: file.mimeType
        };
      }
    }
  }
  
  return filesForStorage;
}

/**
 * Converts stored file data back to BinaryFileData for Excalidraw.
 */
export async function convertStorageToFiles(storedFiles: StorageFilesMap): Promise<BinaryFiles> {
  const files: BinaryFiles = {};
  
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

      // Pass the Cloudinary URL directly to Excalidraw
      files[fileId] = {
        dataURL: fileData.dataURL as DataURL,
        mimeType: fileData.mimeType as any,
        id: fileId as any,
        created: Date.now()
      };
    } catch (error) {
      console.error(`Failed to convert stored file ${fileId}:`, error);
    }
  }
  
  return files;
}
