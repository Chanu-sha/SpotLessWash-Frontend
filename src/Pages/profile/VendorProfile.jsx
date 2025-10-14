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
  FiX,
  FiChevronDown,
  FiChevronUp,
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
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Popup States
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showServices, setShowServices] = useState(false);

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
    basePrice: "",
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
    if (
      !serviceForm.name ||
      !serviceForm.description ||
      !serviceForm.basePrice
    ) {
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
      setServiceForm({ name: "", description: "", basePrice: "" });
      setShowServiceModal(false);
      toast.success("Service added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add service");
    }
  };

  const handleUpdateService = async (serviceId) => {
    if (
      !serviceForm.name ||
      !serviceForm.description ||
      !serviceForm.basePrice
    ) {
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
      setServiceForm({ name: "", description: "", basePrice: "" });
      setShowServiceModal(false);
      toast.success("Service updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update service");
    }
  };

  const handleDeleteService = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.delete(
        `${API_BASE_URL}/vendor/services/${deleteServiceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, services: res.data.services }));
      setDeleteServiceId(null);
      setShowDeleteModal(false);
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
      basePrice: service.basePrice.toString(),
    });
    setShowServiceModal(true);
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

  // ---- Service Modal ----
  const ServiceModal = () => (
    <>
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl md:rounded-xl w-full md:max-w-md max-h-[85vh] mb-16 overflow-y-auto animate-slide-up md:animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b border-gray-200 rounded-t-3xl md:rounded-t-xl">
              <h3 className="text-lg font-semibold">
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>
              <button
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingService(null);
                  setServiceForm({ name: "", description: "", basePrice: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="Enter service name"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter service description"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={serviceForm.basePrice}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      basePrice: e.target.value,
                    })
                  }
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                {editingService ? (
                  <>
                    <button
                      onClick={() => handleUpdateService(editingService)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Update Service
                    </button>
                    <button
                      onClick={() => {
                        setShowServiceModal(false);
                        setEditingService(null);
                        setServiceForm({
                          name: "",
                          description: "",
                          basePrice: "",
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddService}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Add Service
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ---- Delete Modal ----
  const DeleteModal = () => (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl mb-28 md:rounded-xl w-full md:max-w-sm animate-slide-up md:animate-fade-in">
            {/* Content */}
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-4 rounded-full">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Service?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                This action cannot be undone. The service will be permanently
                deleted.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteServiceId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteService}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />

      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto overflow-hidden lg:max-w-2xl">
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
                {profile.services && profile.services.length > 0 && (
                  <button
                    onClick={() => setShowServices(!showServices)}
                    className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                  >
                    {showServices ? (
                      <>
                        <FiChevronUp className="h-3 w-3" />
                        Hide Services
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="h-3 w-3" />
                        Manage Services
                      </>
                    )}
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setShowServiceModal(true);
                  setEditingService(null);
                  setServiceForm({ name: "", description: "", basePrice: "" });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Service
              </button>

              {/* Services List - Only shown when expanded */}
              {showServices &&
                profile.services &&
                profile.services.length > 0 && (
                  <div className="space-y-2 mt-4 animate-fade-in">
                    {profile.services.map((service) => (
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
                              ₹{service.basePrice}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => editService(service)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteServiceId(service._id);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt="Store"
                      className="w-full h-24 object-cover rounded-lg border"
                    />

                    {/* Bottom-right edit & delete buttons */}
                    <div className="absolute bottom-1 right-1 flex gap-2">
                      <label
                        htmlFor={`store-image-${index}`}
                        className="cursor-pointer bg-white p-1.5 rounded-full shadow-md hover:bg-gray-50"
                      >
                        <FiEdit2 className="text-blue-600 w-4 h-4" />
                      </label>
                      <input
                        id={`store-image-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleStoreImageUpdate(e, index)}
                      />
                      <button
                        onClick={() => handleStoreImageDelete(index)}
                        className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-50"
                      >
                        <FiTrash2 className="text-red-600 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {profile.storeImages?.length < 3 && (
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <FiPlus className="text-gray-500 w-6 h-6" />
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
                    className="w-full text-sm py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                Go to Vendor Dashboard
              </button>

              <button
                onClick={() => navigate("/contact")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 transition shadow-md"
              >
                Contact Us 🎧
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ServiceModal />
      <DeleteModal />
    </div>
  );
}
