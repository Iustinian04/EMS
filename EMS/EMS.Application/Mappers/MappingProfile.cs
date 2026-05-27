using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using EMS.Application.DTOs;
using EMS.Core.Entities;

namespace EMS.Application.Mappers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Event, EventDTO>()
                .ForMember(dest => dest.CategoryName, opt => opt.Ignore())
                .ForMember(dest => dest.VenueName, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentParticipants, opt => opt.Ignore());
            CreateMap<EventCreateDTO, Event>();
            CreateMap<EventUpdateDTO, Event>();
            CreateMap<Category, CategoryDTO>().ReverseMap();
            CreateMap<Venue, VenueDTO>().ReverseMap();
            CreateMap<Registration, RegistrationDTO>().ReverseMap();
        }
    }
}
