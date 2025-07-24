import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const DeliveryDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [tab, setTab] = useState("pickup");
  const [allOrders, setAllOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/order/all`);
      const data = await res.json();
      setAllOrders(data.orders);
    } catch (err) {
      toast.error("Failed to fetch orders");
    }
  };

  const handleGetDeal = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/order/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Ready for Pickup" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Order status updated");
        fetchAllOrders();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error updating order");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const pickupOrders = allOrders.filter((order) =>
    ["Scheduled", "In Progress"].includes(order.status)
  );

  return (
    <div className="p-6 pt-3 h-[100vh] max-w-md mx-auto ">
      <ToastContainer />
      <div className="flex gap-3 mb-4 bg-blue-50 px-4 py-1 rounded shadow">
        <button
          className={`px-8 py-1  rounded ${
            tab === "pickup" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("pickup")}
        >
          Pickup
        </button>
        <button
          className={`px-8 py-1 rounded ${
            tab === "delivery" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("delivery")}
        >
          Delivery
        </button>
      </div>

      {tab === "pickup" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {pickupOrders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow">
              <h3 className="font-bold text-lg mb-2">{order.name}</h3>
              <p>Quantity: {order.quantity}</p>
              <p>Status: {order.status}</p>
              <p>Price: ₹{order.price}</p>
              <p className="text-sm text-gray-600 mt-1">
                Placed: {new Date(order.date).toLocaleString()}
              </p>
              <button
                onClick={() => handleGetDeal(order._id)}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
              >
                Get this deal
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "delivery" && (
        <div className="text-gray-600">Delivery orders view coming soon...</div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
