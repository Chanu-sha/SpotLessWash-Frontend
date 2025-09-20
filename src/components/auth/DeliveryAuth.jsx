import React, { useContext, useState, useRef } from "react";
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { UserContext } from "../../context/UserContext";

const DeliveryAuth = ({
  deliveryForm,
  setDeliveryForm,
  deliveryStatus,
  setDeliveryStatus,
  API_BASE_URL,
  navigate,
}) => {
  const isRegistering = deliveryStatus === "register";
  const [showCamera, setShowCamera] = useState(null); // 'live', 'aadhaar', 'license', null
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera for live photo or document upload
  const startCamera = async (photoType) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: photoType === 'live' ? 'user' : 'environment' // Front camera for live photo, back for documents
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(photoType);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(null);
  };

  // Capture photo
  const capturePhoto = (photoType) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `${photoType}_photo.jpg`, { type: 'image/jpeg' });
        
        setDeliveryForm(prev => ({
          ...prev,
          [`${photoType}Photo`]: file
        }));
        
        toast.success(`${photoType.charAt(0).toUpperCase() + photoType.slice(1)} photo captured successfully!`);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  // Convert file to base64 for preview
  const getImagePreview = (file) => {
    if (file && file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Register handler with photo upload
  const handleRegister = async () => {
    try {
      const formData = new FormData();
      formData.append('name', deliveryForm.name);
      formData.append('email', deliveryForm.email);
      formData.append('phone', deliveryForm.phone);
      formData.append('password', deliveryForm.password);
      
      if (deliveryForm.livePhoto) {
        formData.append('livePhoto', deliveryForm.livePhoto);
      }
      if (deliveryForm.aadhaarPhoto) {
        formData.append('aadhaarPhoto', deliveryForm.aadhaarPhoto);
      }
      if (deliveryForm.licensePhoto) {
        formData.append('licensePhoto', deliveryForm.licensePhoto);
      }

      const res = await fetch(`${API_BASE_URL}/deliveryboy/register`, {
        method: "POST",
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setDeliveryStatus("pending");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error("Something went wrong while registering");
    }
  };

  const { updateRole } = useContext(UserContext);
  
  // Login handler (unchanged)
  const handleLogin = async () => {
    const { phone, password } = deliveryForm;

    try {
      const res = await fetch(`${API_BASE_URL}/deliveryboy/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("deliveryToken", data.token);
        updateRole();
        toast.success("Login successful");
        navigate("/delieveryprofile");
      } else {
        toast.error(data.message || "Login failed");
        if (data.message?.includes("Not approved")) {
          setDeliveryStatus("pending");
        }
      }
    } catch (err) {
      console.error("Login Request Error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Remove photo
  const removePhoto = (photoType) => {
    setDeliveryForm(prev => ({
      ...prev,
      [`${photoType}Photo`]: null
    }));
  };

  return (
    <>
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-2xl mx-4">
            <button
              onClick={stopCamera}
              className="absolute top-4 right-4 z-10 bg-red-600 text-white p-2 rounded-full"
            >
              <FiX size={20} />
            </button>
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-lg"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => capturePhoto(showCamera)}
                className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100"
              >
                <FiCamera size={24} />
              </button>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {isRegistering ? (
        <div className="space-y-4">
          <Input
            icon={<FiUser />}
            placeholder="Full Name"
            value={deliveryForm.name}
            onChange={(val) => setDeliveryForm({ ...deliveryForm, name: val })}
          />
          <Input
            icon={<FiMail />}
            placeholder="Email"
            type="email"
            value={deliveryForm.email}
            onChange={(val) => setDeliveryForm({ ...deliveryForm, email: val })}
          />
          <Input
            icon={<FiPhone />}
            placeholder="Phone Number"
            type="tel"
            value={deliveryForm.phone}
            onChange={(val) => setDeliveryForm({ ...deliveryForm, phone: val })}
          />
          <Input
            icon={<FiLock />}
            placeholder="Password"
            type="password"
            value={deliveryForm.password}
            onChange={(val) =>
              setDeliveryForm({ ...deliveryForm, password: val })
            }
          />

          {/* Live Photo Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <FiCamera className="mr-2" />
              Live Photo (Required)
            </h3>
            {deliveryForm.livePhoto ? (
              <div className="relative">
                <img
                  src={getImagePreview(deliveryForm.livePhoto)}
                  alt="Live photo"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto('live')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startCamera('live')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
              >
                <FiCamera className="mx-auto mb-2" size={24} />
                <p>Click to take live photo</p>
              </button>
            )}
          </div>

          {/* Aadhaar Card Photo Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <FiUpload className="mr-2" />
              Aadhaar Card Photo (Required)
            </h3>
            {deliveryForm.aadhaarPhoto ? (
              <div className="relative">
                <img
                  src={getImagePreview(deliveryForm.aadhaarPhoto)}
                  alt="Aadhaar card"
                  className="w-48 h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto('aadhaar')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startCamera('aadhaar')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
              >
                <FiCamera className="mx-auto mb-2" size={24} />
                <p>Click to capture Aadhaar card</p>
              </button>
            )}
          </div>

          {/* Driving License Photo Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <FiUpload className="mr-2" />
              Driving License Photo (Required)
            </h3>
            {deliveryForm.licensePhoto ? (
              <div className="relative">
                <img
                  src={getImagePreview(deliveryForm.licensePhoto)}
                  alt="Driving license"
                  className="w-48 h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto('license')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startCamera('license')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
              >
                <FiCamera className="mx-auto mb-2" size={24} />
                <p>Click to capture driving license</p>
              </button>
            )}
          </div>

          <button
            onClick={handleRegister}
            disabled={!deliveryForm.livePhoto || !deliveryForm.aadhaarPhoto || !deliveryForm.licensePhoto}
            className={`w-full py-3 rounded-lg transition-colors ${
              deliveryForm.livePhoto && deliveryForm.aadhaarPhoto && deliveryForm.licensePhoto
                ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Register as Delivery Partner
          </button>

          <p className="text-center text-sm mt-4">
            Already registered?{" "}
            <button
              onClick={() => setDeliveryStatus("login")}
              className="text-blue-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            icon={<FiPhone />}
            placeholder="Phone Number"
            type="tel"
            value={deliveryForm.phone}
            onChange={(val) => setDeliveryForm({ ...deliveryForm, phone: val })}
          />
          <Input
            icon={<FiLock />}
            placeholder="Password"
            type="password"
            value={deliveryForm.password}
            onChange={(val) =>
              setDeliveryForm({ ...deliveryForm, password: val })
            }
          />

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-lg hover:from-orange-500 hover:to-orange-700 transition-colors"
          >
            Sign In
          </button>

          <p className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <button
              onClick={() => setDeliveryStatus("register")}
              className="text-blue-600 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      )}

      {deliveryStatus === "pending" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm text-center">
          Your registration is pending approval. We'll notify you once your
          account is activated.
        </div>
      )}
    </>
  );
};

const Input = ({ icon, placeholder, value, onChange, type = "text" }) => (
  <div className="relative">
    <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default DeliveryAuth;