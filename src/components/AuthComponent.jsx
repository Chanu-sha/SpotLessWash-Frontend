import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FiUser, FiTruck, FiUserCheck, FiLock, FiArrowLeft } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

import UserAuth from "./auth/UserAuth";
import DeliveryAuth from "./auth/DeliveryAuth";
import AdminAuth from "./auth/AdminAuth";

const AuthComponent = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Common states
  const [activeRole, setActiveRole] = useState("user");
  const [showDropdown, setShowDropdown] = useState(true);

  // User states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Shared delivery/dhobi form state
  const [deliveryForm, setDeliveryForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [deliveryStatus, setDeliveryStatus] = useState("login");

  // Admin credentials
  const [adminCreds, setAdminCreds] = useState({
    username: "",
    password: "",
  });

  const sendTokenToBackend = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.user) {
        toast.success("Login successful!");
        if (!data.user.name || !data.user.phone || !data.user.address) {
          toast.info("Complete your profile to proceed.");
        }
        navigate("/profile");
      } else {
        toast.error("Failed to sync user with backend");
      }
    } catch (error) {
      toast.error("Error during backend login");
    }
  };

  const resetRole = () => {
    setActiveRole("user");
    setEmail("");
    setPassword("");
    setDeliveryForm({ name: "", email: "", phone: "", password: "" });
    setAdminCreds({ username: "", password: "" });
    setDeliveryStatus("login");
    setIsRegistering(false);
  };

  const roleLabel = {
    user: "User Login",
    delivery: "Delivery Partner",
    dhobi: "Dhobi Professional",
    admin: "Admin Portal",
  };

  const roleIcons = {
    user: <FiUser className="mr-2" />,
    delivery: <FiTruck className="mr-2" />,
    dhobi: <FiUserCheck className="mr-2" />,
    admin: <FiLock className="mr-2" />,
  };

  return (
    <div className="min-h-screen max-w-md mx-auto">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="w-full max-w-md">
        <div className="bg-white overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <div className="flex flex-col">
              <div className="w-full flex items-center justify-between mb-4">
                {activeRole !== "user" && (
                  <button
                    onClick={() => {
                      resetRole();
                      setShowDropdown(true);
                    }}
                    className="flex items-center text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <FiArrowLeft className="mr-1" /> Back
                  </button>
                )}

                {showDropdown && (
                  <div className="flex-1 max-w-[130px]">
                    <select
                      value={activeRole}
                      onChange={(e) => {
                        const role = e.target.value;
                        setActiveRole(role);
                        setDeliveryStatus("login");
                        if (role !== "user") setShowDropdown(false);
                      }}
                      className="w-full px-3 py-1 bg-white/20 border border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white text-white"
                    >
                      <option value="user">User Login</option>
                      <option value="delivery">Delivery Partner</option>
                      <option value="dhobi">Dhobi Professional</option>
                      <option value="admin">Admin Portal</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Title & subtitle */}
              <div className="text-center">
                <div className="flex justify-center items-center">
                  {roleIcons[activeRole]}
                  <h2 className="text-2xl font-bold">
                    {activeRole === "user"
                      ? isRegistering
                        ? "Create Account"
                        : "Welcome Back"
                      : roleLabel[activeRole]}
                  </h2>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  {activeRole === "user"
                    ? isRegistering
                      ? "Join us today"
                      : "Sign in to continue"
                    : deliveryStatus === "register"
                    ? "Register your account"
                    : "Access your professional account"}
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

            {(activeRole === "delivery" || activeRole === "dhobi") && (
              <DeliveryAuth
                role={activeRole === "dhobi" ? "dhobi" : "deliveryboy"}
                deliveryForm={deliveryForm}
                setDeliveryForm={setDeliveryForm}
                deliveryStatus={deliveryStatus}
                setDeliveryStatus={setDeliveryStatus}
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
