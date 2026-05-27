using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IVenueService
    {
        Task<IEnumerable<VenueDTO>> GetAllAsync();
        Task<VenueDTO> CreateAsync(VenueDTO venueDto);
    }
}
