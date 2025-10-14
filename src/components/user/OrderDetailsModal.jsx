import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import axios from "axios";
import { FiAlertCircle } from "react-icons/fi";

const OrderDetailsModal = ({ service, vendor, onClose, onConfirm }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [quantity, setQuantity] = useState(1);
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileDataMissing, setProfileDataMissing] = useState({
    mobile: false,
    address: false,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(`${API_BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data?.user ?? res.data;

          if (data.phone) {
            setMobile(data.phone);
          } else {
            setProfileDataMissing((prev) => ({ ...prev, mobile: true }));
          }

          if (data.address) {
            setAddress(data.address);
          } else {
            setProfileDataMissing((prev) => ({ ...prev, address: true }));
          }
        } catch (err) {
          console.error("Failed to load user profile", err);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [API_BASE_URL]);

  const calculateTotal = () => (service ? service.appPrice * quantity + 50 : 0);

  const handleSubmit = () => {
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!address || address.trim() === "") {
      toast.error("Please enter a valid delivery address");
      return;
    }

    onConfirm({ quantity, mobile, address, total: calculateTotal() });
  };

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] mb-16 overflow-hidden flex flex-col mx-auto shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {service.name}
              </h2>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-xs text-gray-400 line-through">
                  ₹{service.displayPrice}
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  {service.discountPercentage}% OFF
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-orange-600">
                ₹{service.appPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <p className="text-gray-600 mb-6 text-sm">
            Price per piece:{" "}
            <span className="font-semibold">₹{service.appPrice}</span>
          </p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-3 text-sm font-medium">
              Quantity:
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="bg-gray-200 w-10 h-10 rounded-l text-lg font-bold hover:bg-gray-300 transition-colors"
              >
                −
              </button>
              <span className="px-6 py-2 bg-gray-100 text-sm font-semibold min-w-[60px] text-center border-y border-gray-300">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="bg-gray-200 w-10 h-10 rounded-r text-lg font-bold hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Mobile Number:
            </label>
            {profileDataMissing.mobile && !mobile && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  You haven't added your mobile number in your profile. Please
                  enter it here or add it in your profile.
                </p>
              </div>
            )}
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              disabled={loading}
            />
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Delivery Address:
            </label>
            {profileDataMissing.address && !address && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  You haven't added your delivery address in your profile.
                  Please enter it here or add it in your profile.
                </p>
              </div>
            )}
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
              rows={4}
              placeholder="Enter full delivery address..."
              disabled={loading}
            />
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-gray-700">
                <span>Service Price ({quantity} items):</span>
                <span className="font-medium">
                  ₹{service.appPrice * quantity}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>Delivery Charges:</span>
                <span className="font-medium">₹50</span>
              </div>
              <div className="flex justify-between items-center text-green-600 font-medium">
                <span>You Saved:</span>
                <span>
                  ₹{(service.displayPrice - service.appPrice) * quantity}
                </span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-base items-center text-gray-900">
                <span>Total:</span>
                <span className="text-lg text-orange-600">
                  ₹{calculateTotal()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-6 border-t bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
