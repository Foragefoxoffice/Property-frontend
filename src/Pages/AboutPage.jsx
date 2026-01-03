import { useEffect, useState } from "react";
import { getAboutPage } from "../Api/action";
import AboutBanner from "../components/About/AboutBanner";
import AboutOverview from "../components/About/AboutOverview";
import SmoothScroll from "@/components/SmoothScroll";
import AboutMissionVission from "../components/About/AboutMissionVission";
import AboutHistory from "../components/About/AboutHistory";
import AboutWhyChoose from "../components/About/AboutWhyChoose";
import AboutFindProperty from "../components/About/AboutFindProperty";
import AboutBuyProcess from "../components/About/AboutBuyProcess";
import AboutAgent from "../components/About/AboutAgent";

export default function AboutPage() {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const response = await getAboutPage();
                if (response.data?.success && response.data?.data) {
                    setPageData(response.data.data);
                } else {
                    setPageData(response.data);
                }
            } catch (error) {
                console.error("Error fetching About Page data:", error);
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
            <AboutBanner data={pageData} />
            <AboutOverview data={pageData} />
            <AboutMissionVission data={pageData} />
            <AboutHistory data={pageData} />
            <AboutWhyChoose data={pageData} />
            <AboutBuyProcess data={pageData} />
            <AboutFindProperty data={pageData} />
            <AboutAgent data={pageData} />
        </div>
    );
}