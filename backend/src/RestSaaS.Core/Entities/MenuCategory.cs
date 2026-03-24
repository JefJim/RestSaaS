namespace RestSaaS.Core.Entities;

public class MenuCategory : TenantEntity
{
    public Guid MenuId { get; set; }
    public virtual Menu Menu { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    
    public virtual ICollection<MenuItem> Items { get; set; } = new List<MenuItem>();
}
