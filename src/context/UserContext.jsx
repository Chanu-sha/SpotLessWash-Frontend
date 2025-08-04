// src/context/UserContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { toast } from "react-toastify";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState("firebase");
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    const dhobiToken = localStorage.getItem("dhobiToken");
    const deliveryToken = localStorage.getItem("deliveryToken");

    if (dhobiToken) {
      setRole("dhobi");
      try {
        const res = await fetch("/api/dhobi/profile", {
          headers: { Authorization: `Bearer ${dhobiToken}` },
        });
        const data = await res.json();
        setProfile({ ...data, role: "dhobi" });
        return;
      } catch {
        toast.error("Failed to load dhobi profile");
      }
    }

    if (deliveryToken) {
      setRole("delivery");
      try {
        const res = await fetch("/api/deliveryboy/profile", {
          headers: { Authorization: `Bearer ${deliveryToken}` },
        });
        const data = await res.json();
        setProfile({ ...data, role: "delivery" });
        return;
      } catch {
        toast.error("Failed to load delivery profile");
      }
    }

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setRole("firebase");
        const token = await user.getIdToken();
        try {
          const res = await fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setProfile(data);
        } catch {
          toast.error("Failed to load user profile");
        }
      } else {
        setProfile({
          name: "Guest User",
          email: "guest@example.com",
          phone: "",
          address: "",
          photo: "",
          isDemo: true,
        });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ profile, setProfile, role, loading, fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};
