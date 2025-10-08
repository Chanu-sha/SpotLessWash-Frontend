import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaWallet,
  FaMoneyBillWave,
  FaHistory,
  FaTimes,
  FaShoppingBag,
  FaCalendarAlt,
  FaSyncAlt,
  FaUser,
  FaPhone,
} from "react-icons/fa";

const VendorWalletComponent = () => {
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [earningsData, setEarningsData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [vendorServices, setVendorServices] = useState([]);
  const [pastOrdersLoading, setPastOrdersLoading] = useState(false);

  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    upiId: "",
    fullName: "",
    phoneNumber: "",
    withdrawFrom: "today",
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const calculateOrderEarnings = (order) => {
    if (!order || !order.services) return 0;

    let total = 0;
    order.services.forEach((service) => {
      const vendorService = vendorServices.find(
        (vs) => vs.name === service.name
      );
      if (vendorService) {
        total += vendorService.basePrice * service.quantity;
      }
    });
    return Math.floor(total);
  };

  const fetchVendorProfile = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(`${API_BASE_URL}/vendor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.user && data.user.services) {
        setVendorServices(data.user.services);
      }
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
    }
  };

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(`${API_BASE_URL}/vendor/wallet`, {
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
      const token = localStorage.getItem("vendorToken");

      const [statsRes, todaysRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vendor/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/vendor/todays-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsRes.json();

      let todaysOrdersData = [];
      if (todaysRes.ok) {
        const todaysData = await todaysRes.json();
        todaysOrdersData = todaysData.todaysCompletedOrders || [];
      }

      setEarningsData({
        stats: statsData,
        todaysOrders: todaysOrdersData,
        wallet: statsData.wallet,
      });
      setTodaysOrders(todaysOrdersData);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setEarningsLoading(false);
    }
  };

  const fetchPastOrders = async () => {
    try {
      setPastOrdersLoading(true);
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(`${API_BASE_URL}/vendor/past-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPastOrders(data.pastCompletedOrders || []);
      } else {
        throw new Error("Failed to fetch past orders");
      }
    } catch (error) {
      console.error("Error fetching past orders:", error);
      toast.error("Failed to load past orders");
    } finally {
      setPastOrdersLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      const response = await fetch(
        `${API_BASE_URL}/vendor/withdrawal-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      const token = localStorage.getItem("vendorToken");

      const response = await fetch(
        `${API_BASE_URL}/vendor/withdrawal-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(withdrawalForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Withdrawal failed");
      }

      toast.success("Withdrawal request submitted successfully!");

      setWithdrawalForm({
        amount: "",
        upiId: "",
        fullName: "",
        phoneNumber: "",
        withdrawFrom: "today",
      });
      setShowWithdrawModal(false);

      // Refresh data
      await fetchWalletData();
      await fetchEarningsData();
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      toast.error(error.message || "Failed to create withdrawal request");
    } finally {
      setWithdrawalLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (showEarningsModal) {
      fetchEarningsData();
    }
  }, [showEarningsModal]);

  useEffect(() => {
    if (showHistoryModal) {
      fetchWithdrawalHistory();
    }
  }, [showHistoryModal]);

  const ModalBackdrop = ({ children, onClose }) => (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  const OrderCard = ({ order, index }) => {
    const orderEarnings = calculateOrderEarnings(order);
    const totalQuantity =
      order.services?.reduce((sum, s) => sum + s.quantity, 0) || 0;

    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow mb-4">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            {/* Completion Time */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaCalendarAlt className="text-xs" />
              <span>
                Completed:{" "}
                {order.completedAt
                  ? new Date(order.completedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Date not available"}
              </span>
            </div>
          </div>

          {/* Earnings */}
          <div className="text-right ml-2 flex-shrink-0">
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <div className="font-bold text-green-700 text-lg">
                ₹{orderEarnings}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Your Earning</div>
          </div>
        </div>

        {/* Services Breakdown */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">
              SERVICES BREAKDOWN
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {totalQuantity} items
            </span>
          </div>
          <div className="space-y-2">
            {order.services?.map((service, idx) => {
              const vendorService = vendorServices.find(
                (vs) => vs.name === service.name
              );
              const basePrice = vendorService?.basePrice || 0;
              const serviceTotal = basePrice * service.quantity;
              const customerPaid = service.price * service.quantity;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-md p-2 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-gray-800 flex-1">
                      {service.name}
                    </span>
                    <span className="font-bold text-green-600 ml-2">
                      ₹{serviceTotal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                    <span>Quantity: {service.quantity}</span>
                    <span>
                      ₹{basePrice} × {service.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Order Cannot be Reverserd.</span>
          </div>
          <div className="text-xs">
            <span
              className={`px-2 py-1 rounded-full font-medium ${
                order.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : order.status === "Washed"
                  ? "bg-blue-100 text-blue-700"
                  : order.status === "Picking Up"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const EarningsModal = () => {
    const [activeEarningsTab, setActiveEarningsTab] = useState("wallet");

    if (!showEarningsModal) return null;

    return (
      <ModalBackdrop onClose={() => setShowEarningsModal(false)}>
        <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">My Wallet</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    fetchWalletData();
                    fetchEarningsData();
                    toast.info("Refreshing data...");
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/20 rounded-full transition-all"
                  title="Refresh data"
                >
                  <FaSyncAlt className="text-lg" />
                </button>
                <button
                  onClick={() => setShowEarningsModal(false)}
                  className="text-white hover:text-gray-200 text-2xl p-1"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            {earningsData?.wallet && (
              <div className="mt-2">
                <div className="text-sm opacity-90">Total Earnings</div>
                <div className="text-2xl font-bold">
                  ₹{earningsData.wallet.totalEarnings}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b flex-shrink-0">
            <button
              className={`flex-1 py-3 text-xs sm:text-sm font-medium ${
                activeEarningsTab === "wallet"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveEarningsTab("wallet")}
            >
              Wallet
            </button>
            <button
              className={`flex-1 py-3 text-xs sm:text-sm font-medium ${
                activeEarningsTab === "today"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveEarningsTab("today")}
            >
              Today's Orders
            </button>
            <button
              className={`flex-1 py-3 text-xs sm:text-sm font-medium ${
                activeEarningsTab === "past"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500"
              }`}
              onClick={() => {
                setActiveEarningsTab("past");
                if (pastOrders.length === 0) {
                  fetchPastOrders();
                }
              }}
            >
              Past Orders
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {earningsLoading && activeEarningsTab !== "past" ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : activeEarningsTab === "wallet" ? (
              <div className="space-y-4">
                {earningsData?.wallet && (
                  <>
                    {/* Today's Earnings */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-green-800 text-sm sm:text-base">
                          Today's Earnings
                        </h3>
                        <FaMoneyBillWave className="text-green-600" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                        ₹{earningsData.wallet.todaysEarnings}
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-green-700">
                        <span>Completed: {todaysOrders.length} orders</span>
                        <span className="text-right">
                          Base Price × Quantity
                        </span>
                      </div>
                      {earningsData.wallet.todaysEarnings > 0 && (
                        <button
                          onClick={() => {
                            setWithdrawalForm((prev) => ({
                              ...prev,
                              withdrawFrom: "today",
                            }));
                            setShowWithdrawModal(true);
                            setShowEarningsModal(false);
                          }}
                          className="w-full mt-3 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                        >
                          Withdraw Today's Earnings
                        </button>
                      )}
                    </div>

                    {/* Withdrawable Balance */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-blue-800 text-sm sm:text-base">
                          Withdrawable Balance
                        </h3>
                        <FaWallet className="text-blue-600" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
                        ₹{earningsData.wallet.withdrawableBalance}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-700 mb-3">
                        Available for withdrawal
                      </div>
                      {earningsData.wallet.withdrawableBalance > 0 && (
                        <button
                          onClick={() => {
                            setWithdrawalForm((prev) => ({
                              ...prev,
                              withdrawFrom: "withdrawable",
                            }));
                            setShowWithdrawModal(true);
                            setShowEarningsModal(false);
                          }}
                          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                        >
                          Withdraw Balance
                        </button>
                      )}
                    </div>

                    {/* Statistics */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                        Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-base sm:text-lg font-bold text-gray-800">
                            {earningsData.stats.completedOrders}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Orders
                          </div>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-gray-800">
                            {earningsData.stats.serviceCount}
                          </div>
                          <div className="text-xs text-gray-600">Services</div>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-red-600">
                            ₹{earningsData.wallet.totalWithdrawn}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Withdrawn
                          </div>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-green-600">
                            ₹{earningsData.wallet.totalEarnings}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Earned
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Withdrawal History Button */}
                    <button
                      onClick={() => {
                        setShowHistoryModal(true);
                        setShowEarningsModal(false);
                      }}
                      className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <FaHistory />
                      <span>View Withdrawal History</span>
                    </button>
                  </>
                )}
              </div>
            ) : activeEarningsTab === "today" ? (
              <div>
                {/* Today's Orders Summary */}
                {earningsData && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {todaysOrders.length}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Orders Completed Today
                      </div>
                      <div className="pt-3 border-t border-green-200">
                        <div className="text-2xl font-bold text-green-700">
                          ₹{earningsData.wallet.todaysEarnings}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Total Earnings Today
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Today's Orders List */}
                {todaysOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingBag className="mx-auto text-5xl text-gray-300 mb-3" />
                    <p className="text-gray-500 text-lg">
                      No orders completed today
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Complete orders to see them here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysOrders.map((order, index) => (
                      <OrderCard
                        key={order._id || index}
                        order={order}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Past Orders */}
                {pastOrdersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : pastOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="mx-auto text-5xl text-gray-300 mb-3" />
                    <p className="text-gray-500 text-lg">
                      No past orders found
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Orders older than today will appear here
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {pastOrders.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Past Completed Orders
                      </div>
                    </div>
                    <div className="space-y-4">
                      {pastOrders.map((order, index) => (
                        <OrderCard
                          key={order._id || index}
                          order={order}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="text-center text-xs sm:text-sm text-gray-600">
              You earn your base price per piece × quantity
            </div>
          </div>
        </div>
      </ModalBackdrop>
    );
  };

  const WithdrawalModal = () => {
    if (!showWithdrawModal) return null;

    const maxAmount =
      withdrawalForm.withdrawFrom === "today"
        ? walletData?.todaysEarnings || 0
        : walletData?.withdrawableBalance || 0;

    return (
      <ModalBackdrop onClose={() => setShowWithdrawModal(false)}>
        <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white sticky top-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Withdraw Money</h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-white hover:text-gray-200 text-2xl p-1"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mt-2 text-sm opacity-90">
              Available: ₹{maxAmount}
            </div>
          </div>

          <form onSubmit={handleWithdrawal} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdraw From
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() =>
                    setWithdrawalForm((prev) => ({
                      ...prev,
                      withdrawFrom: "today",
                    }))
                  }
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    withdrawalForm.withdrawFrom === "today"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Today's (₹{walletData?.todaysEarnings || 0})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWithdrawalForm((prev) => ({
                      ...prev,
                      withdrawFrom: "withdrawable",
                    }))
                  }
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    withdrawalForm.withdrawFrom === "withdrawable"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Balance (₹{walletData?.withdrawableBalance || 0})
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                value={withdrawalForm.amount}
                onChange={(e) =>
                  setWithdrawalForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                max={maxAmount}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                placeholder="Enter amount"
              />
              {maxAmount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setWithdrawalForm((prev) => ({
                      ...prev,
                      amount: maxAmount.toString(),
                    }))
                  }
                  className="mt-1 text-sm text-purple-600 hover:text-purple-800"
                >
                  Withdraw All (₹{maxAmount})
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID *
              </label>
              <input
                type="text"
                value={withdrawalForm.upiId}
                onChange={(e) =>
                  setWithdrawalForm((prev) => ({
                    ...prev,
                    upiId: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                placeholder="yourname@paytm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={withdrawalForm.fullName}
                onChange={(e) =>
                  setWithdrawalForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                placeholder="As per bank account"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={withdrawalForm.phoneNumber}
                onChange={(e) =>
                  setWithdrawalForm((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                placeholder="10 digit mobile number"
                pattern="[0-9]{10}"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={withdrawalLoading || maxAmount <= 0}
                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {withdrawalLoading ? "Processing..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </ModalBackdrop>
    );
  };

  const WithdrawalHistoryModal = () => {
    if (!showHistoryModal) return null;

    const getStatusColor = (status) => {
      switch (status) {
        case "pending":
          return "text-yellow-600 bg-yellow-100";
        case "approved":
          return "text-blue-600 bg-blue-100";
        case "paid":
          return "text-green-600 bg-green-100";
        case "rejected":
          return "text-red-600 bg-red-100";
        default:
          return "text-gray-600 bg-gray-100";
      }
    };

    return (
      <ModalBackdrop onClose={() => setShowHistoryModal(false)}>
        <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Withdrawal History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-white hover:text-gray-200 text-2xl p-1"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {withdrawalHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaHistory className="mx-auto mb-2 text-4xl text-gray-300" />
                <p>No withdrawal requests found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawalHistory.map((withdrawal, index) => (
                  <div
                    key={withdrawal._id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg">
                          ₹{withdrawal.amount}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(withdrawal.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          withdrawal.status
                        )} flex-shrink-0 ml-2`}
                      >
                        {withdrawal.status.charAt(0).toUpperCase() +
                          withdrawal.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="break-words">UPI: {withdrawal.upiId}</div>
                      <div className="break-words">
                        Name: {withdrawal.fullName}
                      </div>
                      {withdrawal.adminNote && (
                        <div className="mt-2 p-2 bg-gray-100 rounded">
                          <div className="text-xs text-gray-600">
                            Admin Note:
                          </div>
                          <div className="text-sm break-words">
                            {withdrawal.adminNote}
                          </div>
                        </div>
                      )}
                      {withdrawal.processedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Processed:{" "}
                          {new Date(withdrawal.processedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ModalBackdrop>
    );
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {walletData && (
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm border min-w-20">
            <div className="text-xs text-gray-500">Today</div>
            <div className="font-bold text-green-600 text-sm sm:text-base">
              ₹{walletData.todaysEarnings}
            </div>
          </div>
        )}
        <button
          onClick={() => setShowEarningsModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm sm:text-base"
        >
          <FaWallet className="text-lg" />
          <span className="font-medium">Wallet</span>
        </button>
      </div>

      <EarningsModal />
      <WithdrawalModal />
      <WithdrawalHistoryModal />
    </>
  );
};

export default VendorWalletComponent;
