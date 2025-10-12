import { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { RiLoader4Line } from "react-icons/ri";
import { FaSync } from "react-icons/fa";
import { auth } from "../firebase";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Orders() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [activeTab, setActiveTab] = useState("current");
  const [orders, setOrders] = useState({ current: [], past: [] });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedOTPs, setGeneratedOTPs] = useState({});
  const [generatingOTP, setGeneratingOTP] = useState({});

  const statusSteps = [
    "Scheduled",
    "In Progress",
    "Ready for Pickup",
    "Picked Up",
    "Washing",
    "Washed",
    "Picking Up",
    "Delievery Picked Up",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const res = await axios.get(`${API_BASE_URL}/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortByDateDesc = (arr) =>
        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (
        res.data &&
        Array.isArray(res.data.current) &&
        Array.isArray(res.data.past)
      ) {
        setOrders({
          current: sortByDateDesc(res.data.current),
          past: sortByDateDesc(res.data.past),
        });
      } else if (res.data && Array.isArray(res.data)) {
        const current = res.data.filter(
          (o) => o.status !== "Delivered" && o.status !== "Cancelled"
        );
        const past = res.data.filter(
          (o) => o.status === "Delivered" || o.status === "Cancelled"
        );
        setOrders({
          current: sortByDateDesc(current),
          past: sortByDateDesc(past),
        });
      } else {
        console.error("Unexpected response format:", res.data);
        toast.error("Failed to parse orders response");
      }
    } catch (err) {
      console.error("Error fetching orders", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800";
      case "Cancelled":
        return "bg-rose-100 text-rose-800";
      case "Scheduled":
        return "bg-indigo-100 text-indigo-800";
      case "In Progress":
        return "bg-amber-100 text-amber-800";
      case "Delievery Picked Up":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const shouldShowOTP = (status) => {
    const otpVisibleStatuses = ["Scheduled", "In Progress", "Ready for Pickup"];
    return otpVisibleStatuses.includes(status);
  };

  const shouldShowGenerateOTP = (status) => {
    return status === "Delievery Picked Up";
  };

  const handleGenerateOTP = async (orderId) => {
    try {
      setGeneratingOTP({ ...generatingOTP, [orderId]: true });
      const user = auth.currentUser;
      
      if (!user) {
        toast.error("Please login again!");
        return;
      }

      const token = await user.getIdToken();

      const res = await axios.post(
        `${API_BASE_URL}/order/regenerate-otp/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.newOtp) {
        setGeneratedOTPs({ ...generatedOTPs, [orderId]: res.data.newOtp });
        toast.success("New OTP generated successfully!");
      } else {
        toast.error(res.data.message || "Failed to generate OTP");
      }
    } catch (error) {
      console.error("Generate OTP error:", error);
      toast.error(error.response?.data?.message || "Error generating OTP");
    } finally {
      setGeneratingOTP({ ...generatingOTP, [orderId]: false });
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in to cancel an order.");
        return;
      }
      const token = await user.getIdToken();

      if (selectedOrder.status === "Cancelled") {
        toast.info("Order is already cancelled.");
        setShowCancelConfirm(false);
        return;
      }

      if (selectedOrder.status !== "Scheduled") {
        toast.warn("Order can't be cancelled at this stage.");
        setShowCancelConfirm(false);
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/order/${selectedOrder._id}/status`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order cancelled successfully.");
      setShowCancelConfirm(false);
      setShowDetailModal(false);
      fetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Error cancelling order.");
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-gray-50 to-gray-100 pb-14">
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

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="flex">
          {["current", "past"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-medium text-sm ${
                activeTab === tab
                  ? "text-white border-b-2 border-white"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              {tab === "current" ? "Current Orders" : "Past Orders"}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RiLoader4Line className="animate-spin text-indigo-500 text-3xl" />
          </div>
        ) : orders[activeTab]?.length > 0 ? (
          <div className="space-y-4">
            {orders[activeTab].map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {order.vendorName ||
                              order.vendorAddress ||
                              "Vendor"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {order.userName
                              ? `Placed by ${order.userName}`
                              : ""}
                          </p>
                        </div>
                        {shouldShowOTP(order.status) && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            OTP : {order.otp}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-600">
                        {order.services[0]?.name} (x
                        {order.services[0]?.quantity})
                      </span>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)} •{" "}
                        {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <p className="font-medium text-gray-900">
                      ₹{order.totalPrice}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="text-indigo-600 text-sm font-medium flex items-center hover:text-indigo-800"
                      >
                        Check Status <IoIosArrowForward className="ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Generate OTP Button */}
                  {shouldShowGenerateOTP(order.status) && (
                    <div className="mt-3">
                      {generatedOTPs[order._id] ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <p className="text-xs text-green-600 font-medium mb-1">
                              New OTP Generated
                            </p>
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
                            <FaSync
                              className={`text-green-600 ${
                                generatingOTP[order._id] ? "animate-spin" : ""
                              }`}
                            />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateOTP(order._id)}
                          disabled={generatingOTP[order._id]}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>

                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetailModal(true);
                  }}
                  className="w-full py-2 bg-gray-50 text-center text-sm text-gray-600 font-medium border-t border-gray-200 flex items-center justify-center hover:bg-gray-100"
                >
                  View Details <IoIosArrowDown className="ml-1" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No {activeTab === "current" ? "current" : "past"} orders
              </h3>
              <p className="text-gray-500 text-sm">
                You don't have any
                {activeTab === "current" ? "active" : "previous"} orders yet.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-20">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                  Order Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Order ID: {selectedOrder._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {formatDate(selectedOrder.createdAt)} •{" "}
                    {formatTime(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p
                    className={`font-medium ${getStatusColor(
                      selectedOrder.status
                    )} px-2 py-1 rounded-full inline-block text-xs`}
                  >
                    {selectedOrder.status}
                  </p>
                </div>
              </div>

              {/* Show OTP in detail modal if applicable */}
              {shouldShowOTP(selectedOrder.status) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-800 mb-2">
                    Order OTP
                  </h3>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-indigo-600 font-medium mb-1">
                      Share this OTP with delivery person
                    </p>
                    <p className="text-3xl font-bold text-indigo-800 tracking-wider">
                      {selectedOrder.otp}
                    </p>
                  </div>
                </div>
              )}

              {/* Generate OTP in detail modal */}
              {shouldShowGenerateOTP(selectedOrder.status) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Delivery OTP
                  </h3>
                  {generatedOTPs[selectedOrder._id] ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-1">
                          New OTP Generated
                        </p>
                        <p className="text-2xl font-bold text-green-800 tracking-wider">
                          {generatedOTPs[selectedOrder._id]}
                        </p>
                      </div>
                      <button
                        onClick={() => handleGenerateOTP(selectedOrder._id)}
                        disabled={generatingOTP[selectedOrder._id]}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                        title="Regenerate OTP"
                      >
                        <FaSync
                          className={`text-green-600 ${
                            generatingOTP[selectedOrder._id]
                              ? "animate-spin"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateOTP(selectedOrder._id)}
                      disabled={generatingOTP[selectedOrder._id]}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingOTP[selectedOrder._id] ? (
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

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  {Array.isArray(selectedOrder.services) &&
                  selectedOrder.services.length > 0 ? (
                    selectedOrder.services.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between border-b pb-2 text-sm"
                      >
                        <span className="text-gray-600">
                          {s.name} (x{s.quantity})
                        </span>
                        <span className="font-medium">₹{s.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      No services listed
                    </div>
                  )}

                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-3 mt-3">
                    <span>Delivery Charges :</span>
                    <span className="text-indigo-600">₹50</span>
                  </div>

                  <div className="flex justify-between font-semibold border-t border-gray-200 pt-3 mt-3">
                    <span>Service Amount :</span>
                    <span className="text-indigo-600">
                      ₹{selectedOrder.totalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-200 pt-3 mt-3">
                    <span>Total Amount</span>
                    <span className="text-indigo-600">
                      ₹{selectedOrder.totalPrice + 50}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Delivery Address
                </h3>
                <p className="text-gray-600">
                  {selectedOrder.userAddress || "N/A"}
                </p>
              </div>

              {/* Contact */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-800 mb-2">Contact</h3>
                <p className="text-gray-600">
                  {selectedOrder.userMobile || "N/A"}
                </p>
              </div>

              {selectedOrder.status === "Scheduled" && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowCancelConfirm(true);
                  }}
                  className="w-full mt-4 py-2.5 bg-rose-50 text-rose-600 font-medium rounded-lg border border-rose-100 hover:bg-rose-100 transition"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-20">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                  Order Tracking
                </h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Order ID: {selectedOrder._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <div className="p-5">
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200">
                  <div
                    className="absolute top-0 left-0 w-0.5 bg-gradient-to-b from-indigo-500 to-blue-500"
                    style={{
                      height: `${
                        (Math.max(
                          0,
                          statusSteps.indexOf(selectedOrder.status)
                        ) /
                          (statusSteps.length - 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Steps */}
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const currentIndex = statusSteps.indexOf(
                      selectedOrder.status
                    );
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isLast = index === statusSteps.length - 1;

                    return (
                      <div key={step} className="relative pl-10">
                        <div
                          className={`absolute left-4 top-0 flex items-center justify-center w-4 h-4 rounded-full ${
                            isCurrent
                              ? "bg-indigo-500 ring-4 ring-indigo-200"
                              : isCompleted
                              ? "bg-emerald-500"
                              : "bg-gray-300"
                          }`}
                          style={{ marginLeft: "-8px", marginTop: "2px" }}
                        ></div>
                        <div>
                          <p
                            className={`font-medium ${
                              isCurrent
                                ? "text-indigo-600"
                                : isCompleted
                                ? "text-gray-800"
                                : "text-gray-400"
                            }`}
                          >
                            {step}
                          </p>
                          {isCurrent && !isLast && (
                            <p className="text-xs text-gray-500 mt-1">
                              Your order is currently at this stage
                            </p>
                          )}
                          {isCompleted && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completed on{" "}
                              {formatDate(
                                selectedOrder.updatedAt ||
                                  selectedOrder.createdAt
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setShowDetailModal(true);
                }}
                className="w-full py-2.5 bg-white text-indigo-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                View Order Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl animate-fade-in">
            <div className="p-5 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100">
                <svg
                  className="h-6 w-6 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-3">
                Cancel Order?
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to cancel this order? This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-between gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={async () => {
                  await handleCancelOrder();
                }}
                className="flex-1 px-4 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}