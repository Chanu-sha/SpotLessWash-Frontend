import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveryDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [tab, setTab] = useState("pickup");
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryOrders, setDeliveryOrders] = useState([]);

  // Confirmation popup state
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [claimType, setClaimType] = useState("");

  // Fetch unclaimed pickup orders
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/order/unclaimed`);
      const data = await res.json();
      setAllOrders(
        (data.orders || []).filter((order) => !order.pickupClaimedBy)
      );
    } catch (err) {
      toast.error("Failed to fetch pickup orders");
    } finally {
      setLoading(false);
    }
  };

  // Show confirmation popup for pickup
  const handleGetDealClick = (orderId) => {
    setSelectedOrder(orderId);
    setClaimType("pickup");
    setShowConfirmPopup(true);
  };

  // Show confirmation popup for delivery
  const handleClaimDeliveryClick = (orderId) => {
    setSelectedOrder(orderId);
    setClaimType("delivery");
    setShowConfirmPopup(true);
  };

  // Confirm and proceed with claiming
  const handleConfirmClaim = () => {
    if (claimType === "pickup") {
      handleGetDeal(selectedOrder);
    } else if (claimType === "delivery") {
      handleClaimDelivery(selectedOrder);
    }
    setShowConfirmPopup(false);
    setSelectedOrder(null);
    setClaimType("");
  };

  // Cancel claiming
  const handleCancelClaim = () => {
    setShowConfirmPopup(false);
    setSelectedOrder(null);
    setClaimType("");
  };

  // Claim pickup order
  const handleGetDeal = async (orderId) => {
    const token = localStorage.getItem("deliveryToken");

    try {
      const res = await fetch(`${API_BASE_URL}/order/claimpickup/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Pickup claimed successfully!");
        setAllOrders((prev) => prev.filter((o) => o._id !== orderId));
        fetchDeliveryOrders();
      } else {
        toast.error(data.message || "Failed to claim pickup");
      }
    } catch (err) {
      toast.error("Error claiming pickup");
    }
  };

  // Fetch delivery orders
  const fetchDeliveryOrders = async () => {
    const token = localStorage.getItem("deliveryToken");
    try {
      const res = await fetch(`${API_BASE_URL}/order/delivery-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setDeliveryOrders(data.orders || []);
      else toast.error(data.message || "Failed to fetch delivery orders");
    } catch (err) {
      toast.error("Error fetching delivery orders");
    }
  };

  // Claim delivery order
  const handleClaimDelivery = async (orderId) => {
    const token = localStorage.getItem("deliveryToken");

    try {
      const res = await fetch(
        `${API_BASE_URL}/order/claimdlievery/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Delivery claimed successfully!");
        fetchDeliveryOrders();
      } else {
        toast.error(data.message || "Failed to claim delivery");
      }
    } catch (err) {
      toast.error("Error claiming delivery");
    }
  };

  useEffect(() => {
    fetchAllOrders();
    fetchDeliveryOrders();
  }, []);

  const pickupOrders = allOrders.filter((order) =>
    ["Scheduled", "In Progress"].includes(order.status)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      case "Washed":
        return "bg-yellow-100 text-yellow-800";
      case "Picking Up":
        return "bg-green-100 text-green-800";
      case "Ready for Pickup":
        return "bg-indigo-100 text-indigo-800";
      case "Out for Delivery":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen  bg-gray-50 pb-20 p-4 md:p-6">
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <span className="text-yellow-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm {claimType === "pickup" ? "Pickup" : "Delivery"} Claim
              </h3>
              <p className="text-sm text-gray-600">
                Once you claim the order for{" "}
                {claimType === "pickup" ? "pickup" : "delivery"}, you cannot
                cancel it. Are you sure?
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelClaim}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClaim}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Delivery Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium ${
              tab === "pickup"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setTab("pickup")}
          >
            Pickup Orders
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium ${
              tab === "delivery"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setTab("delivery")}
          >
            Delivery Orders
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Pickup Orders */}
            {tab === "pickup" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pickupOrders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center col-span-full">
                    <p className="text-gray-500">No pickup orders available</p>
                  </div>
                ) : (
                  pickupOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                    >
                      <div className="p-5 bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 max-w-sm w-full">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">👤</span>
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {order.userName}
                            </h3>
                          </div>
                          <div
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg"> 📦</span>
                            <p>
                              <span className="text-black mr-2">
                                Service Type:
                              </span>
                              {order.services[0]?.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg"> ℹ️</span>
                            <p>
                              <span className="text-black mr-2">
                                Service Quantity:
                              </span>
                              {order.services[0]?.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">📞</span>
                            <p>
                              <span className="text-black mr-2">Mobile:</span>
                              {order.userMobile}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2">
                            <span className="mt-1">📍</span>
                            <p>
                              <span className="text-black mr-2">
                                Pickup Address:
                              </span>
                              {order.userAddress}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2">
                            <span className="mt-1">📍</span>
                            <p>
                              <span className="text-black mr-2">
                                Delivery Address:
                              </span>
                              {order.vendorAddress}
                            </p>
                          </div>

                          <div className="flex items-center justify-between space-x-2">
                            <div className="flex space-x-2">
                              <span>⏰</span>
                              <p>
                                <span className="text-black mr-2">Date:</span>
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div
                              className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              ₹ 25
                            </div>
                          </div>

                          <button
                            onClick={() => handleGetDealClick(order._id)}
                            className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105"
                          >
                            <span>Claim This Delivery</span>
                            <span className="text-lg">🚚</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Delivery Orders */}
            {tab === "delivery" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {deliveryOrders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center col-span-full">
                    <p className="text-gray-500">No delivery orders available</p>
                  </div>
                ) : (
                  deliveryOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                    >
                      <div className="p-5 bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 max-w-sm w-full">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">👤</span>
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {order.userName}
                            </h3>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg"> 📦</span>
                            <p>
                              <span className="text-black mr-2">
                                Service Type:
                              </span>
                              {order.services[0]?.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg"> ℹ️</span>
                            <p>
                              <span className="text-black mr-2">
                                Service Quantity:
                              </span>
                              {order.services[0]?.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">📞</span>
                            <p>
                              <span className="text-black mr-2">Mobile:</span>
                              {order.userMobile}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2">
                            <span className="mt-1">📍</span>
                            <p>
                              <span className="text-black mr-2">
                                Pickup Address:
                              </span>
                              {order.userAddress}
                            </p>
                          </div>

                          <div className="flex items-start space-x-2">
                            <span className="mt-1">📍</span>
                            <p>
                              <span className="text-black mr-2">
                                Delivery Address:
                              </span>
                              {order.vendorAddress}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span>⏰</span>
                            <p>
                              <span className="text-black mr-2">Date:</span>
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <button
                            onClick={() => handleClaimDeliveryClick(order._id)}
                            className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105"
                          >
                            <span>Claim This Delivery</span>
                            <span className="text-lg">🚚</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
