using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly IRepository<Registration> _registrationRepo;
        private readonly IRepository<Event> _eventRepo;
        private readonly IEventService _eventService;

        public RecommendationService(
            IRepository<Registration> registrationRepo,
            IRepository<Event> eventRepo,
            IEventService eventService)
        {
            _registrationRepo = registrationRepo;
            _eventRepo = eventRepo;
            _eventService = eventService;
        }

        public async Task<IEnumerable<EventDTO>> GetRecommendationsForUserAsync(Guid userId)
        {
            var allDtos = (await _eventService.GetAllEventsAsync()).ToList();
            var now = DateTime.UtcNow;
            var upcoming = allDtos.Where(e => new DateTime(e.Date.Ticks, DateTimeKind.Utc) >= now || e.Date >= now).ToList();

            var myRegs = await _registrationRepo.FindAsync(r => r.UserId == userId);
            var registeredIds = myRegs.Select(r => r.EventId).ToHashSet();

            var events = (await _eventRepo.GetAllAsync()).ToList();
            var joinedCategoryIds = events
                .Where(e => registeredIds.Contains(e.Id))
                .Select(e => e.CategoryId)
                .Distinct()
                .ToHashSet();

            IEnumerable<EventDTO> candidates = joinedCategoryIds.Count > 0
                ? upcoming.Where(e => joinedCategoryIds.Contains(e.CategoryId) && !registeredIds.Contains(e.Id))
                : upcoming.Where(e => !registeredIds.Contains(e.Id));

            return candidates
                .OrderByDescending(e => e.CurrentParticipants)
                .ThenBy(e => e.Date)
                .Take(6);
        }
    }
}
