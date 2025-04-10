'use client';

import { useEffect, useState, useRef } from 'react'; 
import {
  StreamVideo,
  StreamVideoClient,

  Call,      
  LoadingIndicator,

} from '@stream-io/video-react-sdk';
// Chat SDK imports
import { StreamChat, Channel } from 'stream-chat';
import { generateStreamToken } from '@/app/actions/stream-actions';
import { UseCurrentUser } from '@/hooks/use-current-user';
import { VideoComponent } from './video-component'; // Will be simplified
import { SessionInfo } from './session-info';       // Will receive call prop
import { ChatComponent } from './chat-component';
import type { LiveSession } from '@/app/actions/live-session-actions'; // Import type
import { deleteLiveSession } from '@/app/actions/live-session-actions'; // Import delete action

import '@stream-io/video-react-sdk/dist/css/styles.css';

interface LiveSessionWrapperProps {
  liveSessionData: LiveSession; // Receive fetched data
  isCreator: boolean;
}

// Ensure API Key is available client-side
const apiKey = process.env.NEXT_PUBLIC_STREAMCALL_API_KEY;

export function LiveSessionWrapper({ liveSessionData, isCreator }: LiveSessionWrapperProps) {
  const user = UseCurrentUser();
  // Video state
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  // Chat state
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [chatChannel, setChatChannel] = useState<Channel | null>(null);
  // General state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const leaveHandledByButton = useRef(false); // Ref to track if leave was handled by button

  // Function to pass down to mark leave as handled
  const markLeaveHandled = () => {
    leaveHandledByButton.current = true;
  };

  useEffect(() => {
    let isMounted = true; // Track component mount state
    let currentVideoClient: StreamVideoClient | null = null;
    let currentCallInstance: Call | null = null;
    let currentChatClient: StreamChat | null = null;
    let currentChatChannel: Channel | null = null;

    // Reset the leave handler flag
    leaveHandledByButton.current = false;

    if (!user?.id || !apiKey || !liveSessionData.streamCallId) {
      setIsLoading(false);
      setError(user?.id ? 'Stream configuration or session data missing.' : 'User information missing.');
      return;
    }

    const initializeStream = async () => {
      // Prevent initialization if component unmounted
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const tokenResult = await generateStreamToken();
        if (!tokenResult.success || !tokenResult.token) {
          throw new Error(tokenResult.error || 'Failed to generate Stream token.');
        }

        // Initialize clients if they don't exist
        if (!currentVideoClient) {
          currentVideoClient = new StreamVideoClient({
            apiKey,
            user: {
              id: user.id,
              name: user.name || 'Anonymous',
              image: user.image || undefined,
              
            },
            token: tokenResult.token,
          });
          if (isMounted) setVideoClient(currentVideoClient);
        }

        if (!currentChatClient) {
          currentChatClient = new StreamChat(apiKey);
          await currentChatClient.connectUser(
            {
              id: user.id,
              name: user.name || 'Anonymous',
              image: user.image || undefined,
            },
            tokenResult.token
          );
          if (isMounted) setChatClient(currentChatClient);
        }

        // Create or get existing call and channel instances
        if (!currentCallInstance && currentVideoClient && isMounted && liveSessionData.streamCallId) {
          currentCallInstance = currentVideoClient.call('livestream', liveSessionData.streamCallId);
          
          // Use getOrCreate for the video call
          await currentCallInstance.getOrCreate({
          data: {
            members: [
              {
                user_id: user.id,
                role: isCreator ? 'host' : 'user', // Use 'user' as the default role
              },
            ],
            
          },
        });
          await currentCallInstance.camera.disable(); // Disable camera by default
          await currentCallInstance.microphone.disable(); // Disable microphone by default
          await currentCallInstance.join(); // Explicitly join the call
          if (isMounted) {
            setCall(currentCallInstance); // Set the state with the created instance
          }
        }

        // Initialize chat channel
        if (!currentChatChannel && currentChatClient && isMounted && liveSessionData.id) {
          // Use session ID for the chat channel ID
          currentChatChannel = currentChatClient.channel('livestream', liveSessionData.id, {
            name: liveSessionData.name, // Optional: set channel name
            // Add other custom data if needed
          });
          await currentChatChannel.watch(); // Watch the channel for updates
          if (isMounted) {
            setChatChannel(currentChatChannel);
          }
        }

      } catch (err) {
        console.error('Failed to initialize Stream:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        // Disconnect both clients on error
        if (currentVideoClient) await currentVideoClient.disconnectUser();
        if (currentChatClient) await currentChatClient.disconnectUser();
        setVideoClient(null);
        setCall(null);
        setChatClient(null);
        setChatChannel(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeStream();

    return () => {
      isMounted = false; // Mark component as unmounted
      
      const cleanupStream = async () => {
        try {
          // Only leave video call if not handled by button
          if (currentCallInstance && !leaveHandledByButton.current) {
            await currentCallInstance.leave();
          }
          // Stop watching chat channel
          if (currentChatChannel) {
            await currentChatChannel.stopWatching();
          }

          // Always disconnect clients
          if (currentVideoClient) {
            await currentVideoClient.disconnectUser();
          }
          if (currentChatClient) {
            await currentChatClient.disconnectUser();
          }

          // Reset states only if component is still mounted (though unlikely here)
          if (isMounted) {
            setCall(null);
            setVideoClient(null);
            setChatClient(null);
            setChatChannel(null);
          }
        } catch (err) {
          console.error("Stream cleanup error:", err);
        }
      };

      cleanupStream();
    };
    // Depend on stable user ID, name, image, streamCallId, session ID, session name, and isCreator status
  }, [user?.id, user?.name, user?.image, liveSessionData.streamCallId, liveSessionData.id, liveSessionData.name, isCreator]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator />
        <p className="ml-2 text-muted-foreground">Initializing session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] p-4 text-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  // Check for both video and chat clients/instances
  if (!videoClient || !call || !chatClient || !chatChannel) {
    // Should ideally be covered by isLoading or error states
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">Waiting for connection...</p>
      </div>
    );
  }

  // Render main layout with Stream Video context
  // Chat context will be handled within ChatComponent
  return (
    <StreamVideo client={videoClient}>
      <div className="container mx-auto space-y-6 md:space-y-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-2">
             {/* Pass the initialized call object, isCreator status, and handler down */}
             <VideoComponent
                call={call}
                isCreator={isCreator}
                markLeaveHandled={markLeaveHandled}
                // onParticipantCountChange removed
                deleteSessionAction={deleteLiveSession} // Pass action
                sessionId={liveSessionData.id}         // Pass session ID
                userId={user?.id}                      // Pass user ID (ensure it's defined)
             />
             <SessionInfo
               name={liveSessionData.name}
               description={liveSessionData.description}
               courseTitle={liveSessionData.course.title}
              status={liveSessionData.status}
              instructor={{
                name: liveSessionData.creator.name || 'Unnamed Instructor',
                image: liveSessionData.creator.image || undefined
              }}
              startTime={liveSessionData.scheduledStart}
              viewCount={participantCount}
            />
          </div>
          <div className="md:h-screen md:sticky md:top-0">
            <div className="h-[calc(100vh-495px)] md:h-[570px] px-3 mt-1">
              {/* Pass channel to ChatComponent */}
              {chatChannel && (
                <ChatComponent
                  channel={chatChannel}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </StreamVideo>
  );
}
