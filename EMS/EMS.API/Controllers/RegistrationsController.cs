using EMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RegistrationsController : ControllerBase
    {
        private readonly IRegistrationService _service;
        public RegistrationsController(IRegistrationService service) => _service = service;

        
        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllRegistrationsAsync());


        [HttpGet("my")]
        public async Task<IActionResult> GetMyRegistrations()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new { title = "Trebuie să fii logat." });
            }

            var userId = Guid.Parse(userIdString);

            var allRegistrations = await _service.GetAllRegistrationsAsync();
            var myRegistrations = allRegistrations.Where(r => r.UserId == userId);

            return Ok(myRegistrations);
        }


        [HttpPost("{eventId:guid}")]
        public async Task<IActionResult> Post([FromRoute] Guid eventId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new { title = "Trebuie să fii logat." });
            }

            var userId = Guid.Parse(userIdString);


            var allRegistrations = await _service.GetAllRegistrationsAsync();
            bool isAlreadyRegistered = allRegistrations.Any(r => r.UserId == userId && r.EventId == eventId);

            if (isAlreadyRegistered)
            {
                return Conflict(new { title = "Ești deja înscris la acest eveniment!" });
            }

            if (await _service.IsEventAtCapacityAsync(eventId))
            {
                return Conflict(new { title = "Evenimentul este sold out. Nu mai sunt locuri disponibile." });
            }

            var result = await _service.RegisterUserToEventAsync(userId, eventId);
            return Ok(result);
        }


        [HttpDelete("{eventId:guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid eventId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new { title = "Trebuie să fii logat." });
            }

            var userId = Guid.Parse(userIdString);

            var success = await _service.RemoveRegistrationAsync(userId, eventId);

            if (!success)
            {
                return BadRequest(new { title = "Nu am găsit înscrierea sau a fost deja anulată." });
            }

            return Ok(new { message = "Înscriere anulată cu succes." });
        }

        [HttpGet("ticket/{eventId:guid}")]
        public async Task<IActionResult> GetTicket(Guid eventId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized(new { title = "Trebuie să fii logat." });

            var ticket = await _service.GetTicketAsync(Guid.Parse(userIdString), eventId);
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }
    }
}