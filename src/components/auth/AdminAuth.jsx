import { FiUser, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";

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
    <div className="space-y-4">
      <Input icon={<FiUser />} placeholder="Admin Username" value={adminCreds.username} onChange={(val) => setAdminCreds({ ...adminCreds, username: val })} />
      <Input icon={<FiLock />} placeholder="Password" type="password" value={adminCreds.password} onChange={(val) => setAdminCreds({ ...adminCreds, password: val })} />
      <button onClick={handleAdminLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg">Access Admin Panel</button>
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

export default AdminAuth;
