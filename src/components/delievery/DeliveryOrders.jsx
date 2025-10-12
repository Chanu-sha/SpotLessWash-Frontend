import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";

const DeliveryOrders = ({ deliveryOrders, fetchMyDeals }) => {
  const [otpInputs, setOtpInputs] = useState({});
  const [showOtpField, setShowOtpField] = useState({});
  const [activeTab, setActiveTab] = useState("pickingUp");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleOtpSubmit = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!otpInputs[orderId] || otpInputs[orderId].length !== 4) {
        toast.error("Please enter a valid 4-digit OTP");
        return;
      }

      await submitOtpToBackend(orderId, otpInputs[orderId]);
    } catch (error) {
      toast.error("Error verifying OTP");
    }
  };

  const submitOtpToBackend = async (orderId, otp) => {
    try {
      const token = localStorage.getItem("deliveryToken");

      let endpoint = "";
      let successMessage = "";

      if (activeTab === "pickingUp") {
        endpoint = `${API_BASE_URL}/order/verify-otp-delivery-pickup/${orderId}`;
        successMessage = "Pickup verified successfully!";
      } else if (activeTab === "deliveryPickedUp") {
        endpoint = `${API_BASE_URL}/order/verify-otp-final-delivery/${orderId}`;
        successMessage = "Delivery completed successfully!";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(successMessage);
        fetchMyDeals();
        setShowOtpField({ ...showOtpField, [orderId]: false });
        setOtpInputs({});

        if (activeTab === "deliveryPickedUp") {
          await incrementDeliveryCountSilent();
        }
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("Error verifying OTP");
    }
  };

  const incrementDeliveryCountSilent = async () => {
    try {
      const token = localStorage.getItem("deliveryToken");
      await fetch(`${API_BASE_URL}/deliveryboy/increment-delivery-count`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error updating delivery count:", error);
    }
  };

  const pickingUpOrders = deliveryOrders.filter(
    (o) => o.status === "Picking Up"
  );
  const deliveryPickedUpOrders = deliveryOrders.filter(
    (o) => o.status === "Delievery Picked Up"
  );
  const deliveredOrders = deliveryOrders.filter(
    (o) => o.status === "Delivered"
  );

  const getStatusBadge = (status) => {
    const base = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
      case "Picking Up":
        return `${base} bg-amber-100 text-amber-800`;
      case "Delievery Picked Up":
        return `${base} bg-blue-100 text-blue-800`;
      case "Delivered":
        return `${base} bg-purple-100 text-purple-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getPaymentBadge = (order) => {
    if (order.paymentMethod === "online") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 w-fit">
          💳 Paid Online
        </span>
      );
    }

    if (order.paymentMethod === "cod") {
      if (order.paymentStatus === "collected") {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 w-fit">
            💰 Payment Collected
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-800 w-fit">
          💵 Payment On Pickup
        </span>
      );
    }

    return null;
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1 mt-4">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "pickingUp"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("pickingUp")}
        >
          Picking Up ({pickingUpOrders.length})
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "deliveryPickedUp"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("deliveryPickedUp")}
        >
          Picked Up ({deliveryPickedUpOrders.length})
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "delivered"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("delivered")}
        >
          Delivered ({deliveredOrders.length})
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeTab === "pickingUp"
          ? pickingUpOrders
          : activeTab === "deliveryPickedUp"
          ? deliveryPickedUpOrders
          : deliveredOrders
        ).length > 0 ? (
          (activeTab === "pickingUp"
            ? pickingUpOrders
            : activeTab === "deliveryPickedUp"
            ? deliveryPickedUpOrders
            : deliveredOrders
          ).map((order) => (
            <DeliveryOrderCard
              key={order._id}
              order={order}
              showOtpField={showOtpField}
              setShowOtpField={setShowOtpField}
              otpInputs={otpInputs}
              setOtpInputs={setOtpInputs}
              handleOtpSubmit={handleOtpSubmit}
              getStatusBadge={getStatusBadge}
              getPaymentBadge={getPaymentBadge}
              activeTab={activeTab}
            />
          ))
        ) : (
          <EmptyState
            title="No delivery orders"
            description="All your deliveries are cleared"
          />
        )}
      </div>
    </div>
  );
};

const DeliveryOrderCard = ({
  order,
  showOtpField,
  setShowOtpField,
  otpInputs,
  setOtpInputs,
  handleOtpSubmit,
  getStatusBadge,
  getPaymentBadge,
  activeTab,
}) => {
  const isDelivered = activeTab === "delivered";
  const showOtpInput = !isDelivered;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {order.userName}
            </h3>
          </div>
          <span className={getStatusBadge(order.status)}>{order.status}</span>
        </div>

        <div className="mb-3">{getPaymentBadge(order)}</div>

        <div className="mt-4 text-gray-600 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📦</span>
            <p>
              <span className="text-black mr-2">Service:</span>
              {order.services[0]?.name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">ℹ️</span>
            <p>
              <span className="text-black mr-2">Quantity:</span>
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
              <span className="text-black mr-2">Pickup From:</span>
              {order.vendorAddress}
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="mt-1">🏠</span>
            <p>
              <span className="text-black mr-2">Deliver To:</span>
              {order.userAddress}
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
            <div className={getStatusBadge(order.status)}>₹ 25</div>
          </div>
        </div>

        {/* OTP Section */}
        {showOtpField && showOtpField[order._id] && showOtpInput ? (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              maxLength="4"
              placeholder="Enter OTP"
              value={otpInputs[order._id] || ""}
              onChange={(e) =>
                setOtpInputs({
                  ...otpInputs,
                  [order._id]: e.target.value.replace(/\D/g, ""),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleOtpSubmit(order._id)}
                className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
              >
                {activeTab === "pickingUp"
                  ? "Confirm Pickup"
                  : "Confirm Delivery"}
              </button>
              <button
                onClick={() =>
                  setShowOtpField({ ...showOtpField, [order._id]: false })
                }
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {showOtpInput && (
              <button
                onClick={() =>
                  setShowOtpField({ ...showOtpField, [order._id]: true })
                }
                className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
              >
                {activeTab === "pickingUp"
                  ? "Verify Pickup"
                  : "Verify Delivery"}
              </button>
            )}
            {isDelivered && (
              <div className="mt-4">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  ✅ Successfully Delivered
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ title, description }) => (
  <div className="col-span-full text-center py-10">
    <div className="text-5xl mb-3">📭</div>
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-gray-400 mt-1">{description}</p>
  </div>
);

export default DeliveryOrders;
