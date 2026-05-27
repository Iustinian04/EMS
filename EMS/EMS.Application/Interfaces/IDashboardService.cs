using EMS.Application.DTOs;

namespace EMS.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardDTO> GetStatsAsync();
    }
}
