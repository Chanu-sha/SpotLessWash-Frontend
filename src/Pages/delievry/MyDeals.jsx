import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaWallet, FaMoneyBillWave, FaTruck } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import PickupOrders from "../../components/delievery/PickupOrders";
import DeliveryOrders from "../../components/delievery/DeliveryOrders";
import WalletWithdraw from "../../components/delievery/WalletWithdraw ";
import CODWalletComponent from "../../components/delievery/CODWalletComponent";

const MyDeals = () => {
  const [pickupOrders, setPickupOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("pickup");
  const [showCODWallet, setShowCODWallet] = useState(false);
  const [showWallets, setShowWallets] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchMyDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("deliveryToken");

      const resPickup = await fetch(`${API_BASE_URL}/order/my-pickup-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pickupData = await resPickup.json();

      const resDelivery = await fetch(`${API_BASE_URL}/order/my-delivery-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    <div className="min-h-screen  bg-gray-50 p-4 pb-20  md:p-6">
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Orders
          </h1>

          {/* Toggle Button with wallet icon and animation */}
          <button
            onClick={() => setShowWallets(!showWallets)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all duration-300 transform hover:scale-105
              ${showWallets 
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"}`}
          >
            <FaWallet
              className={`text-lg transition-transform duration-300 ${
                showWallets ? "rotate-180" : "rotate-0"
              }`}
            />
            {showWallets ? "Hide My Wallets" : "Show My Wallets"}
          </button>
        </div>

        {/* Wallet Section — only show when toggle is ON */}
        {showWallets && (
          <div
            className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              My Wallets
            </h2>
            <div className="flex justify-between gap-3">
              {/* Delivery Wallet */}
              <div className="flex-1">
                <div className="flex flex-col items-center justify-between h-full p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <FaTruck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-blue-800">
                      Delivery Wallet
                    </span>
                  </div>
                  <div className="w-full">
                    <WalletWithdraw
                      pickupOrders={pickupOrders}
                      deliveryOrders={deliveryOrders}
                    />
                  </div>
                </div>
              </div>

              {/* Cash On Pickup Wallet */}
              <div className="flex-1">
                <button
                  onClick={() => setShowCODWallet(true)}
                  className="w-full h-full flex flex-col items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-500 rounded-full">
                      <FaMoneyBillWave className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-green-800">
                      Cash On Pickup
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-md border border-green-300 shadow-sm">
                    <FaWallet className="w-4 h-4 text-green-600" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
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

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {activeMainTab === "pickup" && (
            <PickupOrders pickupOrders={pickupOrders} fetchMyDeals={fetchMyDeals} />
          )}
          {activeMainTab === "delivery" && (
            <DeliveryOrders deliveryOrders={deliveryOrders} fetchMyDeals={fetchMyDeals} />
          )}
        </>
      )}

      {/* Cash On Pickup Wallet Modal */}
      {showCODWallet && (
        <CODWalletComponent
          isOpen={showCODWallet}
          onClose={() => setShowCODWallet(false)}
        />
      )}
    </div>
  );
};

export default MyDeals;