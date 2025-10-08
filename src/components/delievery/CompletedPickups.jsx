import React, { useState } from "react";
import { FaUser, FaClock, FaRupeeSign } from "react-icons/fa";

const CompletedPickups = ({ pickupOrders }) => {
  const [activeTab, setActiveTab] = useState("today");

  // Get completed pickup orders
  const completedPickupOrders = pickupOrders.filter(
    (order) => order.status === "Picked Up" || order.status === "completed"
  );

  // Calculate 24 hours ago
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Filter orders for today (last 24 hours)
  const todayPickups = completedPickupOrders.filter(order => {
    const orderDate = new Date(order.updatedAt || order.createdAt);
    return orderDate >= twentyFourHoursAgo;
  });

  // Filter orders for past (older than 24 hours)
  const pastPickups = completedPickupOrders.filter(order => {
    const orderDate = new Date(order.updatedAt || order.createdAt);
    return orderDate < twentyFourHoursAgo;
  });

  const getStatusBadge = (status) => {
    const base = "text-xs font-semibold px-2 py-1 rounded-full";
    switch (status) {
      case "Picked Up":
      case "completed":
        return `${base} bg-green-100 text-green-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString, showTime = true) => {
    const date = new Date(dateString);
    const options = showTime 
      ? { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      : { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric'
        };
    return date.toLocaleDateString('en-IN', options);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1 mt-4">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "today"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("today")}
        >
          Today ({todayPickups.length})
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "past"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("past")}
        >
          Past Orders ({pastPickups.length})
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeTab === "today" ? todayPickups : pastPickups).length > 0 ? (
          (activeTab === "today" ? todayPickups : pastPickups).map((order) => (
            <CompletedPickupCard
              key={order._id}
              order={order}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              isToday={activeTab === "today"}
            />
          ))
        ) : (
          <EmptyState
            title={`No ${activeTab === "today" ? "today's" : "past"} completed pickups`}
            description={`${activeTab === "today" ? "Today's completed pickups" : "Past completed pickups"} will appear here`}
          />
        )}
      </div>
    </div>
  );
};

const CompletedPickupCard = ({ order, getStatusBadge, formatDate, isToday }) => {
  const totalPieces = order.services?.reduce((total, service) => total + service.quantity, 0) || 0;
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {order.userName}
            </h3>
          </div>
          <span className={getStatusBadge(order.status)}>Completed</span>
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          {/* Services */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🧺</span>
              <span className="font-medium text-gray-800">Services:</span>
            </div>
            {order.services?.map((service, index) => (
              <div key={index} className="ml-6 text-sm text-gray-700 flex justify-between items-center">
                <span>{service.name}</span>
                <span className="font-medium">{service.quantity} pieces</span>
              </div>
            ))}
            <div className="ml-6 mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="font-medium text-gray-800">Total Pieces:</span>
              <span className="font-bold text-blue-600">{totalPieces} pieces</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex items-center space-x-2">
            <span className="text-lg">📞</span>
            <p>
              <span className="text-black mr-2">Mobile:</span>
              <span className="text-gray-600">{order.userMobile}</span>
            </p>
          </div>

          {/* Completion Time */}
          <div className="flex items-center space-x-2">
            <FaClock className="text-gray-500" />
            <p>
              <span className="text-black mr-2">Completed:</span>
              <span className="text-gray-600">
                {formatDate(order.updatedAt || order.createdAt, isToday)}
              </span>
            </p>
          </div>

          {/* Pickup Address */}
          <div className="flex items-start space-x-2">
            <span className="mt-1">📍</span>
            <p>
              <span className="text-black mr-2">From:</span>
              <span className="text-gray-600">{order.userAddress}</span>
            </p>
          </div>

          {/* Delivery Address */}
          <div className="flex items-start space-x-2">
            <span className="mt-1">🏪</span>
            <p>
              <span className="text-black mr-2">To:</span>
              <span className="text-gray-600">{order.vendorAddress}</span>
            </p>
          </div>

          {/* Earnings */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaRupeeSign className="text-green-600" />
                <span className="font-medium text-gray-800">Earnings:</span>
              </div>
              <span className="font-bold text-green-600 text-lg">₹25</span>
            </div>
          </div>

          {/* OTP Display */}
          {order.otp && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Order OTP:</span>
                <span className="font-bold text-blue-600 text-lg">{order.otp}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, description }) => (
  <div className="col-span-full text-center py-10">
    <div className="text-6xl mb-4">📦</div>
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className="text-gray-400 mt-1">{description}</p>
  </div>
);

export default CompletedPickups;