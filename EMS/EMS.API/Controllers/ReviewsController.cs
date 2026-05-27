using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _service;

        public ReviewsController(IReviewService service) => _service = service;

        [HttpGet("event/{eventId:guid}")]
        public async Task<IActionResult> GetByEvent(Guid eventId) =>
            Ok(await _service.GetReviewsByEventAsync(eventId));

        [Authorize]
        [HttpPost("event/{eventId:guid}")]
        public async Task<IActionResult> Create(Guid eventId, [FromBody] ReviewCreateDTO dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized(new { title = "Trebuie să fii logat." });

            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var isAdmin = roles.Contains("Admin");

            try
            {
                var result = await _service.CreateReviewAsync(Guid.Parse(userIdString), eventId, dto, isAdmin);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { title = ex.Message });
            }
        }
    }
}
