using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using EMS.Application.DTOs;
using EMS.Application.Interfaces;
using EMS.Core.Entities;

namespace EMS.Application.Services
{
    public class VenueService : IVenueService
    {
        private readonly IRepository<Venue> _venueRepository;

        public VenueService(IRepository<Venue> venueRepository)
        {
            _venueRepository = venueRepository;
        }

        public async Task<IEnumerable<VenueDTO>> GetAllAsync()
        {
            var venues = await _venueRepository.GetAllAsync();
            return venues.Select(v => new VenueDTO
            {
                Id = v.Id,
                Name = v.Name,
                Address = v.Address,
                Capacity = v.Capacity
            });
        }

        public async Task<VenueDTO> CreateAsync(VenueDTO dto)
        {
            var venue = new Venue
            {
                Name = dto.Name,
                Address = dto.Address,
                Capacity = dto.Capacity
            };

            await _venueRepository.AddAsync(venue);
            await _venueRepository.SaveAsync();

            dto.Id = venue.Id;
            return dto;
        }
    }
}
