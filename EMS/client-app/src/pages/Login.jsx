import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        if (!email || !password) {
            setErrorMessage('Te rugăm să completezi toate câmpurile.');
            setIsSubmitting(false);
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setErrorMessage(result.message);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
                    Autentificare EMS
                </h2>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-8">
                    Bine ai revenit! Introdu datele tale pentru a continua.
                </p>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        required
                    />

                    <Input
                        type="password"
                        label="Parolă"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        variant="primary"
                    >
                        {isSubmitting ? 'Se verifică...' : 'Intră în cont'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Nu ai un cont?{' '}
                    <a href="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        Înregistrează-te
                    </a>
                </p>
            </Card>
        </div>
    );
}