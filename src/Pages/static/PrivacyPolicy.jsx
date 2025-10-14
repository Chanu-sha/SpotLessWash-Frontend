import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function PrivacyPolicy() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-10 px-4 md:px-8 lg:px-12 xl:px-20 max-w-7xl mx-auto w-full">
        <div className="space-y-10">
          {/* --- HEADER SECTION --- */}
          <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 md:p-10">
              <h1 className="text-3xl md:text-5xl font-bold italic text-white text-center">
                Privacy Policy
              </h1>
            </div>
            <div className="p-6 md:p-10">
              <p className="italic text-center text-gray-700 bg-emerald-50 p-4 rounded-lg border border-emerald-100 leading-relaxed md:text-lg">
                At Spot Less Wash{" "}
                <span className="text-emerald-600 font-semibold">
                  (Proudly made in Odisha ❤️)
                </span>
                , we are committed to protecting your privacy and ensuring
                transparency in how your personal data is used.
              </p>
            </div>
          </section>

          {/* --- POLICY GRID --- */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* CARD TEMPLATE */}
            {[
              {
                title: "Information We Collect",
                color: "green",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                ),
                content:
                  "We collect your name, mobile number, address, and garment order details when you book a service with us. This data helps us provide smooth pickup and delivery experiences, accurate billing, and customer support.",
              },
              {
                title: "How We Use Your Data",
                color: "emerald",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                ),
                content: (
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>To schedule laundry pickups and deliveries on time</li>
                    <li>To contact you about order status or changes</li>
                    <li>To improve our services and user experience</li>
                    <li>To ensure garment safety and service quality</li>
                  </ul>
                ),
              },
              {
                title: "Third Party Services",
                color: "teal",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                ),
                content:
                  "We do not sell or share your personal information with third parties for marketing. However, we may use trusted tools like Firebase Authentication or payment gateways which have their own privacy practices.",
              },
              {
                title: "Garment Safety Promise",
                color: "cyan",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                ),
                content:
                  "Your clothes are handled by trained professionals with care. Be it silk sarees, office suits, or t-shirts – we ensure they are cleaned, pressed, and returned in the best condition.",
              },
              {
                title: "Your Rights",
                color: "blue",
                icon: (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </>
                ),
                content:
                  "You can request to view, update, or delete your personal information stored with us. For any privacy-related concerns, contact our support team anytime.",
              },
              {
                title: "Updates to This Policy",
                color: "indigo",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
                content:
                  "This Privacy Policy may be updated periodically. We recommend checking this page from time to time to stay informed about how we protect your data.",
              },
              {
                title: "Contact Us",
                color: "purple",
                span: 3,
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                ),
                content: (
                  <p className="text-gray-600">
                    If you have any questions regarding your privacy, please
                    email us at
                    <a
                      href="mailto:spotlesswash@proton.me"
                      className="text-green-600 font-semibold hover:underline ml-1.5"
                    >
                      spotlesswash@proton.me
                    </a>
                    .
                  </p>
                ),
              },
            ].map((card, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-${
                  card.color
                }-500 hover:shadow-lg transition-shadow ${
                  card.span ? `md:col-span-${card.span}` : ""
                }`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center mb-4">
                    <div
                      className={`bg-${card.color}-100 p-3 rounded-full mr-4`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 text-${card.color}-600`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {card.icon}
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                      {card.title}
                    </h2>
                  </div>
                  <div className="text-gray-600 leading-relaxed md:text-lg">
                    {card.content}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* --- FOOTER NOTE --- */}
          <section className="bg-white rounded-2xl shadow-md p-6 md:p-8 text-center">
            <p className="text-gray-700 md:text-lg">
              Thank you for trusting{" "}
              <span className="text-green-600 font-bold">Spot Less Wash</span>{" "}
              with your clothes and privacy.
            </p>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium md:text-base">
                Proudly serving Odisha
              </span>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
