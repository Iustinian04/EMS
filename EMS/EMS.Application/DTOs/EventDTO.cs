using System;

namespace EMS.Application.DTOs
{
    public class EventDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime Date { get; set; }

        public Guid CategoryId { get; set; }
        public Guid VenueId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public string VenueAddress { get; set; } = string.Empty;

        
        public int MaxCapacity { get; set; }
        public int CurrentParticipants { get; set; }
    }
}