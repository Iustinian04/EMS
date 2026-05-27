namespace EMS.Application.DTOs
{
    public class WaitlistDTO
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public int Position { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
