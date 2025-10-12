import React, { useContext, useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiCamera,
  FiUpload,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { UserContext } from "../../context/UserContext";
import {
  Camera,
  CameraResultType,
  CameraSource,
  CameraDirection,
} from "@capacitor/camera";

const VendorAuth = ({
  vendorForm,
  setVendorForm,
  vendorStatus,
  setVendorStatus,
  API_BASE_URL,
  navigate,
}) => {
  const isRegistering = vendorStatus === "register";
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // password visibility states
  const [registerPassVisible, setRegisterPassVisible] = useState(false);
  const [loginPassVisible, setLoginPassVisible] = useState(false);

  // Predefined service categories
  const availableServices = [
    "Shirts",
    "Pants",
    "Ethnic Wear",
    "Home Linen",
    "Shoes",
  ];

  // Capacitor Camera function
  const capturePhoto = async (photoType) => {
    try {
      setIsCapturing(true);
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction:
          photoType === "live" ? CameraDirection.Front : CameraDirection.Rear,
        width: 1024,
        height: 768,
        saveToGallery: false,
        correctOrientation: true,
      });

      // Convert base64 to File object
      const base64Data = image.dataUrl;
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const file = new File([blob], `${photoType}_photo.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      setVendorForm((prev) => ({
        ...prev,
        [`${photoType}Photo`]: file,
        [`${photoType}PhotoPreview`]: base64Data,
      }));

      const photoName = photoType === "live" ? "Live Photo" : "Aadhaar Card";
      toast.success(`${photoName} captured successfully!`);
    } catch (error) {
      console.error("Camera error:", error);
      if (error.message === "User cancelled photos app") {
        toast.info("Photo capture cancelled");
      } else {
        toast.error("Camera not available. Please check permissions.");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Get image preview
  const getImagePreview = (photoType) => {
    const preview = vendorForm[`${photoType}PhotoPreview`];
    if (preview) {
      return preview;
    }
    return null;
  };

  // Remove photo
  const removePhoto = (photoType) => {
    setVendorForm((prev) => ({
      ...prev,
      [`${photoType}Photo`]: null,
      [`${photoType}PhotoPreview`]: null,
    }));

    const photoName = photoType === "live" ? "Live Photo" : "Aadhaar Card";
    toast.info(`${photoName} removed`);
  };

  // Toggle service
  const toggleService = (service) => {
    let updatedServices = [...(vendorForm.services || [])];
    const exists = updatedServices.find((s) => s.name === service);

    if (exists) {
      updatedServices = updatedServices.filter((s) => s.name !== service);
    } else {
      updatedServices.push({ name: service, description: "", price: "" });
    }
    setVendorForm({ ...vendorForm, services: updatedServices });
  };

  // Update service details
  const updateServiceField = (serviceName, field, value) => {
    const updatedServices = (vendorForm.services || []).map((s) =>
      s.name === serviceName
        ? {
            ...s,
            [field]: value,
          }
        : s
    );
    setVendorForm({ ...vendorForm, services: updatedServices });
  };

  const { updateRole } = useContext(UserContext);

  // Validate form data
  const validateForm = () => {
    if (!vendorForm.name?.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!vendorForm.email?.trim() || !vendorForm.email.includes("@")) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!vendorForm.phone?.trim() || vendorForm.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (!vendorForm.password || vendorForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!vendorForm.services || vendorForm.services.length === 0) {
      toast.error("Please select at least one service");
      return false;
    }
    if (!vendorForm.livePhoto) {
      toast.error("Please capture your live photo");
      return false;
    }
    if (!vendorForm.aadhaarPhoto) {
      toast.error("Please capture Aadhaar card photo");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", vendorForm.name.trim());
      formData.append("email", vendorForm.email.trim().toLowerCase());
      formData.append("phone", vendorForm.phone.trim());
      formData.append("password", vendorForm.password);
      formData.append("services", JSON.stringify(vendorForm.services));
      formData.append("livePhoto", vendorForm.livePhoto);
      formData.append("aadhaarPhoto", vendorForm.aadhaarPhoto);

      const res = await fetch(`${API_BASE_URL}/vendor/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setVendorStatus("pending");
        setVendorForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          services: [],
          livePhoto: null,
          aadhaarPhoto: null,
          livePhotoPreview: null,
          aadhaarPhotoPreview: null,
        });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error("Network error. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    const { phone, password } = vendorForm;

    if (!phone?.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    if (!password) {
      toast.error("Please enter password");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("vendorToken", data.token);
        updateRole();
        toast.success("Login successful");
        navigate("/vendorprofile");
      } else {
        toast.error(data.message || "Login failed");
        if (data.message?.includes("Not approved")) {
          setVendorStatus("pending");
        }
      }
    } catch (err) {
      console.error("Login Request Error:", err);
      toast.error("Network error. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            {isRegistering ? "Register as Vendor" : "Vendor Login"}
          </h2>
        </div>

        <div className="p-6">
          {isRegistering ? (
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Personal Information
                </h3>
                <Input
                  icon={<FiUser />}
                  placeholder="Full Name"
                  value={vendorForm.name || ""}
                  onChange={(val) =>
                    setVendorForm({ ...vendorForm, name: val })
                  }
                  required
                  disabled={isSubmitting}
                />
                <Input
                  icon={<FiMail />}
                  placeholder="Email Address"
                  type="email"
                  value={vendorForm.email || ""}
                  onChange={(val) =>
                    setVendorForm({ ...vendorForm, email: val })
                  }
                  required
                  disabled={isSubmitting}
                />
                <Input
                  icon={<FiPhone />}
                  placeholder="Phone Number"
                  type="tel"
                  value={vendorForm.phone || ""}
                  onChange={(val) =>
                    setVendorForm({ ...vendorForm, phone: val })
                  }
                  required
                  disabled={isSubmitting}
                />
                <Input
                  icon={<FiLock />}
                  placeholder="Create Password"
                  type="password"
                  value={vendorForm.password || ""}
                  onChange={(val) =>
                    setVendorForm({ ...vendorForm, password: val })
                  }
                  required
                  disabled={isSubmitting}
                  passwordVisible={registerPassVisible}
                  setPasswordVisible={setRegisterPassVisible}
                />
              </div>

              {/* Services Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Services You Provide
                </h3>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                  {availableServices.map((service, idx) => {
                    const selected = (vendorForm.services || []).find(
                      (s) => s.name === service
                    );
                    return (
                      <div key={idx} className="mb-4">
                        <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => toggleService(service)}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="font-medium text-gray-800">
                            {service}
                          </span>
                        </label>

                        {selected && (
                          <div className="ml-8 mt-3 space-y-3 p-3 bg-white rounded-lg border">
                            <input
                              type="text"
                              placeholder="Service Description"
                              value={selected.description}
                              onChange={(e) =>
                                updateServiceField(
                                  service,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <input
                              type="number"
                              placeholder="Price (₹)"
                              value={selected.price}
                              onChange={(e) =>
                                updateServiceField(
                                  service,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Required Documents
                </h3>
                <PhotoSection
                  title="Live Photo"
                  subtitle="Take a clear selfie"
                  photoType="live"
                  icon={<FiCamera className="text-blue-500" />}
                  vendorForm={vendorForm}
                  capturePhoto={capturePhoto}
                  getImagePreview={getImagePreview}
                  removePhoto={removePhoto}
                  isCapturing={isCapturing}
                />
                <PhotoSection
                  title="Aadhaar Card"
                  subtitle="Capture clear photo of your Aadhaar card"
                  photoType="aadhaar"
                  icon={<FiUpload className="text-green-500" />}
                  vendorForm={vendorForm}
                  capturePhoto={capturePhoto}
                  getImagePreview={getImagePreview}
                  removePhoto={removePhoto}
                  isCapturing={isCapturing}
                />
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={
                  !vendorForm.livePhoto ||
                  !vendorForm.aadhaarPhoto ||
                  !vendorForm.services?.length ||
                  isSubmitting
                }
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center ${
                  vendorForm.livePhoto &&
                  vendorForm.aadhaarPhoto &&
                  vendorForm.services?.length &&
                  !isSubmitting
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing Registration...
                  </>
                ) : vendorForm.livePhoto &&
                  vendorForm.aadhaarPhoto &&
                  vendorForm.services?.length ? (
                  "Complete Registration"
                ) : (
                  "Please complete all requirements"
                )}
              </button>

              <div className="text-center pt-4 border-t">
                <p className="text-gray-600">
                  Already registered?{" "}
                  <button
                    onClick={() => setVendorStatus("login")}
                    disabled={isSubmitting}
                    className="text-purple-600 font-semibold hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-6">
              <div className="space-y-4">
                <Input
                  icon={<FiPhone />}
                  placeholder="Phone Number"
                  type="tel"
                  value={vendorForm.phone || ""}
                  onChange={(val) =>
                    setVendorForm({ ...vendorForm, phone: val })
                  }
                  required
                  disabled={isSubmitting}
                />
                <Input
                  icon={<FiLock />}
                  placeholder="Password"
                  type="password"
                  value={vendorForm.password || ""}
                  onChange={(val) =>
                    setVendorForm({ ...vendorForm, password: val })
                  }
                  required
                  disabled={isSubmitting}
                  passwordVisible={loginPassVisible}
                  setPasswordVisible={setLoginPassVisible}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center pt-4 border-t">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setVendorStatus("register")}
                    disabled={isSubmitting}
                    className="text-purple-600 font-semibold hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Pending Status */}
          {vendorStatus === "pending" && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="text-2xl">⏳</div>
              </div>
              <p className="text-yellow-800 text-center font-medium">
                Registration Pending
              </p>
              <p className="text-yellow-700 text-sm text-center mt-1">
                Your documents are being verified. We'll notify you once
                approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Input Component with password toggle
const Input = ({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  passwordVisible,
  setPasswordVisible,
  ...rest
}) => (
  <div className="relative">
    <div className="absolute left-3 top-4 text-gray-400 z-10">{icon}</div>
    <input
      type={
        type === "password" ? (passwordVisible ? "text" : "password") : type
      }
      placeholder={placeholder}
      className={`w-full pl-11 pr-12 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white text-gray-900 transition-all duration-200 ${
        disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      {...rest}
    />
    {type === "password" && (
      <button
        type="button"
        onClick={() => setPasswordVisible((v) => !v)}
        tabIndex={-1}
        disabled={disabled}
        className="absolute right-3 top-4 text-xl text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        {passwordVisible ? <FiEye /> : <FiEyeOff />}
      </button>
    )}
    {required && !value && (
      <div className="absolute right-10 top-4 text-red-400">*</div>
    )}
  </div>
);

// Photo Section Component
const PhotoSection = ({
  title,
  subtitle,
  photoType,
  icon,
  vendorForm,
  capturePhoto,
  getImagePreview,
  removePhoto,
  isCapturing,
}) => (
  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
    <div className="flex items-center mb-3">
      {icon}
      <div className="ml-3">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
    {vendorForm[`${photoType}Photo`] ? (
      <div className="relative inline-block">
        <img
          src={getImagePreview(photoType)}
          alt={`${photoType} photo`}
          className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-purple-200 shadow-md"
        />
        <button
          onClick={() => removePhoto(photoType)}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
        >
          <FiX size={16} />
        </button>
        <div className="mt-2 text-center">
          <span className="text-green-600 font-medium text-sm">
            ✓ Photo Captured
          </span>
        </div>
      </div>
    ) : (
      <button
        onClick={() => capturePhoto(photoType)}
        disabled={isCapturing}
        className={`w-full border-2 border-dashed border-purple-300 rounded-lg p-6 text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 ${
          isCapturing ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FiCamera className="mx-auto mb-2" size={32} />
        <p className="font-semibold">
          {isCapturing ? "Opening Camera..." : "Tap to Capture"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {photoType === "live"
            ? "Front camera will open"
            : "Back camera will open"}
        </p>
      </button>
    )}
  </div>
);

export default VendorAuth;
