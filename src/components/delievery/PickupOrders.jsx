import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaUser, FaSync } from "react-icons/fa";
import CODConfirmationModal from "./CODConfirmationModal";

const PickupOrders = ({ pickupOrders, fetchMyDeals }) => {
  const [otpInputs, setOtpInputs] = useState({});
  const [showOtpField, setShowOtpField] = useState({});
  const [activePickupTab, setActivePickupTab] = useState("pending");
  const [showCODModal, setShowCODModal] = useState(false);
  const [currentCODOrder, setCurrentCODOrder] = useState(null);
  const [generatedOTPs, setGeneratedOTPs] = useState({});
  const [generatingOTP, setGeneratingOTP] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleOtpSubmit = async (orderId, order) => {
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!otpInputs[orderId] || otpInputs[orderId].length !== 4) {
        toast.error("Please enter a valid 4-digit OTP");
        return;
      }

      // Check if COD payment
      if (
        order.paymentMethod === "cod" &&
        order.paymentStatus !== "collected"
      ) {
        setCurrentCODOrder({ orderId, order });
        setShowCODModal(true);
        return;
      }

      // If not COD or already collected, proceed normally
      await submitOTPVerification(orderId, false);
    } catch (error) {
      toast.error("Error verifying OTP");
    }
  };

  const submitOTPVerification = async (orderId, codCollected = false) => {
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!token) {
        toast.error("Please login again!");
        return;
      }

      const payload = {
        otp: otpInputs[orderId],
        codConfirmed: Boolean(codCollected), 
        orderId,
      };

      const res = await fetch(`${API_BASE_URL}/order/verify-otp/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified successfully!");
        if (codCollected) toast.success("COD amount added to your wallet!");
        setShowOtpField({ ...showOtpField, [orderId]: false });
        setOtpInputs({});
        setShowCODModal(false);
        setCurrentCODOrder(null);
        fetchMyDeals();
      } else {
        if (data.requiresCODConfirmation) {
          setCurrentCODOrder({
            orderId,
            order: pickupOrders.find((o) => o._id === orderId),
          });
          setShowCODModal(true);
        } else {
          toast.error(data.message || "OTP verification failed");
        }
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error("Error verifying OTP");
    }
  };

  const handleGenerateOTP = async (orderId) => {
    try {
      setGeneratingOTP({ ...generatingOTP, [orderId]: true });
      const token = localStorage.getItem("deliveryToken");
      
      if (!token) {
        toast.error("Please login again!");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/order/regenerate-otp/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedOTPs({ ...generatedOTPs, [orderId]: data.newOtp });
        toast.success("New OTP generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate OTP");
      }
    } catch (error) {
      console.error("Generate OTP error:", error);
      toast.error("Error generating OTP");
    } finally {
      setGeneratingOTP({ ...generatingOTP, [orderId]: false });
    }
  };

  const handleCODConfirm = () => {
    if (currentCODOrder) {
      submitOTPVerification(currentCODOrder.orderId, true);
    }
  };

  const handleCODCancel = () => {
    setShowCODModal(false);
    setCurrentCODOrder(null);
    toast.info("Please collect cash before confirming");
  };

  // Separate Pending & Completed orders
  const pendingPickupOrders = pickupOrders.filter(
    (o) => o.status === "Ready for Pickup" || o.status === "Scheduled"
  );
  const completedPickupOrders = pickupOrders.filter(
    (o) => o.status === "Picked Up"
  );

  const getStatusBadge = (status) => {
    const base = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
      case "Ready for Pickup":
        return `${base} bg-amber-100 text-amber-800`;
      case "Scheduled":
        return `${base} bg-blue-100 text-blue-800`;
      case "Picked Up":
        return `${base} bg-green-100 text-green-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getPaymentBadge = (paymentMethod, paymentStatus) => {
    if (paymentMethod === "online" || paymentStatus === "completed") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          💳 Paid Online
        </span>
      );
    }
    if (paymentMethod === "cod") {
      if (paymentStatus === "collected") {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            💰 Payment Collected
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          💵 Payment Pending
        </span>
      );
    }
    return null;
  };

  return (
    <div>
      {/* COD Confirmation Modal */}
      {showCODModal && currentCODOrder && (
        <CODConfirmationModal
          order={currentCODOrder.order}
          onConfirm={handleCODConfirm}
          onCancel={handleCODCancel}
        />
      )}

      {/* Sub Tabs */}
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

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activePickupTab === "pending"
          ? pendingPickupOrders
          : completedPickupOrders
        ).length > 0 ? (
          (activePickupTab === "pending"
            ? pendingPickupOrders
            : completedPickupOrders
          ).map((order) => (
            <PickupOrderCard
              key={order._id}
              order={order}
              showOtpField={showOtpField}
              setShowOtpField={setShowOtpField}
              otpInputs={otpInputs}
              setOtpInputs={setOtpInputs}
              handleOtpSubmit={handleOtpSubmit}
              getStatusBadge={getStatusBadge}
              getPaymentBadge={getPaymentBadge}
              showOtpBadge={activePickupTab === "completed"}
              handleGenerateOTP={handleGenerateOTP}
              generatedOTPs={generatedOTPs}
              generatingOTP={generatingOTP}
            />
          ))
        ) : (
          <EmptyState
            title="No orders"
            description={
              activePickupTab === "pending"
                ? "All your pickup orders are cleared"
                : "No completed pickups yet"
            }
          />
        )}
      </div>
    </div>
  );
};

const PickupOrderCard = ({
  order,
  showOtpField,
  setShowOtpField,
  otpInputs,
  setOtpInputs,
  handleOtpSubmit,
  getStatusBadge,
  getPaymentBadge,
  showOtpBadge = false,
  handleGenerateOTP,
  generatedOTPs,
  generatingOTP,
}) => {
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

        {/* Payment Badge */}
        <div className="mb-3">
          {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
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
            <div className="flex space-x-2">
              <span>⏰</span>
              <p>
                <span className="text-black mr-2">Date:</span>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className={getStatusBadge(order.status)}>₹ 25</div>
          </div>

          {/* Total Amount */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-700">Total Amount:</span>
            <span className="text-xl font-bold text-green-600">
              ₹{order.totalPrice}
            </span>
          </div>
        </div>

        {showOtpField[order._id] ? (
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleOtpSubmit(order._id, order)}
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
            {order.status !== "Picked Up" && (
              <button
                onClick={() =>
                  setShowOtpField({ ...showOtpField, [order._id]: true })
                }
                className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 px-4 rounded-lg"
              >
                Verify Pickup
              </button>
            )}
            {showOtpBadge && (
              <div className="mt-4 space-y-3">
                {/* OTP Display Section */}
                {generatedOTPs[order._id] ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-xs text-green-600 font-medium mb-1">New OTP Generated</p>
                      <p className="text-2xl font-bold text-green-800 tracking-wider">
                        {generatedOTPs[order._id]}
                      </p>
                    </div>
                    <button
                      onClick={() => handleGenerateOTP(order._id)}
                      disabled={generatingOTP[order._id]}
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                      title="Regenerate OTP"
                    >
                      <FaSync className={`text-green-600 ${generatingOTP[order._id] ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateOTP(order._id)}
                    disabled={generatingOTP[order._id]}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingOTP[order._id] ? (
                      <>
                        <FaSync className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FaSync />
                        <span>Generate OTP</span>
                      </>
                    )}
                  </button>
                )}
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
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-gray-400 mt-1">{description}</p>
  </div>
);

export default PickupOrders;