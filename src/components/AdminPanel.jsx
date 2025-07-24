import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [activeTab, setActiveTab] = useState("requests");
  const [users, setUsers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

  const fetchData = async (type) => {
    let endpoint = "";
    switch (type) {
      case "all": endpoint = "all"; break;
      case "requests": endpoint = "pending"; break;
      case "rejected": endpoint = "rejected"; break;
      default: return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/deliveryboy/${endpoint}`, {
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
      const res = await fetch(`${API_BASE_URL}/deliveryboy/approve/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Approved");
        fetchData(activeTab);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error approving");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/deliveryboy/reject/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Rejected");
        fetchData(activeTab);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error rejecting");
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-center mb-6">Hello, Admin</h1>

      {/* Tabs */}
      <div className=" flex justify-center  space-x-4 mb-6 ">
        <div className="inline-flex overflow-x-auto space-x-3">
          {["all", "requests", "rejected"].map((tab) => (
            <button
              key={tab}
              className={`shrink-0 px-4 py-1.5 rounded text-sm whitespace-nowrap ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" && "All Users"}
              {tab === "requests" && "Register Requests"}
              {tab === "rejected" && "Rejected Users"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-2xl mx-auto space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">No data.</p>
        ) : (
          users.map((user) => {
            const isExpanded = expandedId === user._id;
            return (
              <div key={user._id} className="bg-white rounded shadow p-4">
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

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 text-sm text-gray-700 space-y-1">
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
                    {isExpanded ? "Show Less" : "Show More "}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
