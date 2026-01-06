import { useEffect, useState } from "react";
import { getContactPage } from "../Api/action";
import ContactBanner from "../components/Contact/ContactBanner";
import ContactReachForm from "../components/Contact/ContactReachForm";
import ContactMap from "../components/Contact/ContactMap";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader/Loader";
import Header from "@/Admin/Header/Header";
import Footer from "@/Admin/Footer/Footer";

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
        return <Loader />;
    }

    return (
        <div>
            <SmoothScroll />
            <Header />
            <ContactBanner data={pageData} />
            <ContactMap data={pageData} />
            <ContactReachForm data={pageData} />
            <Footer />
        </div>
    );
}