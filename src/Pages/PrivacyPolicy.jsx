import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className=" max-w-md mb-10 mx-auto bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      <div className="min-h-screen py-10 px-4 mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* Main Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6">
              <h1 className="text-3xl md:text-4xl italic font-bold text-white text-center">
                Privacy Policy
              </h1>
            </div>
            <div className="p-6 md:p-8">
              <p className="italic text-center text-gray-600 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                At Spot Less Wash <span className="text-emerald-600 font-medium">(Proudly made in Odisha ❤️)</span>, we are committed to protecting your privacy and ensuring transparency in how your personal data is used.
              </p>
            </div>
          </div>

          {/* Policy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Information We Collect</h2>
                </div>
                <p className="text-gray-600">
                  We collect your name, mobile number, address, and garment order details when you book a service with us. This data helps us provide smooth pickup and delivery experiences, accurate billing, and customer support.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">How We Use Your Data</h2>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>To schedule laundry pickups and deliveries on time</li>
                  <li>To contact you about order status or changes</li>
                  <li>To improve our services and user experience</li>
                  <li>To ensure garment safety and service quality</li>
                </ul>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-teal-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Third Party Services</h2>
                </div>
                <p className="text-gray-600">
                  We do not sell or share your personal information with third parties for marketing. However, we may use trusted tools like Firebase Authentication or payment gateways which have their own privacy practices.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-cyan-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Garment Safety Promise</h2>
                </div>
                <p className="text-gray-600">
                  Your clothes are handled by trained professionals with care. Be it silk sarees, office suits, or t-shirts – we ensure they are cleaned, pressed, and returned in the best condition.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Your Rights</h2>
                </div>
                <p className="text-gray-600">
                  You can request to view, update, or delete your personal information stored with us. For any privacy-related concerns, contact our support team anytime.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Updates to This Policy</h2>
                </div>
                <p className="text-gray-600">
                  This Privacy Policy may be updated periodically. We recommend checking this page from time to time to stay informed about how we protect your data.
                </p>
              </div>
            </div>

            {/* Card 7 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-purple-500 hover:shadow-lg transition-shadow md:col-span-2">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Contact Us</h2>
                </div>
                <p className="text-gray-600">
                  If you have any questions regarding your privacy, please email us at{" "}
                  <span className="text-green-600 font-semibold hover:underline">support@spotlesswah.in</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">
              Thank you for trusting <span className="text-green-600 font-bold">Spot Less Wash</span> with your clothes and privacy.
            </p>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Proudly serving Odisha
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}