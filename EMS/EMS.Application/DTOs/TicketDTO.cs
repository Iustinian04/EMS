namespace EMS.Application.DTOs
{
    public class TicketDTO
    {
        public Guid RegistrationId { get; set; }
        public Guid EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public Guid TicketCode { get; set; }
    }
}
