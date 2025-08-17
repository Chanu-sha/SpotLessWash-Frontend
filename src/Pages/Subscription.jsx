import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Subscription = () => {
  const [userId, setUserId] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // 👈 Firebase UID as userId
        refreshStatus(user.uid);
      } else {
        setUserId(null);
        setIsSubscribed(false);
      }
    });
    return unsubscribe;
  }, []);

  const refreshStatus = async (uid) => {
    try {
      const s = await apiGet(`/subscription/status?userId=${uid}`);
      setIsSubscribed(s.isSubscribed);
      setRemainingDays(s.remainingDays || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!userId) return alert("Please login first");
    setLoading(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Razorpay SDK failed to load");

      const order = await apiPost("/payments/create-order", { plan, userId });

      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "My Laundry Service",
        description: `${plan} Subscription`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await apiPost("/payments/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId,
            });
            await refreshStatus(userId);
            alert("Payment successful! Subscription activated.");
          } catch (err) {
            console.error(err);
            alert("Verification failed");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: { color: "#4F46E5" },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      alert(e.message || "Unable to start payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl p-8 md:p-12 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Make Your Laundry Easy
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Save money and enjoy convenience with our monthly or annual plans.
          </p>
        </header>

        <div
          className={`rounded-2xl p-6 shadow-inner transition-all duration-300 ${
            isSubscribed ? "bg-green-100" : "bg-gray-50"
          }`}
        >
          <h2 className="text-xl font-bold text-gray-800">
            Your Subscription Status
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {isSubscribed
              ? `You are subscribed. Your subscription will expire in ${remainingDays} days.`
              : "You are not currently subscribed."}
          </p>
        </div>

        {!isSubscribed && userId && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Monthly */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-indigo-800">
                Monthly Plan
              </h3>
              <p className="mt-4 text-4xl font-extrabold text-indigo-900">
                ₹499
                <span className="text-base font-normal text-gray-500">
                  {" "}
                  / month
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Unlimited washes for 31 days. Place one order every day.
              </p>
              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={loading}
                className="mt-8 w-full bg-indigo-600 text-white font-semibold py-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50"
              >
                {loading ? "Processing…" : "Subscribe Now"}
              </button>
            </div>

            {/* Annual */}
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 relative">
              <span className="absolute top-0 right-0 -mt-4 -mr-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md rotate-6">
                Most Popular
              </span>
              <h3 className="text-2xl font-bold text-purple-800">
                Annual Plan
              </h3>
              <p className="mt-4 text-4xl font-extrabold text-purple-900">
                ₹4,999
                <span className="text-base font-normal text-gray-500">
                  {" "}
                  / year
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Unlimited washes for 365 days. Save more than the monthly plan.
              </p>
              <button
                onClick={() => handleSubscribe("annual")}
                disabled={loading}
                className="mt-8 w-full bg-purple-600 text-white font-semibold py-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
              >
                {loading ? "Processing…" : "Subscribe Now"}
              </button>
            </div>
          </section>
        )}

        {!userId && (
          <p className="text-center text-red-500 mt-6">
            Please log in to view and purchase subscriptions.
          </p>
        )}
      </div>
    </div>
  );
};

export default Subscription;
