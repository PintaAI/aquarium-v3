"use client"

import { Track } from 'livekit-client';
import * as React from 'react';
import ReactPlayer from 'react-player';
import { useTracks, useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { useRouter } from 'next/navigation';
import { MdMic, MdMicOff , MdOutlineScreenShare } from 'react-icons/md';
import { IoExitOutline } from 'react-icons/io5';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from 'next/image';

interface ReceivedChatMessage {
  message: string
  timestamp: number
  id: string
  from?: {
    identity?: string
    name?: string
  }
}

interface ChatMessage {
  message: string;
  editTimestamp?: number;
  id: string;
  timestamp: number;
}

interface UseChatHook {
  send: (message: string) => Promise<ChatMessage>
  update: (
    message: string,
    originalMessageOrId: string
  ) => Promise<Required<ChatMessage>>
  chatMessages: ReceivedChatMessage[]
  isSending: boolean
}

export interface LiveSessionUIProps extends React.HTMLAttributes<HTMLDivElement> {
  session?: {
    course?: {
      id: string;
      title: string;
      description?: string;
    };
    creator: {
      id: string;
      name: string;
      image: string;
    };
    participants: {
      id: string;
      name: string;
      image: string;
    }[];
  };
  chatHook?: UseChatHook;
}

function LiveStreamChat({ 
  chatHook, 
  session 
}: { 
  chatHook: UseChatHook; 
  session?: LiveSessionUIProps['session'] 
}) {
  const { send, update, chatMessages, isSending } = chatHook
  const [message, setMessage] = React.useState("")
  const [editingMessage, setEditingMessage] = React.useState<ReceivedChatMessage | null>(null)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    try {
      if (editingMessage) {
        await update(message, editingMessage.id)
        setEditingMessage(null)
      } else {
        await send(message)
      }
      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleEditMessage = (msg: ReceivedChatMessage) => {
    setEditingMessage(msg)
    setMessage(msg.message)
  }

  const cancelEdit = () => {
    setEditingMessage(null)
    setMessage("")
  }

  return (
    <Card className="w-full h-[300px] md:h-[calc(100vh-970px)] flex flex-col border-0 bg-white/80 dark:bg-black/20 rounded-lg">
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[300px] md:h-[calc(100vh-970px)] p-4" ref={scrollAreaRef}>
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground mt-2">Belum Ada pertanyaan</div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 group">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.from?.name?.[0] || msg.from?.identity?.[0] || "U"}</AvatarFallback>
                    <AvatarImage src={
                      session ? (
                        session.participants.find((p: { id: string }) => p.id === msg.from?.identity)?.image || 
                        (session.creator.id === msg.from?.identity ? session.creator.image : undefined)
                      ) : undefined
                    } />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {msg.from?.name || msg.from?.identity || "Unknown User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{msg.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEditMessage(msg)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit message</span>
                  </Button>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className=" p-3">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={editingMessage ? "Edit your message..." : "Kirim Pesan..."}
            className={cn("flex-grow", editingMessage && "border-primary")}
            disabled={isSending}
          />
          {editingMessage && (
            <Button type="button" variant="outline" size="icon" onClick={cancelEdit}>
              <span className="sr-only">Cancel edit</span>×
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isSending || !message.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">{editingMessage ? "Update message" : "Mengirim pesan..."}</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

function ControlButton({ onClick, active, icon, title }: { 
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition-colors ${
        active ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700/80'
      }`}
      title={title}
    >
      {icon}
    </button>
  );
}

export function LiveSessionUI({ chatHook, session, ...rest }: LiveSessionUIProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const router = useRouter();
  const [isMicOn, setIsMicOn] = React.useState(false);
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background pb-32" {...rest}>
      <div className="max-w-[1280px] w-full mx-auto px-2 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4">
          <div>
            {/* Video Player */}
<div className="aspect-video bg-gray-200 dark:bg-zinc-900 rounded-lg overflow-hidden relative flex items-center justify-center">
              {screenShareTracks.length === 0 ? (
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-zinc-600 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
<p className="text-gray-600 dark:text-zinc-400 text-lg">Menunggu Guru memulai live streaming...</p>
                </div>
              ) : (
                screenShareTracks.map((track) => {
                  if (!track.publication?.track) return null;
                  
                  const stream = new MediaStream();
                  stream.addTrack(track.publication.track.mediaStreamTrack);

                  return (
                    <div key={track.publication.trackSid} className="w-full h-full">
                      <ReactPlayer
                        url={stream}
                        playing
                        width="100%"
                        height="100%"
                        controls
                        style={{
                          backgroundColor: '#18181b'
                        }}
                        config={{
                          file: {
                            attributes: {
                              style: { 
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              },
                              playsInline: true,
                              webkitPlaysinline: "true"
                            }
                          }
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Session Info and Controls */}
            <div className="mt-6 space-y-4 px-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Course Info */}
                  {session?.course && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">{session.course.title}</h2>
                      {session.course.description && (
                        <p className="text-sm text-zinc-400 mt-1">{session.course.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-zinc-400">Live Session</span>
                        <span className="text-sm text-zinc-400">•</span>
                        <span className="text-sm text-zinc-400">
                          {session?.participants?.length 
                            ? `${session.participants.length} ${session.participants.length === 1 ? 'Participant' : 'Participants'}`
                            : "No participants yet"
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Teacher Info */}
                  {session?.creator && (
                    <div className="flex items-center gap-3 mt-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                        {session.creator.image ? (
                          <Image 
                            src={session.creator.image} 
                            alt={session.creator.name}
                            className="w-full h-full object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <span className="text-gray-900 dark:text-zinc-100 text-lg">
                            {session.creator.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
<p className="text-gray-900 dark:text-zinc-100 font-medium">{session.creator.name}</p>
                        <p className="text-sm text-zinc-400">Teacher</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control buttons */}
                <div className="flex gap-2 ml-4">
                  {session?.creator.id === localParticipant.identity && (
                    <>
                      <ControlButton
                        onClick={async () => {
                          const micEnabled = !isMicOn;
                          await localParticipant.setMicrophoneEnabled(micEnabled);
                          setIsMicOn(micEnabled);
                        }}
                        active={isMicOn}
                        icon={isMicOn ? <MdMic size={18} /> : <MdMicOff size={18} />}
                        title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
                      />
                      <ControlButton
                        onClick={() => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled)}
                        active={localParticipant.isScreenShareEnabled}
                        icon={<MdOutlineScreenShare size={18} />}
                        title="Share screen"
                      />
                    </>
                  )}
                  <ControlButton
                    onClick={() => {
                      room.disconnect();
                      router.push('/');
                    }}
                    icon={<IoExitOutline className='text-red-500' size={18} />}
                    title="Disconnect"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          {chatHook && session && (
            <div>
              <LiveStreamChat chatHook={chatHook} session={session} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
