using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IWaitlistService
    {
        Task<WaitlistDTO?> JoinWaitlistAsync(Guid userId, Guid eventId);
        Task<IEnumerable<WaitlistDTO>> GetMyWaitlistAsync(Guid userId);
        Task<bool> IsOnWaitlistAsync(Guid userId, Guid eventId);
        Task PromoteNextAsync(Guid eventId);
    }
}
