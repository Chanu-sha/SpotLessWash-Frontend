import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

const AuthComponent = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [modalType, setModalType] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  const [adminCreds, setAdminCreds] = useState({ username: "", password: "" });

  const sendTokenToBackend = async (user) => {
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
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await sendTokenToBackend(result.user);
    } catch (error) {
      toast.error(`Google login failed: ${error.message}`);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return toast.error("Enter email & password");
    try {
      const result = isRegistering
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      await sendTokenToBackend(result.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 📦 Delivery boy registration
  const handleDeliveryRegister = async () => {
    const res = await fetch(`${API_BASE_URL}/deliveryboy/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deliveryForm),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setDeliveryStatus("pending");
    } else toast.error(data.message);
  };

  //  Delivery boy login
  const handleDeliveryLogin = async () => {
    const res = await fetch(`${API_BASE_URL}/deliveryboy/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deliveryForm),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Login successful");
      navigate("/delivery-dashboard");
    } else {
      toast.error(data.message);
      if (data.message.includes("Not approved")) {
        setDeliveryStatus("pending");
      }
    }
  };

  // Admin login
  const handleAdminLogin = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminCreds),
    });

    if (res.ok) {
      toast.success("Admin login successful");
      navigate("/admin-panel");
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <ToastContainer />
      <div className="w-full max-w-md  p-8 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isRegistering ? "Register with Email" : "Login with Email"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-4 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-4 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailAuth}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {isRegistering ? "Register" : "Login"}
        </button>

        <p className="text-sm text-center text-gray-600">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="ml-1 text-blue-600 underline"
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>

        <div className="flex gap-2">
          <button
            className="w-1/2 border py-1 rounded"
            onClick={() => setModalType("delivery")}
          >
            Delivery Boy
          </button>
          <button
            className="w-1/2 border py-1 rounded"
            onClick={() => setModalType("admin")}
          >
            Admin
          </button>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-white border py-2 rounded shadow"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5 mr-2"
          />
          Sign in with Google
        </button>
      </div>

      {/* 🚪 Delivery Boy Modal */}
      <Modal
        isOpen={modalType === "delivery"}
        onRequestClose={() => setModalType(null)}
        className="relative flex flex-col justify-center bg-white max-w-md mx-auto p-6 h-[100vh]"
      >
        {/* Back Button */}
        <button
          onClick={() => setModalType(null)}
          className="absolute top-4 left-4 text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
        >
          ← Back
        </button>

        <h2 className="text-lg font-bold mb-4 mt-12 text-center">
          {deliveryStatus === "register"
            ? "Delivery Boy Registration"
            : "Delivery Boy Login"}
        </h2>

        {/* Conditionally render login or register */}
        {deliveryStatus === "register" ? (
          <>
            {["name", "email", "phone", "password"].map((field) => (
              <input
                key={field}
                placeholder={field}
                type={field === "password" ? "password" : "text"}
                value={deliveryForm[field]}
                className="w-full mb-2 border px-2 py-1 rounded"
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, [field]: e.target.value })
                }
              />
            ))}
            <button
              onClick={handleDeliveryRegister}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2"
            >
              Register
            </button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setDeliveryStatus("login")}
              >
                Login
              </button>
            </p>
          </>
        ) : (
          <>
            {["phone", "password"].map((field) => (
              <input
                key={field}
                placeholder={field}
                type={field === "password" ? "password" : "text"}
                value={deliveryForm[field]}
                className="w-full mb-2 border px-2 py-1 rounded"
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, [field]: e.target.value })
                }
              />
            ))}
            <button
              onClick={handleDeliveryLogin}
              className="w-full bg-green-600 text-white py-2 rounded mb-2"
            >
              Login
            </button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?
              <button
                className="text-blue-600 underline"
                onClick={() => setDeliveryStatus("register")}
              >
                Register
              </button>
            </p>
          </>
        )}

        {deliveryStatus === "pending" && (
          <p className="text-yellow-600 text-sm mt-2 text-center">
            Pending admin approval. Please try later.
          </p>
        )}
      </Modal>

      {/* Admin Modal */}
      <Modal
        isOpen={modalType === "admin"}
        onRequestClose={() => setModalType(null)}
        className="flex flex-col justify-center bg-white max-w-sm mx-auto p-6 h-[100vh]"
      >
        {/* Back Button */}
        <button
          onClick={() => setModalType(null)}
          className="absolute top-4 left-4 text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
        >
          ← Back
        </button>
        <h2 className="text-lg text-center font-bold mb-12">Admin Login</h2>
        <input
          placeholder="Admin Name"
          className="w-full border mb-2 px-2 py-1 rounded"
          value={adminCreds.username}
          onChange={(e) =>
            setAdminCreds({ ...adminCreds, username: e.target.value })
          }
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full border mb-2 px-2 py-1 rounded"
          value={adminCreds.password}
          onChange={(e) =>
            setAdminCreds({ ...adminCreds, password: e.target.value })
          }
        />
        <button
          onClick={handleAdminLogin}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
      </Modal>
    </div>
  );
};

export default AuthComponent;
