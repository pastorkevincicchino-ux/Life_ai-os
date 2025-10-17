import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder, File, Cloud, HardDrive, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function FileViewer() {
  const [source, setSource] = useState("drive");

  const mockFiles = [
    { name: "Project Proposal.pdf", size: "2.4 MB", modified: "2 hours ago", type: "pdf" },
    { name: "Meeting Notes", size: "folder", modified: "Yesterday", type: "folder" },
    { name: "Research.docx", size: "1.8 MB", modified: "3 days ago", type: "docx" },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="glass-effect border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">File Viewer</h1>
            <p className="text-sm text-slate-500">Access files from all your connected sources</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search files..." className="pl-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={source} onValueChange={setSource}>
            <TabsList className="mb-6">
              <TabsTrigger value="drive" className="gap-2">
                <Cloud className="w-4 h-4" />
                Google Drive
              </TabsTrigger>
              <TabsTrigger value="icloud" className="gap-2">
                <Cloud className="w-4 h-4" />
                iCloud
              </TabsTrigger>
              <TabsTrigger value="local" className="gap-2">
                <HardDrive className="w-4 h-4" />
                Local Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value={source}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="divide-y divide-slate-200">
                  {mockFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        {file.type === "folder" ? (
                          <Folder className="w-5 h-5 text-blue-600" />
                        ) : (
                          <File className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{file.name}</p>
                        <p className="text-sm text-slate-500">{file.size} • {file.modified}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
