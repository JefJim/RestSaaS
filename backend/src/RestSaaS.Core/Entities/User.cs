namespace RestSaaS.Core.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? OAuthProvider { get; set; }
    public string? OAuthId { get; set; }
    public string Role { get; set; } = "User"; // PlatformAdmin, User
    
    public virtual ICollection<UserRestaurant> UserRestaurants { get; set; } = new List<UserRestaurant>();
}
