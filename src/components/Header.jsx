import React, { useContext } from "react";
import { BsCart3 } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Header() {
  const { role } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/auth");
  };

  let rightContent;

  if (role === null) {
    // Not logged in
    rightContent = (
      <button
        onClick={handleLogin}
        className="text-sm bg-blue-50 px-4 py-1 rounded-md text-blue-600 hover:bg-blue-100 transition duration-200"
      >
        Login
      </button>
    );
  } else if (role === "firebase") {
    // Firebase logged in
    rightContent = (
      <div className="flex gap-4">
        <button onClick={() => navigate("/orders")} aria-label="Cart">
          <BsCart3 size={20} />
        </button>
      </div>
    );
  } else {
    rightContent = <div className="w-8" />;
  }

  return (
    <div className="w-full bg-white px-4 py-1.5 flex items-center justify-between text-gray-900 max-w-md mx-auto shadow">
      <img
        className="w-14 h-14 object-contain"
        src="/spotlesswashlogo.png"
        alt="Spotless wash Logo"
      />
      {rightContent}
    </div>
  );
}
