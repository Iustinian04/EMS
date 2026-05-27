using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IEventService
    {
        Task<IEnumerable<EventDTO>> GetAllEventsAsync();
        Task<EventDTO?> GetEventByIdAsync(Guid id);
        Task<EventDTO> CreateEventAsync(EventCreateDTO eventDto);
        Task<EventDTO?> UpdateEventAsync(Guid id, EventUpdateDTO dto);
        Task<bool> DeleteEventAsync(Guid id);
    }
}