import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, Lightbulb, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BibleStudy() {
  const [version, setVersion] = useState("KJV");
  const [verse, setVerse] = useState("John 3:16");

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="glass-effect border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Book className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Bible Study</h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KJV">KJV</SelectItem>
                <SelectItem value="AMP">AMP</SelectItem>
                <SelectItem value="NIV">NIV</SelectItem>
                <SelectItem value="ESV">ESV</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search verse..."
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Lightbulb className="w-4 h-4" />
              Attach to Wisdom
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{verse} ({version})</h2>
              <div className="h-px bg-gradient-to-r from-blue-600 to-purple-600" />
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-slate-700 leading-relaxed">
                "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him 
                should not perish, but have everlasting life."
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Study Tools</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline">Word Lookup</Button>
                <Button variant="outline">Cross References</Button>
                <Button variant="outline">Commentary</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
