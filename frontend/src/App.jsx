// 1. Navigate ko bhi import karein
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import Navbar from "./Layout/Navbar";
import Sidebar from "./Layout/Sidebar";

import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import OwnerRegister from "./Auth/OwnerRegister";
import LandingPage from "./Pages/LandingPage";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import AdminVillas from "./Components/AdminDashboard/AdminVillas";
import AdminOwners from "./Components/AdminDashboard/AdminOwners";
import AdminSetting from "./Components/AdminDashboard/AdminSetting";
import AdminEmailSettings from "./Components/AdminDashboard/AdminEmailSettings";
import AdminVillaPlatformIntegration from "./Components/AdminDashboard/AdminVillaPlatformIntegration";
import OwnerMyBooking from "./Components/OwnerDashboard/OwnerMyBooking";
import OwnerCalender from "./Components/OwnerDashboard/OwnerCalender";
import OwnerMyVillaInfo from "./Components/OwnerDashboard/OwnerMyVillaInfo";
import OwnerProfile from "./Components/OwnerDashboard/OwnerProfile";
import PlatformIntegration from "./Components/OwnerDashboard/PlatformIntegration";
import EmailSettings from "./Components/OwnerDashboard/EmailSettings";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ... baki logic same rahega ...
  useEffect(() => {
    const checkIfMobile = () => window.innerWidth <= 768;
    if (checkIfMobile()) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const location = useLocation();

  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";

  return (
    <>
      {hideLayout ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<OwnerRegister />} />
        </Routes>
      ) : (
        <>
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="main-content">
            <Sidebar
              collapsed={isSidebarCollapsed}
              setCollapsed={setIsSidebarCollapsed}
            />
            <div
              className={`right-side-content ${
                isSidebarCollapsed ? "collapsed" : ""
              }`}
            >
              <Routes>
                {/* Admin Dashboard */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-villas" element={<AdminVillas />} />
                <Route path="/admin-owners" element={<AdminOwners />} />
                <Route path="/admin-setting" element={<AdminSetting />} />
                <Route path="/admin-villa-integrations" element={<AdminVillaPlatformIntegration />} />
                <Route path="/admin-email-settings" element={<AdminEmailSettings />} />

                {/* Owner Dashboard */}

                {/* 👇 YEH LINE ADD KAREIN: Redirect ke liye */}
                <Route path="/owner-dashboard" element={<Navigate to="/owner-mybooking" replace />} />

                <Route path="/owner-mybooking" element={<OwnerMyBooking />} />
                <Route path="/owner-calender" element={<OwnerCalender />} />
                <Route path="/owner-myvillainfo" element={<OwnerMyVillaInfo />} />
                <Route path="/owner-profile" element={<OwnerProfile />} />
                <Route path="/owner-platforms" element={<PlatformIntegration />} />
                <Route path="/owner-email-settings" element={<EmailSettings />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;