using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly IVenueService _venueService;

        public VenuesController(IVenueService venueService)
        {
            _venueService = venueService;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VenueDTO>>> GetVenues()
        {
            var venues = await _venueService.GetAllAsync();
            return Ok(venues);
        }

        
        [HttpPost]
        public async Task<ActionResult<VenueDTO>> CreateVenue(VenueDTO venueDto)
        {
            var result = await _venueService.CreateAsync(venueDto);
            
            return CreatedAtAction(nameof(GetVenues), new { id = result.Id }, result);
        }
    }
}