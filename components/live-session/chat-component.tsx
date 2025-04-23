'use client'

import { useEffect, useMemo, useRef, useState } from 'react'; // Added useMemo
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Channel, Event, StreamChat } from 'stream-chat';
import { Send, BarChartHorizontalBig } from 'lucide-react'; // Added PollChart icon

import { parseISO } from 'date-fns';
import { DateDisplay } from '../shared';
import {
  Dialog,
  DialogContent,

  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreatePollForm, PollFormData } from './create-poll-form'; 
import { useToast } from '@/hooks/use-toast'; // Import useToast

import { UseCurrentUser } from '@/hooks/use-current-user';
import { PollDisplay } from './poll-display'; // Import the PollDisplay component

import { DefaultGenerics, PollResponse, PollVote as StreamPollVote } from 'stream-chat';

// Infer the user type from the hook's return value
type CurrentUserType = ReturnType<typeof UseCurrentUser>;

// Define Poll types to match PollDisplay component
interface PollOption {
  id: string;
  text: string;
  vote_count?: number;
}

interface LocalPollVote {
  option_id: string;
  user_id?: string;
}

type Poll = {
  id: string;
  name: string;
  options: PollOption[];
  enforce_unique_vote: boolean;
  vote_count?: number;
  own_votes?: LocalPollVote[];
  vote_counts_by_option?: Record<string, number>;
  is_closed?: boolean;
  voting_visibility?: 'public' | 'anonymous';
};

interface Message {
  id: string;
  text: string;
  sender: string;
  senderImage?: string;
  timestamp: Date;
  poll?: Poll;
}

interface ChatComponentProps {
  channel: Channel;
  chatClient: StreamChat; // Add chatClient prop
  isCreator: boolean;     // Add isCreator prop
  currentUser: CurrentUserType; // Add currentUser prop
}

export function ChatComponent({ channel, chatClient, isCreator, currentUser }: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activePollMessageId, setActivePollMessageId] = useState<string | null>(null); // State for active poll
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false); // State for dialog
  const { toast } = useToast(); // Initialize toast

  // Subscribe to new messages
  useEffect(() => {
    if (!channel) return

    // Listen for new messages
    const handleNewMessage = (event: Event) => {
      const { message } = event
      if (!message) return;

      // Check if the message has a poll attached and cast it to our Poll type
      // Convert Stream poll data to our local Poll type
      const streamPoll = message.poll as PollResponse<DefaultGenerics> | undefined;
      const pollData = streamPoll ? {
        ...streamPoll,
        enforce_unique_vote: streamPoll.enforce_unique_vote ?? false,
        own_votes: streamPoll.own_votes?.map(vote => ({
          option_id: vote.option_id || '',
          user_id: vote.user_id
        }))
      } as Poll : undefined;
      const newMessageData: Message = {
        id: message.id,
        text: message.text || '',
        sender: message.user?.name || message.user?.id || 'Unknown User',
        senderImage: message.user?.image as string | undefined,
        timestamp: message.created_at ? parseISO(message.created_at) : new Date(),
        poll: pollData, // Store poll data with the message
      };

      setMessages((prev) => [
        ...prev,
        newMessageData,
      ]);

      // If the new message has a poll, set it as the active one
      if (pollData && message.id) {
        setActivePollMessageId(message.id);
      }
    };

    // Load existing messages
    const loadMessages = async () => {
      try {
        const response = await channel.watch()
        const channelMessages = response.messages || [];
        let latestPollMsgId: string | null = null;
        // Filter out deleted messages before mapping
        const loadedMessages = channelMessages
          .filter(msg => !msg.deleted_at) // Add this filter
          .map(msg => {
          const messageData: Message = {
            id: msg.id,
            text: msg.text || '',
            sender: msg.user?.name || msg.user?.id || 'Unknown User',
            senderImage: msg.user?.image as string | undefined,
            timestamp: msg.created_at ? parseISO(msg.created_at) : new Date(),
            poll: (msg.poll as PollResponse<DefaultGenerics> | undefined) ? {
              ...(msg.poll as PollResponse<DefaultGenerics>),
              enforce_unique_vote: (msg.poll as PollResponse<DefaultGenerics>).enforce_unique_vote ?? false,
              own_votes: (msg.poll as PollResponse<DefaultGenerics>).own_votes
                ?.filter((vote): vote is StreamPollVote<DefaultGenerics> => 
                  'option_id' in vote && vote.option_id !== undefined
                )
                .map(vote => ({
                  option_id: vote.option_id,
                  user_id: vote.user_id
                }))
            } as Poll : undefined
          };
          // Track the latest message with a poll
          if (msg.poll && msg.id) {
            latestPollMsgId = msg.id;
          }
          return messageData;
        });
        setMessages(loadedMessages);
        // Set the latest poll found during loading as the active one
        if (latestPollMsgId) {
          setActivePollMessageId(latestPollMsgId);
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()

    // Add message listener
    channel.on('message.new', handleNewMessage)

    // Cleanup
    return () => {
      channel.off('message.new', handleNewMessage);
    };
  }, [channel]); // Dependencies remain the same

  // Add listeners for poll updates
  useEffect(() => {
    if (!channel) return;

    const upsertMessage = (msg: Message) =>
      setMessages(prev =>
        prev.some(m => m.id === msg.id)
          ? prev.map(m => (m.id === msg.id ? msg : m))
          : [...prev, msg],
      );

    const handleMessageUpdated = (event: Event) => {
      console.log('[handleMessageUpdated] Received event:', event); // Log the full event

      let messageId: string | undefined;
      let pollData: PollResponse<DefaultGenerics> | undefined;
      let updatedTimestamp: Date | undefined;

      // Case 1: Event has a full message object (e.g., message.updated)
      if (event.message) {
        console.log('[handleMessageUpdated] Processing event.message:', event.message);
        messageId = event.message.id;
        pollData = event.message.poll;
        // Attempt to get user details from the message if available
        const sender = event.message.user?.name || event.message.user?.id || 'Unknown User';
        const senderImage = event.message.user?.image as string | undefined;
        const text = event.message.text || '';
        updatedTimestamp = event.message.updated_at ? parseISO(event.message.updated_at) : new Date();

        // Convert Stream poll data to our local Poll type before updating
        const convertedPollData = pollData ? {
          ...pollData,
          enforce_unique_vote: pollData.enforce_unique_vote ?? false,
          own_votes: pollData.own_votes?.map(vote => ({
            option_id: vote.option_id || '',
            user_id: vote.user_id
          }))
        } as Poll : undefined;

        // Use upsertMessage with converted poll data
        upsertMessage({
          id: messageId,
          text: text,
          sender: sender,
          senderImage: senderImage,
          timestamp: updatedTimestamp,
          poll: convertedPollData,
        });

      // Case 2: Event has poll data and message_id (e.g., poll.updated, poll.closed)
      } else if (event.poll && event.message_id) {
        console.log('[handleMessageUpdated] Processing event.poll:', event.poll);
        messageId = event.message_id;
        pollData = event.poll;
        updatedTimestamp = event.created_at ? parseISO(event.created_at) : new Date(); // Use event's created_at for timestamp

        // Directly update the specific message's poll data in the state
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.id === messageId) {
              console.log(`[handleMessageUpdated] Updating poll for message ID: ${messageId}`);
              return {
                ...msg, // Keep existing message data
                // Convert Stream poll data to our local Poll type
                poll: pollData ? {
                  ...pollData,
                  enforce_unique_vote: pollData.enforce_unique_vote ?? false,
                  own_votes: pollData.own_votes?.map(vote => ({
                    option_id: vote.option_id || '',
                    user_id: vote.user_id
                  }))
                } as Poll : undefined,
                timestamp: updatedTimestamp || msg.timestamp // Update timestamp if available
              };
            }
            return msg;
          })
        );

      // Case 3: Unknown event structure
      } else {
        console.log('[handleMessageUpdated] Event structure not recognized, returning.');
        return;
      }

      // If we processed a poll update for a specific message, set it as active
      if (messageId && pollData) {
        console.log(`[handleMessageUpdated] Setting active poll message ID: ${messageId}`);
       setActivePollMessageId(messageId);
       }
     };

    const handleMessageDeleted = (event: Event) => {
        console.log('[handleMessageDeleted] Received event:', event);
        const deletedMessageId = event.message?.id;
        if (deletedMessageId) {
            console.log(`[handleMessageDeleted] Removing message ID: ${deletedMessageId}`);
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== deletedMessageId));
            // If the deleted message was the active poll, clear the active poll display
            setActivePollMessageId(prevActiveId =>
                prevActiveId === deletedMessageId ? null : prevActiveId
            );
        } else {
             console.log('[handleMessageDeleted] No message ID found in event.');
        }
    };

     channel.on('message.updated', handleMessageUpdated);
     // Stream kadang juga emit 'poll.updated' / 'poll.closed' — amankan:
     channel.on('poll.updated', handleMessageUpdated as (event: Event) => void);
     channel.on('poll.closed', handleMessageUpdated as (event: Event) => void);
     // Add listener for message deletion
     channel.on('message.deleted', handleMessageDeleted);


     return () => {
       channel.off('message.updated', handleMessageUpdated);
       channel.off('poll.updated', handleMessageUpdated as (event: Event) => void);
       channel.off('poll.closed', handleMessageUpdated as (event: Event) => void);
       // Remove listener for message deletion
       channel.off('message.deleted', handleMessageDeleted);
     };
   }, [channel]); // Still depends only on channel

  // Find the active poll data based on the ID
  const activePoll = useMemo(() => {
    if (!activePollMessageId) return null;
    return messages.find(msg => msg.id === activePollMessageId);
  }, [activePollMessageId, messages]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !channel) return

    try {
      await channel.sendMessage({
        text: newMessage,
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  };

  // Handler for submitting the poll form
  const handleCreatePollSubmit = async (pollData: PollFormData) => {
    if (!chatClient || !currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Chat client or user not available.',
      });
      return;
    }

    try {
      // 1. Create the poll using the chatClient
      const poll = await chatClient.createPoll({
        name: pollData.name,
        options: pollData.options,
        enforce_unique_vote: pollData.enforceUniqueVote,
        // Add other poll settings here if needed in the future
      });

      // 2. Send a message with the poll ID attached
      // Access the ID via poll.poll.id based on SDK structure
      if (!poll.poll?.id) {
        throw new Error('Poll created successfully, but poll ID is missing in the response.');
      }
      await channel.sendMessage({
        text: `📊 Poll: ${pollData.name}`, // Add context text
        poll_id: poll.poll.id, // Correctly access the nested poll ID
        // Ensure the message is associated with the creator
        user_id: currentUser.id,
      });

      toast({
        title: 'Poll Created',
        description: 'Your poll has been added to the chat.',
      });
      setIsPollDialogOpen(false); // Close the dialog on success
    } catch (error) {
      console.error('Error creating poll or sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Poll Creation Failed',
        description: error instanceof Error ? error.message : 'Could not create the poll.',
      });
    }
  };


  return (
    <div className="flex flex-col h-full bg-background border rounded-lg mt-0 md:mt-6">
      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        {messages.map((message, index) => (
        <div key={message.id} className={`px-2 py-1 hover:bg-muted/50 rounded ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={message.senderImage} width={32} height={32} alt={`${message.sender}'s avatar`} />
              <AvatarFallback>{message.sender[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{message.sender}</span>
                <span className="text-xs text-muted-foreground">
                  <DateDisplay date={message.timestamp} format="h:mm aa" />
                </span>
              </div>
              {/* Render message text */}
              <p className="text-sm mt-0.5 text-black dark:text-muted-foreground break-words whitespace-pre-wrap">
                {message.text}
              </p>
            
            </div>
          </div>
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

       {/* Active Poll Display Area */}
       {activePoll && activePoll.poll && (
        <div className="p-3 border-t bg-muted/20">
           <PollDisplay
              pollData={activePoll.poll}
              messageId={activePoll.id}
              chatClient={chatClient}
              currentUserId={currentUser?.id}
              isCreator={isCreator}
            />
        </div>
      )}


      {/* Input Area - Wrapped by Dialog for the Trigger */}
      <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Chat..."
              className="flex-1"
            />
            {/* Conditionally render Poll button for creator */}
            {isCreator && (
               <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2" aria-label="Create Poll">
                     <BarChartHorizontalBig className="h-4 w-4" />
                  </Button>
               </DialogTrigger>
            )}
            <Button variant="secondary" size="sm" className="px-2" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Poll Creation Dialog Content */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Buat Quiz</DialogTitle>

          </DialogHeader>
          <CreatePollForm
            onSubmit={handleCreatePollSubmit}
            onCancel={() => setIsPollDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
