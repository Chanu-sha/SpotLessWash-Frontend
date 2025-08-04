import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
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
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${API_BASE_URL}/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if both `current` and `past` arrays exist
      if (
        res.data &&
        Array.isArray(res.data.current) &&
        Array.isArray(res.data.past)
      ) {
        setOrders({
          current: res.data.current,
          past: res.data.past,
        });
      } else {
        console.error("Unexpected response format:", res.data);
      }
    } catch (err) {
      console.error("Error fetching orders", err);
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

  return (
    <div className="min-h-screen  bg-gray-100 pb-14 flex justify-center items-start ">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full max-w-md h-[100vh] bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex text-center">
            {["current", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-medium text-sm transition ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                {tab === "current" ? "Current Orders" : "Past Orders"}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orders[activeTab]?.length > 0 ? (
            orders[activeTab].map((order) => (
              <div
                key={order._id}
                className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800 font-medium">{order.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {order.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="space-x-2 flex flex-col gap-2 items-center">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowStatusModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Check Status
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 text-sm hover:underline flex items-center"
                    >
                      Show More
                      <span className="ml-1">
                        <IoIosArrowDown />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-12">
              No {activeTab === "current" ? "current" : "past"} orders found.
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setShowDetailModal(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Delivery OTP:</strong> {selectedOrder.otp}
              </p>
              {selectedOrder.mobile && (
                <p>
                  <strong>Mobile:</strong> {selectedOrder.mobile}
                </p>
              )}

              <p>
                <strong>Date:</strong> {formatDate(selectedOrder.date)}
              </p>
              <p>
                <strong>Service:</strong> {selectedOrder.name}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedOrder.quantity}
              </p>
              <p>
                <strong>Price:</strong> ₹{selectedOrder.price}
              </p>
              <p>
                <strong>Total:</strong> ₹
                {selectedOrder.price + selectedOrder.pickupDelivery}
              </p>
              <p>
                <strong>Pickup & Delivery:</strong> ₹
                {selectedOrder.pickupDelivery}
              </p>
              {selectedOrder.address && (
                <p>
                  <strong>Address:</strong> {selectedOrder.address}
                </p>
              )}

              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              {selectedOrder.status !== "Cancelled" && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setShowStatusModal(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">ORDER STATUS</h2>
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const currentIndex = statusSteps.indexOf(selectedOrder.status);
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        isCurrent
                          ? "bg-blue-600"
                          : isCompleted
                          ? "bg-blue-400"
                          : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`text-sm ${
                        isCurrent
                          ? "font-semibold text-blue-700"
                          : isCompleted
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </div>
                  </div>
                );
              })}
              <div className="w-full h-1 bg-gray-200 rounded mt-2 relative">
                <div
                  className="absolute top-0 left-0 h-1 bg-blue-600 rounded"
                  style={{
                    width: `${
                      (statusSteps.indexOf(selectedOrder.status) /
                        (statusSteps.length - 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Cancel Order?
            </h2>
            <p className="mb-6 text-sm text-gray-700">
              Are you sure you want to cancel this order?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
              <button
                onClick={async () => {
                  const token = await auth.currentUser.getIdToken();

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

                  try {
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
                    toast.error("Error cancelling order.");
                    console.error("Error cancelling order:", err);
                  }
                }}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
