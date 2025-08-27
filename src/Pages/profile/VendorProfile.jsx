import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiPlus,
  FiLogOut,
  FiCamera,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiLock,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

export default function VendorProfile() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [uploadingPercent, setUploadingPercent] = useState(0);
  const [showServices, setShowServices] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    photo: "",
  });

  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { updateRole } = useContext(UserContext);

  // ---- Token Helpers ----
  const readTokenFromLS = () => {
    const t = localStorage.getItem("vendorToken");
    if (!t || t === "undefined" || t === "null") return null;
    return t;
  };

  const getToken = () => readTokenFromLS();

  // ---- Load Profile ----
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setProfile({
        name: "Guest Vendor",
        email: "guest@vendor.com",
        phone: "",
        address: "",
        photo: "",
        services: [],
        isDemo: true,
        role: "vendor",
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/vendor/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.user ?? res.data;
        setProfile({ ...data, role: "vendor" });
        setForm((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Failed to load vendor profile", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  // ---- Profile Updates ----
  const handleSaveField = async (field) => {
    try {
      const token = getToken();
      if (!token) return toast.error("No auth token available");

      const res = await axios.put(
        `${API_BASE_URL}/vendor/profile`,
        { [field]: form[field] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data?.user ?? res.data;
      setProfile({ ...data, role: "vendor" });
      setForm((prev) => ({ ...prev, ...data }));
      toast.success(`${field} updated!`);
      setEditingField(null);
    } catch (err) {
      console.error(err);
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
      try {
        const data = JSON.parse(xhr.responseText);
        if (!data.secure_url) throw new Error("Upload failed");

        const token = getToken();
        if (!token) return;

        const res = await axios.put(
          `${API_BASE_URL}/vendor/profile`,
          { photo: data.secure_url },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updated = res.data?.user ?? res.data;
        setProfile({ ...updated, role: "vendor" });
        setForm((prev) => ({ ...prev, photo: data.secure_url }));
        toast.success("Photo updated");
        setUploadingPercent(0);
      } catch (err) {
        console.error(err);
        toast.error("Image upload failed");
        setUploadingPercent(0);
      }
    };

    xhr.onerror = () => {
      toast.error("Image upload failed");
      setUploadingPercent(0);
    };

    xhr.send(formData);
  };

  // ---- Services ----
  const handleAddService = async () => {
    if (!serviceForm.name || !serviceForm.description || !serviceForm.price) {
      return toast.error("All service fields are required");
    }

    try {
      const token = getToken();
      if (!token) return toast.error("No auth token available");

      const res = await axios.post(
        `${API_BASE_URL}/vendor/services`,
        serviceForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile((prev) => ({ ...prev, services: res.data.services }));
      setServiceForm({ name: "", description: "", price: "" });
      toast.success("Service added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add service");
    }
  };

  const handleUpdateService = async (serviceId) => {
    if (!serviceForm.name || !serviceForm.description || !serviceForm.price) {
      return toast.error("All service fields are required");
    }

    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.put(
        `${API_BASE_URL}/vendor/services/${serviceId}`,
        serviceForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, services: res.data.services }));
      setEditingService(null);
      setServiceForm({ name: "", description: "", price: "" });
      toast.success("Service updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update service");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.delete(
        `${API_BASE_URL}/vendor/services/${serviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, services: res.data.services }));
      toast.success("Service deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service");
    }
  };

  // ---- Store Images ----
  const handleStoreImageAdd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const resCloud = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await resCloud.json();

      if (!data.secure_url) return toast.error("Upload failed");

      const token = getToken();
      const res = await axios.post(
        `${API_BASE_URL}/vendor/store-images`,
        { imageUrl: data.secure_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, storeImages: res.data.storeImages }));
      toast.success("Store image added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add store image");
    }
  };

  const handleStoreImageUpdate = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const resCloud = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await resCloud.json();

      if (!data.secure_url) return toast.error("Upload failed");

      const token = getToken();
      const res = await axios.put(
        `${API_BASE_URL}/vendor/store-images/${index}`,
        { imageUrl: data.secure_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, storeImages: res.data.storeImages }));
      toast.success("Store image updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update store image");
    }
  };

  const handleStoreImageDelete = async (index) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const token = getToken();
      const res = await axios.delete(
        `${API_BASE_URL}/vendor/store-images/${index}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, storeImages: res.data.storeImages }));
      toast.success("Store image deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete store image");
    }
  };

  // ---- Password Reset ----
  const handlePasswordReset = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      return toast.error("All password fields are required");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords don't match");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    try {
      const token = getToken();
      if (!token) return;

      await axios.put(
        `${API_BASE_URL}/vendor/reset-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordReset(false);
      toast.success("Password updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  };

  // ---- Service Editing ----
  const editService = (service) => {
    setEditingService(service._id);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
    });
  };

  // ---- Logout ----
  const logout = () => {
    localStorage.removeItem("vendorToken");
    setProfile({
      name: "Guest Vendor",
      email: "guest@vendor.com",
      phone: "",
      address: "",
      photo: "",
      services: [],
      isDemo: true,
      role: "vendor",
    });
    updateRole();
    toast.info("Logged out");
  };

  // ---- Field Renderer ----
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

  // ---- Loading ----
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
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />

      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">
            Vendor Profile
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
          {/* Profile Photo */}
          <div className="relative flex justify-center">
            <div
              className={`w-24 h-24 rounded-full border-4 transition duration-200`}
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

          {/* Name & Email */}
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

          {/* Personal Details */}
          <div className="space-y-2 text-sm">
            <h2 className="text-gray-500 font-semibold uppercase text-xs">
              Personal Details
            </h2>
            {renderField("Phone", "phone")}
            {renderField("Address", "address")}
          </div>

          {/* Services Section */}
          {!profile.isDemo && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-gray-500 font-semibold uppercase text-xs">
                  Services ({profile.services?.length || 0})
                </h2>
                <button
                  onClick={() => setShowServices(!showServices)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  {showServices ? "Hide" : "Manage Services"}
                </button>
              </div>

              {showServices && (
                <div className="space-y-3 border-t pt-3">
                  {/* Add/Edit Service Form */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">
                      {editingService ? "Edit Service" : "Add New Service"}
                    </h3>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Service name"
                        value={serviceForm.name}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full text-sm p-2 border rounded focus:outline-none focus:border-blue-500"
                      />
                      <textarea
                        placeholder="Service description"
                        value={serviceForm.description}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full text-sm p-2 border rounded focus:outline-none focus:border-blue-500 resize-none"
                        rows={2}
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            price: e.target.value,
                          })
                        }
                        className="w-full text-sm p-2 border rounded focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        {editingService ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateService(editingService)
                              }
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Update Service
                            </button>
                            <button
                              onClick={() => {
                                setEditingService(null);
                                setServiceForm({
                                  name: "",
                                  description: "",
                                  price: "",
                                });
                              }}
                              className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleAddService}
                            className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Add Service
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="space-y-2">
                    {profile.services?.map((service) => (
                      <div
                        key={service._id}
                        className="bg-white border rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {service.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {service.description}
                            </p>
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              ₹{service.price}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => editService(service)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FiEdit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Store Images Section */}
          {!profile.isDemo && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-gray-500 font-semibold uppercase text-xs">
                  Store Images ({profile.storeImages?.length || 0}/3)
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {profile.storeImages?.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt="Store"
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-2 transition">
                      <label
                        htmlFor={`store-image-${index}`}
                        className="cursor-pointer"
                      >
                        <FiEdit2 className="text-white" />
                      </label>
                      <input
                        id={`store-image-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleStoreImageUpdate(e, index)}
                      />
                      <button onClick={() => handleStoreImageDelete(index)}>
                        <FiTrash2 className="text-red-500 bg-white rounded-full p-1" />
                      </button>
                    </div>
                  </div>
                ))}

                {profile.storeImages?.length < 3 && (
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                    <FiPlus className="text-gray-500" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleStoreImageAdd}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Password Reset Section */}
          {!profile.isDemo && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-gray-500 font-semibold uppercase text-xs">
                  Security
                </h2>
                <button
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                >
                  <FiLock className="h-3 w-3" />
                  {showPasswordReset ? "Cancel" : "Change Password"}
                </button>
              </div>

              {showPasswordReset && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full text-sm p-2 pr-8 border rounded focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-2 top-2 text-gray-500"
                    >
                      {showCurrentPassword ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full text-sm p-2 pr-8 border rounded focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-2 text-gray-500"
                    >
                      {showNewPassword ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full text-sm p-2 border rounded focus:outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={handlePasswordReset}
                    className="w-full text-sm py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Update Password
                  </button>
                </div>
              )}
            </div>
          )}

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
                onClick={() => navigate("/dhobi-dashboard")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 transition shadow-md"
              >
                🧺 Go to Vendor Dashboard
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
