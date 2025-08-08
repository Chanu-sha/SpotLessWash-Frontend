import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaMapMarkerAlt, FaPhone, FaPaperPlane } from "react-icons/fa";

export default function ContactUs() {
  return (
    <div className="max-w-md mb-10 mx-auto">
      <Header />
      <div className="min-h-screen py-8 px-4 mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 md:p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Contact Us
            </h1>
            <p className="text-emerald-100 mt-2">
              We'd love to hear from you! Reach out for any questions or
              feedback.
            </p>
          </div>
        </div>

        {/* Contact Form and Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-emerald-500">
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="bg-emerald-100 p-3 rounded-full mr-4">
                  <FaPaperPlane className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Send Message
                </h2>
              </div>

              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-600 transition-all shadow-md"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-500">
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaMapMarkerAlt className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Our Location
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4">
                    <FaMapMarkerAlt className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Address
                    </h3>
                    <p className="text-gray-600">
                      123 Main Street, Bhubaneswar, Odisha, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4">
                    <FaPhone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                    <p className="text-gray-600">+91 9876543210</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Available 9AM - 7PM, Monday to Saturday
                    </p>
                  </div>
                </div>

                {/*  Map Embed  */}
                <div className="mt-6 rounded-lg overflow-hidden border border-gray-200 h-48">
                  <iframe
                    title="Map"
                    className="w-full h-full"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=85.0,20.0,86.0,21.0&layer=mapnik"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-600">
            We typically respond within 24 hours. For urgent matters, please
            call us directly.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              Proudly serving Odisha ❤️
            </span>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
