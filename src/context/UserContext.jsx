// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // 👈 yeh add karo
  const [loading, setLoading] = useState(true);

  const readTokenFromLS = (key) => {
    const t = localStorage.getItem(key);
    if (!t || t === "undefined" || t === "null") return null;
    return t;
  };

  useEffect(() => {
    const dhobiToken = readTokenFromLS("dhobiToken");
    const deliveryToken = readTokenFromLS("deliveryToken");

    if (dhobiToken) {
      setRole("dhobi");
      setLoading(false);
      return;
    }
    if (deliveryToken) {
      setRole("delivery");
      setLoading(false);
      return;
    }

    // 👇 yeh firebase ka listener hai
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);   // 👈 user set ho raha hai
        setRole("firebase");
      } else {
        setCurrentUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ role, setRole, currentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
