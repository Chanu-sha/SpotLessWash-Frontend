import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DhobiDashboard() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const [showOtpField, setShowOtpField] = useState({});
  const [activeTab, setActiveTab] = useState("new");

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("dhobiToken");
      const res = await fetch(`${API_BASE_URL}/order/assigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      const token = localStorage.getItem("dhobiToken");
      const res = await fetch(
        `${API_BASE_URL}/order/verify-otp-dhobi/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Order received successfully!");
        setShowOtpField({ ...showOtpField, [orderId]: false });
        fetchAssignedOrders();
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const newOrders = orders.filter((o) => o.status === "Picked Up");
  const pastOrders = orders.filter((o) =>
    ["Washing", "Washed"].includes(o.status)
  );

  const displayedOrders = activeTab === "new" ? newOrders : pastOrders;

  const getStatusBadge = (status) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
      case "Picked Up":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Washing":
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case "Washed":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dhobi Management Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            {activeTab === "new"
              ? "New orders to process"
              : "Completed orders history"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "new"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("new")}
          >
            New Orders
            {newOrders.length > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
                {newOrders.length}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "past"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("past")}
          >
            Past Orders
            {pastOrders.length > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
                {pastOrders.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
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
              No {activeTab === "new" ? "new" : "past"} orders available
            </h3>
            <p className="text-gray-400 mt-1">
              {activeTab === "new"
                ? "New orders will appear here when assigned"
                : "Your completed orders will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedOrders.map((order) => (
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate">{order.address}</span>
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>{order.mobile}</span>
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        Delivery Agent:{" "}
                        <span className="font-medium">
                          {order.claimedBy?.name || "Not assigned"}
                        </span>
                      </span>
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

                  {activeTab === "new" && !showOtpField[order._id] ? (
                    <button
                      onClick={() =>
                        setShowOtpField({
                          ...showOtpField,
                          [order._id]: true,
                        })
                      }
                      className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all transform hover:scale-[1.02]"
                    >
                      Receive Order
                    </button>
                  ) : (
                    activeTab === "new" && (
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
                                [order._id]: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReceiveOrder(order._id)}
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
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DhobiDashboard;
