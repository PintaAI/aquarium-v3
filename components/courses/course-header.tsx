'use client'

import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, BarChart, Clock, X, Calendar, Timer } from "lucide-react";
import { unjoinCourse, getFirstModule, joinCourse } from "@/app/actions/module-actions";
import { getUserJoinRequestStatus, cancelJoinRequest } from "@/app/actions/join-request-actions";
import { getEventStatus, getEventStatusText, getTimeRemaining, formatEventDate, shouldCourseBeLocked, CourseWithEventInfo } from "@/lib/course-utils";
import { CourseType } from "@prisma/client";
import { RequestJoinModal } from "./request-join-modal";
import { RequestStatusBadge } from "./request-status-badge";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { ShareCourseButton } from "./share-course-button";
import confetti from 'canvas-confetti';

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

interface CourseHeaderProps {
  id: number;
  title: string;
  thumbnail: string | null;
  type: string;
  eventStartDate: Date | null;
  eventEndDate: Date | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  level: string;
  moduleCount?: number;
  isJoined?: boolean;
  isLocked: boolean;
  price?: number | null;
  paidCourseMessage?: string | null;
}

export function CourseHeader({ 
  id, 
  title, 
  thumbnail, 
  type,
  eventStartDate,
  eventEndDate,
  author, 
  level,
  moduleCount = 0,
  isJoined = false,
  isLocked = false,
  price,
  paidCourseMessage
}: CourseHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isAuthor = session?.user?.id === author.id;

  const courseForUtils: CourseWithEventInfo = {
    id,
    type: type as CourseType,
    eventStartDate,
    eventEndDate,
    isLocked: false, // Base isLocked, will be overridden by event status if applicable
    members: [] // Placeholder, actual member check is `isJoined`
  };
  const eventStatus = getEventStatus(courseForUtils);
  const isEffectivelyLocked = shouldCourseBeLocked(courseForUtils);


  const [unjoining, setUnjoining] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [joinRequest, setJoinRequest] = useState<{
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    message: string | null;
    reason: string | null;
  } | null>(null);

  const fetchJoinRequestStatus = useCallback(async () => {
    try {
      const result = await getUserJoinRequestStatus(id);
      if (result.success && result.request) {
        setJoinRequest(result.request);
      } else if (!result.success) {
        // Don't toast error if request simply not found, common case
        if (result.error && result.error !== 'Request not found') {
          // console.error('Error fetching join request status:', result.error);
        }
        setJoinRequest(null); // Ensure joinRequest is null if not found or error
      } else {
        setJoinRequest(null); // Ensure joinRequest is null if request is not present
      }
    } catch (error) {
      console.error('Error fetching join request status:', error);
      setJoinRequest(null); // Ensure joinRequest is null on catch
    }
  }, [id]);

  // Fetch join request status on component mount
  useEffect(() => {
    if (session?.user && !isAuthor && !isJoined) {
      fetchJoinRequestStatus();
    }
  }, [session?.user, isAuthor, isJoined, fetchJoinRequestStatus]);

  const redirectToLogin = () => {
    const currentUrl = window.location.href;
    router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
  };

  const handleRequestJoin = () => {
    if (!session?.user) {
      redirectToLogin();
      return;
    }
    setIsRequestModalOpen(true);
  };

  const handleRequestSuccess = () => {
    fetchJoinRequestStatus();
  };

  const handleDirectJoin = async () => {
    if (!session?.user) {
      redirectToLogin();
      return;
    }

    try {
      setLoading(true);
      const result = await joinCourse(id);
      
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal bergabung dengan kursus";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!joinRequest) return;
    
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
      console.error('Error canceling request:', error);
      toast.error('Terjadi kesalahan saat membatalkan permintaan');
    } finally {
      setLoading(false);
    }
  };

  const navigateToFirstModule = async () => {
    try {
      setLoading(true);
      const firstModule = await getFirstModule(id);
      
      if (!firstModule) {
        toast.error("Tidak ada modul yang tersedia");
        return;
      }

      window.location.href = `/courses/${id}/modules/${firstModule.id}`;
    } catch {
      toast.error("Gagal memulai kursus");
    } finally {
      setLoading(false);
    }
  };


  const handleUnjoinCourse = async () => {
    try {
      setUnjoining(true);
      const result = await unjoinCourse(id);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Berhasil keluar dari kursus!");
      // Refresh the page to update the UI state
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal keluar dari kursus";
      toast.error(errorMessage);
    } finally {
      setUnjoining(false);
    }
  };

  return (
    <>
      <RequestJoinModal
        courseId={id}
        courseTitle={title}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={handleRequestSuccess}
        paidMessage={paidCourseMessage}
        price={price}
      />
      
      <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-0 border-b sm:border sm:border-border sm:rounded-xl">
      {thumbnail && (
        <div className="relative aspect-video w-full max-h-[130px] sm:max-h-[150px]">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      <div className="p-2 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 sm:gap-4 mb-2 sm:mb-4">
          <h1 className="text-lg sm:text-3xl font-bold text-primary leading-tight">{title}</h1>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <Link href={`/courses/${id}/edit-course`} className="mt-1 sm:mt-0">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9">
                  Edit Course
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-row sm:justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-6 gap-2 sm:gap-4">
          <div className="flex items-center">
            {author.image ? (
              <Image
                src={author.image}
                alt={author.name || "Author"}
                width={20}
                height={20}
                className="rounded-full mr-1.5 sm:mr-2"
              />
            ) : (
              <User className="mr-1.5 sm:mr-2" size={14} />
            )}
            <span className="truncate">{author.name}</span>
          </div>
          <div className="flex items-center">
            <BarChart className="mr-1.5 sm:mr-2" size={14} />
            <span>{level}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1.5 sm:mr-2" size={14} />
            <span>{moduleCount} modules</span>
          </div>
          {type === 'EVENT' && (
            <div className="flex items-center">
              <Timer className="mr-1.5 sm:mr-2" size={14} />
              <span className="text-orange-600 font-medium">Event Course</span>
            </div>
          )}
        </div>

        {/* Event Information Section */}
        {type === 'EVENT' && eventStartDate && eventEndDate && (
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-orange-600" size={16} />
              <span className="font-medium text-orange-800">Event Schedule</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Start: </span>
                <span className="font-medium">{formatEventDate(eventStartDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">End: </span>
                <span className="font-medium">{formatEventDate(eventEndDate)}</span>
              </div>
            </div>

            {(() => {
              const courseForUtilsLocal: CourseWithEventInfo = {
                id,
                type: type as CourseType,
                eventStartDate,
                eventEndDate,
                isLocked: false, // This might need to reflect actual lock status if available
                members: [] // Placeholder
              };
              const eventStatus = getEventStatus(courseForUtilsLocal);
              const timeRemaining = getTimeRemaining(courseForUtilsLocal);
              
              return (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {eventStatus && (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      eventStatus === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      eventStatus === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getEventStatusText(eventStatus)}
                    </div>
                  )}
                  
                  {timeRemaining && (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      timeRemaining.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Timer size={12} className="mr-1" />
                      {timeRemaining.timeLeft}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Request join button and status - for users who haven't joined */}
          {!isAuthor && !isJoined && moduleCount > 0 && (
            <>
              {!joinRequest && (
                <div className="flex gap-2 w-full">
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9"
                    onClick={isLocked ? handleRequestJoin : handleDirectJoin}
                    disabled={loading || isEffectivelyLocked && eventStatus !== 'upcoming'} // Allow request for upcoming, but not expired/locked
                  >
                    {isEffectivelyLocked && eventStatus === 'expired' 
                      ? 'Event Telah Berakhir' 
                      : isLocked 
                        ? 'Minta Bergabung' 
                        : 'Bergabung dengan Kursus'}
                  </Button>
                  <ShareCourseButton onShare={triggerConfetti} />
                </div>
              )}
              
              {joinRequest && !isEffectivelyLocked && (
                <div className="w-full flex flex-col gap-2">
                  <RequestStatusBadge status={joinRequest.status} className="self-start" />
                  
                  {joinRequest.status === 'PENDING' && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleCancelRequest}
                      disabled={loading}
                    >
                      <X size={14} className="mr-1" />
                      {loading ? "Membatalkan..." : "Batalkan Permintaan"}
                    </Button>
                  )}
                  
                  {joinRequest.status === 'REJECTED' && joinRequest.reason && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      <span className="font-medium">Alasan: </span>
                      {joinRequest.reason}
                    </div>
                  )}
                  
                  {joinRequest.status === 'REJECTED' && (
                    <Button 
                      size="sm"
                      className="text-xs h-7 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleRequestJoin}
                      disabled={loading}
                    >
                      Kirim Ulang Permintaan
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Start learning button - for author */}
          {isAuthor && moduleCount > 0 && (
            <div className="flex gap-2 w-full">
              <Button 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9"
                onClick={navigateToFirstModule}
                disabled={loading || isEffectivelyLocked}
              >
                {isEffectivelyLocked ? getEventStatusText(eventStatus) : (loading ? "Memuat..." : "Mulai Belajar")}
              </Button>
              <ShareCourseButton onShare={triggerConfetti} />
            </div>
          )}

          {/* Buttons for joined users (not author) */}
          {!isAuthor && isJoined && moduleCount > 0 && (
            <>
              <Button 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm h-8 sm:h-9"
                onClick={navigateToFirstModule}
                disabled={loading || isEffectivelyLocked}
              >
                {isEffectivelyLocked ? getEventStatusText(eventStatus) : (loading ? "Memuat..." : "Mulai Belajar")}
              </Button>
              <Button 
                variant="outline"
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleUnjoinCourse}
                disabled={unjoining}
              >
                {unjoining ? "Keluar..." : "Keluar Kursus"}
              </Button>
              <ShareCourseButton onShare={triggerConfetti} />
            </>
          )}

          {/* No modules available */}
          {moduleCount === 0 && (
            <div className="flex gap-2 w-full">
              <Button className="flex-1 text-xs sm:text-sm h-8 sm:h-9" disabled>
                Belum Ada Modul
              </Button>
              <ShareCourseButton onShare={triggerConfetti} />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
