import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LifeBuoy, Clock, Diamond, Award } from 'lucide-react';

export default function AboutWhyChoose({ data }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const title = data?.aboutWhyChooseDescription_en || "Experience The Difference With Our Solutions";
    const subTitle = data?.aboutWhyChooseTitle_en || "WHY CHOOSE US";
    const buttonText = data?.aboutWhyChooseButtonText_en || "Contact Us";
    const buttonLink = data?.aboutWhyChooseButtonLink || "/contact";

    const defaultBoxes = [
        {
            icon: "LifeBuoy",
            title_en: "Personalized Support",
            description_en: "Receive tailored assistance from our experienced team to ensure every step fits your specific needs and goals."
        },
        {
            icon: "Clock",
            title_en: "Time-Saving Process",
            description_en: "From quick callbacks to streamlined procedures, we value your time and help you move forward without delays."
        },
        {
            icon: "Diamond",
            title_en: "Trusted Expertise",
            description_en: "Work with professionals who bring deep industry knowledge and proven strategies to guide your decisions confidently."
        }
    ];

    const boxes = data?.aboutWhyChooseBoxes?.length > 0 ? data.aboutWhyChooseBoxes : defaultBoxes;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section ref={ref} className="py-20 px-6 bg-[#0B0B0B] overflow-hidden text-white">
            <div className="max-w-7xl mx-auto flex flex-col">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <span className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                            {subTitle}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            {title}
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link
                            to={buttonLink}
                            className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-[#41398B] hover:text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                        >
                            {buttonText}
                        </Link>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {boxes.map((box, index) => {
                        const IconComponent = (() => {
                            const normalized = box.icon?.toLowerCase() || "";
                            if (normalized.includes("time") || normalized.includes("clock")) return Clock;
                            if (normalized.includes("support") || normalized.includes("life")) return LifeBuoy;
                            if (normalized.includes("gem") || normalized.includes("gen") || normalized.includes("diamond") || normalized.includes("expert")) return Diamond;
                            if (normalized.includes("award")) return Award;
                            return Diamond;
                        })();

                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group flex flex-col items-start"
                            >
                                <div className={`
                                    w-25 h-25 rounded-full flex items-center justify-center mb-8 transition-all duration-500
                                    bg-transparent border border-white/20 group-hover:bg-[#41398B] group-hover:border-[#41398B] 
                                `}>
                                    <IconComponent
                                        className="w-12 h-12 text-white transition-colors duration-300"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <h3 className="text-3xl font-bold mb-4">
                                    {box.title_en || box.title}
                                </h3>

                                <p className="text-gray-400 text-lg leading-relaxed text-base group-hover:text-gray-300 transition-colors duration-300">
                                    {box.description_en || box.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>

            </div>
        </section>
    );
}