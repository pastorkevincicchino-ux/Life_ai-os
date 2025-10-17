import React from "react";
import { Outlet } from "react-router-dom";
import {
  Menu,
  Grid3x3,
  Lightbulb,
  CheckCheck,
  ChevronDown,
  Settings as SettingsIcon,
  User,
  CreditCard,
  Lock,
  LogOut,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        :root {
          --harp-primary: #0066FF;
          --harp-secondary: #6366F1;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <nav className="glass-effect border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Life AI Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 font-semibold text-slate-700 hover:bg-slate-100/50">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  Life AI
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Menu Item 1</DropdownMenuItem>
                <DropdownMenuItem>Menu Item 2</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
