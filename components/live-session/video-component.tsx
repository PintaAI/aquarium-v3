'use client';
import {
  StreamCall, 
  Call,       
  StreamTheme,
  ParticipantView, 
  useCallStateHooks, 
  useCall, 
  StreamVideoParticipant, 
  hasScreenShare,
  hasVideo,
  hasAudio, 
  OwnCapability,
} from '@stream-io/video-react-sdk';
import { Button } from "@/components/ui/button"; 
import { Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, LogOut, Eye, Check, X, Radio } from "lucide-react"; 
import { useRouter } from "next/navigation"; 
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toUTC, getCurrentLocalTime } from '@/lib/date-utils';
import { sendNotification } from '@/app/actions/push-notifications'; 

interface PermissionRequestEvent {
  type: 'call.permission_request';
  permissions: string[];
  user: {
    id: string;
    name?: string;
    image?: string;
  };
}

const PermissionRequestHandler = () => {
  const call = useCall();
  const { useLocalParticipant, useHasPermissions } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const canUpdatePermissions = useHasPermissions(OwnCapability.UPDATE_CALL_PERMISSIONS);
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequestEvent[]>([]);
  // Track last request time for each user
  const [lastRequestTimes, setLastRequestTimes] = useState<Record<string, number>>({});
  
  // Timeout removal handler
  const removeRequest = (request: PermissionRequestEvent) => {
    setPermissionRequests(requests => requests.filter(r => r !== request));
  };

  useEffect(() => {
    if (!call || !canUpdatePermissions) return;

    const handlePermissionRequest = (event: PermissionRequestEvent) => {
      // Ignore own requests
      if (event.user.id !== localParticipant?.userId) {
        setPermissionRequests(requests => [...requests, event]);
      }
    };

    const unsubscribe = call.on('call.permission_request', handlePermissionRequest);
    return () => {
      unsubscribe();
    };
  }, [call, canUpdatePermissions, localParticipant]);

  const handleRequest = async (accept: boolean, request: PermissionRequestEvent) => {
    if (!call) return;
    
  const now = toUTC(getCurrentLocalTime()).getTime();
  const lastRequestTime = lastRequestTimes[request.user.id] || 0;
  const timeSinceLastRequest = now - lastRequestTime;

    // Check if 5 seconds have passed since last request
    if (timeSinceLastRequest < 5000) {
      // Show feedback about waiting period
      console.log(`Tunggu ${Math.ceil((5000 - timeSinceLastRequest) / 1000)} `);
      return;
    }

    try {
      // Update last request time for this user
      setLastRequestTimes(prev => ({
        ...prev,
        [request.user.id]: now
      }));
      if (accept) {
        await call.grantPermissions(request.user.id, request.permissions);
      } else {
        await call.revokePermissions(request.user.id, request.permissions);
      }
      setPermissionRequests(requests => requests.filter(r => r !== request));
    } catch (err) {
      console.error("Failed to handle permission request:", err);
    }
  };

  if (permissionRequests.length === 0) return null;

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50">
      {permissionRequests.map((request, index) => {
        // Set timeout to remove request after 3.5 seconds
        setTimeout(() => removeRequest(request), 5000);
        
        return (
          <div 
            key={index} 
            className="bg-background/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 text-xs min-w-[200px]"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 overflow-hidden">
              {request.user.image ? (
                 <Image
                   src={request.user.image} 
                   alt={request.user.name || 'User'} 
                   width={32}
                   height={32}
                   className="w-full h-full object-cover"
                 />
               ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                  {(request.user.name || request.user.id).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="flex-1">{request.user.name || request.user.id} Ingin berbicara</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleRequest(true, request)}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleRequest(false, request)}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

interface VideoComponentProps {
  call: Call;
  isCreator: boolean;
  markLeaveHandled: () => void;
  deleteSessionAction: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  sessionId: string;
  userId?: string;
}

interface CustomControlsProps {
  isCreator: boolean;
  markLeaveHandled: () => void;
  deleteSessionAction: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  sessionId: string;
  userId?: string;
}

function CustomControls({
  isCreator,
  markLeaveHandled,
  deleteSessionAction,
  sessionId,
  userId 
}: CustomControlsProps) {
  const router = useRouter();
  const { useMicrophoneState, useCameraState, useScreenShareState, useIsCallLive, useParticipants } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isEnabled: isCameraOn } = useCameraState();
  const { screenShare, status: screenShareStatus } = useScreenShareState();
  const isScreensharing = screenShareStatus === 'enabled';
  const participants = useParticipants();
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);
  
  const currentParticipant = participants.find(p => p.userId === userId);
  const canAccessControls = currentParticipant?.roles?.some(role => role === 'host' || role === 'moderator') ?? false;
  const call = useCall();
  const isLive = useIsCallLive();

  // ...rest of the existing handleExit function...
  const handleExit = async () => {
    if (!call) {
      console.warn("Call object not available for exit.");
      router.push('/dashboard/live-session');
      return;
    }

    if (isCreator) {
      console.log("Creator leaving session:", sessionId);
      try {
        if (isLive) {
          console.log("Stopping livestream...");
          await call.stopLive();
          console.log("Livestream stopped.");
        } else {
          console.log("Stream was not live, skipping stopLive.");
        }

        const participantsToKick = participants.filter(p => p.userId !== userId);
        const participantIdsToKick = participantsToKick.map(p => p.userId);

        if (participantIdsToKick.length > 0) {
          console.log(`Kicking ${participantIdsToKick.length} participants:`, participantIdsToKick);
          await call.updateCallMembers({ remove_members: participantIdsToKick });
          console.log("Participants kicked.");
        } else {
          console.log("No other participants to kick.");
        }

        console.log("Deleting session from DB:", sessionId);
        const deleteResult = await deleteSessionAction(sessionId);
        if (!deleteResult.success) {
          console.error("Failed to delete session:", deleteResult.error);
        } else {
          console.log("Session deleted successfully from DB.");
        }

        markLeaveHandled();
        console.log("Leaving Stream call...");
        await call.leave();
        console.log("Left Stream call.");
        router.push('/dashboard/live-session');

      } catch (err) {
        console.error("Error during creator exit process:", err);
        try {
          markLeaveHandled();
          await call.leave();
        } catch (leaveErr) {
          console.error("Failed to leave call after error:", leaveErr);
        }
        router.push('/dashboard/live-session');
      }
    } else {
      console.log("Participant leaving session.");
      try {
        markLeaveHandled();
        await call.leave();
        router.push('/dashboard/live-session');
      } catch (err) {
        console.error("Failed to leave call via button (participant):", err);
        router.push('/dashboard/live-session');
      }
    }
  };

  return (
    <div className="absolute -bottom-4 md:-bottom-7 right-0 md:-right-2 z-50 text-muted-foreground flex flex-col items-end">
      {cooldownMessage && (
        <div className="mb-2 bg-background mr-2 backdrop-blur-sm rounded-lg p-2 text-sm animate-in fade-in">
          {cooldownMessage}
        </div>
      )}
      <div className="flex items-center gap-1 p-1 sm:gap-2 sm:p-2 bg-background rounded-lg">
        {canAccessControls && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => camera.toggle()}
            title={isCameraOn ? 'Disable Camera' : 'Enable Camera'}
          >
            {isCameraOn ? <Video className="h-4 w-4 sm:h-5 sm:w-5" /> : <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={async () => {
            if (canAccessControls) {
              microphone.toggle();
            } else if (call && !call.permissionsContext.hasPermission(OwnCapability.SEND_AUDIO)) {
              if (call.permissionsContext.canRequest(OwnCapability.SEND_AUDIO)) {
                const now = toUTC(getCurrentLocalTime()).getTime();
                const timeSinceLastRequest = now - lastRequestTime;

                if (timeSinceLastRequest < 5000) {
                  const waitTime = Math.ceil((5000 - timeSinceLastRequest) / 1000);
                  setCooldownMessage(`Tunggu ${waitTime} detik sebelum meminta izin lagi.`);
                  setTimeout(() => setCooldownMessage(null), 2000);
                  return;
                }

                try {
                  setLastRequestTime(now);
                  await call.requestPermissions({
                    permissions: [OwnCapability.SEND_AUDIO],
                  });
                } catch (err) {
                  console.error("Failed to request audio permission:", err);
                }
              }
            } else if (call?.permissionsContext.hasPermission(OwnCapability.SEND_AUDIO)) {
              microphone.toggle();
            }
          }}
          disabled={
            !canAccessControls && 
            call && 
            !call.permissionsContext.hasPermission(OwnCapability.SEND_AUDIO) && 
            !call.permissionsContext.canRequest(OwnCapability.SEND_AUDIO)
          }
          title={isMute ? 'Unmute' : 'Mute'}
        >
          {isMute ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
        </Button>

        {canAccessControls && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => screenShare.toggle()}
            title={isScreensharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreensharing ? <ScreenShareOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <ScreenShare className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        )}

        <Button
          variant="destructive"
          size="icon"
          onClick={handleExit}
          title="Exit Session"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {isCreator && !isLive && (
          <Button
            variant="secondary"
            size="icon"
            onClick={async () => {
              if (call) {
                try {
                  await call.goLive();
                  // Send notification after successfully going live
                  try {
                    await sendNotification(
                      'all', // Send to all users
                      'Sesi Live Dimulai!', // Notification title
                      {
                        body: `Sesi live baru saja dimulai. Bergabung sekarang!`, // Notification body
                        url: `/dashboard/live-session?sessionId=${sessionId}` // Optional: URL to open on click
                      }
                    );
                    console.log("Go live notification sent successfully.");
                  } catch (notificationError) {
                    console.error("Failed to send go live notification:", notificationError);
                    // Optionally inform the user about the notification failure, but don't block the UI
                  }
                } catch (err) {
                  console.error("Failed to go live:", err);
                  // Handle go live error (e.g., show a toast message)
                }
              }
            }}
            title="Go Live"
          >
            <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
}

const SimpleLivestreamLayout = () => {
  const callHooks = useCallStateHooks();
  const { useParticipants, useParticipantCount } = callHooks;
  const participants = useParticipants();
  const participantCount = useParticipantCount();

  useEffect(() => {
    console.groupCollapsed("--- Participant Details Update ---");
    if (participants.length === 0) {
      console.log("No participants currently in the call.");
    } else {
      const participantData = participants.map((p) => ({
        id: p.userId,
        name: p.name,
        roles: p.roles,
        videoStreamActive: p.videoStream?.active ?? false,
        screenShareStreamActive: p.screenShareStream?.active ?? false,
        audioStreamActive: p.audioStream?.active ?? false,
      }));
      console.log("Current Participants:", participantData);
    }
    console.groupEnd();
  }, [participants]);

  const router = useRouter();

  let participantToShow: StreamVideoParticipant | undefined = undefined;
  let trackTypeToShow: "videoTrack" | "screenShareTrack" = "videoTrack";

  const hosts = participants.filter(p => p.roles.includes('host'));

  if (hosts.length > 0) {
    const screenSharingHost = hosts.find(p => hasScreenShare(p));
    if (screenSharingHost) {
      participantToShow = screenSharingHost;
      trackTypeToShow = "screenShareTrack";
    } else {
      const cameraEnabledHost = hosts.find(p => hasVideo(p));
      if (cameraEnabledHost) {
        participantToShow = cameraEnabledHost;
        trackTypeToShow = "videoTrack";
      } else {
        participantToShow = hosts[0];
        trackTypeToShow = "videoTrack";
      }
    }
  }

  if (!participantToShow && participants.length > 0) {
    participantToShow = participants[0];
    trackTypeToShow = hasScreenShare(participants[0]) ? "screenShareTrack" : "videoTrack";
  }

  useEffect(() => {
    if (participants.length > 0 && !participantToShow) {
       console.warn("No participant could be determined to show.");
    } else if (participants.length === 0 && participantCount === 0) {
       console.log("No participants in the call.");
    }
  }, [participantToShow, participants, participantCount]);

  useEffect(() => {
    if (!participantToShow) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [participantToShow, router]);

  if (!participantToShow) {

    return (
       <div className="w-full h-full flex items-center justify-center text-muted-foreground">
         Waiting for participant...
       </div>
    );
  }

  const activeAudioParticipants = participants.filter(p => 
    hasAudio(p) && p.sessionId !== participantToShow?.sessionId
  );

  return (
    <div className="w-full h-full relative">
      <div className="absolute scale-75 md:scale-100 flex gap-0.5 top-2 right-2 z-10 bg-background/20 text-muted-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
        <Eye className='m-1 h-3 w-3' /> {participantCount}
      </div>

      <ParticipantView
        participant={participantToShow}
        trackType={trackTypeToShow}
        className="w-full h-full "
        refs={{
          setVideoElement: (element: HTMLVideoElement | null) => {
            if (element) {
              element.style.objectFit = 'contain';
            }
          },
          setVideoPlaceholderElement: () => {}
        }}
      />

      <div className="absolute top-2 left-2 flex gap-2">
        {activeAudioParticipants.map(participant => (
          <ParticipantView
            key={participant.sessionId}
            participant={participant}
            ParticipantViewUI={() => (
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {participant.image ? (
                 <Image
                   src={participant.image} 
                   alt={participant.name || 'Participant'} 
                   width={16}
                   height={16}
                   className="w-full h-full object-cover"
                 />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-medium text-primary">
                    {(participant.name || 'User').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            VideoPlaceholder={null}
            trackType="none"
          />
        ))}
      </div>
    </div>
  );
};

export function VideoComponent({
  call,
  isCreator,
  markLeaveHandled,
  deleteSessionAction,
  sessionId,
  userId
}: VideoComponentProps) {
  return (
    <StreamTheme as="main" className="w-full aspect-video text-background dark:text-foreground mt-0 md:mt-6 relative overflow-visible str-video">
      <StreamCall call={call}>
        <SimpleLivestreamLayout />
        <CustomControls
          isCreator={isCreator}
          markLeaveHandled={markLeaveHandled}
          deleteSessionAction={deleteSessionAction}
          sessionId={sessionId}
          userId={userId}
        />
        {isCreator && <PermissionRequestHandler />}
      </StreamCall>
    </StreamTheme>
  );
}
