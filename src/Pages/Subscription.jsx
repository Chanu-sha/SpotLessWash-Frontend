import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

export default function Subscription() {
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [selectedPlan, setSelectedPlan] = useState("standard");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto bg-white p-4 rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <FaArrowLeftLong className="text-gray-700" />
          <h1 className="text-lg font-bold text-gray-900">Subscription Plans</h1>
        </div>

        {/* Billing Toggle */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Choose a plan</h2>
          <div className="flex justify-between px-2 py-1 rounded-md bg-green-50 mb-6 text-sm">
            <button
              className={`w-full py-2 rounded-md ${
                billingCycle === "monthly"
                  ? "bg-white text-green-600 font-semibold"
                  : "text-gray-600"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`w-full py-2 rounded-md ${
                billingCycle === "yearly"
                  ? "bg-white text-green-600 font-semibold"
                  : "text-gray-600"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans */}
        {[
          {
            id: "basic",
            title: "Basic",
            price: "₹499",
            features: ["10 items/month", "Same-day delivery", "Standard support"],
          },
          {
            id: "standard",
            title: "Standard",
            price: "₹799",
            features: [
              "20 items/month",
              "Same-day delivery",
              "Priority support",
              "Free pickup & delivery",
            ],
          },
          {
            id: "premium",
            title: "Premium",
            price: "₹999",
            features: ["Unlimited items", "Faster pickup", "24/7 support", "All features included"],
          },
        ].map((plan) => (
          <div
            key={plan.id}
            className={`mb-6 p-4 border rounded-lg ${
              selectedPlan === plan.id
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                name="plan"
                id={plan.id}
                checked={selectedPlan === plan.id}
                onChange={() => setSelectedPlan(plan.id)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <label htmlFor={plan.id} className="text-base font-semibold text-gray-800">
                {plan.title}
              </label>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-3">
              {plan.price} /{billingCycle === "monthly" ? "month" : "year"}
            </p>
            <button className="w-full mb-3 py-2 bg-gray-200 hover:bg-gray-700 hover:text-white text-black rounded-md transition">
              Subscribe Now
            </button>
            <ul className="space-y-2 text-sm text-gray-700">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
