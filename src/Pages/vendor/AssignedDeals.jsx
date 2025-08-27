import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AssignedDeals() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("washing");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const token = localStorage.getItem("vendorToken");

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/order/assigned/washing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch assigned orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWashed = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmPopup(true);
  };

  const handleConfirmWashed = async () => {
    if (!selectedOrderId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/order/${selectedOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Washed" }),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        toast.error(data?.message || "Failed to update order status");
        return;
      }

      toast.success("Order marked as Washed!");
      fetchAssignedOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Error updating status");
    } finally {
      setShowConfirmPopup(false);
      setSelectedOrderId(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmPopup(false);
    setSelectedOrderId(null);
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    activeTab === "washing"
      ? order.status === "Washing"
      : order.status === "Washed"
  );

  const getStatusBadge = (status) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
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
      
      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <span className="text-yellow-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Mark as Washed
              </h3>
              <p className="text-sm text-gray-600">
                Once you mark this order as washed, you cannot reverse or cancel it. Are you sure you want to proceed?
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWashed}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Laundry Management
          </h1>
          <p className="text-gray-600 mt-2">
            {activeTab === "washing"
              ? "Current washing orders"
              : "Completed orders"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "washing"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("washing")}
          >
            Washing Orders
            {orders.filter((o) => o.status === "Washing").length > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
                {orders.filter((o) => o.status === "Washing").length}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "washed"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("washed")}
          >
            Washed Orders
            {orders.filter((o) => o.status === "Washed").length > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
                {orders.filter((o) => o.status === "Washed").length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500">
              No {activeTab === "washing" ? "washing" : "washed"} orders
              available
            </h3>
            <p className="text-gray-400 mt-1">
              {activeTab === "washing"
                ? "All orders are completed"
                : "No orders have been marked as washed yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOrders.map((order) => (
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
                    <div className="flex gap-1.5 justify-center items-center ">
                      <span className={getStatusBadge(order.status)}>
                        {order.status}
                      </span>
                      {activeTab === "washed" && order.otp && (
                        <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                          OTP: {order.otp}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-md">📞</span>
                      <p>
                        <span className="text-gray-600  mr-1.5">
                          Client Mobile:
                        </span>
                        <span className="text-black italic ">
                          {order.userMobile}
                        </span>
                      </p>
                    </div>

                    {order.pickupClaimedBy ? (
                      <div className="flex flex-col justify-centerusti space-x-2">
                        <p>
                          <span className="text-gray-600 mr-2">🚚 Agent:</span>
                          <span className="text-black italic">
                            {order.pickupClaimedBy.name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600 mr-2">
                            🚚 Agent Contact:
                          </span>
                          <span className="text-black italic">
                            {order.pickupClaimedBy.phone}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-centerusti space-x-2">
                        <p>
                          <span className="text-gray-600 mr-2">🚚 Agent:</span>
                          <span className="text-black italic">
                            Not Assigned Yet
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600 mr-2">
                            🚚 Agent Contact:
                          </span>
                          <span className="text-black italic">
                            Not Assigned Yet
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="text-gray-700 flex">
                      🧺 Services:
                      {order.services?.map((s, idx) => (
                        <div key={idx} className="ml-4 italic">
                          {s.name} × {s.quantity} = ₹{s.price * s.quantity}
                        </div>
                      ))}
                    </div>
                    <p className="font-bold mt-2">Total: ₹{order.totalPrice}</p>
                    <p className="text-gray-500 text-sm">
                      ⏰ {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {activeTab === "washing" && (
                    <button
                      onClick={() => handleMarkAsWashed(order._id)}
                      className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all transform hover:scale-[1.02]"
                    >
                      Mark as Washed
                    </button>
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

export default AssignedDeals;