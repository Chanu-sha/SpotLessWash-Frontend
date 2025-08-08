import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

  const [activeRole, setActiveRole] = useState("deliveryboy"); 
  const [activeTab, setActiveTab] = useState("requests"); 
  const [users, setUsers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (role, tab) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    <div className="min-h-screen max-w-md mx-auto bg-gray-100">
      <ToastContainer position="top-center" />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-center text-blue-600">Admin Panel</h1>
        </div>
        
        {/* Role Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveRole("deliveryboy")}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === "deliveryboy" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="block">📦 Delivery</span>
          </button>
          <button
            onClick={() => setActiveRole("dhobi")}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm ${activeRole === "dhobi" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="block">🧺 Vendor</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Status Tabs */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {["all", "requests", "rejected"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-gray-700 shadow-sm"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" && "All Users"}
              {tab === "requests" && "Register Requests"}
              {tab === "rejected" && "Rejected"}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-3">
          {!loading && users.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            users.map((user) => {
              const isExpanded = expandedId === user._id;
              return (
                <div key={user._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                      {activeTab === "requests" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold px-3 py-1 rounded-full"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t text-sm text-gray-600 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <span className={`font-semibold ${user.approved ? 'text-green-600' : user.rejected ? 'text-red-600' : 'text-yellow-600'}`}>
                            {user.approved ? "Approved" : user.rejected ? "Rejected" : "Pending"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">User ID:</span>
                          <span className="text-gray-500 text-xs truncate max-w-[150px]">{user._id}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(user._id)}
                    className="w-full py-2 bg-gray-50 mx-2.5 text-start text-xs text-blue-600 font-medium hover:bg-gray-100"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
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