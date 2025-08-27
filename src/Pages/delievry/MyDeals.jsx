import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaMapMarkerAlt, FaClock, FaTruck } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";

const MyDeals = () => {
  const [pickupOrders, setPickupOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [showOtpField, setShowOtpField] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("pickup");
  const [activePickupTab, setActivePickupTab] = useState("pending");
  const [activeDeliveryTab, setActiveDeliveryTab] = useState("pickingUp");

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

  const handleOtpSubmit = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!otpInputs[orderId] || otpInputs[orderId].length !== 4) {
        toast.error("Please enter a valid 4-digit OTP");
        return;
      }

      let endpoint = "";
      if (activeMainTab === "pickup") {
        endpoint = `${API_BASE_URL}/order/verify-otp/${orderId}`;
      } else if (activeMainTab === "delivery") {
        if (activeDeliveryTab === "pickingUp")
          endpoint = `${API_BASE_URL}/order/verify-otp-delivery-pickup/${orderId}`;
        else if (activeDeliveryTab === "deliveryPickedUp")
          endpoint = `${API_BASE_URL}/order/verify-otp-final-delivery/${orderId}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otpInputs[orderId] }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified successfully!");
        fetchMyDeals();
        setShowOtpField({ ...showOtpField, [orderId]: false });
        setOtpInputs({});
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("Error verifying OTP");
    }
  };

  // Pickup Orders
  const pendingPickupOrders = pickupOrders.filter(
    (o) => o.status === "Ready for Pickup" || o.status === "Scheduled"
  );
  const completedPickupOrders = pickupOrders.filter(
    (o) => o.status === "Picked Up"
  );

  // Delivery Orders
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
      case "Picked Up":
        return `${base} bg-green-100 text-green-800`;
      case "Delivered":
        return `${base} bg-purple-100 text-purple-800`;
      case "Delievery Picked Up":
        return `${base} bg-blue-100 text-blue-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const renderPickupTab = () => (
    <>
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1 mt-4">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activePickupTab === "pending"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActivePickupTab("pending")}
        >
          Pending Orders ({pendingPickupOrders.length})
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activePickupTab === "completed"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActivePickupTab("completed")}
        >
          Picked Up Orders ({completedPickupOrders.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activePickupTab === "pending"
          ? pendingPickupOrders
          : completedPickupOrders
        ).length > 0 ? (
          (activePickupTab === "pending"
            ? pendingPickupOrders
            : completedPickupOrders
          ).map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              showOtpField={showOtpField}
              setShowOtpField={setShowOtpField}
              otpInputs={otpInputs}
              setOtpInputs={setOtpInputs}
              handleOtpSubmit={handleOtpSubmit}
              getStatusBadge={getStatusBadge}
              actionText={
                activePickupTab === "completed" ? null : "Verify Pickup"
              }
              actionColor="from-amber-500 to-orange-600"
              showOtpBadge={activePickupTab === "completed"}
            />
          ))
        ) : (
          <EmptyState
            title="No orders"
            description="All your pickup orders are cleared"
          />
        )}
      </div>
    </>
  );

  const renderDeliveryTab = () => (
    <>
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1 mt-4">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeDeliveryTab === "pickingUp"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveDeliveryTab("pickingUp")}
        >
          Picking Up ({pickingUpOrders.length})
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeDeliveryTab === "deliveryPickedUp"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveDeliveryTab("deliveryPickedUp")}
        >
          Delivery Picked Up ({deliveryPickedUpOrders.length})
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeDeliveryTab === "delivered"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveDeliveryTab("delivered")}
        >
          Delivered ({deliveredOrders.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeDeliveryTab === "pickingUp"
          ? pickingUpOrders
          : activeDeliveryTab === "deliveryPickedUp"
          ? deliveryPickedUpOrders
          : deliveredOrders
        ).length > 0 ? (
          (activeDeliveryTab === "pickingUp"
            ? pickingUpOrders
            : activeDeliveryTab === "deliveryPickedUp"
            ? deliveryPickedUpOrders
            : deliveredOrders
          ).map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              showOtpField={showOtpField}
              setShowOtpField={setShowOtpField}
              otpInputs={otpInputs}
              setOtpInputs={setOtpInputs}
              handleOtpSubmit={handleOtpSubmit}
              getStatusBadge={getStatusBadge}
              actionText={
                activeDeliveryTab === "delivered" ? null : "Verify Delivery"
              }
              actionColor="from-blue-500 to-indigo-600"
              showOtpBadge={false}
            />
          ))
        ) : (
          <EmptyState
            title="No orders"
            description="All your deliveries are cleared"
          />
        )}
      </div>
    </>
  );

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          My Orders
        </h1>
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
          {activeMainTab === "pickup" && renderPickupTab()}
          {activeMainTab === "delivery" && renderDeliveryTab()}
        </>
      )}
    </div>
  );
};

// Order Card Component
const OrderCard = ({
  order,
  showOtpField,
  setShowOtpField,
  otpInputs,
  setOtpInputs,
  handleOtpSubmit,
  getStatusBadge,
  actionText = "Verify",
  actionColor = "from-blue-500 to-indigo-600",
  showOtpBadge = false,
}) => {
  const totalQuantity = order.services
    ? order.services.reduce((t, s) => t + s.quantity, 0)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border  border-gray-100">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {order.userName}
            </h3>
          </div>
          <span className={getStatusBadge(order.status)}>{order.status}</span>
        </div>

        <div className="mt-4 text-gray-600 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg"> 📦</span>
            <p>
              <span className="text-black mr-2">Service Type:</span>
              {order.services[0]?.name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg"> ℹ️</span>
            <p>
              <span className="text-black mr-2">Service Quantity:</span>
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
              <span className="text-black mr-2">Pickup Address:</span>
              {order.userAddress}
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="mt-1">📍</span>
            <p>
              <span className="text-black mr-2">Delivery Address:</span>
              {order.vendorAddress}
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex space-x-2" >
              <span>⏰</span>
              <p>
                <span className="text-black mr-2">Date:</span>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className={getStatusBadge(order.status)}>₹ 50</div>
          </div>
        </div>

        {showOtpField && showOtpField[order._id] ? (
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
                className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600 text-white py-2 px-4 rounded-lg"
              >
                Confirm
              </button>
              <button
                onClick={() =>
                  setShowOtpField({ ...showOtpField, [order._id]: false })
                }
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {actionText && (
              <button
                onClick={() =>
                  setShowOtpField({ ...showOtpField, [order._id]: true })
                }
                className={`mt-4 w-full bg-gradient-to-r ${actionColor} text-white py-2 px-4 rounded-lg`}
              >
                {actionText}
              </button>
            )}
            {showOtpBadge && (
              <div className="mt-4">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  OTP: {order.otp || "N/A"}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ title, description }) => (
  <div className="col-span-full text-center py-10">
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-gray-400 mt-1">{description}</p>
  </div>
);

export default MyDeals;
