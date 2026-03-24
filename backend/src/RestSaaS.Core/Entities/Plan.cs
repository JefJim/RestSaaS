namespace RestSaaS.Core.Entities;

public class Plan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int MaxMenuItems { get; set; }
    public int MaxUsers { get; set; }
    public string Features { get; set; } = "[]"; // JSON string of features
    public bool IsActive { get; set; } = true;
}
