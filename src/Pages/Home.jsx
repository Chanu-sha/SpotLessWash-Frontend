import {
  PiCoatHangerLight,
  PiTruckLight,
  PiCalendarDuotone,
} from "react-icons/pi";
import { SlLocationPin } from "react-icons/sl";
import pressImg1 from "../assets/HeroImage.jpeg";
import pressImg2 from "../assets/HeroImage2.jpeg"; 
import pressImg3 from "../assets/HeroImage3.webp";
import pressImg4 from "../assets/HeroImage4.jpg";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext"; 

export default function Home() {
  const navigate = useNavigate();
  const { role } = useContext(UserContext);
  const areas = ["Bhubaneswar", "Cuttack", "Puri"];
  const stars = Array(5).fill(0);

  // Carousel images array
  const images = [pressImg1, pressImg2, pressImg3, pressImg4];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide logic
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

  return (
    <div>
      <Header />
      <div className="min-h-screen mb-10 flex flex-col gap-6 px-4 py-4 mx-auto max-w-md">
        
        {/* Hero Carousel */}
        <div className="relative w-full h-56 overflow-hidden rounded">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Slide ${idx + 1}`}
                className="w-full h-56 object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Dynamic Button */}
        <button
          onClick={handleButtonClick}
          className="bg-green-600 text-white rounded px-5 py-2 self-center"
        >
          {getButtonText()}
        </button>

        {/* How It Works */}
        <section>
          <h2 className="text-base text-gray-400 font-semibold mb-4">
            How It Works
          </h2>
          <ul className="flex flex-col text-gray-700">
            <li className="flex m-0 items-center gap-2">
              <PiCalendarDuotone className="text-green-600" />
              Schedule a Pickup
            </li>
            <span className="ml-1.5 text-gray-500">|</span>
            <li className="flex m-0 items-center gap-2">
              <PiCoatHangerLight className="text-green-600" />
              We wash & Iron Your Clothes
            </li>
            <span className="ml-1.5 text-gray-500">|</span>
            <li className="flex m-0 items-center gap-2">
              <PiTruckLight className="text-green-600" />
              Get Your Clothes Back
            </li>
          </ul>
        </section>

        {/* Serviceable Areas */}
        <section>
          <h2 className="text-base font-semibold text-gray-400 mb-4">
            Serviceable Areas
          </h2>
          <div className="flex flex-wrap gap-3">
            {areas.map((city) => (
              <div
                key={city}
                className="border flex gap-1 justify-center items-center px-3 py-2 rounded text-gray-700 text-sm"
              >
                <SlLocationPin />
                {city}
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-gray-500 text-xs mt-4">
          Proudly made in Odisha ❤️
        </p>
        <Footer />
      </div>
    </div>
  );
}
