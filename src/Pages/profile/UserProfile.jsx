import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiPlus, FiLogOut, FiCamera } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

export default function UserProfile() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [uploadingPercent, setUploadingPercent] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });
  const { updateRole } = useContext(UserContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(`${API_BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data?.user ?? res.data;
          setProfile(data);
          setForm((prev) => ({ ...prev, ...data }));
          updateRole();
        } catch (err) {
          console.error("Failed to load Firebase user profile", err);
        }
      } else {
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

    return () => unsubscribe();
  }, []);

  const getToken = async () => {
    const current = auth.currentUser;
    if (!current) return null;
    return await current.getIdToken();
  };

  const handleSaveField = async (field) => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await axios.put(
        `${API_BASE_URL}/user/profile`,
        { [field]: form[field] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data?.user ?? res.data;
      setProfile(data);
      setForm((prev) => ({ ...prev, ...data }));
      toast.success(`${field} updated!`);
      setEditingField(null);
    } catch {
      toast.error("Update failed");
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

    const xhr = new XMLHttpRequest();
    xhr.open("POST", import.meta.env.VITE_CLOUDINARY_URL);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setUploadingPercent(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.onload = async () => {
      const data = JSON.parse(xhr.responseText);
      const token = await getToken();
      if (token && data.secure_url) {
        const res = await axios.put(
          `${API_BASE_URL}/user/profile`,
          { photo: data.secure_url },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updated = res.data?.user ?? res.data;
        setProfile(updated);
        setForm((prev) => ({ ...prev, photo: data.secure_url }));
        toast.success("Photo updated");
      }
      setUploadingPercent(0);
    };

    xhr.onerror = () => toast.error("Image upload failed");
    xhr.send(formData);
  };

  const logout = async () => {
    await auth.signOut();
    setProfile({
      name: "Guest User",
      email: "guest@example.com",
      phone: "",
      address: "",
      photo: "",
      isDemo: true,
    });
    updateRole();
    toast.info("Logged out");
  };

  const renderField = (label, field) => (
    <div className="flex justify-between items-start">
      <span className="text-gray-700 mt-1">{label}</span>
      {editingField === field ? (
        <div className="flex flex-col w-2/3">
          {field === "address" ? (
            <textarea
              rows={3}
              value={form[field] || ""}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="text-sm bg-transparent w-full focus:outline-none border border-gray-300 rounded-md p-2 resize-y"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={form[field] || ""}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="text-sm bg-transparent w-full focus:outline-none border-b border-gray-300"
              autoFocus
            />
          )}
          <button
            onClick={() => handleSaveField(field)}
            className="mt-2 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 self-end"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 text-sm text-gray-900 w-2/3">
          <span className="whitespace-pre-wrap break-words">
            {profile[field] || "Not set"}
          </span>
          {!profile?.isDemo && (
            <span
              className="cursor-pointer mt-1"
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
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        pauseOnHover
        theme="colored"
      />
      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">User Profile</h1>
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
              <button
                onClick={() => navigate("/service")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-400 to-emerald-600 hover:from-emerald-500 hover:to-green-400 transition shadow-md"
              >
                📦 Explore Our Services
              </button>
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
