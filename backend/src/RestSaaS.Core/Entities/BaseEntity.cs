namespace RestSaaS.Core.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public abstract class TenantEntity : BaseEntity
{
    public Guid RestaurantId { get; set; }
    public virtual Restaurant Restaurant { get; set; } = null!;
}
