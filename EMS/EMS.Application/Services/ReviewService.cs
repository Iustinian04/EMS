using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IRepository<Review> _reviewRepo;
        private readonly IRepository<Event> _eventRepo;
        private readonly IRepository<Registration> _registrationRepo;
        private readonly IRepository<User> _userRepo;

        public ReviewService(
            IRepository<Review> reviewRepo,
            IRepository<Event> eventRepo,
            IRepository<Registration> registrationRepo,
            IRepository<User> userRepo)
        {
            _reviewRepo = reviewRepo;
            _eventRepo = eventRepo;
            _registrationRepo = registrationRepo;
            _userRepo = userRepo;
        }

        public async Task<IEnumerable<ReviewDTO>> GetReviewsByEventAsync(Guid eventId)
        {
            var reviews = (await _reviewRepo.FindAsync(r => r.EventId == eventId)).ToList();
            var users = (await _userRepo.GetAllAsync()).ToDictionary(u => u.Id);

            return reviews.Select(r =>
            {
                users.TryGetValue(r.UserId, out var user);
                var name = user != null
                    ? $"{user.FirstName} {user.LastName}".Trim()
                    : "Utilizator";
                if (string.IsNullOrWhiteSpace(name)) name = user?.Email ?? "Utilizator";

                return new ReviewDTO
                {
                    Id = r.Id,
                    EventId = r.EventId,
                    UserId = r.UserId,
                    UserDisplayName = name,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    DateCreated = r.DateCreated
                };
            }).OrderByDescending(r => r.DateCreated);
        }

        public async Task<ReviewDTO?> CreateReviewAsync(Guid userId, Guid eventId, ReviewCreateDTO dto, bool isAdmin = false)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                throw new InvalidOperationException("Rating-ul trebuie să fie între 1 și 5.");

            var evt = await _eventRepo.GetByIdAsync(eventId);
            if (evt == null) return null;
            
        
            if (!isAdmin && evt.Date > DateTime.UtcNow)
                throw new InvalidOperationException("Poți lăsa recenzii doar după încheierea evenimentului.");

            var registrations = await _registrationRepo.FindAsync(r => r.UserId == userId && r.EventId == eventId);
            if (!registrations.Any())
                throw new InvalidOperationException("Trebuie să fi participat la eveniment pentru a lăsa o recenzie.");

            var existing = await _reviewRepo.FindAsync(r => r.UserId == userId && r.EventId == eventId);
            if (existing.Any())
                throw new InvalidOperationException("Ai lăsat deja o recenzie pentru acest eveniment.");

            var review = new Review
            {
                UserId = userId,
                EventId = eventId,
                Rating = dto.Rating,
                Comment = dto.Comment?.Trim() ?? string.Empty
            };

            await _reviewRepo.AddAsync(review);
            await _reviewRepo.SaveAsync();

            var user = await _userRepo.GetByIdAsync(userId);
            var displayName = user != null
                ? $"{user.FirstName} {user.LastName}".Trim()
                : "Utilizator";
            if (string.IsNullOrWhiteSpace(displayName)) displayName = user?.Email ?? "Utilizator";

            return new ReviewDTO
            {
                Id = review.Id,
                EventId = eventId,
                UserId = userId,
                UserDisplayName = displayName,
                Rating = review.Rating,
                Comment = review.Comment,
                DateCreated = review.DateCreated
            };
        }
    }
}
