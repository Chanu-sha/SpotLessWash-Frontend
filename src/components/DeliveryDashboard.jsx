// ---------- DeliveryDashboard.jsx ----------
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveryDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [tab, setTab] = useState("pickup");
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dhobis, setDhobis] = useState([]);
  const [selectedDhobi, setSelectedDhobi] = useState({});
  const [deliveryOrders, setDeliveryOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/order/unclaimed`);
      const data = await res.json();
      setAllOrders((data.orders || []).filter((order) => !order.claimedBy));
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDeal = async (orderId) => {
    const token = localStorage.getItem("deliveryToken");
    const dhobiId = selectedDhobi[orderId];

    if (!dhobiId) {
      toast.error("Please select a dhobi first");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/deliveryboy/claim/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dhobiId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Deal claimed successfully!");
        setAllOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        toast.error(data.message || "Failed to claim deal");
      }
    } catch (err) {
      toast.error("Error claiming deal");
    }
  };

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
  
  const handleClaimDelivery = async (orderId) => {
    const token = localStorage.getItem("deliveryToken");

    try {
      const res = await fetch(`${API_BASE_URL}/order/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Picking Up" }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Order status set to Picking Up");
        fetchDeliveryOrders(); 
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating order status");
    }
  };

  const fetchDhobis = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dhobi/all`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      setDhobis(data || []);
    } catch (err) {
      toast.error("Failed to load dhobi list");
    }
  };

  useEffect(() => {
    fetchAllOrders();
    fetchDhobis();
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Delivery Dashboard
        </h1>

        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              tab === "pickup"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setTab("pickup")}
          >
            Pickup Orders
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
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
            {tab === "pickup" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pickupOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {order.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div>Quantity: {order.quantity}</div>
                        <div>Address: {order.address || "N/A"}</div>
                        <div>Mobile: {order.mobile || "N/A"}</div>
                        <div>{new Date(order.date).toLocaleString()}</div>

                        <select
                          value={selectedDhobi[order._id] || ""}
                          onChange={(e) =>
                            setSelectedDhobi({
                              ...selectedDhobi,
                              [order._id]: e.target.value,
                            })
                          }
                          className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Dhobi</option>
                          {dhobis
                            .filter((d) => d.approved && !d.rejected)
                            .map((d) => (
                              <option key={d._id} value={d._id}>
                                {d.name} -{d.address || "No address"}
                              </option>
                            ))}
                        </select>

                        <button
                          onClick={() => handleGetDeal(order._id)}
                          className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
                        >
                          Claim This Delivery
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "delivery" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {deliveryOrders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center col-span-full">
                    <p className="text-gray-500">
                      No delivery orders available
                    </p>
                  </div>
                ) : (
                  deliveryOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {order.name}
                          </h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                          <div>Quantity: {order.quantity}</div>
                          <div>Address: {order.address || "N/A"}</div>
                          <div>Mobile: {order.mobile || "N/A"}</div>
                          <div>{new Date(order.date).toLocaleString()}</div>

                          {order.assignedDhobi && (
                            <div className="mt-2 text-gray-600 text-sm">
                              <p className="font-medium text-gray-700">
                                Assigned Dhobi:
                              </p>
                              <p>{order.assignedDhobi.name}</p>
                              <p>{order.assignedDhobi.address}</p>
                              <p>{order.assignedDhobi.mobile}</p>
                            </div>
                          )}

                          <button
                            onClick={() => handleClaimDelivery(order._id)}
                            className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
                          >
                            Claim This Delivery
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
