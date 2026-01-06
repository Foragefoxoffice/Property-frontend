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
import Loader from "@/components/Loader/Loader";
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";

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
        return <Loader />;
    }

    return (
        <div>
            <SmoothScroll />
            <Header />
            <AboutBanner data={pageData} />
            <AboutOverview data={pageData} />
            <AboutMissionVission data={pageData} />
            <AboutHistory data={pageData} />
            <AboutWhyChoose data={pageData} />
            <AboutBuyProcess data={pageData} />
            <AboutFindProperty data={pageData} />
            <AboutAgent data={pageData} />
            <Footer />
        </div>
    );
}