import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaWallet,
  FaTimes,
  FaMoneyBillWave,
  FaHistory,
  FaExclamationTriangle,
} from "react-icons/fa";

const CODWalletComponent = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("deliveryToken");

      const response = await fetch(`${API_BASE_URL}/deliveryboy/cod-wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletData(data);
      } else {
        toast.error("Failed to fetch wallet data");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchWalletData();
  }, [isOpen]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmitCollections = async () => {
    if (walletData?.pendingSubmission === 0) {
      toast.info("No pending collections to submit");
      return;
    }

    if (!window.confirm(`Submit ₹${walletData?.pendingSubmission} to company account?\n\nYou will be redirected to payment gateway.`)) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("deliveryToken");

      const orderResponse = await fetch(`${API_BASE_URL}/deliveryboy/cod-wallet/create-order`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        toast.error(error.message || "Failed to create payment order");
        return;
      }

      const orderData = await orderResponse.json();

      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Cash On Pickup Submission",
        description: `Submitting Cash On Pickup collection: ₹${orderData.totalAmount}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(
              `${API_BASE_URL}/deliveryboy/cod-wallet/verify-payment`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              toast.success(
                ` Successfully submitted! Receipt: ${verifyData.receiptNumber}`
              );
              fetchWalletData(); // Refresh wallet data
            } else {
              const error = await verifyResponse.json();
              toast.error(error.message || "Payment verification failed");
            }
          } catch (error) {
            toast.error("Network error during verification");
          }
        },
        prefill: {
          name: "Delivery Partner",
          contact: "",
        },
        notes: {
          type: "Cash On Pickup Submission",
          amount: orderData.totalAmount,
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysSinceLastCollection = () => {
    if (!walletData?.lastCollectionDate) return 0;
    const last = new Date(walletData.lastCollectionDate);
    const now = new Date();
    last.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.floor((now - last) / (1000 * 60 * 60 * 24));
  };

  if (!isOpen) return null;

  const daysSinceCollection = getDaysSinceLastCollection();
  const showPenaltyWarning =
    daysSinceCollection > 0 && walletData?.pendingSubmission > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FaWallet className="text-white text-3xl" />
              <h2 className="text-2xl font-bold text-white">Cash On Pickup Wallet</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {["overview", "collections", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-6 font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab
                  walletData={walletData}
                  showPenaltyWarning={showPenaltyWarning}
                  daysSinceCollection={daysSinceCollection}
                  submitting={submitting}
                  handleSubmitCollections={handleSubmitCollections}
                />
              )}
              {activeTab === "collections" && (
                <CollectionsTab walletData={walletData} />
              )}
              {activeTab === "history" && (
                <HistoryTab walletData={walletData} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ walletData, showPenaltyWarning, daysSinceCollection, submitting, handleSubmitCollections }) => (
  <div className="space-y-6">
    {/* Penalty Warning */}
    {showPenaltyWarning && (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaExclamationTriangle className="text-red-500 text-2xl flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-800 text-lg">Penalty Alert!</h3>
            <p className="text-red-700 mt-1">
              {daysSinceCollection} day{daysSinceCollection > 1 ? 's' : ''} overdue. 
              Penalty: ₹{walletData?.penaltyAmount || 0}
            </p>
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Submit collections today to avoid additional charges (₹150/day)
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Stats Cards */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
        <p className="text-sm text-green-700 font-medium">Total Collected</p>
        <p className="text-3xl font-bold text-green-800 mt-2">
          ₹{walletData?.totalCollected || 0}
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
        <p className="text-sm text-orange-700 font-medium">Pending Submission</p>
        <p className="text-3xl font-bold text-orange-800 mt-2">
          ₹{walletData?.pendingSubmission || 0}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-700 font-medium">Total Submitted</p>
        <p className="text-3xl font-bold text-blue-800 mt-2">
          ₹{walletData?.totalSubmitted || 0}
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
        <p className="text-sm text-purple-700 font-medium">Current Penalty</p>
        <p className="text-3xl font-bold text-purple-800 mt-2">
          ₹{walletData?.penaltyAmount || 0}
        </p>
      </div>
    </div>

    {/* Last Dates Info */}
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Last Collection:</span>
        <span className="font-semibold text-gray-800">
          {walletData?.lastCollectionDate 
            ? new Date(walletData.lastCollectionDate).toLocaleDateString() 
            : 'N/A'}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Last Submission:</span>
        <span className="font-semibold text-gray-800">
          {walletData?.lastSubmissionDate 
            ? new Date(walletData.lastSubmissionDate).toLocaleDateString() 
            : 'N/A'}
        </span>
      </div>
    </div>

    {/* Submit Button */}
    {walletData?.pendingSubmission > 0 && (
      <button
        onClick={handleSubmitCollections}
        disabled={submitting}
        className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all shadow-lg ${
          submitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl'
        }`}
      >
        {submitting ? 'Processing...' : `Pay ₹${walletData.pendingSubmission} to Company`}
      </button>
    )}

    {/* Instructions */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2">📋 Important Instructions:</h4>
      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
        <li>Submit Cash On Pickup collections via online payment</li>
        <li>Penalty of ₹150/day applies after collection day</li>
        <li>Payment is processed securely via Razorpay</li>
        <li>Keep receipt number for your records</li>
        <li>Contact support if you face any issues</li>
      </ul>
    </div>
  </div>
);

const CollectionsTab = ({ walletData }) => {
  const pendingCollections = walletData?.pendingCollections || [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Pending Collections ({pendingCollections.length})
        </h3>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
          ₹{walletData?.pendingSubmission || 0}
        </span>
      </div>

      {pendingCollections.length > 0 ? (
        <div className="space-y-3">
          {pendingCollections.map((collection) => (
            <div
              key={collection._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{collection.customerName}</h4>
                  <p className="text-sm text-gray-600">{collection.customerMobile}</p>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold">
                  ₹{collection.amount}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium text-gray-800">{collection.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium text-gray-800">{collection.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Collected:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(collection.collectedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FaMoneyBillWave className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No pending collections</p>
          <p className="text-sm mt-1">All collections have been submitted</p>
        </div>
      )}
    </div>
  );
};

const HistoryTab = ({ walletData }) => {
  const submittedCollections = walletData?.submittedCollections || [];
  const submissionHistory = walletData?.submissionHistory || [];

  return (
    <div className="space-y-6">
      {/* Submission History */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaHistory className="mr-2 text-blue-600" />
          Submission History
        </h3>

        {submissionHistory.length > 0 ? (
          <div className="space-y-3">
            {submissionHistory.map((submission) => (
              <div
                key={submission._id}
                className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Receipt: {submission.receiptNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    {submission.razorpayPaymentId && (
                      <p className="text-xs text-blue-600 mt-1">
                        Payment ID: {submission.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                    ₹{submission.amount}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {submission.collectionIds.length} collection(s) submitted
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No submission history yet</p>
          </div>
        )}
      </div>

      {/* Collected Orders */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          All Collected Orders ({submittedCollections.length})
        </h3>

        {submittedCollections.length > 0 ? (
          <div className="space-y-3">
            {submittedCollections.map((collection) => (
              <div
                key={collection._id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{collection.customerName}</h4>
                    <p className="text-sm text-gray-600">{collection.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600">₹{collection.amount}</span>
                    <p className="text-xs text-green-600">✓ Submitted</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Collected: {new Date(collection.collectedAt).toLocaleDateString()} | 
                  Submitted: {new Date(collection.submittedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No collected orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CODWalletComponent;