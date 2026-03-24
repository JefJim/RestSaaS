namespace RestSaaS.Core.Entities;

public class Menu : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<MenuCategory> Categories { get; set; } = new List<MenuCategory>();
}
