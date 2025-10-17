import {
  FaTruck,
  FaTshirt,
  FaSuitcase,
  FaFemale,
  FaStar,
  FaClock,
  FaShieldAlt,
  FaLeaf,
} from "react-icons/fa";
import { GiClothes, GiWashingMachine } from "react-icons/gi";
import { MdIron, MdLocalLaundryService } from "react-icons/md";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

export default function OurServices() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br mb-10 from-blue-50 to-cyan-50">
      <Header />
      <div className="min-h-screen flex flex-col gap-8 py-8 px-3 md:px-6 lg:px-12 max-w-7xl mx-auto">
        {/* ---------------- HERO SECTION ---------------- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-center lg:p-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              Our <span className="italic">Services</span>
            </h1>
            <p className="text-blue-100 mt-2 text-sm lg:text-base">
              Complete laundry solutions through our verified partners
            </p>
          </div>
          <div className="p-6 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              Professional Care for Every Fabric ✨
            </span>
          </div>
        </div>

        {/* ---------------- MAIN SERVICES SECTION ---------------- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-center lg:p-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              What Our Partners Offer
            </h2>
            <p className="text-emerald-100 mt-2 text-sm lg:text-base">
              Expert care for all your clothing needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-6 lg:gap-6">
            {/* Service 1 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-5 border-l-4 border-green-400 flex flex-col h-full">
              <div className="flex items-start gap-3">
                <GiClothes className="text-green-600 text-3xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg lg:text-xl">
                    Complete Garment Care
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm lg:text-base">
                    From everyday cotton wear to premium designer outfits - our
                    partner professionals handle everything with expert care and
                    attention to detail.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Cotton", "Linen", "Polyester", "Denim"].map((item) => (
                      <span
                        key={item}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg shadow-sm p-5 border-l-4 border-pink-400 flex flex-col h-full">
              <div className="flex items-start gap-3">
                <FaFemale className="text-pink-600 text-3xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg lg:text-xl">
                    Premium Saree & Delicate Care
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm lg:text-base">
                    Specialized dry cleaning for precious Kimti silk sarees,
                    bridal wear, and delicate fabrics using premium eco-friendly
                    solutions.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "Silk Sarees",
                      "Bridal Wear",
                      "Lehengas",
                      "Designer Outfits",
                    ].map((item) => (
                      <span
                        key={item}
                        className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-5 border-l-4 border-blue-400 flex flex-col h-full">
              <div className="flex items-start gap-3">
                <FaTshirt className="text-blue-600 text-3xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg lg:text-xl">
                    Professional Formal Wear
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm lg:text-base">
                    Perfect cleaning, pressing & finishing for shirts, pants,
                    blazers, and coats. Get that crisp, professional look every
                    time.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Formal Shirts", "Blazers", "Trousers", "Suits"].map(
                      (item) => (
                        <span
                          key={item}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow-sm p-5 border-l-4 border-purple-400 flex flex-col h-full">
              <div className="flex items-start gap-3">
                <FaSuitcase className="text-purple-600 text-3xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg lg:text-xl">
                    Special Occasion Cleaning
                  </h3>
                  <p className="text-gray-600 mt-2 text-sm lg:text-base">
                    Whether it's a business meeting, wedding, or party - our
                    partners ensure your outfit looks absolutely flawless and
                    ready to impress.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "Party Wear",
                      "Wedding Outfits",
                      "Office Wear",
                      "Evening Gowns",
                    ].map((item) => (
                      <span
                        key={item}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SERVICE FEATURES ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-cyan-500 p-6 lg:p-8">
          <div className="flex items-center mb-4">
            <div className="bg-cyan-100 p-3 rounded-full mr-4">
              <FaStar className="h-6 w-6 text-cyan-600" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
              Service Features
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
            <Feature
              icon={<GiWashingMachine className="text-blue-600 text-xl" />}
              title="Advanced Washing"
              text="Premium detergents & modern machines"
            />
            <Feature
              icon={<MdIron className="text-orange-600 text-xl" />}
              title="Steam Pressing"
              text="Professional steam ironing for crisp finish"
            />
            <Feature
              icon={<FaShieldAlt className="text-green-600 text-xl" />}
              title="Stain Treatment"
              text="Specialized stain removal techniques"
            />
            <Feature
              icon={<FaLeaf className="text-emerald-600 text-xl" />}
              title="Eco-Friendly"
              text="Safe detergents, gentle on skin"
            />
          </div>
        </div>

        {/* ---------------- DELIVERY OPTIONS ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-indigo-500 p-6 lg:p-8">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <FaTruck className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
              Pickup & Delivery
            </h2>
          </div>
          <div className="space-y-4 text-sm lg:text-base">
            <Delivery
              icon={<FaClock className="text-blue-600 mr-3" />}
              label="Regular Service"
              time="48-72 hours turnaround"
            />
            <Delivery
              icon={<FaClock className="text-orange-600 mr-3" />}
              label="Express Service"
              time="24 hours (additional charges apply)"
            />
            <Delivery
              icon={<MdLocalLaundryService className="text-purple-600 mr-3" />}
              label="Premium Care"
              time="Dry cleaning & delicate items (3-5 days)"
            />
          </div>
        </div>

        {/* ---------------- PRICING INFO ---------------- */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl shadow-md p-6 lg:p-8 border-l-4 border-amber-500 text-center lg:text-left">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
            Transparent Pricing
          </h3>
          <p className="text-gray-600">
            All prices are clearly displayed before booking. No hidden charges,
            no surprises. Pay only for what you order.
          </p>
        </div>

        {/* ---------------- QUALITY PROMISE ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-emerald-500 p-6 lg:p-8 text-center">
          <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FaShieldAlt className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3">
            100% Quality Guarantee
          </h3>
          <p className="text-gray-600 mb-4 text-sm lg:text-base">
            All our partner vendors are verified and trained. If you're not
            satisfied with the service, we'll make it right or refund your
            money.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
            <QualityBadge color="green" label="Damage Protection" />
            <QualityBadge color="blue" label="Color Protection" />
          </div>
        </div>

        {/* ---------------- CTA SECTION ---------------- */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg p-6 lg:p-10 text-center text-white">
          <h3 className="text-xl lg:text-2xl font-bold mb-2">
            Ready to Experience Premium Laundry?
          </h3>
          <p className="text-blue-100 mb-4 text-sm lg:text-base">
            Book now and let our verified partners take care of your clothes
            with expert precision.
          </p>
          <button
            onClick={() => navigate("/service")}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-md"
          >
            Book Pickup Now
          </button>
        </div>

        {/* ---------------- TESTIMONIAL ---------------- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-rose-500 text-center p-6 lg:p-8">
          <div className="flex justify-center mb-3 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>
          <blockquote className="text-gray-600 italic text-lg">
            "Meri silk saree bilkul naye jaisa clean aaya! Platform pe sab
            vendors achhe hain."
          </blockquote>
          <p className="text-gray-500 mt-2">– Sunita Madam, Patia</p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
              Premium Care Specialists
            </span>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

/* ---------------- REUSABLE COMPONENTS ---------------- */

function Feature({ icon, title, text }) {
  return (
    <div className="flex items-start">
      <div className="mr-3 mt-1">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
}

function Delivery({ icon, label, time }) {
  return (
    <div className="flex items-center">
      {icon}
      <div>
        <span className="font-semibold text-gray-800">{label}: </span>
        <span className="text-gray-600">{time}</span>
      </div>
    </div>
  );
}

function QualityBadge({ color, label }) {
  return (
    <div className={`bg-${color}-50 p-3 rounded-lg`}>
      <div className="flex items-center justify-center md:justify-start">
        <div className={`bg-${color}-100 p-1 rounded-full mr-2`}>
          <svg
            className={`h-4 w-4 text-${color}-600`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span className={`text-sm font-medium text-${color}-800`}>{label}</span>
      </div>
    </div>
  );
}
