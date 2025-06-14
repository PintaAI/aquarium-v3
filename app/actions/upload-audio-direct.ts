'use server'

import { revalidatePath } from "next/cache";

const CLOUD_NAME = "dnscb3unj";
const UPLOAD_PRESET = "ml_default";

// Server action to get upload signature for secure uploads
export async function getUploadSignature() {
  // For unsigned uploads, we just return the config
  // For signed uploads, you'd generate a signature here
  return {
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
    folder: "aquarium-audio"
  };
}

// Server action to handle the final step after client upload
export async function handleUploadComplete(url: string, duration?: number) {
  try {
    // You can add any server-side processing here
    // like saving to database, logging, etc.
    
    revalidatePath('/');
    
    return {
      success: true,
      url,
      duration: duration ? Math.round(duration) : null
    };
  } catch (error) {
    console.error('Error handling upload completion:', error);
    throw new Error("Failed to process upload completion");
  }
}