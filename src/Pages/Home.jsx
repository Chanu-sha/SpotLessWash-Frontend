import {
  PiCoatHangerLight,
  PiTruckLight,
  PiCalendarDuotone,
  PiUserLight,
  PiVanLight,
  PiStorefrontLight,
} from "react-icons/pi";
import { SlLocationPin } from "react-icons/sl";
import { IoClose } from "react-icons/io5";
import pressImg1 from "../assets/HeroImage1.png";
import pressImg2 from "../assets/HeroImage2.png";
import pressImg3 from "../assets/HeroImage3.png";
import pressImg4 from "../assets/HeroImage4.png";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function Home() {
  const navigate = useNavigate();
  const { role, currentUser, loading } = useContext(UserContext);
  const [showRolePopup, setShowRolePopup] = useState(false);
  const areas = ["Bhubaneswar", "Cuttack"];

  const images = [pressImg1, pressImg2, pressImg3, pressImg4];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!loading && !currentUser && !role) {
      setShowRolePopup(true);
    } else {
      setShowRolePopup(false);
    }
  }, [currentUser, role, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  const getButtonText = () => {
    if (role === "delivery") return "Get a Delivery";
    if (role === "vendor") return "Get a Deal";
    return "Book Now";
  };

  const handleButtonClick = () => {
    if (role === "delivery") {
      navigate("/delivery-dashboard");
    } else if (role === "vendor") {
      navigate("/vendor-dashboard");
    } else {
      navigate("/service");
    }
  };

  const handleRoleSelection = (selectedRole) => {
    setShowRolePopup(false);
    navigate(`/auth?role=${selectedRole}`);
  };

  const roleOptions = [
    {
      id: "customer",
      title: "Customer",
      description: "Book laundry services",
      icon: PiUserLight,
      color: "bg-blue-100 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "delivery",
      title: "Delivery Partner",
      description: "Deliver laundry orders",
      icon: PiVanLight,
      color: "bg-green-100 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "vendor",
      title: "Vendor",
      description: "Manage laundry business",
      icon: PiStorefrontLight,
      color: "bg-purple-100 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* Role Selection Popup */}
      {showRolePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl mx-4 w-full max-w-md p-6 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRolePopup(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoClose className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Continue Your Work As
              </h2>
              <p className="text-gray-600 text-sm">
                Choose your role to get started
              </p>
            </div>

            <div className="space-y-4">
              {roleOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleRoleSelection(option.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${option.color} hover:shadow-md transform hover:scale-[1.02]`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full bg-white shadow-sm flex-shrink-0`}
                      >
                        <IconComponent
                          className={`w-6 h-6 ${option.iconColor}`}
                        />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {option.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {option.description}
                        </p>
                      </div>
                      <div className="text-gray-400 flex-shrink-0">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500">
                New to our platform? Choose your role and create an account
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`min-h-screen mb-10 flex flex-col gap-6 px-4 py-4 md:px-8 lg:px-12 mx-auto max-w-md md:max-w-3xl lg:max-w-7xl ${
          showRolePopup ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {/* Hero Carousel */}
        <style>{`
          @media (max-width: 767px) {
            .carousel-wrapper {
              aspect-ratio: auto;
              padding-top: 60%;
            }
          }
          @media (min-width: 768px) {
            .carousel-wrapper {
              aspect-ratio: 16 / 6;
              padding-top: 0 !important;
            }
          }
        `}</style>

        <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl lg:rounded-3xl bg-gray-200">
          <div
            className="carousel-wrapper relative w-full"
            style={{ paddingTop: "60%" }}
          >
            <div
              className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 relative">
                  <img
                    src={img}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-3 md:bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? "bg-white w-6 h-2 md:w-8 md:h-2 lg:w-10 lg:h-2.5"
                    : "bg-white/50 w-2 h-2 md:w-2 md:h-2 lg:w-3 lg:h-3"
                }`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 md:p-3 lg:p-4 transition-all duration-200"
            onClick={() =>
              setCurrentIndex(
                currentIndex === 0 ? images.length - 1 : currentIndex - 1
              )
            }
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 md:p-3 lg:p-4 transition-all duration-200"
            onClick={() =>
              setCurrentIndex(
                currentIndex === images.length - 1 ? 0 : currentIndex + 1
              )
            }
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Dynamic Button */}
        {(currentUser || role) && (
          <button
            onClick={handleButtonClick}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl md:rounded-2xl px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 self-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm md:text-base lg:text-lg"
          >
            {getButtonText()}
          </button>
        )}

        {/* How It Works */}
        <section className="bg-gray-50 rounded-2xl md:rounded-3xl lg:rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-6 md:mb-8 lg:mb-10">
            How It Works
          </h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 md:left-8 lg:left-10 top-6 md:top-8 lg:top-10 bottom-6 md:bottom-8 lg:bottom-10 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400"></div>

            <div className="space-y-8 md:space-y-10 lg:space-y-12">
              <div className="flex items-center gap-4 md:gap-6 lg:gap-8 relative">
                <div className="p-3 md:p-4 lg:p-5 bg-green-100 rounded-full relative z-10 border-4 md:border-4 lg:border-4 border-white shadow-sm flex-shrink-0">
                  <PiCalendarDuotone className="text-green-600 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg lg:text-xl">
                    Schedule a Pickup
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm lg:text-base">
                    Choose your convenient time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-6 lg:gap-8 relative">
                <div className="p-3 md:p-4 lg:p-5 bg-blue-100 rounded-full relative z-10 border-4 md:border-4 lg:border-4 border-white shadow-sm flex-shrink-0">
                  <PiCoatHangerLight className="text-blue-600 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg lg:text-xl">
                    We Wash & Iron
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm lg:text-base">
                    Professional care for your clothes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-6 lg:gap-8 relative">
                <div className="p-3 md:p-4 lg:p-5 bg-purple-100 rounded-full relative z-10 border-4 md:border-4 lg:border-4 border-white shadow-sm flex-shrink-0">
                  <PiTruckLight className="text-purple-600 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg lg:text-xl">
                    Get Your Clothes Back
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm lg:text-base">
                    Fresh and clean delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Serviceable Areas */}
        <section className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm border border-gray-100">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-4 md:mb-6 lg:mb-8">
            Serviceable Areas
          </h2>
          <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6">
            {areas.map((city) => (
              <div
                key={city}
                className="border-2 border-gray-200 flex gap-2 justify-center items-center px-4 md:px-5 lg:px-6 py-2 md:py-3 lg:py-4 rounded-xl text-gray-700 text-xs md:text-sm lg:text-base hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <SlLocationPin className="text-green-600 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                {city}
              </div>
            ))}
          </div>
        </section>

        {/* Footer Message */}
        <div className="text-center py-4 md:py-6 lg:py-8">
          <p className="text-gray-500 text-xs md:text-sm lg:text-base">
            Proudly made in Odisha ❤️
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
