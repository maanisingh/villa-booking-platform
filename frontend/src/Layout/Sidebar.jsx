import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


import {
  faChartPie,     // Dashboard के लिए
  faHome,           // Villas (विला) के लिए
  faUsers,          // Owners (मालिकों) के लिए
  faCog,            // Setting (सेटिंग्स) के लिए
  faBook,           // My Booking (बुकिंग) के लिए
  faCalendarAlt,    // Calendar (कैलेंडर) के लिए
  faUserCircle,      // Profile (प्रोफाइल) के लिए
  faLink,           // Platform Integration के लिए
  faEnvelope        // Email Settings के लिए
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

const Sidebar = ({ collapsed, setCollapsed, onMobileToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("client");
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    const role = (localStorage.getItem("userRole") || "client").toLowerCase();
    setUserRole(role);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    setOpenSubmenu(null);
    if (window.innerWidth <= 768 && onMobileToggle) {
      onMobileToggle();
    }
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

const allMenus = {
  

  admin: [
    { name: "Dashboard", icon: faChartPie, path: "/admin-dashboard" },
    { name: "Villas", icon: faHome, path: "/admin-villas" },
    { name: "Owners", icon: faUsers, path: "/admin-owners" },
    { name: "Villa Integrations", icon: faLink, path: "/admin-villa-integrations" },
    { name: "Email Settings", icon: faEnvelope, path: "/admin-email-settings" },
    { name: "Setting", icon: faCog, path: "/admin-setting" },
  ],
  owner: [
    { name: "My Booking", icon: faBook, path: "/owner-mybooking" },
    { name: "Calendar", icon: faCalendarAlt, path: "/owner-calender" },
    { name: "My Villa Info", icon: faHome, path: "/owner-myvillainfo" },
    { name: "Email Settings", icon: faEnvelope, path: "/owner-email-settings" },
    { name: "Profile", icon: faUserCircle, path: "/owner-profile" },
  ],
};
  const userMenus = allMenus[userRole] || allMenus["admin"];

  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""} ${window.innerWidth <= 768 && !collapsed ? "active" : ""}`}>
      <div className="sidebar">
        <ul className="menu-list">
          {userMenus.map((menu, index) => (
            <React.Fragment key={index}>
              <li className="menu-item">
                <div
                  className={`menu-link ${isActive(menu.path) ? "active" : ""}`}
                  onClick={() => {
                    if (menu.hasDropdown) {
                      toggleSubmenu(menu.name);
                    } else {
                      handleNavigate(menu.path);
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={menu.icon}
                    className={`menu-icon ${isActive(menu.path) ? "active-icon" : ""}`}
                  />
                  {!collapsed && <span className="menu-text">{menu.name}</span>}
                  {menu.hasDropdown && !collapsed && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`dropdown-arrow ${openSubmenu === menu.name ? "rotate" : ""}`}
                    />
                  )}
                </div>
              </li>

              {!collapsed &&
                menu.submenus &&
                openSubmenu === menu.name &&
                menu.submenus.map((sub, subIndex) => (
                  <li key={`sub-${subIndex}`} className="menu-item submenu-item">
                    <div
                      className={`menu-link submenu-link ${isActive(sub.path) ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(sub.path);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={sub.icon}
                        className={`menu-icon ${isActive(sub.path) ? "active-icon" : ""}`}
                      />
                      <span className="menu-text">{sub.name}</span>
                    </div>
                  </li>
                ))}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;