import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import { useState } from "react";

const AdminAuth = ({ adminCreds, setAdminCreds, API_BASE_URL, navigate }) => {
  const handleAdminLogin = async () => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminCreds),
    });

    res.ok
      ? (toast.success("Admin login successful"), navigate("/admin-panel"))
      : toast.error("Invalid admin credentials");
  };

  return (
    <div className="space-y-4 mt-10 px-2">
      <Input
        icon={<FiUser />}
        placeholder="Admin Username"
        value={adminCreds.username}
        onChange={(val) => setAdminCreds({ ...adminCreds, username: val })}
      />
      <PasswordInput
        icon={<FiLock />}
        placeholder="Password"
        value={adminCreds.password}
        onChange={(val) => setAdminCreds({ ...adminCreds, password: val })}
      />
      <button
        onClick={handleAdminLogin}
        className="w-full bg-gradient-to-r from-red-600 to-sky-600 text-white py-3 rounded-lg"
      >
        Access Admin Panel
      </button>
    </div>
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

const PasswordInput = ({ icon, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative ">
      <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 border rounded-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        className="absolute right-3 top-3 text-gray-400 cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FiEyeOff /> : <FiEye />}
      </div>
    </div>
  );
};

export default AdminAuth;
