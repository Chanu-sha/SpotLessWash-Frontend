import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="text-gray-800 py-8 px-2 border-t border-gray-200 max-w-sm mx-auto">
      <div className="flex flex-col gap-6 items-center text-sm">

        {/* Links */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-blue-600 font-medium">
              About Us
            </Link>
            <Link to="/services" className="hover:text-blue-600 font-medium">
              Our Services
            </Link>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-blue-600 font-medium">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-blue-600 font-medium">
              Terms & Conditions
            </Link>
          </div>
          <Link to="/contact" className="hover:text-blue-600 font-medium">
            Contact Us
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 text-center">
          &copy; 2025 Cloth Care. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
