import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaWallet, FaMoneyBillWave, FaHistory, FaTimes } from "react-icons/fa";

const WalletWithdraw = ({ pickupOrders, deliveryOrders }) => {
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [earningsData, setEarningsData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  // Withdrawal form state
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    upiId: '',
    fullName: '',
    phoneNumber: '',
    withdrawFrom: 'today'
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("deliveryToken");
      const response = await fetch(`${API_BASE_URL}/deliveryboy/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to fetch wallet data");
      const data = await response.json();
      setWalletData(data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Failed to load wallet data");
    }
  };

  const fetchEarningsData = async () => {
    try {
      setEarningsLoading(true);
      const token = localStorage.getItem("deliveryToken");
      
      // Fetch delivery boy stats (this includes the actual pickup and delivery counts)
      const statsRes = await fetch(`${API_BASE_URL}/deliveryboy/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsRes.json();

      // Get today's date for filtering orders
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));

      // Filter today's completed orders for display (not for counting)
      const todayCompletedPickups = pickupOrders.filter(order => {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        return orderDate >= todayStart && orderDate <= todayEnd && 
               (order.status === 'completed' || order.status === 'delivered');
      });

      const todayCompletedDeliveries = deliveryOrders.filter(order => {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        return orderDate >= todayStart && orderDate <= todayEnd && 
               order.status === 'delivered';
      });

      // Calculate today's actual counts from earnings
      // Since each pickup/delivery earns ₹25, we can calculate today's completed orders
      const todaysEarningsAmount = statsData.wallet.todaysEarnings;
      const todaysTotalCompletedOrders = todaysEarningsAmount / 25;

      setEarningsData({
        stats: statsData,
        // Use filtered orders for display
        todayPickups: todayCompletedPickups,
        todayDeliveries: todayCompletedDeliveries,
        // Use calculated counts from earnings
        todayPickupCount: Math.floor(todaysTotalCompletedOrders * (todayCompletedPickups.length / (todayCompletedPickups.length + todayCompletedDeliveries.length))) || todayCompletedPickups.length,
        todayDeliveryCount: Math.floor(todaysTotalCompletedOrders * (todayCompletedDeliveries.length / (todayCompletedPickups.length + todayCompletedDeliveries.length))) || todayCompletedDeliveries.length,
        todaysTotalOrders: todaysTotalCompletedOrders,
        wallet: statsData.wallet
      });

    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setEarningsLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem("deliveryToken");
      const response = await fetch(`${API_BASE_URL}/deliveryboy/withdrawal-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to fetch withdrawal history");
      const data = await response.json();
      setWithdrawalHistory(data);
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      toast.error("Failed to load withdrawal history");
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    try {
      setWithdrawalLoading(true);
      const token = localStorage.getItem("deliveryToken");
      
      const response = await fetch(`${API_BASE_URL}/deliveryboy/withdrawal-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(withdrawalForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Withdrawal failed');
      }

      toast.success("Withdrawal request submitted successfully!");
      
      // Reset form and close modal
      setWithdrawalForm({
        amount: '',
        upiId: '',
        fullName: '',
        phoneNumber: '',
        withdrawFrom: 'today'
      });
      setShowWithdrawModal(false);
      
      // Refresh wallet data
      await fetchWalletData();
      await fetchEarningsData();
      
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      toast.error(error.message || "Failed to create withdrawal request");
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Initialize wallet data
  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (showEarningsModal && (pickupOrders.length > 0 || deliveryOrders.length > 0)) {
      fetchEarningsData();
    }
  }, [showEarningsModal, pickupOrders, deliveryOrders]);

  useEffect(() => {
    if (showHistoryModal) {
      fetchWithdrawalHistory();
    }
  }, [showHistoryModal]);

  // Earnings Modal Component
  const EarningsModal = () => {
    const [activeEarningsTab, setActiveEarningsTab] = useState("wallet");

    if (!showEarningsModal) return null;

    const todayOrders = [
      ...(earningsData?.todayPickups || []),
      ...(earningsData?.todayDeliveries || [])
    ];

    const pastOrders = [
      ...pickupOrders.filter(order => {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        return orderDate < todayStart && 
               (order.status === 'completed' || order.status === 'delivered');
      }),
      ...deliveryOrders.filter(order => {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        return orderDate < todayStart && order.status === 'delivered';
      })
    ];

    return (
      <div className="fixed inset-0 z-50 bg-black/40 max-w-md mx-auto backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">My Wallet</h2>
              <button 
                onClick={() => setShowEarningsModal(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            {earningsData?.wallet && (
              <div className="mt-2">
                <div className="text-sm opacity-90">Total Earnings</div>
                <div className="text-2xl font-bold">₹{earningsData.wallet.totalEarnings}</div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeEarningsTab === "wallet"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveEarningsTab("wallet")}
            >
              Wallet
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeEarningsTab === "today"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveEarningsTab("today")}
            >
              Today's Orders
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeEarningsTab === "past"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveEarningsTab("past")}
            >
              Past Orders
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {earningsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : activeEarningsTab === "wallet" ? (
              <div className="space-y-4">
                {earningsData?.wallet && (
                  <>
                    {/* Today's Earnings Card */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-green-800">Today's Earnings</h3>
                        <FaMoneyBillWave className="text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ₹{earningsData.wallet.todaysEarnings}
                      </div>
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Total Orders: {earningsData.todaysTotalOrders || 0}</span>
                        <span>Rate: ₹25 each</span>
                      </div>
                      {earningsData.wallet.todaysEarnings > 0 && (
                        <button
                          onClick={() => {
                            setWithdrawalForm(prev => ({ ...prev, withdrawFrom: 'today' }));
                            setShowWithdrawModal(true);
                            setShowEarningsModal(false);
                          }}
                          className="w-full mt-3 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Withdraw Today's Earnings
                        </button>
                      )}
                    </div>

                    {/* Withdrawable Balance Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-blue-800">Withdrawable Balance</h3>
                        <FaWallet className="text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        ₹{earningsData.wallet.withdrawableBalance}
                      </div>
                      <div className="text-sm text-blue-700 mb-3">
                        Available for withdrawal
                      </div>
                      {earningsData.wallet.withdrawableBalance > 0 && (
                        <button
                          onClick={() => {
                            setWithdrawalForm(prev => ({ ...prev, withdrawFrom: 'withdrawable' }));
                            setShowWithdrawModal(true);
                            setShowEarningsModal(false);
                          }}
                          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Withdraw Balance
                        </button>
                      )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-800 mb-3">Statistics</h3>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-800">{earningsData.stats.completedPickups}</div>
                          <div className="text-xs text-gray-600">Total Pickups</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-800">{earningsData.stats.completedDeliveries}</div>
                          <div className="text-xs text-gray-600">Total Deliveries</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600">₹{earningsData.wallet.totalWithdrawn}</div>
                          <div className="text-xs text-gray-600">Total Withdrawn</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">₹{earningsData.wallet.totalEarnings}</div>
                          <div className="text-xs text-gray-600">Total Earned</div>
                        </div>
                      </div>
                    </div>

                    {/* Withdrawal History Button */}
                    <button
                      onClick={() => {
                        setShowHistoryModal(true);
                        setShowEarningsModal(false);
                      }}
                      className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaHistory />
                      <span>View Withdrawal History</span>
                    </button>
                  </>
                )}
              </div>
            ) : activeEarningsTab === "today" ? (
              <div>
                {earningsData && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="grid grid-cols-1 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{earningsData.todaysTotalOrders || 0}</div>
                        <div className="text-xs text-gray-600">Today's Completed Orders</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 text-center">
                      <div className="text-lg font-bold text-green-600">₹{earningsData.wallet.todaysEarnings}</div>
                      <div className="text-xs text-gray-600">Today's Earnings (₹25 per order)</div>
                    </div>
                  </div>
                )}
                
              </div>
            ) : (
              <div>
                {pastOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No past orders found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastOrders.map((order, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{order.orderId || `Order #${index + 1}`}</div>
                            <div className="text-xs text-gray-600">
                              {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">₹25</div>
                            <div className="text-xs text-gray-600 capitalize">
                              {order.pickup ? 'Pickup' : 'Delivery'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              ₹25 earned per pickup/delivery
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Withdrawal Modal Component
  const WithdrawalModal = () => {
    if (!showWithdrawModal) return null;

    const maxAmount = withdrawalForm.withdrawFrom === 'today' 
      ? walletData?.todaysEarnings || 0
      : walletData?.withdrawableBalance || 0;

    return (
      <div className="fixed inset-0 z-50 bg-black/40 max-w-md mx-auto backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Withdraw Money</h2>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mt-2 text-sm opacity-90">
              Available: ₹{maxAmount}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleWithdrawal} className="p-4 space-y-4">
            {/* Withdraw From Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdraw From
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setWithdrawalForm(prev => ({ ...prev, withdrawFrom: 'today' }))}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    withdrawalForm.withdrawFrom === 'today'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Today's Earnings (₹{walletData?.todaysEarnings || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalForm(prev => ({ ...prev, withdrawFrom: 'withdrawable' }))}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    withdrawalForm.withdrawFrom === 'withdrawable'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Balance (₹{walletData?.withdrawableBalance || 0})
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                value={withdrawalForm.amount}
                onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                max={maxAmount}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter amount"
              />
              {maxAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setWithdrawalForm(prev => ({ ...prev, amount: maxAmount.toString() }))}
                  className="mt-1 text-sm text-purple-600 hover:text-purple-800"
                >
                  Withdraw All (₹{maxAmount})
                </button>
              )}
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID *
              </label>
              <input
                type="text"
                value={withdrawalForm.upiId}
                onChange={(e) => setWithdrawalForm(prev => ({ ...prev, upiId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="yourname@paytm"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={withdrawalForm.fullName}
                onChange={(e) => setWithdrawalForm(prev => ({ ...prev, fullName: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="As per bank account"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={withdrawalForm.phoneNumber}
                onChange={(e) => setWithdrawalForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="10 digit mobile number"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={withdrawalLoading || maxAmount <= 0}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawalLoading ? "Processing..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Withdrawal History Modal
  const WithdrawalHistoryModal = () => {
    if (!showHistoryModal) return null;

    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'text-yellow-600 bg-yellow-100';
        case 'approved': return 'text-blue-600 bg-blue-100';
        case 'paid': return 'text-green-600 bg-green-100';
        case 'rejected': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/40 max-w-md mx-auto backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Withdrawal History</h2>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {withdrawalHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaHistory className="mx-auto mb-2 text-4xl text-gray-300" />
                <p>No withdrawal requests found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawalHistory.map((withdrawal, index) => (
                  <div key={withdrawal._id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-lg">₹{withdrawal.amount}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div>UPI: {withdrawal.upiId}</div>
                      <div>Name: {withdrawal.fullName}</div>
                      {withdrawal.adminNote && (
                        <div className="mt-2 p-2 bg-gray-100 rounded">
                          <div className="text-xs text-gray-600">Admin Note:</div>
                          <div className="text-sm">{withdrawal.adminNote}</div>
                        </div>
                      )}
                      {withdrawal.processedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Processed: {new Date(withdrawal.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Wallet Button and Quick Info */}
      <div className="flex space-x-2">
        {/* Quick Wallet Info */}
        {walletData && (
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
            <div className="text-xs text-gray-500">Today</div>
            <div className="font-bold text-green-600">₹{walletData.todaysEarnings}</div>
          </div>
        )}
        <button
          onClick={() => setShowEarningsModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200"
        >
          <FaWallet className="text-lg" />
          <span className="font-medium">Wallet</span>
        </button>
      </div>

      {/* All Modals */}
      <EarningsModal />
      <WithdrawalModal />
      <WithdrawalHistoryModal />
    </>
  );
};

export default WalletWithdraw;