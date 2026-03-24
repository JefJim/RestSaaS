namespace RestSaaS.Core.Entities;

public class Restaurant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<UserRestaurant> UserRestaurants { get; set; } = new List<UserRestaurant>();
    public virtual Settings? Settings { get; set; }
    public virtual ICollection<OpeningHours> OpeningHours { get; set; } = new List<OpeningHours>();
}
