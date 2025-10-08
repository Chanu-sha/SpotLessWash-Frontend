import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaMoneyBillWave,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaSearch,
  FaUsers,
  FaStore,
} from "react-icons/fa";

const AdminWithdrawalDashboard = () => {
  const [deliveryBoyWithdrawals, setDeliveryBoyWithdrawals] = useState([]);
  const [vendorWithdrawals, setVendorWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("deliveryBoy"); // deliveryBoy or vendor

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_SECRET;

  const fetchDeliveryBoyWithdrawals = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/deliveryboy/admin/withdrawals`,
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch delivery boy withdrawals");
      }

      const data = await response.json();
      setDeliveryBoyWithdrawals(data);
    } catch (error) {
      console.error("Error fetching delivery boy withdrawals:", error);
      toast.error("Failed to load delivery boy withdrawal requests");
    }
  };

  const fetchVendorWithdrawals = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendor/admin/withdrawals`,
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vendor withdrawals");
      }

      const data = await response.json();
      setVendorWithdrawals(data);
    } catch (error) {
      console.error("Error fetching vendor withdrawals:", error);
      toast.error("Failed to load vendor withdrawal requests");
    }
  };

  const fetchAllWithdrawals = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchDeliveryBoyWithdrawals(), fetchVendorWithdrawals()]);
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId, status, note = "", type) => {
    try {
      setActionLoading(withdrawalId);

      const endpoint = type === "deliveryBoy" 
        ? `${API_BASE_URL}/deliveryboy/admin/withdrawals/${withdrawalId}`
        : `${API_BASE_URL}/vendor/admin/withdrawals/${withdrawalId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          status,
          adminNote: note,
          processedBy: "Admin",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status} withdrawal`);
      }

      toast.success(`${type === "deliveryBoy" ? "Delivery Boy" : "Vendor"} withdrawal ${status} successfully`);

      // Refresh the appropriate list
      if (type === "deliveryBoy") {
        await fetchDeliveryBoyWithdrawals();
      } else {
        await fetchVendorWithdrawals();
      }

      // Close modal if open
      if (showDetailsModal) {
        setShowDetailsModal(false);
        setSelectedWithdrawal(null);
        setAdminNote("");
      }
    } catch (error) {
      console.error(`Error ${status} withdrawal:`, error);
      toast.error(`Failed to ${status} withdrawal`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchAllWithdrawals();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "paid":
        return "💰";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  };

  // Get current withdrawals based on active tab
  const getCurrentWithdrawals = () => {
    return activeTab === "deliveryBoy" ? deliveryBoyWithdrawals : vendorWithdrawals;
  };

  const filteredWithdrawals = getCurrentWithdrawals().filter((withdrawal) => {
    const matchesStatus =
      filterStatus === "all" || withdrawal.status === filterStatus;
    
    let matchesSearch = false;
    if (activeTab === "deliveryBoy") {
      matchesSearch =
        searchTerm === "" ||
        withdrawal.deliveryBoyId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        withdrawal.deliveryBoyId?.phone?.includes(searchTerm) ||
        withdrawal.upiId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      matchesSearch =
        searchTerm === "" ||
        withdrawal.vendorId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        withdrawal.vendorId?.phone?.includes(searchTerm) ||
        withdrawal.upiId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return matchesStatus && matchesSearch;
  });

  // Calculate stats for current tab
  const totalPendingAmount = getCurrentWithdrawals()
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + w.amount, 0);

  const totalPaidAmount = getCurrentWithdrawals()
    .filter((w) => w.status === "paid")
    .reduce((sum, w) => sum + w.amount, 0);

  // Details Modal Component
  const DetailsModal = () => {
    if (!showDetailsModal || !selectedWithdrawal) return null;

    const userDetails = activeTab === "deliveryBoy" 
      ? selectedWithdrawal.deliveryBoyId 
      : selectedWithdrawal.vendorId;

    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`p-4 text-white ${activeTab === "deliveryBoy" 
            ? "bg-gradient-to-r from-blue-500 to-blue-600" 
            : "bg-gradient-to-r from-green-500 to-green-600"}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {activeTab === "deliveryBoy" ? "Delivery Boy" : "Vendor"} Withdrawal Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedWithdrawal(null);
                  setAdminNote("");
                }}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {/* Amount */}
              <div className="text-center bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  ₹{selectedWithdrawal.amount}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Withdrawal Amount
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-center">
                <span
                  className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(
                    selectedWithdrawal.status
                  )}`}
                >
                  {getStatusIcon(selectedWithdrawal.status)}{" "}
                  {selectedWithdrawal.status.charAt(0).toUpperCase() +
                    selectedWithdrawal.status.slice(1)}
                </span>
              </div>

              {/* User Details */}
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold mb-2">
                  {activeTab === "deliveryBoy" ? "Delivery Boy" : "Vendor"} Details
                </h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {userDetails?.name}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {userDetails?.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {userDetails?.email}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">UPI ID:</span>{" "}
                    {selectedWithdrawal.upiId}
                  </div>
                  <div>
                    <span className="font-medium">Full Name:</span>{" "}
                    {selectedWithdrawal.fullName}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedWithdrawal.phoneNumber}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold mb-2">Timeline</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Requested:</span>{" "}
                    {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                  </div>
                  {selectedWithdrawal.processedAt && (
                    <div>
                      <span className="font-medium">Processed:</span>{" "}
                      {new Date(selectedWithdrawal.processedAt).toLocaleString()}
                    </div>
                  )}
                  {selectedWithdrawal.processedBy && (
                    <div>
                      <span className="font-medium">Processed By:</span>{" "}
                      {selectedWithdrawal.processedBy}
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Admin Note */}
              {selectedWithdrawal.adminNote && (
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h3 className="font-semibold mb-2">Admin Note</h3>
                  <div className="text-sm">{selectedWithdrawal.adminNote}</div>
                </div>
              )}

              {/* Action Section (only for pending/approved) */}
              {["pending", "approved"].includes(selectedWithdrawal.status) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Actions</h3>

                  {/* Admin Note Input */}
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add admin note (optional)"
                    className="w-full px-3 py-2 border rounded-md resize-none h-20 text-sm"
                  />

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3">
                    {selectedWithdrawal.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateWithdrawalStatus(
                              selectedWithdrawal._id,
                              "approved",
                              adminNote,
                              activeTab
                            )
                          }
                          disabled={actionLoading === selectedWithdrawal._id}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-1"
                        >
                          <FaCheck />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            updateWithdrawalStatus(
                              selectedWithdrawal._id,
                              "rejected",
                              adminNote,
                              activeTab
                            )
                          }
                          disabled={actionLoading === selectedWithdrawal._id}
                          className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-1"
                        >
                          <FaTimes />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {selectedWithdrawal.status === "approved" && (
                      <button
                        onClick={() =>
                          updateWithdrawalStatus(
                            selectedWithdrawal._id,
                            "paid",
                            adminNote,
                            activeTab
                          )
                        }
                        disabled={actionLoading === selectedWithdrawal._id}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        <FaMoneyBillWave />
                        <span>Mark as Paid</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto mb-16 bg-gray-50 p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Withdrawal Management Dashboard
        </h1>
        <p className="text-gray-600 text-center">Manage delivery boy and vendor withdrawal requests</p>
      </div>

      {/* Tab Selection */}
      <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
            activeTab === "deliveryBoy"
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("deliveryBoy")}
        >
          <FaUsers />
          <span>Delivery Boys</span>
          {deliveryBoyWithdrawals.filter((w) => w.status === "pending").length > 0 && (
            <span className="bg-white text-blue-600 rounded-full text-xs px-2 py-0.5">
              {deliveryBoyWithdrawals.filter((w) => w.status === "pending").length}
            </span>
          )}
        </button>

        <button
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
            activeTab === "vendor"
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("vendor")}
        >
          <FaStore />
          <span>Vendors</span>
          {vendorWithdrawals.filter((w) => w.status === "pending").length > 0 && (
            <span className="bg-white text-green-600 rounded-full text-xs px-2 py-0.5">
              {vendorWithdrawals.filter((w) => w.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {getCurrentWithdrawals().filter((w) => w.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending Requests</div>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ₹{totalPendingAmount}
              </div>
              <div className="text-sm text-gray-600">Pending Amount</div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {getCurrentWithdrawals().filter((w) => w.status === "paid").length}
              </div>
              <div className="text-sm text-gray-600">Paid Requests</div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">
                ₹{totalPaidAmount}
              </div>
              <div className="text-sm text-gray-600">Total Paid</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by name, phone, or UPI ID...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Withdrawals Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : `No ${activeTab === "deliveryBoy" ? "delivery boy" : "vendor"} withdrawal requests available`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === "deliveryBoy" ? "Delivery Boy" : "Vendor"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPI ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWithdrawals.map((withdrawal) => {
                  const userDetails = activeTab === "deliveryBoy" 
                    ? withdrawal.deliveryBoyId 
                    : withdrawal.vendorId;

                  return (
                    <tr key={withdrawal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {userDetails?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userDetails?.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-green-600 text-lg">
                          ₹{withdrawal.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {withdrawal.upiId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {withdrawal.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                            withdrawal.status
                          )}`}
                        >
                          {getStatusIcon(withdrawal.status)}{" "}
                          {withdrawal.status.charAt(0).toUpperCase() +
                            withdrawal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          {new Date(withdrawal.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowDetailsModal(true);
                            }}
                            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>

                          {/* Quick Actions for Pending */}
                          {withdrawal.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateWithdrawalStatus(
                                    withdrawal._id,
                                    "approved",
                                    "",
                                    activeTab
                                  )
                                }
                                disabled={actionLoading === withdrawal._id}
                                className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                title="Quick Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() =>
                                  updateWithdrawalStatus(
                                    withdrawal._id,
                                    "rejected",
                                    "",
                                    activeTab
                                  )
                                }
                                disabled={actionLoading === withdrawal._id}
                                className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Quick Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          {/* Mark as Paid for Approved */}
                          {withdrawal.status === "approved" && (
                            <button
                              onClick={() =>
                                updateWithdrawalStatus(withdrawal._id, "paid", "", activeTab)
                              }
                              disabled={actionLoading === withdrawal._id}
                              className="bg-purple-100 text-purple-600 p-2 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                              title="Mark as Paid"
                            >
                              <FaMoneyBillWave />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <DetailsModal />
    </div>
  );
};

export default AdminWithdrawalDashboard;