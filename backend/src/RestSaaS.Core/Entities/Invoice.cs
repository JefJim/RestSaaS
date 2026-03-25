namespace RestSaaS.Core.Entities;

public class Invoice : TenantEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid SubscriptionId { get; set; }
    public virtual Subscription Subscription { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = "Pending"; // Pending, Paid, Failed, Cancelled
    
    public DateTime DueDate { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? PdfUrl { get; set; }
    public string? Notes { get; set; }
    
    public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
}
