import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

import { useLocation } from "react-router-dom";

export default function ScrollUpButton() {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // Hide on dashboard and auth pages
    const hideOnPaths = ["/dashboard", "/user-dashboard", "/login", "/register", "/forgot-password", "/reset-password"];
    const shouldHide = hideOnPaths.some(path => pathname.startsWith(path));

    useEffect(() => {
        if (shouldHide) return;
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (shouldHide) return null;

    return (
        <div className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50">
            <button
                type="button"
                onClick={scrollToTop}
                className={`
          p-3 rounded-full bg-[#41398B] cursor-pointer text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-[#352e7a] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#41398B] focus:ring-offset-2
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
        `}
                aria-label="Scroll to top"
            >
                <ArrowUp className="h-6 w-6" />
            </button>
        </div>
    );
}
