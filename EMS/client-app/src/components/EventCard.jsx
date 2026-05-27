import { Link } from 'react-router-dom';
import { getEventBadge, getCountdown, getOccupancyPercent, isSoldOut } from '../utils/eventUi';
import { getEventImageUrl } from '../utils/eventImages';

export default function EventCard({
    evt, user, isEnrolled, isOnWaitlist, isFavorite, onEnroll, onJoinWaitlist, onToggleFavorite,
    enrollStatus, showFavorite = true
}) {
    const soldOut = isSoldOut(evt);
    const badge = getEventBadge(evt);
    const occupancy = getOccupancyPercent(evt);

    const img = getEventImageUrl(evt);

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 animate-fade-in">
            <Link to={`/events/${evt.id}`} className="block overflow-hidden h-36 sm:h-40 group">
                <img src={img} alt={evt.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </Link>
            <div className="p-4 flex flex-col flex-1 justify-between">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex flex-wrap gap-1">
                        {evt.categoryName && (
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{evt.categoryName}</span>
                        )}
                        {badge && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>}
                    </div>
                    {user && showFavorite && (
                        <button type="button" onClick={() => onToggleFavorite(evt.id)} className="text-lg leading-none text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors" aria-label="Favorite">
                            {isFavorite ? '★' : '☆'}
                        </button>
                    )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    <Link to={`/events/${evt.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{evt.title}</Link>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{evt.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">📅 {new Date(evt.date).toLocaleString('ro-RO')}</p>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">{getCountdown(evt.date)}</p>
                {evt.venueName && <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">📍 {evt.venueName}</p>}
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
                        <span>{evt.currentParticipants ?? 0} / {evt.maxCapacity} locuri</span>
                        <span>{occupancy}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${soldOut ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${occupancy}%` }} />
                    </div>
                </div>
                {enrollStatus?.eventId === evt.id && (
                    <p className={`text-xs mb-2 px-0 ${enrollStatus.isError ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{enrollStatus.message}</p>
                )}
                {user ? (
                    soldOut && !isEnrolled ? (
                        <button type="button" onClick={() => onJoinWaitlist(evt.id)} disabled={isOnWaitlist}
                            className={`w-full py-2 rounded-lg text-sm font-semibold text-white mt-2 transition-colors ${isOnWaitlist ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600'}`}>
                            {isOnWaitlist ? 'Pe waitlist' : 'Intră pe waitlist'}
                        </button>
                    ) : (
                        <button type="button" onClick={() => onEnroll(evt.id)} disabled={isEnrolled || soldOut}
                            className={`w-full py-2 rounded-lg text-sm font-semibold mt-2 transition-colors ${isEnrolled ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed' : soldOut ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'}`}>
                            {isEnrolled ? '✓ Înscris' : soldOut ? 'Sold out' : 'Participă'}
                        </button>
                    )
                ) : (
                    <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-2">Autentifică-te pentru a participa</p>
                )}
            </div>
        </div>
    );
}
