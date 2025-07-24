import { FaStar } from "react-icons/fa";

import {
  PiCoatHangerLight,
  PiTruckLight,
  PiCalendarDuotone,
} from "react-icons/pi";
import { SlLocationPin } from "react-icons/sl";
import pressImg from "../assets/HeroImage.jpg";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const areas = ["Bhubaneswar", "Cuttack", "Puri"];
  const stars = Array(5).fill(0);

  return (
    <div>
      <Header />
      <div className="min-h-screen  flex flex-col gap-6 px-4 py-4 mx-auto max-w-md">
        {/* Hero Image */}
        <div className="rounded overflow-hidden">
          <img
            src={pressImg}
            alt="Iron Image"
            className="rounded w-full object-cover"
          />
        </div>

        {/* Book Now Button */}
        <button
          onClick={() => navigate("/service")}
          className="bg-green-600 text-white rounded px-5 py-2 self-center"
        >
          Book Now
        </button>

        {/* How It Works */}
        <section>
          <h2 className="text-base text-gray-400 font-semibold mb-4">
            How It Works
          </h2>
          <ul className="flex flex-col  text-gray-700">
            <li className="flex m-0 items-center gap-2">
              <PiCalendarDuotone className="text-green-600" />
              Schedule a Pickup
            </li>
            <span  className="ml-1.5 text-gray-500" >|</span>
            <li className="flex m-0 items-center gap-2">
              <PiCoatHangerLight className="text-green-600" />
              We wash & Iron Your Clothes
            </li>
            <span  className="ml-1.5 text-gray-500" >|</span>
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

        {/* Customer Testimonials */}
        <section>
          <h2 className="text-base font-semibold text-gray-400 mb-4">
            Customer Reviews
          </h2>
          <div className="flex flex-col gap-1 border p-4 py-1 rounded bg-white shadow-sm">
            <span className="font-medium text-gray-400">Priya Sharma</span>
            <div className="flex items-center gap-1 text-green-600">
              {stars.map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
            <p className="text-sm text-gray-600">2 months ago</p>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
