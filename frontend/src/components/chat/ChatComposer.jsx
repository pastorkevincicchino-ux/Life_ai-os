import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Link2, Mic, Send, Search } from "lucide-react";

export default function ChatComposer({ onSend }) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="glass-effect border-t border-slate-200/50 px-6 py-4">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="gap-2 text-slate-600">
              <Paperclip className="w-4 h-4" />
              Attach File
            </Button>
            <Button type="button" variant="ghost" size="sm" className="gap-2 text-slate-600">
              <Link2 className="w-4 h-4" />
              Attach Reference
            </Button>
            <Button type="button" variant="ghost" size="sm" className="gap-2 text-slate-600">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant={isRecording ? "destructive" : "ghost"}
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              {isRecording ? "Recording..." : "Voice"}
            </Button>
          </div>

          {/* Input Area */}
          <div className="flex gap-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Ezra..."
              className="flex-1 resize-none bg-white"
              rows={3}
            />
            <Button
              type="submit"
              disabled={!message.trim()}
              className="self-end bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
