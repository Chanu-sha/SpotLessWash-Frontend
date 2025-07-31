import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

  const [activeRole, setActiveRole] = useState("deliveryboy"); // or 'dhobi'
  const [activeTab, setActiveTab] = useState("requests"); // 'all' | 'requests' | 'rejected'
  const [users, setUsers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = async (role, tab) => {
    let endpoint = "";
    switch (tab) {
      case "all": endpoint = "all"; break;
      case "requests": endpoint = "pending"; break;
      case "rejected": endpoint = "rejected"; break;
      default: return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/${role}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (err) {
      toast.error("Error fetching data");
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${activeRole}/approve/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Approved");
        fetchData(activeRole, activeTab);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error approving");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${activeRole}/reject/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Rejected");
        fetchData(activeRole, activeTab);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error rejecting");
    }
  };

  useEffect(() => {
    fetchData(activeRole, activeTab);
  }, [activeRole, activeTab]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <ToastContainer />
      
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Admin Panel</h2>
        <div>
          <p className="font-semibold mb-2">Sections</p>
          <button
            onClick={() => setActiveRole("deliveryboy")}
            className={`block w-full text-left px-3 py-2 rounded ${activeRole === "deliveryboy" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
          >
            📦 Delivery Boys
          </button>
          <button
            onClick={() => setActiveRole("dhobi")}
            className={`block w-full text-left px-3 py-2 rounded ${activeRole === "dhobi" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
          >
            🧺 Dhobis
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Manage {activeRole === "deliveryboy" ? "Delivery Boys" : "Dhobi Professionals"}</h1>

        {/* Tabs */}
        <div className="flex space-x-3 mb-6">
          {["all", "requests", "rejected"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" && "All Users"}
              {tab === "requests" && "Register Requests"}
              {tab === "rejected" && "Rejected Users"}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-4 max-w-2xl">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center">No users found.</p>
          ) : (
            users.map((user) => {
              const isExpanded = expandedId === user._id;
              return (
                <div key={user._id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email} | {user.phone}</p>
                    </div>
                    {activeTab === "requests" && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApprove(user._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      <p><span className="font-medium">Phone:</span> {user.phone}</p>
                      <p><span className="font-medium">Approved:</span> {user.approved ? "Yes" : "No"}</p>
                      <p><span className="font-medium">Rejected:</span> {user.rejected ? "Yes" : "No"}</p>
                      <p><span className="font-medium">ID:</span> {user._id}</p>
                    </div>
                  )}

                  <div className="text-right mt-2">
                    <button
                      onClick={() => toggleExpand(user._id)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      {isExpanded ? "Show Less" : "Show More"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
