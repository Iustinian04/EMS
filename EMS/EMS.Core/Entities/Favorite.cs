namespace EMS.Core.Entities
{
    public class Favorite : BaseEntity
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }
        public Guid EventId { get; set; }
        public Event? Event { get; set; }
    }
}
