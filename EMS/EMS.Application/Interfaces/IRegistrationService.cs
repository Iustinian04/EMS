using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IRegistrationService
    {
        Task<IEnumerable<RegistrationDTO>> GetAllRegistrationsAsync();
        Task<RegistrationDTO> RegisterUserToEventAsync(Guid userId, Guid eventId);
        Task<bool> RemoveRegistrationAsync(Guid userId, Guid eventId);
        Task<bool> IsEventAtCapacityAsync(Guid eventId);
        Task<TicketDTO?> GetTicketAsync(Guid userId, Guid eventId);
    }
}