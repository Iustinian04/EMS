using EMS.Core.Entities;
using EMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SetupController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;

        
        public SetupController(UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpPost("make-admin")]
        public async Task<IActionResult> MakeAdmin(string email)
        {
            
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                
                await _roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));
            }

            
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return NotFound("Utilizatorul nu a fost găsit.");
            }

            
            await _userManager.AddToRoleAsync(user, "Admin");

            return Ok($"Succes! Utilizatorul {email} este acum Administrator.");
        }

        [HttpGet("my-role")]
        [Authorize] 
        public async Task<IActionResult> GetMyRole()
        {
            
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            
            var roles = await _userManager.GetRolesAsync(user);

            
            return Ok(new { Role = roles.FirstOrDefault() ?? "User" });
        }

        [HttpPost("seed-event-images")]
        public async Task<IActionResult> SeedEventImages([FromServices] AppDbContext ctx)
        {
            var pool = new Dictionary<string, string>
            {
                ["tech"] = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
                ["music"] = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
                ["business"] = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
                ["gaming"] = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
                ["workshop"] = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
                ["default"] = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80"
            };

            var events = await ctx.Events.Include(e => e.Category).ToListAsync();
            var updated = 0;
            foreach (var e in events)
            {
                if (!string.IsNullOrWhiteSpace(e.ImageUrl)) continue;
                var name = $"{e.Category?.Name} {e.Title}".ToLowerInvariant();
                string key = name.Contains("music") || name.Contains("festival") ? "music"
                    : name.Contains("game") || name.Contains("gaming") ? "gaming"
                    : name.Contains("workshop") || name.Contains("training") ? "workshop"
                    : name.Contains("business") || name.Contains("network") ? "business"
                    : name.Contains("tech") || name.Contains("conference") ? "tech"
                    : "default";
                e.ImageUrl = pool[key];
                updated++;
            }
            await ctx.SaveChangesAsync();
            return Ok(new { updated, total = events.Count });
        }
    }
}