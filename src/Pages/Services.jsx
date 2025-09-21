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
      <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-200 to-orange-200 flex items-center justify-center rounded-t-xl">
        <div className="text-3xl sm:text-4xl">🧺</div>
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
    <div className="relative h-32 sm:h-40 bg-gray-200 overflow-hidden group rounded-t-xl">
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
            className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-opacity-80 hover:scale-110 z-10"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-opacity-80 hover:scale-110 z-10"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
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
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

// Service Card Component with New Pricing Display
const ServiceCard = ({ service, onBookService }) => {
  return (
    <div className="flex justify-between items-center border-b py-2 sm:py-3 hover:bg-gray-50 transition-colors">
      <div className="flex-1 pr-2 sm:pr-3">
        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{service.name}</h4>
        {service.description && (
          <p className="text-xs text-gray-500 truncate mt-1">{service.description}</p>
        )}
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Original Price (Strikethrough) */}
          <span className="text-xs text-gray-400 line-through">
            ₹{service.displayPrice}
          </span>
          {/* Discount Badge */}
          <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
            {service.discountPercentage}% OFF
          </span>
        </div>
        {/* Final Price */}
        <div className="flex items-center space-x-2 mt-1">
          <span className="font-bold text-orange-600 text-base sm:text-lg">
            ₹{service.appPrice}
          </span>
          <button
            onClick={() => onBookService(service)}
            className="px-2.5 py-1 sm:px-3 sm:py-1 bg-green-600 text-white rounded-md text-xs sm:text-sm hover:bg-green-700 transition-colors"
          >
            Book
          </button>
        </div>
      </div>
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

  // total calculation using appPrice (user pays vendor's basePrice + 15%)
  const calculateTotal = () =>
    currentService ? currentService.appPrice * quantity + 50 : 0;

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

    // user login check
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
        price: Number(currentService.appPrice || 0), // Use appPrice for order (basePrice + 15%)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base text-center">
            Finding the best laundry services...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm max-w-sm mx-auto w-full">
          <div className="text-red-500 text-3xl sm:text-4xl mb-3 sm:mb-4">⚠️</div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
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
        className="text-sm"
      />
      
      {/* --- Header --- */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                Our Laundry Services
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Professional laundry vendors near you
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 ml-3">
              <span className="text-orange-500 font-semibold text-sm sm:text-base">LS</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Vendors List --- */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        {vendors.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm mx-auto max-w-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🧺</div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
              No vendors available
            </h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              Check back later for laundry service providers.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5 max-w-lg mx-auto">
            {vendors.map((vendor) => {
              const showAll = expandedVendors[vendor._id] || false;

              return (
                <div
                  key={vendor._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  {/* Image Carousel */}
                  <ImageCarousel 
                    images={vendor.storeImages} 
                    vendorName={vendor.name} 
                  />

                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate flex-1 pr-2">
                        {vendor.name}
                      </h2>
                      <div className="flex items-center bg-green-50 px-2 py-1 rounded flex-shrink-0">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-xs font-medium text-green-700">
                          Approved
                        </span>
                      </div>
                    </div>

                    {vendor.address && (
                      <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
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

                    {/* Services with New Pricing Display */}
                    {vendor.services && vendor.services.length > 0 ? (
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 border-b pb-1">
                          Services
                        </h3>
                        <div className="space-y-1 sm:space-y-2">
                          {(showAll
                            ? vendor.services
                            : vendor.services.slice(0, 3)
                          ).map((service, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-xs sm:text-sm"
                            >
                              <div className="truncate pr-2 flex-1">
                                <span className="font-medium text-gray-800">
                                  {service.name}
                                </span>
                                {service.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{service.displayPrice}
                                  </span>
                                  <span className="bg-green-100 text-green-700 text-xs px-1 py-0.5 rounded font-medium">
                                    {service.discountPercentage}% OFF
                                  </span>
                                </div>
                                <span className="font-semibold text-orange-600 whitespace-nowrap text-sm sm:text-base">
                                  ₹{service.appPrice}
                                </span>
                              </div>
                            </div>
                          ))}

                          {vendor.services.length > 3 && !showAll && (
                            <button
                              className="text-xs text-blue-500 font-medium mt-1"
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
                      <div className="text-center py-2 sm:py-3 bg-gray-50 rounded-md">
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
                      className="w-full mt-3 sm:mt-4 py-2 sm:py-2.5 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors"
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

      {/* --- Vendor Modal with Enhanced Service Display --- */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-bold mb-2">{selectedVendor.name}</h2>
              <p className="text-gray-600 text-sm">{selectedVendor.address}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-1">
                {selectedVendor.services.map((service, idx) => (
                  <ServiceCard
                    key={idx}
                    service={service}
                    onBookService={(service) => {
                      setCurrentService(service);
                      setShowOrderModal(true);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t">
              <button
                onClick={() => setShowVendorModal(false)}
                className="w-full py-2 sm:py-2.5 border rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Order Modal with Updated Pricing Display --- */}
      {showOrderModal && currentService && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 sm:py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold truncate flex-1 pr-2">{currentService.name}</h2>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs sm:text-sm text-gray-400 line-through">
                      ₹{currentService.displayPrice}
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                      {currentService.discountPercentage}% OFF
                    </span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-orange-600">
                    ₹{currentService.appPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 pb-20">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Price per piece: ₹{currentService.appPrice}
              </p>

              {/* Quantity */}
              <div className="flex items-center mb-4 sm:mb-6">
                <span className="mr-3 text-sm sm:text-base">Quantity:</span>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="bg-gray-200 px-3 py-2 rounded-l text-sm sm:text-base hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 bg-gray-100 text-sm sm:text-base min-w-[50px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="bg-gray-200 px-3 py-2 rounded-r text-sm sm:text-base hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 mb-2 text-sm sm:text-base font-medium">
                  Mobile Number:
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              {/* Address */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 mb-2 text-sm sm:text-base font-medium">
                  Delivery Address:
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter full delivery address..."
                />
              </div>

              {/* Enhanced Price Details */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between items-center">
                    <span>Service Price ({quantity} items):</span>
                    <span>₹{currentService.appPrice * quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Charges:</span>
                    <span>₹50</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>You Saved:</span>
                    <span>₹{(currentService.displayPrice - currentService.appPrice) * quantity}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between font-bold text-base sm:text-lg items-center">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 sm:p-6">
              <div className="flex gap-3 max-w-md mx-auto">
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    toast.info("Order cancelled.");
                  }}
                  className="flex-1 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 py-2.5 sm:py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base font-medium transition-colors"
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