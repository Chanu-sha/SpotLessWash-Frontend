import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VendorWalletComponent from "../../components/vendor/VendorWalletComponent";

function AssignedDeals() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("washing");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [vendorServices, setVendorServices] = useState([]);
  const token = localStorage.getItem("vendorToken");

  // NEW: Calculate vendor earnings based on base price per piece
  const calculateVendorEarnings = (services) => {
    if (!services || services.length === 0) return 0;

    let totalEarnings = 0;
    services.forEach((service) => {
      // Find vendor's base price for this service
      const vendorService = vendorServices.find(
        (vs) => vs.name === service.name
      );
      if (vendorService) {
        // Vendor earns: basePrice × quantity
        totalEarnings += vendorService.basePrice * service.quantity;
      }
    });

    return Math.floor(totalEarnings);
  };

  // Fetch vendor profile to get base prices
  const fetchVendorProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.user && data.user.services) {
        setVendorServices(data.user.services);
      }
    } catch (err) {
      console.error("Failed to fetch vendor profile:", err);
    }
  };

  // fetch orders
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

  // open confirm popup
  const handleMarkAsWashed = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmPopup(true);
  };

  // UPDATED: confirm mark as washed - WITH PROPER ORDER COUNT UPDATE
  const handleConfirmWashed = async () => {
    if (!selectedOrderId) return;

    try {
      // First update the order status
      const response = await fetch(
        `${API_BASE_URL}/order/${selectedOrderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "Washed" }),
        }
      );

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        toast.error(data?.message || "Failed to update order status");
        return;
      }

      // Then add earnings to vendor wallet AND update order count
      try {
        const walletResponse = await fetch(
          `${API_BASE_URL}/vendor/complete-order/${selectedOrderId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (walletResponse.ok) {
          const walletData = await walletResponse.json();

          // REFRESH ALL DATA
          await fetchAssignedOrders();
          // Refresh wallet data if you have a function for it
          // await fetchWalletData();

          toast.success(
            `Order marked as Washed! Earned ₹${walletData.earningsAdded}`
          );
        } else {
          toast.success("Order marked as Washed!");
          toast.warning("Note: Wallet update may have failed.");
        }
      } catch (walletError) {
        console.error("Wallet update error:", walletError);
        toast.success("Order marked as Washed!");
        toast.warning("Note: Wallet update failed. Contact support.");
      }
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
    fetchVendorProfile();
    fetchAssignedOrders();
  }, []);

  // filter by active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "washing") return order.status === "Washing";
    if (activeTab === "washed") return order.status === "Washed";
    if (activeTab === "pickingUp") return order.status === "Picking Up";
    return false;
  });

  const getStatusBadge = (status) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
      case "Washing":
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case "Washed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Picking Up":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get selected order for popup
  const selectedOrder = orders.find((order) => order._id === selectedOrderId);
  const vendorEarnings = selectedOrder
    ? calculateVendorEarnings(selectedOrder.services)
    : 0;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />

      {/* Confirm Popup */}
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
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Once you mark this order as washed, you cannot reverse or
                  cancel it.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p className="font-semibold text-green-800">
                    You will earn: ₹{vendorEarnings}
                  </p>
                  {selectedOrder && (
                    <div className="mt-2 text-xs text-gray-700">
                      {selectedOrder.services.map((service, idx) => {
                        const vendorService = vendorServices.find(
                          (vs) => vs.name === service.name
                        );
                        const vendorPerPiece = vendorService?.basePrice || 0;
                        const vendorTotal = vendorPerPiece * service.quantity;
                        return (
                          <div key={idx} className="flex justify-between py-1">
                            <span>
                              {service.name} × {service.quantity}
                            </span>
                            <span className="font-medium">₹{vendorTotal}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Based on your service base prices
                </p>
              </div>
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
                Confirm & Earn
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header with Wallet Component */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Laundry Management
            </h1>
            <p className="text-gray-600 mt-2">
              {activeTab === "washing"
                ? "Current washing orders"
                : activeTab === "washed"
                ? "Completed orders"
                : "Orders being picked up"}
            </p>
          </div>

          {/* Wallet Component */}
          <VendorWalletComponent />
        </div>

        {/* Tabs */}
        <div className="flex mb-6  bg-white rounded-lg shadow-sm p-1">
          {/* Washing */}
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

          {/* Washed */}
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

          {/* Picking Up */}
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "pickingUp"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("pickingUp")}
          >
            Picking Up
            {orders.filter((o) => o.status === "Picking Up").length > 0 && (
              <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
                {orders.filter((o) => o.status === "Picking Up").length}
              </span>
            )}
          </button>
        </div>

        {/* Orders List */}
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
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 
                     01-2 2H5a2 2 0 01-2-2v-6a2 2 
                     0 012-2m14 0V9a2 2 0 00-2-2M5 
                     11V9a2 2 0 012-2m0 0V5a2 2 
                     0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500">
              No
              {activeTab === "washing"
                ? "washing"
                : activeTab === "washed"
                ? "washed"
                : "picking up"}
              orders available
            </h3>
          </div>
        ) : (
          <div className="grid mb-20 grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOrders.map((order) => {
              const orderVendorEarnings = calculateVendorEarnings(
                order.services
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">👤</span>
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {order.userName}
                        </h3>
                      </div>
                      <div className="flex gap-1.5">
                        <span className={getStatusBadge(order.status)}>
                          {order.status}
                        </span>
                        {activeTab !== "washing" && order.otp && (
                          <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                            OTP: {order.otp}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
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
                        <div className="flex flex-col">
                          <p>
                            <span className="text-gray-600 mr-2">
                              🚚 Agent:
                            </span>
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
                        <div className="flex flex-col">
                          <p>
                            <span className="text-gray-600 mr-2">
                              🚚 Agent:
                            </span>
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

                      <div className="text-gray-700 flex flex-col">
                        🧺 Services:
                        {order.services?.map((s, idx) => {
                          const vendorService = vendorServices.find(
                            (vs) => vs.name === s.name
                          );
                          const vendorPerPiece = vendorService?.basePrice || 0;
                          return (
                            <div key={idx} className="ml-4 italic text-sm">
                              <div className="flex justify-between">
                                <span>
                                  {s.name} × {s.quantity}
                                </span>
                              </div>
                              <div className="text-xs text-green-600">
                                You earn: ₹{vendorPerPiece} × {s.quantity} = ₹
                                {vendorPerPiece * s.quantity}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t pt-2">
                        {activeTab === "washing" && (
                          <p className="text-lg font-bold text-green-600">
                            Your Earnings: ₹{orderVendorEarnings}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">
                        ⏰ {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Action */}
                    {activeTab === "washing" && (
                      <button
                        onClick={() => handleMarkAsWashed(order._id)}
                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all transform hover:scale-[1.02]"
                      >
                        Mark as Washed & Earn ₹{orderVendorEarnings}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignedDeals;
