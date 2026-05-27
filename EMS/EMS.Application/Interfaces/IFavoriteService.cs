using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IFavoriteService
    {
        Task<IEnumerable<Guid>> GetFavoriteEventIdsAsync(Guid userId);
        Task<IEnumerable<EventDTO>> GetFavoriteEventsAsync(Guid userId);
        Task<bool> ToggleFavoriteAsync(Guid userId, Guid eventId);
    }
}
