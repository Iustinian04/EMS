import { useEffect, useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axiosInstance from '../api/axiosConfig';
import EventCard from '../components/EventCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [myEnrolledIds, setMyEnrolledIds] = useState([]);
    const [myWaitlistIds, setMyWaitlistIds] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const toast = useToast();
    const showToast = toast?.showToast;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [enrollStatus, setEnrollStatus] = useState({ eventId: null, message: '', isError: false });

    const { user } = useContext(AuthContext);

    const cachedUser = JSON.parse(localStorage.getItem('user'));
    const currentUserRole = cachedUser?.role || 'User';

    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filteredEvents = useMemo(() => {
        return events.filter((evt) => {
            const matchesCategory = !selectedCategoryId ||
                String(evt.categoryId) === String(selectedCategoryId);

            if (!normalizedSearch) {
                return matchesCategory;
            }

            const haystack = [
                evt.title,
                evt.description,
                evt.categoryName,
                evt.venueName
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesSearch = haystack.includes(normalizedSearch);
            return matchesCategory && matchesSearch;
        });
    }, [events, selectedCategoryId, normalizedSearch]);

    const hasActiveFilters = normalizedSearch.length > 0 || selectedCategoryId !== '';

    const categoryCounts = useMemo(() => {
        const counts = {};
        events.forEach((evt) => {
            const key = String(evt.categoryId);
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [events]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesResponse, eventsResponse] = await Promise.all([
                    axiosInstance.get('/Categories'),
                    axiosInstance.get('/Events')
                ]);

                setCategories(categoriesResponse.data);
                setEvents(eventsResponse.data);

                if (user) {
                    const [registrationsRes, waitlistRes, favoritesRes, recRes] = await Promise.all([
                        axiosInstance.get('/Registrations/my'),
                        axiosInstance.get('/Waitlist/my'),
                        axiosInstance.get('/Favorites'),
                        axiosInstance.get('/Recommendations').catch(() => ({ data: [] }))
                    ]);
                    setMyEnrolledIds(registrationsRes.data.map(reg => reg.eventId));
                    setMyWaitlistIds(waitlistRes.data.map(w => w.eventId));
                    setFavoriteIds(favoritesRes.data);
                    setRecommendations(recRes.data);
                } else {
                    setMyEnrolledIds([]);
                    setMyWaitlistIds([]);
                    setFavoriteIds([]);
                    setRecommendations([]);
                }
            } catch (err) {
                console.error("Eroare la încărcarea datelor:", err);
                setError('Nu s-au putut încărca datele de pe server.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.username]);

    const handleEnroll = async (eventId) => {
        setEnrollStatus({ eventId: null, message: '', isError: false });
        try {
            await axiosInstance.post(`/Registrations/${eventId}`);
            setEnrollStatus({
                eventId: eventId,
                message: 'Te-ai înscris cu succes la acest eveniment!',
                isError: false
            });

            setMyEnrolledIds(prev => [...prev, eventId]);
            setEvents(prev =>
                prev.map(e =>
                    e.id === eventId
                        ? { ...e, currentParticipants: (e.currentParticipants ?? 0) + 1 }
                        : e
                )
            );
            showToast?.('Te-ai înscris cu succes!');
        } catch (error) {
            console.error("Eroare la înscriere:", error);
            setEnrollStatus({
                eventId: eventId,
                message: error.response?.data?.title || 'Eroare la înscriere. Posibil să fii deja înscris.',
                isError: true
            });
            showToast?.(error.response?.data?.title || 'Eroare la înscriere.', 'error');
        }
    };

    const handleJoinWaitlist = async (eventId) => {
        setEnrollStatus({ eventId: null, message: '', isError: false });
        try {
            await axiosInstance.post(`/Waitlist/${eventId}`);
            setMyWaitlistIds(prev => [...prev, eventId]);
            setEnrollStatus({ eventId, message: 'Ai fost adăugat pe lista de așteptare.', isError: false });
            showToast?.('Adăugat pe waitlist.');
        } catch (error) {
            setEnrollStatus({ eventId, message: error.response?.data?.title || 'Eroare waitlist.', isError: true });
            showToast?.(error.response?.data?.title || 'Eroare waitlist.', 'error');
        }
    };

    const handleToggleFavorite = async (eventId) => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/Favorites/${eventId}/toggle`);
            setFavoriteIds(prev => res.data.isFavorite ? [...prev, eventId] : prev.filter(id => id !== eventId));
            showToast?.(res.data.isFavorite ? 'Eveniment salvat.' : 'Eliminat din salvate.');
        } catch {
            showToast?.('Eroare la salvare.', 'error');
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategoryId('');
    };

    if (loading) return <p className="text-center py-10 text-gray-600 dark:text-gray-400">Se încarcă...</p>;

    return (
        <div className="max-w-7xl mx-auto px-4 text-left">
            {user && recommendations.length > 0 && (
                <section className="mb-8 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Recommended For You</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendations.map(evt => (
                            <EventCard key={evt.id} evt={evt} user={user}
                                isEnrolled={myEnrolledIds.includes(evt.id)}
                                isOnWaitlist={myWaitlistIds.includes(evt.id)}
                                isFavorite={favoriteIds.includes(evt.id)}
                                onEnroll={handleEnroll} onJoinWaitlist={handleJoinWaitlist}
                                onToggleFavorite={handleToggleFavorite} enrollStatus={enrollStatus} />
                        ))}
                    </div>
                </section>
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                <aside className="w-full lg:w-72 flex-shrink-0">
                    <Card className="p-5 sticky top-24 animate-fade-in">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Filtrează după categorie</h3>
                        {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}

                        <button
                            type="button"
                            onClick={() => setSelectedCategoryId('')}
                            className={`w-full text-left px-4 py-2.5 mb-2 rounded-lg border transition-all duration-200 ${
                                selectedCategoryId === '' 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold' 
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            Toate categoriile ({events.length})
                        </button>

                        {categories.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Nu există nicio categorie adăugată.</p>
                        ) : (
                            <ul className="space-y-2">
                                {categories.map((category) => {
                                    const count = categoryCounts[String(category.id)] || 0;
                                    const isActive = String(selectedCategoryId) === String(category.id);

                                    return (
                                        <li key={category.id}>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategoryId(String(category.id))}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                                                    isActive 
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold' 
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {category.name} ({count})
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                </aside>

                <section className="flex-1 min-w-0">
                    <Card className="p-6 animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Evenimente Disponibile</h3>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredEvents.length} din {events.length} evenimente
                            </span>
                        </div>

                        <div className="mb-6">
                            <Input
                                type="search"
                                placeholder="Caută după titlu, descriere, categorie sau locație..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Caută evenimente"
                            />
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    onClick={clearFilters}
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                >
                                    Șterge filtrele
                                </Button>
                            )}
                        </div>

                        {events.length === 0 ? (
                            <EmptyState title="Niciun eveniment" description="Nu există evenimente programate." />
                        ) : filteredEvents.length === 0 ? (
                            <EmptyState 
                                title="Niciun rezultat" 
                                description="Schimbă filtrele sau termenul de căutare."
                                action={hasActiveFilters && <button type="button" onClick={clearFilters} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">Resetează filtrele</button>} 
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredEvents.map((evt) => (
                                    <EventCard key={evt.id} evt={evt} user={user}
                                        isEnrolled={myEnrolledIds.includes(evt.id)}
                                        isOnWaitlist={myWaitlistIds.includes(evt.id)}
                                        isFavorite={favoriteIds.includes(evt.id)}
                                        onEnroll={handleEnroll} onJoinWaitlist={handleJoinWaitlist}
                                        onToggleFavorite={handleToggleFavorite} enrollStatus={enrollStatus} />
                                ))}
                            </div>
                        )}
                    </Card>
                </section>
            </div>
        </div>
    );
}
