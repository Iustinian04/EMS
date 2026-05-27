import { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        axiosInstance.get('/Profile').then(res => setProfile(res.data)).finally(() => setLoading(false));
    }, [user]);

    if (!user) return <Navigate to="/login" />;
    if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-400">Se încarcă...</p>;

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axiosInstance.post('/Profile/change-password', { currentPassword, newPassword });
            setIsError(false);
            setMessage('Parola a fost schimbată.');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.title || 'Eroare.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Card className="p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profilul meu</h2>
                {profile && (
                    <div className="grid gap-4 mb-8">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Username</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">@{profile.username || user?.username}</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Nume complet</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{profile.fullName}</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Email</div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{profile.email}</div>
                        </div>
                        {profile.role === 'Admin' && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">Rol</div>
                                <div className="font-semibold text-blue-900 dark:text-blue-100">{profile.role}</div>
                            </div>
                        )}
                    </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Schimbă parola</h3>
                {message && (
                    <div className={`mb-4 p-4 rounded-lg border ${isError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                        <p className={`text-sm ${isError ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>{message}</p>
                    </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Parola curentă"
                        required
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Parola nouă"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        Actualizează
                    </Button>
                </form>
            </Card>
        </div>
    );
}
