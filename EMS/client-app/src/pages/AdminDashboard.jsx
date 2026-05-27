import { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/ui/Card';

export default function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const role = JSON.parse(localStorage.getItem('user'))?.role;
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (role !== 'Admin') return;
        axiosInstance.get('/Dashboard/stats')
            .then(res => setStats(res.data))
            .finally(() => setLoading(false));
    }, [role]);

    if (!user || role !== 'Admin') return <Navigate to="/" />;
    if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-400">Se încarcă...</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard Administrator</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    ['Evenimente', stats?.totalEvents, 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'],
                    ['Înscrieri', stats?.totalRegistrations, 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'],
                    ['Waitlist', stats?.totalWaitlistEntries, 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'],
                    ['Ocupare medie', `${stats?.averageOccupancyPercent}%`, 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100']
                ].map(([label, val, colorClass]) => (
                    <Card key={label} className={`p-6 border ${colorClass} animate-fade-in`}>
                        <div className="text-sm font-medium mb-2">{label}</div>
                        <div className="text-3xl font-bold">{val ?? 0}</div>
                    </Card>
                ))}
            </div>

            <Card className="p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Statistici per eveniment</h3>
                <div className="space-y-4">
                    {stats?.eventStats?.map(e => (
                        <div key={e.eventId}>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{e.title}</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {e.currentParticipants}/{e.maxCapacity} ({e.occupancyPercent}%) · WL: {e.waitlistCount}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300" 
                                    style={{ width: `${Math.min(100, e.occupancyPercent)}%` }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
