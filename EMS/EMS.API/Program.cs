using EMS.API.Middlewares;
using EMS.API.Services;
using EMS.Application.Interfaces;
using EMS.Application.Mappers;
using EMS.Application.Services;
using EMS.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.AspNetCore.Identity;

namespace EMS.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<EMS.Infrastructure.Data.AppDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("EMS.Infrastructure")));

            builder.Services.AddIdentityApiEndpoints<EMS.Core.Entities.User>()
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<EMS.Infrastructure.Data.AppDbContext>();

            builder.Services.AddScoped<IUserClaimsPrincipalFactory<EMS.Core.Entities.User>, ApplicationUserClaimsPrincipalFactory>();

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Dependency Injection
            builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            builder.Services.AddScoped<IVenueService, VenueService>();
            builder.Services.AddScoped<IEventService, EventService>();
            builder.Services.AddScoped<IRegistrationService, RegistrationService>();
            builder.Services.AddScoped<IReviewService, ReviewService>();
            builder.Services.AddScoped<IWaitlistService, WaitlistService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();
            builder.Services.AddScoped<IFavoriteService, FavoriteService>();
            builder.Services.AddScoped<IRecommendationService, RecommendationService>();

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            
            builder.Services.AddAutoMapper(typeof(EMS.Application.Mappers.MappingProfile));

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", builder =>
                {
                    builder.WithOrigins("http://localhost:5173") // Vite port
                           .AllowAnyHeader()
                           .AllowAnyMethod()
                           .AllowCredentials(); 
                });
            });

            var app = builder.Build();

            app.UseMiddleware<GlobalExceptionMiddleware>();


            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReactApp");
            app.UseCors("AllowFrontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapGroup("/api/auth").MapIdentityApi<EMS.Core.Entities.User>();

            app.MapPost("/api/auth/logout", async (Microsoft.AspNetCore.Identity.SignInManager<EMS.Core.Entities.User> signInManager) =>
            {
                await signInManager.SignOutAsync();
                return Results.Ok();
            }).RequireAuthorization(); 

            app.MapControllers();

            app.Run();
        }
    }
}