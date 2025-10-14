import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  FiUser,
  FiTruck,
  FiUserCheck,
  FiLock,
  FiArrowLeft,
  FiHome,
} from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

import UserAuth from "./auth/UserAuth";
import DeliveryAuth from "./auth/DeliveryAuth";
import VendorAuth from "./auth/VendorAuth";
import AdminAuth from "./auth/AdminAuth";

const AuthComponent = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  // Get role from URL parameters
  const getInitialRole = () => {
    const urlParams = new URLSearchParams(location.search);
    const roleParam = urlParams.get("role");

    // Map role parameters to component roles
    const roleMapping = {
      customer: "user",
      delivery: "delivery",
      vendor: "dhobi",
    };

    return roleMapping[roleParam] || "user";
  };

  // Common states
  const [activeRole, setActiveRole] = useState(getInitialRole());
  const [showDropdown, setShowDropdown] = useState(false);
  // User states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Delivery states
  const [deliveryForm, setDeliveryForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [deliveryStatus, setDeliveryStatus] = useState("login");

  // Vendor states
  const [vendorForm, setVendorForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    photo: "",
    services: [],
  });
  const [vendorStatus, setVendorStatus] = useState("login");

  // Admin states
  const [adminCreds, setAdminCreds] = useState({
    username: "",
    password: "",
  });

  // Update role when URL changes
  useEffect(() => {
    const newRole = getInitialRole();
    setActiveRole(newRole);

    // Reset forms when role changes
    setEmail("");
    setPassword("");
    setDeliveryForm({ name: "", email: "", phone: "", password: "" });
    setVendorForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      photo: "",
      services: [],
    });
    setAdminCreds({ username: "", password: "" });
    setDeliveryStatus("login");
    setVendorStatus("login");
    setIsRegistering(false);
  }, [location.search]);

  const sendTokenToBackend = async (user) => {
    try {
      const token = await user.getIdToken(true);

      const res = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (data.user) {
        toast.success("Login successful!");
        navigate("/userprofile");
      } else {
        toast.error("Failed to sync user with backend");
      }
    } catch (error) {
      console.error("Backend Login Error:", error);
      toast.error("Error during backend login");
    }
  };

  const resetRole = () => {
    setActiveRole("user");
    setEmail("");
    setPassword("");
    setDeliveryForm({ name: "", email: "", phone: "", password: "" });
    setVendorForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      photo: "",
      services: [],
    });
    setAdminCreds({ username: "", password: "" });
    setDeliveryStatus("login");
    setVendorStatus("login");
    setIsRegistering(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const roleLabel = {
    user: "Customer Login",
    delivery: "Delivery Partner",
    dhobi: "Vendor Partner",
    admin: "Admin Portal",
  };

  const roleIcons = {
    user: <FiUser className="mr-2 text-xl" />,
    delivery: <FiTruck className="mr-2 text-xl" />,
    dhobi: <FiUserCheck className="mr-2 text-xl" />,
    admin: <FiLock className="mr-2 text-xl" />,
  };

  const getRoleGradient = () => {
    switch (activeRole) {
      case "user":
        return "from-blue-600 to-blue-500";
      case "delivery":
        return "from-orange-600 to-orange-400";
      case "dhobi":
        return "from-purple-600 to-purple-400";
      case "admin":
        return "from-sky-600 to-red-400";
      default:
        return "from-blue-600 to-blue-500";
    }
  };

  const getRoleBgPattern = () => {
    switch (activeRole) {
      case "user":
        return "bg-blue-50";
      case "delivery":
        return "bg-orange-50";
      case "dhobi":
        return "bg-purple-50";
      case "admin":
        return "bg-gradient-to-br from-sky-50 to-red-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div
      className={`min-h-screen ${getRoleBgPattern()} py-4 md:py-8 px-4 transition-colors duration-300`}
    >
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
      <div className="w-full max-w-md lg:max-w-2xl mx-auto">
        <div className="bg-white rounded-xl mb-16 shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div
            className={`bg-gradient-to-r ${getRoleGradient()} p-6 md:p-8 lg:p-10 text-white relative overflow-hidden`}
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="flex flex-col relative z-10">
              <div className="w-full flex items-center justify-between mb-4 md:mb-6">
                {/* Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-sm md:text-base px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-105 font-medium"
                >
                  <FiArrowLeft className="mr-1 md:mr-2" /> Back
                </button>

                {/* Role Selector */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-sm md:text-base px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-105 font-medium"
                >
                  Switch Role
                </button>
              </div>

              {/* Dropdown for role selection */}
              {showDropdown && (
                <div className="mb-4 md:mb-6 animate-fadeIn">
                  <select
                    value={activeRole}
                    onChange={(e) => {
                      const role = e.target.value;
                      setActiveRole(role);
                      setDeliveryStatus("login");
                      setVendorStatus("login");
                      setShowDropdown(false);

                      // Update URL to reflect new role
                      const roleParamMap = {
                        user: "customer",
                        delivery: "delivery",
                        dhobi: "vendor",
                      };
                      navigate(`/auth?role=${roleParamMap[role]}`);
                    }}
                    className="w-full md:max-w-md mx-auto block px-4 py-3 bg-white/20 border-2 border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white text-white backdrop-blur-md font-medium text-base hover:bg-white/30 transition-all cursor-pointer"
                  >
                    <option value="user" className="text-gray-800">
                      Customer Login
                    </option>
                    <option value="delivery" className="text-gray-800">
                      Delivery Portal
                    </option>
                    <option value="dhobi" className="text-gray-800">
                      Vendor Portal
                    </option>
                    <option value="admin" className="text-gray-800">
                      Admin Portal
                    </option>
                  </select>
                </div>
              )}

              {/* Title & subtitle */}
              <div className="text-center">
                <div className="flex justify-center items-center mb-3 md:mb-4">
                  {roleIcons[activeRole]}
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                    {activeRole === "user"
                      ? isRegistering
                        ? "Create Account"
                        : "Welcome Back"
                      : roleLabel[activeRole]}
                  </h2>
                </div>
                <p className="text-white/90 text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                  {activeRole === "user"
                    ? isRegistering
                      ? "Join us today and get your laundry done hassle-free"
                      : "Sign in to continue with your laundry services"
                    : activeRole === "delivery"
                    ? deliveryStatus === "register"
                      ? "Register to become a delivery partner"
                      : "Access your delivery partner portal"
                    : activeRole === "dhobi"
                    ? vendorStatus === "register"
                      ? "Register your laundry business with us"
                      : "Login to your vendor dashboard"
                    : "Secure access for administrators"}
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-0">
            {activeRole === "user" && (
              <UserAuth
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                isRegistering={isRegistering}
                setIsRegistering={setIsRegistering}
                sendTokenToBackend={sendTokenToBackend}
              />
            )}

            {activeRole === "delivery" && (
              <DeliveryAuth
                deliveryForm={deliveryForm}
                setDeliveryForm={setDeliveryForm}
                deliveryStatus={deliveryStatus}
                setDeliveryStatus={setDeliveryStatus}
                API_BASE_URL={API_BASE_URL}
                navigate={navigate}
              />
            )}

            {activeRole === "dhobi" && (
              <VendorAuth
                vendorForm={vendorForm}
                setVendorForm={setVendorForm}
                vendorStatus={vendorStatus}
                setVendorStatus={setVendorStatus}
                API_BASE_URL={API_BASE_URL}
                navigate={navigate}
              />
            )}

            {activeRole === "admin" && (
              <AdminAuth
                adminCreds={adminCreds}
                setAdminCreds={setAdminCreds}
                API_BASE_URL={API_BASE_URL}
                navigate={navigate}
              />
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-gray-50 px-6 py-4 md:py-5 text-center border-t-2 border-gray-100">
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="text-gray-800 font-medium hover:underline cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-gray-800 font-medium hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>

        {/* Additional Info Cards for Large Screens */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUser className="text-blue-600 text-2xl" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              For Customers
            </h3>
            <p className="text-gray-600 text-sm">
              Book laundry services, track orders, and manage your account
              easily.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <FiTruck className="text-orange-600 text-2xl" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              For Delivery Partners
            </h3>
            <p className="text-gray-600 text-sm">
              Join our network, accept orders, and earn on your schedule.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <FiUserCheck className="text-purple-600 text-2xl" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              For Vendors
            </h3>
            <p className="text-gray-600 text-sm">
              Manage your laundry business, receive orders, and grow your reach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
