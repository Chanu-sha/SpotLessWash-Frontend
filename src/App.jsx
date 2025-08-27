import AppRoutes from "./routes/AppRoutes";
import FooterNav from "./components/FooterNav";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // PWA detection
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    if (isPWA) {
      // Hide address bar completely
      window.addEventListener("load", () => {
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 0);
      });

      // Prevent zoom
      document.addEventListener("touchstart", (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      });

      // Prevent context menu
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });

      // Native app feel
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    // Back button handling for Android
    document.addEventListener("backbutton", (e) => {
      e.preventDefault();
      // Your custom back button logic
    });
  }, []);

  return (
    <div className="app-container">
      {/* Status bar overlay */}
      <div className="status-bar-overlay"></div>

      <AppRoutes />
      <FooterNav />
    </div>
  );
}
