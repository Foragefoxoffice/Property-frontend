import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";
import { submitTestimonial, getMe } from "../Api/action";
import { CommonToaster } from "../Common/CommonToaster";
import { useLanguage } from "../Language/LanguageContext";
import { translations } from "../Language/translations";

export default function GiveTestimonial() {
    const { language } = useLanguage();
    const t = translations[language];

    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await getMe();
                if (res.data.success) {
                    setUserData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) {
            CommonToaster("Please enter your testimonial", "error");
            return;
        }

        setLoading(true);
        try {
            // Automatically use the user's existing profile image
            const profile_photo_url = userData?.profileImage || "";

            await submitTestimonial({
                rating,
                text,
                profile_photo_url
            });

            CommonToaster(t.testimonialSubmitted, "success");
            setText("");
            setRating(5);
        } catch (error) {
            console.error("Error submitting testimonial:", error);
            CommonToaster(error.response?.data?.error || "Failed to submit testimonial", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{t.giveTestimonial}</h1>
                <p className="text-gray-500">Share your experience with us. Your feedback helps us improve.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                        {/* Rating */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">{t.rating}</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={`${(hover || rating) >= star
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            {/* Testimonial Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t.testimonialContent}
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        rows={6}
                                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all resize-none"
                                        placeholder="Write your testimonial here..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-50">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-lg font-bold transition-all disabled:opacity-70 shadow-xl shadow-[#41398B]/20 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {t.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
