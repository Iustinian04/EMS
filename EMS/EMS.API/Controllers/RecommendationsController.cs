using EMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _service;

        public RecommendationsController(IRecommendationService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(id)) return Unauthorized();
            return Ok(await _service.GetRecommendationsForUserAsync(Guid.Parse(id)));
        }
    }
}
