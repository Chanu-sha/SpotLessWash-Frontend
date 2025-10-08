import React from "react";
import ServiceCard from "./ServiceCard";

const VendorModal = ({ vendor, onClose, onBookService }) => {
  if (!vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen max-w-md mx-auto bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white mb-14 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-auto">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold mb-2 truncate">
            {vendor.name}
          </h2>
          <p className="text-gray-600 text-sm truncate">{vendor.address}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-1">
            {vendor.services.map((service, idx) => (
              <ServiceCard
                key={idx}
                service={service}
                onBookService={onBookService}
              />
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 sm:py-2.5 border rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;