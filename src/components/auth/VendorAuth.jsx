import { useContext } from "react";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import { UserContext } from "../../context/UserContext";

const VendorAuth = ({
  vendorForm,
  setVendorForm,
  vendorStatus,
  setVendorStatus,
  API_BASE_URL,
  navigate,
}) => {
  const isRegistering = vendorStatus === "register";

  // Predefined service categories
  const availableServices = [
    "Shirts",
    "Pants",
    "Ethnic Wear",
    "Home Linen",
    "Shoes",
  ];

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
            [field]: field === "price" ? value : value,
          }
        : s
    );
    setVendorForm({ ...vendorForm, services: updatedServices });
  };

  const { updateRole } = useContext(UserContext);

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorForm),
      });
      const data = await res.json();
      res.ok
        ? (toast.success(data.message), setVendorStatus("pending"))
        : toast.error(data.message);
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("vendorToken", data.token);
        updateRole();
        toast.success("Login successful");
        navigate("/vendorprofile");
      } else {
        toast.error(data.message);
        if (data.message.includes("Not approved")) setVendorStatus("pending");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <>
      {isRegistering ? (
        <div className="space-y-4">
          <Input
            icon={<FiUser />}
            placeholder="Full Name"
            value={vendorForm.name}
            onChange={(val) => setVendorForm({ ...vendorForm, name: val })}
          />
          <Input
            icon={<FiMail />}
            placeholder="Email"
            value={vendorForm.email}
            type="email"
            onChange={(val) => setVendorForm({ ...vendorForm, email: val })}
          />
          <Input
            icon={<FiPhone />}
            placeholder="Phone Number"
            value={vendorForm.phone}
            type="tel"
            onChange={(val) => setVendorForm({ ...vendorForm, phone: val })}
          />
          <Input
            icon={<FiLock />}
            placeholder="Password"
            type="password"
            value={vendorForm.password}
            onChange={(val) => setVendorForm({ ...vendorForm, password: val })}
          />

          {/* Services Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Select Services You Provide</h3>
            {availableServices.map((service, idx) => {
              const selected = (vendorForm.services || []).find(
                (s) => s.name === service
              );
              return (
                <div key={idx} className="mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => toggleService(service)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="font-medium">{service}</span>
                  </label>

                  {selected && (
                    <div className="ml-6 mt-2 space-y-2">
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
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={selected.price}
                        onChange={(e) =>
                          updateServiceField(service, "price", e.target.value)
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Register as Vendor
          </button>

          <p className="text-center text-sm mt-4">
            Already registered?{" "}
            <button
              onClick={() => setVendorStatus("login")}
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
            value={vendorForm.phone}
            onChange={(val) => setVendorForm({ ...vendorForm, phone: val })}
          />
          <Input
            icon={<FiLock />}
            placeholder="Password"
            type="password"
            value={vendorForm.password}
            onChange={(val) => setVendorForm({ ...vendorForm, password: val })}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Sign In
          </button>
          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <button
              onClick={() => setVendorStatus("register")}
              className="text-blue-600"
            >
              Register here
            </button>
          </p>
        </div>
      )}

      {vendorStatus === "pending" && (
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

export default VendorAuth;
