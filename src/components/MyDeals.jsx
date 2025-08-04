import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyDeals = () => {
  const [deals, setDeals] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [showOtpField, setShowOtpField] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("pickup");
  const [activePickupTab, setActivePickupTab] = useState("pending");
  const [activeDeliveryTab, setActiveDeliveryTab] = useState("deliveryPickup");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("deliveryToken");
      const res = await fetch(`${API_BASE_URL}/deliveryboy/my-deals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setDeals(data.orders || []);
      } else {
        toast.error(data.message || "Failed to fetch deals");
      }
    } catch (error) {
      toast.error("Network error fetching deals");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!otpInputs[orderId] || otpInputs[orderId].length !== 4) {
        toast.error("Please enter a valid 4-digit OTP");
        return;
      }

      let endpoint = "";

      if (
        activeMainTab === "delivery" &&
        activeDeliveryTab === "deliveryPickup"
      ) {
        // 🟡 Before delivery (start delivery)
        endpoint = `${API_BASE_URL}/order/verify-otp-delivery-pickup/${orderId}`;
      } else if (
        activeMainTab === "delivery" &&
        activeDeliveryTab === "delivered"
      ) {
        // ✅ Final delivery (hand over to customer)
        endpoint = `${API_BASE_URL}/order/verify-otp-final-delivery/${orderId}`;
      } else {
        // 🔵 Pickup OTP
        endpoint = `${API_BASE_URL}/order/verify-otp/${orderId}`;
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
        toast.success("✅ OTP verified successfully!");
        fetchDeals();
        setShowOtpField({ ...showOtpField, [orderId]: false });
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("Error verifying OTP");
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const sortedDeals = [...deals].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Pickup Tab Filters
  const pendingPickupOrders = sortedDeals.filter(
    (order) => order.status === "Ready for Pickup"
  );

  const completedPickupOrders = sortedDeals.filter(
    (order) => order.status === "Picked Up"
  );

  // Delivery Tab Filters
  const deliveryPickupOrders = sortedDeals.filter(
    (order) => order.status === "Picking Up"
  );

  const deliveredOrders = sortedDeals.filter(
    (order) =>
      order.status === "Delivered" || order.status === "Delievery Picked Up"
  );

  const getStatusBadge = (status) => {
    const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
      case "Ready for Pickup":
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case "Picked Up":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Ready for Delivery":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Delivered":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "Cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const renderPickupTab = () => (
    <>
      {/* Pickup Tab Navigation */}
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1 mt-4">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activePickupTab === "pending"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActivePickupTab("pending")}
        >
          Pending Orders
          {pendingPickupOrders.length > 0 && (
            <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
              {pendingPickupOrders.length}
            </span>
          )}
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activePickupTab === "completed"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActivePickupTab("completed")}
        >
          Picked Up Orders
          {completedPickupOrders.length > 0 && (
            <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
              {completedPickupOrders.length}
            </span>
          )}
        </button>
      </div>

      {activePickupTab === "pending" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingPickupOrders.length > 0 ? (
            pendingPickupOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                showOtpField={showOtpField}
                setShowOtpField={setShowOtpField}
                otpInputs={otpInputs}
                setOtpInputs={setOtpInputs}
                handleOtpSubmit={handleOtpSubmit}
                getStatusBadge={getStatusBadge}
                actionText="Verify Pickup"
                actionColor="from-amber-500 to-orange-600"
              />
            ))
          ) : (
            <EmptyState
              icon={
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
              title="No pending orders"
              description="All your pickup orders are completed"
            />
          )}
        </div>
      )}

      {activePickupTab === "completed" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {completedPickupOrders.length > 0 ? (
            completedPickupOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                showOtpField={false}
                getStatusBadge={getStatusBadge}
                showOtpBadge={true}
              />
            ))
          ) : (
            <EmptyState
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="No picked up orders yet"
              description="Your completed pickups will appear here"
            />
          )}
        </div>
      )}
    </>
  );

  const renderDeliveryTab = () => (
    <>
      {/* Delivery Tab Navigation */}
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1 mt-4">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeDeliveryTab === "deliveryPickup"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveDeliveryTab("deliveryPickup")}
        >
          Delivery Pickup
          {deliveryPickupOrders.length > 0 && (
            <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
              {deliveryPickupOrders.length}
            </span>
          )}
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeDeliveryTab === "delivered"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveDeliveryTab("delivered")}
        >
          Delivered
          {deliveredOrders.length > 0 && (
            <span className="ml-2 bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
              {deliveredOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeDeliveryTab === "deliveryPickup" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {deliveryPickupOrders.length > 0 ? (
            deliveryPickupOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                showOtpField={showOtpField}
                setShowOtpField={setShowOtpField}
                otpInputs={otpInputs}
                setOtpInputs={setOtpInputs}
                handleOtpSubmit={handleOtpSubmit}
                getStatusBadge={getStatusBadge}
                actionText="Verify Delivery"
                actionColor="from-blue-500 to-indigo-600"
              />
            ))
          ) : (
            <EmptyState
              icon={
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
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              title="No delivery pickup orders"
              description="All orders ready for delivery will appear here"
            />
          )}
        </div>
      )}

      {deliveredOrders.length > 0 ? (
        deliveredOrders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            showOtpField={showOtpField}
            setShowOtpField={setShowOtpField}
            otpInputs={otpInputs}
            setOtpInputs={setOtpInputs}
            handleOtpSubmit={handleOtpSubmit}
            getStatusBadge={getStatusBadge}
            actionText="Verify Delivery OTP"
            actionColor="from-purple-500 to-violet-600"
          />
        ))
      ) : (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="No delivered orders yet"
          description="Your delivered orders will appear here"
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 p-4 pb-14 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Orders
          </h1>
        </div>

        {/* Main Tab Navigation */}
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
    </div>
  );
};

// Reusable Order Card Component
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
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {order.name}
          </h3>
          <span className={getStatusBadge(order.status)}>{order.status}</span>
        </div>

        <div className="mt-4 space-y-2">
          {/* Quantity */}
          <div className="flex items-center text-gray-600">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span>Quantity: {order.quantity}</span>
          </div>

          {/* Address */}
          <div className="flex items-start text-gray-600">
            <svg
              className="w-4 h-4 mt-1 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2z M12 22s8-5.33 8-10a8 8 0 10-16 0c0 4.67 8 10 8 10z"
              />
            </svg>
            <span className="break-words">
              Address: {order.address || "N/A"}
            </span>
          </div>
          {order.assignedDhobi && (
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <div>
                <strong>Assigned Dhobi:</strong> {order.assignedDhobi.name}
              </div>
              <div>
                <strong>Dhobi Phone:</strong> {order.assignedDhobi.phone}
              </div>
              <div>
                <strong>Dhobi Address:</strong> {order.assignedDhobi.address}
              </div>
            </div>
          )}

          {/* Mobile Number */}
          <div className="flex items-center text-gray-600">
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h1.5a.5.5 0 01.5.5V6a.5.5 0 01-.5.5H5.5a.5.5 0 00-.5.5v1.379a16.24 16.24 0 0010.121 10.121H16a.5.5 0 00.5-.5v-1.5a.5.5 0 01.5-.5h2.5a.5.5 0 01.5.5V19a2 2 0 01-2 2C9.716 21 3 14.284 3 6a1 1 0 010-.02V5z"
              />
            </svg>
            <span>Mobile: {order.mobile || "N/A"}</span>
          </div>

          {/* Date */}
          <div className="flex items-center text-gray-500 text-sm">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{new Date(order.date).toLocaleString()}</span>
          </div>
        </div>

        {showOtpField && showOtpField[order._id] ? (
          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor={`otp-${order._id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter 4-digit OTP
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
                onClick={() => handleOtpSubmit(order._id)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() =>
                  setShowOtpField({
                    ...showOtpField,
                    [order._id]: false,
                  })
                }
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow-sm font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {setShowOtpField && (
              <button
                onClick={() =>
                  setShowOtpField({
                    ...showOtpField,
                    [order._id]: true,
                  })
                }
                className={`mt-4 w-full bg-gradient-to-r ${actionColor} hover:from-amber-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg shadow-sm font-medium transition-all transform hover:scale-[1.02]`}
              >
                {actionText}
              </button>
            )}
            {showOtpBadge && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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

// Reusable Empty State Component
const EmptyState = ({ icon, title, description }) => (
  <div className="col-span-full text-center py-10">
    <div className="text-gray-400 mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-gray-400 mt-1">{description}</p>
  </div>
);

export default MyDeals;
