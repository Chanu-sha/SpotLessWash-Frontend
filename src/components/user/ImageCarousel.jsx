import React, { useState } from "react";

const ImageCarousel = ({ images, vendorName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-200 to-orange-200 flex items-center justify-center rounded-t-xl">
        <div className="text-3xl sm:text-4xl">🧺</div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="relative h-32 sm:h-40 bg-gray-200 overflow-hidden group rounded-t-xl">
      <img
        src={images[currentImageIndex]}
        alt={`${vendorName} store ${currentImageIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-opacity-80 hover:scale-110 z-10"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-opacity-80 hover:scale-110 z-10"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? "bg-white scale-110" : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
              />
            ))}
          </div>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;