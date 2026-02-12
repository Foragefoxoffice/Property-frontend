import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SiMessenger, SiZalo } from "react-icons/si";
import { getAgent } from "@/Api/action";
import { useLanguage } from "@/Language/LanguageContext";

import { useLocation } from "react-router-dom";

const FloatingContactButtons = () => {
    const { language } = useLanguage();
    const { pathname } = useLocation();
    const [agentData, setAgentData] = useState(null);

    const hideOnPaths = ["/dashboard", "/user-dashboard", "/login", "/register", "/forgot-password", "/reset-password"];
    const shouldHide = hideOnPaths.some(path => pathname.startsWith(path));

    useEffect(() => {
        if (shouldHide) return;
        const fetchAgentData = async () => {
            try {
                const response = await getAgent();
                if (response.data?.success) {
                    setAgentData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching agent data:", error);
            }
        };
        fetchAgentData();
    }, [shouldHide]);

    if (shouldHide || !agentData) return null;

    const {
        agentNumber,
        agentZaloLink,
        agentMessengerLink,
        agentWhatsappLink
    } = agentData;

    const primaryPhone = Array.isArray(agentNumber) ? agentNumber[0] : agentNumber;

    const buttons = [
        {
            id: 'call',
            icon: <Phone className="w-6 h-6 md:w-7 md:h-7" fill="white" />,
            link: primaryPhone ? `tel:${primaryPhone}` : null,
            color: 'bg-[#FF0000]',
            pingColor: '#FF0000',
            mobileColor: '#4CAF50',
            label: language === 'vi' ? 'Gọi ngay' : 'Call Now',
            mobileLabel: language === 'vi' ? 'Gọi' : 'Call'
        },
        {
            id: 'zalo',
            icon: <SiZalo className="w-6 h-6 md:w-7 md:h-7" />,
            link: agentZaloLink,
            color: 'bg-[#0068FF]',
            pingColor: '#0068FF',
            mobileColor: '#0068FF',
            label: 'Zalo',
            mobileLabel: 'Zalo'
        },

        {
            id: 'messenger',
            icon: <SiMessenger className="w-6 h-6 md:w-7 md:h-7" />,
            link: agentMessengerLink,
            color: 'bg-[#0084FF]',
            pingColor: '#0084FF',
            mobileColor: '#0084FF',
            label: 'Messenger',
            mobileLabel: 'Messenger'
        },

        {
            id: 'whatsapp',
            icon: <FaWhatsapp className="w-6 h-6 md:w-7 md:h-7" />,
            link: agentWhatsappLink,
            color: 'bg-[#25D366]',
            pingColor: '#25D366',
            mobileColor: '#25D366',
            label: 'WhatsApp',
            mobileLabel: 'WhatsApp'
        }
    ].filter(btn => btn.link);

    if (buttons.length === 0) return null;

    return (
        <>
            {/* Desktop Floating Buttons (Bottom Left as in Image 1) */}
            <div className="fixed left-6 bottom-14 z-[9999] hidden md:flex flex-col gap-4">
                {buttons.map((btn) => (
                    <a
                        key={btn.id}
                        href={btn.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${btn.color} text-white floating-button w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group relative`}
                    >
                        {btn.icon}
                        <span className="absolute left-16 bg-white text-black px-3 py-1 rounded shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {btn.label}
                        </span>

                        {/* Pulse animation for all icons */}
                        <span
                            className="absolute inset-0 rounded-full animate-ping opacity-20 -z-10"
                            style={{ backgroundColor: btn.pingColor }}
                        ></span>
                    </a>
                ))}
            </div>

            {/* Mobile Sticky Bottom Bar (Bottom as in Image 2) */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-[9999] md:hidden shadow-[0_-2px_15px_rgba(0,0,0,0.15)] pb-safe">
                <div className="flex justify-around items-center h-16 px-2 pb-1">
                    {buttons.map((btn) => (
                        <a
                            key={btn.id}
                            href={btn.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-0 min-w-[70px] active:scale-95 transition-transform"
                        >
                            <div className="mb-0.5">
                                {btn.id === 'messenger' && <SiMessenger className="w-7 h-7" style={{ color: btn.mobileColor }} />}
                                {btn.id === 'zalo' && <SiZalo className="w-7 h-7" style={{ color: btn.mobileColor }} />}
                                {btn.id === 'call' && <Phone className="w-7 h-7" fill={btn.mobileColor} style={{ color: btn.mobileColor }} />}
                                {btn.id === 'whatsapp' && <FaWhatsapp className="w-7 h-7" style={{ color: btn.mobileColor }} />}
                            </div>
                            <span className="text-[11px] font-bold text-gray-500 tracking-tight">
                                {btn.mobileLabel}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
};

export default FloatingContactButtons;
