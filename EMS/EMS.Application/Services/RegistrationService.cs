using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class RegistrationService : IRegistrationService
    {
        private readonly IRepository<Registration> _registrationRepo;
        private readonly IRepository<Event> _eventRepo;
        private readonly IWaitlistService _waitlistService;

        public RegistrationService(
            IRepository<Registration> registrationRepo,
            IRepository<Event> eventRepo,
            IWaitlistService waitlistService)
        {
            _registrationRepo = registrationRepo;
            _eventRepo = eventRepo;
            _waitlistService = waitlistService;
        }

        public async Task<IEnumerable<RegistrationDTO>> GetAllRegistrationsAsync()
        {
            var registrations = await _registrationRepo.GetAllAsync();
            return registrations.Select(MapToDto);
        }

        public async Task<bool> IsEventAtCapacityAsync(Guid eventId)
        {
            var evt = await _eventRepo.GetByIdAsync(eventId);
            if (evt == null || evt.MaxCapacity <= 0) return false;

            var registrations = await _registrationRepo.FindAsync(r => r.EventId == eventId);
            return registrations.Count() >= evt.MaxCapacity;
        }

        public async Task<RegistrationDTO> RegisterUserToEventAsync(Guid userId, Guid eventId)
        {
            if (await IsEventAtCapacityAsync(eventId))
                throw new InvalidOperationException("Evenimentul a atins capacitatea maximă.");

            var registration = new Registration
            {
                UserId = userId,
                EventId = eventId,
                RegistrationDate = DateTime.UtcNow,
                TicketCode = Guid.NewGuid()
            };

            await _registrationRepo.AddAsync(registration);
            await _registrationRepo.SaveAsync();

            return MapToDto(registration);
        }

        public async Task<bool> RemoveRegistrationAsync(Guid userId, Guid eventId)
        {
            var registrations = await _registrationRepo.FindAsync(r => r.UserId == userId && r.EventId == eventId);
            var registration = registrations.FirstOrDefault();
            if (registration == null) return false;

            _registrationRepo.Delete(registration);
            await _registrationRepo.SaveAsync();

            await _waitlistService.PromoteNextAsync(eventId);
            return true;
        }

        public async Task<TicketDTO?> GetTicketAsync(Guid userId, Guid eventId)
        {
            var registrations = await _registrationRepo.FindAsync(r => r.UserId == userId && r.EventId == eventId);
            var registration = registrations.FirstOrDefault();
            if (registration == null) return null;

            var evt = await _eventRepo.GetByIdAsync(eventId);
            if (evt == null) return null;

            return new TicketDTO
            {
                RegistrationId = registration.Id,
                EventId = eventId,
                EventTitle = evt.Title,
                EventDate = evt.Date,
                TicketCode = registration.TicketCode
            };
        }

        private static RegistrationDTO MapToDto(Registration r) => new()
        {
            Id = r.Id,
            EventId = r.EventId,
            UserId = r.UserId,
            RegistrationDate = r.RegistrationDate,
            TicketCode = r.TicketCode
        };
    }
}
