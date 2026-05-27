namespace EMS.Application.DTOs
{
    public class EventUpdateDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int MaxCapacity { get; set; }
        public Guid CategoryId { get; set; }
        public Guid VenueId { get; set; }
    }
}
