import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";

export default function Header() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem("token");
    CommonToaster("You're Logged Out!", "error");
    navigate("/");
  };

  return (
    <header className="w-full bg-gradient-to-b from-[#eae8fd94] to-[#F7F6F9] flex items-center justify-between px-8 py-5 relative">
      {/* Left Logo */}
      <div className="text-3xl font-extrabold tracking-wide text-black pl-4">
        <img
          className="h-9"
          src="/images/login/logo.png"
          alt="183 Housing Solutions"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-5 relative">
        {/* Language Toggle */}
        <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
          {/* English Flag */}
          <button
            onClick={() => toggleLanguage("en")}
            aria-pressed={language === "en"}
            title="English"
            className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${
              language === "en"
                ? "bg-white shadow scale-[1.06]"
                : "hover:bg-white/70"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
            className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center transition ring-1 ring-black/5 cursor-pointer ${
              language === "vi"
                ? "bg-white shadow scale-[1.06]"
                : "hover:bg-white/70"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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

        {/* Profile Image with Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
        >
          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            className="w-9 h-9 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition"
          />

          <AnimatePresence>
            {showLogout && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 origin-top-right"
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 w-full text-left px-4 py-2 text-sm bg-[red] text-white rounded transition cursor-pointer"
                >
                  <LogOut size={17} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
