import React from "react";

const CODConfirmationModal = ({ order, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl mb-14 shadow-2xl max-w-md w-full p-6 animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cash On Pickup Payment Confirmation
          </h2>
          <p className="text-gray-600 text-sm">
            Please confirm that you have collected the payment from the customer
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Order Amount:</span>
            <span className="font-bold text-lg text-green-600">
              ₹{order.totalPrice}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Customer:</span>
            <span className="font-medium text-gray-800">{order.userName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Mobile:</span>
            <span className="font-medium text-gray-800">
              {order.userMobile}
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-yellow-800 text-center">
            ⚠️ By clicking "Yes, Collected", you confirm that you have received
            ₹{order.totalPrice} in cash from the customer
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md"
          >
            Yes, Collected
          </button>
        </div>
      </div>
    </div>
  );
};

export default CODConfirmationModal;
