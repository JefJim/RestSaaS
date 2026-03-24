namespace RestSaaS.Core.Entities;

public class OrderItem : TenantEntity
{
    public Guid OrderId { get; set; }
    public virtual Order Order { get; set; } = null!;

    public Guid MenuItemId { get; set; }
    public virtual MenuItem MenuItem { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
