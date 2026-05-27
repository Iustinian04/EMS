using EMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _service;

        public FavoritesController(IFavoriteService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetIds()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _service.GetFavoriteEventIdsAsync(userId.Value));
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetEvents()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return Ok(await _service.GetFavoriteEventsAsync(userId.Value));
        }

        [HttpPost("{eventId:guid}/toggle")]
        public async Task<IActionResult> Toggle(Guid eventId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var isFavorite = await _service.ToggleFavoriteAsync(userId.Value, eventId);
            return Ok(new { isFavorite });
        }

        private Guid? GetUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(id) ? null : Guid.Parse(id);
        }
    }
}
