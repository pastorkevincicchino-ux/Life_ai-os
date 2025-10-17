import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Subscription() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      icon: Star,
      features: ["Basic chat", "5 Wisdom notes", "1 project"],
      current: false,
    },
    {
      name: "Pro",
      price: "$19",
      icon: Zap,
      features: ["Unlimited chat", "Unlimited Wisdom", "10 projects", "Voice commands", "Priority support"],
      current: true,
    },
    {
      name: "Elite",
      price: "$49",
      icon: Crown,
      features: ["Everything in Pro", "Advanced AI models", "Unlimited projects", "Custom integrations", "Dedicated support"],
      current: false,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription Plans</h1>
          <p className="text-slate-500">Choose the plan that fits your needs</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-6 ${plan.current ? "border-2 border-blue-600 shadow-xl" : ""}`}>
              {plan.current && (
                <Badge className="mb-4 bg-blue-600">Current Plan</Badge>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  plan.name === "Free" ? "bg-slate-100" :
                  plan.name === "Pro" ? "bg-blue-100" : "bg-purple-100"
                }`}>
                  <plan.icon className={`w-6 h-6 ${
                    plan.name === "Free" ? "text-slate-600" :
                    plan.name === "Pro" ? "text-blue-600" : "text-purple-600"
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-2xl font-bold text-blue-600">{plan.price}<span className="text-sm text-slate-500">/mo</span></p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${plan.current ? "bg-slate-500" : "bg-blue-600 hover:bg-blue-700"}`}>
                {plan.current ? "Manage Plan" : "Choose Plan"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
