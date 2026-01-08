
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from '@/Api/action';
import { CommonToaster } from '@/Common/CommonToaster';
import { useLanguage } from '@/Language/LanguageContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { language } = useLanguage();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const labels = {
        adding: { en: "Adding to favorites...", vi: "Thêm vào mục yêu thích..." },
        removing: { en: "Removing from favorites...", vi: "Xóa khỏi mục yêu thích..." }
    };

    const fetchFavorites = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setFavorites([]);
            return;
        }
        try {
            setLoading(true);
            const res = await getFavorites();
            if (res.data.success) {
                setFavorites(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const addFavorite = async (propertyId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            CommonToaster('Please login to add favorites', 'error');
            return false;
        }
        try {
            setActionLoading('add');
            await apiAddFavorite(propertyId);
            await fetchFavorites();
            CommonToaster('Added to favorites', 'success');
            return true;
        } catch (error) {
            console.error('Error adding favorite:', error);
            const msg = error.response?.data?.error || 'Failed to add favorite';
            CommonToaster(msg, 'error');
            return false;
        } finally {
            setActionLoading(null);
        }
    };

    const removeFavorite = async (propertyId) => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            setActionLoading('remove');
            await apiRemoveFavorite(propertyId);
            setFavorites(prev => prev.filter(f => (f.property._id || f.property) !== propertyId));
            CommonToaster('Removed from favorites', 'error');
            return true;
        } catch (error) {
            console.error('Error removing favorite:', error);
            CommonToaster('Failed to remove favorite', 'error');
            return false;
        } finally {
            setActionLoading(null);
        }
    };

    // Helper to check if a property is favorited
    const isFavorite = (propertyId) => {
        return favorites.some(fav => (fav.property._id || fav.property) === propertyId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite, fetchFavorites }}>
            {children}
            {actionLoading && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 border-4 border-white border-t-[#41398B] rounded-full animate-spin"></div>
                        <p className="text-white text-lg tracking-wide font-medium">
                            {actionLoading === 'add' ? labels.adding[language] : labels.removing[language]}
                        </p>
                    </div>
                </div>
            )}
        </FavoritesContext.Provider>
    );
};
