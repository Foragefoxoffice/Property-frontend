import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Phone } from 'lucide-react';
import { useLanguage } from '../../Language/LanguageContext';
import { translations } from '../../Language/translations';

export default function ProjectForm({ projectName, projectId }) {
    const { language } = useLanguage();
    const t = translations[language];

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone) {
            toast.error(t.fillRequiredFields || "Please fill in required fields (*)");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/project-enquiry`, {
                ...formData,
                projectName,
                projectId
            });
            toast.success(t.registrationSuccess || "Registration successful!");
            setFormData({ fullName: '', phone: '', message: '' });
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            toast.error(t.genericError || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative py-16 px-4 overflow-hidden">
            {/* Background with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000')`,
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto text-center text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-wider uppercase">
                    {t.projectEnquiryTitle}
                </h2>

                <div className="flex items-center justify-center gap-2 mb-10 text-lg md:text-xl font-medium">
                    <Phone className="w-5 h-5 fill-white" />
                    <span>{t.hotlineLabel}: 0909.769.666</span>
                </div>

                <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-0 rounded-lg overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md">
                        <input
                            type="text"
                            name="fullName"
                            placeholder={t.fullNamePlaceholder}
                            value={formData.fullName}
                            onChange={handleChange}
                            className="flex-1 px-6 py-4 bg-transparent border-b md:border-b-0 md:border-r border-white/30 outline-none placeholder:text-gray-300 text-white font-medium"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder={t.phonePlaceholder}
                            value={formData.phone}
                            onChange={handleChange}
                            className="flex-1 px-6 py-4 bg-transparent border-b md:border-b-0 md:border-r border-white/30 outline-none placeholder:text-gray-300 text-white font-medium"
                            required
                        />
                        <input
                            type="text"
                            name="message"
                            placeholder={t.messagePlaceholder}
                            value={formData.message}
                            onChange={handleChange}
                            className="flex-[1.5] px-6 py-4 bg-transparent border-b md:border-b-0 outline-none placeholder:text-gray-300 text-white font-medium"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 bg-[#41398B] hover:bg-white hover:text-black text-white font-bold transition-all duration-300 uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? (t.registering || "Registering...") : (t.registerBtn || "REGISTER")}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-sm md:text-base text-gray-300 font-medium">
                    {t.confidentialityNotice}
                </p>
            </div>
        </section>
    );
}