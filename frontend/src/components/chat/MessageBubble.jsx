import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Lightbulb } from "lucide-react";
import { format } from "date-fns";

export default function MessageBubble({ message, onSendToWisdom }) {
  const isUser = message.from === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">E</span>
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              : "bg-white text-slate-900 border border-slate-200"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-current/10">
              <p className="text-xs opacity-70">{message.attachments.length} attachment(s)</p>
            </div>
          )}
        </div>

        {/* Actions & Timestamp */}
        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-slate-400">
            {format(message.timestamp, "h:mm a")}
          </span>
          {!isUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                onClick={handleCopy}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-slate-500 hover:text-purple-600"
                onClick={onSendToWisdom}
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Send to Wisdom
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
