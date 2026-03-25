namespace RestSaaS.Core.Entities;

public class BranchMenuOverride : TenantEntity
{
    public Guid BranchId { get; set; }
    public virtual Branch Branch { get; set; } = null!;

    public Guid MenuItemId { get; set; }
    public virtual MenuItem MenuItem { get; set; } = null!;

    public decimal? PriceOverride { get; set; }
    public bool? IsAvailableOverride { get; set; }
}
