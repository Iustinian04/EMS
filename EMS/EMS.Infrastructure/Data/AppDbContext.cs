using EMS.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace EMS.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Event> Events { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Venue> Venues { get; set; }
        public DbSet<Registration> Registrations { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<WaitlistEntry> WaitlistEntries { get; set; }
        public DbSet<Favorite> Favorites { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                var properties = entityType.GetProperties()
                    .Where(p => p.ClrType == typeof(DateTime) || p.ClrType == typeof(DateTime?));

                foreach (var property in properties)
                {
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                        v => v.ToUniversalTime(),
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc)));
                }
            }

            builder.Entity<Registration>()
                .HasOne(r => r.Event)
                .WithMany(e => e.Registrations)
                .HasForeignKey(r => r.EventId);

            builder.Entity<Registration>()
                .HasOne(r => r.User)
                .WithMany(u => u.Registrations)
                .HasForeignKey(r => r.UserId);

            builder.Entity<Review>()
                .HasOne(r => r.Event)
                .WithMany()
                .HasForeignKey(r => r.EventId);

            builder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId);

            builder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.EventId })
                .IsUnique();

            builder.Entity<WaitlistEntry>()
                .HasOne(w => w.Event)
                .WithMany()
                .HasForeignKey(w => w.EventId);

            builder.Entity<WaitlistEntry>()
                .HasOne(w => w.User)
                .WithMany()
                .HasForeignKey(w => w.UserId);

            builder.Entity<WaitlistEntry>()
                .HasIndex(w => new { w.UserId, w.EventId })
                .IsUnique();

            builder.Entity<Favorite>()
                .HasOne(f => f.Event).WithMany().HasForeignKey(f => f.EventId);
            builder.Entity<Favorite>()
                .HasOne(f => f.User).WithMany().HasForeignKey(f => f.UserId);
            builder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.EventId }).IsUnique();
        }
    }
}