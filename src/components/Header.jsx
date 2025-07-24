import React, { useEffect, useState } from "react";
import { BsCart3 } from "react-icons/bs";
import { LuBell } from "react-icons/lu";import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    navigate("/auth"); 
  };

  return (
    <div className="w-full bg-white px-4 py-1.5 flex items-center justify-between text-gray-900 max-w-md mx-auto shadow">
      <img
        className="w-14 h-14 object-contain"
        src="/spotlesswashlogo.png"
        alt="Spotless wash Logo"
      />

      {user ? (
        <div className="flex gap-4" > 
          <button onClick={() => navigate("/orders")} aria-label="Cart">
            <BsCart3 size={20} />
          </button>
          <button onClick={() => navigate("/orders")} aria-label="Cart">
            <LuBell  size={20} />
          </button>
          
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="text-sm bg-blue-50 px-4 py-1 rounded-md text-blue-600 hover:bg-blue-100 transition duration-200"
        >
          Login
        </button>
      )}
    </div>
  );
}
