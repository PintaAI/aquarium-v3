'use server'

import { revalidatePath } from "next/cache";

const CLOUD_NAME = "dnscb3unj";

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    // Create a new FormData instance for the Cloudinary upload
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "ml_default");
    cloudinaryFormData.append("folder", "aquarium");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error details:', errorData);
      throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data);
    revalidatePath('/');
    
    // Return the secure URL from Cloudinary
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}
