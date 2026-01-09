import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown, Heart, Lock } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { getHeader } from "../../Api/action";
import AnimatedNavLink from "../../components/AnimatedNavLink";
import { useFavorites } from "../../Context/FavoritesContext";
import { Tooltip } from "antd";

export default function Header({ showNavigation = true }) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showPropertiesDropdown, setShowPropertiesDropdown] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [headerLogo, setHeaderLogo] = useState("/images/login/logo.png");
  const { language, toggleLanguage } = useLanguage();
  const { favorites, clearFavorites } = useFavorites();

  const labels = {
    logout: { en: "Logout", vi: "Đăng xuất" },
    loggedOut: { en: "You're Logged Out!", vi: "Bạn đã đăng xuất!" },
    homepages: { en: "Homepage", vi: "Trang chủ" },
    properties: { en: "Properties", vi: "Bất động sản" },
    propertiesLease: { en: "Properties for Lease", vi: "Bất động sản cho thuê" },
    propertiesSale: { en: "Properties for Sale", vi: "Bất động sản bán" },
    propertiesHomestay: { en: "Properties for Homestay", vi: "Bất động sản Homestay" },
    aboutus: { en: "About Us", vi: "Về chúng tôi" },
    blog: { en: "Blog", vi: "Blog" },
    contacts: { en: "Contact Us", vi: "Liên hệ" },
    loginRegister: { en: "Login/Register", vi: "Đăng nhập/Đăng ký" },
    changePassword: { en: "Change Password", vi: "Đổi mật khẩu" },
    dashboard: { en: "Dashboard", vi: "Trang tổng quan" },
    myFavorites: { en: "My Favorites", vi: "Yêu thích của tôi" },
  };

  // Fetch header logo from CMS
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await getHeader();
        const logo = response.data.data?.headerLogo;
        if (logo) {
          setHeaderLogo(logo);
        }
      } catch (error) {
        console.error("Error fetching header logo:", error);
        // Keep default logo on error
      }
    };

    fetchHeaderData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    clearFavorites();
    CommonToaster(labels.loggedOut[language], "error");
    navigate("/");
  };

  const userName = localStorage.getItem("userName") || "";
  const initials = userName
    ? userName.slice(0, 2).toUpperCase()
    : "US";

  // Get logo URL with proper base path
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return "/images/login/logo.png";
    if (logoPath.startsWith('http')) return logoPath;
    if (logoPath.startsWith('/uploads')) {
      return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}${logoPath}`;
    }
    return logoPath;
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center">
          <img
            className="h-10 object-contain cursor-pointer"
            src={getLogoUrl(headerLogo)}
            alt="Logo"
            onClick={() => navigate("/home")}
          />
        </div>

        {/* Center Navigation */}
        {showNavigation && (
          <nav className="hidden lg:flex items-center gap-10">
            {/* Homepage Link */}
            <div className="font-semibold text-[16px]">
              <AnimatedNavLink
                text={labels.homepages[language]}
                onClick={() => navigate("/home")}
              />
            </div>

            {/* Properties Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowPropertiesDropdown(true)}
              onMouseLeave={() => setShowPropertiesDropdown(false)}
            >
              <div className="flex items-center gap-1 font-semibold text-[16px]">
                <AnimatedNavLink
                  onClick={() => navigate("/listing")}
                  text={labels.properties[language]}
                  hasDropdown={true}
                  isDropdownOpen={showPropertiesDropdown}
                />
                <motion.div
                  animate={{ rotate: showPropertiesDropdown ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <ChevronDown className="w-4 h-4 text-[#000]" />
                </motion.div>
              </div>

              <AnimatePresence>
                {showPropertiesDropdown && (
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ transformOrigin: "center top" }}
                    className="absolute left-0 top-full mt-3 w-[220px] bg-white rounded-lg shadow-[0_10px_25px_rgba(72,95,119,0.1)] z-50 overflow-hidden border border-gray-100"
                  >
                    <div className="py-1">
                      {[
                        { label: labels.propertiesLease[language], path: "/listing?type=Lease", delay: 0 },
                        { label: labels.propertiesSale[language], path: "/listing?type=Sale", delay: 0.05 },
                        { label: labels.propertiesHomestay[language], path: "/listing?type=Home Stay", delay: 0.1 }
                      ].map((item, index) => (
                        <motion.button
                          key={index}
                          onClick={() => navigate(item.path)}
                          initial={{ y: 11, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: item.delay,
                            ease: [0.5, 0, 0, 1]
                          }}
                          whileHover={{ backgroundColor: "#f8f7ff" }}
                          className={`w-full cursor-pointer text-left px-5 py-3 text-[15px] text-[#2a2a2a] hover:text-[#41398B] font-semibold transition-colors ${index < 2 ? 'border-b border-gray-100' : ''
                            }`}
                        >
                          {item.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Us Link */}
            <div className="font-semibold text-[16px]">
              <AnimatedNavLink
                text={labels.aboutus[language]}
                onClick={() => navigate("/about")}
              />
            </div>

            {/* Blog Link */}
            <div className="font-semibold text-[16px]">
              <AnimatedNavLink
                text={labels.blog[language]}
                onClick={() => navigate("/blogs")}
              />
            </div>

            {/* Contact Link */}
            <div className="font-semibold text-[16px]">
              <AnimatedNavLink
                text={labels.contacts[language]}
                onClick={() => navigate("/contact")}
              />
            </div>
          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Favorites Indicator */}
          <Tooltip title={language === 'vi' ? 'Mục yêu thích' : 'Favorites'}>
            <button
              onClick={() => navigate("/favorites")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group"
              title={language === 'vi' ? 'Mục yêu thích' : 'Favorites'}
            >
              <Heart size={20} className="text-gray-600 group-hover:text-[#41398B] transition-colors cursor-pointer" />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white transform translate-x-1 -translate-y-1">
                  {favorites.length}
                </span>
              )}
            </button>
          </Tooltip>

          {!localStorage.getItem("token") && (
            <div>
              <Link className="font-medium text-[16px] hover:text-[#41398B]" to="/">Login/Register</Link>
            </div>
          )}
          {/* Language Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
            {/* English Flag */}
            <button
              onClick={() => toggleLanguage("en")}
              aria-pressed={language === "en"}
              title="English"
              className={`h-8 w-8 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${language === "en"
                ? "bg-white shadow scale-105"
                : "hover:bg-white/70"
                }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <clipPath id="gb_clip">
                    <circle cx="12" cy="12" r="12"></circle>
                  </clipPath>
                </defs>
                <g clipPath="url(#gb_clip)">
                  <rect width="24" height="24" fill="#012169"></rect>
                  <line
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    stroke="#FFF"
                    strokeWidth="6"
                  />
                  <line
                    x1="24"
                    y1="0"
                    x2="0"
                    y2="24"
                    stroke="#FFF"
                    strokeWidth="6"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    stroke="#C8102E"
                    strokeWidth="3"
                  />
                  <line
                    x1="24"
                    y1="0"
                    x2="0"
                    y2="24"
                    stroke="#C8102E"
                    strokeWidth="3"
                  />
                  <line
                    x1="12"
                    y1="0"
                    x2="12"
                    y2="24"
                    stroke="#FFF"
                    strokeWidth="6"
                  />
                  <line
                    x1="0"
                    y1="12"
                    x2="24"
                    y2="12"
                    stroke="#FFF"
                    strokeWidth="6"
                  />
                  <line
                    x1="12"
                    y1="0"
                    x2="12"
                    y2="24"
                    stroke="#C8102E"
                    strokeWidth="4"
                  />
                  <line
                    x1="0"
                    y1="12"
                    x2="24"
                    y2="12"
                    stroke="#C8102E"
                    strokeWidth="4"
                  />
                </g>
              </svg>
            </button>
            {/* Vietnamese Flag */}
            <button
              onClick={() => toggleLanguage("vi")}
              aria-pressed={language === "vi"}
              title="Tiếng Việt"
              className={`h-8 w-8 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${language === "vi"
                ? "bg-white shadow scale-105"
                : "hover:bg-white/70"
                }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <clipPath id="vn_clip">
                    <circle cx="12" cy="12" r="12"></circle>
                  </clipPath>
                </defs>
                <g clipPath="url(#vn_clip)">
                  <rect width="24" height="24" fill="#DA251D"></rect>
                  <polygon
                    fill="#FFCE00"
                    points="
                      12.000,4.500 13.763,9.573 19.133,9.682 14.853,12.927
                      16.408,18.068 12.000,15.000 7.592,18.068 9.147,12.927
                      4.867,9.682 10.237,9.573
                    "
                  ></polygon>
                </g>
              </svg>
            </button>
          </div>

          {/* Login/Register or Profile */}
          {localStorage.getItem("token") && (
            <div
              className="relative"
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              <div
                className="w-9 h-9 rounded-full bg-[#41398B] text-white 
               flex items-center justify-center text-sm font-bold 
               cursor-pointer shadow-sm hover:bg-[#352e7a] transition-colors"
                onClick={() => {
                  const role = localStorage.getItem("userRole");
                  if (role === "user") {
                    navigate("/user-dashboard");
                  } else {
                    navigate("/dashboard/lease");
                  }
                }}
              >
                {initials}
              </div>
              <AnimatePresence>
                {showLogout && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 origin-top-right overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        const role = localStorage.getItem("userRole");
                        if (role === "user") {
                          navigate("/user-dashboard/profile");
                        } else {
                          navigate("/dashboard/lease");
                        }
                        setShowLogout(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-[#41398B] transition font-medium border-b border-gray-50 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                      {labels.dashboard[language]}
                    </button>

                    <button
                      onClick={() => {
                        const role = localStorage.getItem("userRole");
                        if (role === "user") {
                          navigate("/user-dashboard");
                        } else {
                          navigate("/favorites");
                        }
                        setShowLogout(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-[#41398B] transition font-medium border-b border-gray-50 cursor-pointer"
                    >
                      <Heart size={16} />
                      {labels.myFavorites[language]}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition cursor-pointer font-medium"
                    >
                      <LogOut size={16} /> {labels.logout[language]}
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
