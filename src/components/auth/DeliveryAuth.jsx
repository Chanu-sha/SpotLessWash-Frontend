import React, { useContext } from "react";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
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

  // Register handler
  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/deliveryboy/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryForm),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setDeliveryStatus("pending");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(" Register error:", err);
      toast.error("Something went wrong while registering");
    }
  };
  const { updateRole } = useContext(UserContext);
  // Login handler
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

  return (
    <>
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

          <button
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-lg"
          >
            Register as Delivery Partner
          </button>

          <p className="text-center text-sm mt-4">
            Already registered?
            <button
              onClick={() => setDeliveryStatus("login")}
              className="text-blue-600"
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
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-lg"
          >
            Sign In
          </button>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <button
              onClick={() => setDeliveryStatus("register")}
              className="text-blue-600"
            >
              Register here
            </button>
          </p>
        </div>
      )}

      {deliveryStatus === "pending" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm text-center">
          Your registration is pending approval. We’ll notify you once your
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
      className="w-full pl-10 pr-4 py-3 border rounded-lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default DeliveryAuth;
