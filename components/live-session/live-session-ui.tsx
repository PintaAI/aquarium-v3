"use client"

import { Track } from 'livekit-client';
import * as React from 'react';
import ReactPlayer from 'react-player';
import { useTracks, useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { useRouter } from 'next/navigation';
import { MdMic, MdMicOff } from 'react-icons/md';
import { FaPhoneSlash } from 'react-icons/fa';
import { IoShareSocialOutline } from 'react-icons/io5';

export interface LiveSessionUIProps extends React.HTMLAttributes<HTMLDivElement> {
  session?: {
    course?: {
      id: string;
      title: string;
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
        active ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700/80'
      }`}
      title={title}
    >
      {icon}
    </button>
  );
}

export function LiveSessionUI(props: LiveSessionUIProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const router = useRouter();
  const [isMicOn, setIsMicOn] = React.useState(false);
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  return (
<div className="flex flex-col min-h-screen w-full bg-background pb-32" {...props}>
      <div className="max-w-[1280px] w-full mx-auto px-2 py-4">

        
        {/* Video Player */}
        <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden relative flex items-center justify-center">
          {screenShareTracks.length === 0 ? (
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-zinc-600 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-400 text-lg">Menunggu Guru memulai live streaming...</p>
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
                          }
                        }
                      }
                    }}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Session Info */}
        <div className="mt-6 space-y-4 px-2">
          {/* Course Info */}
          {props.session?.course && (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">{props.session.course.title}</h2>
                <p className="text-sm text-zinc-400">Live Session</p>
              </div>
              <div className="text-sm text-zinc-400">
                {props.session?.participants ? "1 Participant" : "No participants yet"}
              </div>
            </div>
          )}

          {/* Teacher Info */}
          {props.session?.creator && (
            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
                {props.session.creator.image ? (
                  <img 
                    src={props.session.creator.image} 
                    alt={props.session.creator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-zinc-400 text-lg">
                    {props.session.creator.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-zinc-100 font-medium">{props.session.creator.name}</p>
                <p className="text-sm text-zinc-400">Teacher</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-26 left-1/2 -translate-x-1/2 z-20 flex gap-4 p-4 rounded-full bg-zinc-900/90 backdrop-blur-sm shadow-lg border border-zinc-800">
        <ControlButton
          onClick={async () => {
            const micEnabled = !isMicOn;
            await localParticipant.setMicrophoneEnabled(micEnabled);
            setIsMicOn(micEnabled);
          }}
          active={isMicOn}
          icon={isMicOn ? <MdMic size={20} /> : <MdMicOff size={20} />}
          title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
        />
        <ControlButton
          onClick={() => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled)}
          active={localParticipant.isScreenShareEnabled}
          icon={<IoShareSocialOutline size={20} />}
          title="Share screen"
        />
        <ControlButton
          onClick={() => {
            room.disconnect();
            router.push('/');
          }}
          icon={<FaPhoneSlash size={20} />}
          title="Disconnect"
        />
      </div>
    </div>
  );
}
