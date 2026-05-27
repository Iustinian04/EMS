import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext'; 
import axiosInstance from '../api/axiosConfig';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && user) {
            const needsUpdate = !user.fullName || !user.firstName;
            if (needsUpdate) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                axiosInstance.get('/Profile').then(res => {
                    const p = res.data || {};
                    const username = p.userName ?? p.username ?? p.UserName ?? user.username ?? '';
                    const firstName = p.firstName ?? p.FirstName ?? '';
                    const lastName = p.lastName ?? p.LastName ?? '';
                    const fullName = p.fullName ?? p.FullName ?? `${firstName} ${lastName}`.trim() ?? '';

                    const updated = { ...user, username, firstName, lastName, fullName };
                    localStorage.setItem('user', JSON.stringify(updated));
                    setUser(updated);
                }).catch(() => { });
            }
        }
    }, []);

    const login = async (email, password) => {
        try {
            let actualUsername = email;
            try {
                const userRes = await axiosInstance.get(`/auth/get-username?email=${encodeURIComponent(email)}`);
                if (userRes.data && userRes.data.username) {
                    actualUsername = userRes.data.username; 
                }
            } catch (err) {
                // If it doesn't find the email, we let it move on to receive the native error
            }

            const response = await axiosInstance.post('/auth/login', { email: actualUsername, password });
            const { accessToken } = response.data;

            localStorage.setItem('token', accessToken);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            let role = 'User';
            let profile = {};

            try {
                const roleResponse = await axiosInstance.get('/Setup/my-role');
                role = roleResponse.data?.role || roleResponse.data?.Role || 'User';
            } catch (roleErr) {
                console.warn("Nu s-a putut obține rolul. Se aplică rolul implicit 'User'.");
            }

            try {
                const profileResponse = await axiosInstance.get('/Profile');
                profile = profileResponse.data || {};
            } catch (profileErr) {
                console.warn("Nu s-a putut obține profilul momentan.");
            }

            const username = profile.userName ?? profile.username ?? profile.UserName ?? actualUsername;
            const firstName = profile.firstName ?? profile.FirstName ?? '';
            const lastName = profile.lastName ?? profile.LastName ?? '';
            const fullName = profile.fullName ?? profile.FullName ?? `${firstName} ${lastName}`.trim();

            const userObj = {
                email, 
                role,
                username,
                firstName,
                lastName,
                fullName: fullName !== '' ? fullName : 'Cont Nou'
            };

            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);

            return { success: true };
        } catch (error) {
            console.error("Eroare reală la login:", error);
            localStorage.removeItem('token');

            const errorMsg = error.response?.data?.title || error.response?.data?.detail || 'Email sau parolă incorectă.';

            return {
                success: false,
                message: errorMsg
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
        window.location.href = '/login';
        axiosInstance.post('/auth/logout').catch(() => { });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}