import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SavedEvents from './pages/SavedEvents';

function App() {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const currentUserRole = JSON.parse(localStorage.getItem('user'))?.role || 'User';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 mb-6 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
                    <div className="flex flex-wrap gap-6 text-sm font-medium">
                        <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Acasă
                        </Link>
                        {!user && (
                            <>
                                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Register
                                </Link>
                            </>
                        )}
                        {user && (
                            <>
                                <Link to="/my-events" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                                    My events
                                </Link>
                                <Link to="/saved" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                                    Saved
                                </Link>
                                <Link to="/profile" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Profil
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-4 text-sm">
                                {currentUserRole === 'Admin' && (
                                    <>
                                        <Link to="/admin" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                                            Dashboard
                                        </Link>
                                        <Link to="/create-event" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                            + Add events
                                        </Link>
                                    </>
                                )}
                                <span className="text-gray-600 dark:text-gray-300">
                                    Welcome, <strong className="text-gray-900 dark:text-gray-100">{user.username}</strong>!
                                </span>
                                <button 
                                    type="button" 
                                    onClick={logout} 
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-event" element={user && currentUserRole === 'Admin' ? <CreateEvent /> : <Navigate to="/" />} />
                <Route path="/my-events" element={<MyEvents />} />
                <Route path="/saved" element={<SavedEvents />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={user && currentUserRole === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/events/:id" element={<EventDetails />} />
            </Routes>
        </div>
    );
}

export default App;

