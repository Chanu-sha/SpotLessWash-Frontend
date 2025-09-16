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
    const roleParam = urlParams.get('role');
    
    // Map role parameters to component roles
    const roleMapping = {
      'customer': 'user',
      'delivery': 'delivery', 
      'vendor': 'dhobi'
    };
    
    return roleMapping[roleParam] || 'user';
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
        body: JSON.stringify({ email: user.email }) 
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
    user: <FiUser className="mr-2" />,
    delivery: <FiTruck className="mr-2" />,
    dhobi: <FiUserCheck className="mr-2" />,
    admin: <FiLock className="mr-2" />,
  };

  const getRoleGradient = () => {
    switch(activeRole) {
      case 'user':
        return 'from-blue-600 to-blue-500';
      case 'delivery':
        return 'from-orange-600 to-orange-400';
      case 'dhobi':
        return 'from-purple-600 to-purple-400';
      case 'admin':
        return 'from-sky-600 to-red-400';
      default:
        return 'from-blue-600 to-blue-500';
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto">
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
      <div className="w-full max-w-md">
        <div className="bg-white overflow-hidden">
          {/* HEADER */}
          <div className={`bg-gradient-to-r ${getRoleGradient()} p-6 text-white`}>
            <div className="flex flex-col">
              <div className="w-full flex items-center justify-between mb-4">
                {/* Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  <FiArrowLeft className="mr-1" /> Back
                </button>

                {/* Role Selector - Hidden initially but can be toggled */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  Switch Role
                </button>
              </div>

              {/* Dropdown for role selection */}
              {showDropdown && (
                <div className="mb-4">
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
                        'user': 'customer',
                        'delivery': 'delivery',
                        'dhobi': 'vendor'
                      };
                      navigate(`/auth?role=${roleParamMap[role]}`);
                    }}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white text-white"
                  >
                    <option value="user">Customer Login</option>
                    <option value="delivery">Delivery Portal</option>
                    <option value="dhobi">Vendor Portal</option>
                    <option value="admin">Admin Portal</option>
                  </select>
                </div>
              )}

              {/* Title & subtitle */}
              <div className="text-center">
                <div className="flex justify-center items-center mb-2">
                  {roleIcons[activeRole]}
                  <h2 className="text-2xl font-bold">
                    {activeRole === "user"
                      ? isRegistering
                        ? "Create Account"
                        : "Welcome Back"
                      : roleLabel[activeRole]}
                  </h2>
                </div>
                <p className="text-white/80 text-sm">
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
          <div className="p-6">
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
          <div className="bg-gray-50 px-6 py-4 text-center text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;