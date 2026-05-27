using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IRepository<Favorite> _favoriteRepo;
        private readonly IEventService _eventService;

        public FavoriteService(IRepository<Favorite> favoriteRepo, IEventService eventService)
        {
            _favoriteRepo = favoriteRepo;
            _eventService = eventService;
        }

        public async Task<IEnumerable<Guid>> GetFavoriteEventIdsAsync(Guid userId)
        {
            var favorites = await _favoriteRepo.FindAsync(f => f.UserId == userId);
            return favorites.Select(f => f.EventId);
        }

        public async Task<IEnumerable<EventDTO>> GetFavoriteEventsAsync(Guid userId)
        {
            var ids = (await GetFavoriteEventIdsAsync(userId)).ToHashSet();
            var all = await _eventService.GetAllEventsAsync();
            return all.Where(e => ids.Contains(e.Id));
        }

        public async Task<bool> ToggleFavoriteAsync(Guid userId, Guid eventId)
        {
            var existing = (await _favoriteRepo.FindAsync(f => f.UserId == userId && f.EventId == eventId)).FirstOrDefault();
            if (existing != null)
            {
                _favoriteRepo.Delete(existing);
                await _favoriteRepo.SaveAsync();
                return false;
            }

            await _favoriteRepo.AddAsync(new Favorite { UserId = userId, EventId = eventId });
            await _favoriteRepo.SaveAsync();
            return true;
        }
    }
}
