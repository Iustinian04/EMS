using System.Security.Claims;
using EMS.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace EMS.API.Services
{
    public class ApplicationUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<User, IdentityRole<Guid>>
    {
        public ApplicationUserClaimsPrincipalFactory(
            UserManager<User> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            IOptions<IdentityOptions> options)
            : base(userManager, roleManager, options) { }

        protected override async Task<ClaimsIdentity> GenerateClaimsAsync(User user)
        {
            var identity = await base.GenerateClaimsAsync(user);
            identity.AddClaim(new Claim("username", user.UserName ?? string.Empty));
            identity.AddClaim(new Claim("first_name", user.FirstName));
            identity.AddClaim(new Claim("last_name", user.LastName));
            return identity;
        }
    }
}
