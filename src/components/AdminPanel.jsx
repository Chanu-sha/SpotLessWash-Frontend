import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPanel = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

  const [activeRole, setActiveRole] = useState("deliveryboy");
  const [activeTab, setActiveTab] = useState("requests");
  const [users, setUsers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (role, tab) => {
    setLoading(true);
    let endpoint = "";
    switch (tab) {
      case "all":
        endpoint = "all";
        break;
      case "requests":
        endpoint = "pending";
        break;
      case "rejected":
        endpoint = "rejected";
        break;
      default:
        return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/${role}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (err) {
      toast.error("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${activeRole}/approve/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ User Approved Successfully!");
        fetchData(activeRole, activeTab);
      } else {
        toast.error(data.message || "Failed to approve user");
      }
    } catch (err) {
      toast.error("Error approving user");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${activeRole}/reject/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("❌ User Rejected");
        fetchData(activeRole, activeTab);
      } else {
        toast.error(data.message || "Failed to reject user");
      }
    } catch (err) {
      toast.error("Error rejecting user");
    }
  };

  useEffect(() => {
    fetchData(activeRole, activeTab);
  }, [activeRole, activeTab]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Generate initials for profile avatar
  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "?";
  };

  // Generate background color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gradient-to-br from-slate-50 to-blue-50">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="mt-16"
      />

      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-center text-sm text-gray-500 mt-1">
            Manage users and approvals
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveRole("deliveryboy")}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm transition-all duration-200 ${
              activeRole === "deliveryboy"
                ? "text-blue-600 border-b-3 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🚚</span>
              <span>Delivery Partners</span>
            </div>
          </button>
          <button
            onClick={() => setActiveRole("vendor")}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm transition-all duration-200 ${
              activeRole === "vendor"
                ? "text-purple-600 border-b-3 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🏪</span>
              <span>Service Vendors</span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-6">
        {/* Status Tabs */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "All Users", icon: "👥", color: "slate" },
            { key: "requests", label: "Pending", icon: "⏳", color: "orange" },
            { key: "rejected", label: "Rejected", icon: "❌", color: "red" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shadow-sm ${
                activeTab === tab.key
                  ? `bg-${tab.color}-600 text-gray-500 shadow-lg transform scale-105`
                  : `bg-white text-gray-700 hover:bg-${tab.color}-50 hover:text-${tab.color}-600 border border-gray-200`
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-500 font-medium">Loading users...</p>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {!loading && users.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try switching to a different tab
              </p>
            </div>
          ) : (
            users.map((user) => {
              const isExpanded = expandedId === user._id;
              const avatarColor = getAvatarColor(user.name);
              const initials = getInitials(user.name);

              return (
                <div
                  key={user._id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md ${
                    isExpanded ? "ring-2 ring-blue-100" : ""
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start space-x-4">
                      {/* Profile Avatar / Photo */}
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover shadow-sm border"
                        />
                      ) : (
                        <div
                          className={`${avatarColor} w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-white font-bold text-lg">
                            {initials}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 text-lg truncate">
                              {user.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 flex items-center">
                              <span className="mr-2">📧</span>
                              {user.email}
                            </p>
                            <p className="text-gray-600 text-sm mt-1 flex items-center">
                              <span className="mr-2">📱</span>
                              {user.phone}
                            </p>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            {user.approved ? (
                              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                                Approved
                              </span>
                            ) : user.rejected ? (
                              <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                                ❌ Rejected
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                                ⏳ Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-4">
                          {user.approved ? (
                            <button
                              onClick={() => handleReject(user._id)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center space-x-2"
                            >
                              <span>Reject User</span>
                            </button>
                          ) : user.rejected ? (
                            <button
                              onClick={() => handleApprove(user._id)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center space-x-2"
                            >
                              <span>Approve User</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(user._id)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center space-x-2"
                              >
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(user._id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center space-x-2"
                              >
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          {/* User ID */}
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700 flex items-center">
                              <span className="mr-2">🆔</span>
                              User ID:
                            </span>
                            <span className="text-gray-600 text-xs font-mono bg-white px-2 py-1 rounded border">
                              {user._id}
                            </span>
                          </div>

                          {/* Address */}
                          {user.address && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <span className="font-medium text-gray-700 flex items-center mb-2">
                                <span className="mr-2">📍</span>
                                Address:
                              </span>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {user.address}
                              </p>
                            </div>
                          )}

                          {/* Services (for vendors) */}
                          {activeRole === "vendor" &&
                            user.services &&
                            user.services.length > 0 && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <span className="font-medium text-gray-700 flex items-center mb-3">
                                  <span className="mr-2">🛍️</span>
                                  Services Offered:
                                </span>
                                <div className="space-y-2">
                                  {user.services.map((service, index) => (
                                    <div
                                      key={service._id || index}
                                      className="bg-white p-3 rounded-lg shadow-sm border"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-800">
                                          {service.name}
                                        </h4>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                                          ₹{service.price}
                                        </span>
                                      </div>
                                      <p className="text-gray-600 text-sm">
                                        {service.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Status History */}
                          <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                            <span className="font-medium text-gray-700 flex items-center mb-2">
                              <span className="mr-2">📊</span>
                              Current Status:
                            </span>
                            <div className="flex items-center space-x-2">
                              {user.approved ? (
                                <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                  Active & Approved
                                </span>
                              ) : user.rejected ? (
                                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                  ❌ Access Denied
                                </span>
                              ) : (
                                <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                                  ⏳ Awaiting Review
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpand(user._id)}
                    className="w-full py-3 bg-gradient-to-r from-gray-50 to-blue-50 text-blue-600 font-medium hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border-t border-gray-100"
                  >
                    <div className="flex items-center text-start ml-3">
                      <span>
                        {isExpanded ? "👆 Show Less" : "👇 Show More Details"}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
