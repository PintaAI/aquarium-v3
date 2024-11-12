import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";
import { uploadImage } from "@/app/actions/upload-image";

const onUpload = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const promise = uploadImage(formData);

  return new Promise((resolve, reject) => {
    toast.promise(
      promise.then((url) => {
        // Preload the image
        const image = new Image();
        image.src = url;
        image.onload = () => {
          resolve(url);
        };
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => {
          reject(e);
          return e.message;
        },
      },
    );
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});
