// src/pages/Profile.jsx
import React, { useEffect, useState, useContext } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiPlus, FiLogOut, FiCamera } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { UserContext } from "../context/UserContext";

export default function Profile() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [uploadingPercent, setUploadingPercent] = useState(0);
  const { setRole } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });

  const [userType, setUserType] = useState("firebase");

  const readTokenFromLS = (key) => {
    const t = localStorage.getItem(key);
    if (!t || t === "undefined" || t === "null") return null;
    return t;
  };

  useEffect(() => {
    let unsubscribe;
    const fetchProfile = async () => {
      try {
        const dhobiToken = readTokenFromLS("dhobiToken");
        const deliveryToken = readTokenFromLS("deliveryToken");

        if (dhobiToken) {
          setUserType("dhobi");
          setRole("dhobi");
          try {
            const res = await axios.get(`${API_BASE_URL}/dhobi/profile`, {
              headers: { Authorization: `Bearer ${dhobiToken}` },
            });
            const data = res.data?.user ?? res.data;
            setProfile({ ...data, role: "dhobi" });
            setForm((prev) => ({ ...prev, ...data }));
          } catch (err) {
            console.error("Failed to load vendor profile", err);
          }
          return;
        }

        if (deliveryToken) {
          setUserType("delivery");
          setRole("delivery");
          try {
            const res = await axios.get(`${API_BASE_URL}/deliveryboy/profile`, {
              headers: { Authorization: `Bearer ${deliveryToken}` },
            });
            const data = res.data?.user ?? res.data;
            setProfile({ ...data, role: "delivery" });
            setForm((prev) => ({ ...prev, ...data }));
          } catch (err) {
            console.error("Failed to load delivery profile", err);
          }
          return;
        }

        // No dhobi/delivery token — fallback to Firebase auth
        unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            try {
              setUserType("firebase");
              setRole("firebase");
              const token = await user.getIdToken();
              const res = await axios.get(`${API_BASE_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = res.data?.user ?? res.data;
              setProfile(data);
              setForm((prev) => ({ ...prev, ...data }));
            } catch (err) {
              console.error("Failed to load Firebase user profile", err);
            }
          } else {
            // Guest
            setRole("firebase");
            setProfile({
              name: "Guest User",
              email: "guest@example.com",
              phone: "",
              address: "",
              photo: "",
              isDemo: true,
            });
          }
        });
      } catch (err) {
        console.error("Unexpected error fetching profile", err);
        toast.error("Unexpected error fetching profile");
      }
    };

    fetchProfile();

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // get token according to current userType
  const getToken = async () => {
    if (userType === "firebase") {
      const current = auth.currentUser;
      if (!current) return null;
      return await current.getIdToken();
    }
    return readTokenFromLS(
      userType === "delivery" ? "deliveryToken" : "dhobiToken"
    );
  };

  // Get correct API URL for profile operations
  const getApiUrl = () => {
    if (userType === "firebase") return `${API_BASE_URL}/user/profile`;
    if (userType === "delivery") return `${API_BASE_URL}/deliveryboy/profile`;
    return `${API_BASE_URL}/dhobi/profile`;
  };

  const handleSaveField = async (field) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("No auth token available");
        return;
      }

      const res = await axios.put(
        getApiUrl(),
        { [field]: form[field] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data?.user ?? res.data;
      setProfile(data);
      setForm((prev) => ({ ...prev, ...data }));
      toast.success(`${field} updated!`);
      setEditingField(null);
    } catch (err) {
      console.error("Update field error:", err);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", import.meta.env.VITE_CLOUDINARY_URL);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadingPercent(percent);
        }
      });

      xhr.onload = async () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (!data.secure_url) throw new Error("Upload failed");

          const token = await getToken();
          if (!token) {
            toast.error("No auth token available");
            setUploadingPercent(0);
            return;
          }

          const res = await axios.put(
            getApiUrl(),
            { photo: data.secure_url },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const updated = res.data?.user ?? res.data;
          setProfile(updated);
          setForm((prev) => ({ ...prev, photo: data.secure_url }));
          toast.success("Photo updated");
          setUploadingPercent(0);
        } catch (err) {
          console.error("After upload error:", err);
          toast.error("Image upload failed");
          setUploadingPercent(0);
        }
      };

      xhr.onerror = () => {
        console.error("XHR upload error");
        toast.error("Image upload failed");
        setUploadingPercent(0);
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Image upload catch:", err);
      toast.error("Image upload failed");
      setUploadingPercent(0);
    }
  };

  const logout = async () => {
    try {
      if (userType === "firebase") {
        await auth.signOut();
      } else {
        localStorage.removeItem(
          userType === "delivery" ? "deliveryToken" : "dhobiToken"
        );
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setProfile({
        name: "Guest User",
        email: "guest@example.com",
        phone: "",
        address: "",
        photo: "",
        isDemo: true,
      });
      setUserType("firebase");
      setRole("firebase");
      toast.info("Logged out");
    }
  };

  const renderField = (label, field) => (
    <div className="flex justify-between items-center">
      <span className="text-gray-700">{label}</span>
      {editingField === field ? (
        <div className="flex items-center gap-2 w-2/3">
          <input
            type="text"
            value={form[field] || ""}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="text-sm bg-transparent w-full focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => handleSaveField(field)}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <span>{profile[field] || "Not set"}</span>
          {!profile?.isDemo && (
            <span
              className="cursor-pointer"
              onClick={() => setEditingField(field)}
            >
              {profile[field] ? (
                <FiEdit2 className="h-4 w-4 text-gray-500" />
              ) : (
                <FiPlus className="h-4 w-4 text-blue-600" />
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 px-4 pt-6 pb-24">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">
            {profile?.role === "delivery"
              ? "Delivery Profile"
              : profile?.role === "dhobi"
              ? "Vendor Profile"
              : "Profile"}
          </h1>
          {!profile.isDemo && (
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:underline flex items-center gap-1"
            >
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="relative flex justify-center">
            <div
              className={`w-24 h-24 rounded-full border-4 transition duration-200 ${
                uploadingPercent > 0 ? "border-blue-500" : "border-gray-300"
              }`}
              style={{
                borderColor:
                  uploadingPercent === 100
                    ? "green"
                    : `rgba(59, 130, 246, ${uploadingPercent / 100})`,
              }}
            >
              <img
                src={profile.photo || "/user.png"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {!profile.isDemo && (
              <>
                <label htmlFor="photo-upload">
                  <FiCamera className="absolute bottom-2 right-[42%] bg-white p-1 rounded-full w-6 h-6 border border-gray-300 cursor-pointer" />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </>
            )}
          </div>

          <div className="text-center">
            {editingField === "name" ? (
              <div className="flex justify-center items-center gap-1">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-xl font-medium text-gray-900 text-center bg-transparent focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveField("name")}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-xl font-medium text-gray-900 flex items-center justify-center gap-1">
                {profile.name || "No Name"}
                {!profile.isDemo && (
                  <span
                    className="cursor-pointer"
                    onClick={() => setEditingField("name")}
                  >
                    {profile.name ? (
                      <FiEdit2 className="h-4 w-4 text-gray-500" />
                    ) : (
                      <FiPlus className="h-4 w-4 text-blue-500" />
                    )}
                  </span>
                )}
              </p>
            )}
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>

          <div className="space-y-2 text-sm">
            <h2 className="text-gray-500 font-semibold uppercase text-xs">
              Personal Details
            </h2>
            {renderField("Contact", "phone")}
            {renderField("Address", "address")}
          </div>

          {profile.isDemo && (
            <button
              onClick={() => navigate("/auth")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Login to manage profile
            </button>
          )}

          {!profile.isDemo && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              {profile.role === "delivery" && (
                <button
                  onClick={() => navigate("/delivery-dashboard")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 transition shadow-md"
                >
                  🚚 Go to Delivery Dashboard
                </button>
              )}

              {profile.role === "dhobi" && (
                <button
                  onClick={() => navigate("/dhobi-dashboard")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 transition shadow-md"
                >
                  🧺 Go to Vendor Dashboard
                </button>
              )}

              {userType === "firebase" && !profile.role && (
                <button
                  onClick={() => navigate("/subscription")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-400 to-emerald-600 hover:from-emerald-500 hover:to-green-400 transition shadow-md"
                >
                  📦 Manage Subscription
                </button>
              )}

              <button
                onClick={() => navigate("/contact")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 transition shadow-md"
              >
                🎧 Contact Us
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
