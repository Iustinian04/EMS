using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMS.Application.DTOs
{
    public class RegistrationDTO
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;

        public Guid UserId { get; set; }

        public string UserName { get; set; } = string.Empty;
        public DateTime RegistrationDate { get; set; }
        public Guid TicketCode { get; set; }
    }
}
