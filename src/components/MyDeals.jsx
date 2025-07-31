import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyDeals = () => {
  const [deals, setDeals] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [showOtpField, setShowOtpField] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("deliveryToken");
      const res = await fetch(`${API_BASE_URL}/deliveryboy/my-deals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setDeals(data.orders || []);
      } else {
        toast.error(data.message || "Failed to fetch deals");
      }
    } catch (error) {
      toast.error("Network error fetching deals");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!otpInputs[orderId] || otpInputs[orderId].length !== 4) {
        toast.error("Please enter a valid 4-digit OTP");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/order/verify-otp/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp: otpInputs[orderId] }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("🎉 Order completed successfully!");
        fetchDeals();
        setShowOtpField({ ...showOtpField, [orderId]: false });
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("Error verifying OTP");
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const pendingOrders = deals.filter(
    (order) => order.status === "Ready for Pickup"
  );
  const completedOrders = deals.filter(
    (order) => order.status !== "Ready for Pickup"
  );

  const getStatusBadge = (status) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
      case "Ready for Pickup":
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Delivery Orders
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "pending"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Orders
            {pendingOrders.length > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed Orders
            {completedOrders.length > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
                {completedOrders.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {activeTab === "pending" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingOrders.length > 0 ? (
                  pendingOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {order.name}
                          </h3>
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                            <span>Quantity: {order.quantity}</span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Price: ₹{order.price}</span>
                          </div>

                          <div className="flex items-center text-gray-500 text-sm">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{new Date(order.date).toLocaleString()}</span>
                          </div>
                        </div>

                        {!showOtpField[order._id] ? (
                          <button
                            onClick={() =>
                              setShowOtpField({
                                ...showOtpField,
                                [order._id]: true,
                              })
                            }
                            className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all transform hover:scale-[1.02]"
                          >
                            Verify Delivery
                          </button>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <div>
                              <label
                                htmlFor={`otp-${order._id}`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Enter 4-digit OTP
                              </label>
                              <input
                                id={`otp-${order._id}`}
                                type="text"
                                maxLength="4"
                                placeholder="1234"
                                value={otpInputs[order._id] || ""}
                                onChange={(e) =>
                                  setOtpInputs({
                                    ...otpInputs,
                                    [order._id]: e.target.value.replace(
                                      /\D/g,
                                      ""
                                    ),
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOtpSubmit(order._id)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() =>
                                  setShowOtpField({
                                    ...showOtpField,
                                    [order._id]: false,
                                  })
                                }
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-500">
                      No pending orders
                    </h3>
                    <p className="text-gray-400 mt-1">
                      All your claimed orders are completed
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "completed" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {completedOrders.length > 0 ? (
                  completedOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {order.name}
                          </h3>
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                            <span>Quantity: {order.quantity}</span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Price: ₹{order.price}</span>
                          </div>

                          <div className="flex items-center text-gray-500 text-sm">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{new Date(order.date).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-500">
                      No completed orders yet
                    </h3>
                    <p className="text-gray-400 mt-1">
                      Your completed deliveries will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyDeals;