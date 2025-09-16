import {
  FaHandsHelping,
  FaTruck,
  FaStar,
  FaUsers,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";
import { PiUsersThreeLight } from "react-icons/pi";
import { MdVerified, MdSupport } from "react-icons/md";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function AboutUs() {
  return (
    <div className="bg-gradient-to-br mb-10 from-green-50 to-emerald-50">
      <Header />
      <div className="min-h-screen flex flex-col gap-6 max-w-md py-8 mx-auto px-2">
        {/* ---------------- HERO SECTION ---------------- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-center">
            <h1 className="text-3xl font-bold text-white">
              About <span className="italic">Spot Less Wash</span>
            </h1>
            <p className="text-emerald-100 mt-2">
              Odisha's trusted laundry platform connecting you with verified professionals
            </p>
          </div>
          <div className="p-6 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              Proudly serving Bhubaneswar & Cuttack ❤️
            </span>
          </div>
        </div>

        {/* ---------------- WHAT WE DO ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-500">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">What We Do</h2>
            </div>
            <p className="text-gray-600 mb-3">
              Spot Less Wash is Odisha's leading laundry platform that connects busy families with verified laundry professionals in their neighborhood. We make quality laundry services accessible, affordable, and convenient.
            </p>
            <p className="text-gray-600">
              Just like E-commerce platform connects you with Buisnesses, we connect you with trusted laundry experts who pick up, clean, and deliver your clothes with care.
            </p>
          </div>
        </div>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <h2 className="text-xl font-bold text-center text-gray-800 mt-2">
          How Our Platform Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Process Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-emerald-400 hover:shadow-lg transition-shadow">
            <div className="p-5 flex items-start">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <FaHandsHelping className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Book Through App</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose your preferred laundry partner and schedule pickup instantly.
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
                <h3 className="font-semibold text-gray-800">Smart Pickup</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our delivery partners collect clothes and connect you with verified vendors.
                </p>
              </div>
            </div>
          </div>

          {/* Process Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-cyan-400 hover:shadow-lg transition-shadow">
            <div className="p-5 flex items-start">
              <div className="bg-cyan-100 p-3 rounded-full mr-4">
                <MdVerified className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Expert Cleaning</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Trusted laundry professionals clean your clothes with premium care.
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
                <h3 className="font-semibold text-gray-800">Doorstep Return</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Fresh, clean clothes delivered back to your doorstep on time.
                </p>
              </div>
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
              To revolutionize laundry services in Odisha by creating a trusted platform that empowers local laundry businesses while providing families with convenient, quality cleaning services at their fingertips.
            </p>
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
              <h2 className="text-xl font-bold text-gray-800">Where We Operate</h2>
            </div>
            <p className="text-gray-600 mb-3">
              Our platform is currently connecting customers with laundry partners in:
            </p>
            <div className="flex gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Bhubaneswar
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                Cuttack
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Expanding to more cities across Odisha soon!
            </p>
          </div>
        </div>

        {/* ---------------- WHY CHOOSE US ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-amber-500">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <FaStar className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Why Choose Our Platform?</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <MdVerified className="h-4 w-4 text-green-600" />
                </span>
                <span className="text-gray-600">Only verified & trusted laundry professionals</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <FaShieldAlt className="h-4 w-4 text-green-600" />
                </span>
                <span className="text-gray-600">100% quality assurance & damage protection</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <FaClock className="h-4 w-4 text-green-600" />
                </span>
                <span className="text-gray-600">Real-time tracking & guaranteed timely delivery</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <MdSupport className="h-4 w-4 text-green-600" />
                </span>
                <span className="text-gray-600">24/7 customer support in local language</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 bg-green-100 p-1 rounded-full mr-3">
                  <FaUsers className="h-4 w-4 text-green-600" />
                </span>
                <span className="text-gray-600">Supporting local businesses & creating jobs</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------------- PLATFORM STATS ---------------- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">
              Our Growing Community
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5000+</div>
              <div className="text-sm text-gray-600">Happy Families</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-600">Partner Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2</div>
              <div className="text-sm text-gray-600">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">100+</div>
              <div className="text-sm text-gray-600">Delivery Partners</div>
            </div>
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
            "Platform bahut reliable hai - har bar same quality aur time pe delivery!"
          </blockquote>
          <p className="text-gray-500 mt-2">– Priya, Bhubaneswar</p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
              Rated 4.8/5 by 5000+ Users
            </span>
          </div>
        </div>


        <Footer />
      </div>
    </div>
  );
}