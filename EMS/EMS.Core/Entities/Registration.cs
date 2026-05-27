using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMS.Core.Entities
{
    public class Registration : BaseEntity
    {
        public Guid EventId { get; set; }
        public Event? Event { get; set; }

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
        public Guid TicketCode { get; set; } = Guid.NewGuid();
    }
}
