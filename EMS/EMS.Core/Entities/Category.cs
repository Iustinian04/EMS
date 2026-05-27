using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMS.Core.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public ICollection<Event>? Events { get; set; }
    }
}
