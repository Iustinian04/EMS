using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class WaitlistService : IWaitlistService
    {
        private readonly IRepository<WaitlistEntry> _waitlistRepo;
        private readonly IRepository<Registration> _registrationRepo;
        private readonly IRepository<Event> _eventRepo;

        public WaitlistService(
            IRepository<WaitlistEntry> waitlistRepo,
            IRepository<Registration> registrationRepo,
            IRepository<Event> eventRepo)
        {
            _waitlistRepo = waitlistRepo;
            _registrationRepo = registrationRepo;
            _eventRepo = eventRepo;
        }

        public async Task<WaitlistDTO?> JoinWaitlistAsync(Guid userId, Guid eventId)
        {
            var evt = await _eventRepo.GetByIdAsync(eventId);
            if (evt == null) return null;

            if (!await IsEventFull(eventId, evt))
                throw new InvalidOperationException("Evenimentul mai are locuri disponibile. Înscrie-te direct.");

            var existingReg = await _registrationRepo.FindAsync(r => r.UserId == userId && r.EventId == eventId);
            if (existingReg.Any())
                throw new InvalidOperationException("Ești deja înscris la acest eveniment.");

            if (await IsOnWaitlistAsync(userId, eventId))
                throw new InvalidOperationException("Ești deja pe lista de așteptare.");

            var entry = new WaitlistEntry { UserId = userId, EventId = eventId };
            await _waitlistRepo.AddAsync(entry);
            await _waitlistRepo.SaveAsync();

            return await MapEntryAsync(entry, evt.Title);
        }

        public async Task<IEnumerable<WaitlistDTO>> GetMyWaitlistAsync(Guid userId)
        {
            var entries = (await _waitlistRepo.FindAsync(w => w.UserId == userId))
                .OrderBy(w => w.DateCreated)
                .ToList();
            var events = (await _eventRepo.GetAllAsync()).ToDictionary(e => e.Id);

            var result = new List<WaitlistDTO>();
            foreach (var entry in entries)
            {
                events.TryGetValue(entry.EventId, out var evt);
                result.Add(await MapEntryAsync(entry, evt?.Title ?? "", entries.Where(w => w.EventId == entry.EventId).OrderBy(w => w.DateCreated).ToList()));
            }
            return result;
        }

        public async Task<bool> IsOnWaitlistAsync(Guid userId, Guid eventId)
        {
            var entries = await _waitlistRepo.FindAsync(w => w.UserId == userId && w.EventId == eventId);
            return entries.Any();
        }

        public async Task PromoteNextAsync(Guid eventId)
        {
            var evt = await _eventRepo.GetByIdAsync(eventId);
            if (evt == null || evt.MaxCapacity <= 0) return;

            var regCount = (await _registrationRepo.FindAsync(r => r.EventId == eventId)).Count();
            if (regCount >= evt.MaxCapacity) return;

            var queue = (await _waitlistRepo.FindAsync(w => w.EventId == eventId))
                .OrderBy(w => w.DateCreated)
                .ToList();

            if (queue.Count == 0) return;

            var next = queue.First();
            var registration = new Registration
            {
                UserId = next.UserId,
                EventId = eventId,
                RegistrationDate = DateTime.UtcNow,
                TicketCode = Guid.NewGuid()
            };

            await _registrationRepo.AddAsync(registration);
            _waitlistRepo.Delete(next);
            await _registrationRepo.SaveAsync();
        }

        private async Task<bool> IsEventFull(Guid eventId, Event evt)
        {
            if (evt.MaxCapacity <= 0) return false;
            var count = (await _registrationRepo.FindAsync(r => r.EventId == eventId)).Count();
            return count >= evt.MaxCapacity;
        }

        private async Task<WaitlistDTO> MapEntryAsync(WaitlistEntry entry, string title, List<WaitlistEntry>? queue = null)
        {
            queue ??= (await _waitlistRepo.FindAsync(w => w.EventId == entry.EventId))
                .OrderBy(w => w.DateCreated)
                .ToList();
            var position = queue.FindIndex(w => w.Id == entry.Id) + 1;

            return new WaitlistDTO
            {
                Id = entry.Id,
                EventId = entry.EventId,
                EventTitle = title,
                Position = position,
                DateCreated = entry.DateCreated
            };
        }
    }
}
