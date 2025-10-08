import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VendorDashboard() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const [showOtpField, setShowOtpField] = useState({});
  const [activeTab, setActiveTab] = useState("new");

  // Fetch assigned orders
  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("vendorToken");

      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/order/assigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Access denied. Please login again.");
        } else {
          toast.error(`Error: ${res.status} ${res.statusText}`);
        }
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Function to increment delivery boy's pickup count
  const incrementDeliveryBoyCount = async (deliveryBoyId) => {
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await fetch(
        `${API_BASE_URL}/deliveryboy/increment-pickup-count`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deliveryBoyId }),
        }
      );
    } catch (error) {
      console.error("Error incrementing delivery boy count:", error);
    }
  };

  // Verify OTP and receive order
  const handleReceiveOrder = async (orderId) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      const token = localStorage.getItem("vendorToken");
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
        // Find the order to get delivery boy information
        const order = orders.find((o) => o._id === orderId);

        // Increment delivery boy's completed pickup count
        if (order && order.pickupClaimedBy && order.pickupClaimedBy._id) {
          await incrementDeliveryBoyCount(order.pickupClaimedBy._id);
        }

        toast.success(
          "Order received successfully! Delivery boy count updated."
        );
        setShowOtpField({ ...showOtpField, [orderId]: false });
        setOtpInputs({ ...otpInputs, [orderId]: "" }); // Clear OTP input
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

  // Filter orders
  const newOrders = orders.filter((o) =>
    ["Scheduled", "Picked Up"].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ["Washing", "Washed"].includes(o.status)
  );
  const displayedOrders = activeTab === "new" ? newOrders : pastOrders;

  // Status Badge
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
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Vendor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            {activeTab === "new" ? "New orders to process" : "Your Past orders"}
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

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
            {displayedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">👤</span>
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {order.userName}
                      </h3>
                    </div>
                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-md">📞</span>
                      <p>
                        <span className="text-gray-600 mr-1.5">
                          Client Mobile:
                        </span>
                        <span className="text-black italic">
                          {order.userMobile}
                        </span>
                      </p>
                    </div>
                    {order.pickupClaimedBy ? (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex flex-col space-y-1">
                          <p>
                            <span className="text-gray-600 mr-2">
                              🚚 Agent:
                            </span>
                            <span className="text-black font-medium">
                              {order.pickupClaimedBy.name}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600 mr-2">
                              📞 Contact:
                            </span>
                            <span className="text-black font-medium">
                              {order.pickupClaimedBy.phone}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="flex flex-col space-y-1">
                          <p>
                            <span className="text-gray-600 mr-2">
                              🚚 Agent:
                            </span>
                            <span className="text-yellow-700 italic">
                              Not Assigned Yet
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600 mr-2">
                              📞 Contact:
                            </span>
                            <span className="text-yellow-700 italic">
                              Not Assigned Yet
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="text-gray-700">
                      <div className="flex items-start">
                        <span className="mr-2">🧺</span>
                        <div>
                          <span>Services:</span>
                          {order.services?.map((s, idx) => (
                            <div key={idx} className="ml-4 italic text-sm">
                              {s.name} × {s.quantity} = ₹{s.price * s.quantity}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="font-bold mt-2">Total: ₹{order.totalPrice}</p>
                    <p className="text-gray-500 text-sm">
                      ⏰ {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {activeTab === "new" && !showOtpField[order._id] ? (
                    <button
                      onClick={() =>
                        setShowOtpField({ ...showOtpField, [order._id]: true })
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
                            Enter 4-digit OTP from delivery agent
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
                            className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
                          >
                            Confirm Receipt
                          </button>
                          <button
                            onClick={() => {
                              setShowOtpField({
                                ...showOtpField,
                                [order._id]: false,
                              });
                              setOtpInputs({ ...otpInputs, [order._id]: "" });
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Info message */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <span className="text-green-500 mr-2 mt-0.5">
                              ℹ️
                            </span>
                            <div className="text-xs text-green-700">
                              <p className="font-medium mb-1">Important:</p>
                              <p>
                                When you accept this order with the correct OTP,
                                the delivery agent's completed pickup count will
                                be automatically updated for their earnings
                                calculation.
                              </p>
                            </div>
                          </div>
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

export default VendorDashboard;
