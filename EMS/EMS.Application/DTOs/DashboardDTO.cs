namespace EMS.Application.DTOs
{
    public class DashboardDTO
    {
        public int TotalEvents { get; set; }
        public int TotalRegistrations { get; set; }
        public int TotalWaitlistEntries { get; set; }
        public double AverageOccupancyPercent { get; set; }
        public List<EventStatsDTO> EventStats { get; set; } = new();
    }

    public class EventStatsDTO
    {
        public Guid EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int CurrentParticipants { get; set; }
        public int WaitlistCount { get; set; }
        public double OccupancyPercent { get; set; }
    }
}
