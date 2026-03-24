namespace RestSaaS.Core.Entities;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Preparing,
    Ready,
    Delivered,
    Cancelled
}

public class Order : TenantEntity
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
