import { useState } from "react";
import { PiShirtFoldedLight, PiPants, PiDressDuotone } from "react-icons/pi";
import { GiBed } from "react-icons/gi";
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
  const [orderNotes, setOrderNotes] = useState("");
  const user = auth.currentUser;

  const services = [
    {
      id: "662cda019bc7c5b4f97ff85a",
      name: "Shirts",
      description: "Ironing of shirts, t-shirts, and tops",
      price: 50,
      icon: PiShirtFoldedLight,
    },
    {
      id: "662cda0d9bc7c5b4f97ff85b",
      name: "Pants",
      description: "Ironing of pants, jeans, and trousers",
      price: 60,
      icon: PiPants,
    },
    {
      id: "662cda179bc7c5b4f97ff85c",
      name: "Ethnic Wear",
      description: "Ironing of sarees, lehengas, and kurtis",
      price: 80,
      icon: PiDressDuotone,
    },
    {
      id: "662cda209bc7c5b4f97ff85d",
      name: "Home Linen",
      description: "Ironing of bedsheets, pillow covers, and curtains",
      price: 100,
      icon: GiBed,
    },
  ];

  const toggleService = (service) => {
    setCurrentService(service);
    setShowPopup(true);
    setQuantity(1);
    setOrderNotes("");
  };

  const confirmOrder = async () => {
    if (!user) {
      toast.error("You must be logged in to place an order.");
      return;
    }

    try {
      const token = await user.getIdToken();

      await axios.post(
        `${API_BASE_URL}/order/place`,
        {
          serviceId: currentService.id,
          name: currentService.name,
          quantity,
          price: currentService.price * quantity,
          notes: orderNotes,
          pickupDelivery: 50,
          status: "Scheduled",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowPopup(false);
      setSelectedServices([...selectedServices, currentService.id]);
      toast.success(" Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  const calculateTotal = () => {
    if (!currentService) return 0;
    return currentService.price * quantity + 50;
  };

  return (
    <div className="max-w-sm  mx-auto my-auto  p-4 pb-24 bg-white min-h-screen relative">
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

      {/* Fullscreen Popup */}
      {showPopup && currentService && (
        <div className="fixed max-w-sm h-[100vh] bg-white  mx-auto inset-0 z-50 ">
          <div className="bg-white  w-full max-w-sm p-6 shadow-lg">
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
                  Order Notes (optional):
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Item Total:</span>
                  <span>₹{currentService.price * quantity}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Pickup & Delivery:</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </div>

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
                onClick={confirmOrder}
                className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
