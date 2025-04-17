'use client';

import { useEffect, useState, useRef } from 'react';
import { Copy, Clock } from 'lucide-react'; 
import {
  StreamVideo,
  StreamVideoClient,
  Call,
  LoadingIndicator,

} from '@stream-io/video-react-sdk';
// Chat SDK imports
import { StreamChat, Channel } from 'stream-chat';
import { createStreamUsers, generateStreamToken } from '@/app/actions/stream-actions';
import { UseCurrentUser } from '@/hooks/use-current-user';
import { VideoComponent } from './video-component'; // Will be simplified
import { SessionInfo } from './session-info';       // Will receive call prop
import { ChatComponent } from './chat-component';
import type { LiveSession } from '@/app/actions/live-session-actions'; // Import type
import { deleteLiveSession } from '@/app/actions/live-session-actions'; // Import delete action
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; // Added Input
import { Label } from '@/components/ui/label';   // Added Label
import { useToast } from '@/hooks/use-toast'; // Added useToast

import '@stream-io/video-react-sdk/dist/css/styles.css';

interface LiveSessionWrapperProps {
  liveSessionData: LiveSession;
  isCreator: boolean;
  guruUsers: Array<{
    id: string;
    name: string | null;
    image: string | null;
  }>;
}

// Ensure API Key is available client-side
const apiKey = process.env.NEXT_PUBLIC_STREAMCALL_API_KEY;

export function LiveSessionWrapper({ liveSessionData, isCreator, guruUsers }: LiveSessionWrapperProps) {
  const user = UseCurrentUser();
  const { toast } = useToast();
  // Video state
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null); // State for the token
  const [rtmpUrlFromGet, setRtmpUrlFromGet] = useState<string | null>(null); // State for RTMP URL from call.get()
  // Chat state
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [chatChannel, setChatChannel] = useState<Channel | null>(null);
  // General state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const currentToken = tokenResult.token; // Store token temporarily
        if (isMounted) setStreamToken(currentToken); // Set token state

        // Initialize clients if they don't exist
        if (!currentVideoClient) {
          currentVideoClient = new StreamVideoClient({
            apiKey,
            user: {
              id: user.id,
              name: user.name || 'Anonymous',
              image: user.image || undefined,

            },
            token: currentToken, // Use the stored token
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
            currentToken // Use the stored token
          );
          if (isMounted) setChatClient(currentChatClient);
        }

  // Create or get existing call and channel instances
  if (!currentCallInstance && currentVideoClient && isMounted && liveSessionData.streamCallId) {
    try {
      // First create/update all GURU users in Stream
      const createUsersResult = await createStreamUsers(guruUsers);
      if (!createUsersResult.success) {
        throw new Error('[LiveSessionWrapper] Failed to create users in Stream: ' + createUsersResult.error);
      }

      // Initialize call instance
      currentCallInstance = currentVideoClient.call('livestream', liveSessionData.streamCallId);
      
      // Set up members with roles
      const members = guruUsers.map(guruUser => {
        const role = guruUser.id === liveSessionData.creator.id ? 'host' : 'moderator';
        return {
          user_id: guruUser.id,
          role: role
        };
      });

      // Create or get the call
      await currentCallInstance.getOrCreate({
        data: {
          members: members,
        },
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to setup call');
      return;
    }
          await currentCallInstance.camera.disable(); // Disable camera by default
          await currentCallInstance.microphone.disable(); // Disable microphone by default
          
          try {
            await currentCallInstance.join(); // Explicitly join the call
          } catch (error: unknown) {
            // Check for all known join failure patterns
            if (
              error instanceof Error &&
              (error.message.includes("JoinBackstage failed") || 
              error.message.includes("JoinCall failed") ||
              (error.message.includes("client:post") && error.message.includes("/join")))
            ) {
              setError("silahkan tunggu Guru memulai sesi");
              return;
            }
            throw error;
          }

          // --- Get RTMP URL via call.get() ---
          try {
            // Ensure the call instance exists before calling get()
            if (currentCallInstance) {
                const callGetResponse = await currentCallInstance.get();
                const url = callGetResponse.call.ingress?.rtmp?.address;
                if (url && isMounted) {
                  setRtmpUrlFromGet(url);
                }
            }
          } catch (error) {
            console.error('Failed to get RTMP URL:', error);
          }
          // --- End Get RTMP URL ---

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
  }, [user?.id, user?.name, user?.image, user?.role, liveSessionData.streamCallId, liveSessionData.id, liveSessionData.name, isCreator, guruUsers, liveSessionData.creator.id]);

  // Note: Removed useCallIngress hook approach

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
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="bg-muted/50 rounded-lg p-8 flex flex-col items-center space-y-4 max-w-md w-full mx-4">
          {error === "silahkan tunggu Guru memulai sesi" ? (
            <>
              <Clock className="h-12 w-12 text-muted-foreground animate-pulse" />
              <h3 className="text-xl font-semibold text-foreground">{error}</h3>
              <p className="text-sm text-muted-foreground text-center">
                Mohon bersabar, Guru akan segera memulai sesinya
              </p>
            </>
          ) : (
            <p className="text-destructive">Error: {error}</p>
          )}
        </div>
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
              />

             {/* --- OBS/RTMP Streaming Info Modal (Indonesian) --- */}
             {isCreator && rtmpUrlFromGet && streamToken && (
               <Dialog>
                 <DialogTrigger asChild>
                   {/* Updated Button Text */}
                   <Button variant="outline" className="mt-4 w-full md:w-auto">Tutorial Streaming di Tablet</Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[525px]">
                   <DialogHeader>
                     <DialogTitle>Konfigurasi Streaming OBS/RTMP</DialogTitle>
                     <DialogDescription>
                       {/* Updated Description */}
                       Gunakan detail ini di aplikasi streaming Anda (mis., OBS atau Streamlabs di tablet) di bawah pengaturan &apos;Stream&apos;. Pilih layanan &apos;Custom&apos;.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="grid gap-4 py-4">
                     {/* Server URL Row */}
                     <div className="space-y-1">
                       <Label htmlFor="rtmp-url">URL Server</Label>
                       <div className="flex items-center gap-2">
                         <Input
                           id="rtmp-url"
                           value={rtmpUrlFromGet}
                           readOnly
                           className="flex-1 font-mono text-xs h-8" // Use flex-1 to take available space
                         />
                         <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 px-2" // Adjust padding
                           onClick={async () => {
                             try {
                               await navigator.clipboard.writeText(rtmpUrlFromGet);
                               toast({
                                 title: "Tersalin!",
                                 description: "URL Server disalin ke clipboard.",
                               });
                             } catch (err) {
                               console.error("Gagal menyalin URL server:", err);
                               toast({
                                 variant: "destructive",
                                 title: "Gagal Menyalin",
                                 description: "Tidak dapat menyalin URL Server ke clipboard.",
                               });
                             }
                           }}
                         >
                           <Copy className="h-4 w-4" />
                           <span className="sr-only">Salin URL Server</span> {/* Screen reader text */}
                         </Button>
                       </div>
                     </div>

                     {/* Stream Key Row */}
                     <div className="space-y-1">
                       <Label htmlFor="stream-key">Streamkey</Label>
                       <div className="flex items-center gap-2">
                         <Input
                           id="stream-key"
                           type="password" // Mask the key initially
                           value={streamToken}
                           readOnly
                           className="flex-1 font-mono text-xs h-8" // Use flex-1
                         />
                         <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 px-2" // Adjust padding
                           onClick={async () => {
                             try {
                               await navigator.clipboard.writeText(streamToken);
                               toast({
                                 title: "Tersalin!",
                                 description: "Kunci Stream disalin ke clipboard.",
                               });
                             } catch (err) {
                               console.error("Gagal menyalin Kunci Stream:", err);
                               toast({
                                 variant: "destructive",
                                 title: "Gagal Menyalin",
                                 description: "Tidak dapat menyalin Kunci Stream ke clipboard.",
                               });
                             }
                           }}
                         >
                           <Copy className="h-4 w-4" />
                           <span className="sr-only">Salin Kunci Stream</span> {/* Screen reader text */}
                         </Button>
                       </div>
                     </div>

                     <p className="text-xs text-destructive text-center mt-1">Perlakukan Kunci Stream seperti kata sandi!</p>
                   </div>
                   {/* DialogFooter removed as copy buttons are inline */}
                 </DialogContent>
               </Dialog>
             )}
             {/* --- End OBS/RTMP Streaming Info --- */}

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
