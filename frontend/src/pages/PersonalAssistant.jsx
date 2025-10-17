import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, Mic, ShoppingBag, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PersonalAssistant() {
  const [view, setView] = useState("tasks");

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="glass-effect border-b border-slate-200/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Personal Assistant</h1>
            <p className="text-sm text-slate-500">Manage your tasks, calendar, and daily life</p>
          </div>
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Mic className="w-4 h-4" />
            Record Now
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="mb-6">
              <TabsTrigger value="tasks" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="wardrobe" className="gap-2">
                <User className="w-4 h-4" />
                Wardrobe
              </TabsTrigger>
              <TabsTrigger value="shopping" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Shopping
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <div className="grid gap-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Today's Tasks</h3>
                  <div className="space-y-3">
                    {["Review project proposal", "Call team meeting", "Finish documentation"].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Upcoming Events</h3>
                <p className="text-slate-500 text-sm">Calendar integration coming soon...</p>
              </Card>
            </TabsContent>

            <TabsContent value="wardrobe">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Wardrobe Planner</h3>
                <p className="text-slate-500 text-sm">Fashion planner coming soon...</p>
              </Card>
            </TabsContent>

            <TabsContent value="shopping">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Shopping Lists</h3>
                <p className="text-slate-500 text-sm">Shopping list manager coming soon...</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
