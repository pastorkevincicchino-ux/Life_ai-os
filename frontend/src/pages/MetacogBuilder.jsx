import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Download } from "lucide-react";

export default function MetacogBuilder() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="glass-effect border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Metacog Builder</h1>
            <p className="text-sm text-slate-500">Build cognitive models and frameworks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4" />
              Save to Wisdom
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto h-full">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Start Building</h3>
              <p className="text-slate-500 mb-4">Create nodes and connections to build your cognitive model</p>
              <Button className="gap-2 bg-gradient-to-br from-blue-500 to-purple-600">
                <Plus className="w-4 h-4" />
                Add Node
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
