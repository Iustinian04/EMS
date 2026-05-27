using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMS.Core.Entities
{
    public class Event : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int MaxCapacity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        public Guid CategoryId { get; set; }
        public Category? Category { get; set; }

        
        public Guid VenueId { get; set; }
        public Venue? Venue { get; set; }

        
        public ICollection<Registration>? Registrations { get; set; }
    }
}
