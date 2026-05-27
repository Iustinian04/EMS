namespace EMS.Application.DTOs
{
    public class ReviewCreateDTO
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
