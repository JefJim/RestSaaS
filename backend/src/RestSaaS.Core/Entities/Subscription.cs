namespace RestSaaS.Core.Entities;

public class Subscription : TenantEntity
{
    public Guid PlanId { get; set; }
    public virtual Plan Plan { get; set; } = null!;
    
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string Status { get; set; } = "Active"; // Active, Canceled, Expired
}
