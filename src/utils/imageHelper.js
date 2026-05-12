export const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"; // Default placeholder

    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    // Normalize slashes
    let normalizedPath = imagePath.replace(/\\/g, '/');

    const baseURL = import.meta.env.VITE_API_URL || 'https://api.183housingsolutions.com/api/v1';
    // Remove /api/v1 to get the base server URL
    const serverURL = baseURL.replace('/api/v1', '').replace(/\/$/, '');

    // Ensure normalizedPath doesn't have redundant server part if it was somehow stored partially
    if (normalizedPath.startsWith('/uploads')) {
        return `${serverURL}${normalizedPath}`;
    }

    return `${serverURL}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
};

