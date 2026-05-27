export const isSoldOut = (evt) =>
    evt.maxCapacity > 0 && evt.currentParticipants >= evt.maxCapacity;

export const getOccupancyPercent = (evt) =>
    evt.maxCapacity > 0 ? Math.min(100, Math.round((evt.currentParticipants / evt.maxCapacity) * 100)) : 0;

export const getEventBadge = (evt) => {
    if (isSoldOut(evt)) return { label: 'Sold Out', className: 'bg-red-100 text-red-700' };
    const eventDate = new Date(evt.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (eventDay.getTime() === today.getTime()) return { label: 'Today', className: 'bg-amber-100 text-amber-800' };
    if (eventDate > now) return { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' };
    const spotsLeft = evt.maxCapacity > 0 ? evt.maxCapacity - evt.currentParticipants : 999;
    if (spotsLeft > 0 && spotsLeft <= 5) return { label: 'Few Spots Left', className: 'bg-orange-100 text-orange-800' };
    if (evt.currentParticipants >= 10) return { label: 'Popular', className: 'bg-purple-100 text-purple-700' };
    return null;
};

export const getCountdown = (dateStr) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffMs = eventDate - now;
    if (diffMs <= 0) return 'Started';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Live today';
    if (days === 1) return 'Starts tomorrow';
    return `Starts in ${days} days`;
};
