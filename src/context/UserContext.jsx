// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  const readTokenFromLS = (key) => {
    const t = localStorage.getItem(key);
    if (!t || t === "undefined" || t === "null") return null;
    return t;
  };

  useEffect(() => {
    const checkRole = () => {
      const dhobiToken = readTokenFromLS("dhobiToken");
      const deliveryToken = readTokenFromLS("deliveryToken");

      if (dhobiToken) {
        setRole("dhobi");
        return;
      }
      if (deliveryToken) {
        setRole("delivery");
        return;
      }

      auth.onAuthStateChanged((user) => {
        if (user) {
          setRole("firebase");
        } else {
          setRole(null); 
        }
      });
    };

    checkRole();
  }, []);

  return (
    <UserContext.Provider value={{ role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};
