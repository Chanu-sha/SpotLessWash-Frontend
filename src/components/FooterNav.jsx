import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

import { GoHomeFill } from "react-icons/go";
import { PiUserLight } from "react-icons/pi";
import { FaTruckFast, FaClipboardList } from "react-icons/fa6";
import { MdDryCleaning } from "react-icons/md";
import { GiClothes } from "react-icons/gi";

export default function FooterNav() {
  const { role } = useContext(UserContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClasses = (path) =>
    `flex flex-col items-center ${
      isActive(path) ? "text-green-600" : "text-gray-700"
    } hover:text-blue-500`;

  const navItems = {
    delivery: [
      { to: "/", icon: <GoHomeFill className="w-6 h-6" />, text: "Home" },
      { to: "/delivery-dashboard", icon: <FaTruckFast className="w-6 h-6" />, text: "All Orders" },
      { to: "/my-deals", icon: <FaClipboardList className="w-6 h-6" />, text: "My Deals" },
      { to: "/profile", icon: <PiUserLight className="w-6 h-6" />, text: "Profile" },
    ],
    dhobi: [
      { to: "/", icon: <GoHomeFill className="w-6 h-6" />, text: "Home" },
      { to: "/dhobi-dashboard", icon: <MdDryCleaning className="w-6 h-6" />, text: "My Orders" },
      { to: "/dhobi-assigned", icon: <GiClothes className="w-6 h-6" />, text: "Assigned" },
      { to: "/profile", icon: <PiUserLight className="w-6 h-6" />, text: "Profile" },
    ],
    firebase: [
      { to: "/", icon: <GoHomeFill className="w-6 h-6" />, text: "Home" },
      { to: "/service", icon: <GiClothes className="w-6 h-6" />, text: "Services" },
      { to: "/orders", icon: <FaClipboardList className="w-6 h-6" />, text: "Orders" },
      { to: "/profile", icon: <PiUserLight className="w-6 h-6" />, text: "Profile" },
    ],
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white shadow-md border-t border-gray-200 z-50">
      <nav className="flex justify-around items-center h-16 max-w-sm mx-auto">
        {navItems[role]?.map((item) => (
          <Link key={item.to} to={item.to} className={linkClasses(item.to)}>
            {item.icon}
            <span className="text-xs mt-1">{item.text}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
}
