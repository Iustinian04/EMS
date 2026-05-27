using EMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WaitlistController : ControllerBase
    {
        private readonly IWaitlistService _service;

        public WaitlistController(IWaitlistService service) => _service = service;

        [HttpGet("my")]
        public async Task<IActionResult> GetMy()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _service.GetMyWaitlistAsync(userId.Value));
        }

        [HttpPost("{eventId:guid}")]
        public async Task<IActionResult> Join(Guid eventId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            try
            {
                var result = await _service.JoinWaitlistAsync(userId.Value, eventId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { title = ex.Message });
            }
        }

        private Guid? GetUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(id) ? null : Guid.Parse(id);
        }
    }
}
