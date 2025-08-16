import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { UserContext } from "../context/UserContext";

export default function Subscription() {
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const navigate = useNavigate();
  const { currentUser, userProfile, loading } = useContext(UserContext);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const [isSubscribing, setIsSubscribing] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading user...</p>
      </div>
    );
  }

  const handleSubscribe = async (planId, price) => {
    if (!currentUser) {
      alert("Please log in to subscribe.");
      navigate("/login");
      return;
    }

    if (userProfile && userProfile.role === null) {
      alert("Your user profile is incomplete. Please contact support.");
      return;
    }

    if (userProfile && userProfile.isSubscribed) {
      alert("You already have an active subscription.");
      return;
    }

    setIsSubscribing(true);

    try {
      const token = await currentUser.getIdToken();

      const res = await fetch(`${API_BASE}/create-subscription-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName: planId,
          amount: price,
          duration: billingCycle === "monthly" ? 30 : 365,
          email: currentUser?.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create subscription order.");
      }

      const order = await res.json();

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Laundry Subscription",
        description: `Subscribe to ${planId} plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await fetch(`${API_BASE}/confirm-subscription`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: planId,
                duration: billingCycle === "monthly" ? 30 : 365,
              }),
            });
            alert("Subscription activated 🎉");
            navigate("/services");
          } catch (confirmError) {
            console.error("Confirmation error:", confirmError);
            alert("Subscription confirmed on Razorpay but failed to update on our end.");
          }
        },
        prefill: {
          email: currentUser?.email || "guest@example.com",
          contact: currentUser?.phone || "9876543210",
        },
        theme: { color: "#22c55e" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Subscribe error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  // ✅ Plans array
  const plans = [
    {
      id: "basic",
      title: "Basic",
      price: 499,
      features: ["10 items/month", "Same-day delivery", "Standard support"],
    },
    {
      id: "standard",
      title: "Standard",
      price: 799,
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
      price: 999,
      features: [
        "Unlimited items",
        "Faster pickup",
        "24/7 support",
        "All features included",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto bg-white p-4 rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <FaArrowLeftLong
            className="text-gray-700 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-lg font-bold text-gray-900">
            Subscription Plans
          </h1>
        </div>

        {/* Billing Toggle */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Choose a plan
          </h2>
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

        {/* Plans list */}
        {plans.map((plan) => (
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
              <label
                htmlFor={plan.id}
                className="text-base font-semibold text-gray-800"
              >
                {plan.title}
              </label>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-3">
              ₹{plan.price} /{billingCycle === "monthly" ? "month" : "year"}
            </p>
            <button
              onClick={() => handleSubscribe(plan.id, plan.price)}
              className="w-full mb-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              disabled={isSubscribing}
            >
              {isSubscribing ? "Processing..." : "Subscribe Now"}
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
