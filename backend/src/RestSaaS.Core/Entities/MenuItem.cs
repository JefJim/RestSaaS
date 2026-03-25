namespace RestSaaS.Core.Entities;

public class MenuItem : TenantEntity
{
    public Guid CategoryId { get; set; }
    public virtual MenuCategory Category { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
}
