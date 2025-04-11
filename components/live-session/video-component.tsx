'use client';

import {
  StreamCall, // The React Component
  Call,       // The type for the call object
  // SpeakerLayout removed
  StreamTheme,
  ParticipantView, // Needed for custom layout
  useCallStateHooks, // Import state hooks
  useCall, // Import hook to get the call object
  StreamVideoParticipant, // Import the participant type
  hasScreenShare,
  hasVideo, // Import the utility function
  // CallingState enum no longer needed for this check
} from '@stream-io/video-react-sdk';
import { Button } from "@/components/ui/button"; // Import Button
import { Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, LogOut, Radio } from "lucide-react"; // Import icons
import { useRouter } from "next/navigation"; // Import router

import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useEffect } from 'react';
// import { useEffect } from 'react'; // Removed unused import

interface VideoComponentProps {
  call: Call; // Accept the initialized call object
  isCreator: boolean; // Accept creator status
  markLeaveHandled: () => void; // Add handler prop
  // onParticipantCountChange removed
  // Add new props from wrapper
  deleteSessionAction: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  sessionId: string;
  userId?: string; // User ID might be undefined initially
}

// Define props for CustomControls separately for clarity
interface CustomControlsProps {
  isCreator: boolean;
  markLeaveHandled: () => void;
  // onParticipantCountChange removed
  deleteSessionAction: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  sessionId: string;
  userId?: string;
}


// Internal component for custom controls, rendered inside StreamCall
function CustomControls({
  isCreator,
  markLeaveHandled,
  // onParticipantCountChange removed
  deleteSessionAction,
  sessionId,
  userId 
}: CustomControlsProps) {
  const router = useRouter();
  // Destructure useIsCallLive from useCallStateHooks as per user feedback
  const { useMicrophoneState, useCameraState, useScreenShareState, useIsCallLive, useParticipants } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isEnabled: isCameraOn } = useCameraState();
  const { screenShare, status: screenShareStatus } = useScreenShareState();
  const isScreensharing = screenShareStatus === 'enabled'; // Check status
  const participants = useParticipants();
  
 
  const currentParticipant = participants.find(p => p.userId === userId);
  const canAccessControls = currentParticipant?.roles?.some(role => role === 'host' || role === 'moderator') ?? false;
  const call = useCall(); // Use the dedicated hook
 
  const isLive = useIsCallLive();


  const handleExit = async () => {
    if (!call) {
      console.warn("Call object not available for exit.");
      router.push('/dashboard/live-session'); // Navigate even if call object is missing
      return;
    }

    if (isCreator) {
      // Creator Logic: Stop live, kick participants, delete session, then leave
      console.log("Creator leaving session:", sessionId);
      try {
        // 1. Stop the livestream if it's live
        if (isLive) {
          console.log("Stopping livestream...");
          await call.stopLive();
          console.log("Livestream stopped.");
        } else {
          console.log("Stream was not live, skipping stopLive.");
        }

        // 2. Get participants to kick (everyone except the creator)
        // Access userId directly on the participant object
        const participantsToKick = participants.filter(p => p.userId !== userId); 
        const participantIdsToKick = participantsToKick.map(p => p.userId);

        // 3. Kick participants if there are any
        if (participantIdsToKick.length > 0) {
          console.log(`Kicking ${participantIdsToKick.length} participants:`, participantIdsToKick);
          // Use updateCallMembers to remove members
          await call.updateCallMembers({ remove_members: participantIdsToKick }); 
          console.log("Participants kicked.");
        } else {
          console.log("No other participants to kick.");
        }

        // 4. Delete the session from the database
        console.log("Deleting session from DB:", sessionId);
        const deleteResult = await deleteSessionAction(sessionId);
        if (!deleteResult.success) {
          console.error("Failed to delete session:", deleteResult.error);
          // Decide if we should still proceed with leaving the call and navigating
          // For now, we'll log the error and continue
        } else {
          console.log("Session deleted successfully from DB.");
        }

        // 5. Mark leave as handled (important for cleanup effect)
        markLeaveHandled();

        // 6. Leave the call
        console.log("Leaving Stream call...");
        await call.leave();
        console.log("Left Stream call.");

        // 7. Navigate away
        router.push('/dashboard/live-session');

      } catch (err) {
        console.error("Error during creator exit process:", err);
        // Attempt to mark leave handled and leave call even on error, but don't navigate?
        // Or maybe just navigate to avoid getting stuck? Let's navigate for now.
        try {
          markLeaveHandled(); // Still mark as handled
          await call.leave(); // Attempt to leave again
        } catch (leaveErr) {
          console.error("Failed to leave call after error:", leaveErr);
        }
        router.push('/dashboard/live-session'); // Navigate even on error
      }
    } else {
      // Participant Logic: Just leave the call
      console.log("Participant leaving session.");
      try {
        markLeaveHandled(); // Mark leave handled *before* calling leave
        await call.leave();
        router.push('/dashboard/live-session');
      } catch (err) {
        console.error("Failed to leave call via button (participant):", err);
        // If leave fails, the cleanup effect might still run
        // Navigate anyway to avoid getting stuck
        router.push('/dashboard/live-session');
      }
    }
  };

  return (
    <div className="absolute bottom-0 right-0 z-50 flex items-center gap-1 p-1 sm:gap-2 sm:p-2 bg-background/80 rounded-lg backdrop-blur-sm"> {/* Responsive padding/gap */}
      {/* Camera Button - only for host/moderator */}
      {canAccessControls && <Button
        variant="outline"
        size="icon"
        onClick={() => {
          camera.toggle();
        }}
        title={isCameraOn ? 'Disable Camera' : 'Enable Camera'}
      >
        {isCameraOn ? <Video className="h-4 w-4 sm:h-5 sm:w-5" /> : <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />} {/* Responsive icon size */}
      </Button>}
      {/* Mic Button - only for host/moderator */}
      {canAccessControls && <Button
        variant="outline"
        size="icon"
        onClick={() => {
          microphone.toggle();
        }}
      // Re-enable disabled check
        title={isMute ? 'Unmute' : 'Mute'}
      >
        {isMute ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />} {/* Responsive icon size */}
      </Button>}
      {/* Screen Share Button - only for host/moderator */}
      {canAccessControls && <Button
        variant="outline"
        size="icon"
        onClick={() => {
          screenShare.toggle();
        }}
       // Re-enable disabled check
        title={isScreensharing ? 'Stop Sharing' : 'Share Screen'}
      >
        {isScreensharing ? <ScreenShareOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <ScreenShare className="h-4 w-4 sm:h-5 sm:w-5" />} {/* Responsive icon size */}
      </Button>}
      {/* Exit Button */}
      <Button
        variant="destructive"
        size="icon"
        onClick={handleExit} // Use handleExit directly
        title="Exit Session"
      >
        <LogOut className="h-4 w-4 sm:h-5 sm:w-5" /> {/* Responsive icon size */}
      </Button>
      {/* Go Live Button (only for creator and if not live) */}
      {isCreator && !isLive && (
        <Button
          variant="secondary" // Or another appropriate variant
          size="icon"
          onClick={async () => {
            if (call) {
              try {
                await call.goLive();
              } catch (err) {
                console.error("Failed to go live:", err);
                // Optionally show a toast or error message to the user
              }
            }
          }}
          title="Go Live"
        >
          <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" /> {/* Responsive icon size */}
        </Button>
      )}
    </div>
  );
}

// Props interface SimpleLivestreamLayoutProps removed as it's empty and unused

// New Custom Layout Component - No props needed
const SimpleLivestreamLayout = () => { // Remove props argument and type
  const { useParticipants, useParticipantCount } = useCallStateHooks();
  const participants = useParticipants();
  const participantCount = useParticipantCount();

  // Log participant details in a structured format when the list changes
  useEffect(() => {
    console.groupCollapsed("--- Participant Details Update ---"); // Use groupCollapsed for less noise initially
    if (participants.length === 0) {
      console.log("No participants currently in the call.");
    } else {
      const participantData = participants.map((p) => ({
        id: p.userId,
        name: p.name,
        roles: p.roles,
        videoStreamActive: p.videoStream?.active ?? false,
        screenShareStreamActive: p.screenShareStream?.active ?? false,
        // You could add more details here if needed, e.g., isSpeaking: p.isSpeaking
      }));
      // Log the array of structured participant objects
      console.log("Current Participants:", participantData);
      // Alternatively, log each participant object individually within the group:
      // participantData.forEach((data, index) => {
      //   console.log(`Participant ${index + 1}:`, data);
      // });
    }
    console.groupEnd(); // End the group
  }, [participants]); // Rerun when participants array changes

  const router = useRouter(); // Keep router for potential future use or cleanup

  // --- Refined Participant Selection Logic ---
  let participantToShow: StreamVideoParticipant | undefined = undefined;
  let trackTypeToShow: "videoTrack" | "screenShareTrack" = "videoTrack"; // Default to video track

  // 1. Filter for hosts
  const hosts = participants.filter(p => p.roles.includes('host'));

  if (hosts.length > 0) {
    // 2. Prioritize screen sharing host (Use hasScreenShare utility as per feedback)
    const screenSharingHost = hosts.find(p => hasScreenShare(p));
    if (screenSharingHost) {
      participantToShow = screenSharingHost;
      trackTypeToShow = "screenShareTrack";
    } else {
      // 3. Prioritize camera-enabled host (Use correct property: isCameraEnabled)
      const cameraEnabledHost = hosts.find(p => hasVideo(p));
      if (cameraEnabledHost) {
        participantToShow = cameraEnabledHost;
        trackTypeToShow = "videoTrack";
      } else {
        // 4. Fallback to the first host found (regardless of tracks)
        participantToShow = hosts[0];
        trackTypeToShow = "videoTrack"; // Default to video for fallback host
      }
    }
  }

  // 5. If no suitable host found, fall back to the very first participant overall
  if (!participantToShow && participants.length > 0) {
    participantToShow = participants[0];
    // Also check if the fallback participant is screen sharing
    trackTypeToShow = hasScreenShare(participants[0]) ? "screenShareTrack" : "videoTrack";
  }
  // --- End Refined Participant Selection Logic ---


  // Handle case where there are no participants or the selected one isn't found
  useEffect(() => {
    // Redirect if the determined participantToShow is still undefined after initial load
    // This check might need refinement depending on desired behavior when empty
    if (participants.length > 0 && !participantToShow) {
       console.warn("No participant could be determined to show.");
       // Potentially redirect or show a placeholder
       // router.push('/'); // Example redirect
    } else if (participants.length === 0 && participantCount === 0) {
       // Handle completely empty call scenario if needed
       console.log("No participants in the call.");
       // router.push('/'); // Example redirect
    }
  }, [participantToShow, participants, participantCount, router]);


  // Show nothing if no participant can be shown yet
  if (!participantToShow) {
    // You might want a loading indicator or placeholder here instead of null
    return (
       <div className="w-full h-full flex items-center justify-center text-muted-foreground">
         Waiting for participant...
       </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 right-2 z-10 bg-background/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"> {/* Improved styling */}
        Live: {participantCount}
      </div>

      <ParticipantView
        participant={participantToShow}
        trackType={trackTypeToShow} // Use determined track type
        className="w-full h-full rounded-lg"
        refs={{
          setVideoElement: (element: HTMLVideoElement | null) => {
            if (element) {
              element.style.objectFit = 'contain';
            }
          },
          setVideoPlaceholderElement: () => {}
        }}
      />
    </div>
  );
};


export function VideoComponent({
  call,
  isCreator,
  markLeaveHandled,
  // onParticipantCountChange removed
  deleteSessionAction, // Accept new props
  sessionId,
  userId
}: VideoComponentProps) { // Use updated props interface
  // The StreamVideo context is provided by the parent (LiveSessionWrapper)
  return (
    <StreamTheme as="main" className="w-full aspect-video bg-background rounded-sm mt-0 md:mt-6 relative overflow-hidden"> {/* Changed bg, added overflow */}
      <StreamCall call={call}>
        {/* Replace SpeakerLayout with the custom layout - removed userId prop */}
        <SimpleLivestreamLayout />
        {/* Render custom controls, pass necessary props */}
        <CustomControls
          isCreator={isCreator}
          markLeaveHandled={markLeaveHandled}
         
          deleteSessionAction={deleteSessionAction} // Pass down
          sessionId={sessionId}                     // Pass down
          userId={userId}                           // Pass down
        />
      </StreamCall>
    </StreamTheme>
  );
}
