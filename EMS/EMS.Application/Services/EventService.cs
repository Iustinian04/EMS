using AutoMapper;
using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class EventService : IEventService
    {
        private readonly IRepository<Event> _eventRepository;
        private readonly IRepository<Registration> _registrationRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Venue> _venueRepository;
        private readonly IMapper _mapper;

        public EventService(
            IRepository<Event> eventRepository,
            IRepository<Registration> registrationRepository,
            IRepository<Category> categoryRepository,
            IRepository<Venue> venueRepository,
            IMapper mapper)
        {
            _eventRepository = eventRepository;
            _registrationRepository = registrationRepository;
            _categoryRepository = categoryRepository;
            _venueRepository = venueRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<EventDTO>> GetAllEventsAsync()
        {
            var events = await _eventRepository.GetAllAsync();
            return await MapEventsWithParticipantCountsAsync(events);
        }

        public async Task<EventDTO?> GetEventByIdAsync(Guid id)
        {
            var e = await _eventRepository.GetByIdAsync(id);
            if (e == null) return null;

            var mapped = await MapEventsWithParticipantCountsAsync(new[] { e });
            return mapped.FirstOrDefault();
        }

        public async Task<EventDTO> CreateEventAsync(EventCreateDTO dto)
        {
            var newEvent = _mapper.Map<Event>(dto);

            await _eventRepository.AddAsync(newEvent);
            await _eventRepository.SaveAsync();

            return (await MapEventsWithParticipantCountsAsync(new[] { newEvent })).First();
        }

        public async Task<EventDTO?> UpdateEventAsync(Guid id, EventUpdateDTO dto)
        {
            var existing = await _eventRepository.GetByIdAsync(id);
            if (existing == null) return null;

            var mapped = await MapEventsWithParticipantCountsAsync(new[] { existing });
            var current = mapped.First();
            if (dto.MaxCapacity > 0 && dto.MaxCapacity < current.CurrentParticipants)
            {
                throw new InvalidOperationException(
                    $"Capacitatea nu poate fi mai mică decât numărul curent de participanți ({current.CurrentParticipants}).");
            }

            existing.Title = dto.Title;
            existing.Description = dto.Description;
            existing.Date = dto.Date;
            existing.MaxCapacity = dto.MaxCapacity;
            existing.CategoryId = dto.CategoryId;
            existing.VenueId = dto.VenueId;
            existing.ImageUrl = dto.ImageUrl?.Trim() ?? string.Empty;
            existing.DateUpdated = DateTime.UtcNow;

            _eventRepository.Update(existing);
            await _eventRepository.SaveAsync();

            return (await MapEventsWithParticipantCountsAsync(new[] { existing })).FirstOrDefault();
        }

        public async Task<bool> DeleteEventAsync(Guid id)
        {
            var e = await _eventRepository.GetByIdAsync(id);
            if (e == null) return false;

            _eventRepository.Delete(e);
            return await _eventRepository.SaveAsync();
        }

        private async Task<IEnumerable<EventDTO>> MapEventsWithParticipantCountsAsync(IEnumerable<Event> events)
        {
            var eventList = events.ToList();
            if (eventList.Count == 0)
            {
                return Enumerable.Empty<EventDTO>();
            }

            var categories = (await _categoryRepository.GetAllAsync())
                .ToDictionary(c => c.Id, c => c.Name);
            var venues = (await _venueRepository.GetAllAsync())
                .ToDictionary(v => v.Id);

            var participantCounts = (await _registrationRepository.GetAllAsync())
                .GroupBy(r => r.EventId)
                .ToDictionary(g => g.Key, g => g.Count());

            return eventList.Select(e =>
            {
                var dto = _mapper.Map<EventDTO>(e);
                dto.CategoryName = categories.GetValueOrDefault(e.CategoryId, string.Empty);
                var venue = venues.GetValueOrDefault(e.VenueId);
                dto.VenueName = venue?.Name ?? string.Empty;
                dto.VenueAddress = venue?.Address ?? string.Empty;
                dto.CurrentParticipants = participantCounts.GetValueOrDefault(e.Id, 0);
                return dto;
            });
        }
    }
}
