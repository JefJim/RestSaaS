namespace RestSaaS.Core.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? OAuthProvider { get; set; }
    public string? OAuthId { get; set; }
    public string? ProfilePicture { get; set; }
    public bool OnboardingCompleted { get; set; } = false;
    public string PlatformRole { get; set; } = "PlatformUser"; // PlatformAdmin, PlatformUser
    
    public virtual ICollection<UserRestaurant> UserRestaurants { get; set; } = new List<UserRestaurant>();
}
