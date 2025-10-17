import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Shield } from "lucide-react";

export default function Accounts() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Account</h1>
          <p className="text-slate-500">Manage your account information</p>
        </div>

        {/* Account Info */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">John Doe</h2>
              <p className="text-slate-500">john.doe@example.com</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium">john.doe@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-500">Member Since</p>
                <p className="font-medium">January 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">Account Type</p>
                <p className="font-medium">Premium</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Account Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Update Profile Picture
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
