namespace RestSaaS.Core.Entities;

public class Restaurant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? PrimaryColor { get; set; }
    public Guid OwnerUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<UserRestaurant> UserRestaurants { get; set; } = new List<UserRestaurant>();
    public virtual Settings? Settings { get; set; }
    public virtual ICollection<OpeningHours> OpeningHours { get; set; } = new List<OpeningHours>();
}
