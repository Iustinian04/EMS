import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import TicketModal from '../components/TicketModal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

export default function MyEvents() {
    const [myEnrolledEvents, setMyEnrolledEvents] = useState([]);
    const [myWaitlist, setMyWaitlist] = useState([]);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const [registrationsRes, allEventsRes, waitlistRes] = await Promise.all([
                    axiosInstance.get('/Registrations/my'),
                    axiosInstance.get('/Events'),
                    axiosInstance.get('/Waitlist/my')
                ]);
                const myRegistrations = registrationsRes.data;
                const allEvents = allEventsRes.data;
                setMyEnrolledEvents(allEvents.filter(evt => myRegistrations.some(reg => reg.eventId === evt.id)));
                setMyWaitlist(waitlistRes.data);
            } catch (err) {
                setError('Nu am putut încărca evenimentele.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    const handleUnenroll = async (eventId) => {
        if (!window.confirm("Renunți la participare?")) return;
        try {
            await axiosInstance.delete(`/Registrations/${eventId}`);
            setMyEnrolledEvents(prev => prev.filter(evt => evt.id !== eventId));
            const wl = await axiosInstance.get('/Waitlist/my');
            setMyWaitlist(wl.data);
        } catch {
            alert("Eroare la anulare.");
        }
    };

    const showTicket = async (eventId) => {
        try {
            const res = await axiosInstance.get(`/Registrations/ticket/${eventId}`);
            setTicket(res.data);
        } catch {
            alert('Bilet indisponibil.');
        }
    };

    if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-400">Se încarcă...</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Evenimentele mele</h2>
            {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

            {myEnrolledEvents.length === 0 ? (
                <EmptyState 
                    title="Nu ești înscris la niciun eveniment" 
                    description="Explorează evenimentele disponibile și înscrie-te la cele care te interesează."
                />
            ) : (
                <div className="space-y-4 mb-8">
                    {myEnrolledEvents.map(evt => (
                        <Card key={evt.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{evt.title}</h4>
                                <span className="text-sm text-gray-600 dark:text-gray-400">📅 {new Date(evt.date).toLocaleString('ro-RO')}</span>
                            </div>
                            <div className="flex gap-3">
                                <Button 
                                    onClick={() => showTicket(evt.id)} 
                                    variant="secondary"
                                    size="sm"
                                >
                                    Bilet QR
                                </Button>
                                <Button 
                                    onClick={() => handleUnenroll(evt.id)} 
                                    variant="danger"
                                    size="sm"
                                >
                                    Renunță
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {myWaitlist.length > 0 && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Lista de așteptare</h3>
                    <div className="space-y-3">
                        {myWaitlist.map(w => (
                            <Card key={w.id} className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-amber-900 dark:text-amber-100">{w.eventTitle}</span>
                                    <span className="text-sm text-amber-700 dark:text-amber-300">poziția #{w.position}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <TicketModal ticket={ticket} onClose={() => setTicket(null)} />
        </div>
    );
}
