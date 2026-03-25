namespace RestSaaS.Core.Entities;

public class Branch : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsMain { get; set; } = false;
    public int TableCount { get; set; } = 0;

    public Guid RestaurantId { get; set; }
    public virtual Restaurant Restaurant { get; set; } = null!;

    public virtual ICollection<OpeningHours> OpeningHours { get; set; } = new List<OpeningHours>();
}
