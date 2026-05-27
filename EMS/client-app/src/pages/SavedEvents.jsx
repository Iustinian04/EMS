import { useEffect, useState, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import EmptyState from '../components/ui/EmptyState';

export default function SavedEvents() {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        axiosInstance.get('/Favorites/events').then(res => {
            setEvents(res.data);
            setFavoriteIds(res.data.map(e => e.id));
        }).finally(() => setLoading(false));
    }, [user]);

    const handleToggleFavorite = async (eventId) => {
        const res = await axiosInstance.post(`/Favorites/${eventId}/toggle`);
        if (!res.data.isFavorite) setEvents(prev => prev.filter(e => e.id !== eventId));
        setFavoriteIds(prev => res.data.isFavorite ? [...prev, eventId] : prev.filter(id => id !== eventId));
    };

    if (!user) return <Navigate to="/login" />;
    if (loading) return <p className="text-center py-10 text-gray-600 dark:text-gray-400">Se încarcă...</p>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Evenimente salvate</h2>
            {events.length === 0 ? (
                <EmptyState 
                    title="Niciun eveniment salvat" 
                    description="Apasă ☆ pe un eveniment pentru a-l salva." 
                    action={<Link to="/" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">Explorează evenimente</Link>} 
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map(evt => (
                        <EventCard key={evt.id} evt={evt} user={user} isEnrolled={false} isOnWaitlist={false} isFavorite={favoriteIds.includes(evt.id)}
                            onEnroll={() => {}} onJoinWaitlist={() => {}} onToggleFavorite={handleToggleFavorite} showFavorite />
                    ))}
                </div>
            )}
        </div>
    );
}
