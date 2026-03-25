namespace RestSaaS.Core.Entities;

public class Plan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int MaxMenuItems { get; set; }
    public int MaxBranches { get; set; }
    public int MaxStaffUsers { get; set; }
    public bool AllowImages { get; set; }
    public bool AllowReservations { get; set; }
    public bool AllowOrders { get; set; }
    public string Features { get; set; } = "[]"; // JSON string of extra features
    public bool IsActive { get; set; } = true;
}
