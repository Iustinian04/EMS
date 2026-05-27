using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventsController(IEventService eventService)
        {
            _eventService = eventService;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDTO>>> GetEvents()
        {
            var events = await _eventService.GetAllEventsAsync();
            return Ok(events); 
        }

        
        [Authorize] 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEvent(Guid id)
        {
            var e = await _eventService.GetEventByIdAsync(id);
            if (e == null) return NotFound(); // Status 404

            
            bool isAdmin = User.IsInRole("Admin");

            if (isAdmin)
            {
                
                return Ok(new
                {
                    Event = e,
                    IsAdminView = true,
                    Participants = new string[] { } 
                });
            }

            return Ok(new
            {
                Event = e,
                IsAdminView = false,
                Participants = new string[] { }
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EventDTO>> CreateEvent(EventCreateDTO dto)
        {
            var result = await _eventService.CreateEventAsync(dto);

            return CreatedAtAction(nameof(GetEvent), new { id = result.Id }, result);
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateEvent(Guid id, EventUpdateDTO dto)
        {
            try
            {
                var result = await _eventService.UpdateEventAsync(id, dto);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { title = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var success = await _eventService.DeleteEventAsync(id);
            if (!success) return NotFound();

            return NoContent(); 
        }
    }
}