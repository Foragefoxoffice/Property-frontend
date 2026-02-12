import React, { useState, useEffect } from "react";
import {
    RefreshCw,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Globe,
    ExternalLink,
    Search,
    X,
    Plus,
    User
} from "lucide-react";
import {
    getAdminTestimonials,
    toggleTestimonialVisibility,
    deleteTestimonial,
    createTestimonial,
    uploadTestimonialImage,
    getHomePage,
    updateHomePage
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { translateError } from "../../utils/translateError";
import CommonSkeleton from "../../Common/CommonSkeleton";

export default function TestimonialsCms() {
    const { language, toggleLanguage } = useLanguage();
    const t = translations[language];

    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [homeData, setHomeData] = useState(null);
    const [updatingHeader, setUpdatingHeader] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Manual Form State
    const [manualForm, setManualForm] = useState({
        author_name: "",
        rating: 5,
        text_en: "",
        text_vn: "",
        relative_time_description: "New Review",
        profile_photo_url: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchTestimonials();
        fetchHomePageData();
    }, []);

    const fetchHomePageData = async () => {
        try {
            const res = await getHomePage();
            if (res.data.success) {
                setHomeData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch home page data", err);
        }
    };

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const res = await getAdminTestimonials();
            setTestimonials(res.data.data || []);
        } catch (err) {
            CommonToaster(t.failedToFetchTestimonials, "error");
        } finally {
            setLoading(false);
        }
    };


    const handleAddManual = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            let finalData = {
                ...manualForm,
                text: manualForm.text_en || manualForm.text_vn
            };

            if (selectedFile) {
                const uploadRes = await uploadTestimonialImage(selectedFile);
                if (uploadRes.data.success) {
                    finalData.profile_photo_url = uploadRes.data.url;
                }
            }

            await createTestimonial(finalData);
            CommonToaster(t.testimonialAdded, "success");
            setShowAddModal(false);
            setManualForm({
                author_name: "",
                rating: 5,
                text_en: "",
                text_vn: "",
                relative_time_description: "New Review",
                profile_photo_url: ""
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchTestimonials();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || t.failedToAddTestimonial;
            CommonToaster(translateError(msg, t), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSectionHeader = async (e) => {
        e.preventDefault();
        if (!homeData?._id) return;
        try {
            setUpdatingHeader(true);
            const payload = {
                ...homeData,
                homeTestimonialSubTitle_en: e.target.subTitle_en.value,
                homeTestimonialSubTitle_vn: e.target.subTitle_vn.value,
                homeTestimonialTitle_en: e.target.title_en.value,
                homeTestimonialTitle_vn: e.target.title_vn.value,
            };
            await updateHomePage(homeData._id, payload);
            CommonToaster(t.sectionHeadersUpdated, "success");
            fetchHomePageData();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || t.failedToUpdateSectionHeaders;
            CommonToaster(translateError(msg, t), "error");
        } finally {
            setUpdatingHeader(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleToggleVisibility = async (id) => {
        try {
            await toggleTestimonialVisibility(id);
            setTestimonials(testimonials.map(item =>
                item._id === id ? { ...item, is_visible: !item.is_visible } : item
            ));
            CommonToaster(t.visibilityUpdated, "success");
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || t.failedToUpdateVisibility;
            CommonToaster(translateError(msg, t), "error");
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteTestimonial(deleteId);
            setTestimonials(testimonials.filter(item => item._id !== deleteId));
            CommonToaster(t.testimonialDeleted, "success");
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || t.failedToDeleteTestimonial;
            CommonToaster(translateError(msg, t), "error");
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    const filteredTestimonials = testimonials.filter(item =>
        item.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.text_en?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.text_vn?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.text?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">{t.testimonials || "Testimonials"}</h1>
                        <p className="text-[#64748B]">{t.manageTestimonialsDesc || "Manage your testimonials display."}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-lg font-semibold transition-all shadow-sm"
                        >
                            <Plus className="w-5 h-5 text-[#41398B]" />
                            {t.addManual || "Add Manual"}
                        </button>
                    </div>
                </div>

                {/* Section Header Settings */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-[#1E293B]">{t.sectionSettings || "Section Settings"}</h3>
                            <p className="text-sm text-[#64748B]">{t.sectionSettingsDesc || "Update the headings shown on the Home Page."}</p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-[#F1F5F9] rounded-xl w-fit">
                            <button
                                type="button"
                                onClick={() => toggleLanguage("en")}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${language === "en" ? "bg-white text-[#41398B] shadow-sm" : "text-[#64748B] hover:text-[#41398B]"}`}
                            >
                                {t.english || "English"}
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleLanguage("vi")}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${language === "vi" ? "bg-white text-[#41398B] shadow-sm" : "text-[#64748B] hover:text-[#41398B]"}`}
                            >
                                {t.vietnamese || "Vietnamese"}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateSectionHeader} className="p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* English Fields */}
                            <div className={`space-y-4 animate-in fade-in duration-300 ${language === "en" ? "block" : "hidden"}`}>
                                <h4 className="text-xs font-black text-[#94A3B8] uppercase tracking-widest border-l-2 border-[#41398B] pl-2">{t.englishContent || "English Content"}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#64748B] mb-1">{t.subTitle || "Sub-Title"}</label>
                                        <input
                                            name="subTitle_en"
                                            defaultValue={homeData?.homeTestimonialSubTitle_en || ""}
                                            placeholder="e.g. OUR HAPPY CUSTOMERS"
                                            className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#64748B] mb-1">{t.mainTitle || "Main Title"}</label>
                                        <input
                                            name="title_en"
                                            defaultValue={homeData?.homeTestimonialTitle_en || ""}
                                            placeholder="e.g. What They Say About Us"
                                            className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 outline-none transition-all text-sm font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vietnamese Fields */}
                            <div className={`space-y-4 animate-in fade-in duration-300 ${language === "vi" ? "block" : "hidden"}`}>
                                <h4 className="text-xs font-black text-[#94A3B8] uppercase tracking-widest border-l-2 border-red-500 pl-2">{t.vietnameseContent || "Vietnamese Content"}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#64748B] mb-1">{t.subTitle || "Sub-Title"} (VN)</label>
                                        <input
                                            name="subTitle_vn"
                                            defaultValue={homeData?.homeTestimonialSubTitle_vn || ""}
                                            placeholder="e.g. KHÁCH HÀNG HÀI LÒNG"
                                            className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#64748B] mb-1">{t.mainTitle || "Main Title"} (VN)</label>
                                        <input
                                            name="title_vn"
                                            defaultValue={homeData?.homeTestimonialTitle_vn || ""}
                                            placeholder="e.g. Họ Nói Gì Về Chúng Tôi"
                                            className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 outline-none transition-all text-sm font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="mt-6 flex justify-between items-center bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                            <p className="text-xs text-[#64748B] font-medium italic">{t.saveNote || "Changes will reflect immediately on the live home page after saving."}</p>
                            <button
                                type="submit"
                                disabled={updatingHeader}
                                className="px-8 py-3 bg-[#41398B] text-white rounded-lg font-semibold hover:bg-[#41398be3] transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-lg shadow-[#41398B]/20"
                            >
                                {updatingHeader ? <RefreshCw className="w-5 h-5 animate-spin" /> : (t.saveChanges || "Save Changes")}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Filters & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder || "Search by author or content..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Testimonials List */}
                {loading ? (
                    <CommonSkeleton rows={4} />
                ) : filteredTestimonials.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTestimonials.map((item) => (
                            <div
                                key={item._id}
                                className={`bg-white rounded-2xl border border-[#E2E8F0] p-6 transition-all hover:shadow-md ${!item.is_visible ? 'opacity-75 bg-[#F8FAFC]' : ''}`}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Author Info */}
                                    <div className="flex-shrink-0 flex items-start gap-4 md:w-64">
                                        <div className="relative">
                                            <img
                                                src={item.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author_name)}`}
                                                alt={item.author_name}
                                                className="w-16 h-16 rounded-full border-2 border-[#F1F5F9] object-cover"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                                {item.source === 'google' ? (
                                                    <Globe className="w-4 h-4 text-[#41398B]" />
                                                ) : (
                                                    <User className="w-4 h-4 text-[#64748B]" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#1E293B] leading-tight truncate w-40">{item.author_name}</h3>
                                            <p className="text-xs text-[#94A3B8] mt-1">{item.relative_time_description}</p>
                                            <div className="flex items-center gap-1 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < item.rating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E2E8F0]'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <p className="text-[#475569] leading-relaxed italic">
                                            "{language === 'en' ? (item.text_en || item.text) : (item.text_vn || item.text)}"
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center md:flex-col justify-end gap-2 md:w-24">
                                        <button
                                            onClick={() => handleToggleVisibility(item._id)}
                                            title={item.is_visible ? "Hide Review" : "Show Review"}
                                            className={`p-3 cursor-pointer rounded-xl transition-all ${item.is_visible ? 'bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]' : 'bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFEDD5]'}`}
                                        >
                                            {item.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item._id)}
                                            title="Delete Review"
                                            className="p-3 cursor-pointer bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        {item.author_url && (
                                            <a
                                                href={item.author_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] rounded-xl transition-all"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-[#E2E8F0] p-20 text-center">
                        <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="text-[#CBD5E1] w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1E293B] mb-2">{t.noTestimonialsFound || "No testimonials found"}</h3>
                        <p className="text-[#64748B] mb-8">{t.addTestimonialManually || "Add a testimonial manually."}</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[#41398B] text-white rounded-xl font-semibold transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                {t.addManual || "Add Manual"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 mt-8 rounded-2xl border border-[#E2E8F0] flex items-center justify-between shadow-sm hover:shadow-md transition-all max-w-md mx-auto">
                <div className="flex flex-col">
                    <p className="text-sm text-[#64748B] font-semibold uppercase tracking-wider mb-1">{t.totalTestimonials || "Total Testimonials"}</p>
                    <p className="text-3xl font-black text-[#1E293B]">{testimonials.length}</p>
                </div>
                <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                    <Star className="text-[#F59E0B] fill-[#F59E0B] w-8 h-8" />
                </div>
            </div>

            {/* Add Manual Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-[#1E293B]">{t.addManualTestimonial || "Add Manual Testimonial"}</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-[#F1F5F9] rounded-full transition-all"
                                >
                                    <X className="w-5 h-5 text-[#94A3B8]" />
                                </button>
                            </div>

                            <form onSubmit={handleAddManual} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">{t.authorNameLabel || "Author Name"}</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter customer name"
                                        value={manualForm.author_name}
                                        onChange={(e) => setManualForm({ ...manualForm, author_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">{t.authorPhotoLabel || "Author Photo (Optional)"}</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-18 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-[#E2E8F0] flex items-center justify-center">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-[#64748B] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F1F5F9] file:text-[#41398B] hover:file:bg-[#E2E8F0] cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">{t.ratingLabel || "Rating"}</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setManualForm({ ...manualForm, rating: num })}
                                                className={`p-2 rounded-lg transition-all ${manualForm.rating >= num ? 'text-[#F59E0B]' : 'text-[#E2E8F0]'}`}
                                            >
                                                <Star className={`w-6 h-6 ${manualForm.rating >= num ? 'fill-[#F59E0B]' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">{t.contentEnLabel || "Testimonial Content (English)"}</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Write the testimonial in English..."
                                        value={manualForm.text_en}
                                        onChange={(e) => setManualForm({ ...manualForm, text_en: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">{t.contentVnLabel || "Testimonial Content (Vietnamese)"}</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Write the testimonial in Vietnamese..."
                                        value={manualForm.text_vn}
                                        onChange={(e) => setManualForm({ ...manualForm, text_vn: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="flex-1 px-6 py-3 border border-[#E2E8F0] text-[#64748B] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-all"
                                    >
                                        {t.cancel || "Cancel"}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 bg-[#41398B] text-white font-semibold rounded-xl hover:bg-[#41398be3] transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : (t.saveTestimonial || "Save Testimonial")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#1E293B] mb-2 font-['Manrope']">{t.areYouSure || "Are you sure?"}</h2>
                            <p className="text-[#64748B] mb-8 font-['Manrope']">
                                {t.deleteTestimonialDesc || "This action cannot be undone. This testimonial will be permanently removed from your website."}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 cursor-pointer px-6 py-3 border border-[#E2E8F0] text-[#64748B] font-bold rounded-xl hover:bg-[#F8FAFC] transition-all font-['Manrope']"
                                >
                                    {t.cancel || "Cancel"}
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 cursor-pointer px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 font-['Manrope']"
                                >
                                    {t.delete || "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}