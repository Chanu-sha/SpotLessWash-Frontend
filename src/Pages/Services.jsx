import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import components
import VendorSkeleton from "../components/user/VendorSkeleton";
import ImageCarousel from "../components/user/ImageCarousel";
import VendorModal from "../components/user/VendorModal";
import OrderDetailsModal from "../components/user/OrderDetailsModal";
import PaymentMethodModal from "../components/user/PaymentMethodModal";

const Services = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [expandedVendors, setExpandedVendors] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);

  // Modal states
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

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

  async function getFirebaseIdToken() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const idToken = await user.getIdToken();
      return idToken;
    } catch (err) {
      console.error("Firebase token error:", err);
      throw err;
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!orderDetails) {
      toast.error("Order details missing");
      return;
    }

    if (processingPayment) {
      toast.info("Payment already in progress...");
      return;
    }

    setProcessingPayment(true);
    const totalAmount = orderDetails.total;

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your connection."
        );
      }

      const token = await getFirebaseIdToken();

      toast.info("Creating payment order...");

      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/order/payment/create-order`,
        {
          amount: totalAmount,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          description: `Payment for ${currentService.name}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderResponse.data.success) {
        throw new Error(
          orderResponse.data.msg || "Failed to create payment order"
        );
      }

      const { order_id, amount, key_id, product_name, description } =
        orderResponse.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: "INR",
        name: "SpotlessWash",
        description: description,
        image: "/servicepagepaymentimage.png",
        order_id: order_id,

        handler: async function (response) {
          try {
            toast.info("Verifying payment...");

            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/order/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment verified successfully!");

              await placeOrder(
                orderDetails,
                "online",
                response.razorpay_payment_id,
                "completed"
              );
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setProcessingPayment(false);
          }
        },

        prefill: {
          name: userName || "Guest",
          contact: orderDetails.mobile,
          email: getAuth().currentUser?.email || "",
        },

        notes: {
          service: currentService.name,
          vendor: selectedVendor.name,
          address: orderDetails.address,
          quantity: orderDetails.quantity,
        },

        theme: {
          color: "#F97316",
        },

        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },

        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setProcessingPayment(false);
            setShowPaymentModal(true);
          },
          escape: true,
          backdropclose: false,
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        const errorMsg =
          response.error.description ||
          response.error.reason ||
          "Payment failed. Please try again.";
        toast.error(errorMsg);
        setProcessingPayment(false);
        setShowPaymentModal(true);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to initialize payment";
      toast.error(errorMsg);
      setProcessingPayment(false);
      setShowPaymentModal(true);
    }
  };

  const placeOrder = async (
    orderData,
    paymentMethod,
    paymentId = null,
    paymentStatus = "pending"
  ) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error("Please login before placing an order!");
        return;
      }

      const servicesPayload = [
        {
          name: currentService.name,
          price: Number(currentService.appPrice || 0),
          quantity: Number(orderData.quantity || 1),
        },
      ];

      const payload = {
        userName: userName || "Guest",
        userMobile: orderData.mobile,
        userAddress: orderData.address,
        vendorId: selectedVendor._id,
        vendorName: selectedVendor.name,
        vendorAddress: selectedVendor.address || "Not Provided",
        services: servicesPayload,
        assignedDhobi: selectedVendor._id,
        paymentMethod: paymentMethod,
        paymentId: paymentId,
        paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      };

      const token = await getFirebaseIdToken();

      toast.info("Placing your order...");

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/order/place`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order placed successfully!");

      setTimeout(() => {
        setShowPaymentModal(false);
        setShowOrderModal(false);
        setShowVendorModal(false);
        setCurrentService(null);
        setSelectedVendor(null);
        setOrderDetails(null);
        setProcessingPayment(false);
      }, 1000);
    } catch (err) {
      console.error("Place order error:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(msg);
      throw err;
    }
  };

  const handleOrderConfirm = (details) => {
    setOrderDetails(details);
    setShowOrderModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method) => {
    if (method === "cashOnPickup") {
      setShowPaymentModal(false);
      try {
        await placeOrder(orderDetails, "cod", null, "pending");
      } catch (error) {
        setShowPaymentModal(true);
      }
    }
  };

  const handleInitiateRazorpayPayment = async () => {
    setShowPaymentModal(false);
    await handleRazorpayPayment();
  };

  const styles = `
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    
    .animate-shimmer {
      animation: shimmer 1.5s infinite;
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

    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-4 mb-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <VendorSkeleton key={item} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm max-w-sm mx-auto w-full">
          <div className="text-red-500 text-3xl sm:text-4xl mb-3 sm:mb-4">
            ⚠️
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
            {error}
          </p>
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
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="text-sm"
        />

        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                  SpotlessWash
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Professional laundry vendors near you
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors List */}
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
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {vendors.map((vendor) => {
                  const showAll = expandedVendors[vendor._id] || false;

                  return (
                    <div
                      key={vendor._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col"
                    >
                      <ImageCarousel
                        images={vendor.storeImages}
                        vendorName={vendor.name}
                      />

                      <div className="p-3 sm:p-4 flex-1 flex flex-col">
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

                        {vendor.services && vendor.services.length > 0 ? (
                          <div className="flex-1">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 border-b pb-1">
                              Services
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              {(showAll
                                ? vendor.services
                                : vendor.services.slice(0, 3)
                              ).map((service, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-start"
                                >
                                  <div className="flex-1 pr-2 min-w-0">
                                    <span className="font-medium text-gray-800 text-sm sm:text-base block truncate">
                                      {service.name}
                                    </span>
                                    {service.description && (
                                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                        {service.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end flex-shrink-0">
                                    <div className="flex items-center space-x-1 mb-1">
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
                          <div className="text-center py-2 sm:py-3 bg-gray-50 rounded-md flex-1 flex items-center justify-center">
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
            </div>
          )}
        </div>

        {/* Vendor Modal */}
        {showVendorModal && selectedVendor && (
          <VendorModal
            vendor={selectedVendor}
            onClose={() => setShowVendorModal(false)}
            onBookService={(service) => {
              setCurrentService(service);
              setShowOrderModal(true);
            }}
          />
        )}

        {/* Order Details Modal */}
        {showOrderModal && currentService && (
          <OrderDetailsModal
            service={currentService}
            vendor={selectedVendor}
            onClose={() => {
              setShowOrderModal(false);
              toast.info("Order cancelled.");
            }}
            onConfirm={handleOrderConfirm}
          />
        )}

        {/* Payment Method Modal */}
        {showPaymentModal && orderDetails && (
          <PaymentMethodModal
            totalAmount={orderDetails.total}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onRazorpayPayment={handleInitiateRazorpayPayment}
            onClose={() => {
              setShowPaymentModal(false);
              toast.info("Order cancelled.");
            }}
            processingPayment={processingPayment}
          />
        )}
      </div>
    </>
  );
};

export default Services;
