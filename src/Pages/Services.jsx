import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Image Carousel Component
const ImageCarousel = ({ images, vendorName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-40 bg-gradient-to-r from-blue-200 to-orange-200 flex items-center justify-center">
        <div className="text-4xl">🧺</div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative h-40 bg-gray-200 overflow-hidden group">
      {/* Main Image */}
      <img
        src={images[currentImageIndex]}
        alt={`${vendorName} store ${currentImageIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Navigation Arrows - Always visible if more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-opacity-80 hover:scale-110 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-opacity-80 hover:scale-110 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? "bg-white scale-110"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

const Services = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & selection
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [currentService, setCurrentService] = useState(null);

  // Order form
  const [quantity, setQuantity] = useState(1);
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [userName, setUserName] = useState("");

  const [expandedVendors, setExpandedVendors] = useState({});

  // fetch vendors + check logged in user
  useEffect(() => {
    const fetchApprovedVendors = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/vendor/approved`
        );
        setVendors(response.data || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch approved vendors");
        setLoading(false);
        console.error("Error fetching vendors:", err);
      }
    };

    fetchApprovedVendors();

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setUserName(user.displayName || "");
      }
    } catch (e) {
      console.log("Firebase auth check error", e);
    }
  }, []);

  // total calculation
  const calculateTotal = () =>
    currentService ? currentService.price * quantity + 50 : 0;

  // get Firebase token
  async function getFirebaseIdToken() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return null;
      const idToken = await user.getIdToken();
      return idToken;
    } catch (err) {
      console.warn("No firebase token available", err);
      return null;
    }
  }

  // place order handler
  const handlePlaceOrder = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    //  user login check
    if (!user) {
      toast.error("Please login before placing an order!");
      return;
    }

    // validations
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!address || address.trim() === "") {
      toast.error("Please enter a valid delivery address");
      return;
    }
    if (!currentService || !selectedVendor) {
      toast.error("Please select a service/vendor");
      return;
    }

    const servicesPayload = [
      {
        name: currentService.name,
        price: Number(currentService.price || 0),
        quantity: Number(quantity || 1),
      },
    ];

    const payload = {
      userName: userName || "Guest",
      userMobile: mobile,
      userAddress: address,
      vendorId: selectedVendor._id,
      vendorName: selectedVendor.name,
      vendorAddress: selectedVendor.address || "Not Provided",
      services: servicesPayload,
      assignedDhobi: selectedVendor._id,
    };

    try {
      const token = await getFirebaseIdToken();
      if (!token) {
        toast.error("Authentication failed. Please login again.");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/order/place`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order placed successfully!");

      // Reset form
      setShowOrderModal(false);
      setShowVendorModal(false);
      setCurrentService(null);
      setSelectedVendor(null);
      setQuantity(1);
      setMobile("");
      setAddress("");
    } catch (err) {
      console.error("Place order error:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to place order. Make sure you are signed in.";
      toast.error(msg);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">
            Finding the best laundry services...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md mx-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 pb-16">
      {/* Toastify container */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* --- Header --- */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Our Laundry Services
              </h1>
              <p className="text-sm text-gray-600">
                Professional laundry vendors near you
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-500 font-semibold">LS</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Vendors List --- */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {vendors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-5xl mb-4">🧺</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No vendors available
            </h3>
            <p className="text-gray-600">
              Check back later for laundry service providers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vendors.map((vendor) => {
              const showAll = expandedVendors[vendor._id] || false;

              return (
                <div
                  key={vendor._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  {/* Updated Image Carousel */}
                  <ImageCarousel 
                    images={vendor.storeImages} 
                    vendorName={vendor.name} 
                  />

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-bold text-gray-800 truncate">
                        {vendor.name}
                      </h2>
                      <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-xs font-medium text-green-700">
                          Approved
                        </span>
                      </div>
                    </div>

                    {vendor.address && (
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">{vendor.address}</span>
                      </div>
                    )}

                    {/* Services */}
                    {vendor.services && vendor.services.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">
                          Services
                        </h3>
                        <div className="space-y-2">
                          {(showAll
                            ? vendor.services
                            : vendor.services.slice(0, 3)
                          ).map((service, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <div className="truncate pr-2">
                                <span className="font-medium text-gray-800">
                                  {service.name}
                                </span>
                                {service.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              <span className="font-semibold text-orange-600 whitespace-nowrap">
                                ₹{service.price}
                              </span>
                            </div>
                          ))}

                          {vendor.services.length > 3 && !showAll && (
                            <button
                              className="text-xs text-blue-500 font-medium"
                              onClick={() =>
                                setExpandedVendors((prev) => ({
                                  ...prev,
                                  [vendor._id]: true,
                                }))
                              }
                            >
                              +{vendor.services.length - 3} more services
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-500">
                          No services listed yet
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowVendorModal(true);
                      }}
                      className="w-full mt-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors"
                    >
                      Get Services
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Vendor Modal --- */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-white mb-10 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedVendor.name}</h2>
            <p className="text-gray-600 mb-4">{selectedVendor.address}</p>

            {selectedVendor.services.map((service, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-orange-600">
                    ₹{service.price}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentService(service);
                      setShowOrderModal(true);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowVendorModal(false)}
              className="w-full mt-4 py-2 border rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Order Modal --- */}
      {showOrderModal && currentService && (
        <div className="fixed inset-0 z-50 mb-12 bg-white overflow-y-auto">
          <div className="w-full max-w-sm mx-auto p-6 min-h-screen flex flex-col">
            <h2 className="text-xl font-bold mb-4">{currentService.name}</h2>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Price per piece: ₹{currentService.price}
              </p>

              {/* Quantity */}
              <div className="flex items-center mb-4">
                <span className="mr-3">Quantity:</span>
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="bg-gray-200 px-3 py-1 rounded-l"
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="bg-gray-200 px-3 py-1 rounded-r"
                >
                  +
                </button>
              </div>

              {/* Mobile */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Mobile Number:
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Delivery Address:
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                  placeholder="Enter full delivery address..."
                />
              </div>

              {/* Price Details */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span>Service Price:</span>
                  <span>₹{currentService.price * quantity}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span>Delivery Charges:</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between font-bold text-lg items-center">
                  <span>Total:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    toast.info("Order cancelled.");
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;