import React from "react";

const ServiceCard = ({ service, onBookService }) => {
  return (
    <div className="flex justify-between items-start border-b py-3 sm:py-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1 pr-3 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 truncate">
          {service.name}
        </h4>
        {service.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
          <span className="text-xs text-gray-400 line-through">
            ₹{service.displayPrice}
          </span>
          <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
            {service.discountPercentage}% OFF
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-orange-600 text-base sm:text-lg whitespace-nowrap">
            ₹{service.appPrice}
          </span>
          <button
            onClick={() => onBookService(service)}
            className="px-2.5 py-1 sm:px-3 sm:py-1 bg-green-600 text-white rounded-md text-xs sm:text-sm hover:bg-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;