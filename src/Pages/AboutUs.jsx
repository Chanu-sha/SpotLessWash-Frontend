import {
  FaHandsHelping,
  FaTruck,
  FaTshirt,
  FaSmile,
  FaSuitcase,
  FaFemale,
  FaStar,
} from "react-icons/fa";
import { PiUsersThreeLight } from "react-icons/pi";
import { GiClothes } from "react-icons/gi";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutUs() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      <div className="min-h-screen flex flex-col gap-6 max-w-md py-8 mx-auto px-2">
        {/* ---------------- HERO SECTION ---------------- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-center">
            <h1 className="text-3xl font-bold text-white">
              About <span className="italic">Spot Less Wash</span>
            </h1>
            <p className="text-emerald-100 mt-2">
              Fast and affordable doorstep laundry services in Bhubaneswar and Cuttack
            </p>
          </div>
          <div className="p-6 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              Proudly serving Odisha ❤️
            </span>
          </div>
        </div>

        {/* ---------------- WHAT WE DO ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-500">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <GiClothes className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">What We Do</h2>
            </div>
            <p className="text-gray-600">
              Spot Less Wash is your one-stop solution for all laundry needs. Just book
              a pickup, and we take care of the rest – from collecting your
              clothes to washing, ironing, and delivering them back to your door.
            </p>
          </div>
        </div>

        {/* ---------------- PROCESS FLOW ---------------- */}
        <h2 className="text-xl font-bold text-center text-gray-800 mt-2">
          Our Simple Process
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Process Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-emerald-400 hover:shadow-lg transition-shadow">
            <div className="p-5 flex items-start">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <FaHandsHelping className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Book a Pickup</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Use the app to schedule a pickup at your convenience.
                </p>
              </div>
            </div>
          </div>

          {/* Process Card 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-400 hover:shadow-lg transition-shadow">
            <div className="p-5 flex items-start">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaTruck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Clothes Collected</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our delivery partner picks up your laundry on time.
                </p>
              </div>
            </div>
          </div>

          {/* Process Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-cyan-400 hover:shadow-lg transition-shadow">
            <div className="p-5 flex items-start">
              <div className="bg-cyan-100 p-3 rounded-full mr-4">
                <FaTshirt className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Washed & Pressed</h3>
                <p className="text-sm text-gray-600 mt-1">
                  We wash and press your clothes with utmost care.
                </p>
              </div>
            </div>
          </div>

          {/* Process Card 4 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-indigo-400 hover:shadow-lg transition-shadow">
            <div className="p-5 flex items-start">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaTruck className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Doorstep Delivery</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your fresh clothes are delivered right back to you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SERVICE AREAS ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-purple-500">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Where We Serve</h2>
            </div>
            <p className="text-gray-600 mb-3">
              Spot Less Wash is currently available in:
            </p>
            <div className="flex gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Bhubaneswar
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                Cuttack
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- OUR MISSION ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-orange-500">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <PiUsersThreeLight className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Our Mission</h2>
            </div>
            <p className="text-gray-600">
              We want to make laundry stress-free, hygienic, and time-saving for
              every household. With Spot Less Wash, laundry is just a tap away.
            </p>
          </div>
        </div>

        {/* ---------------- SERVICES SECTION ---------------- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-4">
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">
              Services We Offer
            </h2>
            <p className="text-emerald-100 mt-2">
              We care for your clothes like our own
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {/* Service 1 */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
              <div className="flex items-start gap-3">
                <GiClothes className="text-green-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Complete Garment Care
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    From daily wear to designer outfits, we wash & press all with expert care.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-pink-400">
              <div className="flex items-start gap-3">
                <FaFemale className="text-pink-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Saree & Delicate Dry Cleaning
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Kimti silk sarees, bridal wear & delicate fabrics handled with premium solutions.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
              <div className="flex items-start gap-3">
                <FaTshirt className="text-blue-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Shirts, T-Shirts, Pants, Coats
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get your formal & casual wear perfectly washed, pressed & ready to wear.
                  </p>
                </div>
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-400">
              <div className="flex items-start gap-3">
                <FaSuitcase className="text-purple-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Office & Party Wear Cleaning
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Whether it's a meeting or a marriage – we'll make sure your outfit looks flawless.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- WHY CHOOSE US ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-amber-500">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <FaStar className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Why Choose Spot Less Wash?</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-600">Advanced stain-removal & hygiene treatment</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-600">Steam ironing for wrinkle-free clothes</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-600">Eco-friendly detergents safe for skin</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-600">On-time pickup & doorstep delivery</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-600">Odisha's trusted laundry service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------------- TESTIMONIAL ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-rose-500 text-center p-6">
          <div className="flex justify-center mb-3 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>
          <blockquote className="text-gray-600 italic text-lg">
            "Kapde bilkul naye jaise lagte hain – aur delivery bhi time pe!"
          </blockquote>
          <p className="text-gray-500 mt-2">– A Happy Customer</p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
              Trusted by 5000+ Odisha Families
            </span>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}