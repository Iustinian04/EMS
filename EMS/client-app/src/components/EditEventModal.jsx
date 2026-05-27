import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useTheme } from '../context/ThemeContext';

const toDatetimeLocal = (dateString) => {
    const d = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EditEventModal({ event, isOpen, onClose, onUpdated }) {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [venueId, setVenueId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        if (!isOpen || !event) return;

        setTitle(event.title ?? '');
        setDescription(event.description ?? '');
        setDate(event.date ? toDatetimeLocal(event.date) : '');
        setMaxCapacity(String(event.maxCapacity ?? ''));
        setCategoryId(event.categoryId ?? '');
        setVenueId(event.venueId ?? '');
        setImageUrl(event.imageUrl ?? '');
        setMessage('');
        setIsError(false);

        const fetchOptions = async () => {
            setLoadingOptions(true);
            try {
                const [categoriesRes, venuesRes] = await Promise.all([
                    axiosInstance.get('/Categories'),
                    axiosInstance.get('/Venues')
                ]);
                setCategories(categoriesRes.data);
                setVenues(venuesRes.data);
            } catch (err) {
                console.error('Eroare la încărcarea opțiunilor:', err);
                setIsError(true);
                setMessage('Nu s-au putut încărca categoriile sau locațiile.');
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, [isOpen, event]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsSubmitting(true);

        if (!title || !description || !date || !maxCapacity || !categoryId || !venueId) {
            setMessage('Toate câmpurile sunt obligatorii.');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axiosInstance.put(`/Events/${event.id}`, {
                title,
                description,
                date,
                maxCapacity: parseInt(maxCapacity, 10),
                categoryId,
                venueId,
                imageUrl: imageUrl.trim()
            });

            onUpdated(response.data);
            onClose();
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.title || 'A apărut o eroare la actualizarea evenimentului.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-1000 p-5"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-[10px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="m-0 text-gray-900 dark:text-gray-100">Editează evenimentul</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="border-none bg-none text-[20px] cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        aria-label="Închide"
                    >
                        ×
                    </button>
                </div>

                {message && (
                    <div className={`p-2.5 rounded mb-4 text-sm ${
                        isError 
                            ? 'text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/20' 
                            : 'text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/20'
                    }`}>
                        {message}
                    </div>
                )}

                {loadingOptions ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">Se încarcă formularul...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block font-bold mb-1 text-sm text-gray-900 dark:text-gray-100">Titlu</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 box-border rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1 text-sm text-gray-900 dark:text-gray-100">Image URL</label>
                            <input 
                                type="url" 
                                placeholder="https://..." 
                                value={imageUrl} 
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full p-2 box-border rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-1 text-sm text-gray-900 dark:text-gray-100">Descriere</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full p-2 box-border rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1 text-sm text-gray-900 dark:text-gray-100">Dată și oră</label>
                            <input
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-2 box-border rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1 text-sm text-gray-900 dark:text-gray-100">
                                Capacitate maximă
                                {event?.currentParticipants > 0 && (
                                    <span className="font-normal text-gray-600 dark:text-gray-400 ml-1.5">
                                        (min. {event.currentParticipants} — participanți înscriși)
                                    </span>
                                )}
                            </label>
                            <input
                                type="number"
                                min={event?.currentParticipants || 1}
                                value={maxCapacity}
                                onChange={(e) => setMaxCapacity(e.target.value)}
                                className="w-full p-2 box-border rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1 text-sm text-gray-900 dark:text-gray-100">Categorie</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">-- Selectează --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold mb-1 text-sm text-gray-900 dark:text-gray-100">Locație</label>
                            <select
                                value={venueId}
                                onChange={(e) => setVenueId(e.target.value)}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">-- Selectează --</option>
                                {venues.map((venue) => (
                                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 p-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                Anulează
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 p-2.5 bg-blue-600 dark:bg-blue-500 text-white border-none rounded cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                {isSubmitting ? 'Se salvează...' : 'Salvează modificările'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
