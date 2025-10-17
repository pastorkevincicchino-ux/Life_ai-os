import React from "react";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WisdomDrawer({ onClose }) {
  const wisdomNotes = [
    { id: 1, title: "Project Planning Ideas", excerpt: "Key insights from brainstorming session...", date: "2 hours ago" },
    { id: 2, title: "Meeting Notes", excerpt: "Important decisions made during team sync...", date: "Yesterday" },
    { id: 3, title: "Research Findings", excerpt: "Discovered interesting patterns in the data...", date: "3 days ago" },
  ];

  return (
    <div className="w-80 glass-effect border-l border-slate-200/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-slate-900">Wisdom</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Add New */}
      <div className="p-4 border-b border-slate-200/50">
        <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          New Wisdom Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {wisdomNotes.map((note) => (
          <Card key={note.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-medium text-sm text-slate-900 mb-1">{note.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{note.excerpt}</p>
            <span className="text-xs text-slate-400">{note.date}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
