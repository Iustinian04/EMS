const FALLBACK = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80&auto=format&fit=crop';

const BY_CATEGORY = {
    tech: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&auto=format&fit=crop',
    music: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80&auto=format&fit=crop',
    business: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80&auto=format&fit=crop',
    gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80&auto=format&fit=crop',
    workshop: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop',
};

export function getEventImageUrl(evt) {
    if (evt?.imageUrl?.trim()) return evt.imageUrl.trim();
    const hay = `${evt?.categoryName || ''} ${evt?.title || ''}`.toLowerCase();
    if (hay.includes('music') || hay.includes('festival')) return BY_CATEGORY.music;
    if (hay.includes('game') || hay.includes('gaming')) return BY_CATEGORY.gaming;
    if (hay.includes('workshop') || hay.includes('training')) return BY_CATEGORY.workshop;
    if (hay.includes('business') || hay.includes('network')) return BY_CATEGORY.business;
    if (hay.includes('tech') || hay.includes('conference')) return BY_CATEGORY.tech;
    return FALLBACK;
}
