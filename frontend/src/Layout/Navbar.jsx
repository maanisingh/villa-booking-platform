import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaUserCircle,
  FaBars,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo (2).png";

const Navbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const dropdownRef = useRef();
  const navigate = useNavigate();

  // ✅ Detect click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Load saved user info (role and name)
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name");

    console.log("🔹 Loaded from localStorage:", { storedRole, storedName });

    if (storedRole) {
      setUserRole(storedRole);
      setUserName(storedName || storedRole);
    } else {
      setUserRole("Owner");
      setUserName("Owner");
    }
  }, []);

  // ✅ Toggle sidebar
  const handleToggleSidebar = () => {
    if (typeof toggleSidebar === "function") toggleSidebar();
  };

  // ✅ Logout logic
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setDropdownOpen(false);
    navigate("/", { replace: true });
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  // ✅ Profile navigation
  const handleProfile = () => {
    setDropdownOpen(false);
    if (userRole === "Admin") navigate("/admin-profile");
    else navigate("/owner-profile");
  };

  // ✅ Dropdown toggle
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="navbar-custom">
      {/* ===== LEFT SIDE ===== */}
      <div className="navbar-left">
        <button
          className="menu-btn"
          onClick={handleToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars size={20} />
        </button>

        {/* --- Logo and Title --- */}
        <span
          className="navbar-logo"
          style={{ textAlign: "center", marginLeft: "15px" }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "70px",
              height: "auto",
              filter: "brightness(0) invert(1)",
            }}
          />
          <h5
            style={{
              color: "white",
              marginTop: "4px",
              marginBottom: "0",
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "Satoshi, sans-serif",
            }}
          >
            Villa Booking
          </h5>
        </span>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="navbar-right">
        <div className="nav-icons">
          <div
            className="nav-icon-btn position-relative"
            title="Notifications"
          >
            <FaBell size={16} />
            <span className="notification-badge">3</span>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt size={16} />
            <span className="btn-text">Logout</span>
          </button>
        </div>

        {/* 👤 Profile Dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <div className="user-profile" onClick={toggleDropdown}>
            <FaUserCircle size={20} />
            <div className="user-details">
              <div className="user-name">{userName}</div>
              <div className="user-projects">
                {userRole === "Admin" ? "Admin Panel" : "Owner Panel"}
              </div>
            </div>
          </div>

          {dropdownOpen && (
            <ul className="dropdown-menu show">
              <li>
                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={handleProfile}
                >
                  <FaUser size={14} style={{ marginRight: "8px" }} />
                  View Profile
                </button>
              </li>
              {/* <li>
                <hr className="dropdown-divider" />
              </li> */}
              <li>
                {/* <button
                  className="dropdown-item text-danger d-flex align-items-center"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt size={14} style={{ marginRight: "8px" }} />
                  Logout
                </button> */}
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
