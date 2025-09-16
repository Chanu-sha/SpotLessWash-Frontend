import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function TermsAndConditions() {
  return (
    <div className="bg-gradient-to-b mb-10 from-green-50 to-white">
      <Header />
      <div className="min-h-screen py-8 px-4 mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 md:p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Terms & Conditions
            </h1>
            <p className="text-emerald-100 mt-2">
              Please read carefully before using our services
            </p>
          </div>
          <div className="p-6 md:p-8">
            <p className="italic text-gray-600 text-center bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              By accessing or using{" "}
              <span className="text-emerald-600 font-medium">
                Spot Less Wash
              </span>{" "}
              (Proudly made in Odisha ❤️), you agree to be bound by these terms.
            </p>
          </div>
        </div>

        {/* Terms Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2 rounded-lg mr-4">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Use of Services
                </h2>
              </div>
              <p className="text-gray-600">
                Our laundry services are available only in select areas
                including Bhubaneswar, Cuttack. Schedule pickups via
                our app.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-amber-100 p-2 rounded-lg mr-4">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Garment Care
                </h2>
              </div>
              <p className="text-gray-600 mb-2">
                We treat garments with care but aren't liable for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 pl-4">
                <li>Normal wear and tear</li>
                <li>Color bleeding from defects</li>
                <li>Unlabelled delicate fabrics</li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Pickup & Delivery
                </h2>
              </div>
              <p className="text-gray-600">
                Schedule pickups/deliveries in advance. Someone must be
                available at the address. Share delivery OTP to complete
                transactions.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2 rounded-lg mr-4">
                  <span className="text-purple-600 font-bold">4</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Pricing & Payments
                </h2>
              </div>
              <p className="text-gray-600">
                Prices vary by garment type. Full payment online or upon
                delivery. Offers subject to change without notice.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg mr-4">
                  <span className="text-emerald-600 font-bold">5</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Your Responsibilities
                </h2>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-1 pl-4">
                <li>Provide accurate address details</li>
                <li>Check pockets before sending</li>
                <li>Report issues within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-red-100 p-2 rounded-lg mr-4">
                  <span className="text-red-600 font-bold">6</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Account Security
                </h2>
              </div>
              <p className="text-gray-600">
                Maintain confidentiality of your login (phone/Google). Never
                share OTPs with anyone.
              </p>
            </div>
          </div>

          {/* Card 7 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                  <span className="text-indigo-600 font-bold">7</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Service Termination
                </h2>
              </div>
              <p className="text-gray-600">
                We may refuse or terminate service for violations, abusive
                behavior, or platform misuse.
              </p>
            </div>
          </div>

          {/* Card 8 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="bg-cyan-100 p-2 rounded-lg mr-4">
                  <span className="text-cyan-600 font-bold">8</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Terms Updates
                </h2>
              </div>
              <p className="text-gray-600">
                These Terms may change without notice. Please review them
                periodically.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8 border-l-4 border-green-500">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="md:w-1/3 text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-800">Need Help?</h2>
                <p className="text-gray-600">We're here to assist you</p>
              </div>
              <div className="md:w-2/3">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    Contact us at:
                    <span className="text-green-600 font-semibold ml-1.5">
                      spotlesswash@proton.me
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Our team typically responds within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Thank you for trusting{" "}
            <span className="text-green-600 font-medium">Spot Less Wash</span>{" "}
            with your garment care.
          </p>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              Proudly serving Odisha
            </span>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
