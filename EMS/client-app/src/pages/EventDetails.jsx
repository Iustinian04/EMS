import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EditEventModal from '../components/EditEventModal';
import { getEventBadge, getCountdown, getOccupancyPercent, isSoldOut } from '../utils/eventUi';
import { getEventImageUrl } from '../utils/eventImages';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

const BADGE_STYLES = {
    'Sold Out': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    'Today': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Upcoming': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Few Spots Left': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Popular': 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
};

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showToast } = useToast() || {};

    const [eventData, setEventData] = useState(null);
    const [isAdminView, setIsAdminView] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    const soldOut = eventData && isSoldOut(eventData);
    const isEventEnded = eventData && new Date(eventData.date) < new Date();
    const badge = eventData ? getEventBadge(eventData) : null;
    const cachedUser = JSON.parse(localStorage.getItem('user'));
    const isAdmin = cachedUser?.role === 'Admin';
    const imageUrl = eventData ? getEventImageUrl(eventData) : '';
    const mapSrc = eventData?.venueAddress
        ? `https://maps.google.com/maps?q=${encodeURIComponent(eventData.venueAddress)}&output=embed`
        : null;

    useEffect(() => {
        const load = async () => {
            try {
                const [detailRes, reviewsRes] = await Promise.all([
                    axiosInstance.get(`/Events/${id}`),
                    axiosInstance.get(`/Reviews/event/${id}`).catch(() => ({ data: [] }))
                ]);
                setEventData(detailRes.data.event);
                setIsAdminView(detailRes.data.isAdminView);
                setReviews(reviewsRes.data);

                if (user) {
                    const [regs, favs] = await Promise.all([
                        axiosInstance.get('/Registrations/my'),
                        axiosInstance.get('/Favorites').catch(() => ({ data: [] }))
                    ]);
                    setIsEnrolled(regs.data.some(r => r.eventId === id));
                    setIsFavorite(favs.data.some(fid => String(fid) === String(id)));
                }
            } catch {
                setError('Nu s-au putut încărca detaliile.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user]);

    const handleEnroll = async () => {
        setIsEnrolling(true);
        try {
            await axiosInstance.post(`/Registrations/${id}`);
            setIsEnrolled(true);
            setEventData(p => ({ ...p, currentParticipants: (p.currentParticipants ?? 0) + 1 }));
            showToast?.('Înscris cu succes!');
        } catch (err) {
            showToast?.(err.response?.data?.title || 'Eroare la înscriere.', 'error');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleToggleFavorite = async () => {
        try {
            const res = await axiosInstance.post(`/Favorites/${id}/toggle`);
            setIsFavorite(res.data.isFavorite);
            showToast?.(res.data.isFavorite ? 'Eveniment salvat.' : 'Eliminat din salvate.');
        } catch {
            showToast?.('Eroare.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Ștergi acest eveniment?')) return;
        try {
            await axiosInstance.delete(`/Events/${id}`);
            showToast?.('Eveniment șters.');
            navigate('/');
        } catch {
            showToast?.('Nu s-a putut șterge.', 'error');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post(`/Reviews/event/${id}`, { rating: reviewRating, comment: reviewComment });
            setReviews(p => [res.data, ...p]);
            setReviewComment('');
            showToast?.('Recenzie publicată.');
        } catch (err) {
            showToast?.(err.response?.data?.title || 'Eroare recenzie.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 -mx-4 px-4 py-6 max-w-5xl md:mx-auto">
                <Skeleton className="h-64 md:h-80 w-full mb-6" />
                <Skeleton className="h-8 w-2/3 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline">Înapoi</Link>
            </div>
        );
    }

    const capacityPercent = getOccupancyPercent(eventData);
    const spotsLeft = eventData.maxCapacity > 0 ? Math.max(0, eventData.maxCapacity - eventData.currentParticipants) : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16 -mx-4 md:mx-auto md:max-w-5xl">
            <div className="relative h-56 sm:h-72 md:h-96 overflow-hidden group">
                <img src={imageUrl} alt={eventData.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 dark:from-black/90 via-gray-900/40 dark:via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Link to="/" className="text-sm text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-white bg-black/30 dark:bg-black/50 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-300/30 dark:border-gray-700/30 transition">← Înapoi</Link>
                    {badge && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${BADGE_STYLES[badge.label] || BADGE_STYLES.Upcoming}`}>{badge.label}</span>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <p className="text-indigo-400 dark:text-indigo-300 text-sm font-medium mb-2">{getCountdown(eventData.date)}</p>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">{eventData.title}</h1>
                    <p className="text-gray-300 dark:text-gray-400 text-sm mt-2">{eventData.categoryName} · {eventData.venueName}</p>
                </div>
            </div>

            <div className="px-4 md:px-6 -mt-6 relative z-10 space-y-6">
                <Card className="p-4 md:p-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                        {user && !isAdminView && (
                            <Button onClick={handleEnroll} disabled={isEnrolled || soldOut || isEnrolling} className="flex-1 min-w-[140px]">
                                {isEnrolling ? 'Se procesează...' : isEnrolled ? '✓ Înscris' : soldOut ? 'Sold Out' : 'Participă'}
                            </Button>
                        )}
                        {user && <Button variant="secondary" onClick={handleToggleFavorite} className="flex-1 min-w-[140px]">{isFavorite ? '★ Salvat' : '☆ Salvează'}</Button>}
                        {isAdminView && (
                            <>
                                <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>Editează</Button>
                                <Button variant="danger" onClick={handleDelete}>Șterge</Button>
                            </>
                        )}
                    </div>
                    {!user && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3"><Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">Autentifică-te</Link> pentru a participa.</p>}
                </Card>

                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-5 md:col-span-2 animate-fade-in">
                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Despre eveniment</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{eventData.description}</p>
                    </Card>
                    <Card className="p-5 space-y-4 animate-fade-in">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-500 uppercase">Data</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">{new Date(eventData.date).toLocaleString('ro-RO')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-500 uppercase mb-2">Capacitate</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">{eventData.currentParticipants} / {eventData.maxCapacity}</p>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${soldOut ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${capacityPercent}%` }} />
                            </div>
                            <p className={`text-xs mt-2 font-medium ${soldOut ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {soldOut ? 'Sold out' : `${spotsLeft} locuri rămase · ${capacityPercent}%`}
                            </p>
                        </div>
                    </Card>
                </div>

                {(eventData.venueName || eventData.venueAddress) && (
                    <Card className="p-5 overflow-hidden animate-fade-in">
                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Locație</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{eventData.venueName}{eventData.venueAddress && ` — ${eventData.venueAddress}`}</p>
                        {mapSrc && <iframe title="Hartă" src={mapSrc} className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700" loading="lazy" />}
                    </Card>
                )}

                <Card className="p-5 animate-fade-in">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recenzii ({reviews.length})</h2>
                    {reviews.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-500 text-sm py-6 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">Nicio recenzie încă.</p>
                    ) : reviews.map(r => (
                        <div key={r.id} className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <p className="text-amber-500 dark:text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} <span className="text-gray-600 dark:text-gray-500">— {r.userDisplayName}</span></p>
                            <p className="text-gray-700 dark:text-gray-400 text-sm mt-1">{r.comment || '(fără comentariu)'}</p>
                        </div>
                    ))}
                    {user && isEnrolled && (isEventEnded || isAdmin) && (
                        <form onSubmit={handleSubmitReview} className="mt-4 space-y-3">
                            <select value={reviewRating} onChange={e => setReviewRating(+e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stele</option>)}
                            </select>
                            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} placeholder="Comentariu" className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 resize-none" />
                            <Button type="submit" className="w-full sm:w-auto">Publică</Button>
                        </form>
                    )}
                    {user && isEnrolled && !isEventEnded && !isAdmin && <p className="text-xs text-gray-600 dark:text-gray-500 mt-3">Recenziile se activează după eveniment.</p>}
                </Card>
            </div>

            <EditEventModal event={eventData} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
                onUpdated={(u) => { setEventData(u); showToast?.('Actualizat.'); }} />
        </div>
    );
}
