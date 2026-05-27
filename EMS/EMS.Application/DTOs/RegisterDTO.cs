using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; 

namespace EMS.Application.DTOs
{
    public class RegisterDTO
    {
        [Required]
        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;

        
        [Required]
        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("age")]
        public int Age { get; set; }

        [JsonPropertyName("guardianAcknowledged")]
        public bool GuardianAcknowledged { get; set; }
    }
}