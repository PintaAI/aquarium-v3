'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { StreamChat, Channel, Event } from 'stream-chat'
import { Send } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: string
  senderImage?: string
  timestamp: Date
}

interface ChatComponentProps {
  chatClient: StreamChat
  channel: Channel
  username: string
}

export function ChatComponent({ chatClient, channel, username }: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // Subscribe to new messages
  useEffect(() => {
    if (!channel) return

    // Listen for new messages
    const handleNewMessage = (event: Event) => {
      const { message } = event
      if (!message) return

      setMessages(prev => [...prev, {
        id: message.id,
        text: message.text || '',
        sender: message.user?.name || message.user?.id || 'Unknown User',
        senderImage: message.user?.image as string | undefined,
        timestamp: new Date(message.created_at || Date.now())
      }])
    }

    // Load existing messages
    const loadMessages = async () => {
      try {
        const response = await channel.watch()
        const channelMessages = response.messages || []
        setMessages(
          channelMessages.map(msg => ({
            id: msg.id,
            text: msg.text || '',
            sender: msg.user?.name || msg.user?.id || 'Unknown User',
            senderImage: msg.user?.image as string | undefined,
            timestamp: new Date(msg.created_at || Date.now())
          }))
        )
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()

    // Add message listener
    channel.on('message.new', handleNewMessage)

    // Cleanup
    return () => {
      channel.off('message.new', handleNewMessage)
    }
  }, [channel])

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
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg mt-0 md:mt-6">
      <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        {messages.map((message, index) => (
        <div key={message.id} className={`px-2 py-1 hover:bg-muted/50 rounded ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
          <div className="flex items-start gap-2">
            <Avatar className="h-5 w-5 flex-shrink-0 mt-0.5">
              <AvatarImage src={message.senderImage} />
              <AvatarFallback>{message.sender[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="font-bold text-sm text-primary mr-2">{message.sender}</span>
              <span className="text-sm text-black dark:text-muted-foreground break-words">{message.text}</span>
            </div>
          </div>
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-2">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Chat..."
            className="flex-1"
          />
          <Button variant="secondary" size="sm" className="px-2" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
