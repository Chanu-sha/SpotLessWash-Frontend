import React, { useState } from "react";

const PaymentMethodModal = ({
  totalAmount,
  onPaymentMethodSelect,
  onRazorpayPayment,
  onClose,
  processingPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (!selectedMethod) return;

    if (selectedMethod === "online") {
      onRazorpayPayment();
    } else if (selectedMethod === "cashOnPickup") {
      onPaymentMethodSelect("cashOnPickup");
    }
  };

  return (
    <div className=" fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 py-0 animate-fadeIn">
      <div className="bg-white scale-[.75] rounded-2xl mb-16 shadow-2xl max-w-md w-full max-h-[115vh] overflow-y-auto animate-slideUp">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 p-4 text-white ">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-0.5">
                Choose Payment Method
              </h2>
              <p className="text-orange-100 text-xs">
                Select how you want to pay
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={processingPayment}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Total Amount */}
          <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-orange-100 text-xs font-medium">
                Total Amount
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="p-4  space-y-3">
          {/* Online Payment */}
          <button
            onClick={() => handleMethodSelect("online")}
            disabled={processingPayment}
            className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
              selectedMethod === "online"
                ? "ring-4 ring-blue-400 scale-[1.02] shadow-xl"
                : "hover:scale-[1.01] shadow-md"
            }`}
          >
            <div
              className={`p-5 transition-all duration-300 ${
                selectedMethod === "online"
                  ? "bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100"
                  : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      selectedMethod === "online"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                        : "bg-white shadow-md"
                    }`}
                  >
                    <svg
                      className={`w-7 h-7 transition-colors ${
                        selectedMethod === "online"
                          ? "text-white"
                          : "text-blue-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      Pay Online
                    </h3>
                    <p className="text-sm text-gray-600">
                      UPI, Wallets (No Cards)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Google Pay, PhonePe, Paytm
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Instant
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        Secure
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedMethod === "online"
                      ? "bg-blue-600 scale-110"
                      : "bg-white border-2 border-gray-300"
                  }`}
                >
                  {selectedMethod === "online" && (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            {selectedMethod === "online" && (
              <div className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-pulse pointer-events-none"></div>
            )}
          </button>

          {/* Cash on Pickup */}
          <button
            onClick={() => handleMethodSelect("cashOnPickup")}
            disabled={processingPayment}
            className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
              selectedMethod === "cashOnPickup"
                ? "ring-4 ring-green-400 scale-[1.02] shadow-xl"
                : "hover:scale-[1.01] shadow-md"
            }`}
          >
            <div
              className={`p-5 transition-all duration-300 ${
                selectedMethod === "cashOnPickup"
                  ? "bg-gradient-to-br from-green-50 via-green-100 to-emerald-100"
                  : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      selectedMethod === "cashOnPickup"
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg"
                        : "bg-white shadow-md"
                    }`}
                  >
                    <svg
                      className={`w-7 h-7 transition-colors ${
                        selectedMethod === "cashOnPickup"
                          ? "text-white"
                          : "text-green-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      Cash On Pickup
                    </h3>
                    <p className="text-sm text-gray-600">Pay when we collect</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        Flexible
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        Easy
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedMethod === "cashOnPickup"
                      ? "bg-green-600 scale-110"
                      : "bg-white border-2 border-gray-300"
                  }`}
                >
                  {selectedMethod === "cashOnPickup" && (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            {selectedMethod === "cashOnPickup" && (
              <div className="absolute inset-0 rounded-xl border-2 border-green-400 animate-pulse pointer-events-none"></div>
            )}
          </button>

          {/* Info Box */}
          {selectedMethod && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 animate-slideUp">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm mb-1">
                    {selectedMethod === "online"
                      ? "Online Payment Benefits"
                      : "Cash On Pickup Info"}
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    {selectedMethod === "online"
                      ? "Instant confirmation, secure payment gateway, and multiple payment options available."
                      : "Pay in cash when our delivery partner picks up your order. Keep exact change ready for convenience."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 space-y-3">
          <button
            onClick={handleContinue}
            disabled={!selectedMethod || processingPayment}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              !selectedMethod || processingPayment
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : selectedMethod === "online"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {processingPayment ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              <span>
                {selectedMethod === "online"
                  ? "Proceed to Pay"
                  : "Confirm Order"}
              </span>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={processingPayment}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>

        {/* Security Badge */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Your payment information is secure</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentMethodModal;
