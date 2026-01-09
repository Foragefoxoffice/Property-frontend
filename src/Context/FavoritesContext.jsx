
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from '@/Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { useLanguage } from '@/Language/LanguageContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { language } = useLanguage();
    // Initialize from localStorage
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('localFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Error parsing favorites from localStorage", e);
            return [];
        }
    });

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const labels = {
        adding: { en: "Adding to favorites...", vi: "Thêm vào mục yêu thích..." },
        removing: { en: "Removing from favorites...", vi: "Xóa khỏi mục yêu thích..." },
        sending: { en: "Sending Enquiry...", vi: "Đang gửi yêu cầu..." }
    };

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('localFavorites', JSON.stringify(favorites));
    }, [favorites]);

    const fetchFavorites = async () => {
        // No-op for API sync as we are local-first
        setLoading(false);
    };

    const addFavorite = async (property) => {
        if (!property) return false;
        if (typeof property === 'string') {
            console.error("addFavorite requires a property object, not an ID");
            CommonToaster('Error adding favorite', 'error');
            return false;
        }

        const propId = property._id || property.listingInformation?.listingInformationPropertyId;

        if (isFavorite(propId)) {
            CommonToaster('Property already in favorites', 'warning');
            return false;
        }

        const newFav = {
            _id: Date.now().toString(),
            property: property,
            createdAt: new Date().toISOString()
        };

        setFavorites(prev => [...prev, newFav]);
        CommonToaster('Added to favorites', 'success');
        return true;
    };

    const removeFavorite = async (propertyId) => {
        if (!propertyId) return false;

        setFavorites(prev => prev.filter(f => {
            const fPropId = f.property._id || f.property.listingInformation?.listingInformationPropertyId;
            return f._id !== propertyId && fPropId !== propertyId;
        }));

        CommonToaster('Removed from favorites', 'success');
        return true;
    };

    // New function to send enquiry (Sync to Backend)
    const sendEnquiry = async () => {
        if (favorites.length === 0) {
            CommonToaster('No favorites to send', 'warning');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            CommonToaster('Please login to send enquiry', 'error');
            return;
        }

        try {
            setActionLoading('sending');

            // Extract IDs
            const propertyIds = favorites.map(fav =>
                fav.property._id
                || fav.property.listingInformation?.listingInformationPropertyId
            ).filter(Boolean);

            if (propertyIds.length === 0) {
                CommonToaster('Invalid favorites data', 'error');
                return;
            }

            await apiAddFavorite(propertyIds);
            CommonToaster('Enquiry sent successfully', 'success');

        } catch (error) {
            console.error('Error sending enquiry:', error);
            CommonToaster('Error sending enquiry', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Helper to check if a property is favorited
    const isFavorite = (propertyId) => {
        return favorites.some(fav => {
            const fPropId = fav.property._id || fav.property.listingInformation?.listingInformationPropertyId;
            return fPropId === propertyId;
        });
    };

    return (
        <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite, fetchFavorites, sendEnquiry }}>
            {children}
            {actionLoading && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 border-4 border-white border-t-[#41398B] rounded-full animate-spin"></div>
                        <p className="text-white text-lg tracking-wide font-medium">
                            {actionLoading === 'sending' ? labels.sending[language] : (actionLoading === 'add' ? labels.adding[language] : labels.removing[language])}
                        </p>
                    </div>
                </div>
            )}
        </FavoritesContext.Provider>
    );
};
