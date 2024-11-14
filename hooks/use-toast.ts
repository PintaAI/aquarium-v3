import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(description, {
        description: title,
      });
    } else {
      sonnerToast.success(description, {
        description: title,
      });
    }
  };

  return { toast };
}
