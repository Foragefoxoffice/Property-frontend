import { useEffect, useState } from "react";
import { getContactPage } from "../Api/action";
import ContactBanner from "../components/Contact/ContactBanner";
import ContactReachForm from "../components/Contact/ContactReachForm";
import ContactMap from "../components/Contact/ContactMap";
import SmoothScroll from "@/components/SmoothScroll"; // Assuming SmoothScroll is wanted here too, or just for consistency

export default function ContactPage() {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await getContactPage();
                if (response.data?.success && response.data?.data) {
                    setPageData(response.data.data);
                } else {
                    setPageData(response.data);
                }
            } catch (error) {
                console.error("Error fetching Contact Page data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col relative items-center justify-center h-screen bg-white">
                <img
                    src="/images/login/logo.png"
                    alt="Loading..."
                    className="w-40 h-40 object-contain mb-4 animate-pulse"
                />

                <div
                    style={{ fontSize: 30 }}
                    className="flex space-x-1 text-[#41398B] absolute top-[55%] text-2xl font-semibold"
                >
                    <span className="animate-bounce rounded-full">•</span>
                    <span className="animate-bounce delay-150">•</span>
                    <span className="animate-bounce delay-300">•</span>
                    <span className="animate-bounce delay-300">•</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <SmoothScroll />
            <ContactBanner data={pageData} />
            <ContactMap data={pageData} />
            <ContactReachForm data={pageData} />

        </div>
    );
}