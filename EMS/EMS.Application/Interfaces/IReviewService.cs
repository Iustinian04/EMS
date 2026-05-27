using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDTO>> GetReviewsByEventAsync(Guid eventId);
        Task<ReviewDTO?> CreateReviewAsync(Guid userId, Guid eventId, ReviewCreateDTO dto, bool isAdmin = false);
    }
}
