import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Shield, Cloud, Mic, Bell } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500">Manage your preferences and account settings</p>
        </div>

        {/* Profile */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <Button>Save Profile</Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Face ID / Touch ID</p>
                <p className="text-sm text-slate-500">Use biometric authentication</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Cloud Drive */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Cloud className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Cloud Connections</h2>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Cloud className="w-5 h-5" />
              Connect Google Drive
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Cloud className="w-5 h-5" />
              Connect iCloud
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
