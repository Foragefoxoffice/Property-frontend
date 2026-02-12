import React, { useState } from "react";
import { Heart, User, MessageSquare } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../../Admin/Header/Header";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import Loader from "../../components/Loader/Loader";
import { useFavorites } from "../../Context/FavoritesContext";

const UserDashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();
    const { favorites } = useFavorites();
    const t = translations[language];
    const [loading, setLoading] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Header />
            <div className="flex h-[calc(100vh-80px)] bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD] pt-4 pb-16 lg:pb-0 relative">
                {/* SIDEBAR - Desktop Only */}
                <div className="hidden lg:flex w-[280px] flex-col items-center py-6 h-full overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col w-full gap-4 px-4">
                        {/* MY PROFILE */}
                        <button
                            onClick={() => navigate("/user-dashboard/profile")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                                ${isActive("/user-dashboard/profile") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                            `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white"><User size={20} /></span>
                            <span className="font-medium">{t.myProfile}</span>
                        </button>
                        {/* MY FAVORITES */}
                        <button
                            onClick={() => navigate("/user-dashboard")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                                ${location.pathname === "/user-dashboard" || isActive("/user-dashboard/favorites") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                            `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white"><Heart size={20} /></span>
                            <span className="font-medium">{t.myFavorites}</span>
                        </button>
                        {/* GIVE TESTIMONIAL */}
                        <button
                            onClick={() => navigate("/user-dashboard/give-testimonial")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                                ${isActive("/user-dashboard/give-testimonial") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                            `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white"><MessageSquare size={20} /></span>
                            <span className="font-medium">{t.giveTestimonial}</span>
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <Outlet />
                </div>

                {/* BOTTOM NAVIGATION - Mobile Only */}
                <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-[9999] lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={() => navigate("/user-dashboard")}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-colors ${location.pathname === "/user-dashboard" || isActive("/user-dashboard/favorites") ? "text-[#41398B]" : "text-gray-400"}`}
                    >
                        <Heart size={24} className={location.pathname === "/user-dashboard" || isActive("/user-dashboard/favorites") ? "fill-[#41398B]/10" : ""} />
                        {favorites.length > 0 && (
                            <span className="absolute top-2 right-1/4 bg-[#41398B] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white pulse">
                                {favorites.length}
                            </span>
                        )}
                        <span className="text-[10px] font-medium mt-1">{t.myFavorites}</span>
                    </button>

                    <button
                        onClick={() => navigate("/user-dashboard/give-testimonial")}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive("/user-dashboard/give-testimonial") ? "text-[#41398B]" : "text-gray-400"}`}
                    >
                        <MessageSquare size={24} className={isActive("/user-dashboard/give-testimonial") ? "fill-[#41398B]/10" : ""} />
                        <span className="text-[10px] font-medium mt-1">{t.giveTestimonial}</span>
                    </button>

                    <button
                        onClick={() => navigate("/user-dashboard/profile")}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive("/user-dashboard/profile") ? "text-[#41398B]" : "text-gray-400"}`}
                    >
                        <User size={24} className={isActive("/user-dashboard/profile") ? "fill-[#41398B]/10" : ""} />
                        <span className="text-[10px] font-medium mt-1">{t.myProfile}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserDashboardLayout;
