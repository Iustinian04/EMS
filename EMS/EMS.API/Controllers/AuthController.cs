using EMS.Application.DTOs;
using EMS.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;

        public AuthController(UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }
        [HttpGet("get-username")]
        public async Task<IActionResult> GetUsername([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return BadRequest();

            var user = await _userManager.FindByEmailAsync(email.Trim());
            if (user == null) return NotFound();

            return Ok(new { username = user.UserName });
        }

        [HttpPost("create-account")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            if (dto.Age < 1 || dto.Age > 120)
                return BadRequest(new { title = "Vârsta introdusă nu este validă." });

            if (dto.Age < 18 && !dto.GuardianAcknowledged)
                return BadRequest(new { title = "Utilizatorii sub 18 ani trebuie să confirme prezența unui însoțitor adult." });

            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { title = "Username-ul și email-ul sunt obligatorii." });

            var existingUser = await _userManager.FindByNameAsync(dto.Username);
            if (existingUser != null)
                return BadRequest(new { title = "Acest username este deja folosit." });

            var user = new User
            {
                UserName = dto.Username.Trim(),
                Email = dto.Email.Trim(),
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Age = dto.Age,
                GuardianAcknowledged = dto.Age < 18 && dto.GuardianAcknowledged,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { title = string.Join(" ", result.Errors.Select(e => e.Description)) });

            if (!await _roleManager.RoleExistsAsync("User"))
                await _roleManager.CreateAsync(new IdentityRole<Guid>("User"));

            await _userManager.AddToRoleAsync(user, "User");

            return Ok(new { message = "Cont creat cu succes." });
        }
    }
}