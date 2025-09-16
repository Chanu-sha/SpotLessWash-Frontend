import { Routes, Route } from "react-router-dom";

import Home from "../Pages/Home";
import Orders from "../Pages/Orders";
import AuthComponent from "../components/AuthComponent";
import AdminPanel from "../components/AdminPanel";
import DeliveryDashboard from "../Pages/delievry/DeliveryDashboard";
import AboutUs from "../Pages/static/AboutUs";
import PrivacyPolicy from "../Pages/static/PrivacyPolicy";
import TermsAndConditions from "../Pages/static/TermsAndConditions";
import ContactUs from "../Pages/ContactUs";
import MyDeals from "../Pages/delievry/MyDeals";
import AssignedDeals from "../Pages/vendor/AssignedDeals";
import VendorServices from "../Pages/Services";
import UserProfile from "../Pages/profile/UserProfile";
import DeliveryProfile from "../Pages/profile/DeliveryProfile";
import VendorProfile from "../Pages/profile/VendorProfile";
import VendorDashboard from "../Pages/vendor/VendorDashboard";
import OurServices from "../Pages/static/OurServices";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthComponent />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
      <Route path="/vendor-dashboard" element={<VendorDashboard />} />
      <Route path="/service" element={<VendorServices />} />
      <Route path="/ourservices" element={<OurServices />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/userprofile" element={<UserProfile />} />
      <Route path="/delieveryprofile" element={<DeliveryProfile />} />
      <Route path="/vendorprofile" element={<VendorProfile />} />
      <Route path="/my-deals" element={<MyDeals />} />
      <Route path="/vendor-assigned" element={<AssignedDeals />} />
    </Routes>
  );
}

export default AppRoutes;
