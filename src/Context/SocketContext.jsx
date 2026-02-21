import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection - Ensure we use the base URL, not the /api/v1 path
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const socketTarget = apiUrl.replace(/\/api\/v1\/?$/, '') || apiUrl;

        const socketInstance = io(socketTarget, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket.IO connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket.IO disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        // 🚨 LISTEN FOR ACCOUNT DEACTIVATION
        socketInstance.on('accountDeactivated', ({ userId }) => {
            const currentUserId = localStorage.getItem('userId');
            console.log(`🔌 Deactivation event received for: ${userId}. Current: ${currentUserId}`);

            if (userId === currentUserId) {
                console.error("⛔ Your account has been deactivated. Logging out...");

                // Clear all auth data
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("userName");
                localStorage.removeItem("userRole");

                // Redirect to login with a message
                window.location.href = "/login?error=inactive";
            }
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
