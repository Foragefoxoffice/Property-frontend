import React, { useEffect, useState } from 'react';
import { getFavorites, removeFavorite } from '@/Api/action';
import { Heart, Trash2, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { CommonToaster } from '@/Common/CommonToaster';
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';
import { Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/Language/LanguageContext';

export default function Favorites() {
    const { language } = useLanguage();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const res = await getFavorites();
            if (res.data.success) {
                setFavorites(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            // If 401, action.js handles redirect, but we might want to show a message if it didn't
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await removeFavorite(deleteId); // Remove by Property ID logic I wrote in Logic
            // But wait, the list has Favourite objects. My backend logic handled both.
            // Let's pass the property ID to be safe if that's what backend expects or handle carefully.
            // Backend `removeFavorite` tries to find by PropertyID first.
            // Here dealing with `fav.property`.

            setFavorites(prev => prev.filter(f => f.property._id !== deleteId));
            CommonToaster(t.removedSuccess, 'success');
            setDeleteId(null);
        } catch (error) {
            CommonToaster(t.removeFail, 'error');
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.en || value.vi || '';
    };

    const translations = {
        en: {
            pageTitle: "My Favorites",
            listing: "Listing",
            datePublished: "Date Published",
            action: "Action",
            noFavorites: "No favorites yet",
            noFavoritesDesc: "Start exploring and save properties you love to your favorites list.",
            browseProperties: "Browse Properties",
            postingDate: "Posting date:",
            contactForPrice: "Contact for Price",
            delete: "Delete",
            removeFromFavorites: "Remove from Favorites",
            deleteConfirmation: "Are you sure you want to remove this property from your favorites?",
            cancel: "Cancel",
            remove: "Remove",
            locationNA: "Location N/A",
            untitledProperty: "Untitled Property",
            removedSuccess: "Removed from favorites",
            removeFail: "Failed to remove favorite"
        },
        vi: {
            pageTitle: "Mục Yêu Thích",
            listing: "Danh Sách",
            datePublished: "Ngày Đăng",
            action: "Hành Động",
            noFavorites: "Chưa có mục yêu thích",
            noFavoritesDesc: "Bắt đầu khám phá và lưu các bất động sản bạn yêu thích vào danh sách.",
            browseProperties: "Xem Bất Động Sản",
            postingDate: "Ngày đăng:",
            contactForPrice: "Liên hệ giá",
            delete: "Xóa",
            removeFromFavorites: "Xóa khỏi Yêu Thích",
            deleteConfirmation: "Bạn có chắc chắn muốn xóa bất động sản này khỏi danh sách yêu thích?",
            cancel: "Hủy",
            remove: "Xóa",
            locationNA: "Vị trí không xác định",
            untitledProperty: "Bất động sản chưa có tên",
            removedSuccess: "Đã xóa khỏi danh sách yêu thích",
            removeFail: "Xóa thất bại"
        }
    };

    const t = translations[language] || translations.en;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.pageTitle}</h1>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-12 font-bold text-[14px] md:col-span-6">Listing</div>
                            <div className="col-span-6 md:col-span-3 font-bold text-[14px] text-center hidden md:block">Date Published</div>
                            <div className="col-span-6 md:col-span-3 font-bold text-[14px] text-right">Action</div>
                        </div>

                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton.Image active className="!w-32 !h-24 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton active paragraph={{ rows: 2 }} title={false} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : favorites.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4">
                                <div className="bg-gray-50 rounded-full p-4 mb-4">
                                    <Heart size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">{t.noFavorites}</h3>
                                <p className="text-gray-500 mt-1 mb-6 text-center max-w-sm">
                                    {t.noFavoritesDesc}
                                </p>
                                <Link
                                    to="/listing"
                                    className="px-6 py-2.5 bg-[#41398B] text-white rounded-lg hover:bg-[#352e7a] transition-colors font-medium text-sm"
                                >
                                    {t.browseProperties}
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {favorites.map((fav) => {
                                    const prop = fav.property;
                                    if (!prop) return null; // Handle weird cases

                                    const price = prop.financialDetails?.financialDetailsPrice;
                                    const leasePrice = prop.financialDetails?.financialDetailsLeasePrice;
                                    const nightPrice = prop.financialDetails?.financialDetailsPricePerNight;

                                    const type = getLocalizedValue(prop.listingInformation?.listingInformationTransactionType);

                                    let displayPrice = t.contactForPrice;
                                    if (type === 'Sale' && price) displayPrice = `₫ ${Number(price).toLocaleString()}`;
                                    else if (type === 'Lease' && leasePrice) displayPrice = `₫ ${Number(leasePrice).toLocaleString()} / month`;
                                    else if (type === 'Home Stay' && nightPrice) displayPrice = `$ ${Number(nightPrice).toLocaleString()} / night`;
                                    else if (price) displayPrice = `₫ ${Number(price).toLocaleString()}`;

                                    return (
                                        <div key={fav._id} className="grid grid-cols-12 gap-4 px-6 py-6 items-center hover:bg-gray-50/50 transition-colors">
                                            {/* Listing Column */}
                                            <div className="col-span-12 md:col-span-6 flex gap-5">
                                                <Link to={`/property-showcase/${prop.listingInformation?.listingInformationPropertyId || prop._id}`} className="flex-shrink-0">
                                                    <img
                                                        src={prop.imagesVideos?.propertyImages?.[0] || '/images/property/dummy-img.avif'}
                                                        alt="Property"
                                                        className="w-32 h-24 object-cover rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                                    />
                                                </Link>
                                                <div className="flex flex-col justify-center gap-1">
                                                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                                                        <Link to={`/property-showcase/${prop.listingInformation?.listingInformationPropertyId || prop._id}`} className="hover:text-[#41398B] transition-colors text-[24px]">
                                                            {getLocalizedValue(prop.listingInformation?.listingInformationPropertyTitle) || t.untitledProperty}
                                                        </Link>
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin size={12} />
                                                        <span className="line-clamp-1 text-[16px]">
                                                            {getLocalizedValue(prop.listingInformation?.listingInformationProjectCommunity) ||
                                                                getLocalizedValue(prop.listingInformation?.listingInformationZoneSubArea) || t.locationNA}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        {t.postingDate} <span className="text-gray-700 font-medium">{formatDate(prop.listingInformation?.listingInformationDateListed || prop.createdAt)}</span>
                                                    </p>
                                                    <p className="text-[#41398B] font-bold mt-1 text-lg">
                                                        {displayPrice}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date Published Column */}
                                            <div className="col-span-6 md:col-span-3 text-center hidden md:block">
                                                <span className="text-sm text-gray-600 font-medium">
                                                    {formatDate(prop.updatedAt || prop.createdAt)}
                                                </span>
                                            </div>

                                            {/* Action Column */}
                                            <div className="col-span-12 md:col-span-3 flex justify-end">
                                                <button
                                                    onClick={() => confirmDelete(prop._id)}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group text-sm font-medium"
                                                >
                                                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                                    {t.delete}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Custom Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <div className="flex items-center mb-4 text-red-600">
                            <div className="bg-red-50 p-2 rounded-full mr-3">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">
                                {t.removeFromFavorites}
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {t.deleteConfirmation}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition duration-200"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-sm transition duration-200"
                            >
                                {t.remove}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
