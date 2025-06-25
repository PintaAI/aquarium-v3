'use client'

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { 
  unjoinCourse, 
  getFirstModule, 
  joinCourse 
} from '@/app/actions/module-actions';
import { 
  getUserJoinRequestStatus, 
  cancelJoinRequest 
} from '@/app/actions/join-request-actions';

interface UseCourseJoinProps {
  courseId: number;
  isAuthor: boolean;
  isJoined: boolean;
}

interface JoinRequest {
  id: number;
  status: 'PENDING' | 'REJECTED';
  message: string | null;
  reason: string | null;
}

export function useCourseJoin({ courseId, isAuthor, isJoined }: UseCourseJoinProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // State management
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [unjoining, setUnjoining] = useState(false);

  // Utility functions
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const redirectToLogin = useCallback(() => {
    const currentUrl = window.location.href;
    router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
  }, [router]);

  const normalizeError = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return typeof error === 'string' ? error : 'Terjadi kesalahan yang tidak diketahui';
  }, []);

  // Fetch join request status
  const fetchJoinRequestStatus = useCallback(async () => {
    try {
      const result = await getUserJoinRequestStatus(courseId);
      
      if (result.success && result.request) {
        // Only handle PENDING and REJECTED statuses, ignore APPROVED
        if (result.request.status === 'PENDING' || result.request.status === 'REJECTED') {
          setJoinRequest({
            id: result.request.id,
            status: result.request.status as 'PENDING' | 'REJECTED',
            message: result.request.message,
            reason: result.request.reason
          });
        } else {
          // If status is APPROVED or any other status, treat as no request
          setJoinRequest(null);
        }
      } else if (!result.success) {
        // Don't toast error if request simply not found, common case
        if (result.error && result.error !== 'Request not found') {
          console.error('Error fetching join request status:', result.error);
        }
        setJoinRequest(null);
      } else {
        setJoinRequest(null);
      }
    } catch (error) {
      console.error('Error fetching join request status:', error);
      setJoinRequest(null);
    }
  }, [courseId]);

  // Initialize join request status and refetch when membership status changes
  useEffect(() => {
    if (session?.user && !isAuthor) {
      fetchJoinRequestStatus();
    }
  }, [session?.user, isAuthor, isJoined, fetchJoinRequestStatus]);

  // Navigate to first module
  const navigateToFirstModule = useCallback(async () => {
    try {
      setLoading(true);
      const firstModule = await getFirstModule(courseId);
      
      if (!firstModule) {
        toast.error("Tidak ada modul yang tersedia");
        return;
      }

      window.location.href = `/courses/${courseId}/modules/${firstModule.id}`;
    } catch (error) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage || "Gagal memulai kursus");
    } finally {
      setLoading(false);
    }
  }, [courseId, normalizeError]);

  // Direct join (for open courses)
  const directJoin = useCallback(async () => {
    if (!session?.user) {
      redirectToLogin();
      return;
    }

    try {
      setLoading(true);
      const result = await joinCourse(courseId);
      
      if (!result.success) {
        if (result.error?.includes('Already joined')) {
          toast.success("Anda sudah bergabung dengan kursus ini");
          await navigateToFirstModule();
          return;
        }
        throw new Error(result.error);
      }

      toast.success("Berhasil bergabung dengan kursus!");
      triggerConfetti();
      await navigateToFirstModule();
    } catch (error) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage || "Gagal bergabung dengan kursus");
    } finally {
      setLoading(false);
    }
  }, [session?.user, redirectToLogin, courseId, navigateToFirstModule, triggerConfetti, normalizeError]);

  // Request join (opens modal) - this function returns a callback to open modal
  const requestJoin = useCallback(() => {
    if (!session?.user) {
      redirectToLogin();
      return null;
    }
    
    // Return a function that can be used to open the modal
    return () => {
      // The actual modal opening will be handled by the component using this hook
      // This provides flexibility for different modal implementations
    };
  }, [session?.user, redirectToLogin]);

  // Cancel join request
  const cancelRequest = useCallback(async () => {
    if (!joinRequest) {
      toast.error("Tidak ada permintaan yang dapat dibatalkan");
      return;
    }
    
    try {
      setLoading(true);
      const result = await cancelJoinRequest(joinRequest.id);
      
      if (result.success) {
        toast.success('Permintaan berhasil dibatalkan');
        setJoinRequest(null);
      } else {
        toast.error(result.error || 'Gagal membatalkan permintaan');
      }
    } catch (error) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage || 'Terjadi kesalahan saat membatalkan permintaan');
    } finally {
      setLoading(false);
    }
  }, [joinRequest, normalizeError]);

  // Unjoin course
  const unjoin = useCallback(async () => {
    try {
      setUnjoining(true);
      const result = await unjoinCourse(courseId);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Berhasil keluar dari kursus!");
      // Refresh the page to update the UI state
      window.location.reload();
    } catch (error) {
      const errorMessage = normalizeError(error);
      toast.error(errorMessage || "Gagal keluar dari kursus");
    } finally {
      setUnjoining(false);
    }
  }, [courseId, normalizeError]);

  // Handler for when request modal succeeds
  const handleRequestSuccess = useCallback(() => {
    fetchJoinRequestStatus();
  }, [fetchJoinRequestStatus]);

  return {
    // State
    joinRequest,
    loading,
    unjoining,
    
    // Methods
    directJoin,
    requestJoin,
    cancelRequest,
    unjoin,
    navigateToFirstModule,
    
    // Utility methods
    handleRequestSuccess,
    triggerConfetti,
    
    // For backward compatibility and additional control
    setLoading,
    setUnjoining,
    fetchJoinRequestStatus
  };
}
