"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Send, Camera, Paperclip } from "lucide-react"

// Mock conversation data
const conversation = {
  photographer: {
    name: "John Smith",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
    status: "online",
  },
  messages: [
    {
      id: 1,
      sender: "photographer",
      message: "Hi Sarah! Thank you for your interest in my photography services. I'd love to discuss your wedding!",
      timestamp: "2024-01-20 10:30",
      type: "text",
    },
    {
      id: 2,
      sender: "client",
      message:
        "Hi John! We're so excited to potentially work with you. Our wedding is on February 15th at Central Park.",
      timestamp: "2024-01-20 10:45",
      type: "text",
    },
    {
      id: 3,
      sender: "photographer",
      message: "That sounds wonderful! Central Park is one of my favorite locations. What time is the ceremony?",
      timestamp: "2024-01-20 11:00",
      type: "text",
    },
    {
      id: 4,
      sender: "client",
      message: "The ceremony starts at 2 PM. We're expecting about 100 guests. Do you have availability?",
      timestamp: "2024-01-20 11:15",
      type: "text",
    },
    {
      id: 5,
      sender: "photographer",
      message:
        "Yes, I'm available! I typically recommend 6-8 hours of coverage for weddings. Here's my portfolio from a recent Central Park wedding:",
      timestamp: "2024-01-20 11:30",
      type: "text",
    },
    {
      id: 6,
      sender: "photographer",
      message: "portfolio-sample.jpg",
      timestamp: "2024-01-20 11:31",
      type: "image",
    },
  ],
}

export default function MessagesPage() {
  const router = useRouter()
  const params = useParams()
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage)
      // In real app, send message via API
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={conversation.photographer.image || "/placeholder.svg"}
                alt={conversation.photographer.name}
              />
              <AvatarFallback>
                <Camera className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{conversation.photographer.name}</h1>
              <p className="text-sm text-green-600">{conversation.photographer.status}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Conversation</CardTitle>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "client" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 border"
                  }`}
                >
                  {message.type === "text" ? (
                    <p className="text-sm">{message.message}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-xs">{message.message}</p>
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${message.sender === "client" ? "text-blue-100" : "text-gray-500"}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-black border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
