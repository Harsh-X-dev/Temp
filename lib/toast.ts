import { toast as sonnerToast } from "sonner";

const DEFAULT_DURATION = 1300;

/**
 * Wrapper for Sonner toast to decouple the application and provide
 * responsive, multi-toast notification support.
 */
export const toast = {
  success: (title: string, description?: string | Record<string, any>, options?: Record<string, any>) => {
    const desc = typeof description === "string" ? description : undefined;
    const opts = typeof description === "object" ? description : options;
    return sonnerToast.success(title, {
      duration: opts?.duration ?? DEFAULT_DURATION,
      description: desc,
      ...opts,
    });
  },

  error: (title: string, description?: string | Record<string, any>, options?: Record<string, any>) => {
    const desc = typeof description === "string" ? description : undefined;
    const opts = typeof description === "object" ? description : options;
    return sonnerToast.error(title, {
      duration: opts?.duration ?? 3000,
      description: desc,
      ...opts,
    });
  },

  info: (title: string, description?: string | Record<string, any>, options?: Record<string, any>) => {
    const desc = typeof description === "string" ? description : undefined;
    const opts = typeof description === "object" ? description : options;
    return sonnerToast.info(title, {
      duration: opts?.duration ?? DEFAULT_DURATION,
      description: desc,
      ...opts,
    });
  },

  loading: (title: string, description?: string | Record<string, any>, options?: Record<string, any>) => {
    const desc = typeof description === "string" ? description : undefined;
    const opts = typeof description === "object" ? description : options;
    return sonnerToast.loading(title, {
      description: desc,
      ...opts,
    });
  },

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),

  custom: sonnerToast.custom,
};

