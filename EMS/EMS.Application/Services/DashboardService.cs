using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IRepository<Event> _eventRepo;
        private readonly IRepository<Registration> _registrationRepo;
        private readonly IRepository<WaitlistEntry> _waitlistRepo;

        public DashboardService(
            IRepository<Event> eventRepo,
            IRepository<Registration> registrationRepo,
            IRepository<WaitlistEntry> waitlistRepo)
        {
            _eventRepo = eventRepo;
            _registrationRepo = registrationRepo;
            _waitlistRepo = waitlistRepo;
        }

        public async Task<DashboardDTO> GetStatsAsync()
        {
            var events = (await _eventRepo.GetAllAsync()).ToList();
            var registrations = (await _registrationRepo.GetAllAsync()).ToList();
            var waitlist = (await _waitlistRepo.GetAllAsync()).ToList();

            var regByEvent = registrations.GroupBy(r => r.EventId).ToDictionary(g => g.Key, g => g.Count());
            var waitByEvent = waitlist.GroupBy(w => w.EventId).ToDictionary(g => g.Key, g => g.Count());

            var eventStats = events.Select(e =>
            {
                var participants = regByEvent.GetValueOrDefault(e.Id, 0);
                var waitCount = waitByEvent.GetValueOrDefault(e.Id, 0);
                var occupancy = e.MaxCapacity > 0
                    ? Math.Round((double)participants / e.MaxCapacity * 100, 1)
                    : 0;

                return new EventStatsDTO
                {
                    EventId = e.Id,
                    Title = e.Title,
                    MaxCapacity = e.MaxCapacity,
                    CurrentParticipants = participants,
                    WaitlistCount = waitCount,
                    OccupancyPercent = occupancy
                };
            }).OrderByDescending(s => s.OccupancyPercent).ToList();

            var capped = eventStats.Where(s => s.MaxCapacity > 0).ToList();
            var avgOccupancy = capped.Count > 0
                ? Math.Round(capped.Average(s => s.OccupancyPercent), 1)
                : 0;

            return new DashboardDTO
            {
                TotalEvents = events.Count,
                TotalRegistrations = registrations.Count,
                TotalWaitlistEntries = waitlist.Count,
                AverageOccupancyPercent = avgOccupancy,
                EventStats = eventStats
            };
        }
    }
}
