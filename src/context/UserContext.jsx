import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const readTokenFromLS = (key) => {
    const t = localStorage.getItem(key);
    if (!t || t === "undefined" || t === "null") return null;
    return t;
  };

  const updateRole = () => {
    const vendorToken = readTokenFromLS("vendorToken");
    const deliveryToken = readTokenFromLS("deliveryToken");

    if (vendorToken) {
      setRole("vendor");
      return "vendor";
    }
    if (deliveryToken) {
      setRole("delivery");
      return "delivery";
    }
    if (currentUser) {
      setRole("firebase");
      return "firebase";
    }
    setRole(null); 
    return null;
  };

  useEffect(() => {
    // Initial check
    updateRole();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  // Update role when currentUser changes
  useEffect(() => {
    updateRole();
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ role, setRole, currentUser, loading, updateRole }}>
      {children}
    </UserContext.Provider>
  );
};