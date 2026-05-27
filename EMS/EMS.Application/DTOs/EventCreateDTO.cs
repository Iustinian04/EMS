using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMS.Application.DTOs
{
    public class EventCreateDTO
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
