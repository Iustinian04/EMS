using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IRecommendationService
    {
        Task<IEnumerable<EventDTO>> GetRecommendationsForUserAsync(Guid userId);
    }
}
