import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, FileText, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function BookWriter() {
  const [chapters] = useState([
    { id: 1, title: "Chapter 1: Introduction", sections: 3 },
    { id: 2, title: "Chapter 2: The Beginning", sections: 5 },
    { id: 3, title: "Chapter 3: Development", sections: 4 },
  ]);
  const [activeChapter, setActiveChapter] = useState(1);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Chapter Sidebar */}
      <div className="w-64 glass-effect border-r border-slate-200/50 flex flex-col">
        <div className="p-4 border-b border-slate-200/50">
          <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Chapter
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setActiveChapter(chapter.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                activeChapter === chapter.id
                  ? "bg-blue-50 text-blue-900 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm">{chapter.title}</span>
              </div>
              <span className="text-xs text-slate-500">{chapter.sections} sections</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="glass-effect border-b border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Chapter {activeChapter}: Introduction
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Export</Button>
              <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Textarea
              placeholder="Start writing..."
              className="min-h-[600px] bg-white text-lg leading-relaxed resize-none"
            />
          </div>
        </div>
      </div>

      {/* Ezra Panel */}
      <div className="w-80 glass-effect border-l border-slate-200/50 flex flex-col">
        <div className="p-4 border-b border-slate-200/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Ezra Assistant</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
