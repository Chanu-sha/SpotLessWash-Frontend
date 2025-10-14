import { FaMapMarkerAlt, FaPhone, FaPaperPlane } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactUs() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-10 px-4 md:px-8 lg:px-12 xl:px-20 max-w-7xl mx-auto w-full">
        {/* --- Hero Section --- */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 md:p-10 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Contact Us
            </h1>
            <p className="text-emerald-100 mt-2 md:text-lg max-w-2xl mx-auto">
              We'd love to hear from you! Reach out for any questions or
              feedback.
            </p>
          </div>
        </section>

        {/* --- Contact Section --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
            <div className="p-6 md:p-10">
              <div className="flex items-center mb-6">
                <div className="bg-emerald-100 p-3 rounded-full mr-4">
                  <FaPaperPlane className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
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

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="p-6 md:p-10">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaMapMarkerAlt className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  Get in Touch
                </h2>
              </div>

              <ul className="space-y-5 text-gray-700 md:text-lg">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="text-green-600 mt-1 mr-3" />
                  <span>
                    <strong>Address:</strong> Bhubaneswar, Odisha, India
                  </span>
                </li>


                <li className="flex items-start">
                  <FaPaperPlane className="text-green-600 mt-1 mr-3" />
                  <span>
                    <strong>Email:</strong>
                    <a
                      href="mailto:spotlesswash@proton.me"
                      className="text-emerald-600 hover:underline"
                    >
                      spotlesswash@proton.me
                    </a>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- Bottom Note --- */}
        <section className="mt-10 bg-white rounded-2xl shadow-md p-6 md:p-8 text-center">
          <p className="text-gray-700 md:text-lg">
            We typically respond within 24 hours. For urgent matters, please
            call us directly.
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-sm md:text-base font-medium">
              Proudly serving Odisha ❤️
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
