import { Link, useLocation } from "react-router-dom";
import { GoListUnordered, GoHomeFill } from "react-icons/go";
import { PiUserLight, PiNewspaperClipping } from "react-icons/pi";

export default function FooterNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClasses = (path) =>
    `flex flex-col items-center ${
      isActive(path) ? "text-green-600" : "text-gray-700"
    } hover:text-blue-500`;

  return (
    <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white shadow-md border-t border-gray-200 z-50">
      <nav className="flex justify-around items-center h-16 max-w-sm mx-auto">
        <Link to="/" className={linkClasses("/")}>
          <GoHomeFill className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link to="/service" className={linkClasses("/service")}>
          <PiNewspaperClipping className="w-6 h-6" />
          <span className="text-xs mt-1">Services</span>
        </Link>

        <Link to="/orders" className={linkClasses("/orders")}>
          <GoListUnordered className="w-6 h-6" />
          <span className="text-xs mt-1">Orders</span>
        </Link>

        <Link to="/profile" className={linkClasses("/profile")}>
          <PiUserLight className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </footer>
  );
}
