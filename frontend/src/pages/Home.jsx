import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Link2, Mic, Volume2, VolumeX, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageBubble from "../components/chat/MessageBubble";
import ChatComposer from "../components/chat/ChatComposer";
import WisdomDrawer from "../components/chat/WisdomDrawer";

export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Ezra, your AI assistant. How can I help you today?", from: "ezra", timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [wisdomOpen, setWisdomOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text, attachments = []) => {
    const userMessage = {
      id: Date.now(),
      text,
      from: "user",
      timestamp: new Date(),
      attachments
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate API call
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "I understand your message. This is a simulated response from Ezra. In production, this would connect to /api/ezra endpoint.",
        from: "ezra",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleExportChat = (format) => {
    console.log(`Exporting chat as ${format}`);
    // TODO: Implement export functionality
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="glass-effect border-b border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Chat with Ezra</h1>
              <p className="text-sm text-slate-500">Your AI-powered assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={ttsEnabled ? "text-blue-600" : "text-slate-600"}
              >
                {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWisdomOpen(!wisdomOpen)}
                className="gap-2"
              >
                {wisdomOpen ? "Hide" : "Show"} Wisdom
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportChat("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportChat("markdown")}>
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportChat("docx")}>
                    Export as DOCX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSendToWisdom={() => console.log("Send to Wisdom:", message)}
              />
            ))}
            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Composer */}
        <ChatComposer onSend={handleSendMessage} />
      </div>

      {/* Wisdom Drawer */}
      {wisdomOpen && <WisdomDrawer onClose={() => setWisdomOpen(false)} />}
    </div>
  );
}
