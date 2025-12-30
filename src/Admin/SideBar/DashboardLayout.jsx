import React from "react";
import { Home, Users, UserCog, LayoutGrid, Key, BedDouble, Trash, ChevronDown, Folder, Wrench } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();
    const t = translations[language];

    const [openProperties, setOpenProperties] = React.useState(true);
    const [openCMS, setOpenCMS] = React.useState(false);

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            <Header />
            <div className="flex h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD]">

                {/* SIDEBAR */}
                <div className="w-[280px] flex flex-col items-center py-6 h-full overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col w-full gap-4 px-4">

                        {/* PROPERTIES DROPDOWN */}
                        <div className="w-full">
                            <button
                                onClick={() => setOpenProperties(!openProperties)}
                                className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                        <Home className="w-4 h-4" />
                                    </span>
                                    <span className="text-sm font-medium">Properties</span>
                                </div>
                                <ChevronDown className={`transition ${openProperties ? "rotate-180" : ""}`} />
                            </button>

                            {openProperties && (
                                <div className="ml-10 mt-2 flex flex-col gap-2">
                                    {/* LEASE */}
                                    <button
                                        onClick={() => navigate("/dashboard/lease")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/lease") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Key /> </span>
                                        <span>{t.lease}</span>
                                    </button>

                                    {/* SALE */}
                                    <button
                                        onClick={() => navigate("/dashboard/sale")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/sale") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Home /> </span>
                                        <span>{t.sale}</span>
                                    </button>

                                    {/* HOME STAY */}
                                    <button
                                        onClick={() => navigate("/dashboard/homestay")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/homestay") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <BedDouble /> </span>
                                        <span>{t.homeStay}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* CMS SETTINGS DROPDOWN */}
                        <div className="w-full">
                            <button
                                onClick={() => setOpenCMS(!openCMS)}
                                className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                        <LayoutGrid className="w-4 h-4" />
                                    </span>
                                    <span className="text-sm font-medium">CMS Admin</span>
                                </div>
                                <ChevronDown className={`transition ${openCMS ? "rotate-180" : ""}`} />
                            </button>

                            {openCMS && (
                                <div className="ml-10 mt-2 flex flex-col gap-2">
                                    {/* HOME PAGE */}
                                    <button
                                        onClick={() => navigate("/dashboard/cms/home")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/home") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Home /> </span>
                                        <span>{t.home || "Home Page"}</span>
                                    </button>

                                    {/* HEADER */}
                                    <button
                                        onClick={() => navigate("/dashboard/cms/header")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/header") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <LayoutGrid /> </span>
                                        <span>Header</span>
                                    </button>

                                    {/* FOOTER */}
                                    <button
                                        onClick={() => navigate("/dashboard/cms/footer")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/footer") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <LayoutGrid /> </span>
                                        <span>Footer</span>
                                    </button>

                                    {/* ABOUT US */}
                                    <button
                                        onClick={() => navigate("/dashboard/cms/about")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/about") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Users /> </span>
                                        <span>About Us</span>
                                    </button>

                                    {/* CONTACT */}
                                    <button
                                        onClick={() => navigate("/dashboard/cms/contact")}
                                        className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/contact") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                    >
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <UserCog /> </span>
                                        <span>Contact</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* OTHER PAGES */}

                        {/* LANDLORDS */}
                        <button
                            onClick={() => navigate("/dashboard/landlords")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                ${isActive("/dashboard/landlords") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
              `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"><Users /></span>
                            <span>{t.owners}</span>
                        </button>

                        {/* STAFF */}
                        {/* <button
              onClick={() => navigate("/dashboard/staffs")}
              className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                ${isActive("/dashboard/staffs") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
              `}
            >
              <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"><UserCog /></span>
              <span>{t.staffs}</span>
            </button> */}

                        {/* MASTERS */}
                        <button
                            onClick={() => navigate("/dashboard/masters")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                ${isActive("/dashboard/masters") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
              `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"><LayoutGrid /></span>
                            <span>{t.masters}</span>
                        </button>

                        {/* TRASH */}
                        <button
                            onClick={() => navigate("/dashboard/trash")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                ${isActive("/dashboard/trash") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
              `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"><Trash /></span>
                            <span>{t.trash}</span>
                        </button>

                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-auto p-4">
                    <Outlet />
                </div>

            </div>
        </>
    );
};

export default DashboardLayout;