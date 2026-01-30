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
    syncGoogleReviews,
    toggleTestimonialVisibility,
    deleteTestimonial,
    createTestimonial
} from "../../Api/action";
import { CommonToaster } from "../../Common/CommonToaster";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import CommonSkeleton from "../../Common/CommonSkeleton";

export default function TestimonialsCms() {
    const { language, toggleLanguage } = useLanguage();
    const t = translations[language];

    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Sync Form State
    const [syncForm, setSyncForm] = useState({
        apiKey: "",
        placeId: ""
    });

    // Manual Form State
    const [manualForm, setManualForm] = useState({
        author_name: "",
        rating: 5,
        text: "",
        relative_time_description: "New Review"
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const res = await getAdminTestimonials();
            setTestimonials(res.data.data || []);
        } catch (err) {
            CommonToaster("Failed to fetch testimonials", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (e) => {
        e.preventDefault();
        try {
            setSyncing(true);
            const res = await syncGoogleReviews(syncForm);
            CommonToaster(res.data.message || "Synced successfully", "success");
            setShowSyncModal(false);
            fetchTestimonials();
        } catch (err) {
            CommonToaster(err.response?.data?.error || "Sync failed", "error");
        } finally {
            setSyncing(false);
        }
    };

    const handleAddManual = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await createTestimonial(manualForm);
            CommonToaster("Testimonial added", "success");
            setShowAddModal(false);
            setManualForm({ author_name: "", rating: 5, text: "", relative_time_description: "New Review" });
            fetchTestimonials();
        } catch (err) {
            CommonToaster("Failed to add testimonial", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleVisibility = async (id) => {
        try {
            await toggleTestimonialVisibility(id);
            setTestimonials(testimonials.map(item =>
                item._id === id ? { ...item, is_visible: !item.is_visible } : item
            ));
            CommonToaster("Visibility updated", "success");
        } catch (err) {
            CommonToaster("Failed to update visibility", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this testimonial?")) return;

        try {
            await deleteTestimonial(id);
            setTestimonials(testimonials.filter(item => item._id !== id));
            CommonToaster("Testimonial deleted", "success");
        } catch (err) {
            CommonToaster("Failed to delete testimonial", "error");
        }
    };

    const filteredTestimonials = testimonials.filter(item =>
        item.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">{t.testimonials || "Testimonials"}</h1>
                        <p className="text-[#64748B]">Manage your Google Reviews and testimonials display.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        {/* Language Switch */}
                        <div className="flex items-center gap-1 rounded-2xl bg-white border border-[#E2E8F0] p-1.5 shadow-sm">
                            <button
                                onClick={() => toggleLanguage("en")}
                                className={`h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${language === "en" ? "bg-[#41398B] text-white shadow-md shadow-[#41398B]/20" : "hover:bg-[#F1F5F9] text-[#64748B]"}`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" className="rounded-full overflow-hidden">
                                    <rect width="24" height="24" fill="#012169" />
                                    <line x1="0" y1="0" x2="24" y2="24" stroke="#FFF" strokeWidth="6" />
                                    <line x1="24" y1="0" x2="0" y2="24" stroke="#FFF" strokeWidth="6" />
                                    <line x1="0" y1="0" x2="24" y2="24" stroke="#C8102E" strokeWidth="3" />
                                    <line x1="24" y1="0" x2="0" y2="24" stroke="#C8102E" strokeWidth="3" />
                                    <line x1="12" y1="0" x2="12" y2="24" stroke="#FFF" strokeWidth="6" />
                                    <line x1="0" y1="12" x2="24" y2="12" stroke="#FFF" strokeWidth="6" />
                                    <line x1="12" y1="0" x2="12" y2="24" stroke="#C8102E" strokeWidth="4" />
                                    <line x1="0" y1="12" x2="24" y2="12" stroke="#C8102E" strokeWidth="4" />
                                </svg>
                                <span className="text-sm font-bold uppercase tracking-wider">EN</span>
                            </button>
                            <button
                                onClick={() => toggleLanguage("vi")}
                                className={`h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${language === "vi" ? "bg-[#41398B] text-white shadow-md shadow-[#41398B]/20" : "hover:bg-[#F1F5F9] text-[#64748B]"}`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" className="rounded-full overflow-hidden">
                                    <rect width="24" height="24" fill="#DA251D" />
                                    <polygon fill="#FFCE00" points="12.000,4.500 13.763,9.573 19.133,9.682 14.853,12.927 16.408,18.068 12.000,15.000 7.592,18.068 9.147,12.927 4.867,9.682 10.237,9.573" />
                                </svg>
                                <span className="text-sm font-bold uppercase tracking-wider">VN</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-xl font-semibold transition-all shadow-sm"
                        >
                            <Plus className="w-5 h-5 text-[#41398B]" />
                            Add Manual
                        </button>
                        <button
                            onClick={() => setShowSyncModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#41398B] hover:bg-[#41398be3] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-[#41398B]/20"
                        >
                            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                            Sync Google Reviews
                        </button>
                    </div>
                </div>

                {/* Filters & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by author or content..."
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
                                        <p className="text-[#475569] leading-relaxed italic">"{item.text}"</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center md:flex-col justify-end gap-2 md:w-24">
                                        <button
                                            onClick={() => handleToggleVisibility(item._id)}
                                            title={item.is_visible ? "Hide Review" : "Show Review"}
                                            className={`p-3 rounded-xl transition-all ${item.is_visible ? 'bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5]' : 'bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFEDD5]'}`}
                                        >
                                            {item.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            title="Delete Review"
                                            className="p-3 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] rounded-xl transition-all"
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
                        <h3 className="text-xl font-bold text-[#1E293B] mb-2">No testimonials found</h3>
                        <p className="text-[#64748B] mb-8">Try syncing with Google Reviews or add one manually.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-xl font-semibold transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Add Manual
                            </button>
                            <button
                                onClick={() => setShowSyncModal(true)}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[#41398B] text-white rounded-xl font-semibold transition-all"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Sync Google
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 mt-8 rounded-2xl border border-[#E2E8F0] flex items-center justify-between shadow-sm hover:shadow-md transition-all max-w-md mx-auto">
                <div className="flex flex-col">
                    <p className="text-sm text-[#64748B] font-semibold uppercase tracking-wider mb-1">Total Testimonials</p>
                    <p className="text-3xl font-black text-[#1E293B]">{testimonials.length}</p>
                </div>
                <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
                    <Star className="text-[#F59E0B] fill-[#F59E0B] w-8 h-8" />
                </div>
            </div>

            {/* Sync Modal */}
            {showSyncModal && (
                <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-[#1E293B]">Sync Google Reviews</h2>
                                <button
                                    onClick={() => setShowSyncModal(false)}
                                    className="p-2 hover:bg-[#F1F5F9] rounded-full transition-all"
                                >
                                    <X className="w-5 h-5 text-[#94A3B8]" />
                                </button>
                            </div>

                            <form onSubmit={handleSync} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">Google Places API Key</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Enter your API key"
                                        value={syncForm.apiKey}
                                        onChange={(e) => setSyncForm({ ...syncForm, apiKey: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-[#94A3B8] mt-1.5">* Ensure "Places API" is enabled in Google Cloud Console.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">Google Place ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter Place ID (e.g. ChIJ...)"
                                        value={syncForm.placeId}
                                        onChange={(e) => setSyncForm({ ...syncForm, placeId: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all"
                                    />
                                    <a
                                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-[#41398B] underline mt-1.5 inline-block"
                                    >
                                        Find your Place ID
                                    </a>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSyncModal(false)}
                                        className="flex-1 px-6 py-3 border border-[#E2E8F0] text-[#64748B] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={syncing}
                                        className="flex-1 px-6 py-3 bg-[#41398B] text-white font-semibold rounded-xl hover:bg-[#41398be3] transition-all flex items-center justify-center gap-2"
                                    >
                                        {syncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Start Sync"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Manual Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-[#1E293B]">Add Manual Testimonial</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-[#F1F5F9] rounded-full transition-all"
                                >
                                    <X className="w-5 h-5 text-[#94A3B8]" />
                                </button>
                            </div>

                            <form onSubmit={handleAddManual} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">Author Name</label>
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
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">Rating</label>
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
                                    <label className="block text-sm font-semibold text-[#475569] mb-2">Testimonial Content</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Write the testimonial here..."
                                        value={manualForm.text}
                                        onChange={(e) => setManualForm({ ...manualForm, text: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-6 py-3 border border-[#E2E8F0] text-[#64748B] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 bg-[#41398B] text-white font-semibold rounded-xl hover:bg-[#41398be3] transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Save Testimonial"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}