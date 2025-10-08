import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PickupOrders from "../../components/delievery/PickupOrders";
import DeliveryOrders from "../../components/delievery/DeliveryOrders";
import WalletWithdraw from "../../components/delievery/WalletWithdraw ";

const MyDeals = () => {
  const [pickupOrders, setPickupOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("pickup");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchMyDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("deliveryToken");

      // Pickup Orders
      const resPickup = await fetch(`${API_BASE_URL}/order/my-pickup-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pickupData = await resPickup.json();

      // Delivery Orders
      const resDelivery = await fetch(
        `${API_BASE_URL}/order/my-delivery-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const deliveryData = await resDelivery.json();

      setPickupOrders(pickupData.orders || []);
      setDeliveryOrders(deliveryData.orders || []);
    } catch (error) {
      toast.error("Network error fetching deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDeals();
  }, []);

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 p-4 pb-20 md:p-6">
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
      
      {/* Header with Wallet Icon */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          My Orders
        </h1>
        
        {/* Wallet Component */}
        <WalletWithdraw 
          pickupOrders={pickupOrders} 
          deliveryOrders={deliveryOrders} 
        />
      </div>
      
      {/* Main Tabs */}
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeMainTab === "pickup"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveMainTab("pickup")}
        >
          My Pickup
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeMainTab === "delivery"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveMainTab("delivery")}
        >
          My Delivery
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {activeMainTab === "pickup" && (
            <PickupOrders 
              pickupOrders={pickupOrders} 
              fetchMyDeals={fetchMyDeals} 
            />
          )}
          {activeMainTab === "delivery" && (
            <DeliveryOrders 
              deliveryOrders={deliveryOrders} 
              fetchMyDeals={fetchMyDeals} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default MyDeals;