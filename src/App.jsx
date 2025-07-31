import { Routes, Route } from "react-router-dom";
import FooterNav from './components/FooterNav'
import Home from "./Pages/Home";
import Service from "./Pages/service";
import Orders from "./Pages/Orders";
import Profile from "./Pages/Profile";
import Subscription from "./Pages/Subscription";
import AuthComponent from "./components/AuthComponent";
import AdminPanel from './components/AdminPanel'
import DeliveryDashboard from "./components/DeliveryDashboard";
import AboutUs from "./Pages/AboutUs";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsAndConditions from "./Pages/TermsAndConditions";
import ContactUs from "./Pages/ContactUs";
import MyDeals from "./components/MyDeals";

function App() {
  return (
    <div className='' >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthComponent />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
          <Route path="/service" element={<Service />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/my-deals" element={<MyDeals />} />
        </Routes>
        <FooterNav />
    </div>
  )
}

export default App
