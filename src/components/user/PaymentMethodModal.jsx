// PaymentMethodModal.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";

const PaymentMethodModal = ({
  totalAmount,
  onPaymentMethodSelect,
  onRazorpayPayment,
  onClose,
  processingPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState("");

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 animate-slideUp">
        <h2 className="font-bold text-lg mb-4">Choose Payment Method</h2>
        <div className="space-y-3 mb-4">
          <button
            onClick={() => {
              setSelectedMethod("cod");
              onPaymentMethodSelect("cod");
            }}
            disabled={processingPayment}
            className={`w-full py-2 rounded-md ${
              selectedMethod === "cod"
                ? "bg-orange-600 text-white"
                : "bg-gray-50 hover:bg-orange-100 text-gray-800"
            } font-medium text-base`}
          >
            Cash on Delivery (COD)
          </button>
          <button
            onClick={() => {
              setSelectedMethod("razorpay");
              onRazorpayPayment();
            }}
            disabled={processingPayment}
            className={`w-full py-2 rounded-md flex flex-col items-center ${
              selectedMethod === "razorpay"
                ? "bg-orange-600 text-white"
                : "bg-gray-50 hover:bg-orange-100 text-gray-800"
            } font-medium text-base`}
          >
            <span>Pay Online (UPI, Wallets)</span>
            <span className="text-xs text-gray-500">
              Google Pay, PhonePe, Paytm (No cards)
            </span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          disabled={processingPayment}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
export default PaymentMethodModal;
