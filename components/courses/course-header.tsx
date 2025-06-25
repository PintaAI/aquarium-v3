'use client'

import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, BarChart, Clock, X, Calendar, Timer } from "lucide-react";
import { getEventStatus, getEventStatusText, getTimeRemaining, formatEventDate, shouldCourseBeLocked, CourseWithEventInfo } from "@/lib/course-utils";
import { CourseType } from "@prisma/client";
import { RequestJoinModal } from "./request-join-modal";
import { RequestStatusBadge } from "./request-status-badge";
import { useState, useMemo } from "react";
import { ShareCourseButton } from "./share-course-button";
import { StartLiveSessionButton } from "./start-live-session-button";
import { cn } from "@/lib/utils";
import { useCourseJoin } from "@/hooks/use-course-join";

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
  
  // Memoize computed values to prevent unnecessary recalculations
  const isAuthor = useMemo(() => session?.user?.id === author.id, [session?.user?.id, author.id]);
  
  // Use the custom hook for join flow management
  const {
    joinRequest,
    loading,
    unjoining,
    directJoin,
    requestJoin,
    cancelRequest,
    unjoin,
    navigateToFirstModule,
    handleRequestSuccess,
    triggerConfetti
  } = useCourseJoin({
    courseId: id,
    isAuthor,
    isJoined
  });
  
  // Modal state for request join
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const courseForUtils = useMemo<CourseWithEventInfo>(() => ({
    id,
    type: type as CourseType,
    eventStartDate,
    eventEndDate,
    isLocked: false, // Base isLocked, will be overridden by event status if applicable
    members: [] // Placeholder, actual member check is `isJoined`
  }), [id, type, eventStartDate, eventEndDate]);
  
  const eventStatus = useMemo(() => getEventStatus(courseForUtils), [courseForUtils]);
  const isEffectivelyLocked = useMemo(() => shouldCourseBeLocked(courseForUtils), [courseForUtils]);
  
  // Memoize formatted dates for event courses
  const formattedEventDates = useMemo(() => {
    if (type !== 'EVENT' || !eventStartDate || !eventEndDate) return null;
    return {
      startDate: formatEventDate(eventStartDate),
      endDate: formatEventDate(eventEndDate)
    };
  }, [type, eventStartDate, eventEndDate]);
  
  // Memoize event status text and time remaining
  const eventStatusInfo = useMemo(() => {
    if (type !== 'EVENT') return null;
    const status = getEventStatus(courseForUtils);
    const timeRemaining = getTimeRemaining(courseForUtils);
    const statusText = status ? getEventStatusText(status) : null;
    return { status, timeRemaining, statusText };
  }, [type, courseForUtils]);

  // Handler for opening request modal
  const handleRequestJoin = () => {
    const openModal = requestJoin();
    if (openModal) {
      setIsRequestModalOpen(true);
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
      <div className="relative aspect-video w-full max-h-[130px] sm:max-h-[150px]">
        <Image
          src={thumbnail || '/images/course.jpg'}
          alt={title}
          fill
          className="object-cover"
        />
        
        {/* Top right badges */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {/* Join request status badge */}
          {!isAuthor && !isJoined && joinRequest && (
            <RequestStatusBadge status={joinRequest.status} className="shadow-md" />
          )}
          
          {/* Event badge */}
          {type === 'EVENT' && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
              <Timer size={12} />
              Event
            </div>
          )}
        </div>
      </div>
      
      <div className="p-2 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 sm:gap-4 mb-2 sm:mb-4">
          <h1 className="text-lg sm:text-3xl font-bold text-primary leading-tight">{title}</h1>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <>
                <StartLiveSessionButton
                  courseId={id}
                  courseName={title}
                  isAuthor={isAuthor}
                />
                <Link href={`/courses/${id}/edit-course`} className="mt-1 sm:mt-0">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9">
                    Edit Course
                  </Button>
                </Link>
              </>
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
          <div className="mb-3 overflow-hidden rounded-lg border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20">
            {/* Header with status badges */}
            <div className="flex items-center justify-between bg-orange-100/50 dark:bg-orange-900/20 px-3 py-2 border-b border-orange-200/30 dark:border-orange-700/30">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500">
                  <Calendar className="text-white" size={12} />
                </div>
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Event Schedule</span>
              </div>
              
              {/* Status badges in header */}
              <div className="flex items-center gap-2">
                {eventStatusInfo?.status && (
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                    eventStatusInfo.status === 'upcoming' && "bg-blue-500 text-white",
                    eventStatusInfo.status === 'active' && "bg-green-500 text-white animate-pulse",
                    eventStatusInfo.status === 'expired' && "bg-red-500 text-white"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      eventStatusInfo.status === 'upcoming' && "bg-blue-200",
                      eventStatusInfo.status === 'active' && "bg-green-200 animate-ping",
                      eventStatusInfo.status === 'expired' && "bg-red-200"
                    )} />
                    {eventStatusInfo.statusText}
                  </div>
                )}
                
                {eventStatusInfo?.timeRemaining && (
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    eventStatusInfo.timeRemaining.isActive ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                  )}>
                    <Timer size={10} className={cn(eventStatusInfo.timeRemaining.isActive && "animate-spin")} />
                    {eventStatusInfo.timeRemaining.timeLeft}
                  </div>
                )}
              </div>
            </div>
            
            {/* Compact content */}
            <div className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Compact start date */}
                <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-gray-800/20">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Calendar className="text-green-600 dark:text-green-400" size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium">Start</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {formattedEventDates?.startDate}
                    </p>
                  </div>
                </div>

                {/* Compact end date */}
                <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-gray-800/20">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30">
                    <Timer className="text-red-600 dark:text-red-400" size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium">End</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {formattedEventDates?.endDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                    onClick={isLocked ? handleRequestJoin : directJoin}
                    disabled={loading || isEffectivelyLocked && eventStatus !== 'upcoming'}
                    aria-disabled={loading || isEffectivelyLocked && eventStatus !== 'upcoming'}
                    aria-label={
                      isEffectivelyLocked && eventStatus === 'expired' 
                        ? 'Event sudah berakhir dan tidak dapat diakses' 
                        : isLocked 
                          ? 'Kirim permintaan untuk bergabung dengan kursus' 
                          : 'Bergabung dengan kursus ini'
                    }
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
              
              {joinRequest && (
                <div className="w-full flex flex-col gap-2">
                  {joinRequest.status === 'PENDING' && !isEffectivelyLocked && (
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline"
                        className="flex-1 text-xs sm:text-sm h-8 sm:h-9 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                        onClick={cancelRequest}
                        disabled={loading}
                        aria-disabled={loading}
                        aria-label="Batalkan permintaan bergabung dengan kursus"
                      >
                        <X size={14} className="mr-1" />
                        {loading ? "Membatalkan..." : "Batalkan Permintaan"}
                      </Button>
                      <ShareCourseButton onShare={triggerConfetti} />
                    </div>
                  )}
                  
                  {joinRequest.status === 'REJECTED' && (
                    <>
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                        <span className="font-medium">
                          {joinRequest.reason ? 'Alasan: ' : 'Status: '}
                        </span>
                        {joinRequest.reason || 'Permintaan Anda untuk bergabung dengan kursus ini ditolak.'}
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button 
                          className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={handleRequestJoin}
                          disabled={loading || isEffectivelyLocked}
                        >
                          {isEffectivelyLocked ? 'Event Tidak Tersedia' : 'Kirim Ulang Permintaan'}
                        </Button>
                        <ShareCourseButton onShare={triggerConfetti} />
                      </div>
                    </>
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
                aria-disabled={loading || isEffectivelyLocked}
                aria-label={isEffectivelyLocked ? `Kursus tidak dapat diakses: ${getEventStatusText(eventStatus)}` : "Mulai belajar kursus"}
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
                aria-disabled={loading || isEffectivelyLocked}
                aria-label={isEffectivelyLocked ? `Kursus tidak dapat diakses: ${getEventStatusText(eventStatus)}` : "Mulai belajar kursus"}
              >
                {isEffectivelyLocked ? getEventStatusText(eventStatus) : (loading ? "Memuat..." : "Mulai Belajar")}
              </Button>
              <Button 
                variant="outline"
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={unjoin}
                disabled={unjoining}
                aria-disabled={unjoining}
                aria-label="Keluar dari kursus"
              >
                {unjoining ? "Keluar..." : "Keluar Kursus"}
              </Button>
              <ShareCourseButton onShare={triggerConfetti} />
            </>
          )}

          {/* No modules available */}
          {moduleCount === 0 && (
            <div className="flex gap-2 w-full">
              <Button 
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9" 
                disabled
                aria-disabled={true}
                aria-label="Kursus belum memiliki modul yang tersedia"
              >
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
