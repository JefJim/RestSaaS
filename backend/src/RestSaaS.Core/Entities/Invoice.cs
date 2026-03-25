namespace RestSaaS.Core.Entities;

public class Invoice : TenantEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid SubscriptionId { get; set; }
    public virtual Subscription Subscription { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = "Pending";
    
    public DateTime DueDate { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? PdfUrl { get; set; }
    public string? Notes { get; set; }
    
    // Detailed Billing Info (Snapshots at time of invoice)
    public string BillingEmail { get; set; } = string.Empty;
    public string BillingAddress { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public string? PaymentMethodDetail { get; set; } // e.g. VISA ****8480
    public string? CustomerTaxId { get; set; }
    
    public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
}
