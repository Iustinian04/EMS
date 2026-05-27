import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function CreateEvent() {
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

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, venuesRes] = await Promise.all([
                    axiosInstance.get('/Categories'),
                    axiosInstance.get('/Venues')
                ]);
                setCategories(categoriesRes.data);
                setVenues(venuesRes.data);
            } catch (error) {
                console.error("Eroare la încărcarea datelor:", error);
            }
        };
        fetchData();
    }, []);

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
            const newEvent = {
                title,
                description,
                date,
                maxCapacity: parseInt(maxCapacity),
                categoryId: categoryId,
                venueId: venueId,
                imageUrl: imageUrl.trim()
            };

            await axiosInstance.post('/Events', newEvent);

            setIsError(false);
            setMessage('Evenimentul a fost creat cu succes! Redirecționare...');

            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            console.error("Eroare la creare eveniment:", error);
            setIsError(true);
            setMessage('A apărut o eroare la salvarea evenimentului.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Card className="p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">Adaugă un Eveniment Nou</h2>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-8">Completează formularul de mai jos pentru a crea un nou eveniment.</p>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg border ${isError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                        <p className={`text-sm ${isError ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        type="text"
                        label="Titlu Eveniment"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <Input
                        type="url"
                        label="Image URL"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descriere</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-blue-400 resize-none"
                        />
                    </div>

                    <Input
                        type="datetime-local"
                        label="Dată și Oră"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />

                    <Input
                        type="number"
                        label="Capacitate Maximă"
                        min="1"
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Categoria</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
                        >
                            <option value="">-- Selectează o categorie --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Locația (Venue)</label>
                        <select
                            value={venueId}
                            onChange={(e) => setVenueId(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
                        >
                            <option value="">-- Selectează o locație --</option>
                            {venues.map((venue) => (
                                <option key={venue.id} value={venue.id}>{venue.name} (Capacitate: {venue.capacity})</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        variant="primary"
                    >
                        {isSubmitting ? 'Se salvează...' : 'Salvează Evenimentul'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}