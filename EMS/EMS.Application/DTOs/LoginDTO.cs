using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class LoginDTO
{
    [Required]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}