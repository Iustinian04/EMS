import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Register() {
    const [form, setForm] = useState({
        email: '', password: '', confirmPassword: '',
        firstName: '', lastName: '', username: '', age: ''
    });
    const [guardianAcknowledged, setGuardianAcknowledged] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const ageNum = parseInt(form.age, 10);
    const isMinor = !isNaN(ageNum) && ageNum < 18;

    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (!form.email || !form.password || !form.firstName || !form.lastName || !form.username || !form.age) {
            setMessage('Toate câmpurile sunt obligatorii.');
            setIsError(true);
            return;
        }
        if (form.password !== form.confirmPassword) {
            setMessage('Parolele nu coincid.');
            setIsError(true);
            return;
        }
        if (isNaN(ageNum) || ageNum < 1) {
            setMessage('Introdu o vârstă validă.');
            setIsError(true);
            return;
        }
        if (isMinor && !guardianAcknowledged) {
            setMessage('Utilizatorii sub 18 ani trebuie să confirme prezența unui însoțitor adult.');
            setIsError(true);
            return;
        }

        setIsSubmitting(true);
        try {
            
            await axiosInstance.post('/auth/create-account', {
                Username: form.username.trim(),
                Email: form.email.trim(),
                Password: form.password,
                FirstName: form.firstName.trim(),
                LastName: form.lastName.trim(),
                Age: ageNum,
                GuardianAcknowledged: isMinor ? guardianAcknowledged : false
            });

            setIsError(false);
            setMessage('Cont creat cu succes! Redirecționare la login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setIsError(true);
            if (error.response?.data?.errors) {
                setMessage(Object.values(error.response.data.errors).flat().join(' '));
            } else {
                setMessage(error.response?.data?.title || 'Eroare la înregistrare. Verifică datele introduse.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-lg p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
                    Creare cont
                </h2>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-8">
                    Completează formularul de mai jos pentru a te înregistra.
                </p>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg border ${isError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                        <p className={`text-sm ${isError ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="Prenume"
                            required
                            value={form.firstName}
                            onChange={handleChange('firstName')}
                        />
                        <Input
                            placeholder="Nume"
                            required
                            value={form.lastName}
                            onChange={handleChange('lastName')}
                        />
                    </div>
                    <Input
                        placeholder="Username"
                        required
                        value={form.username}
                        onChange={handleChange('username')}
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        required
                        value={form.email}
                        onChange={handleChange('email')}
                    />
                    <Input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Vârstă"
                        required
                        value={form.age}
                        onChange={handleChange('age')}
                    />
                    {isMinor && (
                        <label className="flex gap-3 text-sm p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-300">
                            <input
                                type="checkbox"
                                checked={guardianAcknowledged}
                                onChange={e => setGuardianAcknowledged(e.target.checked)}
                                className="mt-0.5"
                            />
                            Confirm că voi participa cu un însoțitor adult.
                        </label>
                    )}
                    <Input
                        type="password"
                        placeholder="Parolă"
                        required
                        value={form.password}
                        onChange={handleChange('password')}
                    />
                    <Input
                        type="password"
                        placeholder="Confirmă parola"
                        required
                        value={form.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                    />
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        variant="primary"
                    >
                        {isSubmitting ? 'Se creează...' : 'Înregistrează-te'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Ai deja un cont?{' '}
                    <a href="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        Autentifică-te
                    </a>
                </p>
            </Card>
        </div>
    );
}
