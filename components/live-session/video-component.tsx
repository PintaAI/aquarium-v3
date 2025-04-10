'use client';

import {
  StreamCall, // The React Component
  Call,       // The type for the call object
  SpeakerLayout,// Default controls, we might replace or supplement
  StreamTheme,
  useCallStateHooks, // Import state hooks
  useCall, // Import hook to get the call object
  // CallingState enum no longer needed for this check
} from '@stream-io/video-react-sdk';
import { Button } from "@/components/ui/button"; // Import Button
import { Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, LogOut, Radio } from "lucide-react"; // Import icons
import { useRouter } from "next/navigation"; // Import router

import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useEffect } from 'react';

interface VideoComponentProps {
  call: Call; // Accept the initialized call object
  isCreator: boolean; // Accept creator status
  markLeaveHandled: () => void; // Add handler prop
  onParticipantCountChange?: (count: number) => void; // Add callback for participant count
  // Add new props from wrapper
  deleteSessionAction: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  sessionId: string;
  userId?: string; // User ID might be undefined initially
}

// Define props for CustomControls separately for clarity
interface CustomControlsProps {
  isCreator: boolean;
  markLeaveHandled: () => void;
  onParticipantCountChange?: (count: number) => void;
  deleteSessionAction: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  sessionId: string;
  userId?: string;
}


// Internal component for custom controls, rendered inside StreamCall
function CustomControls({ 
  isCreator, 
  markLeaveHandled, 
  onParticipantCountChange,
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
  const call = useCall(); // Use the dedicated hook
  // Use the correct hook to check live status
  const isLive = useIsCallLive();
  const participants = useParticipants();
  const participantCount = participants?.length || 0;
  
  // Call the callback whenever participant count changes
  useEffect(() => {
    onParticipantCountChange?.(participantCount);
  }, [participantCount, onParticipantCountChange]);

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
    <div className="absolute -bottom-13 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 p-2 bg-background/80 rounded-lg backdrop-blur-sm">
      {/* Camera Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          camera.toggle();
        }}
        title={isCameraOn ? 'Disable Camera' : 'Enable Camera'}
      >
        {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
      {/* Mic Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          microphone.toggle();
        }}
      // Re-enable disabled check
        title={isMute ? 'Unmute' : 'Mute'}
      >
        {isMute ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      {/* Screen Share Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          screenShare.toggle();
        }}
       // Re-enable disabled check
        title={isScreensharing ? 'Stop Sharing' : 'Share Screen'}
      >
        {isScreensharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
      </Button>
      {/* Exit Button */}
      <Button
        variant="destructive"
        size="icon"
        onClick={handleExit} // Use handleExit directly
        title="Exit Session"
      >
        <LogOut className="h-5 w-5" />
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
          <Radio className="h-5 w-5 text-red-500" /> {/* Using Radio icon */}
        </Button>
      )}
    </div>
  );
}


export function VideoComponent({ 
  call, 
  isCreator, 
  markLeaveHandled, 
  onParticipantCountChange,
  deleteSessionAction, // Accept new props
  sessionId,
  userId
}: VideoComponentProps) { // Use updated props interface
  // The StreamVideo context is provided by the parent (LiveSessionWrapper)
  return (
    <StreamTheme as="main" className="w-full aspect-video bg-muted rounded-sm mt-0 md:mt-6 relative"> {/* Added relative positioning */}
      <StreamCall call={call}>
        {/* Use SpeakerLayout for a typical presentation view */}
        <SpeakerLayout />
        {/* Render custom controls, pass all necessary props */}
        <CustomControls 
          isCreator={isCreator} 
          markLeaveHandled={markLeaveHandled}
          onParticipantCountChange={onParticipantCountChange}
          deleteSessionAction={deleteSessionAction} // Pass down
          sessionId={sessionId}                     // Pass down
          userId={userId}                           // Pass down
        />
      </StreamCall>
    </StreamTheme>
  );
}
