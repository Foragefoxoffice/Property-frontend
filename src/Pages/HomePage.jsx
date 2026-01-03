import { useState, useEffect } from 'react';
import HomeBanner from "@/components/Home/HomeBanner";
import HomeAbout from "@/components/Home/HomeAbout";
import HomeFeaturedProperties from "@/components/Home/HomeFeaturedProperties";
import HomeFaq from "@/components/Home/HomeFaq";
import HomeFindProperty from "@/components/Home/HomeFindProperty";
import SmoothScroll from "@/components/SmoothScroll";
import { getHomePage } from "@/Api/action";

export default function HomePage() {
    const [homePageData, setHomePageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await getHomePage();
                if (response.data?.success && response.data?.data) {
                    setHomePageData(response.data.data);
                }
            } catch (error) {
                console.error('Error loading home page data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
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
            <HomeBanner homePageData={homePageData} />
            <HomeAbout homePageData={homePageData} />
            <HomeFeaturedProperties homePageData={homePageData} />
            <HomeFaq homePageData={homePageData} />
            <HomeFindProperty homePageData={homePageData} />
        </div>
    );
}