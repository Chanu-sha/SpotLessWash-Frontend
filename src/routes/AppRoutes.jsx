import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Toast } from "@capacitor/toast";

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
import AdminWithdrawalDashboard from "../components/AdminWithdrawalDashboard";

function AppRoutesContent() {
  const navigate = useNavigate();
  const backPressTime = useRef(0); 

  useEffect(() => {
    const backListener = CapacitorApp.addListener("backButton", async () => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        const now = Date.now();
        if (now - backPressTime.current < 2000) {
          CapacitorApp.exitApp(); // app exit
        } else {
          backPressTime.current = now;
          await Toast.show({
            text: "Press back again to exit",
            duration: "short",
            position: "bottom"
          });
        }
      }
    });

    return () => {
      backListener.remove();
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthComponent />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="/admin-Withdrawl-Dashboard" element={<AdminWithdrawalDashboard />} />
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

export default function AppRoutes() {
  return (
      <AppRoutesContent />
  );
}
