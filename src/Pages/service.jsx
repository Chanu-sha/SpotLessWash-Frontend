// src/pages/Service.jsx
import { useState, useEffect } from "react";
import { PiShirtFoldedLight, PiPants, PiDressDuotone } from "react-icons/pi";
import { GiBed, GiRunningShoe } from "react-icons/gi";
import axios from "axios";
import { auth } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Service() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [selectedServices, setSelectedServices] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const token = await user.getIdToken();
          const res = await axios.get(
            `${API_BASE_URL}/subscription/status?userId=${user.uid}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setIsSubscribed(res.data.isSubscribed);
          if (res.data.isSubscribed) {
            toast.success(
              `You have an active subscription! (${res.data.remainingDays} days left)`
            );
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            toast.info("Your session has expired. Please log in again.");
          }
          console.error(
            "Error checking subscription:",
            error.response?.data || error.message
          );
        }
      } else {
        setCurrentUser(null);
        setIsSubscribed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const services = [
    {
      id: "662cda019bc7c5b4f97ff85a",
      name: "Shirts",
      description: "Ironing of shirts, t-shirts, and tops",
      price: 30,
      icon: PiShirtFoldedLight,
    },
    {
      id: "662cda0d9bc7c5b4f97ff85b",
      name: "Pants",
      description: "Ironing of pants, jeans, and trousers",
      price: 35,
      icon: PiPants,
    },
    {
      id: "662cda179bc7c5b4f97ff85c",
      name: "Ethnic Wear",
      description: "Ironing of sarees, lehengas, and kurtis",
      price: 60,
      icon: PiDressDuotone,
    },
    {
      id: "662cda209bc7c5b4f97ff85d",
      name: "Home Linen",
      description: "Ironing of bedsheets with pillow covers, and curtains",
      price: 70,
      icon: GiBed,
    },
    {
      id: "662cda219bc7c5b4f97ff85e",
      name: "Shoes",
      description: "Cleaning and polishing of shoes",
      price: 100,
      icon: GiRunningShoe,
    },
  ];

  const toggleService = (service) => {
    setCurrentService(service);
    setShowPopup(true);
    setQuantity(1);
    setAddress("");
    setMobile("");
  };

  // ✅ Handle Payment Selection
  const handlePayment = (method) => {
    if (method === "COD") {
      confirmOrder("COD");
    } else {
      openRazorpay();
    }
  };

  // ✅ Open Razorpay Checkout
  const openRazorpay = async () => {
    try {
      const token = await currentUser.getIdToken();

      const { data } = await axios.post(
        `${API_BASE_URL}/payments/createOnlineorder`,
        { amount: calculateTotal() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Dhobi Service",
        description: "Laundry Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          await confirmOrder("ONLINE", response.razorpay_payment_id);
        },
        prefill: {
          name: currentUser.displayName || "User",
          email: currentUser.email,
          contact: mobile,
        },
        theme: { color: "#4CAF50" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Razorpay init error:", error);
      toast.error("Payment failed to initialize.");
    }
  };

  // ✅ Confirm Order
  const confirmOrder = async (paymentMethod = "COD", paymentId = null) => {
    if (!currentUser) {
      toast.error("You must be logged in to place an order.");
      return;
    }
    if (!mobile.trim() || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter a valid address.");
      return;
    }

    try {
      const token = await currentUser.getIdToken();

      await axios.post(
        `${API_BASE_URL}/order/place`,
        {
          serviceId: currentService.id,
          name: currentService.name,
          quantity,
          price: currentService.price * quantity,
          address,
          mobile,
          pickupDelivery: 50,
          status: "Scheduled",
          paymentMethod,
          paymentId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowPopup(false);
      setSelectedServices([...selectedServices, currentService.id]);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  // ✅ Calculate Total
  const calculateTotal = () => {
    if (!currentService) return 0;
    return currentService.price * quantity + 50;
  };

  return (
    <div className="max-w-sm mx-auto my-auto p-4 pb-24 bg-white min-h-screen relative">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="text-xl font-bold text-gray-800 mb-6">Select Services</h1>

      <div className="space-y-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className={`p-4 border rounded-lg transition ${
                selectedServices.includes(service.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex gap-3">
                <div className="bg-green-100 p-2 w-10 h-10 flex justify-center items-center rounded-md">
                  <Icon className="text-2xl" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {service.name}
                      </h2>
                      <p className="text-green-600 text-sm">
                        {service.description}
                      </p>
                    </div>
                    <span className="text-gray-900 font-medium">
                      ₹{service.price}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleService(service)}
                    className={`w-full py-2 rounded-md text-sm font-medium ${
                      selectedServices.includes(service.id)
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-gray-800 hover:bg-green-200"
                    }`}
                  >
                    {selectedServices.includes(service.id)
                      ? "Added ✓"
                      : "Add to Order"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Fullscreen Popup */}
      {showPopup && currentService && (
        <div className="fixed inset-0 z-50 mb-12 bg-white overflow-y-auto">
          <div className="w-full max-w-sm mx-auto p-6 min-h-screen flex flex-col">
            <h2 className="text-xl font-bold mb-4">{currentService.name}</h2>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Price per piece: ₹{currentService.price}
              </p>

              <div className="flex items-center mb-4">
                <span className="mr-3">Quantity:</span>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 px-3 py-1 rounded-l"
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 px-3 py-1 rounded-r"
                >
                  +
                </button>
              </div>

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

              {/* ✅ Total Section */}
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
                  <span className="flex items-center gap-2">
                    {isSubscribed ? (
                      <>
                        <span className="line-through text-gray-500">
                          ₹{calculateTotal()}
                        </span>
                        <span className="text-green-600 text-sm font-semibold">
                          (Subscribed)
                        </span>
                      </>
                    ) : (
                      <span>₹{calculateTotal()}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ Payment Options */}
            <div className="mt-auto">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    toast.info("Order cancelled.");
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePayment("COD")}
                  className="flex-1 py-2 border border-gray-300 rounded-md"
                >
                  Cash on Delivery
                </button>
                <button
                  onClick={() => handlePayment("ONLINE")}
                  className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
