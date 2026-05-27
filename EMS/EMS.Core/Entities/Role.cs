using Microsoft.AspNetCore.Identity;

namespace EMS.Core.Entities
{
    public class Role : IdentityRole<Guid>
    {
        public string? Description { get; set; }
    }
}